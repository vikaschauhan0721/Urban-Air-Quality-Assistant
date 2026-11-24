---
name: product-ui-ux
description: Use when designing, styling, or building React UI components, design tokens, AQI-adaptive themes, responsive layouts, animations, or bilingual copy for Saans.
---

# Product UI / UX Skill

## 1. Visual Direction ("Apple Weather meets Google Health")
- Clean, airy surfaces, subtle frosted cards, generous padding, crisp typographic hierarchy (`Inter`, `tabular-nums` for every AQI, pollutant concentration, timer, and CO₂ metric).
- Centralize all design tokens in `src/styles/tokens.css` and `src/lib/theme.ts`:
  - Radii: `--radius-card: 20px`, `--radius-hero: 24px`, `--radius-pill: 9999px`.
  - Soft elevation shadows, light mode and automatic dark mode (`@media (prefers-color-scheme: dark)` + `.dark` class).

## 2. AQI-Adaptive Theming (Never Color Alone)
Shift accent palette, hero gradient, and verdict tone smoothly across all 6 CPCB categories:
- **Good (0–50)**: Emerald (`#15803D` light / `#4ADE80` dark) + Leaf/Wind icon + "Good"
- **Satisfactory (51–100)**: Teal/Lime (`#0F766E` / `#2DD4BF`) + CheckCircle icon + "Satisfactory"
- **Moderate (101–200)**: Amber (`#B45309` / `#FBBF24`) + CloudSun icon + "Moderate"
- **Poor (201–300)**: Orange (`#C2410C` / `#FB923C`) + ShieldAlert icon + "Poor"
- **Very Poor (301–400)**: Crimson (`#B91C1C` / `#F87171`) + AlertTriangle icon + "Very Poor"
- **Severe (401–500)**: Deep Plum/Maroon (`#881337` / `#FB7185`) + OctagonAlert icon + "Severe"

Every category badge and gauge MUST display an icon + text label alongside color.

## 3. Navigation & Layout
- **Mobile (< 768px)**: Sticky compact top header + 5-item fixed bottom tab bar (`Home`, `Plan`, `Ask`, `Community`, `Profile`) with `min-h-[44px] min-w-[44px]` touch targets.
- **Desktop (>= 768px)**: Left navigation rail/sidebar (`260px`) + responsive 2-column main content grid (`max-w-6xl`).

## 4. Required UI States & Polish
Every async surface must implement:
1. **Skeleton loading** (shimmering placeholder cards matching final layout).
2. **Empty state** (helpful guidance + primary CTA).
3. **Error state with Retry** (plain-language message + working retry button).
4. **Offline state** (listener on `online`/`offline` showing cached/local banner).
5. **Demo / Simulator banner** (clear pill when using simulated AQI ~312 or fallback fixture data).

Micro-interactions:
- Framer Motion spring check-off on action cards, smooth tab indicator transitions, animated hero AQI count-up, and daily progress ring.
- Honor `prefers-reduced-motion` (`useReducedMotion()` / CSS media query).

## 5. Accessibility & Copy Tone
- WCAG AA contrast (>= 4.5:1 text, >= 3:1 UI elements).
- Full keyboard navigation, visible focus rings, semantic landmarks (`<header>`, `<nav>`, `<main>`), and `aria-live="polite"` on AQI/verdict regions.
- Copy: warm, practical, calm, never alarmist. Explain any technical term (e.g. `PM2.5` = "tiny soot particles that reach deep into lungs") in one plain line. Support both English and Hindi (`en` / `hi`).
