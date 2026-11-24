"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", type = "button", ...props }, ref) => {
    const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
      primary:
        "bg-[var(--aqi-accent)] text-white hover:opacity-95 shadow-sm disabled:opacity-50",
      secondary:
        "bg-[var(--bg-muted)] text-[var(--text-primary)] hover:opacity-90 disabled:opacity-50",
      outline:
        "border border-[var(--border-strong)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--bg-muted)] disabled:opacity-50",
      ghost:
        "bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-muted)] hover:text-[var(--text-primary)]",
    };

    const sizes: Record<NonNullable<ButtonProps["size"]>, string> = {
      sm: "min-h-[44px] px-3.5 text-sm rounded-[var(--radius-control)]",
      md: "min-h-[44px] px-4 py-2.5 text-sm font-medium rounded-[var(--radius-control)]",
      lg: "min-h-[48px] px-5 py-3 text-base font-semibold rounded-[var(--radius-control)]",
    };

    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-medium transition-all active:scale-[0.98] cursor-pointer disabled:cursor-not-allowed",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export function Card({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("card-surface p-5", className)} {...props}>
      {children}
    </div>
  );
}

export function Badge({
  className,
  children,
  tone = "neutral",
}: {
  className?: string;
  children: React.ReactNode;
  tone?: "neutral" | "accent" | "success" | "warning";
}) {
  const tones = {
    neutral:
      "bg-[var(--bg-muted)] text-[var(--text-secondary)] border border-[var(--border-subtle)]",
    accent:
      "bg-[var(--aqi-accent-soft)] text-[var(--aqi-badge-text)] border border-[var(--aqi-accent-border)]",
    success:
      "bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 border border-emerald-500/30",
    warning:
      "bg-amber-500/15 text-amber-900 dark:text-amber-200 border border-amber-500/30",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tracking-tight",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "animate-pulse rounded-[var(--radius-card)] bg-[var(--bg-muted)]",
        className
      )}
    />
  );
}

export function Switch({
  checked,
  onCheckedChange,
  id,
  label,
}: {
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  id: string;
  label: string;
}) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-11 w-16 shrink-0 items-center rounded-full p-1 transition-colors cursor-pointer",
        checked ? "bg-[var(--aqi-accent)]" : "bg-[var(--border-strong)]"
      )}
    >
      <span
        className={cn(
          "inline-block h-7 w-7 transform rounded-full bg-white shadow-sm transition-transform",
          checked ? "translate-x-7" : "translate-x-0"
        )}
      />
    </button>
  );
}
