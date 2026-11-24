# Saans — Project Map

## 1. Tech Stack
- **Framework**: Next.js 16.4.6 (App Router, Turbopack), React 19.1, TypeScript (`strict: true`, `noUncheckedIndexedAccess: true`)
- **Styling & Motion**: Tailwind CSS v4 (`@tailwindcss/postcss`), CSS custom-property tokens (`src/styles/tokens.css`), Framer Motion 12, Lucide React icons
- **Charts & Validation**: Recharts 2, Zod 3
- **GenAI SDK**: `@google/genai` (server-side only, model `GEMINI_MODEL` defaulting to `gemini-3.8-flash`)
- **Testing**: Vitest 3 (`tests/unit/`), Playwright 1.52 (`tests/e2e/`)

## 2. Package Scripts (`package.json`)
| Script | Command | Purpose |
| --- | --- | --- |
| `dev` | `next dev` | Local development server |
| `build` | `next build` | Production build (sets `STANDALONE=true` in Docker) |
| `start` | `next start` | Production server |
| `lint` | `eslint .` | ESLint 9 flat config (`core-web-vitals` + `typescript`) |
| `typecheck` | `tsc --noEmit` | Strict TypeScript check |
| `test` | `vitest run` | Unit tests |
| `test:e2e` | `playwright test` | Chrome E2E smoke test |

## 3. Entry Points & Routes
- **Pages**: `src/app/layout.tsx` (root metadata + viewport), `src/app/page.tsx` -> `src/components/SaansApp.tsx` (single-page tabbed workspace)
- **API Route Handlers**:
  - `GET /api/health` (`src/app/api/health/route.ts`): readiness & Gemini configuration flag
  - `GET /api/air` (`src/app/api/air/route.ts`): Open-Meteo air quality + weather normalization, 10-min TTL cache, retry, fixture & `simulate=smog` (AQI 312) fallback
  - `POST /api/plan` (`src/app/api/plan/route.ts`): Zod-validated Gemini structured JSON plan merged with deterministic impact math (`src/lib/impact.ts`), plus rule-based fallback
  - `POST /api/chat` (`src/app/api/chat/route.ts`): IP rate-limited, prompt-injection-filtered streaming Q&A via Gemini with grounded local fallback
- **PWA Assets**: `public/manifest.webmanifest`, `public/sw.js`, `public/icons/icon.svg`

## 4. Environment Variables & External APIs
- `GEMINI_API_KEY` (server-only, optional — triggers deterministic fallback when unset/unavailable)
- `GEMINI_MODEL` (optional, defaults to `gemini-3.8-flash`)
- **External APIs (no key required)**:
  - `https://air-quality-api.open-meteo.com/v1/air-quality`
  - `https://api.open-meteo.com/v1/forecast`
  - `https://geocoding-api.open-meteo.com/v1/search` (client onboarding)
  - `https://api.bigdatacloud.net/data/reverse-geocode-client` (client geolocation reverse lookup)

## 5. Data Flow
```
localStorage (saans_profile_v1) ─┐
                                  ├─► GET /api/air ─► Open-Meteo / Cache / Fixture ─► CPCB & US AQI + Cleanest Window
                                  ├─► POST /api/plan ─► Gemini JSON (IDs + Copy) + /lib/impact.ts (All Numbers)
                                  └─► POST /api/chat ─► Rate Limit + Injection Guard + Gemini Stream / Fallback
```
