import { z } from "zod";

export const AqiScaleSchema = z.enum(["cpcb", "us"]);
export type AqiScale = z.infer<typeof AqiScaleSchema>;

export const LanguageSchema = z.enum(["en", "hi"]);
export type Language = z.infer<typeof LanguageSchema>;

export const AqiBandKeySchema = z.enum([
  "good",
  "satisfactory",
  "moderate",
  "poor",
  "very_poor",
  "severe",
]);
export type AqiBandKey = z.infer<typeof AqiBandKeySchema>;

export const CommuteModeSchema = z.enum([
  "walk",
  "cycle",
  "two_wheeler",
  "car",
  "metro_bus",
]);
export type CommuteMode = z.infer<typeof CommuteModeSchema>;

export const CookingFuelSchema = z.enum(["lpg", "induction", "biomass"]);
export type CookingFuel = z.infer<typeof CookingFuelSchema>;

export const BudgetTierSchema = z.enum(["free", "low", "flexible"]);
export type BudgetTier = z.infer<typeof BudgetTierSchema>;

export const LocationSchema = z.object({
  name: z.string().min(1).max(120),
  region: z.string().max(120).optional().default(""),
  country: z.string().max(80).optional().default("India"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});
export type UserLocation = z.infer<typeof LocationSchema>;

export const HouseholdSchema = z.object({
  adults: z.number().int().min(1).max(12),
  children: z.number().int().min(0).max(10),
  elderly: z.number().int().min(0).max(10),
  asthmaOrRespiratory: z.boolean(),
  heartCondition: z.boolean(),
});
export type HouseholdProfile = z.infer<typeof HouseholdSchema>;

export const LifestyleSchema = z.object({
  commute: CommuteModeSchema,
  hasPurifier: z.boolean(),
  leakyWindows: z.boolean(),
  cookingFuel: CookingFuelSchema,
  budget: BudgetTierSchema,
});
export type LifestyleProfile = z.infer<typeof LifestyleSchema>;

export const UserProfileSchema = z.object({
  location: LocationSchema,
  household: HouseholdSchema,
  lifestyle: LifestyleSchema,
  language: LanguageSchema.default("en"),
  aqiScale: AqiScaleSchema.default("cpcb"),
  onboarded: z.boolean().default(true),
  isDemoProfile: z.boolean().optional().default(false),
});
export type UserProfile = z.infer<typeof UserProfileSchema>;

export const PollutantBreakdownSchema = z.object({
  pm2_5: z.number().nonnegative(),
  pm10: z.number().nonnegative(),
  nitrogen_dioxide: z.number().nonnegative(),
  sulphur_dioxide: z.number().nonnegative(),
  ozone: z.number().nonnegative(),
  carbon_monoxide_mg: z.number().nonnegative(),
});
export type PollutantBreakdown = z.infer<typeof PollutantBreakdownSchema>;

export const HourlyForecastPointSchema = z.object({
  time: z.string(),
  hourLabel: z.string(),
  pm2_5: z.number().nonnegative(),
  pm10: z.number().nonnegative(),
  cpcbAqi: z.number().nonnegative(),
  usAqi: z.number().nonnegative(),
  temperatureC: z.number().optional(),
});
export type HourlyForecastPoint = z.infer<typeof HourlyForecastPointSchema>;

export const CleanestWindowSchema = z.object({
  startTime: z.string(),
  endTime: z.string(),
  startLabel: z.string(),
  endLabel: z.string(),
  avgCpcbAqi: z.number().nonnegative(),
  avgPm25: z.number().nonnegative(),
  summary: z.string(),
});
export type CleanestWindow = z.infer<typeof CleanestWindowSchema>;

export const WeatherSnapshotSchema = z.object({
  temperatureC: z.number(),
  humidityPct: z.number(),
  windKmh: z.number(),
  conditionLabel: z.string(),
});
export type WeatherSnapshot = z.infer<typeof WeatherSnapshotSchema>;

export const AirQualityReportSchema = z.object({
  location: LocationSchema,
  fetchedAt: z.string(),
  source: z.enum(["open-meteo", "cache", "fixture", "simulated"]),
  isDemoData: z.boolean(),
  isSimulated: z.boolean(),
  cpcbAqi: z.number().min(0).max(500),
  usAqi: z.number().min(0).max(500),
  bandKey: AqiBandKeySchema,
  categoryLabel: z.string(),
  usCategoryLabel: z.string(),
  dominantPollutant: z.enum(["PM2.5", "PM10", "NO2", "SO2", "O3", "CO"]),
  verdict: z.string(),
  pollutants: PollutantBreakdownSchema,
  weather: WeatherSnapshotSchema,
  hourly: z.array(HourlyForecastPointSchema),
  cleanestWindow: CleanestWindowSchema,
});
export type AirQualityReport = z.infer<typeof AirQualityReportSchema>;

export const ActionCategorySchema = z.enum(["routines", "indoor", "swaps"]);
export type ActionCategory = z.infer<typeof ActionCategorySchema>;

export const ConfidenceLevelSchema = z.enum(["High", "Medium", "Low"]);
export type ConfidenceLevel = z.infer<typeof ConfidenceLevelSchema>;

export const DeterministicImpactSchema = z.object({
  indoorPm25Before: z.number().nonnegative(),
  indoorPm25After: z.number().nonnegative(),
  pm25DeltaUgM3: z.number().nonnegative(),
  pm25ReductionPct: z.number().min(0).max(100),
  durationMinutes: z.number().nonnegative(),
  exposureAvoidedUgM3Hours: z.number().nonnegative(),
  co2SavedKg: z.number().nonnegative(),
  confidence: ConfidenceLevelSchema,
  methodTitle: z.string(),
  methodDetails: z.string(),
  sourceCitation: z.string(),
  chipLabel: z.string(),
  beforeAfterLabel: z.string(),
});
export type DeterministicImpact = z.infer<typeof DeterministicImpactSchema>;

export const PlanActionSchema = z.object({
  id: z.string(),
  category: ActionCategorySchema,
  title: z.string(),
  headline: z.string(),
  howToDoIt: z.string(),
  whyItWorks: z.string(),
  effort: z.enum(["2 min", "10 min", "Daily habit", "One-time setup"]),
  costTier: BudgetTierSchema,
  costLabel: z.string(),
  impact: DeterministicImpactSchema,
});
export type PlanAction = z.infer<typeof PlanActionSchema>;

export const PlanResponseSchema = z.object({
  planSource: z.enum(["gemini", "rule-based"]),
  modelUsed: z.string(),
  generatedAt: z.string(),
  verdict: z.string(),
  focusNote: z.string(),
  actions: z.array(PlanActionSchema),
  safetyNote: z.string(),
});
export type PlanResponse = z.infer<typeof PlanResponseSchema>;

export const MythBusterSchema = z.object({
  id: z.string(),
  myth: z.string(),
  mythHi: z.string(),
  verdict: z.enum(["Myth", "Half-truth"]),
  truth: z.string(),
  truthHi: z.string(),
  evidence: z.string(),
  confidence: ConfidenceLevelSchema,
});
export type MythBuster = z.infer<typeof MythBusterSchema>;

export const ChatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(2000),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;
