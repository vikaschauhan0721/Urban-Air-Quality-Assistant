import { describe, expect, it } from "vitest";
import {
  calculateCpcbAqi,
  calculateUsAqiFromPm25,
  findCleanestWindow,
  getCpcbBand,
  getUsCategoryLabel,
} from "@/lib/aqi";
import { buildSimulatedSmogReport, PRESET_LOCATIONS } from "@/lib/fixtures";
import type { HourlyForecastPoint } from "@/lib/types";

describe("Indian CPCB AQI calculator", () => {
  it("computes Good category for clean air", () => {
    const res = calculateCpcbAqi({
      pm2_5: 18,
      pm10: 32,
      nitrogen_dioxide: 15,
      sulphur_dioxide: 8,
      ozone: 28,
      carbon_monoxide_mg: 0.4,
    });
    expect(res.aqi).toBeLessThanOrEqual(50);
    expect(getCpcbBand(res.aqi).key).toBe("good");
  });

  it("computes Very Poor (~312) for winter smog PM2.5 = 135", () => {
    const res = calculateCpcbAqi({
      pm2_5: 135,
      pm10: 210,
      nitrogen_dioxide: 50,
      sulphur_dioxide: 15,
      ozone: 35,
      carbon_monoxide_mg: 1.5,
    });
    expect(res.aqi).toBe(312);
    expect(res.dominantPollutant).toBe("PM2.5");
    expect(getCpcbBand(res.aqi).key).toBe("very_poor");
  });

  it("identifies dominant pollutant when PM10 drives AQI", () => {
    const res = calculateCpcbAqi({
      pm2_5: 40,
      pm10: 310,
      nitrogen_dioxide: 30,
      sulphur_dioxide: 10,
      ozone: 40,
      carbon_monoxide_mg: 0.8,
    });
    expect(res.dominantPollutant).toBe("PM10");
    expect(res.aqi).toBeGreaterThan(200);
  });

  it("computes US AQI and category labels cleanly", () => {
    const us = calculateUsAqiFromPm25(135);
    expect(us).toBeGreaterThanOrEqual(200);
    expect(getUsCategoryLabel(us)).toBe("Very Unhealthy");
  });

  it("builds simulated smog report around 312 AQI", () => {
    const sim = buildSimulatedSmogReport(PRESET_LOCATIONS[0]!);
    expect(sim.cpcbAqi).toBe(312);
    expect(sim.isSimulated).toBe(true);
    expect(sim.bandKey).toBe("very_poor");
  });

  it("finds cleanest daytime outdoor window from hourly forecast", () => {
    const hourly: HourlyForecastPoint[] = [
      { time: "2026-11-24T07:00", hourLabel: "07:00", pm2_5: 160, pm10: 280, cpcbAqi: 330, usAqi: 220 },
      { time: "2026-11-24T08:00", hourLabel: "08:00", pm2_5: 150, pm10: 260, cpcbAqi: 323, usAqi: 215 },
      { time: "2026-11-24T13:00", hourLabel: "13:00", pm2_5: 75, pm10: 140, cpcbAqi: 150, usAqi: 161 },
      { time: "2026-11-24T14:00", hourLabel: "14:00", pm2_5: 70, pm10: 130, cpcbAqi: 134, usAqi: 158 },
      { time: "2026-11-24T15:00", hourLabel: "15:00", pm2_5: 72, pm10: 135, cpcbAqi: 140, usAqi: 159 },
      { time: "2026-11-24T21:00", hourLabel: "21:00", pm2_5: 165, pm10: 290, cpcbAqi: 334, usAqi: 225 },
    ];
    const win = findCleanestWindow(hourly);
    expect(win.startLabel).toBe("13:00");
    expect(win.endLabel).toBe("15:00");
    expect(win.avgCpcbAqi).toBeLessThan(150);
  });
});
