import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, SlidersHorizontal } from "lucide-react";

export const metadata: Metadata = {
  title: "Settings & Data Attribution — Saans",
  description: "Configure AQI scale, language, smog simulator, and review data sources.",
};

export default function SettingsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8 space-y-6">
      <Link
        href="/"
        className="inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-[var(--aqi-accent)] hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Saans Dashboard
      </Link>

      <section className="card-surface p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <SlidersHorizontal className="h-5 w-5 text-[var(--aqi-accent)]" aria-hidden="true" />
          <h1 className="text-2xl font-bold">Settings &amp; Data Attribution</h1>
        </div>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          All live preferences (AQI Scale, English/Hindi, Winter Smog Simulator, and Household
          Setup) are saved locally in your browser and managed directly inside the{" "}
          <Link href="/" className="font-semibold text-[var(--aqi-accent)] underline">
            Profile tab
          </Link>{" "}
          on the main dashboard.
        </p>

        <div className="rounded-[var(--radius-panel)] border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-4 space-y-2 text-sm">
          <h2 className="font-bold">Data Sources &amp; Methodology</h2>
          <ul className="list-disc pl-5 space-y-1 text-[var(--text-secondary)]">
            <li>
              <strong>Air Quality &amp; Weather:</strong> Open-Meteo Air Quality &amp; Forecast APIs
              (10-minute server cache with offline regional fixtures fallback).
            </li>
            <li>
              <strong>AQI Calculation:</strong> Indian Central Pollution Control Board (CPCB NAQI)
              breakpoints by default, with optional US EPA AQI view.
            </li>
            <li>
              <strong>Impact Math:</strong> Deterministic indoor infiltration, CADR decay, and
              MoEFCC/DEFRA emission constants.
            </li>
          </ul>
        </div>

        <div className="flex flex-wrap gap-4 pt-2 text-sm font-semibold">
          <Link href="/privacy" className="text-[var(--aqi-accent)] hover:underline">
            Privacy Policy
          </Link>
          <Link href="/disclaimer" className="text-[var(--aqi-accent)] hover:underline">
            Health &amp; Safety Disclaimer
          </Link>
        </div>
      </section>
    </main>
  );
}
