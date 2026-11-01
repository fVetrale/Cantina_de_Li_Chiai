# ADR 010 — Dynamic Product Routing (`[handle]`) and Product Detail Page Architecture

**Date:** 2026-11-01  
**Status:** Accepted  

---

## Context

To avoid generating rigid, static HTML pages for each single wine and to allow seamless catalog expansion from the Medusa v2 backend, the storefront requires a dynamic routing architecture based on the product `handle`.

Each wine must be loaded dynamically on demand while providing:
1. Excellent SEO performance with dynamic OpenGraph and schema metadata.
2. Compliance with `.agent/rules/storefront.md` (Server Components by default, ISR caching, complete bilingual i18n, accessibility, optimized images).
3. Rich sensory and technical evaluation: sensory tasting notes, Cilento flysch geological notes, local gastronomic food pairings, and enological parameters.
4. Interactive client islands for quantity adjustments, real-time total price calculation, and add-to-cart feedback.

---

## Alternatives

| Option | Pros | Cons |
|---|---|---|
| **Hardcoded Static Pages (`app/fiano/page.tsx`, etc.)** | Simple setup | Unmaintainable, violates DRY principles, requires manual code deployments whenever a wine is edited or added in Medusa |
| **Pure Client-Side Rendering (`"use client"` PDP with `useEffect`)** | Fast interactive state | Poor SEO and social card scrapability, flash of empty content (FOOC), higher roundtrip latency from the browser |
| **Next.js App Router Dynamic Route (`app/prodotti/[handle]/page.tsx`) with Server Component + ISR + Client Islands** | Optimal SEO, instant initial load with ISR caching (`revalidate: 60`), automated route generation (`generateStaticParams`), isolated client interactivity | Requires clean separation between server data fetching and client state components |

---

## Decision

Implement the dynamic route `apps/storefront/app/prodotti/[handle]/page.tsx` adhering to the Server Component pattern:

1. **Data Layer (`apps/storefront/lib/data/products.ts`):**
   - Implemented `getProductByHandle(handle: string)`: queries Medusa Store API (`/store/products?handle=...`) with ISR caching (`next: { revalidate: 60 }`), merging with fallback metadata when offline.
   - Implemented `getRelatedProducts(currentHandle: string)`: supplies related Cilento wines excluding the active product.
   - Defined `WineDetails` contract encapsulating tasting notes (visual, olfactory, gustatory), flysch terroir data, regional food pairings, and technical specs.

2. **Server-Side Generation & SEO:**
   - `generateStaticParams()` pre-renders known catalog handles at build time while allowing on-demand ISR for new products.
   - `generateMetadata()` generates dynamic HTML title, description, and OpenGraph tags with the wine bottle image and appellation.

3. **Interactive Client Islands:**
   - [ProductPurchaseSection.tsx](file:///home/filippo/Cantina_de_Li_Chiai/apps/storefront/components/ProductPurchaseSection.tsx): manages quantity counter, real-time total computation, and add-to-cart state.
   - [ProductTabs.tsx](file:///home/filippo/Cantina_de_Li_Chiai/apps/storefront/components/ProductTabs.tsx): interactive tab navigation between *Note di Degustazione*, *Terroir & Flysch*, *Abbinamenti Cilentani*, and *Scheda Tecnica*.

4. **Fault Tolerance & 404:**
   - Invalid handles trigger Next.js `notFound()`, rendering a custom themed [not-found.tsx](file:///home/filippo/Cantina_de_Li_Chiai/apps/storefront/app/not-found.tsx) with a return link to the catalog.

---

## Consequences

**Positive:**
- Eliminates hardcoded wine pages: any product added or updated in Medusa v2 is immediately available under `/prodotti/[handle]`.
- First Contentful Paint (FCP) and Cumulative Layout Shift (CLS) remain optimal thanks to Server Components.
- Complete bilingual i18n support (`it`, `en`) without any hardcoded copy.
- Full catalog cards on the homepage now link directly to their corresponding dynamic pages.

**Trade-offs:**
- Medusa API and local fallback models must be kept synchronized regarding metadata attributes.
