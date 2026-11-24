"use client";

import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-[80dvh] flex items-center justify-center px-4">
      <div className="card-surface max-w-md w-full p-6 text-center space-y-4">
        <div className="mx-auto h-12 w-12 rounded-[var(--radius-control)] bg-[var(--aqi-accent-soft)] text-[var(--aqi-accent)] flex items-center justify-center">
          <AlertTriangle className="h-6 w-6" aria-hidden="true" />
        </div>
        <h1 className="text-xl font-bold">Something went wrong</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          {error.message || "Saans encountered an unexpected rendering error."}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-[var(--radius-control)] bg-[var(--aqi-accent)] px-4 py-2 text-sm font-semibold text-white cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex min-h-[44px] items-center rounded-[var(--radius-control)] border border-[var(--border-strong)] px-4 py-2 text-sm font-semibold"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
