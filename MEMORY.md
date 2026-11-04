# MEMORY.md — Work log

A dated log of the work sessions on Cantina de Li Chiai. Newest first.
For the current state of the codebase and the rules, see `CLAUDE.md` / `AGENT.md`.

---

## 2026-11-03 (Tue), about 21:00–21:57 CET — Claude Code (Opus 5.5)

Branches used: `feature/backend-tooling` (created by the user), merged into `develop` via PR #9 (merge `a60de5c`, 21:56).
`feature/storefront-catalog-ui` was merged via PR #8 (`f69963e`, 21:55).

### 1. Codebase analysis (~21:00–21:10), read-only
- Explored the monorepo: Medusa v2 backend, Next.js 16 storefront, empty `packages/shared`, `infra/` docker-compose, 23 ADRs, `.agent/rules/`.
- Created **`CLAUDE.md`**, which describes the architecture, patterns, protected zones, and what is mocked or missing.
- Findings:
  - The cart is UI-only (the `cartCount` prop is always 0).
  - Login/registration is fake (`setTimeout` after Zod validation, no Medusa call).
  - The reserved-area pages linked from the Navbar don't exist.
  - Stripe isn't configured. `@medusajs/js-sdk` is installed but unused.
  - `lib/data/products.ts` has a price bug: `rawPrice > 100 ? /100` (Medusa v2 stores euros), so products over €100 display wrong. It shows a fake €20 when the price is missing, has no `variantId` (needed for the cart), and merges fake fallback products into the real ones.
  - Minor: some Zod messages are hardcoded in Italian outside i18n, `<html lang="it">` is fixed, and there are leftovers from a Sardinian template (`sardinia` key, `cannonau.jpg`, `vermentino.jpg`).
- The Definition of Done (`pnpm lint && pnpm typecheck && pnpm test`) **was failing**: backend lint (no ESLint, resolved to the system `/usr/bin/eslint` 6.4) and backend test (`jest` not installed).

### 2. Point 1 — backend lint/test tooling (~21:15–21:35) → ADR 024
- Pinned all `@medusajs/*` packages to **2.22.2** (backend + storefront `js-sdk`). `@medusajs/test-utils` requires it.
- Backend devDependencies (exact): `eslint@9.39.5`, `@eslint/js@9.39.5`, `typescript-eslint@8.72.1`, `globals@17.14.0`,
  `jest@29.7.0`, `@swc/jest@0.2.39`, `@swc/core@1.16.21`, `@types/jest@29.5.14`, `@medusajs/test-utils@2.22.2`.
- New files: `apps/backend/eslint.config.mjs`, `apps/backend/jest.config.js`, `integration-tests/setup.js`, `integration-tests/http/health.spec.ts`.
- Scripts: `test` → `test:unit`, plus `test:integration:http` (needs Postgres from `infra/`).
- Problems found and fixed:
  - ESLint errors on the CommonJS `setup.js`: added a CommonJS block to the config.
  - `EADDRINUSE :9000`: the test read `PORT` from `.env` while the dev server was running. `jest.config.js` now forces `PORT=""`, so the tests pick a free port.
- `pnpm audit`: 10 advisories (3 high, 6 moderate, 1 low).
  - The high ones (lodash, @graphql-tools/utils) are transitive dependencies of the Medusa core and were already there.
  - The tooling only adds minimatch (moderate) and deepmerge (low), both dev-only.
  - **No overrides applied. The decision is still open.**

### 3. `.env.test` + `.gitignore` (~21:38), authorized by the user (protected zone)
- Created `apps/backend/.env.test` with the local Docker DB values (`DB_HOST`/`DB_USERNAME`/`DB_PASSWORD`, the same as `infra/docker-compose.yml`, not secrets).
- Added `.env.test` to the root `.gitignore`. Verified with `git check-ignore`.

### 4. Backend tsconfig (~21:45–21:56) → ADR 025
- The error the user saw in the IDE: `baseUrl` is deprecated in TS 6 (TS5101) and removed in TS 7 (TS5102). The IDE uses a newer TS than the project's 5.9.3.
- Changes to `apps/backend/tsconfig.json`:
  - `module`/`moduleResolution` changed from `esnext`/`bundler` to **`Node16`** (official Medusa starter). `medusa build` now emits standard CommonJS instead of ESM.
  - Removed `baseUrl` and the dead `@winery/shared/*` path alias. Use `"@winery/shared": "workspace:*"` once `packages/shared` exists.
  - Added `"types": ["node", "jest"]` (TS 6+ no longer auto-includes `@types`).
  - Added `integration-tests` to `include`. This immediately found an invalid `inApp: true` option in `health.spec.ts`, which was removed.
- Verified:
  - typecheck on TS 5.9 / 6 / 7;
  - `pnpm lint && pnpm typecheck && pnpm test` (exit 0);
  - `test:integration:http` (1 passed);
  - `medusa build`;
  - `medusa develop` on port 9123 (`/health` 200).
- **Not verified:** the seed script and `medusa start` from the build output.

### Open decisions and next steps
- **Next task — point 2, storefront data layer** (`apps/storefront/lib/data/products.ts`):
  - region-aware `calculated_price` (fix the /100 bug and the fake €20);
  - add `variantId`;
  - when the backend is down, show a **"catalogo non disponibile" page** (user decision, 2026-11-03) instead of the fake fallback catalog. Keep the local tasting/terroir metadata as enrichment.
- Then: customer auth (Medusa emailpass, httpOnly cookie) → cart → reserved area (profile, addresses, orders + IDOR tests) → Stripe + checkout.
- Still to ask the user:
  - **C**: real online payment with Stripe, or an "order request" that is confirmed manually?
  - **D**: fresh meat (cold chain): shipped, or pickup only?
  - Whether to use `pnpm.overrides` for the audit advisories.
- Housekeeping: restart the dev server on :9000 (it was still on Medusa CLI 2.22.1 at 21:50).

## 2026-11-04
- `CLAUDE.md` was missing from the working tree. Cause: `git rm --cached` on `chore/untrack-claude-md` (7b74bf4) kept the file. Then `checkout develop` (27eb0d3, where the file was still tracked) re-adopted it. The `pull` fast-forward to aa5cc5f deleted it, because PR #10 removes it from the index.
- Restored it from `git show 27eb0d3:CLAUDE.md`. It is now untracked and ignored (`.gitignore:53`). It won't happen again, because no branch tracks it anymore. `MEMORY.md` was never tracked.
