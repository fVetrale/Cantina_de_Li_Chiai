# 039. Order Placement (Test Payment) and a Private Confirmation Page

- **Status:** Accepted (2026-11-05). Part 3b of the checkout.
- **Related:** ADR 035–037 (cart, checkout), ADR 038 (age verification). Stripe replaces the test payment in tasks 4–5.

## Context
After ADR 037 the cart has an email, addresses and shipping methods. To become an order, Medusa needs a payment session and a call to `POST /store/carts/:id/complete`. That call also runs our age-verification hook (ADR 038).

Medusa 2.22 facts, verified in the code:
- `POST /store/payment-collections` **returns the existing collection** for a cart, if there is one (safe to retry).
- `complete` answers in three ways:
  - `{ type: "order", order }` on success;
  - **400** for validation errors (missing data, shipping profile not covered, inventory, our age check);
  - `{ type: "cart", error }` (HTTP 200) for payment authorization errors.
- **`GET /store/orders/:id` is public:** anyone with an order id can read that order (email, items, totals). Order ids are long random ULIDs, but an id must never end up somewhere another person can see it (URLs, logs, shared links).

The user's decisions:
- use the **test payment provider** until Stripe;
- the site is **not published** before tasks 4–5;
- privacy and security come first.

## Alternatives
1. **A confirmation URL with the id (`/ordine/[id]`).** Rejected: anyone who sees or guesses the URL (history, screenshots, analytics, referrers) reads the order through the public endpoint.
2. **Customer login to view orders.** That is the right long-term answer (reserved area), but customer auth is not built yet (ADR 031).
3. **No confirmation page.** Rejected: bad UX, and the buyer has no order number.
4. **Order id only in an httpOnly cookie, read server-side by a confirmation page with no id in the URL.** (Chosen)

## Decision

### `placeOrder` Server Action (`lib/actions/checkout.ts`)
1. **Zod** validates `{ birthDate: YYYY-MM-DD, declaredAdult: true, acceptTerms: true, locale: "it" | "en" }`.
2. `checkAge` (ADR 038) checks the age. An invalid date gives `invalid_input`, and under-18 gives `underage`. **Nothing is sent to Medusa yet.**
3. The cart id comes **from the httpOnly cookie only**. Without it the result is `not_found`.
4. A pre-check reads the cart: no email, address or shipping method gives `incomplete`, and nothing is written.
5. The action stores the **age declaration without personal data** in the cart metadata.
6. It opens or reuses the payment collection and creates a session with **`pp_system_default`** (`TEST_PAYMENT_PROVIDER_ID`). There is **no real charge**.
7. It calls `complete`. The outcomes map to:
   - `age_rejected`: a 400 whose message contains "age verification";
   - `out_of_stock`;
   - `rejected`: other 400s;
   - `payment_failed`: `type: "cart"`;
   - `not_found` / `unavailable`.
8. On success:
   - it **deletes the cart cookie**;
   - it sets **`cantina_last_order`** = order id (httpOnly, `sameSite=lax`, `secure` in production, `path=/`, **1 day**);
   - it calls `redirect("/ordine/confermato")`, keeping `?lang=en`.

The data calls are in `lib/data/checkout.ts`: `setAgeDeclaration`, `initiatePaymentSession`, `completeCart`, `retrieveOrderSummary`. `storeRequest` now also returns Medusa's HTTP status and message on errors, so a validation refusal can be told apart from an outage.

### Confirmation page (`app/ordine/confermato/page.tsx` + `lib/data/order-session.ts`)
- **Never takes an id from the URL.** It reads only the buyer's own cookie, format-checked against `^order_[0-9A-Za-z]+$` before use.
- **Data minimisation:** it requests only `id, display_id, email, totals, items (title, handle, quantity, unit price), shipping methods (name, amount)`. There are **no addresses, phone, metadata or customer fields** (asserted by a test).
- **It shows:**
  - the order number (`#display_id`), the email, the lines, shipping, and the total with IVA;
  - "an ID may be requested at pickup or on delivery";
  - the pickup hours, and a "contact us quoting the order number" note.
- **It does not claim** that a confirmation email was sent: no notification provider is configured yet.
- **States:**
  - no or invalid cookie, or an unknown order → "Non ci sono ordini recenti da mostrare su questo dispositivo";
  - backend down → `CatalogUnavailable`.
- It is not indexed.

### Checkout step 3
`CheckoutPlaceOrderForm` (ADR 038) replaces the placeholder. It is enabled only when steps 1–2 are complete. All errors are i18n (it/en) with `role="alert"`.

## Consequences
- **Positive:**
  - Full guest checkout flow: cart → details → shipping → age + terms → order → private confirmation.
  - Stock is reserved by Medusa on completion (ADR 034).
  - The order is **not viewable by other people** through our site.
- **Trade-offs:**
  - The confirmation is visible only on the same device and browser, for 1 day. Later, customer accounts with the order history (with ownership checks and 403/404 tests) will cover "see my orders".
  - The test payment is **not production-ready**. The site must not go live before Stripe (tasks 4–5), as tracked in `TODO.md`.
  - There is no order email yet: a notification provider is still needed.
  - Medusa's public `GET /store/orders/:id` remains a platform property. We never expose ids, and in future a backend route override could restrict it to authenticated customers or a signed token.
- **Verified (2026-11-05):**
  - **114 Vitest tests:**
    - 12 `placeOrder` tests: happy path, request sequence, test provider, declaration content, **no birth date in any request**, English redirect, under-18 with no Medusa call, 7 invalid inputs, no cookie, incomplete cart, age refusal, inventory, other refusals, payment error, backend down;
    - 5 order-session tests: own cookie, **no address / phone / metadata requested**, no cookie, tampered cookie, 404, down.
  - **Backend:** 24 unit tests plus the HTTP integration test (Medusa boots with the hook).
  - **Live in Chrome:**
    - step 3 is locked until steps 1–2 are done;
    - a 17-year-old is refused;
    - an adult places **order #3** and is redirected to "Ordine ricevuto" (€9.00, pickup free);
    - the cart cookie is gone and the badge shows 0;
    - the order cookie is httpOnly and not readable by JS;
    - **a second browser opening `/ordine/confermato` sees "Non ci sono ordini recenti"**.
- **Security notes:**
  - All inputs are Zod-validated.
  - The cart and order ids come only from httpOnly cookies, never from URLs or the client, and are format-checked before they reach any URL.
  - Minimal order fields, and no PII in logs.
  - Age enforcement happens in the backend (ADR 038).
  - The test payment provider only, so there is no real money flow.
