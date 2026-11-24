import { NextRequest, NextResponse } from "next/server";

export function logServerEvent(
  level: "info" | "warn" | "error",
  event: string,
  meta?: Record<string, unknown>
): void {
  const payload = JSON.stringify({
    ts: new Date().toISOString(),
    level,
    event,
    ...(meta ? { meta } : {}),
  });
  if (level === "error") {
    console.error(payload);
  } else if (level === "warn") {
    console.warn(payload);
  } else {
    console.info(payload);
  }
}

export async function readJsonBodyWithLimit(
  req: NextRequest,
  maxBytes: number
): Promise<
  | { ok: true; data: unknown }
  | { ok: false; response: NextResponse }
> {
  const contentLengthHeader = req.headers.get("content-length");
  if (contentLengthHeader) {
    const declared = Number(contentLengthHeader);
    if (Number.isFinite(declared) && declared > maxBytes) {
      return {
        ok: false,
        response: NextResponse.json(
          { error: `Payload too large (max ${maxBytes} bytes)` },
          { status: 413 }
        ),
      };
    }
  }

  let rawText: string;
  try {
    rawText = await req.text();
  } catch {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Failed to read request body" },
        { status: 400 }
      ),
    };
  }

  if (Buffer.byteLength(rawText, "utf8") > maxBytes) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: `Payload too large (max ${maxBytes} bytes)` },
        { status: 413 }
      ),
    };
  }

  if (!rawText.trim()) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Request body cannot be empty" },
        { status: 400 }
      ),
    };
  }

  try {
    return { ok: true, data: JSON.parse(rawText) as unknown };
  } catch {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Malformed JSON body" },
        { status: 400 }
      ),
    };
  }
}
