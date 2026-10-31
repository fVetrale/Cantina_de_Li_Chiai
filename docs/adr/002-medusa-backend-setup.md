# ADR 002 — Medusa v2 as Headless Commerce Backend

**Date:** 2026-10-29
**Status:** Accepted

---

## Context

The project requires a headless e-commerce engine to manage the product catalog, orders, customer accounts, inventory, and payment flows for an Italian winery. The backend must:

- Expose REST and optionally GraphQL APIs consumed by the Next.js storefront.
- Integrate with PostgreSQL for persistent storage and Redis for caching, event queuing, and background jobs.
- Be extensible via custom modules (age verification, shipping rules, Stripe) without forking the core.
- Support an EU-based business, including GDPR-compliant data handling.

---

## Alternatives

| Option | Pros | Cons |
|---|---|---|
| **Medusa v2** | Modular architecture, TypeScript-first, built-in Admin UI, active OSS community, Apache 2.0 | Relatively young (v2 GA 2024), smaller ecosystem than Shopify |
| Medusa v1 | Mature, many plugins | Monolithic, not aligned with long-term Medusa roadmap |
| Shopify (headless) | Very mature, hosted | Proprietary, high cost at scale, limited customisation for wine/age-gating |
| WooCommerce | Huge plugin ecosystem | PHP, requires WordPress overhead, weak TypeScript story |
| Custom Express/Fastify API | Full control | Enormous scope — auth, cart, orders, inventory all from scratch |
| Commerce.js / Saleor | GraphQL-first, extensible | Smaller communities, heavier ops burden |

---

## Decision

Use **Medusa v2** (`@medusajs/medusa ^2.0.0`) as the backend engine, hosted at `apps/backend` inside the pnpm monorepo.

Key architectural choices:

1. **Configuration via environment variables only.** `medusa-config.ts` reads every secret and URL from `process.env`; no defaults are hardcoded. This prevents accidental secret leakage and allows environment parity between local, staging, and production.
2. **PostgreSQL** as the primary data store (managed via Medusa's built-in MikroORM integration). All migrations are generated with `medusa db:generate` and reviewed before running.
3. **Redis** for the event bus, job queue, and cache layer. This keeps slow operations (email, invoice generation, webhook delivery) out of the HTTP request cycle, consistent with `backend.md`.
4. **pnpm hoisting for Medusa packages** via root and package-level `.npmrc` (`public-hoist-pattern[]=*medusa*` and `public-hoist-pattern[]=*@mikro-orm*`). Medusa uses dynamic `require()` internally and requires package hoisting in pnpm virtual store layouts.
5. **Modules list starts empty.** Custom domain modules (Stripe, age verification, shipping rules) are added in dedicated ADRs and feature branches. No speculative dependencies are pre-installed.
6. **Admin Dashboard bundler dependencies.** The embedded Medusa Admin Dashboard (`@medusajs/dashboard`) is compiled via Vite. To resolve correctly in strict pnpm monorepos without phantom dependency failures, `react` and `react-dom` (`^18.3.1`) are declared as direct dependencies in `apps/backend`, with `@medusajs/admin-sdk` in devDependencies to support admin route extensions.

---

## Consequences

**Positive:**
- Medusa provides auth, catalog, cart, orders, and inventory out of the box — drastically reducing custom code surface.
- The modular v2 architecture allows protected zones (`age-verification`, `payment-webhooks`, `auth`, `shipping-rules`) to remain fully human-controlled without touching core Medusa code.
- Apache 2.0 license — no commercial restrictions.
- TypeScript throughout enables end-to-end type sharing via `packages/shared`.
- The Admin UI dashboard (`/app`) builds cleanly out of the box with Vite.

**Trade-offs:**
- Medusa v2 requires Node ≥ 20.19. All environments must be pinned accordingly.
- `pg` (PostgreSQL driver), `dotenv`, `react`, and `react-dom` are direct dependencies; they are well-maintained, standard open-source packages without known critical vulnerabilities.
- pnpm hoisting for Medusa packages slightly relaxes strict isolation; the scope is intentionally limited to `*medusa*` and `*@mikro-orm*` patterns.
- Medusa Admin UI is bundled but served separately; admin credentials must never be exposed to the browser via storefront code.
