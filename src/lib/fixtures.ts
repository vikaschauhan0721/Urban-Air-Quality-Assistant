import {
  calculateCpcbAqi,
  calculateUsAqiFromPm25,
  findCleanestWindow,
  getCpcbBand,
  getUsCategoryLabel,
} from "./aqi";
import type {
  AirQualityReport,
  HourlyForecastPoint,
  PollutantBreakdown,
  UserLocation,
  UserProfile,
} from "./types";

export const PRESET_LOCATIONS: UserLocation[] = [
  {
    name: "New Delhi (Rohini)",
    region: "Delhi",
    country: "India",
    latitude: 28.74,
    longitude: 77.07,
  },
  {
    name: "Gurugram",
    region: "Haryana",
    country: "India",
    latitude: 28.46,
    longitude: 77.03,
  },
  {
    name: "Mumbai (Bandra)",
    region: "Maharashtra",
    country: "India",
    latitude: 19.06,
    longitude: 72.83,
  },
  {
    name: "Bengaluru",
    region: "Karnataka",
    country: "India",
    latitude: 12.97,
    longitude: 77.59,
  },
];

export const DEMO_HOUSEHOLD_PROFILE: UserProfile = {
  location: PRESET_LOCATIONS[0]!,
  household: {
    adults: 2,
    children: 1,
    elderly: 1,
    asthmaOrRespiratory: true,
    heartCondition: false,
  },
  lifestyle: {
    commute: "car",
    hasPurifier: false,
    leakyWindows: true,
    cookingFuel: "lpg",
    budget: "low",
  },
  language: "en",
  aqiScale: "cpcb",
  onboarded: true,
  isDemoProfile: true,
};

export const DEFAULT_PROFILE: UserProfile = {
  location: PRESET_LOCATIONS[0]!,
  household: {
    adults: 2,
    children: 0,
    elderly: 0,
    asthmaOrRespiratory: false,
    heartCondition: false,
  },
  lifestyle: {
    commute: "metro_bus",
    hasPurifier: false,
    leakyWindows: true,
    cookingFuel: "lpg",
    budget: "low",
  },
  language: "en",
  aqiScale: "cpcb",
  onboarded: false,
  isDemoProfile: false,
};

function buildDiurnalHourly(basePm25: number, basePm10: number, baseTemp: number): HourlyForecastPoint[] {
  // Realistic winter urban diurnal curve: higher night/early-morning inversion, afternoon dip (13:00-16:00)
  const factors = [
    1.15, 1.18, 1.22, 1.24, 1.2, 1.16, 1.12, 1.08, 1.0, 0.9, 0.8, 0.72,
    0.66, 0.63, 0.65, 0.72, 0.82, 0.94, 1.04, 1.1, 1.14, 1.16, 1.15, 1.14,
  ];
  const now = new Date();
  now.setMinutes(0, 0, 0);

  return factors.map((factor, idx) => {
    const dt = new Date(now.getTime() + idx * 3600_000);
    const hourNum = dt.getHours();
    const hourLabel = `${String(hourNum).padStart(2, "0")}:00`;
    const pm2_5 = Math.round(basePm25 * factor);
    const pm10 = Math.round(basePm10 * factor);
    const cpcb = calculateCpcbAqi({
      pm2_5,
      pm10,
      nitrogen_dioxide: Math.round(42 * factor),
      sulphur_dioxide: 16,
      ozone: hourNum >= 12 && hourNum <= 16 ? 58 : 26,
      carbon_monoxide_mg: Number((1.4 * factor).toFixed(2)),
    }).aqi;

    return {
      time: dt.toISOString(),
      hourLabel,
      pm2_5,
      pm10,
      cpcbAqi: cpcb,
      usAqi: calculateUsAqiFromPm25(pm2_5),
      temperatureC: Number((baseTemp + (hourNum >= 11 && hourNum <= 16 ? 5 : -1)).toFixed(1)),
    };
  });
}

/**
 * Generates a realistic Very Poor (~312 CPCB AQI) winter smog profile
 * so judges and users can test severe scenarios anytime.
 */
export function buildSimulatedSmogReport(location: UserLocation): AirQualityReport {
  const pollutants: PollutantBreakdown = {
    pm2_5: 135, // Exact CPCB sub-index = 312 (Very Poor)
    pm10: 274,
    nitrogen_dioxide: 68,
    sulphur_dioxide: 21,
    ozone: 38,
    carbon_monoxide_mg: 2.1,
  };
  const { aqi, dominantPollutant } = calculateCpcbAqi(pollutants);
  const usAqi = calculateUsAqiFromPm25(pollutants.pm2_5);
  const band = getCpcbBand(aqi);
  const hourly = buildDiurnalHourly(pollutants.pm2_5, pollutants.pm10, 13);
  const cleanestWindow = findCleanestWindow(hourly);

  return {
    location,
    fetchedAt: new Date().toISOString(),
    source: "simulated",
    isDemoData: true,
    isSimulated: true,
    cpcbAqi: aqi,
    usAqi,
    bandKey: band.key,
    categoryLabel: band.label,
    usCategoryLabel: getUsCategoryLabel(usAqi),
    dominantPollutant,
    verdict: band.verdict,
    pollutants,
    weather: {
      temperatureC: 14.2,
      humidityPct: 78,
      windKmh: 4.5,
      conditionLabel: "Winter Haze · Low Wind",
    },
    hourly,
    cleanestWindow,
  };
}

export function buildFixtureReport(location: UserLocation): AirQualityReport {
  const isDelhiNcr = location.latitude > 26;
  const pollutants: PollutantBreakdown = isDelhiNcr
    ? {
        pm2_5: 104,
        pm10: 210,
        nitrogen_dioxide: 54,
        sulphur_dioxide: 18,
        ozone: 34,
        carbon_monoxide_mg: 1.6,
      }
    : {
        pm2_5: 38,
        pm10: 78,
        nitrogen_dioxide: 29,
        sulphur_dioxide: 11,
        ozone: 42,
        carbon_monoxide_mg: 0.7,
      };

  const { aqi, dominantPollutant } = calculateCpcbAqi(pollutants);
  const usAqi = calculateUsAqiFromPm25(pollutants.pm2_5);
  const band = getCpcbBand(aqi);
  const hourly = buildDiurnalHourly(pollutants.pm2_5, pollutants.pm10, isDelhiNcr ? 16 : 25);

  return {
    location,
    fetchedAt: new Date().toISOString(),
    source: "fixture",
    isDemoData: true,
    isSimulated: false,
    cpcbAqi: aqi,
    usAqi,
    bandKey: band.key,
    categoryLabel: band.label,
    usCategoryLabel: getUsCategoryLabel(usAqi),
    dominantPollutant,
    verdict: band.verdict,
    pollutants,
    weather: {
      temperatureC: isDelhiNcr ? 16.5 : 26.0,
      humidityPct: isDelhiNcr ? 68 : 62,
      windKmh: isDelhiNcr ? 6.2 : 13.4,
      conditionLabel: isDelhiNcr ? "Hazy" : "Partly Cloudy",
    },
    hourly,
    cleanestWindow: findCleanestWindow(hourly),
  };
}
