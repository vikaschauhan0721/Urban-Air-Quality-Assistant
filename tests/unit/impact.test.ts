import { describe, expect, it } from "vitest";
import { ACTION_CATALOGUE } from "@/lib/catalogue";
import { buildSimulatedSmogReport, DEMO_HOUSEHOLD_PROFILE, PRESET_LOCATIONS } from "@/lib/fixtures";
import { computeDeterministicImpact, MYTH_BUSTERS } from "@/lib/impact";
import { buildRuleBasedPlan } from "@/lib/server/planner";

describe("Deterministic Impact Engine & Planner", () => {
  const smogAir = buildSimulatedSmogReport(PRESET_LOCATIONS[0]!);

  it("covers all three action categories in catalogue", () => {
    const cats = new Set(ACTION_CATALOGUE.map((a) => a.category));
    expect(cats.has("routines")).toBe(true);
    expect(cats.has("indoor")).toBe(true);
    expect(cats.has("swaps")).toBe(true);
  });

  it("computes bounded before/after PM2.5 reduction for DIY box fan filter", () => {
    const impact = computeDeterministicImpact("diy_box_fan_filter", smogAir, DEMO_HOUSEHOLD_PROFILE);
    expect(impact.indoorPm25Before).toBeGreaterThan(impact.indoorPm25After);
    expect(impact.pm25DeltaUgM3).toBe(impact.indoorPm25Before - impact.indoorPm25After);
    expect(impact.confidence).toBe("High");
    expect(impact.beforeAfterLabel).toContain("→");
  });

  it("computes positive CO2 savings for Metro swap from car", () => {
    const impact = computeDeterministicImpact("metro_over_car", smogAir, DEMO_HOUSEHOLD_PROFILE);
    expect(impact.co2SavedKg).toBeGreaterThan(1.0);
    expect(impact.confidence).toBe("High");
  });

  it("returns deterministic impacts for every catalogue item", () => {
    for (const item of ACTION_CATALOGUE) {
      const impact = computeDeterministicImpact(item.id, smogAir, DEMO_HOUSEHOLD_PROFILE);
      expect(impact.indoorPm25Before).toBeGreaterThanOrEqual(impact.indoorPm25After);
      expect(["High", "Medium", "Low"]).toContain(impact.confidence);
      expect(impact.sourceCitation.length).toBeGreaterThan(5);
    }
  });

  it("builds complete rule-based fallback plan with all 3 tabs and safety note", () => {
    const plan = buildRuleBasedPlan(DEMO_HOUSEHOLD_PROFILE, smogAir);
    expect(plan.planSource).toBe("rule-based");
    expect(plan.actions.some((a) => a.category === "routines")).toBe(true);
    expect(plan.actions.some((a) => a.category === "indoor")).toBe(true);
    expect(plan.actions.some((a) => a.category === "swaps")).toBe(true);
    expect(plan.safetyNote.toLowerCase()).toContain("n95");
    expect(MYTH_BUSTERS.length).toBeGreaterThanOrEqual(2);
  });
});
