# 043. Wine-Only Catalog: Remove Cured Meats, Fresh Meat and Olive Oil

- **Status:** Accepted (2026-11-05).
- **Supersedes:**
  - the fresh-meat parts of ADR 033: the pickup-only shipping profile and its option;
  - the non-wine stock quantities of ADR 034.
  The rest of both ADRs (courier, free shipping from €90, cellar pickup, real inventory) still applies.
- **Related:** ADR 026 (catalog data layer), ADR 036/037 (cart, checkout), ADR 042 (wishlist)

## Context
The client decided on 2026-11-05 that the e-commerce sells **only wine**. Cured meats, fresh meat and olive oil leave the shop.

The user's decisions:
- remove the olive oil too;
- the shop name stays "Cantina de Li Chiai";
- the wines get **subcategories**;
- pickup at the cellar stays;
- the non-wine products are **deleted** from the database, not just hidden. Earlier commits keep the old code if it is ever needed again.

The work is split into three branches:
1. this one: data and logic;
2. the texts (hero, "Salumeria", SEO, footer copy);
3. the unused images and editorial data.

## Alternatives
1. **Hide the products (draft) and keep the code.** Rejected: the user asked for deletion, and the dead fresh-meat logic would stay in cart and checkout.
2. **Delete the rows with SQL.** Rejected: it bypasses Medusa's links, inventory items and events.
3. **Medusa's own workflows from the idempotent seed.** (Chosen) The seed uses the same workflows as the admin (`deleteProductsWorkflow`, `deleteProductCategoriesWorkflow`, `deleteShippingOptionsWorkflow`, `deleteShippingProfileWorkflow`). Medusa deletes are soft deletes, and orders keep their own copy of titles and prices.

For the categories:
- **A parent "Vini" with children.** Rejected: everything is wine now, so "Tutti" already plays that role, and the storefront reads one category per product.
- **Three flat categories, one per wine.** (Chosen)

## Decision

### Backend (`apps/backend/src/scripts/seed.ts`)
- **Catalog:** the 4 wines only.
- **Categories:** **Vini Rossi** (`vini-rossi`: Chiai Rosso, Rosso Vecchio), **Vini Bianchi** (`vini-bianchi`: Chiai Bianco) and **Vini Dolci** (`vini-dolci`: Bianco Dolce).
  - They are matched by handle, so the old "Vini Rossi" and "Vini Bianchi" are reused.
  - They are activated and made public: the old database had them inactive.
  - Every wine is moved into exactly its own category.
- **Cleanup of existing databases (step 7b):**
  - **Products:** the 10 non-wine products are deleted, together with their inventory items.
    Medusa refuses to delete inventory that an **open order reserves**. Those products are set to **draft** instead, which hides them from the Store API. A warning names them, and the next run deletes them once the orders are canceled or fulfilled.
  - **Categories:** the old ones (`vini`, `riserve`, `insaccati`, `carne-fresca`, `olio-evo`) are deleted when empty, and **deactivated** while they still hold hidden products.
  - **Shipping:** the "Ritiro in cantina (carne fresca)" option is deleted. The "Carne fresca (solo ritiro)" profile is deleted once no hidden product uses it.
- **Unchanged:** "Spedizione standard" (€9.90, free from €90) and "Ritiro in cantina" (free) on the default profile. Initial stock is 60 per wine (PROVISIONAL, set only when a wine has no stock level yet).

### Storefront
- **Cart:** the `isFreshMeat` flag, the `FRESH_MEAT_CATEGORY_HANDLE` constant and the "solo ritiro" notices are removed. The stock lookup no longer asks for categories.
- **Checkout:**
  - `groupShippingOptions(options)` now simply groups by shipping profile, so the wine catalog shows **one choice**: "Come vuoi ricevere i tuoi vini?" (courier or pickup).
  - The one-method-per-profile guard in `selectShippingOptions` stays.
  - `FRESH_MEAT_PICKUP_OPTION_CODE` is removed.
- **Categories:**
  - `DEFAULT_CATEGORIES` (data layer and Navbar) are the three wine categories.
  - The catalog filters match the **exact category handle**, with no more "insaccat/salum/carne/olio" name guessing and no hard-coded fallback filters.
  - `/vini?categoria=` with an unknown or retired handle (e.g. old `insaccati` links) shows the whole catalog.
  - The footer links point to Rossi / Bianchi / Dolci.
- **Local metadata:** the non-wine entries and image heuristics in `lib/data/products.ts` are removed.
- **i18n:**
  - removed: `freshMeatPickupOnly`, `groupGeneral`, `groupFreshMeat`, `filterWhite`/`filterRed`, `filterWhites`/`filterReds`, and the four footer product keys;
  - added: `checkout.shippingChoiceLegend` and `footer.productsRedWines` / `productsWhiteWines` / `productsSweetWines` (it/en).
  - The descriptive copy is left to branch 2.

## Consequences
- **Positive:**
  - A simpler cart and checkout: one shipping choice, no cold-chain rules.
  - Exact category filters.
  - The seed repairs old databases and creates clean new ones.
  - Past orders stay readable.
- **Trade-offs / to do:**
  - **Development database:** test orders #1, #5, #6 and #7 are still open and reserve stock of Salsiccia Piccante, Bistecche and Misto Cinghiale. Those 3 products are hidden (draft) and their 2 categories are inactive until the orders are canceled in the admin (cancel their fulfillments first) and the seed is re-run.
  - Category names come from Medusa, so they stay in Italian in the English version (as before).
  - The descriptive texts still mention the salumeria, meat and oil (branch 2).
  - The non-wine images are still in `public/images` (branch 3).
  - A wishlist that contained deleted products just skips them (ADR 042).
- **Verified (2026-11-05):**
  - **Database:** a `pg_dump` backup was taken first. The seed ran on a **restored copy** (twice), then on `winery_dev`, and on an **empty migrated database** (twice, idempotent). That gave 4 wines in 3 categories, 2 shipping options, the default profile only, and stock 60 each.
  - **Order cancellation, simulated on the copy:** once a reservation was freed, the next run deleted that product. The canceled orders still show "Salsiccia Piccante Stagionata".
  - **Store API:** categories `Vini Bianchi`, `Vini Rossi`, `Vini Dolci`; each wine in its own category; hidden products not returned.
  - **DoD:** `pnpm lint`, `pnpm typecheck` and `pnpm test` pass: 169 storefront tests, 24 backend unit tests. Backend HTTP integration: 5/5.
  - **Live** (headless Chrome against the user's running servers):
    - filters "Tutti (4) · Vini Bianchi (1) · Vini Rossi (2) · Vini Dolci (1)", and the Navbar links;
    - `?categoria=vini-dolci` → Bianco Dolce, and the old `?categoria=insaccati` → all 4 wines;
    - a deleted product page → 404, and a hidden one → 404 after the 60 s ISR window;
    - checkout with one fieldset (courier €9.90 → total €17.90, then pickup), age check, and **order #8** placed;
    - the EN footer shows "Red Wines | White Wines | Sweet Wines".
- **Security notes:** no new endpoint or input. The shipping action still validates option ids against what Medusa offers for the cart, one per profile. Deletions go through Medusa workflows only.
