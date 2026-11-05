# 042. Wishlist Stored in the Customer's Medusa Metadata (Part C of the Reserved Area)

- **Status:** Accepted (2026-11-05).
- **Related:** ADR 040 (customer auth), ADR 041 (reserved area), ADR 026/035 (catalog, availability)

## Context
The product page had a fake "Aggiungi ai miei preferiti" heart: it changed colour and saved nothing. The account menu listed "Preferiti" as coming soon. Medusa 2.22 has no built-in wishlist.

The user's decisions:
- store the wishlist in the **customer metadata** for now (2026-11-05);
- show the heart **on the catalog cards too**;
- **guests get a "sign in to save" message** with a login link.

## Alternatives
1. **A custom Medusa module** (wishlist model, migration, store routes with auth and IDOR tests). This is the cleanest long-term option (queries, analytics, sharing), but much more work, and it means a new endpoint surface. Postponed.
2. **Browser storage (localStorage) for guests.** Rejected: it is lost across devices, it is unclear what happens at login, and the user preferred an invitation to sign in.
3. **`metadata.wishlist` on the customer** (an array of product ids), read and written through `/store/customers/me` with the customer's token. (Chosen)
   - No backend code and no migration.
   - Ownership comes from Medusa's customer-scoped route (integration-tested in ADR 041).

## Decision
- **Data (`lib/data/wishlist.ts`):**
  - **`parseWishlist`** accepts only `^prod_…` ids. It removes duplicates and keeps at most **100** (`MAX_WISHLIST_ITEMS`). Junk stored by anybody is ignored.
  - **`readCustomerMetadata` / `writeWishlist`** read the current metadata first, then send it back **complete**, with only `wishlist` changed. The customer's other metadata keys survive whether Medusa merges or replaces the object.
  - **The wishlist travels with the customer read** (`metadata` added to `/store/customers/me` fields in `retrieveCustomer`), so there is **no extra Medusa call per page**. `CurrentCustomer.wishlist` holds the ids.
- **Server Action (`lib/actions/wishlist.ts`), `toggleWishlist({ productId })`:**
  1. Zod checks `^prod_…`.
  2. A login cookie is required; otherwise the result is `unauthenticated`.
  3. Adding a product requires it to **exist in the catalog** (ISR-cached `getProducts`), otherwise `not_found`.
  4. The limit gives `limit_reached`.
  5. The newest item goes first; toggling again removes it.
  6. Then `refresh()`.
- **Client:**
  - `CustomerProvider` now passes **the first name and the wishlist product ids**. Product ids are not personal data; there is still no email, customer id or token on the client.
  - **`components/WishlistButton.tsx`** comes in two variants:
    - `pdp` replaces the fake heart: an icon plus "Aggiungi ai miei preferiti" / "Salvato nei preferiti";
    - `card` is a round heart over the product image on catalog cards. It sits **next to** the image link, not inside it, because a button inside a link is invalid HTML.
  - The button uses `aria-pressed` and a label with the product name. It updates **optimistically** while the action runs.
  - For guests: "Accedi per salvare i preferiti" with a link to `/account`. Errors (limit, unavailable) are shown in a `role="status"` box.
- **Page `/account/preferiti`** (guarded by `requireCustomer`, `noindex`):
  - the saved products, newest first, rendered with `WineCard` (live price and stock, "Aggiungi", heart to remove);
  - products that left the catalog are silently skipped;
  - an empty state with a link to the catalog; `CatalogUnavailable` if the backend is down.
- **Menus:** "Preferiti" is active in the account side navigation and in the Navbar menu (`/account/preferiti`). "Carte salvate" is still "In arrivo".
- **Cleanup:** the unused top-level i18n string `wishlist: "Preferiti"` was removed, and the new section is `wishlist.*` (it/en).

## Consequences
- **Positive:**
  - A real wishlist, synced across devices for logged-in customers.
  - No backend change.
  - Ownership is enforced by Medusa's `/me` route.
  - No junk ids, and other metadata keys are preserved.
- **Trade-offs:**
  - Read-modify-write: two tabs toggling at the same moment could lose one change (a rare, harmless race).
  - Metadata is not queryable, so there are no "most wished products" statistics. A dedicated module would be needed for that, and it is listed in `docs/miglioramenti-e-produzione.md`.
  - The wishlist lives in metadata that the Medusa admin can also see and edit.
  - The heart's login link points to `/account` without `?lang=en` (`ProductPurchaseSection` and `WineCard` do not receive the locale).
- **Verified (2026-11-05):**
  - **167 Vitest tests** (12 new). They cover:
    - adding keeps other metadata (the fake backend *replaces* metadata, so the code must send everything);
    - newest first, and a second toggle removes;
    - guest → `unauthenticated` with no call; expired token → `unauthenticated`;
    - a product not in the catalog → `not_found` with no write;
    - 4 invalid inputs; the limit of 100 with no write;
    - `parseWishlist` dropping junk, duplicates and malformed values.
  - **Live** (headless Chrome against the user's running `next dev` + `medusa develop`):
    - a guest heart shows the login invitation;
    - after registration, the product page heart → "Salvato nei preferiti" (`aria-pressed=true`);
    - a catalog card heart works;
    - `/account/preferiti` lists both, newest first, and removing one updates the page;
    - the DB customer metadata holds `{"wishlist": ["prod_…"]}`.
- **Security notes:**
  - Writes only through the customer's own `/me` route with the httpOnly token.
  - Zod validation and catalog existence check; capped size.
  - Only product ids and the first name reach the client.
  - The page is `noindex` and never cached.
