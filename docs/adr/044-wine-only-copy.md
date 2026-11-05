# 044. Wine-Only Copy: Texts, Pickup Tasting, Pairings and SEO

- **Status:** Accepted (2026-11-05).
- **Related:** ADR 043 (wine-only catalog, branch 1 of 3), ADR 029 (Italy-only sales)

## Context
After ADR 043 the shop sells only wine, but about 65 texts (Italian and English) still presented a "Cantina & Salumeria". They spoke of cured meats, fresh wild boar meat and olive oil, and promised a "tagliere degustativo" (a board of cured meats) to whoever picked up at the cellar. The wine pairings cited "la soppressata della nostra salumeria". The site SEO description named wines the shop does not sell ("Fiano del Cilento DOC, Aglianico Riserva").

The user's decisions (2026-11-05):
1. **Pickup gift:** the tasting board becomes **a small tasting of our wines, offered at pickup**.
2. **Contact email:** it stays `cantina.salumeria.chiai@gmail.com`, the real address, until the client creates a new one.
3. **Story:** it is about **vineyard and wine only**. No mention of cured meats or olive groves, and no "we stopped".
4. **Wine pairings:** **no cured meats and no meat**.

## Alternatives
- **Generic pairings that keep salumi and wild boar** without "nostra salumeria". Rejected by the user (decision 4).
- **Removing the pickup gift entirely.** Rejected: the user kept a wine tasting.
- **Rewriting the copy in a single pass, without the user's decisions.** Rejected: identity, story and promises to customers are the client's call.

## Decision
- **`lib/i18n.ts` (it/en):**
  - **Identity:** "Cantina ad Abatemarco" / "Winery in Abatemarco". The hero title becomes "I Vini di Famiglia del Cilento, dalla Terra di 'Li Chiai'".
  - **Catalog, menu and SEO** speak of **wines**: "I Nostri Vini", "Tutti i Vini", "vini disponibili". Search examples use the real wine names.
  - **Story, values and La Cantina page:** vineyard, winemaking and the family; "il vino che Antonio fa da sempre".
  - **Pickup:** every "tagliere omaggio" becomes the wine tasting offered at pickup. That covers 8 IT texts plus the EN ones (hero, values, banner, meet-us card, story badge, product page, catalog, footer, terms of sale).
  - **PDP labels:** "Stagionatura / Affinamento" becomes "Affinamento", "Materia Prima" becomes "Vitigno", and "Scheda Prodotto" (tab) becomes "Scheda Tecnica". The related section is "Dalla Nostra Cantina / Altri vini di Antonio e Matteo".
  - **Misleading shipping claims, fixed while rewriting the same sentences:**
    - "imballi **isotermici**" (a fresh-meat need) becomes "imballi anti-rottura";
    - "in tutta Italia **ed Europa**" / "across Europe" becomes "in tutta Italia" / "across Italy" (ADR 029).
  - **Removed unused keys** that held meat/oil text: `secondaryNav`, `catalog.filterRiserva`, `winesPage.filterReserves`, `footer.locationTitle`.
  - Generic words in cart and checkout ("prodotti", "Totale prodotti") are unchanged: they are neutral.
- **`lib/data/products.ts`:** new wine pairings without cured meats or meat:
  - **Chiai Rosso:** pasta e fagioli, wood-oven pizza, medium-aged Cilento cheeses, family dinners.
  - **Rosso Vecchio:** caciocavallo podolico, fusilli with porcini, lagane e ceci, parmigiana.
  - **Chiai Bianco and Bianco Dolce** (shared details): fresh goat cheese replaces the "tagliere della cantina".
- **`app/layout.tsx`:** the SEO description and keywords name the four real wines. The DOC appellations are gone.

## Consequences
- **Positive:** the site describes what it sells, the pickup promise is one the cellar can keep, and the SEO no longer advertises wines that are not sold.
- **Trade-offs / to do:**
  - The email still contains "salumeria": it is a question for the client.
  - The social mosaic shows template hashtags (`#FianoDelCilento`, `#AglianicoRiserva`). They are wine-related and left for the UI audit.
  - The La Cantina page says products "do not travel" with pickup while the site also ships. That is older copy, left for the UI audit.
  - The non-wine images are still in `public/images` (branch 3).
- **Verified (2026-11-05):**
  - **Word scan:** no salumi, carne, cinghiale, olio, tagliere, isotermici or Europe left in `app`, `components` or `lib` code. The only remaining matches are "ClipboardList" and "KeyboardEvent", which contain "board".
  - **DoD:** `pnpm lint`, `pnpm typecheck` and `pnpm test` pass (169 storefront, 24 backend).
  - **Live, server-rendered text** of home, `/vini`, `/la-cantina`, `/legal`, the three wine pages, `/account` and `/carrello`, in **it and en**: all return 200. The only hits are the contact email, and "Fiano" as the grape of Chiai Bianco and in a social hashtag.
- **Security notes:** text-only change. There is no new input, endpoint or data flow.
