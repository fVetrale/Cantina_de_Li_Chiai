# 024. Backend Lint and Test Tooling

## Context
The project's Definition of Done (`AGENT.md`) is `pnpm lint && pnpm typecheck && pnpm test`, but the command could not pass:
1. **Lint**: `apps/backend` had no ESLint dependency and no configuration. `eslint src --ext .ts` silently resolved to the system-wide `/usr/bin/eslint` (v6.4.0, 2019), which then failed because it found no config.
2. **Test**: `apps/backend` ran `jest --passWithNoTests`, but `jest` was not installed (`sh: jest: not found`).
3. **Versions**: Medusa packages used loose ranges (`^2.0.0`), and the installed versions were mixed (2.22.1 core, 2.22.2 `admin-sdk`/`js-sdk`). This conflicts with the security rule "Pin versions".

The upcoming work (customer auth, cart, order history) requires HTTP integration tests. The security rules require proving that another customer receives 403/404 on user or order data.

## Alternatives
1. **Remove the backend lint/test scripts**: this makes the command pass, but the Definition of Done would no longer mean anything. Rejected.
2. **ESLint 10 + Jest 30 (latest majors)**: this would put two ESLint majors in the monorepo (the storefront uses ESLint 9 via `eslint-config-next`), and Jest 30 is not what the Medusa v2 starter ships. Rejected for now.
3. **Vitest instead of Jest**: Medusa's `@medusajs/test-utils` (`medusaIntegrationTestRunner`) and the official starter are built around Jest. Rejected.
4. **ESLint 9 flat config + Jest 29 with `@swc/jest` + `@medusajs/test-utils`, following the official Medusa v2 starter (Chosen).**

## Decision
- **Pinned versions** (exact, no ranges):
  - All `@medusajs/*` packages are pinned to `2.22.2` in the backend, and `@medusajs/js-sdk` to `2.22.2` in the storefront. `@medusajs/test-utils@2.22.2` requires exactly `2.22.2` for `medusa`, `framework` and `core-flows`.
  - New backend devDependencies: `eslint@9.39.5`, `@eslint/js@9.39.5`, `typescript-eslint@8.72.1`, `globals@17.14.0`, `jest@29.7.0`, `@swc/jest@0.2.39`, `@swc/core@1.16.21`, `@types/jest@29.5.14`, `@medusajs/test-utils@2.22.2`. Licenses: MIT (`@swc/core` is Apache-2.0).
- **Lint**: `apps/backend/eslint.config.mjs` uses the flat config with `@eslint/js` recommended and `typescript-eslint` recommended rules. `.js` files are treated as CommonJS. The script is `eslint src integration-tests medusa-config.ts jest.config.js` (`--ext` was removed in ESLint 9).
- **Tests** (`apps/backend/jest.config.js`, from the Medusa starter): `TEST_TYPE` selects the suite.
  - `test` → `test:unit` (`src/**/__tests__/**/*.unit.spec.ts`). It needs no infrastructure and is part of the Definition of Done.
  - `test:integration:http` (`integration-tests/http/*.spec.ts`) boots Medusa against a **temporary** Postgres database created and dropped by `@medusajs/test-utils`. It requires `infra/` running and the `DB_HOST`, `DB_USERNAME` and `DB_PASSWORD` environment variables (meant to live in `apps/backend/.env.test`, a human-managed file).
  - `jest.config.js` sets `PORT=""` so that integration tests always use a free port, instead of colliding with a running `medusa develop` on the `.env` port.
- A smoke test, `integration-tests/http/health.spec.ts`, checks that `GET /health` returns 200.

## Consequences
- **Positive Impacts**:
  - `pnpm lint && pnpm typecheck && pnpm test` passes and is meaningful again.
  - The infrastructure for the IDOR tests that customer and order endpoints will need is now in place.
  - The Medusa packages are aligned on a single pinned version.
- **Trade-offs**:
  - HTTP integration tests are not part of `pnpm test`, because they need local Postgres. They must be run explicitly before merging backend endpoint work.
  - `pnpm audit` (2026-11-03) reports 10 advisories (3 high, 6 moderate, 1 low). All high ones (`lodash`, `@graphql-tools/utils`) and `uuid`/`ajv`/`glob` are transitive dependencies of the Medusa core and were already present. The new tooling only adds `minimatch` (moderate, via ESLint/Jest) and `deepmerge` (low, via Jest), and both are dev-only. A follow-up decision is needed on `pnpm.overrides` versus waiting for upstream Medusa patches.
  - Jest 29 and ESLint 9 are not the latest majors. Upgrade them together with the Medusa starter or the storefront's ESLint.
