"use client";

import { AlertTriangle, Languages, Lock, RotateCcw, SlidersHorizontal, Users } from "lucide-react";
import { getCopy } from "@/lib/i18n";
import type { AqiScale, Language, UserProfile } from "@/lib/types";
import { cn } from "@/lib/cn";
import { Button, Card, Switch } from "./ui/primitives";

export function ProfileControls({
  profile,
  simulateSmog,
  onToggleSimulator,
  onChangeScale,
  onChangeLanguage,
  onLoadDemoHousehold,
  onOpenOnboarding,
  onResetAll,
}: {
  profile: UserProfile;
  simulateSmog: boolean;
  onToggleSimulator: (next: boolean) => void;
  onChangeScale: (scale: AqiScale) => void;
  onChangeLanguage: (lang: Language) => void;
  onLoadDemoHousehold: () => void;
  onOpenOnboarding: () => void;
  onResetAll: () => void;
}) {
  const t = getCopy(profile.language);

  return (
    <div className="space-y-4">
      <Card className="space-y-5">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-[var(--aqi-accent)]" aria-hidden="true" />
            {t.profile.title}
          </h1>
          <Button variant="outline" size="sm" onClick={onOpenOnboarding}>
            {t.profile.editOnboarding}
          </Button>
        </div>

        {/* Smog Simulator Toggle */}
        <div className="rounded-2xl border border-[var(--aqi-accent-border)] bg-[var(--aqi-accent-soft)] p-4 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-bold flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-[var(--aqi-accent)]" aria-hidden="true" />
              {t.profile.simulatorLabel}
            </p>
            <p className="text-xs text-[var(--text-secondary)]">
              {t.profile.simulatorHint}
            </p>
          </div>
          <Switch
            id="smog-simulator-switch"
            checked={simulateSmog}
            onCheckedChange={onToggleSimulator}
            label="Toggle Winter Smog Simulator"
          />
        </div>

        {/* One-Tap Demo Family */}
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold flex items-center gap-1.5">
              <Users className="h-4 w-4 text-[var(--aqi-accent)]" aria-hidden="true" />
              {t.profile.demoFamily}
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              New Delhi (Rohini) · 2 adults, 1 child, 1 elderly, asthma, car commute, no purifier.
            </p>
          </div>
          <Button variant="secondary" onClick={onLoadDemoHousehold} data-testid="load-demo-btn">
            Load Demo Household
          </Button>
        </div>

        {/* Scale & Language Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3.5 space-y-2">
            <p className="text-xs font-semibold text-[var(--text-muted)]">AQI Scale</p>
            <div className="grid grid-cols-2 gap-2">
              {(["cpcb", "us"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onChangeScale(s)}
                  className={cn(
                    "min-h-[44px] rounded-xl text-xs font-bold border cursor-pointer",
                    profile.aqiScale === s
                      ? "bg-[var(--aqi-accent)] text-white border-[var(--aqi-accent)]"
                      : "bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-subtle)]"
                  )}
                >
                  {s === "cpcb" ? "India CPCB" : "US EPA AQI"}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3.5 space-y-2">
            <p className="text-xs font-semibold text-[var(--text-muted)] flex items-center gap-1">
              <Languages className="h-3.5 w-3.5" />
              Language / भाषा
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  ["en", "English"],
                  ["hi", "हिन्दी"],
                ] as const
              ).map(([code, label]) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => onChangeLanguage(code)}
                  className={cn(
                    "min-h-[44px] rounded-xl text-xs font-bold border cursor-pointer",
                    profile.language === code
                      ? "bg-[var(--aqi-accent)] text-white border-[var(--aqi-accent)]"
                      : "bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-subtle)]"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Current Household Snapshot */}
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-4 text-sm space-y-1.5">
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Saved Profile Summary
          </p>
          <p>
            <strong>Location:</strong> {profile.location.name} ({profile.location.latitude.toFixed(2)},{" "}
            {profile.location.longitude.toFixed(2)})
          </p>
          <p>
            <strong>Household:</strong> {profile.household.adults} adults,{" "}
            {profile.household.children} children, {profile.household.elderly} elderly
            {profile.household.asthmaOrRespiratory ? " · Asthma/Respiratory" : ""}
            {profile.household.heartCondition ? " · Heart condition" : ""}
          </p>
          <p>
            <strong>Home & Commute:</strong> {profile.lifestyle.commute.replace("_", "/")},{" "}
            {profile.lifestyle.hasPurifier ? "Purifier" : "No purifier"},{" "}
            {profile.lifestyle.leakyWindows ? "Leaky drafts" : "Sealed"},{" "}
            {profile.lifestyle.cookingFuel.toUpperCase()}, {profile.lifestyle.budget} budget
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <p className="text-xs text-[var(--text-muted)] flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-[var(--aqi-accent)]" />
            {t.profile.privacy}
          </p>
          <Button variant="ghost" size="sm" onClick={onResetAll}>
            <RotateCcw className="h-4 w-4" />
            Reset local data
          </Button>
        </div>
      </Card>
    </div>
  );
}
