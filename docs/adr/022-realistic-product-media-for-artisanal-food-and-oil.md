# 022. Realistic Product Media for Artisanal Food and Oil

## Context
Following the integration of authentic products from the DeLalla historical archive, the storefront used 3D mockup studio photography for wines (`fiano-cilento.jpg`, `cilento-rosso.jpg`, `aglianico-cilento.jpg`), while the food and oil categories (Insaccati, Olio EVO) relied solely on cut-out digital PNG illustrations extracted from the historical archive HTML document.
While these illustrations preserved historical accuracy, their flat cut-out presentation contrasted sharply with the rich, tactile, and realistic photographic style of the wine bottles. The user requested generating high-fidelity, photorealistic product media for both the extra virgin olive oil and the artisanal cured meats to provide a cohesive, premium, and appetizing visual experience across all product families.

## Alternatives
1. **Retain Cut-out Illustrations Solely**: Keep only the extracted PNG illustrations for all non-wine categories.
   - *Cons*: Visual disparity between the photorealistic wine bottles and flat food cards; lower perceived quality and customer trust for food items.
2. **Generic Stock Photography**: Download generic stock images of generic salami and olive oil bottles from the internet.
   - *Cons*: Inauthentic branding (no "Cantina de Li Chiai" or "Abatemarco" on labels), inconsistent lighting, and potential copyright/licensing pitfalls.
3. **Curated High-Fidelity Domain-Specific Image Generation (Chosen)**:
   - Generate bespoke photorealistic compositions with authentic labeled packaging ("CANTINA DE LI CHIAI - OLIO EXTRAVERGINE DI OLIVA - ABATEMARCO - CILENTO" and "CANTINA DE LI CHIAI - SOPPRESSATA CILENTANA - CILENTO ARTIGIANALE").
   - Match the exact warm sandstone, rustic linen, terracotta bowl, and Cilento cellar barrel aesthetics established by the estate's visual design system.
   - Retain the historical PNG illustrations as secondary gallery assets (`images: [realisticPhoto, originalIllustration]`) on product detail pages.

## Decision
1. **Asset Generation & Integration**:
   - Generated `olio-cilento.jpg`: a dark UV-protected glass bottle of Extra Virgin Olive Oil with authentic estate typography, set on a warm sandstone block with a terracotta bowl of golden-green oil, olive branch, and sunlit Cilento farmhouse background.
   - Generated `insaccati-cilento.jpg`: authentic artisanal Soppressata Cilentana and dry-cured wild boar sausage on a rustic olive wood board, with fresh slices showing natural peppercorns and marbling, rustic twine, vintage knife, and ambient oak cellar barrels.
   - Stored in `apps/storefront/public/images/olio-cilento.jpg` and `apps/storefront/public/images/insaccati-cilento.jpg`.
2. **Product Catalog Mapping (`apps/storefront/lib/data/products.ts`)**:
   - Updated primary `image` property for all 5 Insaccati items to `insaccati-cilento.jpg`.
   - Updated primary `image` property for both Olio EVO items (0.75 L bottle and 3 L tin) to `olio-cilento.jpg`.
   - Configured the multi-image gallery array (`images: [...]`) so customers on product detail pages can see both the realistic setting and the packaging format illustration.
   - Synchronized `getWineMetadata()` to automatically assign these realistic photos to dynamic Medusa backend products matching these categories.

## Consequences
- **Positive Impacts**:
  - The storefront catalog presents an immediate, mouth-watering, premium visual consistency across wines, cured meats, and extra virgin olive oil.
  - The authentic branding on labels reinforces local artisan credibility and heritage.
  - Performance remains optimal: static assets are served directly from Next.js public directory with optimized image caching.
- **Trade-offs & Considerations**:
  - Fresh meat cuts (cinghiale) currently retain their packaged illustrations until dedicated culinary photography for fresh cuts is requested.
