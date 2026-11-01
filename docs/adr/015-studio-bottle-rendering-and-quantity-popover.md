# 015. Studio Bottle Rendering and Interactive Quantity Popover

## Context
The e-commerce Product Detail Page (PDP) is the core conversion focal point for wine retail. The initial PDP layout relied on a standard card container with generic plus/minus stepper buttons and horizontal specification pills.

To reflect the aesthetic standards of premier Italian wine retailers (such as Signorvino and Tannico) and align with user expectations, the PDP required:
1. An editorial e-commerce studio rendering with a neutral circular backdrop disc (`#f4f2ee`), gallery carousel controls, and an inspection trigger on the label.
2. A streamlined 2-column hierarchy emphasizing winery brand identity, SKU traceability, dynamic loyalty incentives, and a vertical specification list (Annata, Formato, Tipologia, Denominazione, Uve).
3. A specialized wine case quantity popover featuring a 2x4 preset grid (`x 1, x 2, x 3, x 4, x 6, x 9, x 12, x 18`) with custom bottle outline iconography and bespoke quantity input capabilities.

## Alternatives Considered
1. **Native HTML `<select>` dropdown**:
   - *Pros*: Extremely simple to code.
   - *Cons*: Poor luxury aesthetic; inconsistent cross-browser styling; inability to show bottle iconography, preset grids, or custom quantity toggles.
2. **Third-party modal / tooltip library (e.g., Radix / HeadlessUI)**:
   - *Pros*: Built-in accessible popovers.
   - *Cons*: Adds external dependencies and bundle bloat for a focused interaction.
3. **Custom TailwindCSS accessible popover component (Chosen)**:
   - *Pros*: Zero bundle bloat; full control over brand colors (`#72182b`, `#1e3a3a`, `#f4f2ee`); click-outside and keyboard dismissal; seamless mobile responsiveness.

## Decision
1. **Wine Bottle Studio Gallery (`WineBottleGallery.tsx`)**:
   - Implemented a studio canvas with a soft circular backdrop disc (`w-[300px] h-[300px] sm:w-[420px] sm:h-[420px] rounded-full bg-[#f4f2ee]`).
   - Bottle image rendered stably without hover-scaling or stuck overlay buttons.
   - Support for multiple photos per wine (`product.images` / `p.images`), navigable via lateral `<` and `>` arrows, keyboard controls, and interactive miniature thumbnail selectors.
   - Fullscreen/foreground modal triggered by clicking the bottle or the expand icon, featuring an opaque backdrop (`bg-[#0d0305]/95`) to prevent underlying page elements from bleeding through.
2. **Purchasing & Specification Engine (`ProductPurchaseSection.tsx`)**:
   - **Header Hierarchy**: Displays winery brand (`CANTINA DE LI CHIAI`), product title, and article SKU (`Codice Articolo`).
   - **Dynamic Price Synchronization**: The total price reactively calculates as `unitPrice * quantity` whenever a new bottle count is selected, accompanied by a unit price breakdown for purchases greater than one bottle.
   - **Offer Decoupling**: Hardcoded loyalty discounts and disclaimers were removed to allow promotional rules to be configured independently by store administrators in the future.
   - **Bottle Quantity Popover**: Anchored to the `[ 1 ˅ ]` trigger button with a directional arrow indicator (`▲`), presenting the exact 2x4 grid with custom SVG bottle icons, active burgundy border highlights, and a `QUANTITÀ PERSONALIZZATA` input mode.
   - **Guarantees & Structured Specs**: Real-time delivery date estimator, quick wishlist and cellar availability actions, followed by a clean vertical list with dedicated icons for Vintage, Format, Style, Appellation, and Grapes.

## Consequences
### Positive
- **Real-Time Price Clarity**: Immediate feedback on order subtotal upon selecting case quantities (e.g. 6, 12, 18).
- **Multi-Photo Flexibility**: Supports multiple bottle angles, back labels, and estate packaging seamlessly.
- **Distraction-Free Image Inspection**: Opaque foreground presentation isolates the photography cleanly.

### Trade-offs
- The quantity popover requires client-side event listeners for detecting clicks outside the component boundaries.
