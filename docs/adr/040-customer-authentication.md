# 040. Customer Authentication (Part A of the Reserved Area)

- **Status:** Accepted (2026-11-05). **Supersedes ADR 031** for the "forms disabled" decision: the forms are live again, with real Medusa auth. ADR 031's other principles (no simulated success, no false security claims) still apply.
- **Related:** ADR 035/036 (httpOnly cookies, Server Actions), ADR 039 (orders). Details and the production checklist, in Italian: `docs/sicurezza-sessioni-e-produzione.md`.

## Context
The reserved area (profile, order history, addresses, wishlist) needs customer accounts. Medusa 2.22 has built-in customer auth:
- the `emailpass` provider: `POST /auth/customer/emailpass/register` and `POST /auth/customer/emailpass` return a JWT;
- `POST /store/customers` creates the profile with the registration token;
- `GET /store/customers/me` reads it;
- `POST /store/carts/:id/customer` links a cart.

The JWT is signed with `JWT_SECRET` and expires after **1 day** (`jwtExpiresIn` default).

Project rules: tokens never in localStorage, Zod at every boundary, no home-made auth or crypto.

The user's decisions (2026-11-05):
1. password reset postponed, with a UI notice;
2. the wishlist (part C) will be stored in customer metadata;
3. "saved cards" left as is for now;
4. keep the "Sign in with Google" button even though it does not work yet;
5. guest orders are **not** linked to a later account (documented here).

## Alternatives
1. **Token in localStorage, browser calls Medusa directly** (`@medusajs/js-sdk`). Rejected: the token would be readable by any script (XSS).
2. **Medusa server sessions** (`/auth/session`, a revocable session cookie on the backend domain). Revocable, but they need the backend and storefront on a shared cookie domain and CORS credentials. Kept as a future improvement.
3. **JWT in an httpOnly cookie on the storefront domain, forwarded by our server as `Authorization: Bearer`.** (Chosen) It is the same pattern as the cart and order cookies.

## Decision

### Data (`lib/data/customer.ts`, `lib/data/auth-session.ts`)
- **`loginWithEmailPassword`, `registerCustomer`, `retrieveCustomer`:**
  - registration = identity → customer profile (registration token) → login;
  - emails are lowercased;
  - emails and passwords go only in request bodies, **never in URLs or logs**;
  - `storeRequest` gained an optional `authToken` (an `Authorization: Bearer` header, server-side only), and returns `401` distinctly.
- **`JWT_PATTERN`:** a cookie that is not a three-part JWT is never sent (no header injection or tampering).
- **Cookie `cantina_auth`:** `httpOnly`, `secure` in production, `sameSite=lax`, `path=/`, `maxAge` 1 day (same as the JWT).
- **`getCurrentCustomer()`:** memoised per request with React `cache()`. It returns null for guests, invalid or expired tokens, or an unreachable backend. An expired token simply makes the visitor a guest again.

### Server Actions (`lib/actions/auth.ts`)
- **`login`:**
  - Zod checks the email and a password of up to 128 characters.
  - **Any refusal gives the generic `invalid_credentials`**, the same for a wrong password and an unknown email.
- **`register`:**
  - names, email, and a password of **10–128 characters**;
  - `ageConfirmed` and `privacyAccepted` must be true;
  - any refusal (e.g. an existing email) gives the generic `rejected`.
  - These prevent **account enumeration**.
- **On success:**
  - the token goes **only** into the cookie and is never returned to the browser;
  - the guest cart, if any, is linked to the customer (best effort);
  - `refresh()` is called.
- **`logout`:**
  - deletes **both** `cantina_auth` and `cantina_cart_id`. After login the cart belongs to the customer and can hold their email and address, so the next person on a shared computer must not see it;
  - then `refresh()`.
- **`addToCart`** (ADR 035): when logged in, new carts are created with the token, so Medusa links them and the order lands in the customer's history. If the token is rejected (expired), it falls back to a guest cart, so shopping never breaks.

### UI
- **Layout:** `getCurrentCustomer()` → `CustomerProvider` passes **only the first name** to client components (no email, id or token).
- **Navbar:**
  - when logged in: "Ciao, Nome", the login and club rows hidden, menu entries going to `/account`, and an "Esci" entry (desktop and mobile);
  - for guests: unchanged.
- **`AuthModal` and `AccountAuthCard`:**
  - both use the shared `components/auth/useAuthForms.ts`;
  - fields have `autocomplete` tokens (`current-password` / `new-password`…), i18n errors for each field, and `role="alert"`;
  - passwords are cleared from memory after success.
- **Removed:** the "Rimani connesso" / "Ricordami" controls (they promised a longer session that does not exist) and the hardcoded Italian Zod messages.
- **Password reset:** the "Password dimenticata?" link shows a notice ("disponibile a breve, contattaci"). Sending emails needs a notification provider.
- **Google sign-in:** visible but **disabled**, with a "Presto disponibile" badge. It never fakes a sign-in.
- **`/account`:**
  - when logged in, a welcome panel (name, email, "area riservata in arrivo", "Esci");
  - for guests, the forms.

### Guest orders (user decision 5)
Orders placed as a guest are **not** shown in the history of an account created later with the same email. Medusa links orders by `customer_id`, and claiming guest orders needs its order-transfer flow, with email verification. This is out of scope and listed in the production checklist.

## Consequences
- **Positive:**
  - Real accounts with Medusa-managed password hashing.
  - The token is never exposed to page JavaScript, URLs or logs.
  - Generic errors.
  - Carts follow the customer.
  - Logout protects shared computers.
- **Limits:** see `docs/sicurezza-sessioni-e-produzione.md`.
  - The JWT is stateless: a stolen token stays valid until it expires (at most 1 day). Logout only clears this browser.
  - **There is no rate limiting on login and registration** (Medusa has none). It must be added before production.
  - There is no email verification at registration and no password reset (both need email sending).
  - The `/account` header still says "Accedi" when logged in. Part B turns this page into the reserved area.
- **Verified (2026-11-05):**
  - **136 Vitest tests:** 20 new auth tests and 2 new cart tests. They cover:
    - the cookie flags, and the token never returned;
    - cart linking with the Bearer token;
    - the same error for a wrong password and an unknown email;
    - 3 invalid logins and 5 invalid registrations with no Medusa call;
    - email and password never in URLs; backend down;
    - the full registration request sequence with the right tokens;
    - a duplicate email → generic `rejected`;
    - logout removing both cookies;
    - `getCurrentCustomer` (guest, non-JWT cookie, valid, expired);
    - the logged-in cart with Bearer, and the expired-token fallback.
  - **Live** (Chrome + `next dev` + `medusa develop`):
    - an empty registration flags 6 fields;
    - registration → "Ciao, Luca", the cart kept (3 items), `cantina_auth` httpOnly and invisible to JS, no JWT in the HTML;
    - logout → both cookies gone, badge 0;
    - wrong password → "Email o password non validi";
    - correct login → greeting;
    - in the DB, the guest cart was transferred to the customer and a new cart was created linked to them.
- **Security notes:**
  - Zod on all inputs; httpOnly / secure / SameSite cookies; no token, password or email in logs or URLs.
  - Generic auth errors.
  - Cookie values are format-checked before use.
  - Only the first name reaches the client.
  - Production requirements (HTTPS + HSTS, CSP, rate limiting, proxy without cookie logs, strong secrets) are listed in `docs/sicurezza-sessioni-e-produzione.md`.
