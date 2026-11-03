# 025. Backend tsconfig: Node16 Modules and Removal of baseUrl

## Context
`apps/backend/tsconfig.json` had three problems:
1. **`baseUrl` is deprecated.** TypeScript 6.0 reports it as an error (TS5101) and TypeScript 7.0 removed it (TS5102). The IDE runs a newer TypeScript than the project's pinned 5.9.3, so it showed an error that `pnpm typecheck` did not.
2. **Dead `paths` alias.** `@winery/shared/*` pointed to `packages/shared/src`, which does not exist and is imported nowhere. A `paths` alias only affects type checking, so nothing would resolve it at runtime.
3. **Module format mismatch.** Since commit `bbe2db3`, the config used `module: esnext` / `moduleResolution: bundler`. `medusa build` reads this tsconfig, so it emitted ESM (`import`/`export`) into a package without `"type": "module"`. This only worked because of Node 22's automatic module syntax detection.

Also, `integration-tests/` was not in `include`, so `pnpm typecheck` did not check test files. Once included, the checker found an invalid `inApp` option in the health test (it is not part of `@medusajs/test-utils@2.22.2`).

## Alternatives
1. **Silence with `"ignoreDeprecations": "6.0"`.** This only postpones the TS 7 breakage. Rejected.
2. **Keep `esnext` + `bundler` and add `"type": "module"`.** This diverges from the official Medusa v2 starter and risks breaking Medusa's CommonJS loaders. Rejected.
3. **Align with the official Medusa v2 starter (Chosen):** `module` and `moduleResolution` set to `Node16`, no `baseUrl`/`paths`, and tests included in type checking.

## Decision
- `module: "Node16"`, `moduleResolution: "Node16"`.
- Removed `baseUrl` and `paths`. When `packages/shared` is created, consume it as a workspace dependency (`"@winery/shared": "workspace:*"`), not through a path alias.
- `types: ["node", "jest"]`. TypeScript 6+ no longer auto-includes every `@types/*` package.
- `include: ["src", "integration-tests", "medusa-config.ts"]`.
- Removed `inApp: true` from `integration-tests/http/health.spec.ts`.

## Consequences
- **Positive Impacts**:
  - Type checking passes on TypeScript 5.9.3, 6.x and 7.0.2 (verified on 2026-11-03).
  - `medusa build` emits standard CommonJS (`"use strict"`, `require`), consistent with the package type.
  - Test files are type-checked by the Definition of Done.
- **Verified**: `pnpm lint && pnpm typecheck && pnpm test`, `test:integration:http`, `medusa build`, and `medusa develop` booting with `/health` returning 200.
- **Trade-offs / not verified**: the seed script and `medusa start` from the built output were not re-run after the change.
