# 📝 Project Roadmap & ToDo: Cantina de Li Chiai E-commerce

## 🟢 Fase 1: Setup & Infrastruttura (In Corso)
- [x] Inizializzazione Monorepo pnpm (`apps/`, `packages/`, `infra/`)
- [x] Configurazione Git Flow e regole di Branching (branch `develop`, PR obbligatorie)
- [x] Stesura `AGENT.md` e regole `.agent/rules/`
- [x] Setup Backend Medusa v2 (`apps/backend`)
- [x] Setup Docker Compose per database e cache (`infra/docker-compose.yml`)
- [x] Esecuzione prime migrazioni Medusa e test connessione DB (`pnpm exec medusa db:migrate`)

## 🟡 Fase 2: Sviluppo Backend Core
- [x] Creazione utente Admin Medusa (tramite CLI)
- [x] Configurazione CORS per Admin e Storefront nei file `.env`
- [ ] Seed del database con prodotti fittizi (es. 2-3 bottiglie di vino di test)
- [ ] Test di avvio del backend (`pnpm run dev`) e accesso API

## 🟠 Fase 3: Moduli Custom & Sicurezza Backend
- [ ] Setup integrazione Stripe (modulo `@medusajs/payment-stripe`)
- [ ] Creazione modulo custom: Age Verification (controllo maggiore età)
- [ ] Creazione modulo custom: Shipping Rules (regole di spedizione per vino/fragili)
- [ ] Stesura ADR per moduli di pagamento e spedizione

## 🔵 Fase 4: Storefront Next.js
- [x] Inizializzazione applicazione Next.js in `apps/storefront`
- [ ] Setup TailwindCSS e libreria componenti (es. shadcn/ui)
- [ ] Integrazione Medusa JS Client per chiamate API sicure
- [ ] Creazione UI: Home page e catalogo vini
- [ ] Creazione UI: Pagina prodotto di dettaglio
- [ ] Creazione UI: Flusso di carrello e Checkout sicuro (con Stripe Elements)

## 🟣 Fase 5: Affidabilità & Produzione
- [ ] Creazione script di automazione per il deploy (CI/CD o shell script)
- [ ] Valutazione host di produzione (es. VPS Aruba con Docker o DBaaS)
- [ ] Setup certificati SSL e reverse proxy (es. Nginx / Traefik)
- [ ] Test di carico e verifica resilienza del server e del database