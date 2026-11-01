# ADR 011 — Full-Screen Hero & Floating Glassmorphism Navbar

**Date:** 2026-11-01  
**Status:** Accepted (Supersedes [ADR 008](file:///home/filippo/Cantina_de_Li_Chiai/docs/adr/008-retail-ecommerce-ui-architecture.md) navigation architecture)  

---

## Context

The initial retail navigation header implemented in ADR 008 comprised three stacked horizontal bars (utility announcement bar, main e-commerce bar, and secondary category menu). While functional, this covered significant screen real estate and cut off the visual storytelling of the Cilento landscape above the fold.

The user requested two specific adjustments:
1. When opening the website, the hero vineyard image must occupy 100% of the viewport height (`min-h-screen` / full-screen immersive view).
2. The guarantee information ("Spedizioni garantite...", "Spedizione gratuita...", etc.) must be placed strictly on a single horizontal line without line breaks.
3. The navigation header must float gracefully as a semi-transparent glassmorphic pill bar over the hero background.

---

## Alternatives

| Option | Pros | Cons |
|---|---|---|
| **Stacked Header with Fixed Min-Height Hero** | Shows all links and guarantees immediately | Clutters the screen, causes text wrapping on medium screens, shows partial catalog above fold |
| **Immersive 100vh Hero with Floating Glass Bubble & Docked Single-Line Ticker** | 100% full-screen visual impact, zero text wrapping (`whitespace-nowrap flex-nowrap`), luxurious artisanal feel, clean separation between hero and catalog | Requires managing viewport heights and overflow scroll on smaller mobile devices |

---

## Decision

1. **Full-Screen Hero ([HeroSection.tsx](file:///home/filippo/Cantina_de_Li_Chiai/apps/storefront/components/HeroSection.tsx)):**
   - Configured `min-h-screen flex flex-col justify-between overflow-hidden`.
   - The high-resolution vineyard photography covers 100% of the viewport height.
   - Headline and CTA buttons are vertically centered within the viewport.
   - The guarantee ticker is docked directly along the bottom edge of the hero screen.

2. **Single-Line Guarantee Ticker ([TickerBar.tsx](file:///home/filippo/Cantina_de_Li_Chiai/apps/storefront/components/TickerBar.tsx)):**
   - Configured `flex-nowrap whitespace-nowrap overflow-x-auto no-scrollbar` with `shrink-0` on every badge and separator dot.
   - Set background to semi-transparent frosted Aglianico glass (`bg-[#18060b]/85 backdrop-blur-md border-t border-gold-400/20`), preserving the background image continuity.

3. **Floating Navbar ([Navbar.tsx](file:///home/filippo/Cantina_de_Li_Chiai/apps/storefront/components/Navbar.tsx)):**
   - Floats at `fixed top-3 sm:top-5` with `bg-[#20080e]/85 backdrop-blur-xl border border-gold-400/35 rounded-full shadow-2xl`.

---

## Consequences

**Positive:**
- Complete 100vh full-screen first impression: no white catalog peek before scrolling.
- Zero text wrapping on the guarantees bar across all screen widths.
- Maintains strict i18n parity and Server Component performance.
