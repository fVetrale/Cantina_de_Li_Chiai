# 028. Storefront Unit Tests with Vitest

- **Status:** Accepted (2026-11-04)
- **Related:** ADR 024 (backend lint and test tooling), ADR 026 (storefront data layer)

## Context
The storefront had no test runner, so `pnpm test` skipped it and the Definition of Done did not test any storefront code. The data layer (ADR 026) now holds logic that matters for money and must not regress silently:
- region lookup;
- choosing the IVA-included amount;
- hiding unpriced products;
- reporting "unavailable" instead of inventing data.

## Alternatives
1. **No tests, manual checks only.** Rejected: the bugs ADR 026 fixes (the cents heuristic, the fake €20) are exactly the kind that manual checks miss.
2. **Jest** (already used in the backend, ADR 024). It would need extra TypeScript/ESM transform setup (`@swc/jest` or `ts-jest`) plus the `@/` alias mapping, for a Next/ESM app.
3. **Vitest.** (Chosen) It has native ESM and TypeScript, a Jest-compatible API, and needs one small config file.

## Decision
- **Dependency:** `vitest@4.1.12`, pinned exactly in `apps/storefront` devDependencies.
  - **Version:** 4.1.12 rather than 5.x. Vitest 5 requires Node ≥ 22.12, while the project declares Node ≥ 20 (root `package.json`). 4.1.12 is on the still-maintained 4.x line (released 2026-10-15) and supports Node 20/22/24.
  - **License:** MIT. It is maintained by the Vitest team (VoidZero), with frequent releases.
  - **Known CVEs:** `pnpm audit` reports no advisory on vitest or its dependencies. The only storefront advisory (minimatch, moderate) comes from ESLint and was already there.
- **Config:** `apps/storefront/vitest.config.mts`, with `node` environment, the `@` alias pointing to the app root, and tests matched by `**/__tests__/**/*.test.ts`.
- **Script:** `"test": "vitest run"`. The root `pnpm test` now runs it as part of the Definition of Done.
- **First suite:** `lib/data/__tests__/products.test.ts`, 16 tests. They stub `fetch`, so no backend is needed. They cover:
  - the region/country query parameters;
  - IVA-inclusive and tax-exclusive prices;
  - no division above 100;
  - hiding unpriced products;
  - no fallback merge;
  - legacy filtering;
  - category filter;
  - unavailable on network error, error status, invalid shape and missing Italy region;
  - `ok` / `not_found` / `unavailable` for a single product.
- **Scope:** unit tests for server-side logic only (no DOM). Component and end-to-end tests need a separate decision (e.g. Testing Library or Playwright).

## Consequences
- **Positive:** the data layer is protected by fast tests (under 1 s), run by `pnpm test` with no infrastructure.
- **Trade-offs:**
  - The backend uses Jest and the storefront uses Vitest, so there are two runners in the monorepo. Their APIs are almost identical.
  - When the project raises its minimum Node version to 22.12, move to Vitest 5.
