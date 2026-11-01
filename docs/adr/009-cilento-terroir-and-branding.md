# ADR 009 — Cilento Terroir Alignment, Branding and Earthy Color Palette

**Date:** 2026-11-01  
**Status:** Accepted (Supersedes the territorial branding and wine appellation specifications of [ADR 006](file:///home/filippo/Cantina_de_Li_Chiai/docs/adr/006-catalog-data-modeling-and-seeding.md))  

---

## Context

*Cantina de Li Chiai* is territorially located in the **Parco Nazionale del Cilento, Vallo di Diano e Alburni** in the province of **Salerno (Campania)**, rather than in Sardinia as initially assumed during the catalog bootstrapping in ADR 006.

The user explicitly requested:
1. Re-anchoring all territorial descriptions, locations, labels, and wine portfolio to the Cilento and Salerno wine heritage (*Fiano del Cilento DOC*, *Aglianico del Cilento DOC Riserva*, *Cilento DOC Rosso / Paestum IGT*).
2. Updating the design tokens and UI color palette to organic, terroir-adequate shades reflecting Cilento nature (Aglianico wine ruby, olive grove green, flysch sandstone, subtle terracotta) without excessive flashy ornaments or fake gold accents ("non fare cose eccessive").
3. Updating all visual imagery and labels so they authentically reflect the winery's genuine geographical identity.

---

## Alternatives

| Option | Pros | Cons |
|---|---|---|
| **Hardcode Cilento copy in components with generic wine colors** | Quick implementation | Violates `.agent/rules/storefront.md` (no hardcoded strings, no i18n support) and fails to convey the unique Cilento terroir |
| **Comprehensive Cilento Terroir Engine (Full i18n + Organic Palette Tokens + High-Res Cilento Assets)** | Complete territorial accuracy, strict i18n parity (`it`/`en`), cohesive earthy aesthetic rooted in Flysch soil and olive groves, fully reversible and maintainable | Requires updating fallback datasets, dictionary files, CSS custom theme tokens, and generating authentic photo assets |
| **Overly saturated, decorative theme with heavy animations** | Flashy appearance | Explicitly rejected by user directive ("non fare cose eccessive"); distracts from the authentic agricultural nature of the territory |

---

## Decision

1. **Brand Identity & Terroir Geolocation:**
   - Anchor location to: *Località Li Chiai, Parco Nazionale del Cilento — Salerno (SA), Campania, Italia*.
   - Focus storytelling and value pillars on the **Flysch Cilentano** (alternating sandstone and marl), centuries-old olive trees, and Tyrrhenian sea breezes.

2. **Catalog Appellations & Fallback Data (`apps/storefront/lib/data/products.ts`):**
   - White: *Fiano del Cilento DOC* (13.5% vol., crisp, mineral, notes of broom and Mediterranean herbs).
   - Red Riserva: *Aglianico del Cilento DOC Riserva* (14.5% vol., 18 months oak barrel aging, ripe marasca and spices).
   - Red Blend: *Cilento DOC Rosso - Paestum IGT* (14.0% vol., Aglianico & Piedirosso blend, velvety tannins).

3. **Subtle Organic Design Tokens (`apps/storefront/app/globals.css`):**
   - *Aglianico Deep Ruby:* `#24090e`, `#3d0f18`, `#521521`, `#691c2b`
   - *Cilento Park Olive:* `#1c261e`, `#2a392d`, `#394d3d`, `#4c6651`
   - *Flysch Sandstone & Terracotta:* `#7a3519`, `#994421`, `#cf693c`, `#de835b`
   - *Ivory / Pergamena neutral canvas:* `#fbf9f5`, `#f4efe5`, `#eae1d2`
   - *Discreet antique gold accents:* `#b88732`, `#cca04d` (restricted to micro-accents and badges, eliminating gaudy neon yellow gradients).

4. **Authentic Visual Imagery (`apps/storefront/public/images/`):**
   - Generated authentic landscape photography of rolling vineyard hills in Cilento with olive groves and the Monti Alburni backdrop (`hero-vineyard.jpg`).
   - Generated realistic product bottle photography with clean, authentic labels for *Fiano del Cilento DOC*, *Aglianico del Cilento DOC Riserva*, and *Cilento DOC Rosso*.

---

## Consequences

**Positive:**
- Complete geographical consistency across SEO metadata, OpenGraph cards, legal footers, product catalog, customer service notices, and imagery.
- Strictly adheres to `.agent/rules/storefront.md`: 100% of text handled through bilingual i18n dictionaries (`it`, `en`).
- The user experience feels sober, dignified, and rooted in the authentic Campania countryside.

**Trade-offs:**
- Backend seed script (`apps/backend/src/scripts/seed.ts`) will be updated when Medusa catalog seeding is re-run for database synchronization.
