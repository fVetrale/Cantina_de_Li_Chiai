# ADR 013 — Estate & Historical Heritage Page Architecture (`/la-cantina`)

**Date:** 2026-11-01  
**Status:** Accepted  
**Extends:** [ADR 007](file:///home/filippo/Cantina_de_Li_Chiai/docs/adr/007-storefront-catalog-and-i18n-architecture.md), [ADR 009](file:///home/filippo/Cantina_de_Li_Chiai/docs/adr/009-cilento-terroir-and-branding.md), [ADR 011](file:///home/filippo/Cantina_de_Li_Chiai/docs/adr/011-full-screen-hero-and-floating-navbar.md)  

---

## Context

A core pillar of luxury artisanal wine branding is historical origin storytelling. While the homepage included a brief narrative slice (`#story`), visitors interested in the estate's heritage, winemaking philosophy, and subterranean barrel aging required a dedicated, immersive storytelling page reachable via *"La Cantina"* in the floating navigation header.

The user explicitly requested:
1. A dedicated page for *"La Cantina"* focused on historical background and estate heritage.
2. A focused central body featuring the history of the winery alongside authentic photography of the stone barrel cellar.
3. A clean, uncluttered layout containing only the central narrative body and the final footer (no promotional banners, mosaics, or secondary clutter).

---

## Alternatives

| Option | Pros | Cons |
|---|---|---|
| **Homepage Scroll Anchor (`/#story`)** | Keeps user on the single page | Cluttered with other sales modules, lacks depth for true winemaking heritage storytelling |
| **Dedicated Narrative Page with Clutter Modules** | Adds more cross-promotions | Distracts from the artisanal prestige and solemnity of the historical cellar |
| **Focused Heritage Page (`/la-cantina`) with Single Central Story Body & Final Footer** | Maximum focus on storytelling, high brand authority, fast SSR load, elegant typography, perfectly adheres to user requirements | Requires maintaining separate route and dedicated i18n dictionary |

---

## Decision

1. **Dedicated Route (`apps/storefront/app/la-cantina/page.tsx`):**
   - Implemented as a Server Component for optimal performance and SEO indexing.
   - Generates custom metadata (`generateMetadata`) in Italian and English.
   - Streamlined composition: floating smoked Aglianico navbar at the top, central narrative article, and the standard legal footer at the bottom.

2. **Artisanal Photography & Storytelling Layout:**
   - Features high-resolution photography (`estate-cellar.jpg`) depicting the ancient stone barrel room with Slavonian oak casks for *Aglianico del Cilento DOC Riserva*.
   - 3 prestige metric callouts: *100% Vendemmia Manuale*, *UNESCO Parco del Cilento*, and *Flysch Arenaria Minerale*.
   - 3 structured historical chapters:
     1. *Le Origini tra Ulivi e Arenarie* (UNESCO heritage and founding mission).
     2. *Il Flysch Cilentano: La Nostra Impronta Unica* (the geological marl and sandstone terroir).
     3. *L'Arte della Vendemmia Manuale e il Silenzio del Legno* (dawn harvesting and oak aging).
   - Dedicated master winemaker quote callout card and discreet CTA linking to `/vini`.

3. **Global Navigation Synchronization:**
   - Desktop and mobile links for *"La Cantina"* in `Navbar.tsx` updated from `/#story` to `/la-cantina`.
   - Footer link for *"Storia & Filosofia"* updated to `/la-cantina`.

---

## Consequences

**Positive:**
- Rich brand storytelling establishing the artisanal pedigree of Cantina de Li Chiai.
- Completely clean layout matching the user's explicit directive ("solo il footer finale").
- Strict i18n parity between Italian and English (`estatePage` dictionary in `lib/i18n.ts`).
- Semantic HTML (`<article>`, `<header>`, `<section>`, `<figure>`) ensuring high accessibility.

**Trade-offs:**
- Replaces in-page homepage scrolling for the estate link with a full route transition to `/la-cantina`.
