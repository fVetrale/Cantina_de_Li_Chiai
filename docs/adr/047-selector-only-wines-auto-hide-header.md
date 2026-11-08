# 047. Selector-Only Wines Page, Auto-Hiding Header, Replaying Reveal Effects

- **Status:** Accepted (2026-11-08).
- **Supersedes:**
  - the `/vini` part of ADR 045 (selector above the cards, search and filters, delivery banner);
  - the "runs once per page view" rule of ADR 046.
- **Related:** ADR 045 (editorial restyling), ADR 046 (image reveal effect), ADR 043 (wine categories).

## Context
The user asked for four changes on 2026-11-08:
1. **`/vini` becomes only the dynamic selector.**
   - It opens from "I Vini", "Tutti i vini" or "Scopri i vini" with **no category preselected**.
   - Choosing one makes its wines slide in from the right.
   - There are no wine cards, filters or banners further down.
2. **The header hides while scrolling down** and comes back when scrolling up, on every page.
3. **The navbar dropdown categories did not work.**
   - The links existed (`/vini?categoria=…`), but on `/vini` the selector read the category once, with `useState(initialCategory)`.
   - A client navigation therefore changed the URL without changing the selection.
4. **The reveal effects must be visible again without reloading**, every time a block comes back into view, instead of once per page view.

The user's answers: the `/vini` delivery banner goes too, and search and price filters can go (4 wines). "We can always go back."

## Alternatives
1. **Keep the cards under the selector and only hide them until a choice is made.** Rejected: the user wants nothing below.
2. **A dedicated route per category (`/vini/rossi`).** Rejected for now: the query string already works for the footer and menu links. Fixing the state is enough.
3. **A scroll-direction library or a CSS-only sticky trick for the header.** Rejected: a small scroll listener is enough, and focus and menu states need JavaScript anyway.
4. **The changes below.** (Chosen)

## Decision
- **Wines page (`app/vini/page.tsx`, `components/WinesCatalogView.tsx`):**
  - The page is the full-screen selector:
    - the h1 "I Nostri Vini" as a small label;
    - the three categories in large serif over the blurred, almost white vineyard;
    - a hint "Scegli una categoria per scoprire i nostri vini." while nothing is chosen (new i18n key `winesPage.selectorHint`).
  - **Choosing a category:**
    - it turns AA gold and the list moves left;
    - the column slides in from the right (`.selector-column`, 0.7 s);
    - the wine names follow one after the other (`.selector-item`, staggered 0.12 s), each with its price and appellation, linking to its product page (where it is added to the cart);
    - the column is keyed by category, so the animation replays on every change.
  - The URL follows the choice through `window.history.replaceState` (`?categoria=…`, keeping `lang`).
  - The page passes `key={initialCategory}` to the selector, so a menu link to another category, even on `/vini`, remounts it with that category chosen. "I Vini" / "Tutti i vini" opens it with no choice, and unknown or retired categories also open with no choice.
  - **Removed from `/vini`:** the cards grid, search, price filter, sort, pagination and the `PromoBanner`. The component and `WineCard` stay in use elsewhere (PDP related wines, wishlist).
- **Header (`components/Navbar.tsx`):**
  - A passive scroll listener hides the header (`-translate-y-full`, 300 ms) while scrolling down past 80 px and shows it when scrolling up. Jitter under 6 px is ignored.
  - It stays visible while the mobile menu, account menu or login popup is open, and whenever keyboard focus enters it.
  - It sets `html[data-header-hidden]`. The CSS variable `--header-offset` (4 rem, 72 px from 1024 px, 0 when hidden) drives `.sticky-under-header`, used by the PDP wines bar and the mobile chapter tabs, so they move up with the header.
  - The wine links in the menu now keep the language (`&lang=en`).
- **Reveal effects (`RevealBlock`, `Reveal`):**
  - The IntersectionObserver keeps observing: a block becomes `active` when it enters the viewport and is re-armed when it is fully out.
  - So it animates on load, if visible, and again every time it comes back into view.
  - Reduced motion and no-IntersectionObserver still show everything without animation; the `<noscript>` style and the CSS fail-safe of ADR 046 are unchanged.

## Consequences
- **Positive:**
  - `/vini` is a clean, editorial entry point.
  - Menu links always select the right category.
  - More vertical space while reading, with the header back on demand.
  - The effects are always visible without reloading.
- **Trade-offs:**
  - **Shopping:** buying from the catalog takes one more click (category, then wine, then "Aggiungi al carrello"). The cards' quick "Aggiungi" and the wishlist heart are no longer on `/vini`; they remain on the PDP and on `/account/preferiti`.
  - **Search:** there is no catalog search; the header search icon now just opens the selector. Fine with 4 wines; to revisit if the catalog grows.
  - **Repeated animations:** effects repeat on every pass, which some visitors may find busy. Reduced motion turns them off.
  - **Dead i18n:** the search, price and sort strings in `winesPage` are no longer used, and `PromoBanner` is no longer rendered anywhere. Both are kept for an easy return.
- **Verified (2026-11-08)**, headless Chrome on the user's dev servers:
  - header "I Vini": `/vini` with no choice and the hint, no cards, no banner;
  - choosing "Vini Rossi": URL `?categoria=vini-rossi`, column sliding in (at 0.35 s still moving), Rosso Vecchio and Chiai Rosso;
  - **on `/vini`, dropdown "Vini Bianchi"**: Bianchi selected, Chiai Bianco; header "I Vini" again: no choice;
  - PDP scrolled down: header hidden, `data-header-hidden`, wines bar at the top (0 px); scrolled up: both back (bar at 72 px);
  - PDP 50/50: active, then armed when out of view, then active again with the curtain moving;
  - add to cart still works (badge 0 → 1);
  - six pages at 375/768/1280/1920: no horizontal overflow;
  - **DoD:** lint, typecheck and tests pass (169 storefront, 24 backend).
- **Security notes:** visual and navigation only. `replaceState` writes only the chosen category handle (from our own list) and `lang`; no personal data goes in the URL. No data access or new input.
