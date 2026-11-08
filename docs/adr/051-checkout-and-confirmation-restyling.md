# 051. Checkout and Order Confirmation in the Editorial Style

- **Status:** Accepted (2026-11-08).
- **Related:** ADR 037–039 (checkout, age verification, order placement), ADR 050 (cart and reserved area), ADR 045 (editorial restyling).

## Context
After ADR 050 the cart and the reserved area matched the site, but the checkout that follows the cart still had the old boxed layout:
- a breadcrumb;
- three white panels "1. / 2. / 3.";
- a boxed summary.

The confirmation page had the old layout too. The user asked to restyle both. Choices, all as recommended:
- a step indicator;
- a collapsible summary at the top on mobile;
- the confirmation page included.

## Alternatives
1. **Split the checkout into one page per step.** Rejected: it would change the flow and the Server Actions (ADR 037 chose a single page).
2. **Restyle the single page, keeping the forms, actions and field ids.** (Chosen)

## Decision
- **Checkout (`app/checkout/page.tsx`):**
  - **Header:** "Torna al carrello" link, "Il tuo ordine" label and "Checkout" title.
  - **Step indicator:** **01 Contatti e indirizzo · 02 Spedizione · 03 Conferma ordine**.
    - It is computed from data the page already has: details done = email + shipping address saved; shipping done = `shippingComplete`.
    - Completed steps are gold with a check (and a screen-reader "completato"); the current one is black with `aria-current="step"`; the next ones are gray.
    - Each item links to its section.
  - **The three steps:** no boxes, each with a large gold serif number and a section title, separated by black rules (`scroll-mt` for the anchors). The fields are inside `.form-editorial`.
  - **Summary:**
    - shared `SummaryContent` (wines with photos, items total, shipping, total in serif, IVA, edit cart);
    - on desktop, a light gray sidebar sticky under the auto-hiding header;
    - on mobile, a native `<details>` at the top, "Mostra riepilogo · € X", closed by default (no JavaScript, keyboard accessible).
  - **i18n `checkout`:** added `eyebrow`, `backToCart`, `stepsLabel`, `stepCompleted`, `showSummary`; step titles without the "1." prefixes; removed `breadcrumbsCart`.
- **Forms (`CheckoutDetailsForm`, `CheckoutShippingForm`, `CheckoutPlaceOrderForm`):**
  - **classes only:** uppercase labels, underlined fields, the billing fieldset on light gray, black `label-caps` buttons, black accent on checkboxes and radios;
  - **shipping options:** rows with thin dividers, the name in uppercase, the price in serif and the description below;
  - **"Conferma ordine":** a large black button;
  - **date field:** `input[type="date"]` added to `.form-editorial`;
  - **behavior unchanged:** validation, the server-side age check (date of birth discarded), the test payment, cookies and field ids;
  - the shipping legend floats above the first option border, otherwise browsers draw the fieldset border through it.
- **Confirmation (`app/ordine/confermato/page.tsx`):**
  - a black header ("Grazie! Abbiamo ricevuto il tuo ordine.", "Ordine ricevuto", order number in large serif, email);
  - then the wines as editorial rows, the ID-check and pickup notes, and the total on light gray with "Continua gli acquisti";
  - "no recent order" is a full-screen page over the blurred vineyard, like the empty cart;
  - the confirmation still reads only the httpOnly order cookie, with no id in the URL (ADR 039).

## Consequences
- **Positive:**
  - The whole purchase path (cart → checkout → confirmation) is coherent with the site.
  - The mobile total is visible at once.
  - The steps show progress at a glance.
- **Trade-offs:**
  - The step indicator does not remember a step the visitor has opened but not saved; it follows saved data only.
  - Details are prefilled for customers but not saved until "Salva e continua", so step 01 stays current until then.
- **Verified (2026-11-08)**, headless Chrome on the user's dev servers:
  - **Guest:**
    - steps 01* → 01✓ 02* → 01✓ 02✓ 03*; fields underlined (top 0, bottom 1 px);
    - shipping options translated and styled; summary total €24.90;
    - a 17-year-old is rejected ("Per acquistare devi avere almeno 18 anni.") and stays on `/checkout`; an adult places **order #15**;
    - the confirmation shows the black header, #15 and €24.90;
    - another browser on `/ordine/confermato` sees "Non ci sono ordini recenti…" without the email.
  - **Customer:** registration, profile and address saved; the checkout is prefilled (email, saved address, phone); **order #16**; another customer gets the 404 on that order.
  - **Mobile 375:** summary closed at load, opened on tap, the sidebar hidden, no overflow. **EN:** header and steps translated.
  - **DoD:** lint, typecheck and tests pass (177 storefront, 24 backend).
- **Security notes:**
  - Visual changes only: Server Actions, Zod validation, the age check (backend hook, ADR 038), cookies and the order-cookie confirmation are unchanged.
  - Verified live: the minor rejection, and that the order cannot be read from another browser.
