import type {
  AirQualityReport,
  ConfidenceLevel,
  DeterministicImpact,
  MythBuster,
  UserProfile,
} from "./types";

/**
 * DOCUMENTED IMPACT ENGINE CONSTANTS
 * Sources:
 * 1. Stephens, B. (2015) & IIT Delhi Urban Indoor-Outdoor PM2.5 Studies:
 *    - Leaky urban residence infiltration factor I_f = 0.78 (closed leaky windows)
 *    - Weather-stripped / towel-sealed residence I_f = 0.52
 * 2. Corsi-Rosenthal / Box-Fan MERV-13 & Commercial HEPA Filtration:
 *    - Standard Indian bedroom volume V = 35 m³ (~12 x 10 x 10 ft)
 *    - DIY MERV-13 Box Fan CADR ≈ 250 m³/h (ACH ≈ 7.1 h⁻¹)
 *    - Commercial HEPA (high) CADR ≈ 310 m³/h (ACH ≈ 8.9 h⁻¹)
 *    - Natural surface deposition rate k_d ≈ 0.35 h⁻¹
 * 3. MoEFCC / DEFRA / IEA Transport & Cooking Emission Factors:
 *    - Petrol car: 0.192 kg CO2/km; Two-wheeler: 0.084 kg CO2/km; Urban Metro/E-Bus: 0.022 kg CO2/km
 *    - Typical urban round-trip commute = 10 km
 */
const BEDROOM_VOLUME_M3 = 35;
const INFILTRATION_LEAKY = 0.78;
const INFILTRATION_SEALED = 0.52;
const NATURAL_DEPOSITION_ACH = 0.35;
const NATURAL_AERATION_ACH = 0.7;

const ROUND_TRIP_KM = 10;
const CO2_CAR_KG_PER_KM = 0.192;
const CO2_TWO_WHEELER_KG_PER_KM = 0.084;
const CO2_TRANSIT_KG_PER_KM = 0.022;

function round1(val: number): number {
  return Math.round(val * 10) / 10;
}

/**
 * Exponential filtration decay model:
 * C(t) = C_ss + (C_0 - C_ss) * exp(-(ACH_total) * t_hours)
 */
function simulateFiltrationDecay(
  c0: number,
  cOutdoor: number,
  infiltration: number,
  cadrM3h: number,
  minutes: number
): number {
  const achFilter = cadrM3h / BEDROOM_VOLUME_M3;
  const achTotal = achFilter + NATURAL_AERATION_ACH + NATURAL_DEPOSITION_ACH;
  const steadyState =
    (cOutdoor * infiltration * (NATURAL_AERATION_ACH + NATURAL_DEPOSITION_ACH)) /
    achTotal;
  const tHours = minutes / 60;
  const cAfter = steadyState + (c0 - steadyState) * Math.exp(-achTotal * tHours);
  return Math.max(8, Math.round(cAfter));
}

export function computeDeterministicImpact(
  actionId: string,
  air: AirQualityReport,
  profile: UserProfile
): DeterministicImpact {
  const outdoorPm25 = Math.max(12, Math.round(air.pollutants.pm2_5));
  const infiltration = profile.lifestyle.leakyWindows
    ? INFILTRATION_LEAKY
    : INFILTRATION_SEALED;
  // Base indoor PM2.5 includes modest indoor cooking/resuspension baseline (+12%)
  const indoorBase = Math.max(12, Math.round(outdoorPm25 * infiltration * 1.12));

  let before = indoorBase;
  let after = indoorBase;
  let durationMinutes = 40;
  let exposureAvoidedUgM3Hours = 0;
  let co2SavedKg = 0;
  let confidence: ConfidenceLevel = "Medium";
  let methodTitle = "Indoor infiltration & exposure model";
  let methodDetails = "";
  let sourceCitation = "IIT Delhi Indoor-Outdoor PM2.5 & WHO Exposure Model";

  switch (actionId) {
    case "diy_box_fan_filter": {
      // If indoor starts elevated (e.g. leaky room + evening cooking), CADR 250 m3/h over 40m
      before = Math.max(indoorBase, Math.round(outdoorPm25 * 0.92));
      durationMinutes = 40;
      after = simulateFiltrationDecay(before, outdoorPm25, infiltration, 250, durationMinutes);
      exposureAvoidedUgM3Hours = Math.round((before - after) * 8);
      confidence = "High";
      methodTitle = "Single-room CADR exponential decay (250 m³/h)";
      methodDetails = `Models a 35 m³ closed bedroom with a box-fan + MERV-13 filter (7.1 air changes/hr) over ${durationMinutes} minutes, reducing indoor PM2.5 against infiltration I_f=${infiltration}.`;
      sourceCitation = "UC Davis / Corsi-Rosenthal Box CADR Lab Benchmarks";
      break;
    }

    case "hepa_purifier_high": {
      before = indoorBase;
      durationMinutes = 45;
      after = simulateFiltrationDecay(before, outdoorPm25, infiltration, 310, durationMinutes);
      exposureAvoidedUgM3Hours = Math.round((before - after) * 8);
      confidence = "High";
      methodTitle = "HEPA CADR exponential decay (310 m³/h)";
      methodDetails = `Models running a commercial HEPA purifier on High in a closed 35 m³ bedroom (8.9 air changes/hr) for ${durationMinutes} minutes before sleep.`;
      sourceCitation = "AHAM AC-1 CADR Decay Model";
      break;
    }

    case "seal_window_drafts": {
      before = Math.round(outdoorPm25 * INFILTRATION_LEAKY);
      after = Math.round(outdoorPm25 * INFILTRATION_SEALED);
      durationMinutes = 30;
      exposureAvoidedUgM3Hours = Math.round((before - after) * 10);
      confidence = "Medium";
      methodTitle = "Perimeter infiltration reduction (I_f 0.78 → 0.52)";
      methodDetails =
        "Reducing 2–4 mm window/door perimeter leakage lowers steady-state indoor-to-outdoor PM2.5 infiltration ratio from ~0.78 to ~0.52.";
      sourceCitation = "Stephens (2015) Building Envelopes & Fine Particulate Infiltration";
      break;
    }

    case "wet_mop_no_sweep": {
      before = indoorBase;
      after = Math.max(10, Math.round(indoorBase * 0.85));
      durationMinutes = 20;
      exposureAvoidedUgM3Hours = Math.round((before - after) * 4);
      confidence = "Medium";
      methodTitle = "Resuspension suppression factor (-15% indoor PM)";
      methodDetails =
        "Damp mopping captures settled dust instead of re-suspending coarse and fine particles back into the 0.5–1.5 m breathing zone.";
      sourceCitation = "EPA Indoor Particulate Resuspension Guidance";
      break;
    }

    case "cleanest_hour_ventilation": {
      const dipPm25 = Math.max(10, Math.round(air.cleanestWindow.avgPm25));
      before = indoorBase;
      after = Math.max(10, Math.round(Math.min(indoorBase, dipPm25 * 0.88)));
      if (after >= before) {
        after = Math.max(10, Math.round(before * 0.9));
      }
      durationMinutes = 20;
      exposureAvoidedUgM3Hours = Math.round((before - after) * 3);
      confidence = "Medium";
      methodTitle = "Diurnal minimum cross-ventilation swap";
      methodDetails = `Swapping indoor air during the ${air.cleanestWindow.startLabel}–${air.cleanestWindow.endLabel} dip (~${dipPm25} µg/m³) clears indoor CO2 while avoiding peak smog hours.`;
      sourceCitation = "Open-Meteo Hourly Boundary-Layer Dispersion Forecast";
      break;
    }

    case "no_incense_agarbatti": {
      // Burning incense/coil adds ~65 ug/m3 indoor spike in a closed bedroom
      before = indoorBase + 65;
      after = indoorBase;
      durationMinutes = 60;
      exposureAvoidedUgM3Hours = 65 * 2;
      confidence = "High";
      methodTitle = "Indoor combustion source elimination";
      methodDetails =
        "Eliminates peak indoor PM2.5 emission (~65 µg/m³ room average over 2 hours) caused by burning incense sticks or mosquito coils in closed winter rooms.";
      sourceCitation = "Lung Care Foundation / NEERI Indoor Biomass & Incense Studies";
      break;
    }

    case "kitchen_exhaust_lid": {
      const cookingSpike = profile.lifestyle.cookingFuel === "biomass" ? 110 : 58;
      before = indoorBase + cookingSpike;
      after = indoorBase + Math.round(cookingSpike * 0.25);
      durationMinutes = 30;
      exposureAvoidedUgM3Hours = Math.round((before - after) * 1.5);
      confidence = "High";
      methodTitle = "Source-capture exhaust & lid containment";
      methodDetails =
        "Local exhaust ventilation plus covered cookware captures ~75% of cooking aerosols and NO2 before they mix into living areas.";
      sourceCitation = "LBNL Residential Cooking Exhaust Capture Efficiency Studies";
      break;
    }

    case "n95_commute_seal": {
      // Personal breathing-zone concentration during 45 min commute
      before = Math.round(outdoorPm25 * 1.25); // roadside traffic multiplier
      after = Math.max(4, Math.round(before * 0.1)); // 90% real-world fit factor for N95
      durationMinutes = 45;
      exposureAvoidedUgM3Hours = Math.round((before - after) * 0.75);
      confidence = "High";
      methodTitle = "N95/FFP2 real-world filtration (90% assigned protection)";
      methodDetails =
        "Applies a conservative 90% real-world fit efficiency (below the 95% lab rating) to roadside PM2.5 exposure during a 45-minute daily commute.";
      sourceCitation = "NIOSH N95 Filtration & Roadside Exposure Adjustment";
      break;
    }

    case "cleanest_hour_errands": {
      const dipPm25 = Math.max(10, Math.round(air.cleanestWindow.avgPm25));
      before = Math.max(dipPm25 + 15, Math.round(outdoorPm25 * 1.1));
      after = dipPm25;
      durationMinutes = 45;
      exposureAvoidedUgM3Hours = Math.round((before - after) * 0.75);
      confidence = "Medium";
      methodTitle = "Time-shifted outdoor exposure differential";
      methodDetails = `Compares morning/evening peak outdoor PM2.5 (~${before} µg/m³) against today's cleanest afternoon window (~${after} µg/m³).`;
      sourceCitation = "Open-Meteo 24h Diurnal Forecast";
      break;
    }

    case "avoid_morning_inversion": {
      // Vigorous exercise increases minute ventilation ~4x; shifting indoors cuts inhaled dose
      before = Math.round(outdoorPm25 * 1.15);
      after = Math.round(indoorBase * 0.85);
      durationMinutes = 40;
      exposureAvoidedUgM3Hours = Math.round(Math.max(10, (before - after) * 2.5));
      confidence = "High";
      methodTitle = "Minute-ventilation dose avoidance (4× exertion factor)";
      methodDetails =
        "Outdoor running increases inhaled air volume ~4× compared with indoor light mobility, compounding morning inversion PM2.5 dose.";
      sourceCitation = "WHO Physical Activity & Air Pollution Dose Guidelines";
      break;
    }

    case "saline_hydrate_return": {
      before = Math.round(outdoorPm25 * 0.7);
      after = Math.round(outdoorPm25 * 0.58);
      durationMinutes = 5;
      exposureAvoidedUgM3Hours = Math.round((before - after) * 0.5);
      confidence = "Low";
      methodTitle = "Upper-airway coarse dust clearance";
      methodDetails =
        "Conservative symptom-relief estimate for nasal/facial rinsing after road dust exposure; does not replace respiratory filtration.";
      sourceCitation = "ENT Clinical Airway Hygiene Guidance";
      break;
    }

    case "metro_over_car": {
      before = Math.round(outdoorPm25 * 1.25);
      after = Math.round(outdoorPm25 * 0.65);
      durationMinutes = 40;
      exposureAvoidedUgM3Hours = Math.round((before - after) * 0.7);
      co2SavedKg =
        profile.lifestyle.commute === "two_wheeler"
          ? round1((CO2_TWO_WHEELER_KG_PER_KM - CO2_TRANSIT_KG_PER_KM) * ROUND_TRIP_KM)
          : round1((CO2_CAR_KG_PER_KM - CO2_TRANSIT_KG_PER_KM) * ROUND_TRIP_KM);
      confidence = "High";
      methodTitle = "10 km round-trip tailpipe CO2 & cabin exposure";
      methodDetails = `Replaces a 10 km solo ${profile.lifestyle.commute === "two_wheeler" ? "two-wheeler" : "car"} trip with Metro/electric transit, cutting per-passenger tailpipe CO2 and roadside exhaust inhalation.`;
      sourceCitation = "MoEFCC & DEFRA Urban Commute Emission Factors";
      break;
    }

    case "induction_over_gas_biomass": {
      const delta = profile.lifestyle.cookingFuel === "biomass" ? 95 : 32;
      before = indoorBase + delta;
      after = indoorBase;
      durationMinutes = 30;
      exposureAvoidedUgM3Hours = Math.round(delta * 1.2);
      co2SavedKg = profile.lifestyle.cookingFuel === "biomass" ? 1.4 : 0.4;
      confidence = "High";
      methodTitle = "Zero-combustion electric boiling swap";
      methodDetails =
        "Replaces open-flame water/tea boiling with electric induction, eliminating indoor NO2/CO/PM2.5 spikes and cutting daily cooking emissions.";
      sourceCitation = "CEA Grid & Clean Cooking Emission Factors";
      break;
    }

    case "carpool_school_office": {
      before = indoorBase;
      after = Math.max(10, Math.round(indoorBase * 0.94));
      durationMinutes = 30;
      exposureAvoidedUgM3Hours = 8;
      co2SavedKg = round1((CO2_CAR_KG_PER_KM * ROUND_TRIP_KM) / 2);
      confidence = "Medium";
      methodTitle = "50% vehicle-km reduction (2-family carpool)";
      methodDetails =
        "Sharing one 10 km round-trip halves gate-side tailpipe emissions and saves ~0.96 kg CO2 per commute day.";
      sourceCitation = "DEFRA Passenger Vehicle Occupancy Factors";
      break;
    }

    case "anti_idling_no_burn": {
      before = indoorBase + 25;
      after = indoorBase;
      durationMinutes = 15;
      exposureAvoidedUgM3Hours = 18;
      co2SavedKg = 0.5;
      confidence = "Medium";
      methodTitle = "Idle & biomass open-burning avoidance";
      methodDetails =
        "Avoiding 5 minutes of engine idling and preventing dry-leaf burning eliminates localized PAH/PM2.5 plumes in residential blocks.";
      sourceCitation = "CPCB Winter Anti-Burning & Anti-Idling Advisory";
      break;
    }

    default: {
      before = indoorBase;
      after = Math.max(10, Math.round(indoorBase * 0.85));
      durationMinutes = 30;
      exposureAvoidedUgM3Hours = Math.round((before - after) * 2);
      confidence = "Low";
      methodTitle = "Conservative exposure reduction estimate";
      methodDetails = "Estimated reduction based on baseline indoor-outdoor PM2.5 ratio.";
      sourceCitation = "Saans Deterministic Reference Model";
    }
  }

  const pm25DeltaUgM3 = Math.max(0, before - after);
  const pm25ReductionPct =
    before > 0 ? Math.min(95, Math.round((pm25DeltaUgM3 / before) * 100)) : 0;

  const chipLabel =
    co2SavedKg > 0 && pm25DeltaUgM3 < 10
      ? `-${co2SavedKg} kg CO₂`
      : co2SavedKg > 0
      ? `-${pm25DeltaUgM3} µg/m³ · -${co2SavedKg} kg CO₂`
      : `-${pm25DeltaUgM3} µg/m³ (${pm25ReductionPct}%)`;

  const beforeAfterLabel =
    co2SavedKg > 0 && pm25DeltaUgM3 < 10
      ? `Saves ~${co2SavedKg} kg CO₂ per 10 km trip in ${durationMinutes} min`
      : `Estimated PM2.5: ${before} → ${after} µg/m³ in about ${durationMinutes} min`;

  return {
    indoorPm25Before: before,
    indoorPm25After: after,
    pm25DeltaUgM3,
    pm25ReductionPct,
    durationMinutes,
    exposureAvoidedUgM3Hours,
    co2SavedKg,
    confidence,
    methodTitle,
    methodDetails,
    sourceCitation,
    chipLabel,
    beforeAfterLabel,
  };
}

export const MYTH_BUSTERS: MythBuster[] = [
  {
    id: "plants_clean_smog",
    myth: "Indoor houseplants (like snake plants) clean winter smog.",
    mythHi: "घर के पौधे (जैसे स्नेक प्लांट) सर्दियों की धुंध साफ कर देते हैं।",
    verdict: "Myth",
    truth:
      "Chamber studies show you would need 100–1,000 plants per square metre to match one mechanical air change. Keep plants for joy, but rely on sealing drafts + a HEPA or box-fan filter for PM2.5.",
    truthHi:
      "वैज्ञानिक शोध बताते हैं कि एक प्यूरीफायर जितना असर पाने के लिए प्रति वर्ग मीटर सैकड़ों पौधे चाहिए। धुंध से बचने के लिए दरारें सील करें और HEPA या बॉक्स-फ़ैन फ़िल्टर चलाएँ।",
    evidence: "Cummings & Waring (2019), Journal of Exposure Science & Environmental Epidemiology",
    confidence: "High",
  },
  {
    id: "cloth_masks_pm25",
    myth: "Cloth masks or loose surgical masks stop PM2.5 smog.",
    mythHi: "कपड़े का मास्क या ढीला सर्जिकल मास्क PM2.5 रोक लेता है।",
    verdict: "Myth",
    truth:
      "PM2.5 particles are 30× thinner than a human hair and pass straight through woven cloth and side gaps. Only a well-fitted N95 / FFP2 / KN95 respirator filters 95%+ of fine smoke.",
    truthHi:
      "PM2.5 कण बाल से 30 गुना महीन होते हैं और कपड़े के रेशों व किनारों से अंदर चले जाते हैं। केवल फिट N95/FFP2 मास्क ही इन्हें 95%+ रोकता है।",
    evidence: "NIOSH & IIT Delhi Particulate Penetration Tests",
    confidence: "High",
  },
  {
    id: "morning_walk_healthy",
    myth: "6 AM winter walks are always good for lung health.",
    mythHi: "सर्दियों में सुबह 6 बजे टहलना हमेशा सेहतमंद होता है।",
    verdict: "Half-truth",
    truth:
      "True in clean air, risky during winter smog. Cold ground inversions trap overnight exhaust near street level until late morning—walk during the warmest afternoon window instead.",
    truthHi:
      "साफ हवा में सही है, पर सर्दियों की धुंध में सुबह ठंडी हवा धुएँ को नीचे दबाए रखती है। दोपहर के साफ समय में टहलना सुरक्षित है।",
    evidence: "CPCB Diurnal Winter Boundary-Layer Monitoring",
    confidence: "High",
  },
  {
    id: "open_windows_all_day",
    myth: "Keeping windows wide open all day keeps indoor air clean.",
    mythHi: "दिन भर खिड़कियाँ खुली रखने से घर की हवा ताज़ा रहती है।",
    verdict: "Half-truth",
    truth:
      "When outdoor AQI is Poor or Severe, open windows let outdoor PM2.5 flood in. Keep windows sealed during peak smog and cross-ventilate briefly during the cleanest afternoon dip.",
    truthHi:
      "जब बाहर हवा खराब या गंभीर हो, तो खुली खिड़कियों से धुआँ अंदर भर जाता है। सिर्फ दोपहर के सबसे साफ 20 मिनट ही हवा बदलें।",
    evidence: "WHO Indoor Air Quality Guidelines",
    confidence: "High",
  },
];
