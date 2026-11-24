import type {
  AqiBandKey,
  CleanestWindow,
  HourlyForecastPoint,
  PollutantBreakdown,
  UserProfile,
} from "./types";

interface Breakpoint {
  cLow: number;
  cHigh: number;
  iLow: number;
  iHigh: number;
}

// Official Indian CPCB National Air Quality Index (NAQI) breakpoints
const CPCB_PM25: Breakpoint[] = [
  { cLow: 0, cHigh: 30, iLow: 0, iHigh: 50 },
  { cLow: 30, cHigh: 60, iLow: 51, iHigh: 100 },
  { cLow: 60, cHigh: 90, iLow: 101, iHigh: 200 },
  { cLow: 90, cHigh: 120, iLow: 201, iHigh: 300 },
  { cLow: 120, cHigh: 250, iLow: 301, iHigh: 400 },
  { cLow: 250, cHigh: 380, iLow: 401, iHigh: 500 },
];

const CPCB_PM10: Breakpoint[] = [
  { cLow: 0, cHigh: 50, iLow: 0, iHigh: 50 },
  { cLow: 50, cHigh: 100, iLow: 51, iHigh: 100 },
  { cLow: 100, cHigh: 250, iLow: 101, iHigh: 200 },
  { cLow: 250, cHigh: 350, iLow: 201, iHigh: 300 },
  { cLow: 350, cHigh: 430, iLow: 301, iHigh: 400 },
  { cLow: 430, cHigh: 510, iLow: 401, iHigh: 500 },
];

const CPCB_NO2: Breakpoint[] = [
  { cLow: 0, cHigh: 40, iLow: 0, iHigh: 50 },
  { cLow: 40, cHigh: 80, iLow: 51, iHigh: 100 },
  { cLow: 80, cHigh: 180, iLow: 101, iHigh: 200 },
  { cLow: 180, cHigh: 280, iLow: 201, iHigh: 300 },
  { cLow: 280, cHigh: 400, iLow: 301, iHigh: 400 },
  { cLow: 400, cHigh: 520, iLow: 401, iHigh: 500 },
];

const CPCB_SO2: Breakpoint[] = [
  { cLow: 0, cHigh: 40, iLow: 0, iHigh: 50 },
  { cLow: 40, cHigh: 80, iLow: 51, iHigh: 100 },
  { cLow: 80, cHigh: 380, iLow: 101, iHigh: 200 },
  { cLow: 380, cHigh: 800, iLow: 201, iHigh: 300 },
  { cLow: 800, cHigh: 1600, iLow: 301, iHigh: 400 },
  { cLow: 1600, cHigh: 2100, iLow: 401, iHigh: 500 },
];

const CPCB_O3: Breakpoint[] = [
  { cLow: 0, cHigh: 50, iLow: 0, iHigh: 50 },
  { cLow: 50, cHigh: 100, iLow: 51, iHigh: 100 },
  { cLow: 100, cHigh: 168, iLow: 101, iHigh: 200 },
  { cLow: 168, cHigh: 208, iLow: 201, iHigh: 300 },
  { cLow: 208, cHigh: 748, iLow: 301, iHigh: 400 },
  { cLow: 748, cHigh: 900, iLow: 401, iHigh: 500 },
];

const CPCB_CO_MG: Breakpoint[] = [
  { cLow: 0, cHigh: 1.0, iLow: 0, iHigh: 50 },
  { cLow: 1.0, cHigh: 2.0, iLow: 51, iHigh: 100 },
  { cLow: 2.0, cHigh: 10.0, iLow: 101, iHigh: 200 },
  { cLow: 10.0, cHigh: 17.0, iLow: 201, iHigh: 300 },
  { cLow: 17.0, cHigh: 34.0, iLow: 301, iHigh: 400 },
  { cLow: 34.0, cHigh: 46.0, iLow: 401, iHigh: 500 },
];

// US EPA PM2.5 breakpoints (2024 revision)
const US_PM25: Breakpoint[] = [
  { cLow: 0, cHigh: 9.0, iLow: 0, iHigh: 50 },
  { cLow: 9.1, cHigh: 35.4, iLow: 51, iHigh: 100 },
  { cLow: 35.5, cHigh: 55.4, iLow: 101, iHigh: 150 },
  { cLow: 55.5, cHigh: 125.4, iLow: 151, iHigh: 200 },
  { cLow: 125.5, cHigh: 225.4, iLow: 201, iHigh: 300 },
  { cLow: 225.5, cHigh: 325.4, iLow: 301, iHigh: 500 },
];

export function interpolateSubIndex(value: number, table: Breakpoint[]): number {
  const safeVal = Math.max(0, Number.isFinite(value) ? value : 0);
  for (const bp of table) {
    if (safeVal <= bp.cHigh) {
      const ratio = (safeVal - bp.cLow) / Math.max(0.0001, bp.cHigh - bp.cLow);
      return Math.round(bp.iLow + ratio * (bp.iHigh - bp.iLow));
    }
  }
  return 500;
}

export function calculateUsAqiFromPm25(pm25: number): number {
  return Math.min(500, interpolateSubIndex(pm25, US_PM25));
}

export function calculateCpcbAqi(pollutants: PollutantBreakdown): {
  aqi: number;
  dominantPollutant: "PM2.5" | "PM10" | "NO2" | "SO2" | "O3" | "CO";
  subIndices: Record<"PM2.5" | "PM10" | "NO2" | "SO2" | "O3" | "CO", number>;
} {
  const subIndices = {
    "PM2.5": interpolateSubIndex(pollutants.pm2_5, CPCB_PM25),
    PM10: interpolateSubIndex(pollutants.pm10, CPCB_PM10),
    NO2: interpolateSubIndex(pollutants.nitrogen_dioxide, CPCB_NO2),
    SO2: interpolateSubIndex(pollutants.sulphur_dioxide, CPCB_SO2),
    O3: interpolateSubIndex(pollutants.ozone, CPCB_O3),
    CO: interpolateSubIndex(pollutants.carbon_monoxide_mg, CPCB_CO_MG),
  };

  let dominantPollutant: "PM2.5" | "PM10" | "NO2" | "SO2" | "O3" | "CO" = "PM2.5";
  let maxVal = -1;

  for (const [key, val] of Object.entries(subIndices) as Array<
    ["PM2.5" | "PM10" | "NO2" | "SO2" | "O3" | "CO", number]
  >) {
    if (val > maxVal) {
      maxVal = val;
      dominantPollutant = key;
    }
  }

  return {
    aqi: Math.min(500, Math.max(0, maxVal)),
    dominantPollutant,
    subIndices,
  };
}

export function getCpcbBand(aqi: number): {
  key: AqiBandKey;
  label: string;
  labelHi: string;
  verdict: string;
  verdictHi: string;
} {
  if (aqi <= 50) {
    return {
      key: "good",
      label: "Good",
      labelHi: "अच्छी",
      verdict: "Fresh air today — great for outdoor walks and natural cross-ventilation.",
      verdictHi: "आज हवा साफ है — बाहर टहलने और खिड़कियाँ खोलने का अच्छा समय है।",
    };
  }
  if (aqi <= 100) {
    return {
      key: "satisfactory",
      label: "Satisfactory",
      labelHi: "संतोषजनक",
      verdict: "Air is mostly comfortable; sensitive people should pace heavy outdoor workouts.",
      verdictHi: "हवा ठीक है; संवेदनशील लोग भारी बाहरी व्यायाम थोड़ा हल्का रखें।",
    };
  }
  if (aqi <= 200) {
    return {
      key: "moderate",
      label: "Moderate",
      labelHi: "मध्यम",
      verdict: "Time outdoor errands for the cleanest afternoon window; keep asthma inhalers handy.",
      verdictHi: "बाहरी काम दोपहर के सबसे साफ समय में करें; अस्थमा इनहेलर पास रखें।",
    };
  }
  if (aqi <= 300) {
    return {
      key: "poor",
      label: "Poor",
      labelHi: "खराब",
      verdict: "Limit outdoor exertion, seal window gaps, and wear an N95 mask in traffic.",
      verdictHi: "बाहर भारी मेहनत कम करें, खिड़कियों की दरारें बंद करें और ट्रैफ़िक में N95 पहनें।",
    };
  }
  if (aqi <= 400) {
    return {
      key: "very_poor",
      label: "Very Poor",
      labelHi: "बहुत खराब",
      verdict: "Stay in, keep windows shut, and run an air purifier or box-fan filter on high.",
      verdictHi: "अंदर रहें, खिड़कियाँ बंद रखें और प्यूरीफायर या बॉक्स-फैन फ़िल्टर तेज़ चलाएँ।",
    };
  }
  return {
    key: "severe",
    label: "Severe",
    labelHi: "गंभीर",
    verdict: "Avoid outdoor exercise completely, seal drafts, and protect children and elders indoors.",
    verdictHi: "बाहर व्यायाम बिल्कुल न करें, हवा के रिसाव रोकें और बच्चों व बुज़ुर्गों को अंदर रखें।",
  };
}

export function getUsCategoryLabel(usAqi: number): string {
  if (usAqi <= 50) return "Good";
  if (usAqi <= 100) return "Moderate";
  if (usAqi <= 150) return "Unhealthy for Sensitive Groups";
  if (usAqi <= 200) return "Unhealthy";
  if (usAqi <= 300) return "Very Unhealthy";
  return "Hazardous";
}

export function getUsBandKey(usAqi: number): AqiBandKey {
  if (usAqi <= 50) return "good";
  if (usAqi <= 100) return "satisfactory";
  if (usAqi <= 150) return "moderate";
  if (usAqi <= 200) return "poor";
  if (usAqi <= 300) return "very_poor";
  return "severe";
}

/**
 * Finds the cleanest 3-hour window inside the next 24 hours.
 * Prefers daytime hours (07:00–20:00) when pollution difference is small so advice is practical.
 */
export function findCleanestWindow(hourly: HourlyForecastPoint[]): CleanestWindow {
  if (hourly.length === 0) {
    return {
      startTime: "",
      endTime: "",
      startLabel: "14:00",
      endLabel: "16:00",
      avgCpcbAqi: 180,
      avgPm25: 84,
      summary: "Best window: 14:00–16:00 when daytime mixing disperses ground smog.",
    };
  }

  const slice = hourly.slice(0, 24);
  const windowSize = Math.min(3, slice.length);
  let bestScore = Infinity;
  let bestStart = 0;

  for (let i = 0; i <= slice.length - windowSize; i++) {
    let sumAqi = 0;
    let daytimeCount = 0;
    for (let j = 0; j < windowSize; j++) {
      const pt = slice[i + j];
      if (!pt) continue;
      sumAqi += pt.cpcbAqi;
      const hourNum = Number(pt.hourLabel.split(":")[0] ?? "12");
      if (hourNum >= 8 && hourNum <= 19) daytimeCount += 1;
    }
    const avgAqi = sumAqi / windowSize;
    // Slight 8% preference for daytime hours when people are awake
    const practicalPenalty = daytimeCount === 0 ? 15 : 0;
    const score = avgAqi + practicalPenalty;
    if (score < bestScore) {
      bestScore = score;
      bestStart = i;
    }
  }

  const chosen = slice.slice(bestStart, bestStart + windowSize);
  const first = chosen[0]!;
  const last = chosen[chosen.length - 1]!;
  const avgCpcbAqi = Math.round(
    chosen.reduce((acc, p) => acc + p.cpcbAqi, 0) / chosen.length
  );
  const avgPm25 = Math.round(
    chosen.reduce((acc, p) => acc + p.pm2_5, 0) / chosen.length
  );

  return {
    startTime: first.time,
    endTime: last.time,
    startLabel: first.hourLabel,
    endLabel: last.hourLabel,
    avgCpcbAqi,
    avgPm25,
    summary:
      avgCpcbAqi <= 100
        ? `Great outdoor window ${first.hourLabel}–${last.hourLabel} (AQI ~${avgCpcbAqi}).`
        : avgCpcbAqi <= 200
        ? `Cleanest outdoor window is ${first.hourLabel}–${last.hourLabel} (AQI ~${avgCpcbAqi}).`
        : `Briefest dip is ${first.hourLabel}–${last.hourLabel} (AQI ~${avgCpcbAqi}) — keep trips short with an N95.`,
  };
}

export interface GroupAdvisory {
  group: "adults" | "children" | "elderly" | "respiratory";
  title: string;
  titleHi: string;
  countText: string;
  advice: string;
  adviceHi: string;
  status: "safe" | "caution" | "protect";
}

export function buildGroupAdvisories(
  cpcbAqi: number,
  profile: UserProfile
): GroupAdvisory[] {
  const { household } = profile;
  const list: GroupAdvisory[] = [];

  list.push({
    group: "adults",
    title: "Adults",
    titleHi: "वयस्क",
    countText: `${household.adults}`,
    status: cpcbAqi <= 100 ? "safe" : cpcbAqi <= 200 ? "caution" : "protect",
    advice:
      cpcbAqi <= 100
        ? "Normal walks and commuting are fine."
        : cpcbAqi <= 200
        ? "Move brisk workouts to the cleanest afternoon hour."
        : "Skip outdoor runs; wear a snug N95/FFP2 mask on outdoor commutes.",
    adviceHi:
      cpcbAqi <= 100
        ? "सामान्य टहलना और बाहर जाना सुरक्षित है।"
        : cpcbAqi <= 200
        ? "तेज़ व्यायाम दोपहर के साफ समय में करें।"
        : "बाहर दौड़ना टालें; यात्रा में N95/FFP2 मास्क पहनें।",
  });

  if (household.children > 0) {
    list.push({
      group: "children",
      title: "Children",
      titleHi: "बच्चे",
      countText: `${household.children}`,
      status: cpcbAqi <= 100 ? "safe" : cpcbAqi <= 180 ? "caution" : "protect",
      advice:
        cpcbAqi <= 100
          ? "Outdoor play is comfortable today."
          : cpcbAqi <= 200
          ? "Keep outdoor play brief; hydrate well after school."
          : "Switch to indoor games; children inhale more air per kg body weight.",
      adviceHi:
        cpcbAqi <= 100
          ? "आज बाहर खेलना ठीक है।"
          : cpcbAqi <= 200
          ? "बाहर खेलने का समय कम रखें।"
          : "खेल घर के अंदर रखें; बच्चों के फेफड़े अधिक हवा खींचते हैं।",
    });
  }

  if (household.elderly > 0) {
    list.push({
      group: "elderly",
      title: "Elderly",
      titleHi: "बुज़ुर्ग",
      countText: `${household.elderly}`,
      status: cpcbAqi <= 100 ? "safe" : cpcbAqi <= 180 ? "caution" : "protect",
      advice:
        cpcbAqi <= 100
          ? "Morning and evening strolls are safe."
          : cpcbAqi <= 200
          ? "Swap early-morning smog walks for mid-afternoon sunshine."
          : "Stay indoors with sealed drafts; monitor blood pressure & fatigue.",
      adviceHi:
        cpcbAqi <= 100
          ? "सुबह-शाम टहलना सुरक्षित है।"
          : cpcbAqi <= 200
          ? "सुबह के बजाय दोपहर की धूप में टहलें।"
          : "दरारें बंद कर अंदर रहें; थकान या सांस पर ध्यान दें।",
    });
  }

  if (household.asthmaOrRespiratory || household.heartCondition) {
    list.push({
      group: "respiratory",
      title: "Sensitive Care",
      titleHi: "श्वसन / हृदय देखभाल",
      countText: "Priority",
      status: cpcbAqi <= 80 ? "safe" : cpcbAqi <= 150 ? "caution" : "protect",
      advice:
        cpcbAqi <= 100
          ? "Keep prescribed inhaler or medication accessible as usual."
          : "Run indoor filtration, avoid incense/smoke, and seek a doctor promptly for chest tightness or wheezing.",
      adviceHi:
        cpcbAqi <= 100
          ? "अपनी नियमित दवा/इनहेलर पास रखें।"
          : "अंदर एयर फ़िल्टर चलाएँ, धुएँ से बचें; सांस फूलने पर तुरंत डॉक्टर से मिलें।",
    });
  }

  return list;
}
