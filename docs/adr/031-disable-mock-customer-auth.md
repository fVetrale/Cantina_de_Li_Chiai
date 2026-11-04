# 031. No Simulated Customer Authentication in the Storefront

- **Status:** Accepted (2026-11-04)
- **Related:** ADR 026 (no invented catalog data), ADR 029 (Italy-only launch)

## Context
The storefront had a sign-in / registration UI in two places: the Navbar popup (`components/AuthModal.tsx`) and the `/account` page (`components/AccountAuthCard.tsx`). Both validated the form with Zod, then **simulated** the backend:

- they waited 850–1100 ms with `setTimeout`;
- they showed messages such as *"Accesso effettuato! Sessione cliente attiva."* and *"Account creato con successo! Il tuo profilo cliente Medusa v2 è ora attivo."*

No request reached Medusa, no customer was created and no session existed. The `/account` page also stated *"crittografia end-to-end con token di sessione sicuri"* and *"Connessione cifrata TLS 1.3 con token di sessione autenticati Medusa v2"*. These security claims were not true.

This causes four problems:
- **Trust:** a customer believes they have an account and then cannot find it.
- **Privacy (GDPR):** the forms invite people to type personal data (name, email, password) that is used for nothing, under claims of protection that do not exist.
- **Security hygiene:** the project rules forbid home-made auth. Simulated auth makes it easy to mistake a mock for a finished feature.
- **Consumer protection:** stating security features that are not there is misleading.

Real customer authentication (Medusa `emailpass`, session in an httpOnly cookie via server actions) is planned after the cart and checkout. Until then, guest checkout is the planned path.

## Alternatives
1. **Keep the mock until real auth exists.** Rejected for the reasons above.
2. **Remove the auth UI completely** (account icon, popup and `/account` page). It is honest, but it throws away finished design work and changes the navigation. That is more than this fix needs.
3. **Implement real auth now.** This is the right end state, but it is a larger task (server actions, cookies, the customer area, ownership tests) and it is out of order in the roadmap.
4. **Keep the design, disable the forms and say clearly that the customer area is coming.** (Chosen)

## Decision
- **Notice.** Both forms show the notice *"Area clienti in arrivo"* / *"Customer area coming soon"*, with a link to the contacts (`/#footer`). The text is in `lib/i18n.ts` under `accountModal.unavailable*` (it/en).
- **Disabled fields.** All fields and submit buttons are inside a `<fieldset disabled aria-describedby="…">`. The browser disables every control natively, and screen readers announce the reason. The tabs and the "Accedi ora" / "Registrati ora" links stay active, so the design can still be browsed.
- **No fake code.** The `setTimeout` delays, loading states and success messages are removed. If a submit somehow happens, the handlers only show the same "not available yet" notice. They never simulate success.
- **No false claims.** The "end-to-end encryption" box and the "TLS 1.3 … Medusa v2 sessions" footnote are removed from `/account`.
- **The Zod schemas stay,** so the validation rules can be reused when real auth is wired. Their hardcoded Italian messages are a known i18n gap to fix in that task.
- **The Navbar is unchanged.** All account menu entries (profile, orders, addresses…) already open this popup, so there are no links to missing pages.

## Consequences
- **Positive:**
  - The site no longer pretends to log people in or to protect data it does not store.
  - No personal data is collected for nothing.
  - Re-enabling is a small, explicit step: remove `disabled` and wire the real handlers.
- **Trade-offs:**
  - Customers cannot create accounts yet. Orders will be guest-only until the auth task.
  - The account icon and menu still advertise features (orders, addresses, wishlist) that open the "coming soon" notice.
- **Verified (2026-11-04)** with headless Chrome on `next dev`, after the age gate:
  - On `/account` (it and en) and in the Navbar popup (sign-in and register modes), every field and submit button matches `:disabled`.
  - The notice is shown, switching between modes still works, and a forced `requestSubmit()` shows no success text.
  - There are no automated component tests: the storefront Vitest setup is server-only (ADR 028), and DOM testing would need a new dependency.
- **Follow-up:** the real authentication task re-enables the forms, replaces the handlers with Medusa calls (server actions, httpOnly cookie, never localStorage), and moves the Zod messages into i18n.
