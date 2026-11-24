---
name: air-quality-domain
description: Use when implementing Indian CPCB or US EPA AQI calculations, pollutant health guidance, the typed action catalogue, deterministic indoor PM2.5 or CO2 impact math, or respiratory safety guardrails in Saans.
---

# Air Quality Domain Skill

## 1. Indian CPCB AQI Bands & Breakpoints
Default to Indian National Air Quality Index (CPCB NAQI) computed as `max(subIndex)` across available pollutants, with `dominantPollutant` reported alongside:

| Category | CPCB AQI | PM2.5 (µg/m³, 24h) | PM10 (µg/m³, 24h) | NO2 (µg/m³, 24h) | SO2 (µg/m³, 24h) | O3 (µg/m³, 8h) | CO (mg/m³, 8h) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Good | 0–50 | 0–30 | 0–50 | 0–40 | 0–40 | 0–50 | 0–1.0 |
| Satisfactory | 51–100 | 31–60 | 51–100 | 41–80 | 41–80 | 51–100 | 1.1–2.0 |
| Moderate | 101–200 | 61–90 | 101–250 | 81–180 | 81–380 | 101–168 | 2.1–10 |
| Poor | 201–300 | 91–120 | 251–350 | 181–280 | 381–800 | 169–208 | 10.1–17 |
| Very Poor | 301–400 | 121–250 | 351–430 | 281–400 | 801–1600 | 209–748 | 17.1–34 |
| Severe | 401–500 | 251+ | 431+ | 401+ | 1601+ | 749+ | 34.1+ |

- Convert Open-Meteo `carbon_monoxide` (µg/m³) to `mg/m³` by dividing by `1000` before computing the CPCB CO sub-index.
- Support an optional **US AQI** toggle using Open-Meteo `us_aqi` (or US EPA PM2.5 linear interpolation fallback when simulated).

## 2. Health-Group Guidance
Tailor advisories for four household groups:
- **Adults**: normal outdoor activity in Good/Satisfactory; reduce prolonged exertion in Moderate/Poor; avoid outdoor workouts and wear N95/FFP2 in Very Poor/Severe.
- **Children**: airways inhale more air per kg body weight; move PE/play indoors at Poor+ (AQI > 200).
- **Elderly (60+)**: elevated cardiovascular stress during PM2.5 spikes; avoid early-morning winter inversion walks.
- **Asthma / Heart / Respiratory**: carry prescribed reliever inhaler; keep windows sealed at Poor+; consult a doctor immediately if experiencing wheezing, chest tightness, or shortness of breath.

## 3. Typed Action Catalogue & Deterministic Impact Constants
Every action belongs to `routines` | `indoor` | `swaps` and carries `effort`, `costTier` (`free` | `low` | `moderate`), `tags`, and `impactModel` parameters.
- **Indoor PM2.5 Infiltration ($I_f$)**:
  - Typical leaky Indian urban apartment: $I_f \approx 0.78$; after damp-towel/weatherstrip gap sealing: $I_f \approx 0.52$ (Ref: Stephens 2015; IIT Delhi indoor-outdoor winter PM2.5 studies).
- **Filtration Dilution**:
  - Commercial HEPA purifier (CADR ~300 m³/h) or DIY Box-Fan + MERV-13 Corsi-Rosenthal filter (CADR ~250 m³/h) in a 35 m³ bedroom ($\text{ACH} \approx 7.1\text{–}8.5\text{ h}^{-1}$) reduces indoor PM2.5 via exponential decay $C(t) = C_{ss} + (C_0 - C_{ss})e^{-(ACH + k_d)t}$ over 40–45 minutes.
- **Source Reduction**:
  - Wet mopping removes settled coarse/fine dust resuspension (~15% indoor PM2.5 drop; Medium confidence).
  - Kitchen exhaust + induction swap avoids LPG/biomass NO2 & PM2.5 cooking spikes (~40–85 µg/m³ peak avoidance; High/Medium confidence).
- **Transport CO₂ Savings** (kg CO₂ per 10 km round-trip, MoEFCC / DEFRA):
  - Car → Metro/Bus: `1.70 kg CO₂` saved (`1.92 - 0.22`).
  - Two-wheeler → Metro/Bus: `0.62 kg CO₂` saved (`0.84 - 0.22`).
  - Carpool (2+ riders): `0.96 kg CO₂` saved per commute.

## 4. Safety & Myth-Buster Rules
- **Not medical advice**: Always display a clear non-medical disclaimer.
- **No cloth masks for PM2.5**: Explicitly advise against cloth or loose surgical masks for smog; recommend well-fitted **N95 / FFP2** masks for sensitive groups.
- **Escalate severe symptoms**: Chest pain, severe breathlessness, bluish lips, or unrelieved asthma attacks require immediate medical care.
- **Myth Busters**: Document evidence against "indoor houseplants clear severe winter smog" and "cloth masks block PM2.5".
