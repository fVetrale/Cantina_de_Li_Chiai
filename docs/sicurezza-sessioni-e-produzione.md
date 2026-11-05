# Sicurezza di login, sessioni e cookie — spiegazione e checklist per la produzione

Documento scritto il 2026-11-05 su richiesta del committente, prima di implementare l'accesso dei clienti
(parte A dell'area riservata, ADR 040). Raccoglie le spiegazioni date in chat e **le cose da controllare prima
di andare in produzione**.

---

## 1. Chi gestisce il token di login

Ci sono **tre attori**, ognuno con un ruolo preciso:

| Attore | Cosa fa con il token |
|---|---|
| **Medusa** (backend) | Controlla la password, **crea** il token e lo **verifica** a ogni richiesta. È l'unico che conosce la chiave segreta (`JWT_SECRET`, nel `.env`). |
| **Server di Next.js** (storefront) | **Riceve** il token da Medusa, lo mette nel cookie, lo **legge** dal cookie e lo **inoltra** a Medusa. |
| **Browser** del cliente | **Conserva** il cookie e lo rimanda al nostro sito. Non lo legge e non lo usa. |

## 2. Il percorso, passo per passo

```
1. LOGIN
Browser ──(email + password, via HTTPS)──► Server Next (Server Action)
                                            │
                                            ▼
                                  Medusa: controlla la password
                                  (salvata cifrata, mai in chiaro)
                                            │  restituisce il TOKEN
                                            ▼
Browser ◄──── Set-Cookie: cantina_auth=TOKEN ── Server Next
              (HttpOnly, Secure, SameSite=Lax, 1 giorno)

2. OGNI PAGINA DOPO
Browser ──(il cookie parte da solo)──► Server Next
                                        │ legge il cookie
                                        ▼
                              Medusa ◄── "Authorization: Bearer TOKEN"
                                │ verifica firma e scadenza
                                ▼
                     "è il cliente X": restituisce SOLO i suoi dati

3. LOGOUT
Server Next ──► Set-Cookie: cantina_auth=; Max-Age=0  (il browser lo cancella)
```

## 3. Cos'è il token (JWT)

È una "carta d'identità digitale" **firmata** da Medusa. Contiene l'id del cliente e la **scadenza** (1 giorno,
valore predefinito di Medusa: `jwtExpiresIn = "1d"`). Non è cifrato, ma è firmato: se qualcuno prova a
modificarlo (per esempio a cambiare l'id del cliente), la firma non torna più e Medusa lo rifiuta. Solo chi ha
la chiave segreta può crearne uno valido.

## 4. Cosa fanno i flag del cookie

- **HttpOnly:** il JavaScript della pagina **non può leggerlo** (`document.cookie` non lo vede). Anche se un
  giorno entrasse uno script malevolo nella pagina (XSS), non potrebbe rubare il token.
- **Secure** (in produzione): viaggia **solo su HTTPS**, quindi nessuno può intercettarlo in rete.
- **SameSite=Lax:** un altro sito non può far partire richieste "a nome tuo" verso il nostro con il tuo cookie
  (CSRF). In più, Next controlla da solo che le Server Actions arrivino dal nostro sito.
- **Durata 1 giorno:** come il token. Dopo serve un nuovo login.

È lo **stesso schema già usato** per il carrello (`cantina_cart_id`, 30 giorni) e per l'ultimo ordine
(`cantina_last_order`, 1 giorno). Il token di login è il dato più sensibile dei tre, per questo ha la scadenza più
breve.

## 5. Il limite del JWT

Il JWT è **"senza stato"**: Medusa non tiene un elenco dei token attivi. Il logout cancella il cookie dal tuo
browser, ma se qualcuno avesse **già copiato** il token (cosa che HttpOnly e HTTPS rendono molto difficile), quel
token resterebbe valido **fino alla scadenza**, cioè al massimo 1 giorno. Per questo la scadenza è breve.

**Miglioramento futuro:** passare alle **sessioni di Medusa salvate su Redis**, che si possono revocare subito
dal server (logout o cambio password invalidano subito la sessione).

## 6. I cookie possono essere intercettati e il JWT rubato?

La risposta onesta è: **in rete no, sul dispositivo sì, in certi casi**.

### 6.1 Mentre viaggia in rete: protetto
Con **HTTPS** tutta la comunicazione tra browser e sito è cifrata, compresi i cookie. Chi intercetta il traffico
(Wi-Fi pubblico, router, provider) vede solo dati illeggibili. Il flag **Secure** garantisce che il cookie
**non parta mai** su una connessione non cifrata.

In produzione va aggiunto **HSTS**, che obbliga il browser a usare sempre HTTPS e impedisce di "declassare" la
connessione a HTTP. In locale si usa `http://localhost`, ma lì il traffico non esce dal computer.

### 6.2 Nel browser, da script malevoli (XSS): protetto
Il flag **HttpOnly** impedisce a qualsiasi JavaScript di leggerlo.

Un limite resta: uno script malevolo **non può rubare** il token, ma finché la pagina è aperta potrebbe
**usarlo** per fare richieste a nome del cliente. La difesa vera è non avere script malevoli:
- React protegge già i testi in automatico;
- non usiamo `dangerouslySetInnerHTML` (regola del progetto);
- in produzione si aggiunge una **Content-Security-Policy**, che blocca gli script non autorizzati.

### 6.3 Sul dispositivo del cliente: qui sì, può succedere
I cookie sono salvati sul disco del computer. Il sito non può proteggerli se:
- il PC ha un **malware** (gli "infostealer" rubano proprio i cookie dei browser);
- è installata un'**estensione del browser** con permesso di leggere i cookie;
- qualcuno usa fisicamente il computer.

Vale per **qualsiasi sito**, anche banche e Amazon. Si può solo **limitare il danno**:
- **scadenza breve:** con 1 giorno, un token rubato smette di funzionare presto;
- **sessioni revocabili** (miglioramento futuro, sessioni di Medusa su Redis): il logout o il cambio password
  invalidano subito il token;
- **conferma della password per le azioni delicate**, per esempio cambiare email o password.

### 6.4 Sul server: lo controlliamo noi
- Il token non finisce mai nei log del nostro codice.
- In produzione il reverse proxy (Nginx/Traefik) va configurato per **non registrare l'header `Cookie`**
  (né `Authorization`).
- Il cookie vale **solo per il nostro dominio** (nessun attributo `Domain`), non per altri siti o sottodomini.

### 6.5 Riepilogo

| Dove | Rischio | Protezione |
|---|---|---|
| Rete | basso | HTTPS + Secure (+ HSTS in produzione) |
| Script nella pagina | basso | HttpOnly + niente XSS (+ CSP in produzione) |
| Dispositivo infetto | presente | non eliminabile dal sito: scadenza breve, sessioni revocabili in futuro |
| Server e log | basso | niente token nei log, proxy configurato |

## 7. Niente dati sensibili negli URL (il "copia e incolla del link")

Un indirizzo web (URL) **non è un posto sicuro** per i dati: finisce nella cronologia del browser, nei link
copiati e incollati o inviati via chat, negli screenshot, nei log dei server e dei proxy, negli strumenti di
statistica e nell'intestazione `Referer` inviata ad altri siti.

**Il caso concreto: la pagina di conferma ordine (ADR 039).** Medusa permette a **chiunque conosca l'id di un
ordine** di leggerlo tramite l'API pubblica (`GET /store/orders/:id`): email, prodotti, totali. Se l'id fosse
nell'indirizzo (per esempio `/ordine/order_01ABC…`), chi riceve il link copiato, vede uno screenshot o la
cronologia potrebbe vedere l'ordine di un'altra persona. Per questo:
- l'indirizzo è sempre e solo **`/ordine/confermato`, senza nessun id**;
- l'id dell'ordine sta in un **cookie httpOnly** (`cantina_last_order`, 1 giorno) che esiste solo nel browser di
  chi ha comprato;
- la pagina chiede a Medusa solo i dati che mostra (niente indirizzi, telefono o metadata);
- verificato: un altro browser che apre lo stesso indirizzo vede "Non ci sono ordini recenti".

**Lo stesso principio vale per tutto il sito:**
- id del carrello → solo nel cookie httpOnly `cantina_cart_id`, mai nell'URL;
- token di login → solo nel cookie httpOnly `cantina_auth`, mai nell'URL;
- email e password → solo nel corpo delle richieste, mai nell'URL né nei log;
- gli id ricevuti dai cookie vengono controllati nel formato prima di essere usati, per evitare manomissioni.

**Per il futuro:** lo storico ordini dell'area riservata (parte B) mostrerà gli ordini solo al cliente
autenticato e proprietario (con test 403/404); un eventuale "link all'ordine" da inviare via email dovrà usare
un token firmato e a scadenza, mai l'id nudo.

## 8. Altre scelte di sicurezza della parte A (accesso)

- **Errori generici** al login e alla registrazione ("email o password non validi"): nessuno può scoprire quali
  email sono registrate.
- **Password di almeno 10 caratteri**. Le password le salva Medusa in forma cifrata (hash), mai in chiaro: non
  scriviamo crittografia nostra.
- **Input validati con Zod** sul server; email e password non compaiono mai nei log.
- Al browser arriva **solo il nome** del cliente (per "Ciao, Nome"), niente email o id.
- **Limite noto:** Medusa **non blocca i tentativi ripetuti di login** (attacchi a forza bruta). Va aggiunto un
  limite di richieste prima della produzione (vedi checklist).

---

## ✅ Checklist da controllare prima della produzione

- [ ] **HTTPS obbligatorio** su tutto il sito (certificato TLS valido) e redirect da HTTP a HTTPS.
- [ ] **HSTS** attivo sul reverse proxy (es. `Strict-Transport-Security: max-age=31536000; includeSubDomains`).
- [ ] Verificare che in produzione `NODE_ENV=production`, così i cookie hanno il flag **Secure**.
- [ ] **Content-Security-Policy** configurata (script solo dal nostro dominio e da quelli necessari, es. Stripe).
- [ ] **Reverse proxy senza log** degli header `Cookie` e `Authorization`.
- [ ] **Limite ai tentativi di login e registrazione** (rate limiting sul proxy o sulle rotte `/auth/*`), con
      eventuale blocco temporaneo dopo N tentativi falliti.
- [ ] **`JWT_SECRET` e `COOKIE_SECRET` lunghi e casuali** in produzione, diversi da quelli di sviluppo, mai nel
      repository. Cambiarli invalida tutti i login (utile in caso di incidente).
- [ ] Valutare le **sessioni revocabili** (sessioni Medusa su Redis) al posto del JWT senza stato.
- [ ] **Conferma della password** per le azioni delicate (cambio email, cambio password) quando verranno aggiunte.
- [ ] **Recupero password**: richiede un servizio di invio email (oggi solo avviso "disponibile a breve").
- [ ] **Accedi con Google**: oggi solo "presto disponibile"; se attivato, serve un'app Google OAuth configurata.
- [ ] **GDPR**: modo per chiedere la cancellazione dell'account (per ora "contattaci"), informativa privacy
      aggiornata con i dati trattati (account, ordini, dichiarazione d'età senza data di nascita).
- [ ] Ordini fatti da ospite **non compaiono** nello storico di chi si registra dopo con la stessa email (ADR 040):
      decidere se serve collegarli.
- [ ] **Nessun id, token o dato personale negli URL** (sezione 7): ricontrollare ogni nuova pagina; i link
      nelle email future (conferma ordine, recupero password) devono usare token firmati e a scadenza.
- [ ] Valutare se limitare l'API pubblica `GET /store/orders/:id` di Medusa (oggi leggibile da chi conosce l'id)
      con una rotta personalizzata riservata ai clienti autenticati o a un token firmato.
