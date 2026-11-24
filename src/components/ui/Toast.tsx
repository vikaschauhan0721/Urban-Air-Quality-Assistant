"use client";

import { useEffect } from "react";
import { CheckCircle2, Info, X } from "lucide-react";
import { cn } from "@/lib/cn";

export interface ToastMessage {
  id: number;
  text: string;
  tone?: "info" | "success";
}

export function ToastBanner({
  toast,
  onDismiss,
}: {
  toast: ToastMessage | null;
  onDismiss: () => void;
}) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(onDismiss, 3200);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-20 md:bottom-6 right-4 left-4 md:left-auto z-50 md:max-w-sm"
    >
      <div
        className={cn(
          "flex items-center justify-between gap-3 rounded-[var(--radius-panel)] border px-4 py-3 text-sm font-medium shadow-[var(--shadow-modal)] bg-[var(--bg-surface)] text-[var(--text-primary)]",
          toast.tone === "success"
            ? "border-emerald-500/40"
            : "border-[var(--aqi-accent-border)]"
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {toast.tone === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          ) : (
            <Info className="h-4 w-4 shrink-0 text-[var(--aqi-accent)]" aria-hidden="true" />
          )}
          <span className="truncate">{toast.text}</span>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss notification"
          className="h-8 w-8 shrink-0 rounded-[var(--radius-control)] inline-flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--bg-muted)] cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
