# ADR 006 — Catalog Data Modeling and Database Seeding

**Date:** 2026-10-31  
**Status:** Accepted  

---

## Context

With Medusa v2 backend, PostgreSQL, Redis, and an initial administrator account provisioned, the database requires initial commercial and catalog data to enable:
1. Operational management via the Admin Dashboard (`http://localhost:9000/app`).
2. Catalog querying and product browsing by the Next.js Storefront (`apps/storefront`).

To represent an authentic Sardinian winery ("Cantina de Li Chiai"), the data model must establish sales channels, currency (EUR), regional tax rules (Italian IVA at 22%), stock inventory locations, wine categories, product variants, and a publishable API key for secure storefront consumption.

---

## Alternatives

| Option | Pros | Cons |
|---|---|---|
| **Medusa v2 Workflow-driven Seed Script (`medusa exec`)** | Validated via core workflows, triggers remote link modules automatically, reproducible across all local and CI environments, idempotent | Requires authoring TypeScript seed script using Medusa v2 workflows |
| **Raw SQL Scripts (`psql < seed.sql`)** | Fast execution | Bypasses Medusa business logic, breaks MikroORM relations and link modules, brittle to schema migrations |
| **Manual Admin UI Entry** | Visual feedback | Not reproducible; wiped on database reset; slows down developer onboarding and testing |

---

## Decision

Implement an automated seed script at `apps/backend/src/scripts/seed.ts`, executed via `pnpm --filter @winery/backend run seed` (`medusa exec ./src/scripts/seed.ts`).

The script applies Medusa v2 core workflows to provision:
1. **Store Identity**: Rename default store to *Cantina de Li Chiai* with default currency EUR.
2. **Sales Channel & Stock Location**:
   - Link *Default Sales Channel* to *Magazzino Cantina de Li Chiai* (Tempio Pausania, SS, Italy).
3. **Region & Tax Settings**:
   - Region: *Italy* (currency: `eur`, countries: `["it"]`, payment provider: `pp_system_default`).
   - Tax Region: Country `it` with default 22% IVA tax rate.
4. **Wine Categories**:
   - *Vini Bianchi* (`vini-bianchi`)
   - *Vini Rossi* (`vini-rossi`)
   - *Riserve* (`riserve`)
5. **Initial Wine Portfolio**:
   - *Vermentino di Gallura DOCG Superiore* (White wine, 18.50 €)
   - *Cannonau di Sardegna DOC Riserva* (Red wine, 24.00 €)
   - *Cagnulari Isola dei Nuraghi IGT* (Red wine, 21.00 €)
   - Each wine configured with option `Formato` ("Bottiglia 750ml"), variant SKU, price in EUR, and status `published`.
6. **Storefront Publishable API Key**:
   - Generates a publishable key (`Web Storefront Key`) linked to the *Default Sales Channel*, outputting the token for storefront consumption.

---

## Consequences

**Positive:**
- Zero manual configuration required after clean database setup or container recreation.
- Strict compliance with `.agent/rules/backend.md`: business logic executed through official workflows rather than raw database inserts.
- Safe storefront integration: the Next.js frontend can query published products immediately using the generated publishable API key.

**Trade-offs:**
- Initial inventory levels and advanced shipping rates (fragile bottle shipping) will be extended in dedicated shipping modules (Fase 3).
