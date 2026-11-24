import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generatePersonalizedPlan } from "@/lib/server/planner";
import { AirQualityReportSchema, PlanResponseSchema, UserProfileSchema } from "@/lib/types";

const PlanRequestSchema = z.object({
  profile: UserProfileSchema,
  air: AirQualityReportSchema,
});

export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json();
    const parsed = PlanRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid plan request payload", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const plan = await generatePersonalizedPlan(parsed.data.profile, parsed.data.air);
    const validated = PlanResponseSchema.parse(plan);
    return NextResponse.json(validated);
  } catch {
    return NextResponse.json(
      { error: "Unable to generate personalized plan right now" },
      { status: 500 }
    );
  }
}
