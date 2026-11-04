# 032. Dependency Audit: pnpm Overrides for Vulnerable Transitive Packages

- **Status:** Accepted (2026-11-04). Review again on or after **2026-11-11** (glob/minimatch, see below).
- **Related:** ADR 024 (backend tooling), ADR 030 (CI)

## Context
`pnpm audit` reported **10 vulnerabilities (3 high, 6 moderate, 1 low)**. All of them are **transitive** dependencies: none is a direct dependency of `apps/backend` or `apps/storefront`. They come from Medusa and its own dependencies (knex, MikroORM, BullMQ, GraphQL tooling, the Medusa CLI) and from ESLint.

- We already use the latest Medusa release (**2.22.2**, published 2026-10-30), so upgrading Medusa cannot fix them.
- The checkout with real payments (Stripe) is the next big milestone, and the dependency tree should be clean before it.

Exploitability analysis for this project, as of 2026-11-04:

| Advisory | Severity | Pulled in by | Is the vulnerable code reachable from customer input? |
|---|---|---|---|
| lodash `_.template` code injection (GHSA-r5fr-rjxr-66jc) | high | knex, MikroORM, GraphQL codegen | **No.** The only `_.template` use in runtime libraries is knex's migration-file generator (`migrate:make`), a developer CLI. |
| lodash prototype pollution in `_.unset`/`_.omit` (GHSA-f23m-r3pf-42rh) | moderate | same | Unlikely: the paths are internal, not supplied by users. |
| @graphql-tools/utils prototype pollution, ×2 (GHSA-7mx3-vvmw-hjmv, GHSA-c4qx-w738-7hr3) | high | Medusa framework/utils (schema of module links), codegen | **No.** Medusa builds an internal GraphQL schema from module definitions at startup. There is no public GraphQL endpoint. |
| ajv ReDoS with `$data` (GHSA-2g4f-4pwh-qvx6) | moderate | MikroORM migrations (umzug), Medusa tooling | **No.** No runtime library enables `$data`. |
| uuid missing bounds check with `buf` (GHSA-w5hq-g745-h8pq) | moderate | BullMQ (Redis event bus) | **No.** BullMQ generates v4 ids, without a buffer argument. |
| glob AbortSignal bypass (GHSA-3g3m-2fjr-6pw4) | moderate | Medusa CLI/framework loaders | **No.** The patterns are our own source paths, scanned at startup. |
| minimatch ReDoS (GHSA-g3hv-75wg-m249) | moderate | Medusa loaders (v10), ESLint (v3) | **No.** The patterns are ours, and ESLint is a dev tool. |
| deepmerge prototype poisoning (GHSA-gcqx-w48m-w2h4) | low | Medusa, `@medusajs/test-utils`, Jest | **No fix exists** upstream. |

None of them was exploitable by a shop customer with today's code. They are still worth closing:
- a later code change or library update could make the vulnerable code reachable;
- an audit full of known "harmless" findings hides new, real ones;
- the security rules of the project and the coming payment flow call for a clean baseline.

## Alternatives
1. **Do nothing and wait for Medusa to update its dependencies.** Rejected: there is no timeline, and three high advisories would stay open through the payment work.
2. **Override every vulnerable package to its patched version.** Rejected as a blanket rule. Some fixes are new major versions inside Medusa or ESLint, and some were released only a week ago.
3. **Override only what is tested and safe, and accept the rest with a written reason and a review date.** (Chosen)

## Decision
Root `package.json`, `pnpm.overrides`. Each selector is limited to the vulnerable range, so already-patched copies are left alone:

```json
"lodash@<4.18.1": "4.18.1",
"ajv@>=7.0.0-alpha.0 <8.18.0": "8.18.0",
"uuid@<11.1.1": "11.1.1",
"@graphql-tools/utils@<12.0.2": "12.1.0"
```

- **lodash 4.18.1** (2026-04-01): minor update, fixes both lodash advisories.
- **ajv 8.18.0** (2026-02-14): minor update, the smallest patched version. ajv 6.x, used by other tools, is outside the vulnerable range and is untouched.
- **uuid 11.1.1** (2026-04-29): **major** update for BullMQ (9 → 11). The v4 API is unchanged, and uuid 11 still ships CommonJS.
- **@graphql-tools/utils 12.1.0** (2026-10-15): **major** update (10 → 12) for Medusa and GraphQL codegen. Version 12.1.0 was already in the tree for other packages.
- **Supply-chain rule:** every pinned version had been public for more than two weeks.

**Accepted for now:**
- **glob 13 → 14.0.2+ and minimatch 10 → 11.0.1+:** the patched releases came out on 2026-10-27/28, a week ago. They are majors inside the Medusa loaders, and the issues are not reachable (see Context). Review on or after 2026-11-11.
- **minimatch 3.1.5 inside ESLint 9:** dev-only. Forcing 11.x would break ESLint, whose API differs.
- **deepmerge 4.3.1:** no patched version exists. Low severity.

## Consequences
- **Positive:** `pnpm audit` went from **10 → 3 advisory types / 4 findings, with 0 high** (1 low, 3 moderate).
- **Verified (2026-11-04)**, with exactly this lockfile (first in a scratch clone, then in the repo):
  - `pnpm install` and the Definition of Done (`pnpm lint && pnpm typecheck && pnpm test`, 16 storefront tests);
  - `medusa build` (backend and admin);
  - `test:integration:http` (1 passed);
  - `medusa develop`: `/health` 200 and admin `/app` 200;
  - `/store/regions` and `/store/products` with `region_id` + `country_code=it`: 14 products with categories, Chiai Rosso `calculated_amount_with_tax = 9`, tax-inclusive.
- **Risks:**
  - The two major overrides (uuid, graphql-tools) run versions Medusa was not released with. A Medusa code path not covered above (for example a rarely used admin feature or a background job) could misbehave.
  - Mitigation: the CI runs on every PR, and the integration tests will grow with the checkout work. If something breaks, remove that single override and record it here in a superseding ADR.
- **Maintenance:**
  - Overrides hide upstream changes. At every Medusa upgrade, check with `pnpm why <pkg>` whether each override is still needed, and remove the ones Medusa now satisfies on its own.
  - Re-run `pnpm audit` before each release.
