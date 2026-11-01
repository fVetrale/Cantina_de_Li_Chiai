# ADR 008 — Retail E-commerce UI Architecture (Signorvino Benchmark)

**Date:** 2026-11-01  
**Status:** Accepted  

---

## Context

Following the initial catalog scaffolding, visual feedback on the customer interface required abandoning generic "SaaS/dashboard" patterns in favor of a specialized, high-converting wine retail e-commerce design.

A video walkthrough of Italy's leading wine retailer (**Signorvino**, `signorvino.com`) was provided by the user as the primary design and structural benchmark. The goal was to translate that proven retail e-commerce architecture into a bespoke, authentic experience for **Cantina de Li Chiai** (Tempio Pausania, Gallura, Sardinia).

---

## Alternatives

| Option | Pros | Cons |
|---|---|---|
| **Generic Flat Grid (SaaS Style)** | Fast to implement, modular | Lacks brand warmth, feels like software rather than a winery; poor emotional resonance for wine buyers |
| **Pure Storytelling / Editorial Lookbook** | Highly immersive, editorial aesthetic | Lower conversion clarity, complex buying flow, missing persistent search and category filtering |
| **Retail Wine Benchmark (Signorvino Architecture)** | Proven conversion design, dual-level header, persistent search, prominent bottle cards with quick-add actions, trust tickers, and promotional banners | Requires building multiple dedicated retail sections (tickers, two-tier navigation, promotional cards, social mosaic, newsletter) |

---

## Decision

We adopted the **Retail Wine E-commerce Architecture** inspired by the Signorvino benchmark:

1. **Two-Level Header & Search Navigation (`Navbar.tsx`)**:
   - **Level 1 (Burgundy Brand Bar `#661022`)**: Brand crest, centralized search input (*"Cosa desideri degustare oggi?"*), language toggle (*IT/EN*), customer account, wishlist, and cart pill displaying live total amount in Euros (`🛒 € 0,00`).
   - **Level 2 (Secondary Categories Bar)**: Quick category links (*Tutti i Vini*, *Bianchi DOCG*, *Rossi DOC*, *Riserve*, *La Cantina*, *Il Terroir*, *Visite & Degustazioni*, *Contatti*).

2. **Quality & Shipping Ticker Bar (`TickerBar.tsx`)**:
   - Continuous guarantees bar: insured climate-controlled packaging, free delivery over €90, 100% manual harvest, and direct cellar dispatch.

3. **Cinematic Hero Showcase (`HeroSection.tsx`)**:
   - High-contrast vineyard photography from Tempio Pausania with layered gradient overlays, artisanal harvest badge, and primary CTA buttons.

4. **Dedicated Wine Showcase ("La nostra grande cantina di Gallura") (`WineCatalog.tsx` & `WineCard.tsx`)**:
   - Italic serif title matching Signorvino's headline.
   - Filter pills for instant category switching.
   - Tall vertical product cards: appellation badge (*DOCG Superiore / DOC Riserva / IGT*), price top-right, centered high-res bottle with hover zoom, technical metadata (*Gallura | 750ml | 13.5% vol.*), and high-visibility *"Aggiungi"* action pill.
   - Embedded corporate/gift box card alongside wine listings.

5. **Customer Value Pillars & Social Mosaic (`FeaturesSection.tsx`, `SocialMosaic.tsx`, `NewsletterSection.tsx`)**:
   - 3 service pillars (Granitic Terroir, Mediterranean Microclimate, Insured Shipping).
   - Lifestyle and territory social mosaic (@cantinadelichiai).
   - Signorvino-style deep green newsletter club signup bar.

6. **Comprehensive Multi-Column Footer (`Footer.tsx`)**:
   - Wine portfolio links, cellar information, customer service, accepted payment methods (Visa, Mastercard, PayPal, Apple Pay, Scalapay), and mandatory legal alcohol consumption warnings.

---

## Consequences

**Positive:**
- Immediate familiarity and trust for Italian and European wine consumers accustomed to platforms like Signorvino and Tannico.
- Strict compliance with `.agent/rules/storefront.md` (Server Components by default, ISR caching, complete i18n dictionaries, and no hardcoded text).
- Seamless user journey from browsing to cart addition.

**Trade-offs:**
- Increased component surface area, requiring consistent design token maintenance across all sections.
