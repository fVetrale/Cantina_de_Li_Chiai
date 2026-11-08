# 046. "Dynamic Reveal" Effect for Image + Text Blocks

- **Status:** Accepted (2026-11-08).
- **Related:** ADR 045 (editorial restyling); brief `effetti-immagini-cantina-claude-code.md` supplied by the user.

## Context
The user asked for the effect seen on luxury winery pages, applied to every image + text block. As a block appears:
- it fades in;
- a curtain in the section color slides off the photo;
- the text enters with a slight 3D rotation;
- on hover, the photo zooms slowly while a side strip with a link slides in.

The brief also offers a cross-fading photo slider. Only look and structure may change, never content or logic.

The user's choices (2026-11-08), following my recommendations:
1. the strip is our ivory, almost opaque, not the brief's warm beige at 70% opacity;
2. the slider gets a pause button, used in one chapter only;
3. the automatic zoom on touch screens is lighter (1.1 instead of 1.3).

After the first block was approved, the user also asked that **the effect also plays for blocks already on screen when the page loads**, not only on scroll.

## Alternatives
1. **An animation library** (Framer Motion, GSAP). Rejected: a new dependency for something CSS and one IntersectionObserver can do.
2. **The brief's literal vanilla JS** (`document.querySelectorAll`, an `html.js` class added by a script). Rejected:
   - it does not fit React and Next;
   - setting a class before paint would need an inline script, and the project forbids `dangerouslySetInnerHTML`.
3. **Hide only after hydration, and only below the fold** (the first implementation). Rejected after the user's second request: blocks visible at load would never animate.
4. **A `RevealBlock` client component rendered "armed" (hidden) on the server, activated once by an IntersectionObserver, also on load, with three safety nets.** (Chosen)

## Decision
- **`components/RevealBlock.tsx`.** Props:
  - `images` (one photo, or several for the slider);
  - `layout` `split` | `stacked`, `reversed` (zig-zag) and `fullBleed` (a photo filling its half);
  - `curtainColor`, which must equal the background around the photo;
  - `overlayLink` and `sliderLabels` (i18n), plus layout class props.
- **States:** `armed` (server render, hidden), then `active` once:
  - immediately on the next animation frame if the block is already on screen, or if motion is reduced, or if there is no IntersectionObserver;
  - otherwise when its top edge enters the viewport (`threshold: 0`).
- **CSS (`app/globals.css`, `.reveal-block*`):** only `opacity` and `transform` are animated.
  - **Fade-in:** the block fades in over 1.4 s.
  - **Curtain:** from 768 px up, a curtain covering 80% of the photo slides out to the outer side over 2.1 s (mirrored when `reversed`).
  - **Text:** `.text-reveal` children go from `rotateY(14deg) translateY(-3px)` to none over 0.56 s, 0.2 s after the block (the content column has `perspective: 800px`).
  - **Hover, mouse devices:** the photo zooms to 1.3 over 5 s (back over 1.4 s), and the strip (12.3% wide, 21.5% on mobile, at least 3.5 rem) slides in. Its label is vertical Lato uppercase with a skewed line and a circled "+", turning AA text gold on hover.
  - **Keyboard:** the strip also opens on `:focus-visible` of its link.
  - **Touch screens:** the strip is always visible, and the photo zooms to 1.1 once the block is active.
- **Slider ("Il Lavoro", 3 photos):**
  - a cross-fade every 5 s;
  - a pause/play button (`aria-pressed`, i18n labels) placed on the side opposite the strip;
  - paused while the pointer is over the photo or focus is inside it;
  - no automatic change and no button with reduced motion;
  - hidden slides are `aria-hidden`.
- **Safety nets:**
  1. a `<noscript>` style in `app/layout.tsx` shows every block without JavaScript;
  2. a CSS fail-safe: if no reveal component has hydrated (`html` lacks `data-reveal-ready`), blocks appear after 4 s;
  3. `prefers-reduced-motion: reduce` forces everything visible and static.
- **`components/Reveal.tsx`** (the generic fade-in of ADR 045) now follows the same model: hidden on the server, shown once, also on load, with the same safety nets.
- **Where the effect is applied:**
  - **La Cantina chapters:** La Terra (white curtain, link to `#galleria`), Il Lavoro (reversed, light gray curtain, slider, link to `#galleria`), Il Ritiro (white, link to `/vini`), La Famiglia (reversed, black, link to `#valori`);
  - the **product page** 50/50 (reversed, full bleed, light gray, link to `/la-cantina`);
  - the **home** delivery and story cards (stacked, black / light gray, links to `/vini` and `/la-cantina`);
  - the **/vini delivery banner** (black, link to `/la-cantina#ritiro`).
- **i18n:** `common.discover`, `common.pauseSlideshow`, `common.playSlideshow` (it/en).

## Consequences
- **Positive:**
  - The effect is consistent on every image + text block, with no dependency.
  - Content is never lost: no JavaScript, failed hydration and reduced motion all keep it visible.
  - The slider respects WCAG 2.2.2 (pause, stop on hover/focus).
- **Trade-offs:**
  - Blocks are hidden in the server HTML until hydration. On a very slow device the area stays empty for a moment (at most 4 s, then the fail-safe shows it).
  - During the curtain the frame's soft shadow is briefly visible around the covered photo.
  - The strip link duplicates the block's own CTA in some blocks; it is a second, visual way in.
- **Verified (2026-11-08)**, headless Chrome on the user's dev servers:
  - home loaded at `#storia`: the curtain was half-way at 0.75 s, so the effect plays on load;
  - all four chapters armed at the top and active after scrolling;
  - slider: advanced 1 → 2, stopped when paused and while hovered;
  - PDP and `/vini` blocks went from armed to active;
  - reduced motion: everything visible, no slider button;
  - JavaScript disabled: everything visible (opacity 1 through `<noscript>`);
  - home, La Cantina, PDP and `/vini` at 375/768/1280/1920: no horizontal overflow and no block left hidden after scrolling;
  - the earlier single-block run also checked the keyboard focus on the strip and the touch layout.
  - **DoD:** lint, typecheck and tests pass (169 storefront, 24 backend).
- **Security notes:** visual only. No data access or new input, no `dangerouslySetInnerHTML`; the `<noscript>` style is a static string rendered by React. Strip links are internal anchors or pages.
