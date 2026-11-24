---
name: fullstack-quality-gate
description: Use before concluding work or claiming readiness in Saans to execute typecheck, lint, unit tests, production build, Playwright smoke tests, browser verification, and Lighthouse audits.
---

# Full-Stack Quality Gate Skill

## 1. Mandatory Verification Commands
Run and verify all checks after the final edit:
1. `npm run typecheck` (`tsc --noEmit`) — zero TypeScript errors in strict mode.
2. `npm run lint` — zero ESLint errors.
3. `npm run test` — Vitest unit tests pass for CPCB/US AQI breakpoints, cleanest-window selection, and deterministic impact calculations.
4. `npm run build` — Production Next.js build succeeds cleanly.
5. `npx playwright test` — End-to-end smoke test passes across onboarding, dashboard, plan check-off, impact explainer, chat, community brief, and smog simulator.

## 2. Browser & Lighthouse Targets
- Verify rendered app in a real Chrome browser via the `browser` subagent at both:
  - Mobile viewport (`390x844`)
  - Desktop viewport (`1280x800`)
- Confirm zero console errors, zero horizontal overflow, clean dark/light contrast, and interactive flows end-to-end (no dead buttons).
- Run Lighthouse (mobile preset against production `npm run start`) and confirm **>= 90** on Performance, Accessibility, and Best Practices.

## 3. Honesty & Reporting Rule
- Never claim a test, build, or Lighthouse score passed unless you ran it after the final code edit and observed the exact numbers/output.
- If any check cannot run or falls short, report the exact output and root cause.
