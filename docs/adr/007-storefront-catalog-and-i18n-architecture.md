# ADR 007 — Storefront Catalog Integration, ISR Caching, and Bilingual Architecture

**Date:** 2026-11-01  
**Status:** Accepted  

---

## Context

Following the core backend setup, seeding of wine products, and configuration of the publishable API key in Medusa v2, the platform required implementing the customer-facing storefront catalog (`apps/storefront`).

Under project guidelines and repository rules (`.agent/rules/storefront.md`):
1. **Server Components by default**: Pages and catalog listings must execute on the server without leaking administrative credentials or sensitive tokens to the client.
2. **ISR / Data Caching**: Catalog data changes infrequently; per-request uncached backend fetches degrade performance and create unnecessary load on the database.
3. **Strict Internationalization (i18n)**: All user-facing strings must be localized (Italian default, English secondary) without hardcoded text in UI components.
4. **Legal Compliance**: Italian and EU regulations mandate verifying the legal drinking age (18+) before allowing customers to browse and purchase alcoholic beverages.
5. **Luxury Brand Identity**: The interface must convey the prestige, terroir, and craftsmanship of Cantina de Li Chiai (Tempio Pausania, Gallura, Sardinia).

---

## Alternatives

| Option | Pros | Cons |
|---|---|---|
| **Client-side Fetching (SPA/SWR/React Query)** | Simple client-side state, easy dynamic filtering | Slower initial page load (waterfalls), exposes store queries to client inspection, degraded SEO and web vitals |
| **Server Components + ISR Fetch + Client Filter Boundaries** | Maximum SEO, fast TTFB, cached data at the edge/server (`next: { revalidate: 60 }`), instant client-side category filtering, zero admin key exposure | Requires explicit separation of Server vs. Client component boundaries |
| **Static Export (`next export`)** | Pure static files, minimal server requirement | Lacks support for dynamic localized query params, ISR revalidation, and integrated checkout flows |

---

## Decision

We adopted **Server Components with ISR Caching and Isolated Client Boundaries**:

1. **Server-Side Data Layer (`apps/storefront/lib/data/products.ts`)**:
   - Fetches products from Medusa v2 `/store/products` using the publishable API key header `x-publishable-api-key`.
   - Employs Next.js ISR caching (`fetch(..., { next: { revalidate: 60 } })`) for 60-second background revalidation.
   - Provides resilient fallback to curated Gallura winery catalog data in case the backend service is temporarily offline or undergoing migration.

2. **Bilingual Localization System (`apps/storefront/lib/i18n.ts`)**:
   - Zero hardcoded UI text in components. All strings (announcement, navigation, hero, terroir features, catalog filters, tasting notes, age gate, legal notices, and footer) are centralized in strongly typed bilingual dictionaries (`it`, `en`).
   - Supports query-parameter based locale toggling (`?lang=en`) with clean URL handling.

3. **Client vs. Server Component Architecture**:
   - **Server Components**: `HomePage` (`page.tsx`), `HeroSection`, `FeaturesSection`, `StorySection`, and `Footer`.
   - **Client Components**: `Navbar` (mobile menu toggle & language switcher), `WineCatalog` (category filter pills and active selection), `WineCard` (interactive cart feedback), and `AgeGateModal` (legal drinking age verification with session storage persistence).

4. **Visual Design & Typography**:
   - Bespoke luxury palette configured via Tailwind CSS v4 `@theme inline`: deep burgundy (`--color-wine-900: #380812`), warm champagne gold (`--color-gold-500: #c99e28`), and cellar slate.
   - Elegant typography pairing: `Cormorant Garamond` serif for editorial headlines and `Plus Jakarta Sans` for clean, legible body text.
   - High-fidelity visual assets using `next/image` with explicit dimensions and responsive sizes.

---

## Consequences

**Positive:**
- High Google Lighthouse / Core Web Vitals performance due to server rendering and optimized images.
- Full compliance with `.agent/rules/storefront.md` and Italian alcohol e-commerce regulations.
- Seamless developer and customer experience: storefront operates cleanly whether connected to live Medusa v2 or running independently with fallback data.
- Smooth transition path for upcoming checkout and Stripe payment integration.

**Trade-offs:**
- Requires maintaining dual dictionary files (`it`, `en`) whenever new user-facing strings or product categories are introduced.
