import {
  calculateCpcbAqi,
  calculateUsAqiFromPm25,
  findCleanestWindow,
  getCpcbBand,
  getUsCategoryLabel,
} from "./aqi";
import { buildFixtureReport, buildSimulatedSmogReport } from "./fixtures";
import type {
  AirQualityReport,
  HourlyForecastPoint,
  PollutantBreakdown,
  UserLocation,
} from "./types";

interface CacheEntry {
  report: AirQualityReport;
  expiresAt: number;
}

const AIR_CACHE = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_CACHE_ENTRIES = 500;

function pruneAirCache(now: number): void {
  for (const [k, entry] of AIR_CACHE.entries()) {
    if (entry.expiresAt <= now) {
      AIR_CACHE.delete(k);
    }
  }
  while (AIR_CACHE.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = AIR_CACHE.keys().next().value;
    if (!oldestKey) break;
    AIR_CACHE.delete(oldestKey);
  }
}

function cacheKey(loc: UserLocation): string {
  return `${loc.latitude.toFixed(2)},${loc.longitude.toFixed(2)}`;
}

async function fetchWithRetry(url: string, retries = 2): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 7000);
    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      clearTimeout(timer);
      if (res.ok) return res;
      lastError = new Error(`HTTP ${res.status}`);
    } catch (err) {
      clearTimeout(timer);
      lastError = err;
    }
    if (attempt < retries) {
      await new Promise((r) => setTimeout(r, 350 * Math.pow(2, attempt)));
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Upstream fetch failed");
}

function weatherCodeToLabel(code: number | undefined): string {
  if (code === undefined) return "Clear";
  if (code <= 1) return "Clear";
  if (code <= 3) return "Partly Cloudy";
  if (code === 45 || code === 48) return "Haze / Fog";
  if (code >= 51 && code <= 67) return "Light Rain";
  if (code >= 80) return "Showers";
  return "Hazy";
}

interface OpenMeteoAirPayload {
  hourly?: {
    time?: string[];
    pm2_5?: Array<number | null>;
    pm10?: Array<number | null>;
    nitrogen_dioxide?: Array<number | null>;
    sulphur_dioxide?: Array<number | null>;
    ozone?: Array<number | null>;
    carbon_monoxide?: Array<number | null>;
    us_aqi?: Array<number | null>;
  };
}

interface OpenMeteoWeatherPayload {
  current?: {
    temperature_2m?: number;
    relative_humidity_2m?: number;
    wind_speed_10m?: number;
    weather_code?: number;
  };
  hourly?: {
    time?: string[];
    temperature_2m?: Array<number | null>;
  };
}

export async function getAirQualityReport(
  location: UserLocation,
  options?: { simulate?: boolean }
): Promise<AirQualityReport> {
  if (options?.simulate) {
    return buildSimulatedSmogReport(location);
  }

  const key = cacheKey(location);
  const cached = AIR_CACHE.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return {
      ...cached.report,
      location,
      source: "cache",
    };
  }

  const airUrl =
    `https://air-quality-api.open-meteo.com/v1/air-quality` +
    `?latitude=${encodeURIComponent(location.latitude)}` +
    `&longitude=${encodeURIComponent(location.longitude)}` +
    `&hourly=pm2_5,pm10,nitrogen_dioxide,sulphur_dioxide,ozone,carbon_monoxide,us_aqi` +
    `&forecast_days=2&timezone=auto`;

  const weatherUrl =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${encodeURIComponent(location.latitude)}` +
    `&longitude=${encodeURIComponent(location.longitude)}` +
    `&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code` +
    `&hourly=temperature_2m&forecast_days=2&timezone=auto`;

  try {
    const [airRes, weatherRes] = await Promise.all([
      fetchWithRetry(airUrl, 2),
      fetchWithRetry(weatherUrl, 1).catch(() => null),
    ]);

    const airJson = (await airRes.json()) as OpenMeteoAirPayload;
    const weatherJson = weatherRes
      ? ((await weatherRes.json()) as OpenMeteoWeatherPayload)
      : null;

    const times = airJson.hourly?.time ?? [];
    if (times.length === 0) {
      throw new Error("Empty Open-Meteo hourly array");
    }

    // Pick current hour index closest to now
    const nowMs = Date.now();
    let currentIdx = 0;
    let smallestDiff = Infinity;
    for (let i = 0; i < times.length; i++) {
      const tMs = Date.parse(times[i] ?? "");
      if (Number.isFinite(tMs)) {
        const diff = Math.abs(tMs - nowMs);
        if (diff < smallestDiff) {
          smallestDiff = diff;
          currentIdx = i;
        }
      }
    }

    const pickNum = (arr: Array<number | null> | undefined, idx: number, fallback = 0) => {
      const v = arr?.[idx];
      return typeof v === "number" && Number.isFinite(v) ? Math.max(0, v) : fallback;
    };

    const pollutants: PollutantBreakdown = {
      pm2_5: Math.round(pickNum(airJson.hourly?.pm2_5, currentIdx, 45)),
      pm10: Math.round(pickNum(airJson.hourly?.pm10, currentIdx, 82)),
      nitrogen_dioxide: Math.round(pickNum(airJson.hourly?.nitrogen_dioxide, currentIdx, 28)),
      sulphur_dioxide: Math.round(pickNum(airJson.hourly?.sulphur_dioxide, currentIdx, 12)),
      ozone: Math.round(pickNum(airJson.hourly?.ozone, currentIdx, 36)),
      carbon_monoxide_mg: Number(
        (pickNum(airJson.hourly?.carbon_monoxide, currentIdx, 650) / 1000).toFixed(2)
      ),
    };

    const { aqi: cpcbAqi, dominantPollutant } = calculateCpcbAqi(pollutants);
    const rawUsAqi = pickNum(airJson.hourly?.us_aqi, currentIdx, 0);
    const usAqi =
      rawUsAqi > 0
        ? Math.min(500, Math.round(rawUsAqi))
        : calculateUsAqiFromPm25(pollutants.pm2_5);

    const band = getCpcbBand(cpcbAqi);

    const hourly: HourlyForecastPoint[] = [];
    const endIdx = Math.min(times.length, currentIdx + 24);
    for (let i = currentIdx; i < endIdx; i++) {
      const timeStr = times[i] ?? "";
      const hourLabel = timeStr.includes("T") ? timeStr.split("T")[1]?.slice(0, 5) ?? "00:00" : "00:00";
      const hPm25 = Math.round(pickNum(airJson.hourly?.pm2_5, i, pollutants.pm2_5));
      const hPm10 = Math.round(pickNum(airJson.hourly?.pm10, i, pollutants.pm10));
      const hNo2 = Math.round(pickNum(airJson.hourly?.nitrogen_dioxide, i, pollutants.nitrogen_dioxide));
      const hSo2 = Math.round(pickNum(airJson.hourly?.sulphur_dioxide, i, pollutants.sulphur_dioxide));
      const hO3 = Math.round(pickNum(airJson.hourly?.ozone, i, pollutants.ozone));
      const hCoMg = Number((pickNum(airJson.hourly?.carbon_monoxide, i, 600) / 1000).toFixed(2));
      const hCpcb = calculateCpcbAqi({
        pm2_5: hPm25,
        pm10: hPm10,
        nitrogen_dioxide: hNo2,
        sulphur_dioxide: hSo2,
        ozone: hO3,
        carbon_monoxide_mg: hCoMg,
      }).aqi;
      const hUsRaw = pickNum(airJson.hourly?.us_aqi, i, 0);
      const hTemp = weatherJson?.hourly?.temperature_2m?.[i];

      hourly.push({
        time: timeStr,
        hourLabel,
        pm2_5: hPm25,
        pm10: hPm10,
        cpcbAqi: hCpcb,
        usAqi: hUsRaw > 0 ? Math.min(500, Math.round(hUsRaw)) : calculateUsAqiFromPm25(hPm25),
        temperatureC: typeof hTemp === "number" ? Number(hTemp.toFixed(1)) : undefined,
      });
    }

    const report: AirQualityReport = {
      location,
      fetchedAt: new Date().toISOString(),
      source: "open-meteo",
      isDemoData: false,
      isSimulated: false,
      cpcbAqi,
      usAqi,
      bandKey: band.key,
      categoryLabel: band.label,
      usCategoryLabel: getUsCategoryLabel(usAqi),
      dominantPollutant,
      verdict: band.verdict,
      pollutants,
      weather: {
        temperatureC: Number((weatherJson?.current?.temperature_2m ?? 21).toFixed(1)),
        humidityPct: Math.round(weatherJson?.current?.relative_humidity_2m ?? 58),
        windKmh: Number((weatherJson?.current?.wind_speed_10m ?? 7.5).toFixed(1)),
        conditionLabel: weatherCodeToLabel(weatherJson?.current?.weather_code),
      },
      hourly,
      cleanestWindow: findCleanestWindow(hourly),
    };

    pruneAirCache(Date.now());
    AIR_CACHE.set(key, { report, expiresAt: Date.now() + CACHE_TTL_MS });
    return report;
  } catch (err) {
    console.warn(
      JSON.stringify({
        ts: new Date().toISOString(),
        level: "warn",
        event: "open_meteo_fallback",
        location: location.name,
        message: err instanceof Error ? err.message : String(err),
      })
    );
    return buildFixtureReport(location);
  }
}
