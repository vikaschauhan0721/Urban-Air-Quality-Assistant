import Link from "next/link";
import { Wind } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-[80dvh] flex items-center justify-center px-4">
      <div className="card-surface max-w-md w-full p-6 text-center space-y-4">
        <div className="mx-auto h-12 w-12 rounded-[var(--radius-control)] bg-[var(--aqi-accent-soft)] text-[var(--aqi-accent)] flex items-center justify-center">
          <Wind className="h-6 w-6" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold">Page not found (404)</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          This route does not exist. Return to your live air quality dashboard and daily action
          plan.
        </p>
        <Link
          href="/"
          className="inline-flex min-h-[44px] items-center justify-center rounded-[var(--radius-control)] bg-[var(--aqi-accent)] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-95"
        >
          Go to Saans Dashboard
        </Link>
      </div>
    </main>
  );
}
