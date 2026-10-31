# ADR 004 — Next.js Storefront Setup

**Date:** 2026-10-31  
**Status:** Accepted  

---

## Context

The winery e-commerce platform requires a modern, accessible, SEO-optimized customer-facing storefront (`apps/storefront`). The storefront must interface with the headless Medusa v2 backend (`apps/backend`), render catalog and product pages with high performance using incremental static caching (ISR), and handle customer journeys including age verification, cart management, and secure checkout.

Per repository rules (`.agent/rules/storefront.md`), the architecture requires Server Components by default, internationalization support, strict access control (no admin credentials in the browser), and high accessibility standards.

---

## Alternatives

| Option | Pros | Cons |
|---|---|---|
| **Next.js (App Router, React 19)** | First-class React Server Components, native ISR/caching, built-in SEO and image optimization (`next/image`), standard for Medusa v2 | Server/Client component mental model; slightly larger dependency footprint |
| **Remix / React Router v7** | Clean nested data loading, standard Web Fetch APIs | Smaller ecosystem for headless e-commerce integrations, less native ISR/incremental caching support |
| **Astro** | Extremely fast static output, islands architecture | Complex e-commerce flows (cart state, checkout, customer session) require heavier hydration islands |
| **Vite SPA (React)** | Simple setup, fast local dev | Client-only rendering hurts SEO, slower initial load, requires exposing APIs directly to the browser |

---

## Decision

Initialize the frontend inside `apps/storefront` as a Next.js application (`@winery/storefront`) using:
- **Next.js (App Router)** with TypeScript
- **Tailwind CSS** for design system styling
- **ESLint** for static code analysis
- **pnpm workspace** integration (`pnpm-workspace.yaml`)

Key architectural rules:
1. **Server Components by default**: Pages and catalog listings execute on the server, fetching backend data without exposing admin credentials or leaking tokens.
2. **Client Components isolated**: Used strictly for interactive boundaries (cart drawers, age gate modal, checkout form inputs).
3. **Workspace package naming**: Named `@winery/storefront` to enable clean cross-workspace imports and unified monorepo scripting.

---

## Consequences

**Positive:**
- Strict adherence to monorepo conventions and `.agent/rules/storefront.md`.
- Zero nested Git repositories; dependencies managed exclusively through the pnpm workspace store.
- High SEO score and fast Time to First Byte (TTFB) for product catalog.

**Trade-offs:**
- Requires careful separation of Server and Client Components when stateful interactions (e.g., cart operations) are introduced in subsequent phases.
