"use client";

import { motion } from "framer-motion";
import { ArrowRight, BookOpen, CheckCircle2, FlaskConical, ShieldCheck, X } from "lucide-react";
import { MYTH_BUSTERS } from "@/lib/impact";
import type { Language, PlanAction } from "@/lib/types";
import { Badge, Button } from "./ui/primitives";

export function ImpactExplainerModal({
  action,
  language,
  onClose,
}: {
  action: PlanAction | null;
  language: Language;
  onClose: () => void;
}) {
  if (!action) return null;

  const { impact } = action;
  const maxVal = Math.max(impact.indoorPm25Before, impact.indoorPm25After, 50);
  const beforePct = Math.round((impact.indoorPm25Before / maxVal) * 100);
  const afterPct = Math.round((impact.indoorPm25After / maxVal) * 100);
  const relevantMyth = MYTH_BUSTERS[0]!;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="impact-modal-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-sm p-0 sm:p-4"
    >
      <motion.div
        initial={{ opacity: 1, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.14 }}
        className="w-full max-w-lg max-h-[92dvh] overflow-y-auto bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-t-[24px] sm:rounded-[24px] shadow-2xl p-5 sm:p-6 space-y-4"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--aqi-accent)]">
              <FlaskConical className="h-3.5 w-3.5" aria-hidden="true" />
              Deterministic Impact Explainer
            </span>
            <h2 id="impact-modal-title" className="text-lg font-bold mt-1">
              {action.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close impact explainer"
            className="min-h-[44px] min-w-[44px] rounded-full inline-flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--bg-muted)] cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Before -> After Card */}
        <div className="hero-surface p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-[var(--text-secondary)]">
              Before → After Estimate
            </span>
            <Badge
              tone={
                impact.confidence === "High"
                  ? "success"
                  : impact.confidence === "Medium"
                  ? "accent"
                  : "neutral"
              }
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              {impact.confidence} Confidence
            </Badge>
          </div>

          <p data-testid="impact-before-after" className="text-base font-bold tabular-nums">
            {impact.beforeAfterLabel}
          </p>

          <div className="space-y-2 pt-1">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[var(--text-secondary)]">Before action</span>
                <span className="font-bold tabular-nums">{impact.indoorPm25Before} µg/m³</span>
              </div>
              <div className="h-2.5 rounded-full bg-[var(--bg-muted)] overflow-hidden">
                <div
                  className="h-full rounded-full bg-rose-500"
                  style={{ width: `${Math.max(10, beforePct)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[var(--text-secondary)]">
                  After ~{impact.durationMinutes} min
                </span>
                <span className="font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                  {impact.indoorPm25After} µg/m³
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-[var(--bg-muted)] overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${Math.max(8, afterPct)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-medium text-[var(--text-secondary)] tabular-nums">
            <span className="inline-flex items-center gap-1">
              <ArrowRight className="h-3.5 w-3.5 text-[var(--aqi-accent)]" />
              {impact.pm25ReductionPct}% particle drop
            </span>
            {impact.co2SavedKg > 0 && (
              <span>• {impact.co2SavedKg} kg CO₂ saved/day</span>
            )}
          </div>
        </div>

        {/* Calculation Method */}
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-4 space-y-1.5">
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5 text-[var(--aqi-accent)]" />
            Method: {impact.methodTitle}
          </p>
          <p className="text-sm text-[var(--text-primary)] leading-relaxed">
            {impact.methodDetails}
          </p>
          <p className="text-xs text-[var(--text-muted)] pt-1">
            Reference: {impact.sourceCitation}
          </p>
        </div>

        {/* Highlighted Myth Buster */}
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-4 space-y-1.5">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-300 flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" />
            Myth Buster
          </p>
          <p className="text-sm font-semibold">
            “{language === "hi" ? relevantMyth.mythHi : relevantMyth.myth}”
          </p>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            {language === "hi" ? relevantMyth.truthHi : relevantMyth.truth}
          </p>
        </div>

        <Button className="w-full" onClick={onClose}>
          Got it
        </Button>
      </motion.div>
    </div>
  );
}
