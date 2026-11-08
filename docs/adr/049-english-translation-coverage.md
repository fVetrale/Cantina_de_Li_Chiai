# 049. Full English Coverage of the Storefront

- **Status:** Accepted (2026-11-08).
- **Related:** the i18n pattern in CLAUDE.md (`?lang=en`, `lib/i18n.ts`), ADR 043/044 (wine-only copy), ADR 045–048 (restyling).

## Context
The user noticed that the English version (`?lang=en`) was not fully translated. An audit found Italian text from several sources:
1. **Strings written directly in components:**
   - PDP labels and the quantity popover;
   - accordion headings, the terroir paragraph and fallbacks;
   - "Disponibile in Cantina" and the delivery sentence;
   - "IVA inc.";
   - screen-reader labels ("Apri menu", "Cerca nel catalogo vini", "Cambia lingua", "Chiudi finestra"…);
   - image `alt` texts;
   - "Eccellenza & Garanzia";
   - the delivery note.
2. **Medusa data, Italian only:** category names, wine descriptions, variant titles ("Bottiglia 0,75 l"), and shipping option names and descriptions.
3. **Local wine metadata, Italian only:** tasting notes, terroir, technical data, pairings, appellation, badge, format, grapes.
4. **EN dictionary entries that were never translated:** the 13 La Cantina gallery titles.
5. **Metadata and the document:**
   - the home page title came from the static layout metadata;
   - "Vino non trovato";
   - `<html lang="it">` was fixed;
   - the 404 page was always Italian.

The user asked to fix it, to **keep prices in Italian format** ("€ 9,00") in both languages, and to make sure the change does **not weigh down** the production build.

## Alternatives
1. **Translate the content in Medusa** (a translation module or metadata per locale). Rejected for now: no built-in translation in Medusa 2.22, and it would need admin work and new data-layer queries.
2. **Ship the English wine copy in the dictionary.** Rejected: the dictionary often reaches client components, so long wine texts would land in browser payloads on every page.
3. **Server-side localization helpers plus dictionary keys for UI text.** (Chosen)
4. **For the 404 header/footer, a Next 16 `proxy.ts` that passes the locale as a request header.** Rejected: it would run on every request just to translate the header of an error page.

## Decision
- **UI text moves to `lib/i18n.ts`** (it/en):
  - `common`: menu, search, language, close and home labels; park name; VAT labels; email placeholder; `categoryNames` by handle;
  - `pdp`: field labels, quantity popover, delivery sentence, "available at the cellar", accordion headings and the terroir text, `fallbacks`, the 404 meta title and label;
  - new sections:
    - `shipping` (`names`, `descriptions` by option type code; kept out of `common` so they do not travel with the header on every page);
    - `meta` (home title and description);
    - `a11y` (section labels, delivery note);
    - `images` (`alt` texts).
  - The EN gallery titles are translated.
- **Wine copy (`lib/data/wine-copy.ts`, server-side only):**
  - `localizeWine(product, locale)` overrides description, badge, appellation, format, category and details with English text for the 4 wines;
  - `localizeCategoryName` and `localizeVariantTitle` handle category names and variant titles ("Bottiglia 0,75 l" → "0.75 l bottle");
  - **these English translations were written by the developer and must be reviewed by the client;**
  - pages call the helpers before passing products to components: PDP (and its metadata), `/vini`, wishlist, cart, order confirmation and order detail;
  - Italian is returned unchanged, and unknown products or categories fall back to Medusa's text.
- **Shipping labels (`lib/shipping-labels.ts`, pure):** translate by Medusa option type code (`standard`, `pickup`), or by the stored Italian name on past orders; unknown options keep Medusa's text.
- **Navbar:** category names via `dict.common.categoryNames[handle]`, falling back to the Medusa name.
- **Metadata and document:**
  - the home page gets `generateMetadata` with the dictionary;
  - `components/HtmlLang.tsx` (client, inside a Suspense boundary in the root layout) keeps `<html lang>` in sync with `?lang=`, because the root layout cannot read search params.
- **404:** `components/NotFoundContent.tsx` shows the body in the URL language. It receives only the 4 strings of each language, since the root not-found boundary is part of every page payload.
- **Prices:** unchanged, Italian format in both languages (user decision).
- **Tests:** `lib/data/__tests__/wine-copy.test.ts` and `lib/__tests__/shipping-labels.test.ts` (8 tests).

## Consequences
- **Positive:**
  - The English site is fully English, including screen-reader labels, image descriptions, Medusa-provided names and the wine sheets.
  - The Italian site is unchanged.
  - No new dependency, no Medusa change.
- **Trade-offs / open items:**
  - **The 404 page keeps an Italian header and footer** with `?lang=en`; only its body is translated (see alternative 4).
  - **English wine copy is maintained in code:** new wines or changed Medusa descriptions need an update in `wine-copy.ts`, until a translation module exists.
  - **Translation review:** the English texts must be reviewed by the client.
  - **`<html lang>` timing:** it is corrected on the client after hydration; the server HTML still says `it`.
- **Weight (measured on the dev server, gzip):**
  - pages grew by about **0.7–1.2 KB** each (+3–4%), mostly dictionary keys carried by client components and the tiny 404 text sets;
  - **the English wine copy is in no client JavaScript chunk:** a scan of the PDP chunks for "Barrel Aged" and "Tulip glass…" found nothing;
  - `wine-copy.ts` is imported only by server pages.
- **Verified (2026-11-08):**
  - **Server-rendered EN pages** (home, `/vini`, a category, two PDPs, La Cantina, legal, cart, checkout, account, order confirmation): no Italian left except proper names.
  - **Interactive EN check**, headless Chrome: age gate, account dropdown, login modal, PDP quantity popover and all accordion panels, cart with an item, checkout step 2 (Standard shipping / Pickup at the cellar), mobile menu, `<html lang="en">`, 404 body "Product not found".
  - **Italian page spot check:** labels, copy and title unchanged.
  - **DoD:** lint, typecheck and tests pass (177 storefront, 24 backend).
- **Security notes:** text only. The helpers are pure, and no user input reaches them except the locale, which is derived from `?lang` as before. No new data access.
