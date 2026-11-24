import { GoogleGenAI, Type } from "@google/genai";
import { z } from "zod";
import { ACTION_CATALOGUE, CATALOGUE_BY_ID, type CatalogueAction } from "../catalogue";
import { getCpcbBand } from "../aqi";
import { computeDeterministicImpact } from "../impact";
import type {
  ActionCategory,
  AirQualityReport,
  PlanAction,
  PlanResponse,
  UserProfile,
} from "../types";

export const DEFAULT_GEMINI_MODEL = "gemini-3.8-flash";

const GeminiPlanSchema = z.object({
  verdict: z.string().min(8).max(240),
  focusNote: z.string().min(8).max(280),
  actions: z
    .array(
      z.object({
        id: z.string(),
        headline: z.string().min(5).max(160),
        howToDoIt: z.string().min(10).max(360),
        whyItWorks: z.string().min(10).max(320),
      })
    )
    .min(3)
    .max(15),
});

function rankCatalogueActions(
  profile: UserProfile,
  air: AirQualityReport
): Record<ActionCategory, CatalogueAction[]> {
  const budgetWeight = (item: CatalogueAction) => {
    if (profile.lifestyle.budget === "free") {
      return item.costTier === "free" ? 20 : item.costTier === "low" ? -5 : -25;
    }
    if (profile.lifestyle.budget === "low") {
      return item.costTier === "free" ? 15 : item.costTier === "low" ? 10 : -10;
    }
    return 5;
  };

  const byCat: Record<ActionCategory, CatalogueAction[]> = {
    routines: [],
    indoor: [],
    swaps: [],
  };

  for (const item of ACTION_CATALOGUE) {
    byCat[item.category].push(item);
  }

  for (const cat of ["routines", "indoor", "swaps"] as const) {
    byCat[cat].sort((a, b) => {
      const scoreB = b.priorityBoost(profile, air.cpcbAqi) + budgetWeight(b);
      const scoreA = a.priorityBoost(profile, air.cpcbAqi) + budgetWeight(a);
      return scoreB - scoreA;
    });
  }

  return byCat;
}

function toPlanAction(
  catalogueItem: CatalogueAction,
  air: AirQualityReport,
  profile: UserProfile,
  override?: { headline?: string; howToDoIt?: string; whyItWorks?: string }
): PlanAction {
  const isHi = profile.language === "hi";
  const impact = computeDeterministicImpact(catalogueItem.id, air, profile);

  return {
    id: catalogueItem.id,
    category: catalogueItem.category,
    title: isHi ? catalogueItem.titleHi : catalogueItem.title,
    headline:
      override?.headline ??
      (isHi ? catalogueItem.defaultHeadlineHi : catalogueItem.defaultHeadline),
    howToDoIt:
      override?.howToDoIt ??
      (isHi ? catalogueItem.defaultHowToDoItHi : catalogueItem.defaultHowToDoIt),
    whyItWorks:
      override?.whyItWorks ??
      (isHi ? catalogueItem.defaultWhyItWorksHi : catalogueItem.defaultWhyItWorks),
    effort: catalogueItem.effort,
    costTier: catalogueItem.costTier,
    costLabel: isHi ? catalogueItem.costLabelHi : catalogueItem.costLabel,
    impact,
  };
}

export function buildRuleBasedPlan(
  profile: UserProfile,
  air: AirQualityReport
): PlanResponse {
  const ranked = rankCatalogueActions(profile, air);
  const selected: PlanAction[] = [];

  for (const cat of ["routines", "indoor", "swaps"] as const) {
    const top = ranked[cat].slice(0, 4);
    for (const item of top) {
      selected.push(toPlanAction(item, air, profile));
    }
  }

  const band = getCpcbBand(air.cpcbAqi);
  const isHi = profile.language === "hi";

  const focusNote = isHi
    ? `${air.location.name} में ${air.cleanestWindow.startLabel}–${air.cleanestWindow.endLabel} सबसे साफ समय है। पहले घर के अंदर PM2.5 घटाएँ और बाहर N95 का उपयोग करें।`
    : `Cleanest outdoor window in ${air.location.name} is ${air.cleanestWindow.startLabel}–${air.cleanestWindow.endLabel} (AQI ~${air.cleanestWindow.avgCpcbAqi}). Focus first on indoor particle protection and timed outings.`;

  const safetyNote = isHi
    ? "यह सामान्य मार्गदर्शन है, चिकित्सीय सलाह नहीं। PM2.5 के लिए कपड़े के मास्क नहीं, N95/FFP2 पहनें। सांस फूलने या सीने में दर्द पर डॉक्टर से मिलें।"
    : "Guidance only, not medical advice. Avoid cloth masks for PM2.5—use a fitted N95/FFP2 respirator. Seek prompt medical care for wheezing, chest tightness, or breathlessness.";

  return {
    planSource: "rule-based",
    modelUsed: "saans-deterministic-v1",
    generatedAt: new Date().toISOString(),
    verdict: isHi ? band.verdictHi : band.verdict,
    focusNote,
    actions: selected,
    safetyNote,
  };
}

async function callGeminiOnce(
  apiKey: string,
  model: string,
  profile: UserProfile,
  air: AirQualityReport
): Promise<z.infer<typeof GeminiPlanSchema>> {
  const ai = new GoogleGenAI({ apiKey });

  const catalogueBrief = ACTION_CATALOGUE.map((a) => ({
    id: a.id,
    category: a.category,
    title: a.title,
    costTier: a.costTier,
  }));

  const languageName = profile.language === "hi" ? "Hindi (Devanagari, warm & simple)" : "English (warm, plain language)";

  const systemInstruction = [
    "You are Saans, a calm, practical Urban Air Quality Assistant.",
    "Select personalized actions ONLY from the provided action catalogue IDs (pick 3-4 per category: routines, indoor, swaps).",
    "CRITICAL TRUST BOUNDARY: NEVER invent numbers, percentages, µg/m³ reductions, CO₂ figures, or clinical statistics in your text. Quantitative metrics are computed separately by our deterministic engine.",
    "SAFETY RULES: Never recommend cloth or surgical masks for PM2.5 (recommend fitted N95/FFP2). Never claim indoor plants clean winter smog. Always keep tone calm and non-alarmist.",
    `Respond in ${languageName}.`,
  ].join(" ");

  const userPrompt = JSON.stringify({
    location: air.location.name,
    cpcbAqi: air.cpcbAqi,
    category: air.categoryLabel,
    dominantPollutant: air.dominantPollutant,
    cleanestWindow: `${air.cleanestWindow.startLabel}-${air.cleanestWindow.endLabel} (AQI ~${air.cleanestWindow.avgCpcbAqi})`,
    household: profile.household,
    lifestyle: profile.lifestyle,
    catalogue: catalogueBrief,
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7500);

  try {
    const responsePromise = ai.models.generateContent({
      model,
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.2,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            verdict: { type: Type.STRING },
            focusNote: { type: Type.STRING },
            actions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  headline: { type: Type.STRING },
                  howToDoIt: { type: Type.STRING },
                  whyItWorks: { type: Type.STRING },
                },
                required: ["id", "headline", "howToDoIt", "whyItWorks"],
              },
            },
          },
          required: ["verdict", "focusNote", "actions"],
        },
      },
    });

    const timeoutPromise = new Promise<never>((_, reject) => {
      controller.signal.addEventListener("abort", () =>
        reject(new Error("Gemini plan timeout"))
      );
    });

    const response = await Promise.race([responsePromise, timeoutPromise]);
    const text = response.text;
    if (!text) {
      throw new Error("Empty Gemini response");
    }
    const parsedJson: unknown = JSON.parse(text);
    return GeminiPlanSchema.parse(parsedJson);
  } finally {
    clearTimeout(timeout);
  }
}

export async function generatePersonalizedPlan(
  profile: UserProfile,
  air: AirQualityReport
): Promise<PlanResponse> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const model = process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;

  const fallback = buildRuleBasedPlan(profile, air);
  if (!apiKey) {
    return fallback;
  }

  let geminiResult: z.infer<typeof GeminiPlanSchema> | null = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      geminiResult = await callGeminiOnce(apiKey, model, profile, air);
      break;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(
        JSON.stringify({
          ts: new Date().toISOString(),
          level: "warn",
          event: "gemini_plan_attempt_failed",
          attempt: attempt + 1,
          model,
          message: msg.slice(0, 240),
        })
      );
      const nonRetryable =
        msg.includes("401") ||
        msg.includes("403") ||
        msg.includes("404") ||
        msg.includes("UNAVAILABLE") ||
        msg.includes("503");
      if (attempt === 1 || nonRetryable) {
        return fallback;
      }
      await new Promise((r) => setTimeout(r, 250));
    }
  }

  if (!geminiResult) {
    return fallback;
  }

  // Merge validated Gemini personalization with deterministic impacts & ensure full 3-tab coverage
  const seenIds = new Set<string>();
  const merged: PlanAction[] = [];

  for (const item of geminiResult.actions) {
    if (seenIds.has(item.id)) continue;
    const catItem = CATALOGUE_BY_ID[item.id];
    if (!catItem) continue;
    seenIds.add(item.id);
    merged.push(
      toPlanAction(catItem, air, profile, {
        headline: item.headline,
        howToDoIt: item.howToDoIt,
        whyItWorks: item.whyItWorks,
      })
    );
  }

  // Backfill any category with fewer than 3 actions using deterministic priority ranker
  const ranked = rankCatalogueActions(profile, air);
  for (const cat of ["routines", "indoor", "swaps"] as const) {
    const countInCat = merged.filter((a) => a.category === cat).length;
    if (countInCat < 3) {
      for (const candidate of ranked[cat]) {
        if (seenIds.has(candidate.id)) continue;
        seenIds.add(candidate.id);
        merged.push(toPlanAction(candidate, air, profile));
        if (merged.filter((a) => a.category === cat).length >= 3) break;
      }
    }
  }

  return {
    planSource: "gemini",
    modelUsed: model,
    generatedAt: new Date().toISOString(),
    verdict: geminiResult.verdict,
    focusNote: geminiResult.focusNote,
    actions: merged,
    safetyNote: fallback.safetyNote,
  };
}
