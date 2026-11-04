# 026. Storefront: Region-Aware Prices and No Fallback Catalog

- **Status:** Accepted (2026-11-04)
- **Related:** ADR 027 (tax configuration and IVA-inclusive prices), ADR 028 (storefront unit tests)

## Context
`apps/storefront/lib/data/products.ts` is the only data layer between the storefront and Medusa. It had four problems that block the cart and checkout:

1. **Wrong price source.** It read `variants[0].prices[0]`, the first raw price in the list. It ignored currency, region, price lists, promotions and taxes. This only worked because the seed has exactly one EUR price per variant.
2. **Cents heuristic.** It used `rawPrice > 100 ? rawPrice / 100 : rawPrice`. Medusa v1 stored cents, but Medusa v2 stores major units (9 = €9). A €120 product would have shown as €1.20.
3. **Invented data.**
   - A missing price became a fake €20.
   - When the backend was down, the 14 hardcoded `FALLBACK_PRODUCTS` were shown as if they were real.
   - When the backend was up, any fallback product missing from Medusa was merged into the results.

   A customer could see products and prices that cannot be bought, or that cost something else at checkout.
4. **No variant id.** A Medusa cart line item needs a variant id, and `WineProduct` did not carry one.

Two more constraints apply:
- Medusa generates the region id (`reg_…`), and it changes on every database reset.
- `.env*` files are a protected zone that only humans edit.

## Alternatives
1. **Fix only the heuristic and keep the raw `prices`.**
   - Rejected: it is still wrong as soon as there is a price list, a promotion or a second currency, and it can't tell net prices from gross ones.
2. **Read the region id from an environment variable.**
   - Simple.
   - Rejected: someone must edit a protected file after every database reset, and a stale id silently breaks pricing.
3. **Look up the region at runtime and let Medusa calculate the price.** (Chosen)
   - The storefront asks `/store/regions` for the region that contains Italy.
   - It then requests `calculated_price` for that region and country.
4. **Keep the fallback catalog when the backend is down.**
   - Rejected by the product owner (2026-11-03): a "catalog not available" page is better than wrong prices.

## Decision

### Pricing
- **Region lookup.**
  - `getStoreRegionId()` calls `GET /store/regions` and picks the region whose countries include `STORE_COUNTRY_CODE = "it"`.
  - The response is cached with ISR for 3600 s, because regions almost never change.
  - No region for Italy means the catalog is unavailable.
- **Product requests.** They send `region_id`, `country_code=it` and `fields=*variants,*variants.calculated_price,*categories,*images`. Medusa then applies price lists, promotions, price preferences and the Italian tax rate.
- **Displayed price.** It is always the **final consumer price, IVA included**:
  - `calculated_price.calculated_amount_with_tax`;
  - or `calculated_amount` when Medusa marks the price as tax-inclusive.
  - There is no cents heuristic and no default value.
- **Products without a usable price** for the region are hidden from the catalog and logged (`console.warn`). Their product page returns 404.
- **`WineProduct.variantId`** holds the id of the first variant. The cart will use it.
- **`currencyCode`** comes from Medusa instead of a hardcoded `"EUR"`.

### Boundary validation
- Every Medusa response is parsed with **Zod** (`productListResponseSchema`, `regionListResponseSchema`).
- An unexpected shape is treated like an outage, so a malformed response never reaches the UI.

### Backend unavailable
- `getProducts()` returns `{ status: "ok", products } | { status: "unavailable" }`.
- `getProductByHandle()` returns `{ status: "ok", product } | { status: "not_found" } | { status: "unavailable" }`. A backend outage no longer looks like a 404.
- "Unavailable" covers a network error, a non-2xx status, an invalid body, or no Italy region.
- Pages render the new `CatalogUnavailable` server component (i18n section `catalogUnavailable`, it/en):
  - **Home**: in place of the product showcase (`id="catalog"`, so the existing `#catalog` anchors still work).
  - **`/vini`**: in place of the grid.
  - **Product page**: as the page's `h1`.
- Every case has a "retry" link, which re-renders the same page on the server.
- `generateStaticParams` on the product page returns `[]` when the backend is down at build time, so the pages are rendered on demand.

### What stays
- **`FALLBACK_PRODUCTS`** is kept only as the source of local editorial metadata (tasting notes, terroir, badges, images) through `getWineMetadata()`. It is typed `Omit<WineProduct, "variantId">[]` and is never shown as a product.
- **`getCategories()`** is unchanged. The Navbar still falls back to `DEFAULT_CATEGORIES`, because they are navigation, not product or price data.

### Related fix: the dictionary in the 404 boundary
- Next embeds the root `app/not-found.tsx` in the payload of **every** page. That component passed the full Italian dictionary to the client `Navbar`, so every English page also shipped the whole Italian dictionary (about 22 KB).
- Fix:
  - `Navbar` now declares only the slices it reads (`NavbarDictionary`: `nav`, `common`, `accountModal`, `winesPage.filterAll`);
  - `AuthModal` declares only `accountModal`;
  - `not-found.tsx` passes `pickNavbarDictionary(dict)`.
- Pages still pass their full dictionary, because it has the right type.
- `app/global-not-found.js` would also solve this, but it is still experimental in Next 16, so it was not used.

## Consequences
- **Positive:**
  - The price on the catalog is the price the Medusa cart will charge in the same region, IVA included.
  - No more invented products or prices.
  - Products over €100 display correctly.
  - The variant id is ready for the cart.
  - Unexpected API changes fail safely.
  - English pages are about 22 KB smaller (production build: 159 KB → 137 KB for `/vini?lang=en`).
- **Trade-offs:**
  - A backend outage hides the catalog instead of showing stale data. The rest of the site (home, cellar story, legal pages, navigation) still works.
  - The "unavailable" state returns HTTP 200, not 503.
  - There is one extra cached request per hour (regions).
  - Only the first variant of each product is used. Products with several variants (formats) will need a variant picker.
- **Verified (2026-11-04):**
  - `pnpm lint && pnpm typecheck && pnpm test` pass.
  - 16 Vitest unit tests cover the data layer (ADR 028).
  - Production build plus `next start`, with the backend up: all 14 seed products show their seed price (e.g. Chiai Rosso €9.00) and their variant id. An unknown handle returns 404.
  - With the backend down: home, `/vini` (it and en) and the product page show the unavailable state.
