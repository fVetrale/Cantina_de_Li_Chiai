# 038. Age Verification at Checkout (Self-Declaration, Privacy-First, Extensible)

- **Status:** Accepted (2026-11-05). **The legal scope must be confirmed before production** (see Consequences).
- **Related:** ADR 031 (no mock auth), ADR 037 (checkout), ADR 039 (order placement)
- **Protected zone:** `apps/backend/src/modules/age-verification/` was written by the agent with the user's explicit, one-time authorization (2026-11-05).

## Context
The shop sells wine and other alcohol. Before this ADR, the only "age gate" was `AgeGateModal`, a UX popup that stores a flag in `sessionStorage`, with no server enforcement.

Legal landscape, researched on 2026-11-05. This is not legal advice:
- **L. 125/2001** (Italian alcohol law): it is forbidden to sell alcohol to people under 18, and the seller must ask for an ID document unless the buyer is clearly an adult. Online shops usually combine a **checkout self-declaration** with an **ID check on delivery or at pickup**.
- **AGCOM resolution 96/25/CONS** (from the "Decreto Caivano", L. 159/2023, in force from 12 Nov 2025) requires **certified third-party age verification with "double anonymity"**. AGCOM ties it to pornographic content, while some secondary sources extend it to gambling, **alcohol** and tobacco sites. Whether it applies to this e-commerce **is unclear**.
- **EU age verification app** (technically ready April 2026; Member States are asked to deploy it by the end of 2026) and the Italian **IT-Wallet** can prove age with privacy. They are not integrated yet.

The user's requirements (2026-11-05):
- nothing that compromises security or the **customer's privacy**;
- the age check is done now (task 3b), including the protected backend module.

Medusa facts, verified in 2.22.2:
- `completeCartWorkflow` exposes a **`validate` hook** that receives the cart, including `metadata`.
- Cart `metadata` is **copied to the order**.
- The `orderCreated` hook is internal (`@ignore`), so the order cannot be scrubbed after creation.
- `GET /store/orders/:id` is **public** for anyone who knows the id. In our tests the order `metadata` was not returned by that endpoint, but we do not rely on that.

## Alternatives
1. **Keep only the popup.** Rejected: there is no enforcement, and direct API calls bypass it.
2. **Store the date of birth in the cart/order metadata and have the backend recompute the age.** Rejected on privacy grounds: the date of birth would stay in every order forever, possibly readable by order id. It would add no real security, because a self-declared date can be faked exactly like a yes/no declaration.
3. **Integrate a certified provider now** (AGCOM double anonymity, EU app, IT-Wallet). Rejected for now: the legal scope is unclear, and it needs an external contract and integration. The design keeps a slot for it.
4. **Date of birth checked on the storefront server and discarded, plus a declaration without personal data enforced by a backend hook, with an extensible "method" field.** (Chosen)

## Decision

### Storefront
In the checkout step 3 (`CheckoutPlaceOrderForm`):
- **Inputs:**
  - **date of birth** (`type="date"`, `max` = today − 18 years, `autocomplete="off"` so the browser does not keep it);
  - the checkbox *"Dichiaro di avere almeno 18 anni…"*;
  - acceptance of the terms of sale and the privacy notice.
- **Checks:**
  - `lib/age.ts` → `checkAge()` computes completed years from the **calendar date in Europe/Rome**. Someone born on **29 February** turns 18 on **1 March** in common years (the conservative choice). It rejects impossible, future or implausible (> 120 years) dates.
  - The browser check is only for instant feedback. The **authoritative check runs in the `placeOrder` Server Action**: under-18 or an invalid date is refused **before any call to Medusa**.
- **Privacy:** the date of birth is **never sent to Medusa, stored, returned, logged, or rendered** in the page.

### Medusa
Medusa only receives (through `POST /store/carts/:id` metadata) a **declaration without personal data**:
```json
{ "age_verification": { "method": "self_declaration", "declared_adult": true, "minimum_age": 18, "declared_at": "<ISO>" } }
```

### Backend (protected module)
- **`src/modules/age-verification/index.ts`:** `validateAgeDeclaration(metadata, now)`, a pure function. It requires:
  - a `method` in `SUPPORTED_METHODS` (`["self_declaration"]`);
  - `declared_adult === true` and `minimum_age === 18`;
  - a valid ISO `declared_at` that is **at most 24 h old**, with 5 min tolerance for clock skew.
- **`src/workflows/hooks/validate-age-on-cart-complete.ts`:** `completeCartWorkflow.hooks.validate`. It throws `MedusaError NOT_ALLOWED` ("Age verification required…") when the check fails, so **no order can be created without a valid declaration, even through direct Store API calls**. Nothing personal is logged.
- **Proof:** the declaration (method, flag, minimum age, timestamp) stays in the order metadata as proof of the check, and it contains no personal data.

### Extensibility
A certified method (e.g. `"eu_age_app"` or `"agcom_double_anonymity"`) is added to `SUPPORTED_METHODS` with its own verification of a provider token or attestation. The checkout then gets a "verify with…" button. The stored record still holds no identity data, in line with double anonymity.

### Physical ID check
The checkout and the confirmation page tell the buyer that an ID document may be requested **at pickup or on delivery**, which applies L. 125/2001 in practice.

## Consequences
- **Positive:**
  - Server-enforced age gate.
  - The date of birth is never persisted (data minimisation, GDPR art. 5(1)(c)).
  - There is an auditable declaration on each order.
  - Ready to plug in a certified method.
- **Limits:**
  - A self-declaration is not identity verification. A determined minor can lie, as on most wine e-shops. The physical ID check at delivery or pickup remains essential (courier service with ID check, staff at pickup).
- **⚠️ Before production:**
  - Ask the client and **a lawyer whether AGCOM 96/25/CONS (double-anonymity verification) applies to this alcohol e-commerce**. If it does, add a certified method (provider, EU app or IT-Wallet) before going live.
  - Also confirm which courier service performs ID checks.
  - Both are tracked in `TODO.md` → "Prima della produzione".
- **Operational:** a declaration expires after 24 h. A buyer who leaves checkout for a day must confirm again, which the storefront does automatically at "Conferma ordine".
- **Verified (2026-11-05):**
  - **Backend:** 24 unit tests.
  - **Live, with direct Store API calls** (bypassing the storefront):
    - no declaration → 400; `declared_adult: false` → 400; a 2-day-old declaration → 400; a valid one → order created;
    - the DB order metadata holds only the 4 declaration fields.
  - **Storefront:** 13 `checkAge` tests (birthday in Rome vs UTC, 29 Feb, invalid / future / implausible dates) and the `placeOrder` tests:
    - the date of birth never appears in any request;
    - under-18 → no Medusa call.
  - **Live in Chrome:** a 17-year-old was refused on screen; an adult placed order #3; the confirmation page HTML does not contain the date of birth; no cart in the DB contains a birth date.
- **Security notes:**
  - Enforcement is in the backend hook, not only in the UI.
  - Inputs are Zod-validated, and the declaration format is strict (unknown methods are rejected).
  - No PII in metadata, logs, cookies or client storage.
