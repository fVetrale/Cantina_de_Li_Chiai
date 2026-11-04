# 027. Italy Tax Provider and IVA-Inclusive Prices

- **Status:** Accepted (2026-11-04). The IVA-inclusive assumption must be confirmed with the client.
- **Related:** ADR 026 (region-aware prices in the storefront)

## Context
When ADR 026 was being implemented, every Store API request that asks Medusa to compute taxes (a `country_code` with a `region_id`) failed with **HTTP 500**:

```
Unable to retrieve the tax provider with id: null
```

The seed (`apps/backend/src/scripts/seed.ts`) created the Italy tax region (22% IVA) **without a `provider_id`**. A Medusa v2 tax region needs a tax provider to compute tax lines. The same failure would have hit carts, shipping and checkout, not only the catalog.

When taxes worked, a second problem appeared. The seed prices (`amount: 9.0` for Chiai Rosso) were treated as **net** prices, so the storefront showed €10.98. In Italy, consumer (B2C) prices must be shown IVA included, and the shop's price list is written that way. The product owner's understanding is that €9 is the final price.

Investigation of `@medusajs/pricing@2.22.2` (`isTaxInclusive`) showed how Medusa chooses the tax-inclusive flag:
- A **region** price preference applies only to prices that have a `region_id` rule.
- Otherwise the **currency** preference applies.

The seed prices are currency prices (`{ currency_code: "eur", amount }`, with no region rule). So marking only the region as tax-inclusive changes nothing. The EUR currency preference decides.

## Alternatives
1. **Write your own tax logic in the storefront** (multiply by 1.22). Rejected: it duplicates Medusa, ignores future rates and exemptions, and diverges from what the cart charges.
2. **Keep prices net and update the seed amounts** (e.g. 7.377 so that it shows €9). Rejected: the amounts are ugly, rounding can drift, and the shop thinks in gross prices.
3. **Mark prices as IVA-inclusive in Medusa and configure the system tax provider.** (Chosen)
4. **Add region-specific prices with a `region_id` rule.** This is heavier, and not needed while there is one region and one currency.

## Decision
In `seed.ts`, all steps are idempotent, so re-running the seed also fixes existing databases:
- **Tax provider.** The Italy tax region is created with `provider_id: "tp_system"`, Medusa's built-in system tax provider. Existing tax regions with another or missing provider are updated with `updateTaxRegionsWorkflow`.
- **Store currency.** `updateStoresWorkflow` sets EUR as the only supported currency, `is_default: true` and **`is_tax_inclusive: true`**. This creates the `currency_code = eur` price preference that applies to the seed prices.
- **Region.** "Italy" is created with `is_tax_inclusive: true`, and existing regions are updated with `updateRegionsWorkflow`. Today this has no effect on the seed prices (see Context), but it keeps any future region-specific prices consistent.
- The dev database was fixed by re-running `pnpm --filter @winery/backend seed` on 2026-11-04.

## Consequences
- **Positive:**
  - Tax calculation works for products and, later, for carts and orders.
  - Medusa returns `calculated_amount_with_tax = 9`, `calculated_amount_without_tax ≈ 7.38` and `is_calculated_price_tax_inclusive = true` for Chiai Rosso. The storefront shows €9.00, as on the shop's price list.
  - Admin users enter prices as consumers see them.
- **Trade-offs and risks:**
  - **To confirm with the client:** if the seed amounts are actually net prices, set `is_tax_inclusive: false` on EUR (and on the region) and re-run the seed. No storefront change is needed (ADR 026 always shows the amount with tax).
  - With tax-inclusive prices, the net amount and the IVA are derived by Medusa (9 / 1.22). Invoices must use Medusa's tax lines, not values recomputed in the storefront.
  - The seed now also overwrites the store name and supported currencies on each run. Change these in the seed, not only in the admin, or the next seed run will revert them.
- **Not covered by automated tests:** the seed has no test. It was verified manually: DB price preferences (`currency_code eur → true`, `region_id → true`), `tax_region.provider_id = tp_system`, and the Store API response.
