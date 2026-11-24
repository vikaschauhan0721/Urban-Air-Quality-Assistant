"use client";

import {
  AlertTriangle,
  CheckCircle2,
  CloudSun,
  Leaf,
  OctagonAlert,
  ShieldAlert,
} from "lucide-react";
import { BAND_META } from "@/lib/theme";
import type { AqiBandKey, Language } from "@/lib/types";
import { Badge } from "./ui/primitives";

export function BandIcon({
  bandKey,
  className = "h-4 w-4",
}: {
  bandKey: AqiBandKey;
  className?: string;
}) {
  const iconName = BAND_META[bandKey].iconName;
  switch (iconName) {
    case "leaf":
      return <Leaf className={className} aria-hidden="true" />;
    case "check":
      return <CheckCircle2 className={className} aria-hidden="true" />;
    case "cloud-sun":
      return <CloudSun className={className} aria-hidden="true" />;
    case "shield-alert":
      return <ShieldAlert className={className} aria-hidden="true" />;
    case "alert-triangle":
      return <AlertTriangle className={className} aria-hidden="true" />;
    case "octagon-alert":
      return <OctagonAlert className={className} aria-hidden="true" />;
  }
}

export function AqiCategoryBadge({
  bandKey,
  label,
  language,
}: {
  bandKey: AqiBandKey;
  label?: string;
  language: Language;
}) {
  const meta = BAND_META[bandKey];
  const displayLabel = label ?? (language === "hi" ? meta.labelHi : meta.label);
  return (
    <Badge tone="accent" className="px-3.5 py-1.5 text-sm">
      <BandIcon bandKey={bandKey} className="h-4 w-4" />
      <span>{displayLabel}</span>
    </Badge>
  );
}
