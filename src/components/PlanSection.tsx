"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertCircle,
  Check,
  ChevronRight,
  Clock,
  FlaskConical,
  Info,
  Leaf,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { MYTH_BUSTERS } from "@/lib/impact";
import { getCopy } from "@/lib/i18n";
import type { ActionCategory, Language, PlanAction, PlanResponse } from "@/lib/types";
import { cn } from "@/lib/cn";
import { Badge, Button, Card, Skeleton } from "./ui/primitives";
import { InfoTooltip } from "./ui/InfoTooltip";

export function PlanSection({
  plan,
  loading,
  error,
  onRetry,
  completedIds,
  onToggleComplete,
  onInspectImpact,
  language,
}: {
  plan: PlanResponse | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  completedIds: string[];
  onToggleComplete: (id: string) => void;
  onInspectImpact: (action: PlanAction) => void;
  language: Language;
}) {
  const [activeTab, setActiveTab] = useState<ActionCategory>("indoor");
  const prefersReduced = useReducedMotion();
  const t = getCopy(language);

  if (loading && !plan) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-44 w-full" />
        <Skeleton className="h-44 w-full" />
      </div>
    );
  }

  if (error && !plan) {
    return (
      <Card className="text-center py-8 space-y-3">
        <AlertCircle className="h-8 w-8 mx-auto text-[var(--aqi-accent)]" />
        <p className="font-semibold">{error}</p>
        <Button onClick={onRetry}>
          <RefreshCw className="h-4 w-4" />
          Retry plan
        </Button>
      </Card>
    );
  }

  if (!plan) return null;

  const actions = plan.actions;
  const tabActions = actions.filter((a) => a.category === activeTab);
  const completedCount = actions.filter((a) => completedIds.includes(a.id)).length;
  const totalCount = Math.max(1, actions.length);
  const progressPct = Math.round((completedCount / totalCount) * 100);

  const completedItems = actions.filter((a) => completedIds.includes(a.id));
  const totalPm25Reduced = completedItems.reduce(
    (sum, a) => sum + a.impact.pm25DeltaUgM3,
    0
  );
  const totalCo2Saved = Number(
    completedItems.reduce((sum, a) => sum + a.impact.co2SavedKg, 0).toFixed(1)
  );

  // Progress ring geometry
  const ringR = 24;
  const ringC = 2 * Math.PI * ringR;
  const ringOffset = ringC * (1 - completedCount / totalCount);

  return (
    <div className="space-y-5">
      {/* Running "Air You Protected" Tally + Progress Ring */}
      <Card className="hero-surface p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 60 60" className="h-16 w-16 -rotate-90" aria-hidden="true">
                <circle
                  cx="30"
                  cy="30"
                  r={ringR}
                  fill="none"
                  stroke="var(--border-strong)"
                  strokeWidth="6"
                />
                <motion.circle
                  cx="30"
                  cy="30"
                  r={ringR}
                  fill="none"
                  stroke="var(--aqi-accent)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={ringC}
                  animate={{ strokeDashoffset: ringOffset }}
                  transition={{ duration: prefersReduced ? 0 : 0.45 }}
                />
              </svg>
              <span className="absolute text-xs font-bold tabular-nums">
                {progressPct}%
              </span>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight">{t.plan.title}</h1>
                <Badge tone="accent">
                  <Sparkles className="h-3 w-3" aria-hidden="true" />
                  {plan.planSource === "gemini" ? "Gemini + Physics" : "Smart Rules + Physics"}
                </Badge>
                <Badge tone="success">Free &amp; Low-Cost First</Badge>
              </div>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                {plan.focusNote}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="rounded-[var(--radius-control)] bg-[var(--bg-surface)] border border-[var(--border-subtle)] px-3.5 py-2 text-center">
              <p className="text-[11px] text-[var(--text-muted)] flex items-center justify-center gap-1">
                {t.plan.airProtected}
                <InfoTooltip
                  label="Deterministic PM2.5 math"
                  explanation="Computed from documented room infiltration (I_f) and filter CADR decay constants—never estimated by the AI."
                />
              </p>
              <p
                data-testid="protected-pm25-tally"
                className="text-lg font-extrabold tabular-nums text-[var(--aqi-accent)]"
              >
                -{totalPm25Reduced} µg/m³
              </p>
            </div>
            <div className="rounded-[var(--radius-control)] bg-[var(--bg-surface)] border border-[var(--border-subtle)] px-3.5 py-2 text-center">
              <p className="text-[11px] text-[var(--text-muted)]">{t.plan.co2Saved}</p>
              <p
                data-testid="protected-co2-tally"
                className="text-lg font-extrabold tabular-nums text-emerald-600 dark:text-emerald-400"
              >
                {totalCo2Saved} kg
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* 3 Category Tabs */}
      <div
        role="tablist"
        aria-label="Action plan categories"
        className="grid grid-cols-3 gap-2 rounded-[var(--radius-panel)] bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-1.5"
      >
        {(
          [
            ["routines", t.plan.tabs.routines],
            ["indoor", t.plan.tabs.indoor],
            ["swaps", t.plan.tabs.swaps],
          ] as Array<[ActionCategory, string]>
        ).map(([cat, label]) => {
          const isActive = activeTab === cat;
          const catDone = actions.filter(
            (a) => a.category === cat && completedIds.includes(a.id)
          ).length;
          const catTotal = actions.filter((a) => a.category === cat).length;

          return (
            <button
              key={cat}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(cat)}
              className={cn(
                "relative min-h-[44px] rounded-xl px-2.5 py-2 text-xs sm:text-sm font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5 text-center",
                isActive
                  ? "text-white"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="plan-tab-pill"
                  transition={{
                    type: "spring",
                    stiffness: 420,
                    damping: 32,
                    duration: prefersReduced ? 0 : undefined,
                  }}
                  className="absolute inset-0 rounded-xl bg-[var(--aqi-accent)]"
                />
              )}
              <span className="relative z-10 leading-tight">{label}</span>
              <span
                className={cn(
                  "relative z-10 text-[11px] tabular-nums rounded-full px-1.5 py-0.5",
                  isActive ? "bg-white/20 text-white" : "bg-[var(--bg-muted)]"
                )}
              >
                {catDone}/{catTotal}
              </span>
            </button>
          );
        })}
      </div>

      {/* Action Cards */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={prefersReduced ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={prefersReduced ? undefined : { opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
          className="space-y-3"
        >
          {tabActions.map((action) => {
            const done = completedIds.includes(action.id);
            return (
              <motion.div
                key={action.id}
                layout={!prefersReduced}
                className={cn(
                  "card-surface p-4 sm:p-5 transition-colors",
                  done && "border-[var(--aqi-accent-border)] bg-[var(--aqi-accent-soft)]"
                )}
              >
                <div className="flex items-start gap-3.5">
                  <motion.button
                    type="button"
                    aria-pressed={done}
                    aria-label={`${done ? "Unmark" : "Complete"} ${action.title}`}
                    data-testid={`action-check-${action.id}`}
                    whileTap={prefersReduced ? undefined : { scale: 0.88 }}
                    onClick={() => onToggleComplete(action.id)}
                    className={cn(
                      "mt-0.5 h-11 w-11 shrink-0 rounded-2xl border-2 flex items-center justify-center transition-colors cursor-pointer",
                      done
                        ? "bg-[var(--aqi-accent)] border-[var(--aqi-accent)] text-white"
                        : "border-[var(--border-strong)] bg-[var(--bg-canvas)] text-transparent hover:border-[var(--aqi-accent)]"
                    )}
                  >
                    <Check className="h-5 w-5" strokeWidth={2.75} />
                  </motion.button>

                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h3
                          className={cn(
                            "text-base font-bold leading-snug",
                            done && "line-through opacity-75"
                          )}
                        >
                          {action.title}
                        </h3>
                        <p className="text-xs font-medium text-[var(--aqi-accent)] mt-0.5">
                          {action.headline}
                        </p>
                      </div>
                      <Badge tone="accent" className="tabular-nums shrink-0">
                        {action.impact.chipLabel}
                      </Badge>
                    </div>

                    <p className="text-sm text-[var(--text-primary)] leading-relaxed">
                      {action.howToDoIt}
                    </p>

                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed flex items-start gap-1.5 bg-[var(--bg-canvas)] rounded-xl p-2.5 border border-[var(--border-subtle)]">
                      <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-[var(--aqi-accent)]" />
                      <span>{action.whyItWorks}</span>
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
                        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--bg-muted)] px-2.5 py-1">
                          <Clock className="h-3 w-3" />
                          {action.effort}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--bg-muted)] px-2.5 py-1">
                          <Leaf className="h-3 w-3" />
                          {action.costLabel}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => onInspectImpact(action)}
                        data-testid={`inspect-impact-${action.id}`}
                        className="min-h-[44px] inline-flex items-center gap-1 px-3 rounded-xl text-xs font-semibold text-[var(--aqi-accent)] hover:bg-[var(--aqi-accent-soft)] cursor-pointer"
                      >
                        <FlaskConical className="h-3.5 w-3.5" />
                        {t.plan.seeImpact}
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* Myth Busters Strip */}
      <Card className="space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-[var(--aqi-accent)]" aria-hidden="true" />
          <h2 className="text-lg font-bold">{t.plan.mythBusters}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {MYTH_BUSTERS.map((m) => (
            <div
              key={m.id}
              className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-3.5 space-y-1.5"
            >
              <div className="flex items-center justify-between gap-2">
                <Badge tone={m.verdict === "Myth" ? "warning" : "neutral"}>
                  {m.verdict}
                </Badge>
                <span className="text-[11px] font-medium text-[var(--text-muted)]">
                  Confidence: {m.confidence}
                </span>
              </div>
              <p className="text-sm font-bold leading-snug">
                “{language === "hi" ? m.mythHi : m.myth}”
              </p>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {language === "hi" ? m.truthHi : m.truth}
              </p>
              <p className="text-[11px] text-[var(--text-muted)]">Source: {m.evidence}</p>
            </div>
          ))}
        </div>
      </Card>

      <p className="text-xs text-[var(--text-muted)] px-1">{plan.safetyNote}</p>
    </div>
  );
}
