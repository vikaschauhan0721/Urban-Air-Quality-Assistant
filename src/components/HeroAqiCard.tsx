"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Clock, Database, Droplets, MapPin, Thermometer, Wind } from "lucide-react";
import { getCpcbBand, getUsBandKey } from "@/lib/aqi";
import type { AirQualityReport, AqiScale, Language } from "@/lib/types";
import { AqiCategoryBadge } from "./AqiBadge";
import { InfoTooltip } from "./ui/InfoTooltip";

export function HeroAqiCard({
  air,
  scale,
  language,
  verdictOverride,
}: {
  air: AirQualityReport;
  scale: AqiScale;
  language: Language;
  verdictOverride?: string;
}) {
  const prefersReduced = useReducedMotion();
  const targetAqi = scale === "cpcb" ? air.cpcbAqi : air.usAqi;
  const bandKey = scale === "cpcb" ? air.bandKey : getUsBandKey(air.usAqi);
  const cpcbBand = getCpcbBand(air.cpcbAqi);

  const categoryLabel =
    scale === "cpcb"
      ? language === "hi"
        ? cpcbBand.labelHi
        : air.categoryLabel
      : air.usCategoryLabel;

  const verdict =
    verdictOverride ??
    (language === "hi" ? cpcbBand.verdictHi : air.verdict);

  const [displayValue, setDisplayValue] = useState(targetAqi);

  useEffect(() => {
    if (prefersReduced) {
      return;
    }
    const startVal = displayValue;
    const startTime = performance.now();
    const duration = 650;
    let raf = 0;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(startVal + (targetAqi - startVal) * eased));
      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetAqi, prefersReduced]);

  const shownValue = prefersReduced ? targetAqi : displayValue;

  const pct = Math.min(1, Math.max(0.04, targetAqi / 500));
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - pct * 0.78);

  const sourceLabel =
    air.source === "simulated"
      ? "Simulated Winter Smog (AQI 312)"
      : air.source === "fixture"
      ? "Offline Regional Baseline"
      : air.source === "cache"
      ? "Open-Meteo (10m cache)"
      : "Open-Meteo Live";

  const updatedTime = air.fetchedAt ? air.fetchedAt.slice(11, 16) + " UTC" : "";

  return (
    <section
      aria-live="polite"
      className="hero-surface p-5 sm:p-6 relative"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          {/* SVG Animated Gauge */}
          <div className="relative h-36 w-36 shrink-0 flex items-center justify-center">
            <svg
              viewBox="0 0 140 140"
              className="h-full w-full -rotate-[230deg]"
              aria-hidden="true"
            >
              <circle
                cx="70"
                cy="70"
                r={radius}
                fill="none"
                stroke="var(--border-strong)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${circumference * 0.78} ${circumference}`}
              />
              <motion.circle
                cx="70"
                cy="70"
                r={radius}
                fill="none"
                stroke="var(--aqi-accent)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${circumference * 0.78} ${circumference}`}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: prefersReduced ? 0 : 0.75, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pt-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                {scale === "cpcb" ? "CPCB AQI" : "US AQI"}
              </span>
              <span
                data-testid="hero-aqi-value"
                className="text-4xl font-extrabold tracking-tight tabular-nums leading-none mt-0.5"
              >
                {shownValue}
              </span>
              <span className="text-[11px] text-[var(--text-muted)] mt-1">
                {air.dominantPollutant}
              </span>
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <AqiCategoryBadge
                bandKey={bandKey}
                label={categoryLabel}
                language={language}
              />
              <InfoTooltip
                label={scale === "cpcb" ? "India CPCB AQI" : "US EPA AQI"}
                explanation="0–50 Good, 51–100 Satisfactory, 101–200 Moderate, 201–300 Poor, 301–400 Very Poor, 401–500 Severe. Computed as the highest pollutant sub-index."
              />
              <span className="inline-flex items-center gap-1 text-xs font-medium text-[var(--text-secondary)]">
                <MapPin className="h-3.5 w-3.5 text-[var(--aqi-accent)]" aria-hidden="true" />
                {air.location.name}
              </span>
            </div>

            <p className="text-base sm:text-lg font-semibold leading-snug text-[var(--text-primary)] max-w-xl">
              {verdict}
            </p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-medium text-[var(--text-secondary)] pt-0.5">
              <span className="inline-flex items-center gap-1 tabular-nums">
                <Thermometer className="h-3.5 w-3.5 text-[var(--aqi-accent)]" aria-hidden="true" />
                {air.weather.temperatureC}°C · {air.weather.conditionLabel}
              </span>
              <span className="inline-flex items-center gap-1 tabular-nums">
                <Droplets className="h-3.5 w-3.5 text-[var(--aqi-accent)]" aria-hidden="true" />
                {air.weather.humidityPct}% RH
              </span>
              <span className="inline-flex items-center gap-1 tabular-nums">
                <Wind className="h-3.5 w-3.5 text-[var(--aqi-accent)]" aria-hidden="true" />
                {air.weather.windKmh} km/h
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[var(--text-muted)] pt-1 border-t border-[var(--border-subtle)]">
              <span className="inline-flex items-center gap-1">
                <Database className="h-3 w-3" aria-hidden="true" />
                Source: {sourceLabel}
              </span>
              {updatedTime && (
                <span className="inline-flex items-center gap-1 tabular-nums">
                  <Clock className="h-3 w-3" aria-hidden="true" />
                  Last updated: {updatedTime}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
