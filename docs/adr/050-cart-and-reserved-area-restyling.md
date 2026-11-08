# 050. Cart and Reserved Area in the Editorial Style; Removal of Obsolete Code

- **Status:** Accepted (2026-11-08).
- **Related:** ADR 045 (editorial restyling), ADR 036 (cart page), ADR 040–042 (customer auth, reserved area, wishlist), ADR 049 (English coverage).

## Context
After the restyling of home, wines, product page and La Cantina, the cart and the reserved area still had the old structure:
- white boxed panels and a sidebar of tabs;
- small bold titles and pill buttons.

They looked like another site. The user asked to restyle them to match the rest. Choices, all as recommended:
- a fixed checkout bar on mobile in the cart;
- a split login page with a photo;
- horizontal tabs instead of the account sidebar.

The user also set a new rule for every change: **when a new file replaces an old one, delete the old one** (git keeps the history).

## Alternatives
1. **Rewrite each form's inputs with new classes.** Rejected: many fields across five forms, with more risk of touching logic or ids that tests rely on.
2. **One scoped stylesheet rule (`.form-editorial`) for all fields, plus layout changes in the page shells.** (Chosen)

## Decision
- **Cart (`app/carrello/page.tsx`, `components/CartLineItem.tsx`):**
  - **header:** an editorial header ("Il tuo ordine" label, serif title, item count), no breadcrumb;
  - **rows:** portrait photo, serif name, uppercase format and availability, a thin square − / + stepper, and "Rimuovi" as a `link-editorial`;
  - **summary:** on `bg-gray-100`, sticky at `--header-offset + 2rem`, with the serif total, a thin gold free-shipping line, the pickup note, a black "Procedi al checkout" button and a "Continua gli acquisti" link;
  - **mobile:** a fixed black bar with the total and the checkout button;
  - **empty cart:** full screen over the blurred vineyard, with a link to the wines;
  - **i18n:** `cartPage.eyebrow` added, `cartPage.breadcrumbsHome` removed, the empty-cart CTA now points to the wines.
- **Reserved area:**
  - **`AccountShell`:**
    - a black header with the "La tua area riservata" label, "Ciao, Nome" as a page title and "Esci" as a white text link (`LogoutButton` restyled);
    - a horizontal tab bar under it, sticky under the auto-hiding header ("Carte salvate · In arrivo" shown disabled);
    - the content inside `.form-editorial`.
  - **Guest `/account`:** a split page. On the left, a chiaroscuro photo with the title and subtitle; on the right, `AccountAuthCard` with editorial tabs, labels, fields and a black submit, and the benefits as a quiet list. **Forms, validation and actions are unchanged.**
  - **Overview:** four numbered tiles (Profile, Orders, Addresses, Wishlist), recent orders as rows with serif number and total, and the account-deletion request on light gray.
  - **Orders, order detail, profile, addresses, wishlist:**
    - layout: no boxes; serif section titles over a black rule;
    - rows and content: rows with thin dividers; the order detail shows photos, the summary on light gray and an uppercase address heading;
    - controls: primary buttons in black `label-caps`, the secondary "new address" button outlined, address actions as `link-editorial`, "Predefinito" as a gold label.
  - **`OrderStatusBadge`:** a small dot plus an uppercase label (gold processing, black shipped, olive delivered, rose canceled). The old sky-blue accent is gone.
  - **`.form-editorial` (`app/globals.css`):** text, email, password, tel and number inputs, selects and textareas get a bottom border only, square corners, a transparent background, a black border on focus and a rose border when `aria-invalid`.
- **Removal of obsolete code (user rule):**
  - components no longer rendered anywhere: `MeetUsBanner`, `StorySection`, `SocialMosaic`, `NewsletterSection`, `WineCatalog`, `PromoBanner`, `Reveal`;
  - the data function `getRelatedProducts`;
  - dictionary sections `announcement`, `searchPlaceholder`, `catalog`, `social`, `newsletter`;
  - CSS `.reveal-pending`, `.reveal-shown`, `.bg-gradient-*`;
  - unused icon imports.

## Consequences
- **Positive:**
  - Cart and reserved area now match the site.
  - All forms share one field style.
  - Less code and a smaller dictionary in the browser payloads.
- **Trade-offs:**
  - The checkout page still has the previous look (proposed next, for coherence with the cart).
  - The "Carte salvate" placeholder tab stays until saved cards exist (needs the payment provider).
  - Medusa may reorder cart lines after a quantity change; this is existing behavior, not part of the restyling.
- **Verified (2026-11-08)**, headless Chrome on the user's dev servers:
  - **Cart:** empty state with a link to the wines; two wines added; + and − update quantity and total; "Rimuovi" removes the line and updates the header badge; the mobile fixed bar shows the total and the button; EN texts; no horizontal overflow.
  - **Reserved area:**
    - guest split page, with the fields underlined (bottom border 1 px, top 0);
    - registration lands on "Ciao, Anna" with the tabs;
    - profile saved; a default address added;
    - the checkout is prefilled (email, address, phone) and **order #13** placed;
    - the order is listed, and its detail shows the address;
    - **another customer opening that order URL gets the 404 page**, with no address visible;
    - "Esci" logs out, and a guest on `/account/profilo` is redirected to the login;
    - mobile without overflow; English tabs and header.
  - **DoD:** lint, typecheck and tests pass (177 storefront, 24 backend).
- **Security notes:**
  - Visual changes only: no change to Server Actions, data access, cookies, validation or the ownership checks; field ids and names are unchanged.
  - Verified live: the guest redirect, logout, and the 404 for another customer's order.
