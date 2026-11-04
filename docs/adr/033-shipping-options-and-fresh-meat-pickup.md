# 033. Shipping Options: Italy Delivery, Cellar Pickup, Fresh Meat Pickup-Only

- **Status:** Accepted (2026-11-04). The values are **PROVISIONAL**: to be confirmed with the client.
- **Related:** ADR 027 (IVA-inclusive prices), ADR 029 (Italy-only sales), ADR 034 (inventory)

## Context
Medusa cannot complete an order without a shipping method, and the backend had none:
- no fulfillment set or service zone;
- no shipping option;
- no link between the cellar stock location and a fulfillment provider.

So the cart and checkout (next tasks) could not be built or tested end to end.

The business inputs are not final yet:
- The site already advertises "Spedizione gratuita da €90" and pickup at the cellar (Contrada Pozzo, Mon–Fri 11–13 and 15–18).
- The rate below €90 is unknown.
- Fresh meat (wild boar cuts, fresh sausages) needs a cold chain. Shipping it would need refrigerated couriers and packaging that the shop does not have.

The user chose to go ahead with provisional values and confirm them with the client later.

## Alternatives
1. **Wait for the client's final rates.** Rejected: it blocks the cart and checkout. The values are constants and easy to change.
2. **One shipping profile for everything, and hide delivery for meat in the storefront.** Rejected: that rule would live only in the UI. Medusa would still accept a courier shipment of fresh meat through the API.
3. **Calculated rates from a carrier API.** Rejected for now: there is no carrier contract yet. The flat rates can be replaced later.
4. **Flat rates with a free-shipping threshold, pickup at the cellar, and a separate shipping profile so fresh meat is pickup-only.** (Chosen)

## Decision
Implemented in `apps/backend/src/scripts/seed.ts`. Every step is idempotent: it creates what is missing and never duplicates.

- **Provider:** `manual_manual`, Medusa's built-in manual fulfillment. It is linked to the stock location "Magazzino Cantina de Li Chiai".
- **Fulfillment sets** (both linked to the cellar, with a service zone covering country `it`):
  - "Spedizioni Italia", type `shipping`, zone "Italia";
  - "Ritiro in cantina", type `pickup`, zone "Cantina di Abatemarco".
- **Shipping profiles:**
  - "Default Shipping Profile": wines, cured meats, oil.
  - **"Carne fresca (solo ritiro)"** (type `fresh_meat`, new): `misto-cinghiale`, `salsicce-fresche-di-cinghiale`, `bistecche-di-cinghiale`. New databases create them on this profile, and existing databases move them there.
- **Shipping options.** All are flat, EUR, **IVA included** (ADR 027), with `enabled_in_store = true` and `is_return = false`:

| Option | Profile | Zone | Price |
|---|---|---|---|
| Spedizione standard | default | Italia | **€9.90**, and **€0 when the cart `item_total` ≥ €90** (price rule `item_total gte 90`) |
| Ritiro in cantina | default | Cantina di Abatemarco | €0 |
| Ritiro in cantina (carne fresca) | fresh meat | Cantina di Abatemarco | €0 |

- **Provisional constants** at the top of the seed: `STANDARD_SHIPPING_EUR = 9.9` and `FREE_SHIPPING_FROM_EUR = 90`. To change them on an existing database, use the admin (Settings → Locations & Shipping). The seed creates missing options but does not update existing ones.

## Consequences
- **Positive:**
  - Carts can now get shipping methods, so checkout can be built.
  - **Medusa itself enforces** that fresh meat is never shipped by courier. A cart with meat and only "Spedizione standard" fails at completion with *"The cart items require shipping profiles that are not satisfied by the current shipping methods"*.
  - The free-shipping threshold is calculated by Medusa from the cart total, with no storefront logic.
- **For the storefront (checkout task):**
  - `GET /store/shipping-options?cart_id=` returns options for **every** profile that is served by the location, including "Ritiro in cantina (carne fresca)" when the cart has no meat.
  - The checkout must **group options by `shipping_profile_id`**, show only the groups present among the cart items, and require one method per group. For a mixed cart: a courier or pickup for wine, plus pickup for the meat.
  - It should also explain that fresh meat is pickup-only.
- **Trade-offs:**
  - Flat rates ignore weight and number of bottles. A heavy order (e.g. 18 bottles) costs the same to ship as a light one.
  - A mixed cart produces one order with two shipping methods.
- **Verified (2026-11-04)** on the dev DB through the Store API (backend on port 9100):
  - The seed ran twice. The second run changed nothing.
  - 2× Chiai Rosso (€18) → standard €9.90. 10× (€90) → standard €0.
  - Wine + meat with courier only → completion refused (400). Courier + meat pickup → order created.
  - **Leftover test data in the dev DB:** order #1 (`test-seed@example.com`), with 2 Chiai Rosso and 1 bistecche reserved. Cancel it from the admin if needed.
- **To confirm with the client:**
  - the rate below €90, and whether it depends on weight or bottles;
  - the free-shipping threshold;
  - pickup hours;
  - whether fresh meat could ever be delivered locally;
  - courier and packaging for wine.
