---
name: ui-polish-anti-slop
description: Use when refining UI design systems, removing AI-generated visual slop, standardizing spacing/radii/elevation tokens, adding feedback toasts, or building dedicated trust/legal/settings pages.
---

# UI Polish & Anti-Slop Skill

## 1. Anti-"Vibe-Coded" Checklist
- **No emoji icons**: Use a single consistent icon set (`lucide-react`) everywhere in the UI (including shareable copy/brief cards).
- **No default purple-blue gradient heroes**: Use calm, semantic air-quality neutrals and restrained category accents.
- **No glass/blur on every card**: Keep surfaces crisp, opaque, and high-contrast; reserve subtle backdrop blur strictly for sticky overlays/modals.
- **No uniform rounded-3xl card grids**: Use a strict 2-radius system (`10px` controls/inputs, `16px` cards/panels) and 2 elevations (`flat-bordered` + `raised-modal`).
- **No everything-centered layouts or gratuitous animation**: Left-align editorial and data content; keep motion functional and strictly respectful of `prefers-reduced-motion`.
- **No generic copy**: Replace "Welcome to..." or marketing fluff with plain, honest, specific guidance backed by units (`µg/m³`, `mg/m³`, `km/h`), timestamps, and data-source attribution.

## 2. Design System Tokens
- 4/8px spacing rhythm (`4px`, `8px`, `12px`, `16px`, `24px`, `32px`).
- One clear font family (`Inter` / system sans) with `tabular-nums` on every numeric value.
- Two radii (`--radius-control: 10px`, `--radius-panel: 16px`), two elevations (`--shadow-sm`, `--shadow-modal`).

## 3. Interactive States & Real-Product Pages
- Every interactive control must have clear `hover`, `focus-visible`, `active`, `disabled`, `loading`, `empty`, and `error` states.
- Skeleton loaders must match the final card dimensions to avoid Cumulative Layout Shift (CLS).
- Forms must show inline validation; user actions (copy, save, reset, toggle simulator) confirm via accessible non-blocking toast notifications (`aria-live="polite"`).
- Ship dedicated real-product pages/routes: `/settings`, `/privacy`, `/disclaimer`, `not-found.tsx` (404), plus favicon, web manifest, and OG image.
