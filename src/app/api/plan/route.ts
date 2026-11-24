import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { logServerEvent, readJsonBodyWithLimit } from "@/lib/server/http";
import { generatePersonalizedPlan } from "@/lib/server/planner";
import { AirQualityReportSchema, PlanResponseSchema, UserProfileSchema } from "@/lib/types";

const PlanRequestSchema = z
  .object({
    profile: UserProfileSchema,
    air: AirQualityReportSchema,
  })
  .strict();

export async function POST(req: NextRequest) {
  try {
    const bodyRead = await readJsonBodyWithLimit(req, 64_000);
    if (!bodyRead.ok) {
      return bodyRead.response;
    }

    const parsed = PlanRequestSchema.safeParse(bodyRead.data);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid plan request payload", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const plan = await generatePersonalizedPlan(parsed.data.profile, parsed.data.air);
    const validated = PlanResponseSchema.parse(plan);
    return NextResponse.json(validated);
  } catch (err) {
    logServerEvent("error", "plan_route_error", {
      message: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { error: "Unable to generate personalized plan right now" },
      { status: 500 }
    );
  }
}
