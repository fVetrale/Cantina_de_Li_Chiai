# 016. Customer Account Authentication & Storefront Integration

## Context
The e-commerce platform required clarification on whether customers can create and manage their own user accounts in the backend, and if so, how to integrate the "Accedi / Registrati" (Sign In / Register) access point into the Storefront navigation and user experience.

Medusa v2 provides a dedicated Customer Module and Store Auth API (`/auth/customer/emailpass`), enabling customers to register identities, authenticate securely, manage shipping addresses, and review previous order history. The storefront needed a seamless, luxury entry point in the floating navigation bar and a dedicated `/account` authentication interface complying with security guidelines.

## Alternatives
1. **Third-party Auth Provider (Auth0 / NextAuth / Supabase Auth)**:
   - *Pros*: Out-of-the-box social login and hosted UI.
   - *Cons*: Introduces external subscription costs, latency, separate session handling, and complicates synchronization with Medusa v2 customer records, carts, and order ownership.
2. **Guest-only Checkout without Storefront Accounts**:
   - *Pros*: Simpler initial storefront development.
   - *Cons*: Poor user retention, no historical bottle allocation tracking, no saved addresses, and sub-optimal customer experience for fine wine collectors.
3. **Medusa v2 Native Customer Module & Store API (`/auth/customer/emailpass`)**:
   - *Pros*: Single source of truth in PostgreSQL. Seamless correlation between customer IDs, saved addresses, carts, and orders. Zero external dependency fees. Completely compliant with project backend rules.

## Decision
We decided to adopt **Medusa v2 Native Customer Authentication** with a dedicated Storefront interface:
1. **Navbar Integration**:
   - Added `dict.nav.account` ("Accedi / Registrati") to the desktop Right Action Island with a luxury `User` icon and tooltip, and to the mobile slide-down menu with an explicit navigation row.
2. **Dedicated `/account` Route**:
   - Created a luxury Server Component at `apps/storefront/app/account/page.tsx` with dynamic category loading, metadata, and age verification modal integration.
3. **Interactive `AccountAuthCard` Client Component**:
   - Implemented tabbed access ("Accedi" and "Crea Account") with brand styling (`#20080e`, gold `#e4b258`, ivory `#fdfbf7`).
   - Validated boundary inputs with **Zod** (`signInSchema` and `registerSchema`), enforcing valid email formatting, 8+ character passwords, and mandatory legal age verification (18+).
   - Designed for direct handshake with Medusa v2 `/auth/customer/emailpass` and customer profile endpoints.
4. **Customer Benefits Card**:
   - Highlighted value propositions for collectors: tracked climate-safe shipping, priority access to limited numbered vintages, and fast address pre-filling.

## Consequences
- **Positive**:
  - Customers can easily register or sign in directly from any page in the storefront.
  - Zero hardcoded strings: fully translated in Italian (`it`) and English (`en`) via `i18n.ts`.
  - Type-safe input boundary checks with Zod, preventing invalid form submissions and protecting downstream APIs.
  - Zero hydration or TypeScript errors; fully verified through `pnpm build` and `pnpm lint`.
- **Trade-offs**:
  - Full end-to-end token persistence (e.g., httpOnly cookie session vs bearer token exchange in customer cart checkout) will be finalized as checkout and cart completion workflows are wired with live payment sessions.
