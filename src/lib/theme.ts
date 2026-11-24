import type { AqiBandKey } from "./types";

export interface BandVisualMeta {
  key: AqiBandKey;
  label: string;
  labelHi: string;
  rangeCpcb: string;
  accentHex: string;
  iconName: "leaf" | "check" | "cloud-sun" | "shield-alert" | "alert-triangle" | "octagon-alert";
}

export const BAND_META: Record<AqiBandKey, BandVisualMeta> = {
  good: {
    key: "good",
    label: "Good",
    labelHi: "अच्छी",
    rangeCpcb: "0–50",
    accentHex: "#15803d",
    iconName: "leaf",
  },
  satisfactory: {
    key: "satisfactory",
    label: "Satisfactory",
    labelHi: "संतोषजनक",
    rangeCpcb: "51–100",
    accentHex: "#0f766e",
    iconName: "check",
  },
  moderate: {
    key: "moderate",
    label: "Moderate",
    labelHi: "मध्यम",
    rangeCpcb: "101–200",
    accentHex: "#b45309",
    iconName: "cloud-sun",
  },
  poor: {
    key: "poor",
    label: "Poor",
    labelHi: "खराब",
    rangeCpcb: "201–300",
    accentHex: "#c2410c",
    iconName: "shield-alert",
  },
  very_poor: {
    key: "very_poor",
    label: "Very Poor",
    labelHi: "बहुत खराब",
    rangeCpcb: "301–400",
    accentHex: "#b91c1c",
    iconName: "alert-triangle",
  },
  severe: {
    key: "severe",
    label: "Severe",
    labelHi: "गंभीर",
    rangeCpcb: "401–500",
    accentHex: "#881337",
    iconName: "octagon-alert",
  },
};
