import { z } from "zod"

export interface WineDetails {
  vintage: string
  grapes: string
  tastingNotes: {
    visual: string
    olfactory: string
    gustatory: string
  }
  terroir: {
    soil: string
    altitude: string
    exposure: string
    harvest: string
    aging: string
  }
  technical: {
    serviceTemp: string
    glass: string
    agingPotential: string
  }
  pairings: string[]
}

export interface WineProduct {
  id: string
  title: string
  handle: string
  description: string
  category: string
  categoryHandle: string
  /** Final price for the Italy region, IVA included, in major units (EUR). */
  price: number
  /** Medusa variant id: needed to add the product to a cart. */
  variantId: string
  unitPrice?: string
  currencyCode: string
  sku: string
  alcohol?: string
  format: string
  image: string
  images?: string[]
  badge: string
  appellation: string
  left?: number
  details?: WineDetails
}

export interface WineCategory {
  id: string
  name: string
  handle: string
}

/**
 * Result of a catalog read. "unavailable" means the Medusa backend could not be
 * reached or answered with an error: pages must show the "catalog unavailable"
 * state instead of inventing products or prices.
 */
export type CatalogResult =
  | { status: "ok"; products: WineProduct[] }
  | { status: "unavailable" }

export type ProductResult =
  | { status: "ok"; product: WineProduct }
  | { status: "not_found" }
  | { status: "unavailable" }

// The storefront sells to Italy only (EUR, 22% IVA). The Medusa region is looked up
// by country at runtime because its id is generated and changes with every DB reset.
const STORE_COUNTRY_CODE = "it"

// ─── Medusa Store API response schemas (validated at the boundary) ───────────
// Medusa v2 stores and returns amounts in major units (9 = €9), never in cents.
const calculatedPriceSchema = z.object({
  calculated_amount: z.number().nullish(),
  calculated_amount_with_tax: z.number().nullish(),
  is_calculated_price_tax_inclusive: z.boolean().nullish(),
  currency_code: z.string().nullish(),
})

const rawVariantSchema = z.object({
  id: z.string(),
  sku: z.string().nullish(),
  calculated_price: calculatedPriceSchema.nullish(),
})

const rawProductSchema = z.object({
  id: z.string(),
  title: z.string().nullish(),
  handle: z.string().nullish(),
  description: z.string().nullish(),
  thumbnail: z.string().nullish(),
  images: z.array(z.object({ url: z.string() })).nullish(),
  categories: z
    .array(z.object({ id: z.string(), name: z.string(), handle: z.string().nullish() }))
    .nullish(),
  variants: z.array(rawVariantSchema).nullish(),
})

const productListResponseSchema = z.object({
  products: z.array(rawProductSchema),
})

const regionListResponseSchema = z.object({
  regions: z.array(
    z.object({
      id: z.string(),
      countries: z.array(z.object({ iso_2: z.string().nullish() })).nullish(),
    })
  ),
})

type MedusaRawProduct = z.infer<typeof rawProductSchema>
type MedusaRawVariant = z.infer<typeof rawVariantSchema>

interface MedusaRawCategory {
  id: string
  name: string
  handle?: string
}

const CHIAI_BIANCO_DETAILS: WineDetails = {
  vintage: "2024",
  grapes: "Fiano & vitigni bianchi storici cilentani",
  tastingNotes: {
    visual: "Giallo paglierino luminoso con riflessi verdolini brillanti e vivaci.",
    olfactory:
      "Naso floreale e fresco: ginestra, erbe aromatiche della macchia mediterranea, mela cotogna e agrumi cilentani.",
    gustatory:
      "Secco, leggero e vibrante al palato. Dominato dalla fresca sapidità marina e una piacevole beva dissetante.",
  },
  terroir: {
    soil: "Flysch Cilentano: arenarie quarzoso-calcaree e marne argillose di Contrada Pozzo.",
    altitude: "280 metri s.l.m.",
    exposure: "Ovest / Sud-Ovest, rinfrescata dalle brezze del Mar Tirreno.",
    harvest: "Raccolta manuale in cassette con selezione dei grappoli sui pendii di Abatemarco.",
    aging: "Fermentazione e sosta in acciaio a temperatura controllata per preservare la freschezza primaria.",
  },
  technical: {
    serviceTemp: "8 - 10 °C",
    glass: "Calice a tulipano per bianchi freschi",
    agingPotential: "2 - 3 anni, da bere giovane e fragrante",
  },
  pairings: [
    "Piccolo tagliere della cantina con formaggi caprini freschi",
    "Alici di Menaica marinate e fritture di paranza",
    "Mozzarella di bufala e pomodori dell'orto",
    "Aperitivo tra amici al banco della cantina",
  ],
}

const ROSSO_VECCHIO_DETAILS: WineDetails = {
  vintage: "2021",
  grapes: "100% Aglianico del Cilento",
  tastingNotes: {
    visual: "Rosso rubino impenetrabile con caldi riflessi granato.",
    olfactory:
      "Bouquet avvolgente: marasca matura, mora selvatica, carruba, tabacco da pipa e macchia mediterranea.",
    gustatory:
      "Corposo, austero e profondo. È rimasto a lungo in botte: tannini levigati dal tempo e lunghissima persistenza.",
  },
  terroir: {
    soil: "Flysch Cilentano ad alto tenore argilloso di Contrada Pozzo, Abatemarco.",
    altitude: "320 metri s.l.m.",
    exposure: "Pieno Sud, riparato dalle correnti fredde.",
    harvest: "Raccolta manuale a fine ottobre a piena maturazione fenolica.",
    aging: "Lungo affinamento in botte di rovere e riposo nelle cantine sotterranee in pietra.",
  },
  technical: {
    serviceTemp: "18 - 20 °C (consigliata stappatura mezz'ora prima)",
    glass: "Calice ampio da grandi rossi strutturati",
    agingPotential: "10 - 15 anni",
  },
  pairings: [
    "Spezzatino o bistecca di cinghiale ai ferri",
    "Fusilli al ferretto con ragù di castrato",
    "Soppressata di cinghiale della nostra salumeria",
    "Caciocavallo podolico stagionato",
  ],
}

const CHIAI_ROSSO_DETAILS: WineDetails = {
  vintage: "2023",
  grapes: "Aglianico & vitigni tradizionali di famiglia",
  tastingNotes: {
    visual: "Rosso rubino vivido con riflessi violacei luminosi.",
    olfactory:
      "Fragrante e genuino: ciliegia fresca, prugna selvatica, violetta e spezie dolci della macchia.",
    gustatory:
      "Il nostro rosso di tutti i giorni, quello che beviamo anche noi a cena. Schietto, armonico e beverino.",
  },
  terroir: {
    soil: "Arenarie e marne di Abatemarco (SA).",
    altitude: "250 metri s.l.m.",
    exposure: "Sud-Est, baciata dal sole mattutino.",
    harvest: "Raccolta manuale in cassette da 15 kg all'alba.",
    aging: "Vinificazione artigianale tradizionale e riposo in cantina.",
  },
  technical: {
    serviceTemp: "16 - 18 °C",
    glass: "Calice medio per vini rossi quotidiani",
    agingPotential: "4 - 5 anni",
  },
  pairings: [
    "Salsiccia dolce o piccante della nostra cantina",
    "Pane cotto a legna e soppressata casereccia",
    "Pasta e fagioli della tradizione cilentana",
    "Carni alla griglia e cene conviviali di famiglia",
  ],
}

export const DEFAULT_CATEGORIES: WineCategory[] = [
  { id: "cat_vini", name: "Vini", handle: "vini" },
  { id: "cat_insaccati", name: "Insaccati", handle: "insaccati" },
  { id: "cat_carne", name: "Carne fresca", handle: "carne" },
  { id: "cat_olio", name: "Olio EVO", handle: "olio" },
]

// Local editorial metadata (tasting notes, terroir, images, badges) keyed by handle.
// It enriches real Medusa products via getWineMetadata(); it is never shown as a
// product on its own, and its `price`/`id` values are not used.
export const FALLBACK_PRODUCTS: Omit<WineProduct, "variantId">[] = [
  // --- VINI ---
  {
    id: "v1",
    title: "Chiai Rosso",
    handle: "chiai-rosso",
    description:
      "Il nostro rosso di tutti i giorni, quello che beviamo anche noi a cena. Va bene con tutto. Prodotto con le uve della nostra vigna di Abatemarco.",
    category: "Vini",
    categoryHandle: "vini",
    price: 9.0,
    currencyCode: "EUR",
    sku: "CHIAI-ROSSO-750",
    alcohol: "13.5% vol.",
    format: "Bottiglia 75 cl",
    image: "/images/cilento-rosso.jpg",
    images: [
      "/images/cilento-rosso.jpg",
      "/images/products/chiai-rosso.png",
      "/images/Rosso.jpeg",
      "/images/raccolta.jpeg",
    ],
    badge: "Il Nostro Rosso",
    appellation: "Vino Rosso · Annata 2023",
    left: 24,
    details: CHIAI_ROSSO_DETAILS,
  },
  {
    id: "v2",
    title: "Rosso Vecchio",
    handle: "rosso-vecchio",
    description:
      "È rimasto in botte più a lungo, per chi ha pazienza. Più corposo, da bere con un buon secondo. Ideale con i piatti robusti della cucina cilentana.",
    category: "Vini",
    categoryHandle: "vini",
    price: 15.0,
    currencyCode: "EUR",
    sku: "ROSSO-VECCHIO-750",
    alcohol: "14.5% vol.",
    format: "Bottiglia 75 cl",
    image: "/images/aglianico-cilento.jpg",
    images: [
      "/images/aglianico-cilento.jpg",
      "/images/products/rosso-vecchio.png",
      "/images/VecchiaBottiglia.jpeg",
      "/images/prodotto.jpeg",
    ],
    badge: "Invecchiato in Botte",
    appellation: "Vino Rosso · Annata 2021",
    left: 10,
    details: ROSSO_VECCHIO_DETAILS,
  },
  {
    id: "v3",
    title: "Chiai Bianco",
    handle: "chiai-bianco",
    description:
      "Secco e leggero, come piace a noi in questa zona. Perfetto per l'estate, l'aperitivo o il pesce fresco della costa cilentana.",
    category: "Vini",
    categoryHandle: "vini",
    price: 8.0,
    currencyCode: "EUR",
    sku: "CHIAI-BIANCO-750",
    alcohol: "12.5% vol.",
    format: "Bottiglia 75 cl",
    image: "/images/fiano-cilento.jpg",
    images: [
      "/images/fiano-cilento.jpg",
      "/images/products/chiai-bianco.png",
      "/images/Bianco.jpeg",
      "/images/lavorazione.jpeg",
    ],
    badge: "Fresco & Secco",
    appellation: "Vino Bianco · Annata 2024",
    left: 18,
    details: CHIAI_BIANCO_DETAILS,
  },
  {
    id: "v4",
    title: "Bianco Dolce",
    handle: "bianco-dolce",
    description:
      "Il nostro bianco più morbido, quello che piace a chi non ama i vini troppo secchi. Profumato e vellutato.",
    category: "Vini",
    categoryHandle: "vini",
    price: 10.0,
    currencyCode: "EUR",
    sku: "BIANCO-DOLCE-750",
    alcohol: "12.0% vol.",
    format: "Bottiglia 75 cl",
    image: "/images/fiano-cilento.jpg",
    images: [
      "/images/fiano-cilento.jpg",
      "/images/products/bianco-dolce.png",
      "/images/Bianco.jpeg",
    ],
    badge: "Morbido & Fruttato",
    appellation: "Vino Bianco Dolce · Annata 2024",
    left: 12,
    details: CHIAI_BIANCO_DETAILS,
  },

  // --- INSACCATI ---
  {
    id: "i1",
    title: "Salsiccia Dolce",
    handle: "salsiccia-dolce",
    description:
      "Fatta in casa con la ricetta di sempre, senza piccante. Buona anche appena tagliata. Salume artigianale cilentano stagionato lentamente.",
    category: "Insaccati",
    categoryHandle: "insaccati",
    price: 7.0,
    unitPrice: "17,50 €/kg",
    currencyCode: "EUR",
    sku: "SALS-DOLCE-400",
    format: "Pezzo ~ 400 g",
    image: "/images/insaccati-cilento.jpg",
    images: ["/images/insaccati-cilento.jpg", "/images/products/salsiccia-dolce.png"],
    badge: "Ricetta Tradizionale",
    appellation: "Salumeria Artigianale",
    left: 8,
  },
  {
    id: "i2",
    title: "Salsiccia Piccante",
    handle: "salsiccia-piccante",
    description:
      "Stessa lavorazione della dolce, ma con un po' di peperoncino in più per chi lo ama forte. Tagliata a fette spesse col nostro pane casereccio.",
    category: "Insaccati",
    categoryHandle: "insaccati",
    price: 7.0,
    unitPrice: "17,50 €/kg",
    currencyCode: "EUR",
    sku: "SALS-PICC-400",
    format: "Pezzo ~ 400 g",
    image: "/images/insaccati-cilento.jpg",
    images: ["/images/insaccati-cilento.jpg", "/images/products/salsiccia-piccante.png"],
    badge: "Al Peperoncino",
    appellation: "Salumeria Artigianale",
    left: 8,
  },
  {
    id: "i3",
    title: "Salsiccia di Cinghiale",
    handle: "salsiccia-di-cinghiale",
    description:
      "Con carne di cinghiale nostrano dei boschi del Cilento, un sapore più deciso, rustico e selvatico. Da provare con Chiai Rosso.",
    category: "Insaccati",
    categoryHandle: "insaccati",
    price: 10.0,
    unitPrice: "25,00 €/kg",
    currencyCode: "EUR",
    sku: "SALS-CINGH-400",
    format: "Pezzo ~ 400 g",
    image: "/images/insaccati-cilento.jpg",
    images: ["/images/insaccati-cilento.jpg", "/images/products/salsiccia-cinghiale.png"],
    badge: "Cinghiale Nostrano",
    appellation: "Specialità Salumiera",
    left: 6,
  },
  {
    id: "i4",
    title: "Soppressata Dolce",
    handle: "soppressata-dolce",
    description:
      "Stagionata con calma in cantina, come facevano i nostri nonni. Dolce, compatta e delicata, con tagli magri scelti a mano.",
    category: "Insaccati",
    categoryHandle: "insaccati",
    price: 11.0,
    unitPrice: "22,00 €/kg",
    currencyCode: "EUR",
    sku: "SOPP-DOLCE-500",
    format: "Pezzo ~ 500 g",
    image: "/images/insaccati-cilento.jpg",
    images: ["/images/insaccati-cilento.jpg", "/images/products/soppressata-dolce.png"],
    badge: "Stagionata in Cantina",
    appellation: "Salumeria Storica",
    left: 6,
  },
  {
    id: "i5",
    title: "Soppressata di Cinghiale",
    handle: "soppressata-di-cinghiale",
    description:
      "La stessa lavorazione antica della soppressata, ma con carne di cinghiale. Da tagliare fine a coltello e gustare con calma.",
    category: "Insaccati",
    categoryHandle: "insaccati",
    price: 13.0,
    unitPrice: "26,00 €/kg",
    currencyCode: "EUR",
    sku: "SOPP-CINGH-500",
    format: "Pezzo ~ 500 g",
    image: "/images/insaccati-cilento.jpg",
    images: ["/images/insaccati-cilento.jpg", "/images/products/soppressata-cinghiale.png"],
    badge: "Selezione Pregiata",
    appellation: "Specialità Salumiera",
    left: 5,
  },

  // --- CARNE FRESCA ---
  {
    id: "c1",
    title: "Misto Cinghiale",
    handle: "misto-cinghiale",
    description:
      "Un assortimento di tagli misti di cinghiale fresco, così puoi provarli e scegliere quello che ti piace di più. Fresco e pronto per la cottura.",
    category: "Carne fresca",
    categoryHandle: "carne",
    price: 18.0,
    unitPrice: "18,00 €/kg",
    currencyCode: "EUR",
    sku: "CARNE-MIST-1000",
    format: "Confezione ~ 1 kg",
    image: "/images/products/misto-cinghiale.png",
    images: ["/images/products/misto-cinghiale.png"],
    badge: "Carne Fresca",
    appellation: "Su Ordinazione",
    left: 5,
  },
  {
    id: "c2",
    title: "Salsicce di Cinghiale Fresche",
    handle: "salsicce-di-cinghiale-fresche",
    description:
      "Fresche, da cuocere in padella o alla griglia. Il sapore autentico del cinghiale cilentano senza troppi fronzoli.",
    category: "Carne fresca",
    categoryHandle: "carne",
    price: 8.0,
    unitPrice: "16,00 €/kg",
    currencyCode: "EUR",
    sku: "CARNE-SALS-500",
    format: "Confezione ~ 500 g",
    image: "/images/products/salsicce-cinghiale.png",
    images: ["/images/products/salsicce-cinghiale.png"],
    badge: "Da Griglia o Padella",
    appellation: "Su Ordinazione",
    left: 6,
  },
  {
    id: "c3",
    title: "Bistecche di Cinghiale",
    handle: "bistecche-di-cinghiale",
    description:
      "Tagliate come piace a noi, pronte per la griglia rovente. Bastano sale grosso e un filo del nostro olio extravergine.",
    category: "Carne fresca",
    categoryHandle: "carne",
    price: 15.0,
    unitPrice: "25,00 €/kg",
    currencyCode: "EUR",
    sku: "CARNE-BIST-600",
    format: "Confezione ~ 600 g",
    image: "/images/products/bistecche-cinghiale.png",
    images: ["/images/products/bistecche-cinghiale.png"],
    badge: "Pronte per la Griglia",
    appellation: "Su Ordinazione",
    left: 4,
  },

  // --- OLIO EXTRAVERGINE ---
  {
    id: "o1",
    title: "Olio Extravergine 75 cl",
    handle: "olio-extravergine-bottiglia",
    description:
      "Le nostre olive degli alberi di Abatemarco, spremute a freddo. Quello che usiamo ogni giorno in casa per condire e cucinare.",
    category: "Olio EVO",
    categoryHandle: "olio",
    price: 12.0,
    unitPrice: "16,00 €/l",
    currencyCode: "EUR",
    sku: "OLIO-EVO-750",
    format: "Bottiglia 75 cl",
    image: "/images/olio-cilento.jpg",
    images: ["/images/olio-cilento.jpg", "/images/products/olio-bottiglia.png"],
    badge: "Spremuto a Freddo",
    appellation: "Olio Extravergine di Oliva",
    left: 20,
  },
  {
    id: "o2",
    title: "Olio Extravergine Latta 3L",
    handle: "olio-extravergine-latta-3l",
    description:
      "Stesso olio della bottiglia, spremuto a freddo, in formato più grande per chi ne consuma tanto in famiglia.",
    category: "Olio EVO",
    categoryHandle: "olio",
    price: 34.0,
    unitPrice: "11,33 €/l",
    currencyCode: "EUR",
    sku: "OLIO-EVO-3000",
    format: "Latta da 3 Litri",
    image: "/images/olio-cilento.jpg",
    images: ["/images/olio-cilento.jpg", "/images/products/olio-latta.png"],
    badge: "Scorta Famiglia",
    appellation: "Olio Extravergine di Oliva",
    left: 9,
  },
]

function getWineMetadata(handle: string) {
  const normalized = handle.toLowerCase()
  const exact = FALLBACK_PRODUCTS.find((p) => p.handle === normalized || p.handle.includes(normalized) || normalized.includes(p.handle))
  if (exact) {
    return {
      title: exact.title,
      handle: exact.handle,
      description: exact.description,
      image: exact.image,
      images: exact.images || [exact.image],
      badge: exact.badge,
      alcohol: exact.alcohol,
      format: exact.format,
      appellation: exact.appellation,
      category: exact.category,
      categoryHandle: exact.categoryHandle,
      unitPrice: exact.unitPrice,
      left: exact.left,
      details: exact.details,
      sku: exact.sku,
    }
  }

  if (normalized.includes("olio")) {
    const isLatta = normalized.includes("latta") || normalized.includes("3l")
    return {
      image: "/images/olio-cilento.jpg",
      images: [
        "/images/olio-cilento.jpg",
        isLatta
          ? "/images/products/olio-latta.png"
          : "/images/products/olio-bottiglia.png",
      ],
      badge: isLatta ? "Scorta Famiglia" : "Spremuto a Freddo",
      format: isLatta ? "Latta da 3 Litri" : "Bottiglia 75 cl",
      appellation: "Olio Extravergine di Oliva",
      category: "Olio EVO",
      categoryHandle: "olio",
    }
  }

  if (
    normalized.includes("carne") ||
    normalized.includes("misto") ||
    normalized.includes("bistecche") ||
    normalized.includes("cinghiale-fresche")
  ) {
    let img = "/images/products/misto-cinghiale.png"
    if (normalized.includes("bistecche")) img = "/images/products/bistecche-cinghiale.png"
    if (normalized.includes("salsicce")) img = "/images/products/salsicce-cinghiale.png"
    return {
      image: img,
      images: [img],
      badge: "Carne Fresca",
      format: "Confezione sottovuoto",
      appellation: "Su Ordinazione",
      category: "Carne fresca",
      categoryHandle: "carne",
    }
  }

  if (normalized.includes("salsiccia") || normalized.includes("soppressata")) {
    let img = "/images/products/salsiccia-dolce.png"
    if (normalized.includes("piccante")) img = "/images/products/salsiccia-piccante.png"
    if (normalized.includes("soppressata") && normalized.includes("cinghiale"))
      img = "/images/products/soppressata-cinghiale.png"
    else if (normalized.includes("soppressata"))
      img = "/images/products/soppressata-dolce.png"
    else if (normalized.includes("cinghiale"))
      img = "/images/products/salsiccia-cinghiale.png"

    return {
      image: "/images/insaccati-cilento.jpg",
      images: ["/images/insaccati-cilento.jpg", img],
      badge: "Fatta in Casa",
      format: "Pezzo intero",
      appellation: "Salumeria Artigianale",
      category: "Insaccati",
      categoryHandle: "insaccati",
    }
  }

  if (normalized.includes("bianco")) {
    const isDolce = normalized.includes("dolce")
    return {
      image: "/images/fiano-cilento.jpg",
      images: [
        "/images/fiano-cilento.jpg",
        isDolce
          ? "/images/products/bianco-dolce.png"
          : "/images/products/chiai-bianco.png",
        "/images/Bianco.jpeg",
      ],
      badge: isDolce ? "Morbido & Fruttato" : "Fresco & Secco",
      alcohol: isDolce ? "12.0% vol." : "12.5% vol.",
      format: "75 cl",
      appellation: isDolce ? "Vino Bianco Dolce · 2024" : "Vino Bianco · 2024",
      category: "Vini",
      categoryHandle: "vini",
      details: CHIAI_BIANCO_DETAILS,
    }
  }

  if (normalized.includes("vecchio") || normalized.includes("riserv")) {
    return {
      image: "/images/aglianico-cilento.jpg",
      images: [
        "/images/aglianico-cilento.jpg",
        "/images/products/rosso-vecchio.png",
        "/images/VecchiaBottiglia.jpeg",
        "/images/prodotto.jpeg",
      ],
      badge: "Invecchiato in Botte",
      alcohol: "14.5% vol.",
      format: "75 cl",
      appellation: "Vino Rosso · 2021",
      category: "Vini",
      categoryHandle: "vini",
      details: ROSSO_VECCHIO_DETAILS,
    }
  }

  return {
    image: "/images/cilento-rosso.jpg",
    images: [
      "/images/cilento-rosso.jpg",
      "/images/products/chiai-rosso.png",
      "/images/Rosso.jpeg",
      "/images/raccolta.jpeg",
    ],
    badge: "Il Nostro Rosso",
    alcohol: "13.5% vol.",
    format: "75 cl",
    appellation: "Vino Rosso · 2023",
    category: "Vini",
    categoryHandle: "vini",
    details: CHIAI_ROSSO_DETAILS,
  }
}

// Sardinian template leftovers that may still exist in an old database.
const LEGACY_OBSOLETE_HANDLES = new Set([
  "fiano-del-cilento-doc",
  "cilento-doc-rosso-paestum-igt",
  "aglianico-del-cilento-doc-riserva",
  "vermentino-di-gallura-docg-superiore",
  "cannonau-di-sardegna-doc-riserva",
  "cagnulari-isola-dei-nuraghi-igt",
])

// `*variants.calculated_price` makes Medusa price each variant for the given
// region_id + country_code (price lists, promotions and taxes included).
const PRODUCT_FIELDS = "*variants,*variants.calculated_price,*categories,*images"

/**
 * GET a Store API path and validate the JSON body with `schema`.
 * Returns null on network errors, non-2xx statuses or an unexpected shape,
 * so callers can report the catalog as unavailable.
 */
async function fetchStore<T>(
  path: string,
  params: Record<string, string>,
  revalidate: number,
  schema: z.ZodType<T>
): Promise<T | null> {
  const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
  const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

  try {
    const url = new URL(`${backendUrl}${path}`)
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value)
    }

    const res = await fetch(url.toString(), {
      headers: {
        "x-publishable-api-key": publishableKey,
      },
      next: { revalidate }, // ISR caching
    })

    if (!res.ok) {
      console.warn(`[Storefront] Medusa ${path} returned status ${res.status}.`)
      return null
    }

    const parsed = schema.safeParse(await res.json())
    if (!parsed.success) {
      console.warn(`[Storefront] Unexpected Medusa ${path} response shape:\n${z.prettifyError(parsed.error)}`)
      return null
    }
    return parsed.data
  } catch (err) {
    console.warn(`[Storefront] Could not reach the Medusa backend (${path}).`, err)
    return null
  }
}

/** Id of the Medusa region that sells to STORE_COUNTRY_CODE, or null if unavailable. */
async function getStoreRegionId(): Promise<string | null> {
  const data = await fetchStore(
    "/store/regions",
    { fields: "id,*countries", limit: "50" },
    3600, // regions almost never change
    regionListResponseSchema
  )
  if (!data) {
    return null
  }

  const region = data.regions.find((r) =>
    r.countries?.some((c) => c.iso_2?.toLowerCase() === STORE_COUNTRY_CODE)
  )
  if (!region) {
    console.warn(`[Storefront] No Medusa region contains country "${STORE_COUNTRY_CODE}".`)
    return null
  }
  return region.id
}

/**
 * Final consumer price of a variant (IVA included), or null when the variant has
 * no usable price for the region. Never guesses: no cents heuristic, no default.
 */
function getFinalPrice(
  variant: MedusaRawVariant | undefined
): { amount: number; currencyCode: string } | null {
  const calculated = variant?.calculated_price
  if (!calculated) {
    return null
  }

  const amount =
    calculated.calculated_amount_with_tax ??
    (calculated.is_calculated_price_tax_inclusive ? calculated.calculated_amount : null)

  if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
    return null
  }
  return { amount, currencyCode: (calculated.currency_code || "eur").toUpperCase() }
}

/** Maps a Medusa product to a WineProduct, or null when it cannot be sold in the region. */
function toWineProduct(p: MedusaRawProduct): WineProduct | null {
  const variant = p.variants?.[0]
  const price = getFinalPrice(variant)

  if (!variant || !price) {
    console.warn(
      `[Storefront] Product "${p.handle || p.id}" has no price for country "${STORE_COUNTRY_CODE}": hidden from the catalog.`
    )
    return null
  }

  const meta = getWineMetadata(p.handle || "")

  return {
    id: p.id,
    title: p.title || meta.title || "Prodotto Cantina de Li Chiai",
    handle: p.handle || meta.handle || "prodotto",
    description: p.description || meta.description || "",
    category: p.categories?.[0]?.name || meta.category,
    categoryHandle: p.categories?.[0]?.handle || meta.categoryHandle,
    price: price.amount,
    variantId: variant.id,
    unitPrice: meta.unitPrice,
    currencyCode: price.currencyCode,
    sku: variant.sku || meta.sku || "SKU-750",
    alcohol: meta.alcohol,
    format: meta.format,
    image: p.thumbnail || meta.image,
    images:
      p.images && p.images.length > 0
        ? p.images.map((img) => img.url)
        : meta.images,
    badge: meta.badge,
    appellation: meta.appellation,
    left: meta.left,
    details: meta.details,
  }
}

export async function getProducts(categoryFilter?: string): Promise<CatalogResult> {
  const regionId = await getStoreRegionId()
  if (!regionId) {
    return { status: "unavailable" }
  }

  const data = await fetchStore(
    "/store/products",
    {
      fields: PRODUCT_FIELDS,
      region_id: regionId,
      country_code: STORE_COUNTRY_CODE,
      limit: "100",
    },
    30, // ISR: revalidate every 30 seconds
    productListResponseSchema
  )
  if (!data) {
    return { status: "unavailable" }
  }

  const products = data.products
    .filter((p) => !LEGACY_OBSOLETE_HANDLES.has(p.handle || ""))
    .map(toWineProduct)
    .filter((p): p is WineProduct => p !== null)

  return { status: "ok", products: filterProducts(products, categoryFilter) }
}

export async function getProductByHandle(handle: string): Promise<ProductResult> {
  if (!handle || typeof handle !== "string") {
    return { status: "not_found" }
  }

  const regionId = await getStoreRegionId()
  if (!regionId) {
    return { status: "unavailable" }
  }

  const data = await fetchStore(
    "/store/products",
    {
      handle,
      fields: PRODUCT_FIELDS,
      region_id: regionId,
      country_code: STORE_COUNTRY_CODE,
      limit: "1",
    },
    60, // ISR: revalidate every 60 seconds
    productListResponseSchema
  )
  if (!data) {
    return { status: "unavailable" }
  }

  const raw = data.products[0]
  const product = raw ? toWineProduct(raw) : null
  return product ? { status: "ok", product } : { status: "not_found" }
}

export async function getRelatedProducts(currentHandle: string): Promise<WineProduct[]> {
  const result = await getProducts()
  if (result.status !== "ok") {
    return []
  }
  return result.products.filter((p) => p.handle !== currentHandle).slice(0, 3)
}

export async function getCategories(): Promise<WineCategory[]> {
  const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
  const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

  try {
    const res = await fetch(`${backendUrl}/store/product-categories`, {
      headers: {
        "x-publishable-api-key": publishableKey,
      },
      next: { revalidate: 300 }, // ISR 5 min
    })

    if (!res.ok) {
      return DEFAULT_CATEGORIES
    }

    const data = await res.json()
    if (data.product_categories && Array.isArray(data.product_categories) && data.product_categories.length > 0) {
      const medusaCats = (data.product_categories as MedusaRawCategory[]).map((c) => ({
        id: c.id,
        name: c.name,
        handle: c.handle || c.name.toLowerCase().replace(/\s+/g, "-"),
      }))
      const handles = new Set(medusaCats.map((c) => c.handle))
      const extraDefaults = DEFAULT_CATEGORIES.filter((c) => !handles.has(c.handle))
      return [...medusaCats, ...extraDefaults]
    }
    return DEFAULT_CATEGORIES
  } catch {
    return DEFAULT_CATEGORIES
  }
}

function filterProducts(products: WineProduct[], categoryFilter?: string): WineProduct[] {
  if (!categoryFilter || categoryFilter === "all") {
    return products
  }
  return products.filter(
    (p) =>
      p.categoryHandle === categoryFilter ||
      p.category.toLowerCase().includes(categoryFilter.toLowerCase())
  )
}
