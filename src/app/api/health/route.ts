import { NextResponse } from "next/server";
import { DEFAULT_GEMINI_MODEL } from "@/lib/server/planner";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "saans-urban-air",
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY?.trim()),
    model: process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL,
    timestamp: new Date().toISOString(),
  });
}
