# 018. Authentic Photo Integration & Interactive Cellar Gallery Architecture

## Context
The user provided a set of authentic photographs of Cantina de Li Chiai in `apps/storefront/public/images` to replace preliminary AI-generated placeholder images:
1. **Home Hero Background**: A panoramic black-and-white perspective along the steep vineyard rows overlooking the misty valleys and mountains of the Cilento National Park (`home_page.jpeg`).
2. **Cellar & Harvest Documentary Photos**: A comprehensive documentary archive depicting the real heritage and winemaking process:
   - `VecchiaBottiglia.jpeg`: The historic heritage bottle *"Chiai - Vino Prodotto nella Azienda Agricola Famiglia Imbriaco Abatemarco (SA)"*.
   - `vigneto.jpeg`: Vineyard rows on Flysch soils stretching towards the Cilento sky.
   - `grappolo.jpeg` & `uva.jpeg`: Pristine ripe dark Aglianico grape clusters on the vine and on the cellar worktable.
   - `raccolta.jpeg` & `raccolta1.jpeg`: Heroic hand-harvesting on the steep hillsides of Cilento.
   - `lavorazione.jpeg`: Traditional harvest crates of white grapes (Fiano) arriving in the stone cellar.
   - `produzione.jpeg` & `produzione2.jpeg`: Winemakers feeding destemming hoppers and soft pressing.
   - `prodotto.jpeg`: Fresh ruby-red grape must streaming from the traditional wooden vertical press (*torchio*).
   - `Bianco.jpeg` & `Rosso.jpeg`: Artisanal tasting moments of Fiano and Aglianico at the cellar threshold.
3. **Explicit Constraint**: The bottle images for the product catalog must remain fictitious/dummy for now (`"Le immagini delle bottiglie dei prodotti lasciamo per il momento delle fittizie"`).

## Alternatives
1. **Static Grid Layout in `/la-cantina`**:
   - *Pros*: Simple markup with CSS Grid.
   - *Cons*: Does not satisfy the user's explicit request for a sliding gallery format (*"formato galleria scorrevole"*); occupies massive vertical space and fails to create a narrative arc.
2. **Heavy Third-Party Carousel Library (e.g. Swiper, Embla, Slick)**:
   - *Pros*: Pre-packaged sliding animations.
   - *Cons*: Introduces external runtime dependencies, increases client bundle payload, risks React 19 / App Router compatibility warnings, and requires extra CSS overrides.
3. **Custom Native Next.js Sliding Gallery Component (`CellarGallery.tsx`)**:
   - *Pros*: Zero external dependencies; leverages native CSS scroll snap (`snap-x snap-mandatory`), smooth scrolling, Next.js `<Image />` optimization with `sizes` and `priority`, integrated accessible fullscreen lightbox modal, keyboard navigation (left/right arrows and ESC), and full bilingual i18n support.

## Decision
We implemented **Alternative 3** with the following technical design:
1. **Home Hero Image Replacement (`HeroSection.tsx`)**:
   - Replaced `/images/hero-vineyard.jpg` with `/images/home_page.jpeg`.
   - Adjusted framing to `object-[center_35%]` to balance the sky, mountain ridges, and steep vineyard rows.
   - Preserved layered gradients (`from-[#151211] via-black/40 to-black/35` and `from-[#2e0e13]/60 via-transparent to-black/45`) ensuring high contrast and readability for title, subtitle, and badges.
2. **Interactive `CellarGallery.tsx` Client Component**:
   - Created in `apps/storefront/components/CellarGallery.tsx`.
   - Features:
     - **Main Showcase Viewport**: Active photo displayed in high resolution with category chip, photo counter (`01 / 12`), zoom button, side navigation arrows, and narrative caption.
     - **Horizontal Sliding Thumbnail Reel (*Galleria Scorrevole*)**: Scroll-snapped horizontal track with mini-cards, active gold ring indicator, and track navigation buttons. Selecting any thumbnail smoothly pans and highlights the photo.
     - **Fullscreen Lightbox Dialog**: Opens when clicking the main viewport or expand button; supports keyboard navigation (ArrowLeft, ArrowRight, Escape) and click-outside dismissal.
3. **Page Integration (`apps/storefront/app/la-cantina/page.tsx`)**:
   - Replaced the single static image block with `<CellarGallery dict={dict} />`.
   - Also connected the home page story frame in `StorySection.tsx` with `/images/vigneto.jpeg` and a direct link to `/la-cantina#galleria`.
4. **PromoBanner, SocialMosaic & Product Data Integration**:
   - Replaced `/images/hero-vineyard.jpg` in `PromoBanner.tsx` with `/images/VecchiaBottiglia.jpeg` (*Cofanetto Tradizione Cilentana - Edizione Limitata*).
   - Replaced placeholder image in `SocialMosaic.tsx` with `/images/raccolta.jpeg`.
   - Updated secondary product detail imagery in `products.ts` with authentic photos (`lavorazione.jpeg`, `Bianco.jpeg`, `VecchiaBottiglia.jpeg`, `prodotto.jpeg`, `raccolta.jpeg`, `Rosso.jpeg`).
   - Updated OpenGraph image in `layout.tsx` to `/images/home_page.jpeg`.
5. **Deletion of Generated Non-Bottle Images**:
   - Safely deleted `estate-cellar.jpg` and `hero-vineyard.jpg` from `apps/storefront/public/images/`.
   - Retained all 6 dummy bottle product images (`aglianico-cilento.jpg`, `fiano-cilento.jpg`, `cilento-rosso.jpg`, `cagnulari.jpg`, `cannonau.jpg`, `vermentino.jpg`) strictly as requested.
6. **Localization (`apps/storefront/lib/i18n.ts`)**:
   - Added complete metadata, category tags, titles, and documentary captions for all 12 photos in both Italian (`it`) and English (`en`).

## Consequences
- **Positive**:
  - The storefront now presents 100% authentic human, agricultural, and historical imagery of Cantina de Li Chiai and the Imbriaco family in Cilento.
  - Zero unused or orphaned generated landscape/cellar images remain on disk.
  - Zero hydration issues, ESLint warnings, or Next.js compilation errors.
  - Fully responsive across desktop, tablet, and mobile screens.
- **Trade-offs**:
  - As new bottle label photography becomes ready, it will replace the remaining 6 dummy bottle renders in `products.ts`.
