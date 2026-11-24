import { NextResponse } from "next/server";
import { getServerEnv } from "@/lib/server/env";

export async function GET() {
  const env = getServerEnv();
  return NextResponse.json({
    ok: true,
    service: "saans-urban-air",
    geminiConfigured: Boolean(env.GEMINI_API_KEY),
    model: env.GEMINI_MODEL,
    timestamp: new Date().toISOString(),
  });
}
