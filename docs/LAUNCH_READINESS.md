# Saans — Launch Readiness & Product Strategy

> **Go / No-Go Verdict: CONDITIONAL GO (Ready for Public Beta & Challenge Demo)**  
> Core product, deterministic physics engine, and privacy-first architecture are complete and verified. Conditional on keeping `GEMINI_API_KEY` capacity monitored (rule-based fallback handles upstream spikes automatically) and validating real household retention in a 14-day winter pilot.

---

## 1. Value Proposition & Differentiator
- **One-line Promise**: *"Clear, honest daily choices to protect your family's lungs — starting with free steps first."*
- **Core Differentiator**: Unlike passive AQI trackers (Sameer, IQAir) that show alarming numbers or push expensive hardware, **Saans** translates live AQI into a household-tailored 3-part plan (routines, free/low-cost indoor hacks, sustainable swaps) where **every `µg/m³` and `CO₂` number comes from transparent deterministic physics**, never LLM guesswork.

## 2. Target Users
1. **Primary**: Urban families in Indian winter-smog cities (Delhi-NCR, Indo-Gangetic plain, Mumbai, Pune) with children, elders (60+), or asthma/cardiovascular sensitivities on free-to-low budgets.
2. **Secondary**: Resident Welfare Associations (RWAs), school parent coordinators, and local clinics sharing daily neighbourhood briefs via WhatsApp.

## 3. Consumer Panel Simulation — Top 5 Objections & Product Fixes Applied
Applying `founder-consumer` across simulated urban household personas surfaced five concrete friction points, all applied directly in the UI:
1. **"Why answer 3 setup screens before seeing my air?"** → Added explicit *"20-sec setup · Skip to live AQI anytime"* framing and instant one-tap demo household access on Step 1.
2. **"What do CPCB AQI, PM2.5, CADR, and ACH actually mean?"** → Added interactive jargon tooltips and plain-language explanations next to technical terms.
3. **"Can I do this without buying a ₹15,000 purifier?"** → Surfaced **Free & Low-Cost First** ordering and explicit cost tags (`Free`, `₹150 tape`, `₹1,200–1,800 DIY`) in Today's Plan.
4. **"How do I know `-110 µg/m³` isn't an AI hallucination?"** → Badged impact chips and the Impact Explainer as deterministic physics with explicit academic citations (`IIT Delhi`, `UC Davis CADR`, `MoEFCC/DEFRA`).
5. **"How do I get my family or RWA on the same page?"** → Added a direct **Share Family/Community Brief** path from the dashboard and plan views.

## 4. Competitor Benchmark (`founder-competitors`)
| Product | Strength | Gap / Weakness | How Saans Compares |
| --- | --- | --- | --- |
| **Apple Weather (AQI)** | Clean glanceable card & diurnal bar | No India CPCB scale, no indoor hacks, no household personalization | Adopts clean glanceability + cleanest-hour forecast; adds CPCB default & personalized actions |
| **IQAir AirVisual** | Sensor network & pollutant breakdown | Passive monitoring + commercial purifier upsells | Adopts 6-pollutant clarity; prioritizes free/DIY indoor hacks first |
| **Sameer (CPCB) / SAFAR** | Official Indian CPCB stations & NAQI | Dated UI, no personalized indoor math or bilingual Q&A | Uses official CPCB NAQI breakpoints by default with modern calm UX & streaming Q&A |

## 5. Brand Identity (`founder-brand`)
- **Name**: **Saans** (`साँस`) — *"Breathe easier, one choice at a time."*
- **Voice**: **Calm** (never alarmist), **Practical** (action over anxiety), **Transparent** (cites sources & confidence levels).

## 6. Free Core vs. Illustrative Future Tier (`founder-offer` / `founder-pricing`)
*Note: Saans is 100% free today with zero accounts or paywalls. The tier below is illustrative only for post-challenge sustainability:*
- **Saans Free (Always Free for Families)**: Live CPCB/US AQI, 3-tab personalized daily plan, deterministic impact math, Ask Saans Q&A, WhatsApp/PNG Community Brief, Smog Simulator, EN/HI.
- **Saans Neighbourhood / School Pack (Illustrative Future Pro — ~₹499/mo per RWA or School)**: Multi-building bulletin scheduling, custom school-bus / gate anti-idling posters, hyperlocal purple/CPCB sensor webhook alerts.

## 7. 30-Day Launch Roadmap & Ops (`founder-launch` / `founder-ops`)
- **Days 1–7 (Real-World Validation)**: Pilot with 25 Delhi-NCR families & 2 RWA WhatsApp groups; track onboarding completion time (<60s) and daily action check-offs.
- **Days 8–15**: Measure which indoor hacks are completed most (`seal_window_drafts`, `wet_mop_no_sweep`, `diy_box_fan_filter`) and refine Hindi copy with native reviewers.
- **Days 16–30**: Deploy Cloud Run container with monitoring on `/api/health`, Open-Meteo fallback rate, and Gemini `503` fallback rate.

## 8. Top 5 Launch Risks & Mitigations (`founder-board`)
1. **Upstream Gemini `503` / Quota Spikes**: Mitigated via fast 7.5s timeout + immediate deterministic rule-based plan & local grounded chat fallback.
2. **Open-Meteo Grid Resolution vs. Hyperlocal Hotspots**: Mitigated by clearly attributing Open-Meteo model data, timestamps, and advising users when traffic/construction spikes exceed regional averages.
3. **Medical Misinterpretation**: Mitigated by persistent non-medical disclaimer, dedicated `/disclaimer` page, N95-only PM2.5 guidance, and symptom escalation prompts.
4. **`localStorage` Clearing on Browser Reset**: Mitigated by explicit privacy note (`/privacy`) and 20-second re-onboarding + instant demo household.
5. **No Server-Side Persistence for Longitudinal History**: Conscious privacy trade-off for v1; optional encrypted export/import can be added post-pilot if users request multi-device sync.
