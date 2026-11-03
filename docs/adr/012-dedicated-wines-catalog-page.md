# ADR 012 — Dedicated Wines Catalog Page (`/vini`) & Filter Architecture

**Date:** 2026-11-01  
**Status:** Accepted  
**Extends:** [ADR 007](file:///home/filippo/Cantina_de_Li_Chiai/docs/adr/007-storefront-catalog-and-i18n-architecture.md), [ADR 010](file:///home/filippo/Cantina_de_Li_Chiai/docs/adr/010-dynamic-product-routing-and-pdp-architecture.md), [ADR 011](file:///home/filippo/Cantina_de_Li_Chiai/docs/adr/011-full-screen-hero-and-floating-navbar.md)  

---

## Context

While the initial storefront featured an embedded catalog section (`#catalog`) on the homepage, a luxury artisanal winery requires a dedicated Product Listing Page (PLP) reachable via *"I Nostri Vini"* in the navigation bar. 

Customers browsing the catalog require:
1. A focused, distraction-free environment to browse all labels without scrolling past homepage narrative sections.
2. Multi-dimensional filtering: by category (Whites, Reds, Reserves), price range (Under €30, Over €30), and text search.
3. Multi-criteria sorting: by featured recommendation, price (ascending/descending), alcohol percentage, and alphabetical title.
4. Full SEO indexing: dedicated canonical metadata, OpenGraph tags, and breadcrumbs (`Home > I Nostri Vini`).

---

## Alternatives

| Option | Pros | Cons |
|---|---|---|
| **Homepage Anchor Only (`/#catalog`)** | No extra routes to maintain | Lacks advanced multi-dimensional filtering, no dedicated SEO landing page, poor UX when linking externally |
| **Dedicated Server Page with Client Filter Island (`/vini`)** | Fast initial SSR load, full SEO metadata, instantaneous client-side filtering without page reloads, clean URL sharing | Requires client state management and bilingual i18n synchronization |
| **Client-Only SPA Route** | Easy state | Poor SEO, slower time to interactive on slow mobile networks |

---

## Decision

1. **Server Component Page (`apps/storefront/app/vini/page.tsx`):**
   - Implemented as an asynchronous Server Component that concurrently loads products and categories on the server via `getProducts()` and `getCategories()`.
   - Generates dynamic SEO metadata (`generateMetadata`) tailored to Cilento DOC and Paestum IGT denominations.
   - Streamlined layout: eliminated the tall dark hero banner to present the interactive filter bar and wine cards immediately at full-screen viewport height upon page load, topped by the floating smoked Aglianico navbar and clean breadcrumbs.

2. **Interactive Filter Island (`apps/storefront/components/WinesCatalogView.tsx`):**
   - Created a responsive client component managing instant faceted filtering:
     - Text search across title, grape varieties, and soil characteristics.
     - Category pills (*Tutti i Vini*, *Vini Bianchi*, *Vini Rossi & Riserve*, *Riserve Speciali*).
     - Price range buttons (*Tutti i prezzi*, *Fino a 30 €*, *Oltre 30 €*).
     - Sorting selector (*In Evidenza*, *Prezzo crescente/decrescente*, *Gradazione alcolica*, *Nome A-Z*).
   - Real-time bottle counter and one-click filter reset button.
   - 3-column symmetrical grid rendering reusable `WineCard` components.

3. **Global Navigation Integration (`Navbar.tsx` & `Footer.tsx`):**
   - Updated desktop and mobile *"I Nostri Vini"* navigation links from anchor `/#catalog` to `/vini`.
   - Updated footer product links to use Next.js `<Link>` with direct paths (`/prodotti/[handle]` and `/vini?categoria=riserve`).

---

## Consequences

**Positive:**
- Complete e-commerce browsing experience matching luxury wine retail standards.
- Instantaneous client-side filtering without round-trip network latency.
- Strict i18n compliance (zero hardcoded strings, complete Italian and English parity).
- Fully accessible with semantic HTML5 elements and keyboard navigation.

**Trade-offs:**
- Requires keeping category handles in sync with Medusa v2 product tags.
