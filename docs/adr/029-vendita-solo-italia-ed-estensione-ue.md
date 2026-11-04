# 029. Vendita solo in Italia per il lancio. Estensione ad altri paesi UE rimandata

- **Stato:** Accettato, provvisorio (2026-11-04). Va rivisto quando il cliente avrà deciso se vendere all'estero.
- **Collegati:** ADR 026 (prezzi per regione nello storefront), ADR 027 (provider fiscale e prezzi IVA inclusa)
- **Nota:** questo ADR è scritto in italiano su richiesta del committente.

## Contesto
Durante il lavoro sugli ADR 026 e 027 è emersa la domanda: un cliente di un altro paese, per esempio la Francia, può comprare?

Oggi **no**. Questo non dipende dagli ADR 026/027, ma dalla configurazione iniziale del backend.

**Backend (Medusa):**
- Il seed crea una sola regione, "Italy", con valuta EUR e un solo paese (`it`).
- Esiste una sola regione fiscale, `it` con IVA al 22% (ADR 027).
- In Medusa ogni carrello appartiene a una regione, e il paese dell'indirizzo di spedizione deve far parte di quella regione. Il checkout con un indirizzo francese verrebbe rifiutato.

**Storefront:**
- `apps/storefront/lib/data/products.ts` ha la costante `STORE_COUNTRY_CODE = "it"`.
- I prezzi vengono chiesti a Medusa "per un cliente in Italia", cioè IVA italiana inclusa (ADR 026).

**Cosa vede un visitatore estero:**
- Può navigare il sito e vede gli stessi prezzi di tutti, cioè quelli italiani.
- Il sito non usa la posizione del visitatore.
- Non può farsi spedire la merce fuori dall'Italia.

Il `CLAUDE.md` del progetto indica come mercato "Italia/UE". Vendere fuori dall'Italia però non è solo una questione tecnica.

**Fisco: IVA.** Nelle vendite a distanza verso privati di altri paesi UE, sopra la soglia comunitaria di 10.000 € l'anno, si applica l'IVA del paese di destinazione (es. Francia 20%). Di solito la si versa con il regime OSS (One-Stop-Shop).

**Fisco: accise sul vino.** Per vendere alcolici a privati di un altro paese UE si pagano le accise nel paese di destinazione, in genere tramite un rappresentante fiscale. Questo vale **indipendentemente dalla soglia IVA** ed è l'adempimento più impegnativo.

**Logistica:**
- La carne fresca richiede la catena del freddo, e la spedizione all'estero è ancora più difficile (decisione D ancora aperta).
- Gli imballi per il vino e i corrieri internazionali hanno costi diversi.

**Avvertenza:** questi punti fiscali sono indicazioni generali, non una consulenza. Prima di decidere servono la verifica e il parere del commercialista del cliente.

## Alternative
1. **Solo Italia al lancio.** (Scelta) Una regione e un'aliquota IVA, nessun adempimento fiscale estero.
2. **Aggiungere subito i paesi UE alla regione "Italy".** Tecnicamente è veloce, perché la valuta è sempre l'euro. Però porterebbe a vendere vino all'estero senza gestire accise, IVA di destinazione e spedizioni. Rifiutata finché il cliente non decide.
3. **Una regione "UE" separata con regioni fiscali per ogni paese.** È la strada tecnica corretta se si apre all'estero, ma dipende dalle stesse decisioni fiscali e logistiche. Rimandata.
4. **Riconoscere automaticamente il paese del visitatore (geolocalizzazione IP).** Rifiutata come base: è poco affidabile e non serve. Conta il paese di spedizione scelto dal cliente, non quello da cui si collega.

## Decisione
- **Per il lancio il negozio vende solo in Italia.** Restano una sola regione Medusa ("Italy", EUR, `it`) e una sola regione fiscale (IVA 22%, `tp_system`).
- **Lo storefront tiene il paese fisso** (`STORE_COUNTRY_CODE = "it"`). I prezzi mostrati sono quelli italiani IVA inclusa per tutti i visitatori.
- **L'apertura ad altri paesi è rimandata** a quando il cliente avrà risposto a queste domande:
  1. Vuole vendere fuori dall'Italia? In quali paesi?
  2. Solo prodotti secchi (vino, salumi, olio) o anche carne fresca?
  3. Ha un commercialista che segua OSS, accise e rappresentanza fiscale?
  4. Quali corrieri e costi di spedizione per l'estero?
- **Quando si aprirà all'estero** si scriverà un nuovo ADR che sostituisce questo. Il piano tecnico previsto è:
  - **Backend:** aggiungere i paesi (alla regione "Italy" o a una nuova regione "UE" in EUR) e creare una regione fiscale per ogni paese con la sua aliquota, sempre con provider `tp_system`. Configurare le opzioni di spedizione per paese. Eventuali regole per categoria (es. niente carne fresca all'estero) andranno nel modulo protetto `shipping-rules`.
  - **Storefront:** sostituire la costante `STORE_COUNTRY_CODE` con il paese scelto dal cliente (per esempio un selettore salvato in un cookie, validato con Zod contro i paesi della regione) e usare il paese dell'indirizzo di spedizione nel carrello. Il data layer dell'ADR 026 è già pronto, perché il paese è un solo parametro.
  - **Prezzi:** con i prezzi IVA inclusa (ADR 027), Medusa tiene fisso il prezzo lordo (es. €9) e ricalcola il netto con l'aliquota del paese. Per avere prezzi lordi diversi per paese servono prezzi specifici per regione.

## Conseguenze
- **Positive:**
  - Il lancio è semplice: un'aliquota, nessun adempimento fiscale estero, nessun rischio di vendere vino all'estero senza accise.
  - Il prezzo mostrato coincide con quello che il carrello farà pagare.
- **Negative / compromessi:**
  - I clienti esteri, anche dall'UE, non possono acquistare. Possono solo vedere il catalogo.
  - I visitatori esteri vedono prezzi con IVA italiana: è corretto, perché comunque non possono comprare.
  - Al momento il sito non avvisa che le spedizioni sono solo in Italia.
- **Azioni aperte:**
  - Portare le quattro domande della Decisione al cliente.
  - Valutare un avviso "Spediamo solo in Italia" nello storefront (testi i18n it/en), da fare insieme al carrello o al checkout. Prima di allora l'utente non arriva mai al punto in cui il paese conta.
