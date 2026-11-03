# 020. Dynamic Scalable Sliding Pages Catalog Architecture

## Context
Following the integration of authentic identity and products from the DeLalla archive, users encountered two distinct challenges on the live storefront:
1. **Outdated Seed & Missing Categories in Medusa Backend**: The running Medusa backend was still serving legacy test wines (`Fiano del Cilento DOC`, `Cilento DOC Rosso`, `Aglianico Riserva`) and lacked the 4 estate categories (`Vini`, `Insaccati`, `Carne fresca`, `Olio EVO`). Consequently, navigating to other categories returned zero products in the UI.
2. **Static Layout Scalability**: The homepage catalog displayed products in a rigid, vertical grid. The user specifically required the section to scale dynamically with the quantity of products:
   - When a category has few items (e.g. 1, 2, or 3 products), it should display them cleanly without empty space or redundant controls.
   - When items exceed the viewport limit (e.g. 14 products in the full catalog, or 50+ items in future catalog expansions), the interface must automatically generate **"pagine scorrevoli"** (sliding pages with carousel motion, left/right navigation controls, status indicators, and numbered pagination).

## Alternatives
1. **Infinite Vertical Scrolling / Load More Button**:
   - *Cons*: Pushes all subsequent sections (Story, PromoBanner, SocialMosaic, Footer) hundreds of pixels down the page, resulting in layout fatigue and poor ergonomics on mobile.
2. **Pure Carousel Track (1 Card per step)**:
   - *Cons*: Requires dozens of clicks to explore 14 to 50 items and lacks page-based grouping and direct jump navigation.
3. **Dynamic Responsive Paginated Slider ("Pagine Scorrevoli") with Dual View Toggle (Chosen)**:
   - Adapts `itemsPerPage` responsively (3 on desktop, 2 on tablet, 1 on mobile).
   - Dynamically calculates `totalPages = Math.ceil(total / itemsPerPage)` and groups items into discrete animated page slides.
   - Hides navigation controls when `totalPages <= 1`, but automatically activates previous/next circular buttons, touch swipe listeners, page indicators (`Pagina X di Y`), and numbered pills when `totalPages > 1`.
   - Includes a view toggle between "Pagine scorrevoli" (default) and "Griglia completa" for user preference.

## Decision
1. **Medusa Backend Database Reseeding (`apps/backend/src/scripts/seed.ts`)**:
   - Purged obsolete legacy test handles (`fiano-del-cilento-doc`, `aglianico-del-cilento-doc-riserva`, `cilento-doc-rosso-paestum-igt`).
   - Created the 4 authentic categories: `Vini`, `Insaccati`, `Carne fresca`, `Olio EVO`.
   - Seeded all 14 authentic DeLalla catalog products with their true prices, units, and variants into the local Postgres database.
2. **Storefront Data Merging & Resiliency (`apps/storefront/lib/data/products.ts`)**:
   - Upgraded `getProducts()` to filter out obsolete legacy handles and merge Medusa products with `FALLBACK_PRODUCTS`, ensuring all 14 authentic items across all 4 categories are always available.
   - Mapped `getWineMetadata()` directly from exact product definitions to guarantee complete data fidelity (unit prices, badges, stock availability, images).
   - Ensured `getCategories()` always provides the 4 primary categories (`vini`, `insaccati`, `carne`, `olio`).
3. **Dynamic Scalable Sliding Pages (`apps/storefront/components/WineCatalog.tsx`)**:
   - Implemented an animated sliding viewport using `transform: translateX(-${safeCurrentPage * 100}%)` with hardware-accelerated CSS transitions.
   - Dynamically computes category product counts on the filter pills (`Tutti (14)`, `Vini (4)`, `Insaccati (5)`, `Carne fresca (3)`, `Olio EVO (2)`).
   - Automatically adapts controls: hides arrows and pagination when items fit on 1 page; emerges full pagination when items exceed the page size.
   - Integrated touch swipe gestures (`onTouchStart`, `onTouchMove`, `onTouchEnd`) for mobile and tablet devices.
   - Added corresponding pagination support to the dedicated `/vini` catalog view (`WinesCatalogView.tsx`).

## Consequences
- **Positive Impacts**:
  - The live website immediately reflects the true, authentic products across all categories without empty states.
  - Future catalog additions (e.g., adding 20 or 50 new items tomorrow) scale automatically: new sliding pages emerge seamlessly without code changes.
  - Performance remains high: Next.js static page generation and type checking pass with 0 errors and zero ESLint warnings.
  - Mobile ergonomics and accessibility are preserved through touch swipe and keyboard navigation.
- **Trade-offs & Considerations**:
  - CSS transforms require GPU memory during rapid swiping, but performance is optimized using `will-change-transform` and discrete page partitioning.
