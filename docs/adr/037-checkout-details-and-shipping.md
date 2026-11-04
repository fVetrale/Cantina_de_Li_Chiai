# 037. Checkout (Part 3a): Contact, Addresses and Shipping Methods

- **Status:** Accepted (2026-11-04). Part 3a of the checkout. Order placement, age verification and the confirmation page come in 3b (ADR 038).
- **Related:** ADR 029 (Italy only), ADR 033 (shipping profiles, fresh meat pickup-only), ADR 035/036 (cart, httpOnly cookie, Server Actions)

## Context
To complete an order, Medusa needs on the cart:
- an email;
- a shipping address (in a country of the cart's region: Italy);
- **one shipping method per shipping profile** present in the cart;
- a payment session.

Our cart can hold two profiles: general goods (wine, cured meats, oil) and fresh meat (pickup-only, ADR 033).

Facts about the Medusa 2.22 Store API, verified in the code and live:
- `POST /store/carts/:id/shipping-methods` accepts **an array** of `{ option_id }`. It replaces only the existing methods **of the same profiles** (`addShippingMethodToCartWorkflow`), so "courier for wine" and "pickup for meat" can coexist.
- `GET /store/shipping-options?cart_id=` returns the options of **every** profile served by the location, priced for the cart (the free-from-€90 rule is already applied).
- The Store API does **not** expose a product's shipping profile (`/store/products?fields=shipping_profile…` returns nothing).

The user's decisions (2026-11-04):
- split the checkout into 3a + 3b;
- a one-page checkout;
- phone required;
- no "request an invoice" field for now (to ask the client);
- **orders without real payment are acceptable only in development**, and the site must not go live before the Stripe tasks 4–5.

## Alternatives
1. **A multi-step checkout with one URL per step.** It needs more routing and state. Rejected for now: one page with three sections is simpler and keeps the summary visible.
2. **Compute shipping prices or totals in the storefront.** Rejected: Medusa owns prices, taxes and the free-shipping rule.
3. **Find each line's shipping profile through a custom backend endpoint.** Possible, but it is a new endpoint and security surface. Rejected: the category flag plus the option type code are enough, and Medusa re-validates at completion.
4. **One page, Server Actions, Medusa-computed totals, and groups derived from the category flag.** (Chosen)

## Decision

### Data (`lib/data/checkout.ts`)
- **`retrieveCheckoutCart`, `updateCheckoutCart`, `listCartShippingOptions`, `setCartShippingMethods`.**
  - They reuse `storeRequest` from `lib/data/cart.ts` (now exported): publishable key, `no-store`, Zod validation, and the same error mapping.
  - Ids are checked against `CART_ID_PATTERN` and `SHIPPING_OPTION_ID_PATTERN` (`^so_…`) before they are used in a URL.
- **`groupShippingOptions(options, needs)`:**
  - The **fresh-meat group** is the profile of the option with `type.code = "pickup-fresh-meat"` (from the seed). It is needed when a line has the category `carne-fresca` (ADR 036).
  - Every other profile is the **general group**, needed when there is any non-meat line.
  - If this heuristic is ever wrong, Medusa still refuses to complete the cart (verified in ADR 033).
- **`getCurrentCheckoutView()`** returns `ok | empty | unavailable`. The `ok` view contains:
  - the email, the addresses (prefilled from the cart), and the lines;
  - the totals **from Medusa**: `item_total`, `shipping_total`, `total`;
  - the shipping groups (null until an address is saved), the selected option per profile, and `shippingComplete`.

### Server Actions (`lib/actions/checkout.ts`)
- **`saveCheckoutDetails(input)`:**
  - Zod-validates email, phone (`^\+?[0-9][0-9 ]{5,19}$`), and addresses (required names and street, CAP `^\d{5}$`, province code `^[A-Z]{2}$` uppercased). Billing is optional and defaults to the shipping address.
  - It returns `invalid_input` with the **field paths only**, and the UI shows its own i18n message.
  - **The country is always `it`, whatever the client sends.**
  - Then it calls `POST /store/carts/:id` and `refresh()`.
- **`selectShippingOptions({ optionIds })`:**
  - 1–5 unique `so_…` ids.
  - It re-reads the options **Medusa offers for this cart**. Any id that is not offered, or two ids for the same profile, gives `not_allowed`.
  - Then it sends one array `POST …/shipping-methods` and calls `refresh()`.
- **In both:** the cart comes **only from the httpOnly cookie**, and without one the result is `not_found` with no Medusa call.

### UI (`app/checkout/page.tsx`, `components/checkout/*`)
- An empty cart is redirected to `/carrello`. A backend outage shows `CatalogUnavailable`. The page is not indexed.
- **Section 1, contact and address:**
  - email, phone, name, street (+ optional line), CAP, city, province, with the country shown as "Italia — spediamo solo in Italia";
  - a "billing address same as shipping" checkbox, otherwise a billing fieldset;
  - `autocomplete` tokens, `aria-invalid` with per-field messages, and `role="status"` / `role="alert"` feedback.
- **Section 2, shipping:**
  - shown after the address is saved;
  - one radio group per needed group, with prices from Medusa ("Gratis" when 0);
  - a group with a single option (fresh-meat pickup) is pre-selected.
- **Section 3, place order:** a disabled placeholder ("Conferma ordine (in arrivo)") until 3b.
- **Summary:** lines, products total, shipping ("da scegliere" until complete), total with IVA, all from Medusa.
- **The cart page** now links to the checkout ("Procedi al checkout").
- **i18n:** `checkout.*` (it/en).

## Consequences
- **Positive:**
  - A visitor can enter real checkout data and pick valid shipping.
  - Mixed carts get courier + pickup correctly.
  - Totals always match what Medusa will charge.
  - There is no client-trusted country, cart id or shipping option.
- **Trade-offs:**
  - The checkout page makes 3–4 Medusa requests: cart, product stock, checkout cart, options.
  - The fresh-meat grouping relies on the category handle `carne-fresca` and the option code `pickup-fresh-meat` (both from the seed).
  - There is no invoice / tax code field yet.
- **Not live-ready:** until Stripe (tasks 4–5), the next part (3b) will create orders with Medusa's test payment provider. **The site must not be deployed to production before tasks 4–5.** This is listed in `TODO.md` → "Prima della produzione".
- **Verified (2026-11-04):**
  - **78 Vitest tests (20 new):** details saving, forced country `it`, separate billing, 6 invalid-field cases with exact paths, no cookie, backend down, courier + meat in one call, option not offered, two options for the same group, 5 invalid inputs, grouping.
  - **Live** (headless Chrome against `next dev` + `medusa develop`):
    - an empty cart is redirected;
    - an empty submit flags all 8 required fields;
    - after saving, two groups appear (general: pickup / standard €9.90; fresh meat: pickup, pre-selected);
    - choosing standard gives Medusa totals €24.00 + €9.90 = **€33.90**;
    - after a reload, the data and choices are still there.
- **Security notes:**
  - All inputs are Zod-validated on the server, and the cart comes from the cookie only.
  - The country is fixed server-side, shipping options are checked against Medusa's own list, and ids are format-checked before reaching URLs.
  - Personal data is only sent to Medusa: no client storage and no logs.
