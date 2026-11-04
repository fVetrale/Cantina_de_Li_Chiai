# 034. Real Inventory Management in Medusa

- **Status:** Accepted (2026-11-04). The initial quantities are **PROVISIONAL**.
- **Related:** ADR 026 (no invented catalog data), ADR 033 (shipping)

## Context
All 14 seed variants had `manage_inventory: false`, so Medusa had no inventory items and no stock levels:
- **Overselling.** The shop sells in "piccole quantità" (small batches), but nothing stopped a customer from ordering more bottles or cured meats than exist.
- **A fake scarcity badge.** The storefront showed "solo X rimasti" ("only X left") from `left`, a hardcoded value in its local editorial metadata (`FALLBACK_PRODUCTS`), unrelated to real stock.

The user chose option (b) on 2026-11-04: real stock in Medusa, managed from the admin, "because it must be professional".

## Alternatives
1. **(a) Keep `manage_inventory: false` and handle quantities by hand.** It is simpler, but it allows overselling, and the fake scarcity badge would have to be removed anyway. Rejected.
2. **(b) Medusa inventory: inventory items plus stock levels at the cellar location, with reservations on orders.** (Chosen)

## Decision
In `apps/backend/src/scripts/seed.ts` (idempotent):

- **New databases:** every seed variant is created with `manage_inventory: true`, so Medusa creates its inventory item.
- **Existing databases:** variants with `manage_inventory: false` are switched with `updateProductVariantsWorkflow` (`manage_inventory: true`). The workflow creates the default inventory item and its link to the variant (`createProductVariantsDefaultInventoryStep`).
- **Initial stock levels** at "Magazzino Cantina de Li Chiai", by category: wine **60**, cured meats **20**, fresh meat **10**, oil **30** (`INITIAL_STOCK`, provisional).
  - They are created **only when a variant has no level at that location**. Re-running the seed never overwrites quantities that the client manages from the admin.
  - Categories are matched by **id**, not by name. The dev DB still has the legacy wine category name "Vini Rossi" (which also holds the white wines).
- The sales channel ↔ stock location link (created earlier by the seed) makes this stock available to the storefront's publishable key.

## Consequences
- **Positive:**
  - **No overselling.** Adding more than the available quantity fails with *"Some variant does not have the required inventory"* (verified: 61 bottles with 60 in stock → 400).
  - Completed orders **reserve** stock (verified: order #1 reserved 2 Chiai Rosso and 1 bistecche).
  - The client manages quantities from the Medusa admin (Inventory).
- **Follow-up in the storefront (cart task):**
  - The "solo X rimasti" badge still reads the fake `left` metadata.
  - It must show real availability: request `+variants.inventory_quantity` (available through the publishable key's sales channel), remove `left` from the local metadata, and handle "esaurito" (sold out) on the product page and the cart.
  - The cart must also show Medusa's inventory error clearly, not as a generic failure.
- **Operational:**
  - Someone must keep the stock levels up to date in the admin, including sales made in the physical cellar, or the site will either refuse sales or sell stock that is gone.
  - Backorders are not allowed (`allow_backorder: false`, the default).
- **Dev DB note:** an early run of this change created the wine levels at 0, because the category was matched by name. That run was corrected once, on 2026-11-04, by setting those 4 levels to 60 with `updateInventoryLevelsWorkflow`, and the seed now matches categories by id.
- **To confirm with the client:** the real quantities per product, and whether the cellar shop and the website share the same stock.
