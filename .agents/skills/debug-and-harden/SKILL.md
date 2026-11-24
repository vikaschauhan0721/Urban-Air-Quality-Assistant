---
name: debug-and-harden
description: Use when auditing, debugging, fuzz-testing APIs, fixing root causes, adding regression tests, or hardening a Next.js full-stack application for production.
---

# Debug & Harden Skill

## 1. Error-Hunting Loop
1. Run clean static & build checks: `tsc --noEmit`, `eslint .`, `vitest run`, `next build`, and `npm audit`.
2. Start the app and fuzz every API endpoint (`/api/health`, `/api/air`, `/api/plan`, `/api/chat`) with valid, invalid, empty, oversized, and malformed JSON/query payloads. Verify exact HTTP status codes (`400`, `413`, `429`, `500`) and uniform JSON error shapes.
3. Verify the rendered UI at both `390px` (mobile) and `1440px` (desktop): walk every flow, inspect console errors, failed network calls, hydration warnings, layout shifts, and accessibility violations.
4. Hunt specifically for:
   - Boot-time env validation and secret exposure (`GEMINI_API_KEY` must stay server-only).
   - LLM timeouts, rate limits, malformed JSON, empty responses, and deterministic fallbacks.
   - Hydration mismatches from `localStorage` or `Date` / locale formatting.
   - Geolocation denied, offline mode, stale async responses (race conditions / missing `AbortController`).
   - Missing input validation, XSS, prompt injection, rate limiting, security headers, and dead code.

## 2. Root-Cause Rules & Banned Shortcuts
- Always fix the underlying root cause, never mask symptoms.
- **Banned shortcuts**:
  - NEVER use `@ts-ignore`, `@ts-expect-error`, or `any` casts to silence TypeScript.
  - NEVER use blanket `eslint-disable` comments to hide hook/immutability/a11y warnings.
  - NEVER swallow errors silently (`catch {}` without structured logging or explicit fallback handling).

## 3. Regression-Test Rule
- Every bug discovered and fixed MUST get a corresponding automated regression test (unit test in `tests/unit/` or E2E assertion in `tests/e2e/`) so it can never recur silently.
