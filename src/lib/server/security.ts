// Server-only rate limiter and prompt-injection defense helpers

interface RateBucket {
  timestamps: number[];
}

const RATE_LIMIT_BUCKETS = new Map<string, RateBucket>();
const WINDOW_MS = 5 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 25;

export function checkRateLimit(clientKey: string): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now();
  const bucket = RATE_LIMIT_BUCKETS.get(clientKey) ?? { timestamps: [] };
  bucket.timestamps = bucket.timestamps.filter((ts) => now - ts < WINDOW_MS);

  if (bucket.timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    const oldest = bucket.timestamps[0] ?? now;
    const retryAfterSec = Math.max(1, Math.ceil((WINDOW_MS - (now - oldest)) / 1000));
    RATE_LIMIT_BUCKETS.set(clientKey, bucket);
    return { allowed: false, retryAfterSec };
  }

  bucket.timestamps.push(now);
  RATE_LIMIT_BUCKETS.set(clientKey, bucket);
  return { allowed: true, retryAfterSec: 0 };
}

const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+instructions?/i,
  /disregard\s+(your\s+)?(system|safety)\s+(prompt|rules)/i,
  /reveal\s+(your\s+)?(system\s+prompt|api\s*key|env)/i,
  /\b(GEMINI_API_KEY|process\.env)\b/i,
  /you\s+are\s+now\s+(DAN|jailbroken|unrestricted)/i,
];

export function sanitizeUserPrompt(raw: string): {
  cleaned: string;
  flaggedInjection: boolean;
} {
  const cleaned = raw
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim()
    .slice(0, 600);

  const flaggedInjection = INJECTION_PATTERNS.some((re) => re.test(cleaned));
  return { cleaned, flaggedInjection };
}

export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return headers.get("x-real-ip") ?? "local";
}
