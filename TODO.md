# 📝 Project Roadmap & ToDo: Cantina de Li Chiai E-commerce

## 🟢 Fase 1: Setup & Infrastruttura
- [x] Inizializzazione Monorepo pnpm (`apps/`, `packages/`, `infra/`)
- [x] Configurazione Git Flow e regole di Branching (branch `develop`, PR obbligatorie)
- [x] Stesura `AGENT.md` e regole `.agent/rules/`
- [x] Setup Backend Medusa v2 (`apps/backend`)
- [x] Setup Docker Compose per database e cache (`infra/docker-compose.yml`)
- [x] Esecuzione prime migrazioni Medusa e test connessione DB (`pnpm exec medusa db:migrate`)
- [x] Tooling backend: ESLint 9 + Jest, Definition of Done funzionante (ADR 024)
- [x] tsconfig backend allineato allo starter Medusa (Node16, niente `baseUrl`) (ADR 025)
- [x] Unit test dello storefront con Vitest (ADR 028)
- [x] CI su GitHub Actions: lint, typecheck e test su ogni PR (ADR 030)
- [x] Override delle vulnerabilità segnalate da `pnpm audit` (ADR 032) — rivedere glob/minimatch dall'11/11

## 🟡 Fase 2: Sviluppo Backend Core
- [x] Creazione utente Admin Medusa (tramite CLI)
- [x] Configurazione CORS per Admin e Storefront nei file `.env`
- [x] Seed del database con il catalogo reale (14 prodotti in 4 categorie)
- [x] Test di avvio del backend (`pnpm run dev`) e accesso API
- [x] Regione fiscale Italia con provider `tp_system` e prezzi IVA inclusa (ADR 027)
- [x] Spedizioni nel seed: "Spedizione standard" €9,90 (gratis da €90), "Ritiro in cantina", carne fresca solo ritiro (ADR 033, valori provvisori)
- [x] Magazzino reale in Medusa: scorte per variante, niente vendite oltre la disponibilità (ADR 034, quantità provvisorie)

## 🟠 Fase 3: Moduli Custom & Sicurezza Backend
- [ ] Setup integrazione Stripe (provider `@medusajs/payment-stripe`, già incluso in Medusa) + webhook + ADR
- [ ] Design della verifica dell'età al checkout (insieme al checkout)
- [ ] Creazione modulo custom: Age Verification (zona protetta, scritto a mano)
- [ ] Creazione modulo custom: Shipping Rules (regole di spedizione per vino/fragili/carne, zona protetta)
- [ ] Stesura ADR per moduli di pagamento e spedizione

## 🔵 Fase 4: Storefront Next.js
- [x] Inizializzazione applicazione Next.js in `apps/storefront`
- [x] Setup TailwindCSS v4, typography di lusso (`Cormorant Garamond` / `Plus Jakarta Sans`) e design tokens cantina
- [x] Integrazione Medusa Store API (`/store/products`) con ISR, prezzi per regione IVA inclusa, `variantId`, validazione Zod e stato "catalogo non disponibile" (ADR 026)
- [x] Creazione UI: Home page, catalogo vini con filtri, terroir Parco Nazionale del Cilento (Salerno) e age verification gate (bilingue IT/EN)
- [x] Creazione UI: Pagina prodotto di dettaglio dinamica (`/prodotti/[handle]`) con rendering studio della bottiglia, galleria carosello, popover di selezione casse bottiglia (x1, x2, x3, x4, x6, x9, x12, x18) e schede tecniche
- [x] Creazione UI: Pagina catalogo completa (`/vini`) con filtri sfaccettati (categoria, prezzo, ordinamento, ricerca)
- [x] Creazione UI: Pagina storica e tenuta (`/la-cantina`) con cenno storico, fotografia della bottaia in pietra e layout minimale con solo footer
- [x] Creazione UI: Navbar con menu a tendina dinamico (sincronizzato con le categorie Medusa) e rimozione ridondanza Terroir
- [x] Creazione UI: Sezione Accedi / Registrati con menu a tendina e popup modal in-place e fallback `/account` con validazione Zod
- [x] Form di accesso e registrazione disattivati finché non c'è l'autenticazione vera (ADR 031)
- [x] Carrello (2a): "Aggiungi al carrello" reale via Server Actions, id in cookie httpOnly (ADR 035)
- [x] Disponibilità reale nello storefront: "X disponibili" sempre visibile ed "Esaurito" dalle scorte Medusa (ADR 035)
- [ ] Carrello (2b): pagina `/carrello` (quantità, rimozione, totali) e contatore nella Navbar
- [ ] Carrello: pannello laterale interattivo che si nasconde se il carrello è vuoto (dopo la pagina)
- [ ] Checkout senza pagamento reale (email, indirizzo Italia, spedizione, riepilogo IVA) con `pp_system_default`
- [ ] Checkout con Stripe Elements (Payment Element), conferma e pagina ordine completato
- [ ] Autenticazione cliente reale (Medusa emailpass, sessione in cookie httpOnly) e riattivazione dei form
- [ ] Area riservata: profilo, indirizzi, storico ordini (controlli di proprietà + test 403/404)

## 🟣 Fase 5: Affidabilità & Produzione
- [ ] Creazione script di automazione per il deploy (CI/CD o shell script)
- [ ] Valutazione host di produzione (es. VPS Aruba con Docker o DBaaS)
- [ ] Setup certificati SSL e reverse proxy (es. Nginx / Traefik)
- [ ] Test di carico e verifica resilienza del server e del database

## 🔴 Prima della produzione
- [ ] Conferma dal cliente: i prezzi del seed sono IVA inclusa? (ADR 027)
- [ ] Conferma dal cliente: tariffe di spedizione, soglia gratuita, orari di ritiro, carne solo ritiro (ADR 033)
- [ ] Conferma dal cliente: quantità reali a magazzino e se il negozio fisico condivide le scorte del sito (ADR 034)
- [ ] Decisione del cliente sulla vendita fuori dall'Italia: paesi, carne fresca, commercialista per OSS/accise, corrieri (ADR 029)
- [ ] Su GitHub: rendere obbligatorio il check della CI su `develop` e `main` (Settings → Branches)
- [ ] Decisione sul pagamento: metodi oltre alla carta (PayPal, Apple Pay, Google Pay, Klarna)
