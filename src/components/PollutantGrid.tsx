"use client";

import type { Language, PollutantBreakdown } from "@/lib/types";
import { Card } from "./ui/primitives";

interface PollutantMeta {
  key: keyof PollutantBreakdown;
  label: string;
  unit: string;
  maxSafe: number;
  whoGuide: string;
  plain: string;
  plainHi: string;
}

const POLLUTANTS: PollutantMeta[] = [
  {
    key: "pm2_5",
    label: "PM2.5",
    unit: "µg/m³",
    maxSafe: 60,
    whoGuide: "CPCB 24h limit: 60",
    plain: "Tiny soot particles that reach deep into lungs",
    plainHi: "महीन कालिख के कण जो फेफड़ों में गहराई तक जाते हैं",
  },
  {
    key: "pm10",
    label: "PM10",
    unit: "µg/m³",
    maxSafe: 100,
    whoGuide: "CPCB 24h limit: 100",
    plain: "Coarse road & construction dust irritating airways",
    plainHi: "सड़क व निर्माण की धूल जो गले-नाक में जलन करती है",
  },
  {
    key: "nitrogen_dioxide",
    label: "NO₂",
    unit: "µg/m³",
    maxSafe: 80,
    whoGuide: "CPCB 24h limit: 80",
    plain: "Traffic & gas-stove exhaust that inflames bronchi",
    plainHi: "गाड़ियों और गैस चूल्हे का धुआँ जो सांस नली में सूजन लाता है",
  },
  {
    key: "ozone",
    label: "O₃",
    unit: "µg/m³",
    maxSafe: 100,
    whoGuide: "CPCB 8h limit: 100",
    plain: "Sun-baked smog gas peaking in afternoon heat",
    plainHi: "दोपहर की धूप में बनने वाली स्मॉग गैस",
  },
  {
    key: "sulphur_dioxide",
    label: "SO₂",
    unit: "µg/m³",
    maxSafe: 80,
    whoGuide: "CPCB 24h limit: 80",
    plain: "Diesel & industrial combustion gas",
    plainHi: "डीज़ल व औद्योगिक ईंधन से निकलने वाली गैस",
  },
  {
    key: "carbon_monoxide_mg",
    label: "CO",
    unit: "mg/m³",
    maxSafe: 2.0,
    whoGuide: "CPCB 8h limit: 2.0",
    plain: "Incomplete combustion gas from idling engines",
    plainHi: "खड़ी गाड़ियों और अधूरे दहन से निकलने वाली गैस",
  },
];

export function PollutantGrid({
  pollutants,
  language,
  title,
  subtitle,
}: {
  pollutants: PollutantBreakdown;
  language: Language;
  title: string;
  subtitle: string;
}) {
  return (
    <Card>
      <div className="mb-4">
        <h2 className="text-lg font-bold tracking-tight">{title}</h2>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">{subtitle}</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {POLLUTANTS.map((p) => {
          const val = pollutants[p.key];
          const ratio = Math.min(1, val / (p.maxSafe * 2));
          const elevated = val > p.maxSafe;

          return (
            <div
              key={p.key}
              className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3.5 flex flex-col justify-between gap-2"
            >
              <div className="flex items-baseline justify-between gap-1">
                <span className="text-sm font-bold">{p.label}</span>
                <span className="text-xs text-[var(--text-muted)]">{p.unit}</span>
              </div>

              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold tabular-nums">{val}</span>
                {elevated && (
                  <span className="text-[11px] font-semibold text-[var(--aqi-accent)]">
                    High
                  </span>
                )}
              </div>

              <div className="h-1.5 w-full rounded-full bg-[var(--bg-muted)] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.max(8, Math.round(ratio * 100))}%`,
                    backgroundColor: elevated ? "var(--aqi-accent)" : "#10b981",
                  }}
                />
              </div>

              <p className="text-[11px] leading-snug text-[var(--text-secondary)]">
                {language === "hi" ? p.plainHi : p.plain}
              </p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
