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
  price: number
  currencyCode: string
  sku: string
  alcohol: string
  format: string
  image: string
  images?: string[]
  badge: string
  appellation: string
  details?: WineDetails
}

export interface WineCategory {
  id: string
  name: string
  handle: string
}

interface MedusaRawProduct {
  id: string
  title: string
  handle?: string
  description?: string
  thumbnail?: string
  images?: Array<{ url: string; id?: string }>
  categories?: Array<{ id: string; name: string; handle: string }>
  variants?: Array<{
    sku?: string
    prices?: Array<{ amount?: number }>
    calculated_price?: { amount?: number }
  }>
}

interface MedusaRawCategory {
  id: string
  name: string
  handle?: string
}

const FIANO_DETAILS: WineDetails = {
  vintage: "2023",
  grapes: "100% Fiano del Cilento",
  tastingNotes: {
    visual: "Giallo paglierino luminoso con riflessi verdolini brillanti e vivaci.",
    olfactory:
      "Naso floreale e aristocratico: ginestra in fiore, erbe aromatiche della macchia mediterranea, mela cotogna, pera williams e una caratteristica scia di nocciola tostata tipica del vitigno.",
    gustatory:
      "Teso, fresco e vibrante al palato. Dominato da una mineralità salina scolpita dal flysch arenaceo-argilloso, con un finale lungo, teso e piacevolmente ammandorlato.",
  },
  terroir: {
    soil: "Flysch Cilentano: alternanza geologica di arenarie quarzoso-calcaree e marne argillose ricche di microelementi.",
    altitude: "280 metri s.l.m.",
    exposure: "Ovest / Sud-Ovest, rinfrescata dalle brezze pomeridiane del Mar Tirreno.",
    harvest: "Raccolta manuale al mattino presto in piccole cassette forate con rigorosa selezione dei grappoli.",
    aging: "Fermentazione in acciaio a 14°C e sosta sui lieviti fini per 6 mesi con bâtonnage periodici.",
  },
  technical: {
    serviceTemp: "10 - 12 °C",
    glass: "Calice a tulipano medio per vini bianchi strutturati",
    agingPotential: "5 - 7 anni, con notevole evoluzione minerale e idrocarburica nel tempo",
  },
  pairings: [
    "Mozzarella di Bufala Campana DOP di Paestum e pomodori costoluti",
    "Spaghetti alle Alici di Menaica e profumo di limone cilentano",
    "Risotto ai frutti di mare e crostacei del Golfo di Salerno",
    "Spigola o orata al sale marino con erbe della macchia",
  ],
}

const AGLIANICO_DETAILS: WineDetails = {
  vintage: "2018",
  grapes: "100% Aglianico del Cilento",
  tastingNotes: {
    visual: "Rosso rubino impenetrabile e consistente, con nobili riflessi granato.",
    olfactory:
      "Bouquet maestoso e avvolgente: marasca sotto spirito, mora selvatica, carruba cilentana, tabacco da pipa, pepe nero macinato, cuoio nobile e sottobosco balsamico.",
    gustatory:
      "Imponente, caloroso e aristocratico. La potente trama tannica è fitta e vellutata, sorretta da viva sapidità marina e una persistenza speziata interminabile.",
  },
  terroir: {
    soil: "Flysch Cilentano ad alto contenuto argilloso-calcareo con scheletro lapideo ben drenante.",
    altitude: "350 metri s.l.m.",
    exposure: "Pieno Sud, riparato dalle correnti fredde grazie ai Monti Alburni.",
    harvest: "Manuale a fine ottobre alla perfetta maturazione fenolica dei vinaccioli.",
    aging: "Macerazione di 24 giorni; 18 mesi in botti di rovere francese e 12 mesi di affinamento in bottiglia.",
  },
  technical: {
    serviceTemp: "18 - 20 °C (consigliata stappatura o caraffa un'ora prima del servizio)",
    glass: "Calice gran cru ampio tipo Bordeaux",
    agingPotential: "15 - 20 anni, vino da grandissimo invecchiamento e meditazione",
  },
  pairings: [
    "Fusilli cilentani al ferretto con ragù tradizionale di castrato",
    "Cinghiale in umido con bacche di mirto e ginepro degli Alburni",
    "Caciocavallo Podolico del Cilento stagionato in grotta",
    "Tagliata di manzo con riduzione di Aglianico e rosmarino",
  ],
}

const ROSSO_DETAILS: WineDetails = {
  vintage: "2021",
  grapes: "70% Aglianico, 30% Piedirosso",
  tastingNotes: {
    visual: "Rosso rubino vivido con riflessi violacei luminosi e giovanili.",
    olfactory:
      "Fragrante e coinvolgente: profumi spiccati di ciliegia durona, prugna selvatica, violetta di bosco, macchia mediterranea e una punta di pepe rosa.",
    gustatory:
      "Equilibrato, agile e succoso. La nobile struttura dell'Aglianico si fonde con l'armonia fruttata del Piedirosso, donando tannini levigati e freschezza salina.",
  },
  terroir: {
    soil: "Arenarie flyschoidi a grana media con intercalazioni marnoso-argillose.",
    altitude: "220 metri s.l.m.",
    exposure: "Sud-Est, illuminata dal primo sole del mattino.",
    harvest: "Raccolta manuale a metà ottobre in cassette da 15 kg.",
    aging: "Vinificazione in vasche di cemento termocontrollate e 10 mesi tra botte grande di rovere e bottiglia.",
  },
  technical: {
    serviceTemp: "16 - 18 °C",
    glass: "Calice ballon medio per rossi freschi e profumati",
    agingPotential: "6 - 8 anni, piacevolissimo fin da subito",
  },
  pairings: [
    "Soppressata di Gioi Cilento e formaggi caprini semistagionati",
    "Zuppa cilentana di ceci di Cicerale e castagne",
    "Ravioli di ricotta campana con pomodorini del piennolo e basilico",
    "Pollo ruspante alla cacciatora con olive ammaccate cilentane",
  ],
}

const FALLBACK_CATEGORIES: WineCategory[] = [
  { id: "pcat_bianchi", name: "Vini Bianchi", handle: "vini-bianchi" },
  { id: "pcat_rossi", name: "Vini Rossi", handle: "vini-rossi" },
  { id: "pcat_riserve", name: "Riserve", handle: "riserve" },
]

const FALLBACK_PRODUCTS: WineProduct[] = [
  {
    id: "prod_fiano",
    title: "Fiano del Cilento DOC",
    handle: "fiano-del-cilento-doc",
    description:
      "Vino bianco campano di straordinaria eleganza, sapido, fresco e minerale, prodotto nel cuore del Parco Nazionale del Cilento su terreni da flysch arenaceo-argilloso. Note floreali di ginestra, erbe mediterranee e nocciola tostata.",
    category: "Vini Bianchi",
    categoryHandle: "vini-bianchi",
    price: 18.5,
    currencyCode: "EUR",
    sku: "FIAN-DOC-750",
    alcohol: "13.5% vol.",
    format: "750 ml",
    image: "/images/fiano-cilento.jpg",
    images: [
      "/images/fiano-cilento.jpg",
      "/images/estate-cellar.jpg",
      "/images/hero-vineyard.jpg",
    ],
    badge: "Cilento DOC",
    appellation: "Cilento DOC Fiano",
    details: FIANO_DETAILS,
  },
  {
    id: "prod_aglianico",
    title: "Aglianico del Cilento DOC Riserva",
    handle: "aglianico-del-cilento-doc-riserva",
    description:
      "Il re dei vini rossi campani. Profondo, caldo e avvolgente, con note di marasca matura, spezie fini e carruba, affinato per 18 mesi in botti di rovere. Struttura maestosa, mineralità salina e tannini vellutati.",
    category: "Riserve",
    categoryHandle: "riserve",
    price: 24.0,
    currencyCode: "EUR",
    sku: "AGLI-RIS-750",
    alcohol: "14.5% vol.",
    format: "750 ml",
    image: "/images/aglianico-cilento.jpg",
    images: [
      "/images/aglianico-cilento.jpg",
      "/images/estate-cellar.jpg",
      "/images/hero-vineyard.jpg",
    ],
    badge: "DOC Riserva",
    appellation: "Cilento DOC Aglianico",
    details: AGLIANICO_DETAILS,
  },
  {
    id: "prod_rosso",
    title: "Cilento DOC Rosso - Paestum IGT",
    handle: "cilento-doc-rosso-paestum-igt",
    description:
      "Autentico gioiello della viticoltura salernitana. Blend armonico di Aglianico e Piedirosso con vibranti note balsamiche di macchia cilentana, prugna selvatica, pepe rosa e tannini setosi e persistenti.",
    category: "Vini Rossi",
    categoryHandle: "vini-rossi",
    price: 21.0,
    currencyCode: "EUR",
    sku: "CIL-ROSSO-750",
    alcohol: "14.0% vol.",
    format: "750 ml",
    image: "/images/cilento-rosso.jpg",
    images: [
      "/images/cilento-rosso.jpg",
      "/images/estate-cellar.jpg",
      "/images/hero-vineyard.jpg",
    ],
    badge: "Cilento DOC",
    appellation: "Cilento DOC Rosso",
    details: ROSSO_DETAILS,
  },
]

function getWineMetadata(handle: string) {
  const normalized = handle.toLowerCase()
  if (normalized.includes("fiano") || normalized.includes("bianco")) {
    return {
      image: "/images/fiano-cilento.jpg",
      images: [
        "/images/fiano-cilento.jpg",
        "/images/estate-cellar.jpg",
        "/images/hero-vineyard.jpg",
      ],
      badge: "Cilento DOC",
      alcohol: "13.5% vol.",
      format: "750 ml",
      appellation: "Cilento DOC Fiano",
      category: "Vini Bianchi",
      categoryHandle: "vini-bianchi",
      details: FIANO_DETAILS,
    }
  }
  if (normalized.includes("aglianico") || normalized.includes("riserv")) {
    return {
      image: "/images/aglianico-cilento.jpg",
      images: [
        "/images/aglianico-cilento.jpg",
        "/images/estate-cellar.jpg",
        "/images/hero-vineyard.jpg",
      ],
      badge: "DOC Riserva",
      alcohol: "14.5% vol.",
      format: "750 ml",
      appellation: "Cilento DOC Aglianico",
      category: "Riserve",
      categoryHandle: "riserve",
      details: AGLIANICO_DETAILS,
    }
  }
  return {
    image: "/images/cilento-rosso.jpg",
    images: [
      "/images/cilento-rosso.jpg",
      "/images/estate-cellar.jpg",
      "/images/hero-vineyard.jpg",
    ],
    badge: "Cilento DOC",
    alcohol: "14.0% vol.",
    format: "750 ml",
    appellation: "Cilento DOC Rosso",
    category: "Vini Rossi",
    categoryHandle: "vini-rossi",
    details: ROSSO_DETAILS,
  }
}

export async function getProducts(categoryFilter?: string): Promise<WineProduct[]> {
  const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
  const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

  try {
    const url = new URL(`${backendUrl}/store/products`)
    url.searchParams.set("fields", "*variants,*categories,*variants.prices,*images")

    const res = await fetch(url.toString(), {
      headers: {
        "x-publishable-api-key": publishableKey,
      },
      next: { revalidate: 60 }, // ISR caching: revalidate every 60 seconds
    })

    if (!res.ok) {
      console.warn(`[Storefront] Medusa API returned status ${res.status}. Using fallback wine catalog.`)
      return filterProducts(FALLBACK_PRODUCTS, categoryFilter)
    }

    const data = await res.json()
    if (!data.products || !Array.isArray(data.products) || data.products.length === 0) {
      return filterProducts(FALLBACK_PRODUCTS, categoryFilter)
    }

    const formattedProducts: WineProduct[] = (data.products as MedusaRawProduct[]).map((p) => {
      const meta = getWineMetadata(p.handle || "")
      const firstVariant = p.variants?.[0]
      const priceObj = firstVariant?.prices?.[0] || firstVariant?.calculated_price
      const rawPrice = priceObj?.amount ? Number(priceObj.amount) : 20.0
      const price = rawPrice > 100 ? rawPrice / 100 : rawPrice

      return {
        id: p.id,
        title: p.title,
        handle: p.handle || "",
        description: p.description || "",
        category: p.categories?.[0]?.name || meta.category,
        categoryHandle: p.categories?.[0]?.handle || meta.categoryHandle,
        price: price,
        currencyCode: "EUR",
        sku: firstVariant?.sku || "SKU-750",
        alcohol: meta.alcohol,
        format: meta.format,
        image: p.thumbnail || meta.image,
        images:
          p.images && p.images.length > 0
            ? p.images.map((img) => img.url)
            : meta.images,
        badge: meta.badge,
        appellation: meta.appellation,
        details: meta.details,
      }
    })

    return filterProducts(formattedProducts, categoryFilter)
  } catch (err) {
    console.warn("[Storefront] Could not connect to Medusa backend during fetch. Using fallback catalog.", err)
    return filterProducts(FALLBACK_PRODUCTS, categoryFilter)
  }
}

export async function getProductByHandle(handle: string): Promise<WineProduct | null> {
  if (!handle || typeof handle !== "string") {
    return null
  }

  const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
  const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

  try {
    const url = new URL(`${backendUrl}/store/products`)
    url.searchParams.set("handle", handle)
    url.searchParams.set("fields", "*variants,*categories,*variants.prices,*images")

    const res = await fetch(url.toString(), {
      headers: {
        "x-publishable-api-key": publishableKey,
      },
      next: { revalidate: 60 }, // ISR caching: revalidate every 60s
    })

    if (res.ok) {
      const data = await res.json()
      if (data.products && Array.isArray(data.products) && data.products.length > 0) {
        const p: MedusaRawProduct = data.products[0]
        const meta = getWineMetadata(p.handle || handle)
        const firstVariant = p.variants?.[0]
        const priceObj = firstVariant?.prices?.[0] || firstVariant?.calculated_price
        const rawPrice = priceObj?.amount ? Number(priceObj.amount) : 20.0
        const price = rawPrice > 100 ? rawPrice / 100 : rawPrice

        return {
          id: p.id,
          title: p.title,
          handle: p.handle || handle,
          description: p.description || "",
          category: p.categories?.[0]?.name || meta.category,
          categoryHandle: p.categories?.[0]?.handle || meta.categoryHandle,
          price: price,
          currencyCode: "EUR",
          sku: firstVariant?.sku || "SKU-750",
          alcohol: meta.alcohol,
          format: meta.format,
          image: p.thumbnail || meta.image,
          images:
            p.images && p.images.length > 0
              ? p.images.map((img) => img.url)
              : meta.images,
          badge: meta.badge,
          appellation: meta.appellation,
          details: meta.details,
        }
      }
    }
  } catch {
    // Backend unreachable, fallback below
  }

  // Fallback lookup
  const normalized = handle.toLowerCase()
  const fallback =
    FALLBACK_PRODUCTS.find((p) => p.handle === normalized) ||
    FALLBACK_PRODUCTS.find((p) => p.handle.includes(normalized) || normalized.includes(p.handle))

  return fallback || null
}

export async function getRelatedProducts(currentHandle: string): Promise<WineProduct[]> {
  const all = await getProducts()
  return all.filter((p) => p.handle !== currentHandle).slice(0, 3)
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
      return FALLBACK_CATEGORIES
    }

    const data = await res.json()
    if (data.product_categories && Array.isArray(data.product_categories)) {
      return (data.product_categories as MedusaRawCategory[]).map((c) => ({
        id: c.id,
        name: c.name,
        handle: c.handle || c.name.toLowerCase().replace(/\s+/g, "-"),
      }))
    }
    return FALLBACK_CATEGORIES
  } catch {
    return FALLBACK_CATEGORIES
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
