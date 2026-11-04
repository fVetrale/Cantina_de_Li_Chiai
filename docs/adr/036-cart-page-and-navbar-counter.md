# 036. Cart Page and Live Navbar Counter

- **Status:** Accepted (2026-11-04). Part 2b of the cart.
- **Related:** ADR 033 (shipping, fresh meat pickup-only), ADR 034 (inventory), ADR 035 (cart Server Actions, httpOnly cookie)

## Context
After ADR 035 a visitor could add products to a real Medusa cart, but could not see that cart:
- The Navbar badge always showed 0.
- The cart icon linked to `/#catalog`.

The Navbar is a client component rendered by 7 pages, each passing its own props. The checkout (task 3) is not built yet.

The user's decisions (2026-11-04):
- a dedicated `/carrello` page now, and later a side panel that hides when the cart is empty;
- the checkout button stays **disabled** with "Checkout in arrivo";
- a **"€X away from free shipping"** bar;
- the **fresh-meat pickup-only notice** in the cart.

Medusa facts found while building it (Store API 2.22):
- `GET /store/carts/:id` returns lines **without** stock and without product categories: `inventory_quantity` and categories are only computed on the product endpoints. Product thumbnails are empty.
- `DELETE /store/carts/:id/line-items/:line_id` answers `{ deleted, parent: cart }`, not `{ cart }`.
- Medusa looks a line up **inside the cart in the URL**. A line id that belongs to another cart returns 404.

## Alternatives
1. **Each page reads the cart and passes `cartCount` to the Navbar.** Rejected: it means 7 page edits, and every new page must remember to do it.
2. **The client fetches the cart counter (`/api/cart`).** Rejected: it needs an extra endpoint and a client round trip, and the count flickers after load.
3. **The root layout reads the cart, a context provides it to the Navbar, and Server Actions call `refresh()`.** (Chosen)

## Decision

### Navbar counter
- `app/layout.tsx` (now `async`) calls `getCurrentCartSummary()`.
- `components/CartProvider.tsx` passes **only** `{ itemCount, itemTotal }` to the client.
- `Navbar` reads them with `useCartCounter()`. Its `cartCount` / `cartTotal` props are removed, and the icon links to `/carrello` (keeping `?lang=en`).
- Every successful cart Server Action (`addToCart`, `updateCartItem`, `removeCartItem`) calls **`refresh()`** (Next 16, `next/cache`). The current route and the layout are re-rendered, so the counter and the cart page update without a full reload.
- `getCurrentCartSummary()` never throws. If there is no cookie, the cart is missing or completed, or the backend is down, it returns `null`, which is shown as 0. **Medusa is only called when the visitor has a cart cookie.**

### Server-side cart session
`lib/data/cart-session.ts`:
- holds the cookie name and options (moved from the actions);
- `getCurrentCartSummary()`;
- `getCurrentCartView()`, which returns `ok | empty | unavailable` with lines that carry:
  - the unit price and line total (IVA included);
  - the **live stock** (`available`) and **`isFreshMeat`**, both from one `/store/products?id[]=…` request (category handle `carne-fresca`);
  - the local product photo (`getLocalProductImage`), because Medusa has no thumbnails.

  If the stock lookup fails, the cart still renders, without limits.

### Cart page and actions
- **New Server Actions** in `lib/actions/cart.ts`:
  - `updateCartItem({ lineItemId, quantity })` and `removeCartItem({ lineItemId })`;
  - Zod-validated (line id `^cali_[0-9A-Za-z]+$`, quantity 1–120);
  - the cart always comes from the cookie, and extra input keys such as `cartId` are ignored. A line of another cart gives `not_found`. Without a cookie they return `not_found` with no Medusa call.
- **`app/carrello/page.tsx`** (server):
  - **States:** full cart, empty cart (link to the catalog), or backend unreachable (`CatalogUnavailable`).
  - **Lines** (`components/CartLineItem.tsx`, client): photo, title, format, unit price, "X disponibili", −/+ stepper (min 1, max stock or 120), "Rimuovi", fresh-meat notice, and `role="alert"` errors.
  - **Summary:** products total with IVA, free-shipping progress bar (`role="progressbar"`), "Ritiro in cantina sempre gratuito", fresh-meat note when relevant, and a disabled "Checkout in arrivo" button.
  - `robots: noindex`.
- **Free-shipping hint:** `FREE_SHIPPING_THRESHOLD_EUR = 90` in `lib/data/cart.ts`. It **duplicates** the backend constant `FREE_SHIPPING_FROM_EUR` (ADR 033), with a comment on both sides. It only drives the hint: Medusa applies the real rule at checkout.
- **i18n:** `cartPage.*` (it/en).

## Consequences
- **Positive:**
  - The visitor sees and manages the real cart from any page.
  - Stock limits and the fresh-meat rule are visible before checkout.
  - The ownership of lines is enforced by the cookie plus Medusa (verified by tests).
- **Trade-offs:**
  - The root layout now reads cookies, so all routes render dynamically. They were already dynamic because of `?lang=`.
  - Visitors with a cart cookie cost one extra Medusa request per page.
  - The cart page makes two Medusa requests: the cart, then its products' stock.
  - Changing the free-shipping threshold requires editing two constants (backend seed + storefront).
  - The "−" button stops at 1. Removing is a separate action, which avoids an accidental removal.
- **Verified (2026-11-04):**
  - **58 Vitest tests:** 13 new action tests (update, remove, refresh, ownership, invalid input) and 9 cart-session tests (summary, view, meat flag, stock, empty / unavailable / tampered cookie).
  - **Live,** with headless Chrome against `next dev` + `medusa develop`:
    - empty cart, badge 0 → 1 → 2 after adding wine and meat;
    - `/carrello` shows €24.00, "Ti mancano €66,00", the meat note, and checkout disabled;
    - "+" → quantity 2 and badge 3; removing the meat → note gone, badge 2;
    - English page OK; removing the last line → empty state and badge 0.
  - `next build` was not run, because the user's `next dev` was using the same `.next` folder.
- **Security notes:**
  - All new actions validate input with Zod and never accept a cart id from the client.
  - Line ids are format-checked before they reach a URL.
  - Cart reads are `no-store`.
  - The page is not indexed.
  - Only two numbers (count, total) are passed to the client for the counter.
- **Next:** task 3, the checkout (email, Italian address, shipping options grouped by `shipping_profile_id` with the meat pickup-only rule, summary, test payment provider). Later: the side panel.
