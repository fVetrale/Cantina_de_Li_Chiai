# 017. In-Place Account Dropdown & Registration Modal Architecture

## Context
Following the initial introduction of customer authentication, user feedback requested avoiding navigation away from the current page (`"Senza andare in una nuova pagina"`). The desired user experience replicates high-conversion wine retail platforms (specifically Signorvino), where interacting with the Navbar's "Accedi/Registrati" reveals:
1. An **in-place dropdown menu** listing direct access to Sign In / Register, Cantina Club, Profile, Orders & Returns, Saved Addresses, Payment Cards, and Wishlist.
2. An **interactive popup modal dialog** for Login and Registration that opens directly over the current browsing context (Home, Catalog, or PDP) without triggering full page reloads or routing away from the customer's shopping cart.

## Alternatives
1. **Dedicated Page Route Only (`/account`)**:
   - *Pros*: Simple standard App Router page.
   - *Cons*: Forces context-switching away from the bottle PDP or cart; interrupts the shopping session and increases abandonment.
2. **Next.js Parallel / Intercepting Routes (`@modal/(.)account`)**:
   - *Pros*: Preserves URL bar `/account` state while showing a modal.
   - *Cons*: High configuration overhead across disparate static/ISR routes, potential hydration quirks with deep nested routes, and more brittle with client-side modal state toggles.
3. **In-Navbar Dropdown with React Portal Modal (`AuthModal`)**:
   - *Pros*: Instantaneous interaction with zero network lag or route transitions. Available everywhere in the store since `Navbar` is universally mounted. Uses standard React `createPortal(..., document.body)` with scroll locking, backdrop click dismissal, and escape key listener. Completely seamless on both desktop and mobile.

## Decision
We implemented the **In-Navbar Dropdown with In-Place React Portal Modal**:
1. **Desktop Dropdown Menu**:
   - Added hover/click trigger on the Navbar's Right Action Island.
   - Positioned an elegant white card dropdown (`w-72 shadow-2xl rounded-2xl border border-ivory-200`) containing:
     - `Accedi/Registrazione >` (action trigger for the modal dialog)
     - `Cantina Club` (with "Scopri di più" subtitle)
     - Quick links: `Profilo`, `I miei ordini e resi`, `I miei indirizzi`, `Le mie carte`, `I miei preferiti`.
2. **Interactive `AuthModal` Component**:
   - Positioned in `apps/storefront/components/AuthModal.tsx`.
   - Rendered directly into `document.body` via React portal (`z-[9999]`), guaranteeing it is never trapped by CSS stacking contexts.
   - Replicates the Signorvino visual structure:
     - Clean minimalist luxury underline inputs for `*Email` and `*Password`.
     - Toggle switch for `Rimani connesso ⓘ`.
     - Primary solid burgundy pill button (`bg-[#72182b]`).
     - Social login integration placeholder (Google).
     - Divider with `"Sei un nuovo utente?"` / `"Hai già un account?"`.
     - Secondary outlined burgundy pill button switching instantaneously between **Login** and **Registrazione** modes.
   - Enforces legal age verification (18+) during customer registration.
   - Boundary validation handled with **Zod** (`loginSchema` and `registerSchema`).
3. **Mobile Drawer Integration**:
   - Clicking `"Accedi / Registrati"` in the mobile hamburger drawer immediately opens the exact same `AuthModal` dialog.
4. **i18n Localization**:
   - Added `accountModal` dictionary in both Italian (`it`) and English (`en`) in `apps/storefront/lib/i18n.ts`.

## Consequences
- **Positive**:
  - Customers never lose their place while browsing wines or configuring quantities.
  - Zero hydration issues or ESLint warnings (`react-hooks/set-state-in-effect` avoided by conditionally mounting on `authModalOpen`).
  - Polished retail user experience matching the Signorvino reference.
- **Trade-offs**:
  - The fallback page route `/account` remains intact as a secondary direct URL bookmark if needed, ensuring backward compatibility.
