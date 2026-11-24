"use client";

import { useState } from "react";
import { HelpCircle } from "lucide-react";

export function InfoTooltip({
  label,
  explanation,
}: {
  label: string;
  explanation: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-flex items-center">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setOpen(false)}
        aria-expanded={open}
        aria-label={`Explain ${label}`}
        className="inline-flex h-6 w-6 items-center justify-center rounded-full text-[var(--text-muted)] hover:bg-[var(--bg-muted)] hover:text-[var(--text-primary)] cursor-pointer"
      >
        <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute left-0 top-7 z-40 w-64 rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-[var(--bg-surface)] p-2.5 text-xs font-normal leading-relaxed text-[var(--text-primary)] shadow-[var(--shadow-modal)]"
        >
          <strong className="block font-semibold mb-0.5">{label}</strong>
          {explanation}
        </span>
      )}
    </span>
  );
}
