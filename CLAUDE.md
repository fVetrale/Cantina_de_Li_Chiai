# CLAUDE.md — Cantina de Li Chiai

E-commerce for a small winery and salumeria in Abatemarco (SA), in Cilento, Italy.
It sells wine, cured meats, fresh meat and olive oil. Prices are in EUR and the
market is Italy/EU.

@AGENT.md

The rules in `AGENT.md` and `.agent/rules/*.md` are binding. The short version:
- Reply in **Italian**. Write code, comments and commits in **English**.
- Do one small task at a time. Post a plan first, and wait for an OK if more than 3 files change.
- Don't refactor outside the task. Don't add a dependency without asking first.
- Git flow: `main` ← `develop` ← `feature/<name>`. Never commit to `main`/`develop`. Never force-push. Use Conventional Commits.
- **Protected zones (read-only, propose diffs in chat):**
  `apps/backend/src/modules/{age-verification,payment-webhooks,auth,shipping-rules}/`,
  `.env*`, `infra/secrets/`, `.github/workflows/`.
- Every significant decision gets a new ADR in `docs/adr/NNN-title.md`
  (Context / Alternatives / Decision / Consequences). ADRs are immutable. Supersede an old one, don't edit it.
- Security: use Zod at every boundary, add ownership checks + a 403/404 test for user/order data, keep tokens out of
  localStorage, don't use `dangerouslySetInnerHTML`, don't write your own auth/crypto, and use Stripe test keys only.
  End security-relevant work with "Security notes".

## Monorepo layout (pnpm 9 workspaces, Node ≥ 20)

```
apps/backend      @winery/backend     Medusa v2 (TS), Postgres + Redis
apps/storefront   @winery/storefront  Next.js 16.4 App Router, React 19.3, Tailwind v4
packages/shared   (empty: only .gitkeep; path alias @winery/shared/* exists in backend tsconfig)
infra/            docker-compose.yml: postgres:16 + redis:7 bound to 127.0.0.1
docs/adr/         001–023 ADRs (tooling, setup, catalog, UI, auth UI, media, footer…)
.agent/rules/     backend.md, storefront.md, security.md, documentation.md
TODO.md           roadmap (phases 1–5) in Italian
```

Root scripts run recursively: `pnpm dev | build | lint | typecheck | test`.
Local infra: `docker compose -f infra/docker-compose.yml up -d` (DB `winery_dev`, user/pass `postgres`).
The root `.env` holds the variables (see `.env.example`). Never read or print real values.

## Backend — `apps/backend`

- `medusa-config.ts`: DB, Redis, CORS (store/admin/auth), JWT/cookie secrets, and Redis
  event-bus + cache modules. **No payment provider is configured yet** (Stripe is still to do).
- `src/scripts/seed.ts` (`pnpm --filter @winery/backend seed`): it renames the store, creates the region "Italy"
  (EUR, `pp_system_default` only), 22% IVA tax region, stock location, publishable API key,
  categories and ~14 products (wines, salumi, fresh meat, oil). Prices are in **major units** (e.g. `9.0` = €9).
  The handles are things like `chiai-rosso`, `rosso-vecchio`, `chiai-bianco`, `bianco-dolce`, `soppressata-di-cinghiale`…
- There are no custom modules, API routes, workflows, subscribers or tests yet. `src/` only holds `scripts/`.
- Customer accounts, carts, orders, addresses and checkout are meant to use **Medusa's built-in
  modules** through the Store API (`/store/customers`, `/store/carts`, `/store/orders`, `/auth/customer/emailpass`).
- Rules: business logic lives in modules/workflows. Route handlers only parse → call → return. Slow work goes in
  jobs/subscribers. Migrations must be reversible and reviewed by the user before running. A new endpoint means
  a schema + auth check + test, all in the same task.

### tsconfig (ADR 025)
- `module`/`moduleResolution`: **`Node16`** (as in the Medusa starter). `medusa build` emits CommonJS into `dist/` (`outDir`).
- No `baseUrl`/`paths`: they're deprecated in TS 6 and removed in TS 7. When `packages/shared` gets code, consume it as
  `"@winery/shared": "workspace:*"`, not as a path alias.
- `types: ["node", "jest"]`. `include`: `src`, `integration-tests`, `medusa-config.ts`, so test files are type-checked.
- Type checking passes on TS 5.9 (pinned), 6 and 7.

### Lint & tests (ADR 024)
- All `@medusajs/*` packages are pinned to **2.22.2** (backend + storefront `js-sdk`). Keep them aligned:
  `@medusajs/test-utils` requires the exact same version.
- Lint: ESLint 9 flat config in `apps/backend/eslint.config.mjs` (typescript-eslint recommended; `.js` = CommonJS).
- Jest 29 + `@swc/jest`, with `jest.config.js` from the Medusa starter. `TEST_TYPE` selects the suite:
  - `pnpm test` → `test:unit`: `src/**/__tests__/**/*.unit.spec.ts`. No infra needed. Part of the Definition of Done.
  - `pnpm --filter @winery/backend test:integration:http`: `integration-tests/http/*.spec.ts` via
    `medusaIntegrationTestRunner`. It creates and drops a temporary Postgres DB. It needs `infra/` up and
    `DB_HOST`/`DB_USERNAME`/`DB_PASSWORD` (from `apps/backend/.env.test`, human-managed, or inline env vars).
    `jest.config.js` forces `PORT=""` so tests never clash with a running `medusa develop`.
  - The Knex "Connection ended unexpectedly" logs at teardown are harmless noise.
- Run the HTTP integration tests before merging any backend endpoint work (the IDOR 403/404 tests live there).
- `pnpm audit` has known high advisories that are transitive deps of the Medusa core (lodash, @graphql-tools/utils).
  The `pnpm.overrides` decision is still pending.

## Storefront — `apps/storefront`

**Next.js 16 has breaking changes.** Read `apps/storefront/AGENTS.md` and the docs in
`node_modules/next/dist/docs/` before writing Next-specific code. `next-env.d.ts` is
regenerated by `next dev`/typecheck, so ignore its diffs.

Structure (no `src/`, alias `@/` = app root):
```
app/
  layout.tsx               fonts (Cormorant Garamond serif / Plus Jakarta Sans), metadata, globals.css
  page.tsx                 home (Hero, Ticker, Features, Story, MeetUs, Catalog, Gallery, Newsletter…)
  vini/page.tsx            full catalog with filters (?categoria=, ?lang=)
  prodotti/[handle]/page.tsx  PDP (gallery, purchase section, tabs, related)
  la-cantina/page.tsx      estate history page
  account/page.tsx         fallback login/register page (AccountAuthCard)
  legal/page.tsx, not-found.tsx
components/                ~25 components, mostly "use client" (Navbar, AuthModal, WineCard…)
lib/i18n.ts                dictionaries { it, en }, getDictionary(locale), default "it"
lib/data/products.ts       Medusa data layer + hardcoded fallback catalog
public/images/             real cellar/product photos
```

### Key patterns
- **i18n**: no routing segment. The locale comes from the `?lang=en` search param (default `it`). Every page
  builds `dict = getDictionary(locale)` and passes `dict`/`currentLocale` down as props. All user-facing text
  must live in `lib/i18n.ts` (both `it` and `en`).
- **Data**: `lib/data/products.ts` uses plain `fetch` against `NEXT_PUBLIC_MEDUSA_BACKEND_URL` with the
  `x-publishable-api-key` header and ISR (`next: { revalidate: 60 }` for products, 300 for categories).
  `getProducts`, `getProductByHandle`, `getRelatedProducts` and `getCategories` all **fall back to the
  hardcoded `FALLBACK_PRODUCTS` / `DEFAULT_CATEGORIES`** when the backend is down, and merge the
  missing fallback items into the backend results. They also enrich Medusa products with local metadata
  (`getWineMetadata(handle)`: tasting notes, terroir, badges, images).
  - Caveat: the price parsing uses `rawPrice > 100 ? rawPrice / 100 : rawPrice` (a cents heuristic). Medusa v2
    stores major units, so any product over €100 would display wrong.
  - Prices are read from `variants[0].prices[0]`, not from `calculated_price` with a region. Region-aware pricing is
    needed before checkout.
- `@medusajs/js-sdk` is installed but **not used yet**. It's the intended client for cart/auth/checkout.
- `zod` v4 validates the auth forms. `lucide-react` provides icons.
- Styling: Tailwind v4 with custom tokens (`ivory`, `cellar`, `wine`, `gold`, `olive`, `terracotta`) defined in
  `app/globals.css`. Font CSS vars are `--font-serif` / `--font-sans`.
- Age gate: `AgeGateModal` stores `cantina_age_verified` in sessionStorage. It's UX only. Real age
  verification belongs to the protected backend module.

### What is UI-only / mocked today
- **Cart**: `ProductPurchaseSection.handleAddToCart` only flips an "added!" state. `Navbar` takes
  `cartCount`/`cartTotal` props, but no page passes them (they're always 0). There's no cart state, Medusa cart,
  or cart page/drawer.
- **Auth**: `AuthModal` and `AccountAuthCard` validate with Zod, then `await setTimeout(...)` (fake).
  They make no `/auth/customer/emailpass` calls and create no session. The Navbar account dropdown shows
  links (profile, orders, addresses, cards, wishlist), but those pages don't exist.
- **Checkout / orders / customer area**: not started. Stripe isn't configured on either side.
- Newsletter: UI only.

## Work log
Dated session history, decisions and open questions live in **`MEMORY.md`** (newest first). Read it at the
start of a session, and append a new entry at the end of each session.

Last session: **2026-11-03, about 21:00–21:57 CET**. Backend tooling (ADR 024), `.env.test`, and the tsconfig
Node16 alignment (ADR 025) were done and merged into `develop` (PR #9). The next task is point 2, the
storefront data layer: region prices, `variantId`, and a "catalogo non disponibile" page when the backend is down.

## Roadmap (from TODO.md), what's left
1. Backend: Stripe (`@medusajs/payment-stripe`), age-verification and shipping-rules modules
   (protected zones, human-written), plus ADRs.
2. Storefront: cart (Medusa cart via js-sdk, cart id in a cookie), customer auth (Medusa
   emailpass, session/JWT in an httpOnly cookie via server actions, never localStorage),
   reserved area (profile, addresses, order history with ownership checks), checkout
   (addresses → shipping → Stripe Elements → order confirmation).
3. Production: deploy scripts, hosting (e.g. Aruba VPS + Docker), TLS / reverse proxy, load tests.
