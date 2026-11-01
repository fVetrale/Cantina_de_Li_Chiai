export type Locale = "it" | "en";

export const defaultLocale: Locale = "it";

export const dictionaries = {
  it: {
    announcement:
      "Spedizioni assicurate in imballi isotermici anti-rottura in tutta Italia | Consegna gratuita per ordini superiori a €90",
    ticker:
      "Imballi isotermici anti-rottura in tutta Italia ed Europa • Spedizione gratuita da €90 • Direttamente dalla cantina nel Parco Nazionale del Cilento • Vendemmia 100% manuale",
    searchPlaceholder: "Cosa desideri degustare oggi? (es. Fiano, Aglianico, Cilento Rosso...)",
    wishlist: "Preferiti",
    secondaryNav: {
      all: "Tutti i Vini",
      whites: "Fiano del Cilento",
      reds: "Aglianico & Rossi",
      reserves: "Riserve Speciali",
      estate: "La Cantina",
      terroir: "Il Flysch Cilentano",
      visits: "Degustazioni & Visite",
      contacts: "Contatti",
    },
    common: {
      brand: "Cantina de Li Chiai",
      subtitle: "Vini d'Autore del Cilento",
      origin: "Parco Nazionale del Cilento • Salerno",
      currency: "€",
      format: "Bottiglia 750ml",
      addToCart: "Aggiungi al Carrello",
      addShort: "Aggiungi",
      addedToCart: "Aggiunto!",
      inStock: "Disponibile in cantina",
      outOfStock: "Esaurito",
      viewDetails: "Scheda Vino",
      temperature: "Temp. di servizio",
      alcohol: "Gradazione",
      provenance: "Origine",
      sardinia: "Cilento, Salerno",
      cartTotal: "Totale",
      cartItems: "articoli",
      checkout: "Procedi al Checkout",
      emptyCart: "Il carrello è vuoto",
      searchAction: "Cerca",
    },
    nav: {
      wines: "I Nostri Vini",
      estate: "La Cantina",
      terroir: "Il Terroir",
      contact: "Contatti",
      cart: "Carrello",
      account: "Accedi / Registrati",
    },
    ageGate: {
      title: "Verifica della Maggiore Età",
      description:
        "Per accedere all'enoteca di Cantina de Li Chiai devi avere l'età legale per l'acquisto e il consumo di bevande alcoliche nel tuo paese di residenza (almeno 18 anni in Italia).",
      confirm: "Sì, ho almeno 18 anni",
      decline: "No, ho meno di 18 anni",
      rememberMe: "Ricorda la mia scelta per questa sessione",
      blockedTitle: "Accesso Riservato ai Maggiorenni",
      blockedDesc:
        "Ci dispiace, la vendita di bevande alcoliche è vietata ai minori di 18 anni per legge. Non è possibile accedere al catalogo.",
    },
    hero: {
      badge: "Vendemmia Artigianale nel Parco del Cilento",
      title: "L'Anima del Cilento tra Flysch, Ulivi e Mare",
      subtitle:
        "Dalle colline incontaminate del Parco Nazionale del Cilento, in provincia di Salerno, coltiviamo vitigni storici modellati dalla brezza del Tirreno e dalla roccia millenaria.",
      ctaCollection: "Scopri le Nostre Etichette",
      ctaEstate: "La Nostra Tenuta",
      estateMetrics: [
        { value: "100%", label: "Raccolta manuale" },
        { value: "Cilento DOC", label: "Denominazioni tutelate" },
        { value: "Oasi UNESCO", label: "Parco Nazionale del Cilento" },
      ],
    },
    features: {
      title: "I Valori di Cantina de Li Chiai",
      subtitle: "Tre pilastri di purezza e biodiversità nel cuore del Cilento",
      items: [
        {
          title: "Flysch Cilentano",
          description:
            "L'alternanza millenaria di arenarie e marne argillose dona ai nostri vini sapidità minerale viva, struttura ed eccezionale longevità.",
        },
        {
          title: "Brezza del Tirreno & Macchia",
          description:
            "L'influsso del mare e la biodiversità incontaminata del Parco Nazionale esaltano gli aromi primari di Fiano e Aglianico.",
        },
        {
          title: "Spedizioni Isotermiche Protette",
          description:
            "Ogni bottiglia viaggia in imballi brevettati termoisolanti anti-rottura, per preservare la qualità dalla cantina a casa tua.",
        },
      ],
    },
    promoBanner: {
      badge: "Confezioni Regalo & Aziendali",
      title: "Regala l'Eccellenza dei Vini del Cilento",
      description:
        "Cofanetti in legno massello con Fiano del Cilento DOC e Aglianico Riserva, con biglietto d'auguri personalizzato a mano dal nostro vignaiolo.",
      cta: "Scopri i Cofanetti Regalo",
    },
    catalog: {
      eyebrow: "Catalogo Selezionato",
      title: "La nostra cantina nel Parco del Cilento",
      subtitle:
        "Bottiglie numerate a tiratura limitata, custodi dei vitigni storici e dell'antica tradizione vitivinicola della provincia di Salerno.",
      filterAll: "Tutti i Vini",
      filterWhite: "Fiano del Cilento",
      filterRed: "Aglianico & Rossi",
      filterRiserva: "Riserve Speciali",
      noProducts: "Nessun vino trovato per questa categoria.",
      tastingNotesTitle: "Note di Degustazione",
    },
    story: {
      eyebrow: "La Nostra Terra",
      title: "Vigneti tra gli Ulivi Secolari e le Vette degli Alburni",
      quote:
        "«Nel Cilento il vino è un patto con la terra: si ascolta il mare, si aspetta il sole e si custodisce la purezza del grappolo.»",
      p1: "Nel cuore del Parco Nazionale del Cilento, in provincia di Salerno, i nostri vigneti affondano le radici in suoli formati dal caratteristico Flysch cilentano. Questo substrato minerale unico dona ai nostri vini freschezza, sapidità mediterranea e una longevità rara.",
      p2: "Ogni grappolo viene vendemmiato a mano nelle prime ore del mattino, preservando l'integrità degli acini e dei lieviti autoctoni. Una produzione a basso impatto, limitata ed esclusiva.",
      badge1: "Flysch Cilentano",
      badge1Desc: "Arenarie e marne per una mineralità viva",
      badge2: "Oasi Protetta",
      badge2Desc: "Patrimonio Mondiale UNESCO",
      badge3: "Vendemmia Manuale",
      badge3Desc: "Selezione rigorosa grappolo per grappolo",
    },
    social: {
      title: "Seguici sui Social",
      subtitle:
        "Condividi i tuoi momenti con #CantinaDeLiChiai tra calici, colline cilentane e convivialità mediterranea",
    },
    newsletter: {
      title: "Resta Connesso con la Cantina",
      subtitle:
        "Iscriviti alla nostra newsletter per ricevere in anteprima le nuove annate di Fiano e Aglianico, inviti alle degustazioni e offerte riservate.",
      placeholder: "Inserisci il tuo indirizzo email...",
      button: "Iscriviti",
      legal: "Iscrivendoti accetti la nostra Privacy Policy. Puoi disiscriverti in qualsiasi momento.",
    },
    pdp: {
      breadcrumbHome: "Home",
      breadcrumbWines: "I Nostri Vini",
      taxIncluded: "IVA inclusa",
      vintageLabel: "Annata",
      formatLabel: "Formato",
      alcoholLabel: "Gradazione",
      tempLabel: "Temperatura di Servizio",
      quantity: "Quantità",
      addToCart: "Aggiungi al Carrello",
      addedToCart: "Aggiunto al Carrello!",
      buyNow: "Procedi all'Ordine",
      inStock: "Disponibile in cantina",
      inStockNotice: "Bottiglie custodite a temperatura controllata e pronte per la spedizione.",
      guaranteedShipping: "Spedizione protetta in imballi isotermici brevettati",
      freeShippingBadge: "Spedizione gratuita per ordini superiori a 90€",
      securePayments: "Pagamenti cifrati e tracciabili",
      tabs: {
        tasting: "Note di Degustazione",
        terroir: "Terroir & Flysch",
        pairings: "Abbinamenti Cilentani",
        technical: "Scheda Tecnica",
      },
      tastingLabels: {
        visual: "Esame Visivo",
        olfactory: "Esame Olfattivo",
        gustatory: "Esame Gustativo",
      },
      terroirLabels: {
        soil: "Composizione del Suolo",
        altitude: "Altitudine Vigneti",
        exposure: "Esposizione & Microclima",
        harvest: "Modalità di Vendemmia",
        aging: "Affinamento",
      },
      technicalLabels: {
        appellation: "Denominazione",
        grape: "Vitigni",
        glass: "Calice Consigliato",
        potential: "Potenziale Evolutivo",
        sku: "Codice Articolo (SKU)",
      },
      pairingsTitle: "Abbinamenti della Tradizione Cilentana",
      pairingsSubtitle: "Ideale in armonia con le eccellenze gastronomiche del Parco Nazionale del Cilento",
      relatedTitle: "Dalla Stessa Cantina Cilentana",
      relatedSubtitle: "Altre etichette selezionate coltivate sui nostri suoli da flysch arenaceo",
      backToCatalog: "← Torna a tutti i vini",
      notFoundTitle: "Vino non trovato",
      notFoundDesc: "L'etichetta selezionata non è presente o non è al momento disponibile in cantina.",
    },
    footer: {
      description:
        "Cantina de Li Chiai custodisce la tradizione vitivinicola nel Parco Nazionale del Cilento (Salerno), trasformando grappoli d'eccellenza in vini di pura emozione mediterranea.",
      locationTitle: "Tenuta & Cantina",
      locationAddress: "Località Li Chiai, Parco Nazionale del Cilento — Salerno (SA), Campania, Italia",
      contactsTitle: "Servizio Clienti",
      email: "ordini@cantinadelichiai.it",
      phone: "+39 089 800000",
      hours: "Lun - Sab: 09:00 - 18:00",
      legalNotice:
        "La vendita di bevande alcoliche è vietata ai minori di 18 anni. Bevi responsabilmente.",
      copyright: "Cantina de Li Chiai S.r.l. — Tutti i diritti riservati.",
      privacy: "Privacy Policy",
      terms: "Condizioni di Vendita",
      cookie: "Cookie Policy",
      paymentsTitle: "Pagamenti Sicuri & Certificati",
    },
  },
  en: {
    announcement:
      "Insulated anti-breakage insured shipping across Europe | Free delivery on orders over €90",
    ticker:
      "Insulated anti-breakage shipping across Europe • Free delivery for orders over €90 • Shipped direct from Cilento National Park • 100% hand harvested",
    searchPlaceholder: "What wine would you like to taste today? (e.g. Fiano, Aglianico, Cilento Rosso...)",
    wishlist: "Wishlist",
    secondaryNav: {
      all: "All Wines",
      whites: "Fiano del Cilento",
      reds: "Aglianico & Reds",
      reserves: "Special Reserves",
      estate: "The Winery",
      terroir: "Cilento Flysch Terroir",
      visits: "Tastings & Visits",
      contacts: "Contact",
    },
    common: {
      brand: "Cantina de Li Chiai",
      subtitle: "Signature Wines of Cilento",
      origin: "Cilento National Park • Salerno",
      currency: "€",
      format: "750ml Bottle",
      addToCart: "Add to Cart",
      addShort: "Add",
      addedToCart: "Added!",
      inStock: "Available in cellar",
      outOfStock: "Sold Out",
      viewDetails: "Wine Details",
      temperature: "Serving Temp.",
      alcohol: "Alcohol",
      provenance: "Origin",
      sardinia: "Cilento, Salerno",
      cartTotal: "Total",
      cartItems: "items",
      checkout: "Proceed to Checkout",
      emptyCart: "Your cart is empty",
      searchAction: "Search",
    },
    nav: {
      wines: "Our Wines",
      estate: "The Winery",
      terroir: "The Terroir",
      contact: "Contact",
      cart: "Cart",
      account: "Sign In / Register",
    },
    ageGate: {
      title: "Legal Drinking Age Verification",
      description:
        "To enter the online wine cellar of Cantina de Li Chiai you must be of legal drinking age in your country of residence (at least 18 years old in Italy).",
      confirm: "Yes, I am 18 or older",
      decline: "No, I am under 18",
      rememberMe: "Remember my choice for this session",
      blockedTitle: "Access Restricted to Legal Age",
      blockedDesc:
        "We are sorry, the sale of alcoholic beverages to minors is prohibited by law. You cannot access this online store.",
    },
    hero: {
      badge: "Artisanal Harvest in Cilento National Park",
      title: "The Soul of Cilento between Flysch, Olives and Sea",
      subtitle:
        "From the pristine hills of Cilento National Park in Salerno province, we craft historic vintages shaped by Tyrrhenian sea breezes and ancient soil.",
      ctaCollection: "Explore Collection",
      ctaEstate: "Our Estate",
      estateMetrics: [
        { value: "100%", label: "Hand-picked grapes" },
        { value: "Cilento DOC", label: "Protected Appellations" },
        { value: "UNESCO Park", label: "Cilento National Park" },
      ],
    },
    features: {
      title: "The Values of Cantina de Li Chiai",
      subtitle: "Three pillars of craftsmanship and biodiversity in the heart of Cilento",
      items: [
        {
          title: "Cilento Flysch Terroir",
          description:
            "Alternating sandstone and marl soils impart distinctive salinity, minerality, and remarkable longevity to each vintage.",
        },
        {
          title: "Tyrrhenian Sea Breeze",
          description:
            "Sea winds and the pristine biodiversity of the National Park enhance the vibrant natural aromatics of Fiano and Aglianico.",
        },
        {
          title: "Climate-Controlled Shipping",
          description:
            "Every bottle travels in patented anti-breakage, insulated packaging to ensure pristine cellar quality upon arrival.",
        },
      ],
    },
    promoBanner: {
      badge: "Corporate & Gift Boxes",
      title: "Gift the Excellence of Cilento Wines",
      description:
        "Handcrafted solid wooden gift boxes with Fiano del Cilento DOC and Aglianico Riserva, including a personalized handwritten card from our winemaker.",
      cta: "Explore Gift Sets",
    },
    catalog: {
      eyebrow: "Selected Portfolio",
      title: "Our Cellar in Cilento National Park",
      subtitle:
        "Numbered limited-run vintages honoring the historic native grape varieties of the Salerno province.",
      filterAll: "All Wines",
      filterWhite: "Fiano del Cilento",
      filterRed: "Aglianico & Reds",
      filterRiserva: "Special Reserves",
      noProducts: "No wines found matching this selection.",
      tastingNotesTitle: "Tasting Notes",
    },
    story: {
      eyebrow: "Our Land",
      title: "Vineyards Among Century-Old Olives and the Alburni Peaks",
      quote:
        "“In Cilento, wine is a covenant with nature: one listens to the sea, trusts the hills, and honors the purity of the grape.”",
      p1: "At the heart of Cilento National Park in Salerno province, our vines take root in soils formed by the distinctive Cilento flysch. This mineral matrix imparts unmistakable Mediterranean salinity, freshness, and rare longevity to our vintages.",
      p2: "Each cluster is hand-harvested in the early morning hours, preserving aromatic freshness and indigenous yeast integrity. A low-impact, limited, and truly exclusive artisanal production.",
      badge1: "Cilento Flysch",
      badge1Desc: "Sandstone and marl for vibrant minerality",
      badge2: "UNESCO Park",
      badge2Desc: "Protected World Biosphere Reserve",
      badge3: "Hand Harvested",
      badge3Desc: "Rigorous cluster-by-cluster grape selection",
    },
    social: {
      title: "Follow Us on Social Media",
      subtitle:
        "Share your moments with #CantinaDeLiChiai among glasses, Cilento hills, and Mediterranean terroir",
    },
    newsletter: {
      title: "Stay Connected with the Cellar",
      subtitle:
        "Subscribe to our newsletter to receive vintage releases of Fiano and Aglianico, private tasting invitations, and exclusive allocations.",
      placeholder: "Enter your email address...",
      button: "Subscribe",
      legal: "By subscribing you accept our Privacy Policy. You can unsubscribe at any time.",
    },
    pdp: {
      breadcrumbHome: "Home",
      breadcrumbWines: "Our Wines",
      taxIncluded: "VAT included",
      vintageLabel: "Vintage",
      formatLabel: "Format",
      alcoholLabel: "Alcohol by Vol.",
      tempLabel: "Serving Temperature",
      quantity: "Quantity",
      addToCart: "Add to Cart",
      addedToCart: "Added to Cart!",
      buyNow: "Proceed to Checkout",
      inStock: "Available in cellar",
      inStockNotice: "Bottles stored at controlled temperature and ready for dispatch.",
      guaranteedShipping: "Insulated anti-breakage insured shipping across Europe",
      freeShippingBadge: "Free delivery on orders over €90",
      securePayments: "Encrypted & certified secure checkout",
      tabs: {
        tasting: "Tasting Notes",
        terroir: "Terroir & Flysch",
        pairings: "Cilento Food Pairings",
        technical: "Technical Sheet",
      },
      tastingLabels: {
        visual: "Visual Appearance",
        olfactory: "Aroma Profile",
        gustatory: "Palate & Finish",
      },
      terroirLabels: {
        soil: "Soil Composition",
        altitude: "Vineyard Elevation",
        exposure: "Exposure & Microclimate",
        harvest: "Harvest Method",
        aging: "Cellar Aging",
      },
      technicalLabels: {
        appellation: "Appellation",
        grape: "Grape Varieties",
        glass: "Recommended Glassware",
        potential: "Cellaring Potential",
        sku: "Item SKU",
      },
      pairingsTitle: "Traditional Cilento & Campanian Pairings",
      pairingsSubtitle: "Perfect pairing with delicacies of the Cilento National Park",
      relatedTitle: "From the Same Cilento Cellar",
      relatedSubtitle: "Other signature wines cultivated on our sandstone flysch hills",
      backToCatalog: "← Back to all wines",
      notFoundTitle: "Wine not found",
      notFoundDesc: "The selected vintage is not available or does not exist in our cellar portfolio.",
    },
    footer: {
      description:
        "Cantina de Li Chiai honors the winemaking heritage of Cilento National Park (Salerno), crafting exceptional grapes into pure Mediterranean expressions.",
      locationTitle: "Estate & Cellar",
      locationAddress: "Località Li Chiai, Cilento National Park — Salerno (SA), Campania, Italy",
      contactsTitle: "Customer Care",
      email: "orders@cantinadelichiai.it",
      phone: "+39 089 800000",
      hours: "Mon - Sat: 09:00 - 18:00",
      legalNotice:
        "The sale of alcoholic beverages to minors under 18 is prohibited. Please drink responsibly.",
      copyright: "Cantina de Li Chiai S.r.l. — All rights reserved.",
      privacy: "Privacy Policy",
      terms: "Terms of Sale",
      cookie: "Cookie Policy",
      paymentsTitle: "Secure & Certified Payments",
    },
  },
} as const;

export function getDictionary(locale: Locale = defaultLocale) {
  return dictionaries[locale] || dictionaries.it;
}
