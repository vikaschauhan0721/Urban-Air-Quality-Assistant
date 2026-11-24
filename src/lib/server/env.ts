import { z } from "zod";

const ServerEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  GEMINI_API_KEY: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v === "" ? undefined : v))
    .refine((v) => v === undefined || v.length >= 10, {
      message: "GEMINI_API_KEY must be at least 10 characters when set",
    }),
  GEMINI_MODEL: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v === "" || v === undefined ? "gemini-3.8-flash" : v))
    .refine((v) => /^[a-zA-Z0-9._-]+$/.test(v), {
      message: "GEMINI_MODEL contains invalid characters",
    }),
});

export type ServerEnv = z.infer<typeof ServerEnvSchema>;

let cachedEnv: ServerEnv | null = null;

export function parseServerEnv(rawEnv: Record<string, string | undefined>): ServerEnv {
  const parsed = ServerEnvSchema.safeParse({
    NODE_ENV: rawEnv.NODE_ENV,
    GEMINI_API_KEY: rawEnv.GEMINI_API_KEY,
    GEMINI_MODEL: rawEnv.GEMINI_MODEL,
  });

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((i) => `${i.path.join(".") || "env"}: ${i.message}`)
      .join("; ");
    throw new Error(`Invalid server environment configuration: ${details}`);
  }

  return parsed.data;
}

export function getServerEnv(): ServerEnv {
  if (!cachedEnv) {
    cachedEnv = parseServerEnv(process.env);
  }
  return cachedEnv;
}

// Fail fast when module is loaded on server in production/dev
if (typeof window === "undefined") {
  getServerEnv();
}
