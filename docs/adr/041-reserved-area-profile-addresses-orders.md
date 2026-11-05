# 041. Reserved Area (Part B): Profile, Address Book, Order History

- **Status:** Accepted (2026-11-05).
- **Related:** ADR 040 (customer auth, httpOnly `cantina_auth`), ADR 037/039 (checkout, orders), ADR 029 (Italy only). Production items are in `docs/miglioramenti-e-produzione.md`, and URL rules in `docs/sicurezza-sessioni-e-produzione.md` (sections 7–8).

## Context
After ADR 040 customers can sign in, but the account menu (profile, orders, addresses) led nowhere. Project rules require **ownership checks plus a 403/404 test** for user and order data.

Medusa 2.22 facts, checked in the code and with tests:
- `/store/customers/me…` (profile, addresses) and `GET /store/orders` require a customer token and are **scoped to the authenticated customer**. The orders route forces `customer_id = auth_context.actor_id`, and accepts an `id` filter.
- An address of another customer under `/store/customers/me/addresses/:id` answers **404**.
- `GET /store/orders/:id` is **public** for anyone who knows the id (ADR 039), so we never use it for the history.
- On the customer-scoped order list, `shipping_methods` and `shipping_address` come back empty with dotted field selection. Only the `*relation` syntax returns them.

The user's decisions (2026-11-05):
1. **The email is not changeable for now.** It is read-only with "contattaci", and the real change (with verification of the new email) is listed for production.
2. **Saved addresses are used in the checkout** (included in this part).
3. **Account deletion:** a "request deletion: contact us" link for now. Self-service deletion is listed for production.

## Alternatives
1. **Read orders with `GET /store/orders/:id`.** Rejected: it is public. Anyone with a link or a guessed id would read the order.
2. **Custom backend routes for the reserved area.** Rejected for now: Medusa's built-in customer-scoped routes already enforce ownership. That ownership is now covered by our integration tests.
3. **Medusa's customer-scoped routes, accessed only server-side with the token from the httpOnly cookie, and integration tests proving the ownership.** (Chosen)

## Decision

### Backend tests
`integration-tests/http/customer-ownership.spec.ts` runs against the real Store API on a temporary database:
- **401** without a token or with a forged token on `/store/customers/me`, `/addresses` and `/store/orders`;
- **404** when customer B reads, updates or deletes customer A's address, and A's address stays intact;
- `/store/orders`, and `/store/orders?id=<foreign id>`, are empty for another customer.

### Data (`lib/data/account.ts`)
All calls carry the customer token (`storeRequest` with `authToken`).
- **Profile:** `retrieveProfile`, and `updateProfile` (name and phone only, **never the email**).
- **Addresses:** `listAddresses` (Italian addresses only, default first), `saveAddress` (create or update; `country_code` is always `it`), `deleteAddress`. Address ids are checked against `^cuaddr_…` before reaching a URL.
- **Orders:**
  - `listOrders` (20 per page, newest first), with a customer-facing status: processing, shipped, delivered or canceled (`toStatusKey`).
  - `retrieveOwnOrder` reads one order through the **customer-scoped list filtered by id**. An order of someone else is not returned, so the result is `not_found`. Ids are checked against `^order_…`.

### Server Actions (`lib/actions/account.ts`)
- `updateProfile`, `saveAddress` and `deleteAddress`.
- **Inputs:** validated with Zod, using the shared Italian address and phone rules in `lib/validation/address.ts` (also used by the checkout now).
- **Token:** taken from the cookie only. No customer, cart or country is accepted from the client, and extra keys are ignored.
- **Results:** `unauthenticated` (no cookie or 401), `not_found` (404) or `unavailable`, then `refresh()` on success.

### Pages
- **Guard:** `requireCustomer()` redirects guests and expired tokens to `/account` (login) before rendering anything.
- **Layout:** `AccountShell` gives each page the greeting, "Esci", and a side navigation: Overview, Profile, My orders, Addresses, plus Wishlist and Saved cards marked "In arrivo".
- **`/account`:**
  - for **guests**, the login and registration forms;
  - for **customers**, an overview with section cards, the last 3 orders, and the account deletion box (a contact link for now).
- **`/account/profilo`:** name, last name and phone. The email is read-only, with a note.
- **`/account/indirizzi`:** the address book (list with a "Predefinito" badge, add, edit, delete with confirmation, set as default).
- **`/account/ordini`:** the history, with a note that guest orders are not shown (ADR 040).
- **`/account/ordini/[id]`:** items, shipping, total and the shipping address. **An order of someone else gives 404**. The id in this URL is harmless, because a shared link shows nothing to anybody but the owner.
- **Navbar:** Profile, Orders and Addresses open their pages; Cards and Wishlist open the overview.
- All pages are `noindex`, and the text is i18n (`accountArea.*`, it/en).

### Checkout integration
For a logged-in customer:
- the email is prefilled from the account;
- the address is prefilled from the default saved address when the cart has none;
- the phone is prefilled from the address or, failing that, from the profile;
- a **"Usa un indirizzo salvato"** select fills the fields. Only the address fields are copied, never the saved address id.

## Consequences
- **Positive:**
  - A complete reserved area.
  - Ownership is enforced by Medusa and **proven by integration tests**.
  - No order data is reachable through shareable URLs.
  - Faster checkout for returning customers.
- **Trade-offs / to do:** all listed in `docs/miglioramenti-e-produzione.md`.
  - Email change with verification, and self-service account deletion (user decisions 1 and 3).
  - Guest orders are not linked to accounts.
  - The 404 of a foreign order uses the generic site page ("Prodotto non trovato").
  - The order history is limited to the first 20 orders (no pager yet).
- **Verified (2026-11-05):**
  - **Backend:** 5 HTTP integration tests (health + 4 ownership).
  - **Storefront:** 155 Vitest tests (19 new for the reserved area). They cover:
    - no cookie → unauthenticated with no Medusa call, and expired token → unauthenticated;
    - profile never sends the email, and invalid fields are reported;
    - address created with `country_code: "it"` even if the client sends another country, and extra keys like `customer_id` ignored;
    - a foreign address → `not_found` on update and delete;
    - path-traversal or wrong-prefix ids rejected without a call;
    - only Italian addresses listed, default first;
    - the order detail uses the list endpoint with an `id` filter, **never** `/store/orders/:id`;
    - a foreign or malformed order → `not_found`; backend down → `unavailable`.
  - **Live with two customers** (headless Chrome + `next dev` + `medusa develop`):
    - A: overview, profile saved (email read-only), empty address flags 6 fields, address saved as default;
    - checkout prefilled (email, default address, profile phone), order #4 placed, listed and detailed with shipping and address;
    - **B opening A's order URL → 404**, with no data of A;
    - B's history is empty;
    - **a guest on any reserved page → redirected to login**.
- **Security notes:**
  - The token is server-side only (httpOnly cookie).
  - All reserved data comes from customer-scoped Medusa routes, and ownership is integration-tested (401/404).
  - The order detail never uses the public order endpoint.
  - Ids are format-checked, Zod is used everywhere, and the country is fixed.
  - Pages are `noindex` and rendered dynamically (never cached).
  - Only the customer's own data is sent to their own pages.
