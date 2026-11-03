# 023. Essential and Authentic Storefront Footer Redesign

## Context
The previous storefront footer contained multiple placeholder, non-existent, or broken references inherited from early prototypes:
1. **Fictitious Wine Lines and Dead Product Slugs**: "I Nostri Vini" linked to non-existent appellations like `Fiano del Cilento DOC`, `Aglianico del Cilento DOC Riserva`, and `Cilento DOC Rosso - Paestum IGT`, which resulted in 404 errors or non-existent catalog filters.
2. **Broken Anchors and Inappropriate Corporate Links**: "La Cantina" linked to dead anchors (`/#terroir`, obsolete `/#story` from before the story section was relocated to `/la-cantina`), and an artificial corporate claim ("Lavora con Noi") unsuited for an artisanal family farm operated by Antonio and Matteo.
3. **Dummy Contact Details**: A fake landline placeholder (`+39 0974 000000`).
4. **Dead Legal Links**: Legal links (`Privacy Policy`, `Condizioni di Vendita`, `Cookie Policy`) pointed to `#footer` self-anchors rather than real disclosures.

The user instructed to overhaul the footer by removing all non-existent elements, focusing strictly on essential and authentic details, and connecting all references to actual, functional routes and anchors across the website.

## Alternatives
1. **Minimal Single-Line Footer**: Strip the footer down to just copyright and email.
   - *Cons*: Deprives visitors of catalog category navigation, visiting hours, cellar pickup reassurance, and clear legal transparency.
2. **Generic Anchor Links (`href="#"`)**: Keep the multi-column look but make unlinked items dummy `#` placeholders.
   - *Cons*: Violates user expectations, produces broken user journeys, and damages trust.
3. **Essential Authentic Multi-Column Architecture with Dedicated Legal Route (Chosen)**:
   - Restructure the footer into four clean, real columns:
     - **Azienda & Sede**: Brand identity, authentic story snippet, physical location in Contrada Pozzo 15 (Abatemarco) with a Google Maps external link, pickup hours, and express delivery/pickup notice.
     - **I Nostri Prodotti**: Direct functional links to the 4 real product categories (`/vini?categoria=vini`, `/vini?categoria=insaccati`, `/vini?categoria=carne`, `/vini?categoria=olio`) plus the complete catalog (`/vini`).
     - **La Cantina**: Direct working links to the story page (`/la-cantina`), real photo gallery (`/la-cantina#galleria`), family values (`/la-cantina#valori`), and the home visit banner (`/#vieni-a-conoscerci`).
     - **Contatti & Note Legali**: Direct contact via `cantina.salumeria.chiai@gmail.com`, mention of the complimentary tasting board upon cellar collection, and working links to a dedicated `/legal` route.
   - Create a dedicated `/legal` page (`apps/storefront/app/legal/page.tsx`) containing concise, transparent disclosures for Privacy Policy (GDPR), Terms of Sale, and Technical Cookie Policy.

## Decision
1. **Dictionary Updates (`apps/storefront/lib/i18n.ts`)**:
   - Cleaned up obsolete items across both Italian (`it`) and English (`en`) dictionaries.
   - Removed the fake phone number.
   - Added `legalPage` bilingual keys for privacy, sales terms, and cookie disclosures.
2. **Component Implementation (`apps/storefront/components/Footer.tsx`)**:
   - Replaced dummy wine links with authentic category links matching the active catalog schema.
   - Replaced dead anchors with valid internal navigation to `/la-cantina`, `#galleria`, `#valori`, and `/#vieni-a-conoscerci`.
   - Linked physical address directly to Google Maps coordinates for Abatemarco.
   - Added payment badges reflecting real capabilities: Visa/Mastercard, PayPal, Bonifico Bancario, Contanti al Ritiro.
3. **Legal Route (`apps/storefront/app/legal/page.tsx`)**:
   - Implemented a clean, accessible Next.js Server Component page with jump anchors (`#privacy`, `#termini`, `#cookie`) providing full transparency for e-commerce compliance.

## Consequences
- **Positive Impacts**:
  - Zero dead or misleading links in the footer. Every link directs to an existing page, active category filter, or valid anchor.
  - The farm's genuine identity as an integrated winery and salumeria (Antonio & Matteo) is reinforced without corporate or industrial pretenses.
  - Cellar pickup perks (complimentary tasting board) and express nationwide delivery are clearly communicated.
  - Full compliance with legal age verification and e-commerce transparency.
- **Trade-offs**:
  - Phone contact is temporarily omitted in favor of direct email until Antonio and Matteo provide a verified phone or WhatsApp business line.
