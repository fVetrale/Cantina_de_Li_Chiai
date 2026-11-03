# 019. Authentic Brand Identity and Multi-Category Farm Catalog

## Context
Cantina de Li Chiai originally started with a baseline wine catalog model and generic placeholder copy. Through the discovery and analysis of the authentic archive document (`sito_li_chiai_8_ottobre_DeLalla.html`), the true heritage, family identity, and artisanal product range of the estate were revealed:
1. **Founders & Story**: Founded and operated by Antonio and Matteo (father and son), rooted in their ancestral land known as "Li Chiai" in Abatemarco (Salerno), passed down across generations within the Parco Nazionale del Cilento.
2. **Artisanal Multi-Category Range**: Rather than exclusively producing bottled wines, the estate is an integrated agricultural reality with four distinct categories:
   - **Vini tipici**: Chiai Rosso, Rosso Vecchio, Chiai Bianco, Bianco Dolce.
   - **Insaccati artigianali cilentani**: Salsiccia Dolce, Salsiccia Piccante, Salsiccia di Cinghiale, Soppressata Dolce, Soppressata di Cinghiale (with precise per-kilogram pricing).
   - **Carne fresca di cinghiale e suino**: Misto Cinghiale per ragù/cottura lenta, Salsicce fresche di cinghiale, Bistecche di cinghiale.
   - **Olio Extra Vergine di Oliva**: Bottiglia 0,75 L e Latta 3 L da olive molite a freddo.
3. **Physical Cellar Experience & Contacts**: Real cellar location at Contrada Pozzo 15, Abatemarco (SA), direct email `cantina.salumeria.chiai@gmail.com`, and a signature cellar pickup perk offering a "piccolo tagliere degustativo omaggio" for local customer visits.

The challenge was to transition the storefront architecture from a mono-product wine shop to a rich, authentic farm and cellar portal, while honoring the user's requirement to preserve 3D studio wine bottle mockups for wines while embedding authentic product illustrations for food and oil products.

## Alternatives
1. **Strict Wine-Only Storefront**: Ignore the cured meats, fresh game meats, and olive oil, retaining only the 4 wines.
   - *Cons*: Misses the authentic identity, reduces average basket size, and ignores key revenue streams of the farm.
2. **Completely Separate Sub-Stores (Winery vs. Salumeria)**: Build multi-tenant or multi-domain routing.
   - *Cons*: High cognitive load for customers, duplicated checkout sessions, complex state management, and fragmented branding.
3. **Unified Multi-Category Catalog Architecture (Chosen)**: Expand `WineProduct` to support multi-category attributes (`unitPrice`, `left` stock, optional `alcohol`, conditional technical specs), categorize products into 4 clear families (`vini`, `insaccati`, `carne`, `olio`), and upgrade navigation and filters accordingly.

## Decision
We adopted the **Unified Multi-Category Catalog Architecture**:
1. **Product Modeling (`apps/storefront/lib/data/products.ts`)**:
   - Expanded product model to include `unitPrice` (displaying per-kilo and per-liter metrics like `17,50 €/kg` alongside fixed package price), optional `alcohol`, and inventory count (`left`).
   - Integrated all 14 authentic DeLalla catalog items with authentic pricing (ranging from 7,00 € to 34,00 €).
   - Upgraded category taxonomy across `DEFAULT_CATEGORIES` to `vini`, `insaccati`, `carne`, `olio`.
2. **Authentic Storytelling & Copy (`apps/storefront/lib/i18n.ts`)**:
   - Replaced generic texts with the genuine family narrative of Antonio & Matteo and the land of "Li Chiai".
   - Maintained strict bilingual parity across Italian (`it`) and English (`en`).
   - Updated contact info (`Contrada Pozzo 15, Abatemarco (SA)`, `cantina.salumeria.chiai@gmail.com`, cellar visiting hours).
   - Integrated the cellar pickup promise: direct collection with complimentary local tasting board.
3. **UI & Navigation Component Enhancements**:
   - Navbar category dropdown and mobile drawer updated to feature all four product families.
   - Catalog view (`WinesCatalogView` and `WineCatalog`) updated with category filter tabs and resilient sorting (safe fallback for non-alcoholic items).
   - Product cards (`WineCard`) and purchase section (`ProductPurchaseSection`) display `unitPrice` chips, in-stock badges, and conditional wine specifications (omitting `Annata` and `Uve` for cured meats and oils).
   - Product tabs (`ProductTabs`) gracefully render technical specifications conditionally based on available item data.
4. **Authentic Visual Assets**:
   - Extracted all 14 authentic PNG illustrations to `/images/products/` for food and oil items.
   - Retained high-resolution wine bottle mockups for bottled wines as requested.

## Consequences
- **Positive Impacts**:
  - The storefront now accurately and vividly conveys the authentic culinary and viticultural heritage of Cantina de Li Chiai.
  - Multi-category support allows visitors to explore and purchase wines, salumi, fresh wild boar, and olive oil in a single unified flow.
  - Local pickup incentives are clearly articulated, driving real foot-traffic to Contrada Pozzo 15 in Abatemarco.
  - TypeScript types and Next.js builds remain 100% type-safe with zero compile or lint warnings.
- **Trade-offs & Considerations**:
  - Fresh meat orders require cold-chain delivery or local cellar pickup; storefront shipping rules should enforce pickup or express refrigerated logistics for the `carne` category as cart logic expands.
  - As inventory grows, backend Medusa synchronization for multi-category products will map to Medusa Product Categories and custom metadata.
