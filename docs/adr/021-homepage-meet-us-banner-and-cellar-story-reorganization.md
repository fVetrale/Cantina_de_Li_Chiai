# 021. Homepage Meet-Us Banner and Cellar Story Reorganization

## Context
Following user feedback on the presentation and balance between the homepage and dedicated subpages:
1. **Homepage Section Heaviness**: The extensive, dark family history section (`StorySection`) previously placed on the homepage was perceived as overly heavy and better suited for the dedicated estate/cellar page (`/la-cantina`), where visitors actively seek documentary history and vineyard origins.
2. **Online Shipping Visibility**: The previous messaging focused heavily on physical cellar collection in Abatemarco ("ritiro in cantina"), creating the unintentional impression that online shipping had been removed or deprioritized.
3. **Ergonomic Narrative Balance**: The user requested that the homepage replace the heavy story section with a welcoming, concise teaser banner ("Vieni a conoscerci") that clearly highlights **both** channels:
   - Convenient online ordering with express courier shipping across Italy (24/48h).
   - In-person cellar pickup at Contrada Pozzo 15, Abatemarco (SA) with a complimentary sampling board.

## Alternatives
1. **Completely Hide Story Content**: Remove the family narrative from the homepage without any teaser or redirect.
   - *Cons*: Weakens the authentic storytelling of Antonio & Matteo and reduces traffic to the `/la-cantina` page.
2. **Compact Story Accordion on Homepage**: Collapse the story into expandable accordions.
   - *Cons*: Clutters the homepage layout and adds unnecessary interaction layers for a marketing site.
3. **Reorganize Architecture with MeetUsBanner & Dedicated Cellar Story (Chosen)**:
   - Introduce `MeetUsBanner` on the homepage: an elegant, inviting teaser featuring dual cards (Online Delivery vs Cellar Tasting), clear CTAs, and a picturesque vineyard preview.
   - Relocate the comprehensive `StorySection` into `apps/storefront/app/la-cantina/page.tsx` right after the cellar documentary gallery.
   - Re-anchor all promotional and informational copy in `i18n.ts` (Italian and English) to explicitly state both online home shipping and cellar visits.

## Decision
1. **New Homepage Banner (`apps/storefront/components/MeetUsBanner.tsx`)**:
   - Built a dedicated teaser banner displaying the invitation from Antonio & Matteo.
   - Embedded two distinct service pillars:
     - *Spedizione Espressa Online*: 24/48h tracked delivery with shock-proof packaging across Italy.
     - *Esperienza in Cantina*: Direct pickup in Contrada Pozzo 15 with a complimentary tasting board.
   - Styled with warm typography, rounded container cards, and direct links to `/la-cantina` and `#catalog`.
2. **Relocation of `StorySection` to `/la-cantina` (`apps/storefront/app/la-cantina/page.tsx`)**:
   - Embedded `StorySection` within the cellar page narrative flow above `FeaturesSection`.
   - Updated action buttons inside `StorySection` to include in-page jump anchors (`#galleria`) and direct links to `/vini`.
3. **Copy & i18n Synchronization (`apps/storefront/lib/i18n.ts`)**:
   - Updated `hero`, `features`, `promoBanner`, `catalog`, and `story` in both Italian (`it`) and English (`en`) to balance online e-commerce shipping with direct cellar pickup incentives.
   - Added dedicated `meetUs` namespace across both locales to ensure zero hardcoded strings.

## Consequences
- **Positive Impacts**:
  - The homepage is lighter, more focused on the product catalog, and guides interested users smoothly to the cellar page.
  - Customers are immediately reassured that all wines, cured meats, and olive oil can be shipped directly to their homes anywhere in Italy.
  - The dedicated `/la-cantina` page is now a richer, complete documentary destination for heritage and photography.
  - Next.js build (`pnpm build`) and ESLint remain completely green with zero warnings.
- **Trade-offs & Considerations**:
  - Fresh meat orders should clarify cold-chain shipping or local pickup requirements during checkout as commerce workflows expand.
