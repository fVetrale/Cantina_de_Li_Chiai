# 035. Storefront Cart: Medusa Cart via Server Actions and an httpOnly Cookie

- **Status:** Accepted (2026-11-04). Part 2a of the cart. The cart page and Navbar counter come in 2b.
- **Related:** ADR 026 (data layer), ADR 033 (shipping), ADR 034 (inventory)

## Context
"Add to cart" on the product page (`ProductPurchaseSection`) and on the catalog cards (`WineCard`) only changed the button's look for two seconds. Nothing reached Medusa. The cards also showed "Disponibili: N" from `left`, a hardcoded value in the local editorial metadata.

Since ADR 034, Medusa manages real stock and refuses quantities above it. The checkout (task 3) needs a real Medusa cart, in the Italy region, with the products' variant ids (ADR 026).

Constraints:
- **Security rules:** no tokens in localStorage, Zod at every boundary.
- **A cart id works like a bearer token.** In Medusa, whoever knows a cart id can read and change that cart, including the email and address added at checkout.
- **Next 16 Server Actions** can be called with direct POST requests, not only from our UI. So their inputs must be validated on the server.

The user's decisions (2026-11-04):
- after adding, stay on the product page with a confirmation;
- a dedicated cart page first, then a side panel that hides itself when the cart is empty;
- **always** show "X disponibili" (not only below a threshold).

## Alternatives
1. **Cart id in localStorage, with the cart called from the browser through `@medusajs/js-sdk`.** Rejected: the id would be readable by any script on the page (XSS), and that goes against the project rules.
2. **`@medusajs/js-sdk` on the server.** It is possible, but it adds a second style next to the existing `fetch` + Zod data layer, and its responses are not validated at our boundary. Kept for later (auth).
3. **Next Route Handlers (`/api/cart`).** These work, but they need more code: our own HTTP API plus client fetch calls. Server Actions are the idiomatic Next 16 mutation path.
4. **Server Actions plus a server-side `fetch` + Zod module, with the cart id only in an httpOnly cookie.** (Chosen)

## Decision

### Files
- **`lib/data/cart.ts`** (server-side):
  - `retrieveCart`, `createCart`, `addLineItem`, `summarizeCart`.
  - Plain `fetch` with the publishable key and **`cache: "no-store"`**. A cart is per-customer, mutable state.
  - Every response is parsed with Zod. Errors are mapped to `out_of_stock` (Medusa 400 "…required inventory"), `not_found` (404) or `unavailable` (network, other statuses, unexpected shape).
  - `CART_ID_PATTERN` (`^cart_[0-9A-Za-z]+$`) is checked before any id goes into a URL path. A tampered cookie such as `../admin/users` is never sent.
- **`lib/actions/cart.ts`** (`"use server"`): `addToCart(input)`.
  - It validates `{ variantId: /^variant_[0-9A-Za-z]+$/, quantity: integer 1–120 }` with Zod. Invalid input returns `invalid_input` without calling Medusa.
  - It reads the cart id **only from the cookie, never from the client**. It creates a new cart (Italy region, `getStoreRegionId()` from the data layer) when there is no cookie, when the cart no longer exists, or when it is **completed** (it has already become an order).
  - It keeps the existing cookie when the backend is unreachable, so a temporary outage does not lose the cart.
  - It returns `{ ok: true, itemCount } | { ok: false, error: "invalid_input" | "out_of_stock" | "unavailable" }`.
- **Cookie `cantina_cart_id`:** `httpOnly`, `secure` in production, `sameSite: "lax"`, `path: "/"`, `maxAge` 30 days.

### Availability (ADR 034 in the storefront)
- `getProducts` / `getProductByHandle` also request `+variants.inventory_quantity`.
- `WineProduct.availableQuantity` has three possible values:
  - Medusa's quantity, clamped to ≥ 0;
  - `0` (sold out) when stock is managed but missing;
  - `null` when stock is not managed or backorders are allowed.
- The fake `left` values are removed from the local metadata.

### UI
- **Product page:**
  - "**X disponibili**" is always shown when stock is managed.
  - Quantity presets above the stock are disabled, and the custom quantity is capped at the stock.
  - The button shows "Aggiunta in corso…", then "Aggiunto al carrello (n)", and is disabled when sold out ("Esaurito").
  - Errors are shown in a `role="alert"` message (it/en).
- **Catalog cards:**
  - "Disponibile in cantina · X disponibili", or "Esaurito".
  - Their "Aggiungi" button adds 1 unit through the same action.
- All new text is in `lib/i18n.ts` → `cart.*` (it/en).

## Consequences
- **Positive:**
  - Products really go into a Medusa cart, at the regional, IVA-inclusive price.
  - Stock limits are enforced by Medusa, and the UI explains them.
  - The cart id is out of reach of page JavaScript.
  - The checkout can start from this cart.
- **Trade-offs:**
  - The displayed availability comes from the ISR-cached catalog (30–60 s), so it can be slightly stale. Medusa re-checks stock on every add, and that check is authoritative.
  - The Navbar counter is still 0 until 2b. The visitor sees the confirmation on the button.
  - Without JavaScript the add button does nothing: it is an `onClick`, not a `<form action>`. Acceptable for now.
  - `@medusajs/js-sdk` stays installed but unused. Reconsider it with customer auth.
- **Verified (2026-11-04):**
  - 36 Vitest tests (16 data layer + 4 availability + 16 cart action). The tests cover: cookie flags, no caching, cookie reuse, completed or missing carts, a tampered cookie, out of stock, 7 invalid inputs, and backend down (with and without an existing cookie).
  - Live (`next dev` + `medusa develop`, headless Chrome):
    - the Chiai Rosso page shows "58 disponibili" (60 minus 2 reserved by test order #1);
    - "Aggiungi al carrello" created the Medusa cart (1 × Chiai Rosso, €9);
    - the cookie is `httpOnly`, `SameSite=Lax`, 30 days, and not visible in `document.cookie`;
    - asking for 58 more showed the out-of-stock message.
- **Next (2b):**
  - the `/carrello` page (change quantity, remove, totals, link to checkout);
  - the Navbar counter from the real cart;
  - later, a side panel that hides when the cart is empty.
- **Security notes:**
  - Server Actions validate all input.
  - The cart id is only in an httpOnly cookie and is format-checked before use.
  - There are no admin credentials in the browser.
  - Carts are never cached.
