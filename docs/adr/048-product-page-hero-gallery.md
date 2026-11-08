# 048. Product Page: Full-Screen Hero with the Bottle Gallery, Photo Shown Once

- **Status:** Accepted (2026-11-08).
- **Supersedes:** the product page layout of ADR 045, which had a dark hero with a photo plus three columns (purchase / gallery / accordion).
- **Related:** ADR 045 (editorial restyling), ADR 046/047 (reveal effects, selector-only `/vini`).

## Context
On the product page the wine photo appeared twice: in the dark hero and again in the center column gallery. The user asked:
- to show the photos **only at the top**, with a selector to browse the bottle photos;
- that choosing a wine from the `/vini` selector opens the wine **full screen**;
- that the page then scrolls down to order **as it does today**.

The user's choices (recommended options):
1. **Drop the small bottle PNGs from the selector.** They are 354–400 px and would blur when large.
2. **Drop the fullscreen lightbox**, now redundant.

## Alternatives
1. **A full-bleed photo as the hero background with the title over it.** Rejected for now: the photos are portrait and about 900 px wide, so they would be cropped and blurred on wide screens. To reconsider with professional high-resolution packshots.
2. **Keep the old `WineBottleGallery` and only move it.** Rejected: it was built for a white card with a lightbox. A smaller dedicated component is simpler and fits the dark hero.
3. **A new full-screen hero: text on the left, a large portrait photo selector on the right, and a two-column purchase area below.** (Chosen)

## Decision
- **Hero (`app/prodotti/[handle]/page.tsx`):**
  - full viewport height, on the dark chiaroscuro vineyard;
  - **left:** appellation (gold label), the wine name as the page h1, category, short description and a **"Scorri per ordinare"** cue (animated line) linking to `#acquista`;
  - **right:** `WineHeroGallery`;
  - on mobile the gallery comes first, then the text;
  - name and photo fade in, so opening a wine from the selector feels like an entrance.
- **`components/WineHeroGallery.tsx`:**
  - one large portrait photo (3:4, capped to fit the viewport height) with a 500 ms cross-fade;
  - round arrows, thumbnails (current one gold), swipe on touch screens (40 px threshold) and the left/right arrow keys when focused;
  - accessibility: a `region` with `aria-roledescription="carousel"`, a polite live "Foto n di N", and inactive images that are `aria-hidden` with empty alt;
  - no autoplay, no lightbox, no library.
- **Photos:** the product's ambient photos only. Images under `/images/products/` (small PNGs) are filtered out, with a fallback to all photos if nothing else exists.
- **Below the hero:**
  - the sticky bar with the 4 wines (unchanged);
  - then **two columns** (one below 900 px): breadcrumb plus the unchanged purchase panel on the left, the accordion on the right;
  - **nothing else below:** the user removed the 50/50 "Scopri la cantina" section and the "Scopri anche" related-wine cards (2026-11-08), because the other wines are already in the sticky bar. `getRelatedProducts` stays in the data layer, unused by the page.
- **Removed:** `components/WineBottleGallery.tsx`, which is no longer used anywhere.
- **i18n:** `pdp.scrollToOrder`, `pdp.galleryLabel`, `pdp.galleryPrev`, `pdp.galleryNext`, `pdp.galleryPhoto` (it/en).

## Consequences
- **Positive:**
  - The photo appears once, large and sharp.
  - Opening a wine from the selector lands on a full-screen presentation.
  - The page is shorter and focused: hero, wines bar, purchase.
  - Ordering stays one scroll (or one click on the cue) away.
- **Trade-offs:**
  - On tablets and phones the hero is taller than the screen, because the photo and the text are stacked.
  - The 2× zoom of the old lightbox is gone.
  - Each wine shows 3 photos, some shared between wines, until the client sends professional photos.
- **Verified (2026-11-08)**, headless Chrome on the user's dev servers:
  - 375/768/1280/1920: no horizontal overflow; the hero fills the viewport on desktop;
  - gallery shows `cilento-rosso.jpg`, `Rosso.jpeg` and `raccolta.jpeg` for Chiai Rosso (no PNG);
  - the next arrow, the third thumbnail and the → key move between photos, and the live text updates;
  - "Scorri per ordinare" reaches the purchase section;
  - add to cart works (badge 1 → 2);
  - opening Chiai Bianco from the `/vini` selector lands on the hero at the top;
  - after removing the two sections: Chiai Rosso and Bianco Dolce answer 200, with one carousel, the purchase section, "Aggiungi al carrello", and no "Scopri Anche" or 50/50 section.
  - **DoD:** lint, typecheck and tests pass (169 storefront, 24 backend).
- **Security notes:** visual only. No new data access or input; the purchase panel and Server Actions are unchanged.
