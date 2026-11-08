# Restyling editoriale del sito — cosa è cambiato e cosa aggiungere

Documento scritto il 2026-11-05 dopo il restyling grafico richiesto dal committente con due file di indicazioni
(`modifiche-sito-claude-code.md` e `modifiche-sito-completo-claude-code2.md`). Le decisioni tecniche sono
nell'**ADR 045** (`docs/adr/045-editorial-restyling.md`).

**In una frase:** il sito ora ha un aspetto editoriale da cantina di lusso: nero e bianco, molta fotografia, spazio
bianco e un solo accento oro. **Testi, funzioni e sicurezza non sono cambiati.**

---

## 1. Le basi

### Colori
| Nome | Valore | Dove si usa |
|---|---|---|
| Nero | `#000000` | header, footer, hero, testo principale, pulsanti |
| Bianco | `#FFFFFF` | fondo delle pagine e delle schede |
| Oro | `#A18E56` | accenti su fondo scuro (6,5:1 sul nero) ed elementi grandi |
| Oro per il testo | `#776739` | breadcrumb, voce attiva e piccole etichette **su fondo chiaro** |
| Avorio | `#F1F1EC` | fondi secondari (apertura della pagina "La Cantina") |
| Grigio chiaro | `#F5F5F5` | blocchi di testo accanto alle foto |
| Grigio voci non attive | `#757575` | voci di menu e filtri non selezionati |
| Grigio `#BDBDBD` | | solo bordi ed elementi disattivati |
| Grigio testi secondari | `#666666` | descrizioni |

**Perché due ori e due grigi in più rispetto al file di indicazioni:** il file chiede il contrasto **AA**, ma alcuni
suoi colori non lo rispettano:
- l'oro `#A18E56` sul bianco è 3,2:1 e il grigio `#BDBDBD` è 1,9:1, mentre il minimo per il testo piccolo è 4,5:1;
- quindi per il testo piccolo su fondo chiaro usiamo lo **stesso oro un po' più scuro** (`#776739`: 5,5:1 sul bianco,
  4,9:1 sull'avorio) e un grigio più scuro (`#757575`);
- a occhio la differenza quasi non si vede, ma il testo resta leggibile per tutti.

**Colori di stato:** il verde spento resta solo per le conferme ("Aggiunto", "disponibili") e il rosso solo per gli
errori. Servono a capire cosa succede, non decorano.

### Caratteri
- **Titoli e testi lunghi:** Bodoni Moda (Google Fonts). Il peso più leggero disponibile è 400, non 300: i titoli usano 400.
- **Menu, breadcrumb, pulsanti, etichette:** Lato maiuscolo, 12–13px, grassetto, spaziatura larga (4px).
- I titoli si adattano allo schermo, e i font si caricano senza bloccare la pagina.
- Il **capolettera** è leggermente ingrandito nei paragrafi narrativi.

### Animazioni
- Il titolo dell'hero compare con una dissolvenza.
- Le sezioni compaiono leggermente quando ci si arriva scorrendo.
- Le transizioni durano 200–300 ms.
- **Tutte le animazioni si spengono** per chi ha scelto "riduci movimento" nel sistema operativo.
- Non abbiamo aggiunto nessuna libreria.

### Accessibilità
- Quando si naviga con la tastiera, ogni elemento attivo ha un bordo oro ben visibile.
- Menu, tendina dei vini, accordion della scheda prodotto, barra dei capitoli e filtri si usano da tastiera.
- I lettori di schermo sanno qual è la pagina attiva e se un menu o un accordion è aperto.

---

## 2. Elementi comuni

- **Header:** barra nera fissa con "Cantina de Li Chiai" al centro.
  - A sinistra: I Vini (con tendina delle categorie), La Cantina, Contatti, ognuna preceduta da una sottile linea diagonale.
  - A destra: lingua, ricerca, account e carrello.
  - La **pagina attiva** è in oro con una barra bianca sotto.
  - Sotto i 1024px diventa un **menu a scomparsa** a tutta larghezza.
- **Footer:** nero, link in maiuscolo spaziato. Stessi contenuti di prima.
- **Popup dell'età:** è la "schermata d'ingresso" chiesta dal file: fondo nero con vignettatura, l'emblema al centro,
  la domanda sull'età. **Funziona come prima.**
- **Emblema:** per ora è un monogramma "LC" provvisorio (vedi sezione 5).

---

## 3. Pagina per pagina

### Home
- **Hero** a tutta larghezza: la vigna in chiaroscuro, il titolo bianco centrato e, su schermi grandi, a destra la foto
  della bottiglia "Chiai" con l'etichetta storica.
- **Due riquadri affiancati:** "Consegna" (fondo nero) e "La nostra storia" (fondo grigio chiaro), con foto, testo e
  link "Scopri di più".
- **Su richiesta del committente** la home non mostra più i vini (si raggiungono dal menu), né il mosaico social né la
  newsletter. I componenti esistono ancora: si possono rimettere in pochi minuti.

### Scheda prodotto (`/prodotti/…`)
1. **Hero scuro** con il nome del vino grande al centro e la foto del vino a destra.
2. **Barra bianca fissa con i 4 vini:** il vino aperto è in oro, gli altri in grigio. Si passa da un vino all'altro con un clic.
3. **Tre colonne** (una sola sotto i 900px):
   - **sinistra:** percorso (I Vini / Vini Rossi / **Rosso Vecchio** in oro), nome, prezzo, quantità, disponibilità,
     pulsante "Aggiungi al carrello" con il sacchetto, preferiti, scheda dati;
   - **centro:** la foto grande con la galleria (si apre ancora a schermo intero), che resta ferma mentre si scorre;
   - **destra:** **accordion ⊕** con Caratteristiche & Note, Origine & Lavorazione, Abbinamenti, Scheda tecnica.
4. **Sezione 50/50:** foto della vigna e testo su grigio chiaro con "Scopri la nostra storia & la cantina".
5. **Altri vini** della cantina.

### La Cantina
Pagina narrativa a **capitoli alti quanto lo schermo**:
- apertura con l'emblema, il titolo e i tre dati della famiglia;
- **La Terra**, con il capolettera;
- **Il Lavoro**, con la citazione di Antonio e Matteo in corsivo;
- **Il Ritiro**;
- **La Famiglia**, su fondo nero;
- la **Galleria fotografica**;
- **I Valori**.

Testo e foto incorniciata si alternano a sinistra e a destra. Una **barra dei capitoli** permette di saltare da
uno all'altro e segue lo scorrimento: in basso su computer, sotto l'header su telefono, dove una barra in basso
coprirebbe i contenuti.

### Vini (`/vini`)
- In alto il **selettore**: le categorie (Tutti i Vini, Vini Bianchi, Vini Rossi, Vini Dolci) in grande, su una foto della
  vigna sfocata e quasi bianca.
- Cliccando una categoria, la voce diventa oro e si sposta a sinistra; a destra compare la colonna con i vini e i prezzi.
- **Sotto restano** ricerca, fascia di prezzo, ordinamento e le schede dei vini con **prezzo, "Aggiungi" e cuore**: per
  chi compra non si perde nulla.
- Il riquadro "Consegna" in fondo è nel nuovo stile. Ho tolto la didascalia "Cofanetto Tradizione Cilentana – Edizione
  Limitata", che parlava di un prodotto inesistente.

### Carrello, checkout, area riservata, note legali, conferma ordine, pagina 404, popup di accesso
Prendono gli elementi comuni: angoli retti, niente ombre morbide, pulsanti rettangolari neri, i nuovi colori e
caratteri. **Moduli, campi e funzionamento non sono cambiati**, per non toccare acquisto e login.

---

## 3b. Effetto "immagini che escono" (aggiunto il 2026-11-08, ADR 046)

Su **tutti i blocchi foto + testo** (i 4 capitoli di "La Cantina", la sezione 50/50 della scheda prodotto, i due riquadri
della home e il riquadro "Consegna" in `/vini`):
- il blocco compare in **dissolvenza**;
- un **sipario** dello stesso colore del fondo scivola via dalla foto;
- titolo e testi entrano con una **leggera rotazione 3D**;
- **col mouse sopra la foto:** zoom lento e una **striscia avorio** con "+ Scopri" in verticale, che diventa oro al
  passaggio e porta a una pagina o sezione collegata;
- l'effetto parte **una volta sola** e **anche quando il blocco è già visibile a pagina caricata**.

Dettagli:
- **"Il Lavoro"** ha uno **slider** di 3 foto che cambiano ogni 5 secondi, con un **pulsante pausa**. Si ferma anche
  passandoci sopra con il mouse o con la tastiera.
- **Su telefono** la striscia è sempre visibile e lo zoom automatico è leggero.
- **Con "riduci movimento"** e **senza JavaScript** tutto resta visibile e fermo. Se il sito non si carica bene, i blocchi
  compaiono comunque dopo 4 secondi.

## 3c. Pagina dei vini, header ed effetti (aggiornato il 2026-11-08, ADR 047)

- **Pagina dei vini (`/vini`):** è **solo il selettore**.
  - Le tre categorie appaiono in grande sulla vigna sfocata, **senza nessuna scelta all'apertura**, con l'invito
    "Scegli una categoria".
  - Cliccando una categoria, la voce diventa oro e da destra **scorre dentro** la colonna con i vini, uno dopo l'altro,
    con prezzo e annata. Cliccando un vino si apre la sua scheda, dove lo si aggiunge al carrello.
  - Sotto non c'è più nulla: niente schede, ricerca, filtri o riquadro "Consegna".
- **Menu "I Vini":** "Tutti i vini" apre il selettore vuoto. "Vini Rossi", "Vini Bianchi" e "Vini Dolci" lo aprono con
  quella categoria già scelta, **anche se sei già nella pagina dei vini**. Prima, in quel caso, non succedeva nulla.
- **Header che si nasconde:** su tutte le pagine sparisce mentre scorri verso il basso e ricompare appena scorri verso
  l'alto. In cima alla pagina, con un menu aperto o navigando con la tastiera resta visibile. Le barre sotto l'header
  (i 4 vini nella scheda prodotto, i capitoli su telefono) salgono con lui.
- **Effetti sempre visibili:** sipari, testi in 3D e dissolvenze **ripartono ogni volta** che un blocco rientra nello
  schermo, senza ricaricare la pagina.

## 4. Cosa del file di indicazioni NON è stato fatto, e perché

| Indicazione | Perché no (per ora) |
|---|---|
| Pagine mappa "Tenute" ed "Esperienze" | Avete una sola cantina e non vendete esperienze: sarebbe una pagina vuota. |
| Pagina di dettaglio di una sede con pulsante play | Non c'è un video: un pulsante che non fa nulla è peggio di nessun pulsante. Lo zig-zag di foto e testo è stato usato in "La Cantina". |
| Sfondi d'archivio sbiaditi (incisioni, mappe, disegni) | Non abbiamo materiale d'archivio e il file vieta di prenderlo da altri siti. |
| Schermata di caricamento a ogni visita | Rallenta il sito: l'abbiamo unita al popup dell'età, che compare comunque alla prima visita. |
| Barre di controllo in basso su telefono | Coprirebbero contenuti e pulsanti: su telefono stanno sotto l'header. |
| Colore ardesia `#363D44` | Serve solo per le mappe. |
| Peso 300 dei titoli | Bodoni Moda non ce l'ha: si usa 400. |

---

## 5. Da chiedere al cliente (per completare il restyling)

- [ ] **Logo o emblema** in formato vettoriale (SVG). Sostituisce il monogramma "LC" provvisorio in "La Cantina", nel
      popup dell'età e, se vuole, nell'header al posto del nome.
- [ ] **Scansione della vecchia etichetta del "Chiai"**: ha un disegno a incisione della tenuta e uno stemma, ideali
      come sfondi d'archivio sbiaditi e come emblema.
- [ ] **Materiale d'archivio:** mappe catastali di Contrada Pozzo, disegni o foto storiche della cantina, lettere o
      documenti di famiglia. Diventano le fasce divisorie e gli sfondi chiesti dal file.
- [ ] **Foto professionali delle bottiglie su fondo bianco** ad alta risoluzione (almeno 2000px di altezza), una per vino.
      Oggi la foto grande della scheda prodotto è una foto ambientata.
- [ ] **Una foto panoramica orizzontale** della vigna o della valle per gli hero (oggi le foto sono verticali e vengono
      scurite).
- [ ] **Un breve video** della vendemmia o della cantina, se si vuole il pulsante play sull'hero.
- [ ] Decidere se **riportare in home** mosaico social e newsletter: la newsletter oggi non salva nulla.

---

## 6. Da aggiungere più avanti (lato sviluppo)

- [ ] Quando arriva il materiale della sezione 5: sfondi d'archivio sbiaditi, emblema vero, foto su fondo bianco,
      eventuale video.
- [ ] Un piccolo riquadro **"Dove siamo"** in "La Cantina" (mappa semplice con la cantina), se il cliente lo vuole.
- [ ] **Audit grafico** (già in programma) per i testi rimasti come prima:
  - "Scopri Anche" e i sottotitoli dell'accordion sono scritti in italiano anche nella versione inglese;
  - nella scheda prodotto restano la data di consegna calcolata e il pulsante "Disponibile in Cantina" senza funzione;
  - gli hashtag del vecchio template;
  - la frase "il prodotto non viaggia" in "La Cantina".
- [ ] Facoltativo, solo pulizia del codice: rinominare le vecchie famiglie di colori (`wine`, `cellar`) con i nomi nuovi.
      Oggi `wine-950` significa "nero".
- [ ] Nella versione inglese i nomi delle categorie (Vini Rossi…) arrivano dal gestionale e restano in italiano.

---

## 7. Come tornare indietro

Tutto il restyling è nel branch `feature/editorial-redesign`. Finché non viene unito in `develop`, basta non unirlo.
Dopo il merge si può annullare con un `git revert` del commit. Nessun dato, ordine o account dipende dalla grafica.

## 8. Come è stato verificato (2026-11-05)

- Lint, typecheck e tutti i test automatici: 169 dello storefront e 24 del backend.
- 40 screenshot (10 pagine × 375, 768, 1280 e 1920px) senza scorrimento orizzontale.
- **Prove dal vivo**, con un browser automatico sui server di sviluppo:
  - menu, contatore del carrello, cambio lingua, menu mobile e tendina da tastiera;
  - filtri e selettore dei vini, compresi i vecchi link delle categorie;
  - checkout con corriere e ritiro, verifica dell'età e **ordine di prova #10**;
  - area riservata con due clienti: profilo, indirizzi, checkout precompilato e **ordine #11**; il secondo cliente
    riceve **404** sull'ordine del primo, e un ospite viene rimandato al login;
  - preferiti: aggiunta e rimozione;
  - popup dell'età.
