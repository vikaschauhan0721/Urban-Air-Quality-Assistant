import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy — Saans",
  description: "How Saans handles your household profile, location queries, and AI requests.",
};

export default function PrivacyPage() {
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
          <Lock className="h-5 w-5 text-[var(--aqi-accent)]" aria-hidden="true" />
          <h1 className="text-2xl font-bold">Privacy Policy</h1>
        </div>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          Saans is built with a local-first privacy architecture. We do not maintain user
          accounts, tracking cookies, or a profile database.
        </p>

        <div className="space-y-3 text-sm text-[var(--text-primary)] leading-relaxed">
          <div>
            <h2 className="font-bold">1. Stored only on your device</h2>
            <p className="text-[var(--text-secondary)]">
              Your city, household composition, commute mode, cooking fuel, action check-offs,
              and cached offline air snapshot are stored exclusively in browser{" "}
              <code>localStorage</code>. You can clear everything anytime from Settings or Profile.
            </p>
          </div>
          <div>
            <h2 className="font-bold">2. Air Quality &amp; Geocoding requests</h2>
            <p className="text-[var(--text-secondary)]">
              Latitude and longitude coordinates are sent to Open-Meteo (Air Quality, Weather,
              and Geocoding APIs) solely to retrieve local pollutant readings and forecasts.
            </p>
          </div>
          <div>
            <h2 className="font-bold">3. Generative AI requests</h2>
            <p className="text-[var(--text-secondary)]">
              When generating Today&apos;s Plan or answering questions in Ask Saans, your
              non-identifying household attributes and air readings are processed transiently on
              the server and never stored permanently by Saans.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
