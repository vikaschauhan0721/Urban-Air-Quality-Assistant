import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, ShieldAlert } from "lucide-react";

export const metadata: Metadata = {
  title: "Health & Safety Disclaimer — Saans",
  description: "Important respiratory safety boundaries and non-medical guidance notice for Saans.",
};

export default function DisclaimerPage() {
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
          <ShieldAlert className="h-5 w-5 text-[var(--aqi-accent)]" aria-hidden="true" />
          <h1 className="text-2xl font-bold">Health &amp; Safety Disclaimer</h1>
        </div>

        <div className="rounded-[var(--radius-panel)] border border-[var(--aqi-accent-border)] bg-[var(--aqi-accent-soft)] p-4 flex items-start gap-3 text-sm">
          <AlertTriangle className="h-5 w-5 shrink-0 text-[var(--aqi-accent)] mt-0.5" aria-hidden="true" />
          <p>
            <strong>Not medical advice.</strong> Saans provides general environmental and
            exposure-reduction information only and does not diagnose, treat, or replace a
            qualified physician.
          </p>
        </div>

        <div className="space-y-3 text-sm text-[var(--text-secondary)] leading-relaxed">
          <div>
            <h2 className="font-bold text-[var(--text-primary)]">When to seek urgent medical care</h2>
            <p>
              If anyone in your household experiences chest pain, persistent wheezing, severe
              shortness of breath, dizziness, or bluish lips/nails, seek emergency medical
              attention or consult a doctor immediately.
            </p>
          </div>
          <div>
            <h2 className="font-bold text-[var(--text-primary)]">Mask guidance for PM2.5</h2>
            <p>
              Woven cloth masks and loose surgical masks do not seal against fine PM2.5 winter
              smog particles. Saans recommends a well-fitted <strong>N95, FFP2, or KN95</strong>{" "}
              respirator for outdoor exposure in Poor or worse air, especially for sensitive
              adults. Young children or people with severe lung disease should consult a clinician
              for proper respirator sizing.
            </p>
          </div>
          <div>
            <h2 className="font-bold text-[var(--text-primary)]">Deterministic impact estimates</h2>
            <p>
              Indoor PM2.5 and CO₂ estimates use peer-reviewed physical reference models (room
              infiltration factors, CADR exponential decay, MoEFCC/DEFRA emission factors) and are
              marked with explicit High, Medium, or Low confidence ratings.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
