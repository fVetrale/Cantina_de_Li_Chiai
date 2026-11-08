# 045. Editorial Restyling: Black, White, One Gold Accent

- **Status:** Accepted (2026-11-05).
- **Related:**
  - ADR 043/044 (wine-only shop);
  - ADR 038 (age verification: the backend check is unchanged; only the age popup is restyled);
  - ADR 040–042 (account, wishlist: unchanged).
- **Italian guide for the client:** `docs/restyling-editoriale.md` (what changed, page by page, and the material still to collect).

## Context
The user supplied two design briefs (`modifiche-sito-claude-code.md` and `modifiche-sito-completo-claude-code2.md`). They describe an editorial luxury-wine look:
- black and white backgrounds, real photography and white space;
- a single gold accent (`#A18E56`);
- Bodoni Moda titles and Lato uppercase labels;
- full-screen narrative sections, a three-column product sheet, maps and archival illustrations.

Constraints:
- **only look and visual structure** change, never content, routing or logic;
- AA contrast, visible focus, keyboard use, `prefers-reduced-motion`;
- no heavy animation library;
- checked at 375/768/1280/1920 px.

The user also asked, on 2026-11-05, to **remove the catalog from the home page**: the wines are reached from the navbar, and the home keeps only the delivery and story banners, side by side.

## Alternatives
1. **Rewrite every class with new token names.** Rejected: about 1,100 color classes in 50 files, a high risk of regressions for no visible gain.
2. **Apply the briefs literally.** Rejected in part, because some points break the briefs' own constraints or our functionality:
   - gold `#A18E56` and gray `#BDBDBD` as small text on white fail AA (3.2:1 and 1.9:1);
   - the catalog "selector" alone would remove price, add-to-cart, stock, wishlist, search and sort from `/vini`;
   - map pages, a site-detail page with a video play button, and archival illustrations need material we do not have, and a placeholder or a dead button in production is worse than nothing;
   - a loading screen on every visit slows the site down.
3. **Remap the existing token names to the new palette, then restyle structure page by page, adapting the briefs where they conflict.** (Chosen)

## Decision

### Foundations (`app/globals.css`, `app/layout.tsx`)
- **Palette:**
  - new tokens: `black`, `white`, `gold` `#A18E56`, `ivory` `#F1F1EC`, `gray-100` `#F5F5F5`, `gray-300` `#BDBDBD`, `gray-500` `#757575`, `gray-600` `#666666`;
  - the old families keep their names but now point at the new palette: `wine` → blacks, `cellar` → black and grays, `ivory` → white and light grays, `gold` → the brief's gold;
  - `terracotta` was only decorative and now follows the gold;
  - `olive` stays as a muted success color (e.g. "Aggiunto", stock).
  - The 211 hard-coded burgundy hex classes now use tokens.
- **AA text gold:** `#776739` (`gold-700/600`, `--color-gold-text`) for small text on light backgrounds: 5.5:1 on white, 4.9:1 on ivory, 5.1:1 on `#F5F5F5`. The brief's `#A18E56` is used on dark backgrounds (6.5:1 on black) and for large elements. Inactive items as text use `#757575`; `#BDBDBD` is used only for borders and disabled elements.
- **Type:**
  - Bodoni Moda (400–700, plus italic) and Lato (300/400/700) via `next/font/google`, with `display: swap`; no new dependency.
  - Bodoni Moda has no 300 weight, so titles use 400.
  - Utilities: `label-caps` (Lato 12px bold, 4px spacing), `title-hero` (`clamp`, about 80px), `title-page` (about 72px), `title-section` (about 33px), `text-editorial` (17px / 1.7), `drop-cap`, `link-editorial` (a thin 30° line before "Scopri di più" links), `animate-fade-in`.
- **Accessibility and motion:**
  - global gold `:focus-visible` outline;
  - `prefers-reduced-motion` disables animations and transitions;
  - `components/Reveal.tsx` fades sections in with an IntersectionObserver. It hides nothing without JavaScript, nothing already on screen, and nothing when motion is reduced.

### Common elements
- **Header (`Navbar.tsx`):**
  - a black fixed bar with the name centered; Lato uppercase items, each with a thin diagonal line;
  - the active page is gold with a thin white bar, plus `aria-current`;
  - below 1024 px a full-width menu (`aria-expanded`, `aria-controls`);
  - the wines dropdown also opens on keyboard focus;
  - behaviour unchanged: cart counter, account menu, login popup, language, logout.
- **Footer:** black, Lato uppercase links with wide spacing; same links and texts. "Vieni a conoscerci" now points to `/#storia`.
- **Age popup (`AgeGateModal.tsx`):** it is the brief's black "loading screen" with a radial vignette and the emblem, so there is no extra screen; logic unchanged.
- **Emblem:** a provisional "LC" monogram, labelled as provisional for screen readers, until the client provides the real one.

### Pages
- **Home:**
  - full-width chiaroscuro hero with a fade-in, and the "Chiai" bottle photo on the right on large screens;
  - then `HomeHighlights`: the delivery and story banners side by side, with the same texts;
  - no catalog, social mosaic or newsletter on the home (user request). Hero links go to `/vini` and `#storia`.
- **Product sheet (`/prodotti/[handle]`):**
  1. dark hero with the wine name as the page h1, centered, and the wine photo on the right;
  2. a **sticky white bar with the 4 wines** (our "variants"), the current one gold;
  3. **three columns** that become one below 900 px:
     - breadcrumb, with the last part gold, plus the unchanged purchase panel (its title is now an h2);
     - the sticky gallery;
     - the former tabs as an **accordion** (⊕ in a thin circle, `aria-expanded`/`aria-controls`, a `grid-template-rows` animation, `inert` when closed);
  4. a 50/50 section: vineyard photo, text on light gray, drop cap, "Scopri la nostra storia" link;
  5. related wines.
- **La Cantina:**
  - full-screen chapters: opening with emblem, title and family facts; La Terra; Il Lavoro, with the quote; Il Ritiro; La Famiglia, dark; the gallery; the values;
  - alternating text and framed photos with a soft shadow, and a drop cap;
  - a **chapter tab bar** (`ChapterNav.tsx`, plain anchors, active tab follows the scroll): anchored at the bottom on desktop, under the header on mobile;
  - ids `#galleria`, `#valori` and `#story` are kept for existing links.
  - Chapter labels and the emblem label are new i18n keys (it/en).
- **Vini (`/vini`):**
  - the brief's selector, adapted: huge serif categories over a blurred, almost white vineyard photo;
  - on click the category turns gold and moves left, and a column on the right lists its wines and prices, with a gold-to-black vertical line;
  - **below it stay** the thin search, price and sort bar and the wine cards with "Aggiungi" and the wishlist heart;
  - the category pills are replaced by the selector, with the same state;
  - the delivery banner below the grid is restyled, and its fake "Cofanetto Tradizione Cilentana – Edizione Limitata" caption is removed.
- **Cart, checkout, account, legal, order confirmation, 404, login popup:**
  - common look only: square corners, no soft shadows, rectangular buttons, new colors and type;
  - **forms, fields and logic unchanged.**

### Not done, and why
- **Map pages ("Tenute", "Esperienze"), the site-detail page with a video, the slate color:** there is one cellar, no experiences for sale and no video.
- **Faded archival backgrounds:** we have no archival material, and the brief forbids taking it elsewhere.
- **Loading screen on every visit:** merged into the age popup.
- **Bottom control bars on mobile:** they would cover content, so on mobile the chapter bar sits under the header.

Possible additions, and the material to ask the client for, are listed in `docs/restyling-editoriale.md`.

## Consequences
- **Positive:**
  - a coherent editorial look on every page from one token layer;
  - AA contrast respected where the briefs did not;
  - no new dependency;
  - functionality and security untouched.
- **Trade-offs:**
  - Token names such as `wine-950` now mean "black": readable in the code only with this ADR. A rename can be done later as a pure refactor.
  - `MeetUsBanner`, `StorySection` and `SocialMosaic` and the newsletter section are no longer rendered on home or La Cantina. They are kept in the code for an easy return.
  - Product hero and gallery use the 840×1120 ambient photos. White-background packshots would need high-resolution files from the client.
  - Some old copy remains as it was: "Scopri Anche" and the tab sub-headings are hard-coded Italian, and the PDP still shows the delivery date and the "Disponibile in Cantina" button from before. These are UI-audit items.
- **Verified (2026-11-05):**
  - **DoD:** lint, typecheck and tests pass (169 storefront, 24 backend).
  - **Layout:** 40 screenshots (10 pages × 375/768/1280/1920) with no horizontal overflow.
  - **Live, headless Chrome on the user's dev servers:**
    - header: cart counter, login popup, language, mobile menu and keyboard dropdown;
    - catalog selector and filters, including old category links;
    - checkout with courier and pickup, the age check and **order #10**;
    - reserved area with two customers: profile, address, prefilled checkout, **order #11**, **404 for the other customer**, guests redirected to login;
    - wishlist add and remove;
    - the age popup confirms and stores the flag.
- **Security notes:**
  - no change in `lib/`, Server Actions, cookies, the backend or configuration;
  - the new components (`Reveal`, `ChapterNav`, `HomeHighlights`) read no data and send nothing;
  - no `dangerouslySetInnerHTML`; inline styles are only a static gradient.
