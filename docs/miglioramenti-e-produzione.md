# Miglioramenti e cose da controllare prima della produzione

Documento creato il 2026-11-05 su richiesta del committente. Raccoglie **tutto quello che resta da fare, decidere o
verificare** dall'inizio del progetto a oggi, ricavato dagli ADR (`docs/adr/`) e dalle decisioni prese in chat.
Accanto a ogni voce c'è il riferimento all'ADR che la spiega.

Le note di sicurezza su login, sessioni, cookie e URL sono in un file a parte:
**`docs/sicurezza-sessioni-e-produzione.md`** (con la sua checklist).

Legenda: 🔴 bloccante per la produzione · 🟠 da decidere con il cliente · 🟡 miglioramento consigliato · ⚪ minore

---

## 1. Decisioni da prendere con il cliente 🟠

- [ ] 🟠 **Prezzi IVA inclusa?** Oggi i prezzi del seed (es. €9) sono trattati come prezzi finali IVA inclusa. Se
      fossero netti, si cambia una preferenza nel backend e si rilancia il seed (ADR 027).
- [ ] 🟠 **Spedizioni:** tariffa sotto i €90 (oggi €9,90 fissa, provvisoria), soglia della spedizione gratuita (€90),
      orari di ritiro in cantina, carne fresca solo ritiro (ADR 033).
- [ ] 🟠 **Tariffe fisse o per peso/numero di bottiglie?** Oggi la tariffa è fissa: 18 bottiglie costano come 1
      (ADR 033).
- [ ] 🟠 **Magazzino:** quantità reali per ogni prodotto (oggi provvisorie: vini 60, salumi 20, carne 10, olio 30) e se
      il negozio fisico usa le stesse scorte del sito (ADR 034).
- [ ] 🟠 **Pagamenti:** Stripe o altro? Quali metodi (carta, PayPal, Apple Pay, Google Pay, Klarna, bonifico, contanti
      al ritiro)? Oggi il checkout usa solo il **pagamento di prova** (ADR 037, 039).
- [ ] 🟠 **Fattura:** serve il campo "Richiedi fattura" (codice fiscale / P.IVA) nel checkout? (ADR 037)
- [ ] 🟠 **Vendita all'estero:** in quali paesi, carne fresca sì/no, commercialista per OSS e accise, corrieri. Oggi si
      vende **solo in Italia** (ADR 029).
- [ ] 🟠 **Corriere con verifica del documento** alla consegna degli alcolici (ADR 038).

## 2. Aspetti legali e privacy 🔴🟠

- [ ] 🔴 **Verifica dell'età certificata:** chiedere a un legale se la delibera **AGCOM 96/25/CONS** ("doppio
      anonimato", in vigore dal 12/11/2025) vale anche per un e-commerce di vino. Se sì, aggiungere un metodo
      certificato (fornitore terzo, app europea di verifica dell'età o IT-Wallet). Il modulo è già predisposto
      (ADR 038).
- [ ] 🔴 **Pagine legali** (`/legal`): rivedere condizioni di vendita, informativa privacy e cookie policy con i dati
      realmente trattati: account cliente, ordini, indirizzi, dichiarazione di maggiore età **senza** data di nascita
      (la data di nascita non viene mai salvata — ADR 038).
- [ ] 🟠 **Cookie:** oggi il sito usa solo cookie tecnici (`cantina_cart_id`, `cantina_auth`, `cantina_last_order`) e
      `sessionStorage` per il popup dell'età. Se si aggiungono statistiche o marketing, serve il banner di consenso.
- [ ] 🟠 **Conservazione dei dati:** decidere per quanto tempo tenere ordini, account e carrelli abbandonati.
- [ ] 🟡 **Cancellazione account (GDPR):** oggi c'è solo un link "Richiedi la cancellazione dell'account" che porta ai
      contatti. **Da implementare** una procedura vera (richiesta dall'area riservata + cancellazione o anonimizzazione
      dei dati) — decisione del 2026-11-05 (ADR 041).
- [ ] 🟡 **Footer:** i metodi di pagamento elencati (Visa/Mastercard, PayPal, bonifico, contanti al ritiro) devono
      corrispondere a quelli davvero attivi.

## 3. Bloccanti tecnici prima della produzione 🔴

- [ ] 🔴 **NON pubblicare il sito prima del pagamento vero** (task Stripe 4–5): oggi il checkout crea ordini senza
      incasso (ADR 037, 039).
- [ ] 🔴 **Checklist di sicurezza** in `docs/sicurezza-sessioni-e-produzione.md`: HTTPS + HSTS, Content-Security-
      Policy, proxy senza log di `Cookie`/`Authorization`, **limite ai tentativi di login**, segreti di produzione
      lunghi e casuali, nessun dato sensibile negli URL (ADR 040).
- [ ] 🔴 **Invio email** (provider di notifiche in Medusa): conferma d'ordine, recupero password, verifica email.
      Oggi nessuna email viene inviata (ADR 039, 040).
- [ ] 🔴 **Seed in produzione:** non lanciarlo alla cieca. Sovrascrive nome del negozio e valute, e crea spedizioni e
      scorte con **valori provvisori** (ADR 027, 033, 034). Preparare i dati reali prima.
- [ ] 🔴 **Hosting e deploy:** script di deploy, server (es. VPS con Docker), certificati TLS, reverse proxy, backup del
      database, test di carico (TODO fase 5).
- [ ] 🟡 Verificare `medusa start` dalla build di produzione e il seed dopo il cambio del tsconfig: non ancora
      riprovati (ADR 025).

## 4. Funzionalità da completare 🟡

**Area riservata e account**
- [x] Area riservata parte B: profilo, rubrica indirizzi, storico e dettaglio ordini, indirizzi salvati nel
      checkout, con test di proprietà (ADR 041).
- [ ] 🟡 **Preferiti** (parte C): salvati nei metadata del cliente (ADR 040).
- [ ] 🟡 **Storico ordini con paginazione:** oggi mostra i primi 20 ordini (ADR 041).
- [ ] ⚪ Ordine di un altro cliente aperto da link: risponde 404 con la pagina generica "Prodotto non trovato";
      valutare una pagina 404 dedicata all'area riservata (ADR 041).
- [ ] 🟡 **Cambio email:** oggi l'email è in sola lettura ("per cambiarla contattaci"). Va implementato con
      **verifica della nuova email** e aggiornamento delle credenziali di accesso (decisione del 2026-11-05, ADR 041).
- [ ] 🟡 **Recupero password** e **verifica email alla registrazione** (servono le email).
- [ ] 🟡 **Accedi con Google** (oggi "Presto disponibile": serve un'app Google OAuth).
- [ ] 🟡 **Carte salvate** (dipendono dal fornitore dei pagamenti).
- [ ] 🟡 **Ordini fatti da ospite**: chi si registra dopo con la stessa email non li vede nello storico. Valutare il
      collegamento con verifica dell'email (ADR 040).
- [ ] 🟡 **Sessioni revocabili** (sessioni Medusa su Redis) al posto del JWT "senza stato" (ADR 040).

**Negozio e checkout**
- [ ] 🟡 **Pagamento vero** con Stripe Payment Element (task 4–5) e pagina "carte salvate".
- [ ] 🟡 **Pannello laterale del carrello** che si nasconde se il carrello è vuoto (ADR 036).
- [ ] 🟡 **Scelta del formato** per prodotti con più varianti: oggi si usa solo la prima variante (ADR 026).
- [ ] 🟡 **Spedizione a peso / numero di bottiglie** (modulo protetto `shipping-rules`) se il cliente lo chiede
      (ADR 033).
- [ ] 🟡 **Link all'ordine nelle email**: con token firmato e a scadenza, mai l'id nudo (note di sicurezza, sez. 7).
- [ ] 🟡 **Limitare l'API pubblica degli ordini** di Medusa (`GET /store/orders/:id`, leggibile da chi conosce l'id)
      con una rotta riservata (ADR 039).
- [ ] 🟡 **Newsletter**: oggi è solo grafica, non salva nulla.

## 5. Manutenzione tecnica 🟡

- [ ] 🟡 **Dal 2026-11-11:** rivalutare gli override di `glob` e `minimatch` (correzioni uscite da poco) (ADR 032).
- [ ] 🟡 A ogni aggiornamento di Medusa: verificare se gli override di `pnpm` servono ancora (ADR 032).
- [ ] 🟡 Aggiornare di tanto in tanto le GitHub Actions fissate per SHA; valutare Dependabot (ADR 030).
- [ ] 🟡 Passare a **Vitest 5** quando il progetto richiederà Node ≥ 22.12 (ADR 028).
- [ ] 🟡 Aggiungere alla CI i **test di integrazione del backend** (servono Postgres nella CI) e la **build** dello
      storefront (ADR 030).
- [ ] ⚪ La soglia della spedizione gratuita (€90) è scritta in **due punti** (seed del backend e storefront): se cambia,
      aggiornarli entrambi (ADR 036).
- [ ] ⚪ Il seed non ha test automatici (ADR 027).
- [ ] ⚪ `@medusajs/js-sdk` è installato ma non usato: decidere se toglierlo (ADR 035).
- [ ] ⚪ `packages/shared` è vuoto.

## 6. Interfaccia e contenuti (audit grafico in programma) ⚪

- [ ] 🟡 **Audit completo** di responsive (telefono, tablet, desktop), pulsanti morti e testi ingannevoli — da fare dopo
      l'area riservata (deciso il 2026-11-05).
- [ ] ⚪ Scheda prodotto: "consegna entro il …" con una data calcolata a caso, codice articolo di riserva finto,
      pulsanti "Disponibile in Cantina" e "Aggiungi ai preferiti" senza funzione (i preferiti arrivano con la parte C).
- [ ] ⚪ Testi italiani fissi anche nella versione inglese (scheda prodotto, pagina 404, `<html lang="it">`).
- [ ] ⚪ Prezzi in formato italiano ("€ 24,00") anche nella versione inglese.
- [ ] ⚪ Il contatore del carrello non gestisce numeri sopra 99.
- [ ] ⚪ Prodotti creati in futuro dall'admin senza foto locale mostrerebbero l'immagine del Chiai Rosso: servono le
      foto caricate in Medusa e la configurazione di Next per le immagini esterne.
- [ ] ⚪ Avanzi del vecchio template sardo (chiave `sardinia`, immagini `cannonau.jpg`/`vermentino.jpg`).
- [ ] ⚪ Lo stato "catalogo non disponibile" risponde con codice 200 invece di 503 (ADR 026).
- [ ] ⚪ Nel database di sviluppo la categoria dei vini si chiama ancora "Vini Rossi" e contiene anche i bianchi.

## 7. Gestione operativa del negozio 🟠

- [ ] 🟠 Tenere aggiornate le scorte nell'admin, **comprese le vendite al banco** in cantina (ADR 034).
- [ ] 🟠 Segnare gli ordini come evasi nell'admin: è il momento in cui Medusa scala le scorte (ADR 034).
- [ ] ⚪ Nel database di sviluppo ci sono ordini di prova (#1, #2, #3 e successivi): annullarli se danno fastidio.
- [ ] ⚪ La dichiarazione di maggiore età scade dopo 24 ore: comportamento voluto, il sito la rinnova a ogni
      "Conferma ordine" (ADR 038).
