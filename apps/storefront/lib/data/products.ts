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
  badge: string
  appellation: string
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
    badge: "Cilento DOC",
    appellation: "Cilento DOC Fiano",
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
    badge: "DOC Riserva",
    appellation: "Cilento DOC Aglianico",
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
    badge: "Cilento DOC",
    appellation: "Cilento DOC Rosso",
  },
]

function getWineMetadata(handle: string) {
  if (handle.includes("fiano") || handle.includes("bianco")) {
    return {
      image: "/images/fiano-cilento.jpg",
      badge: "Cilento DOC",
      alcohol: "13.5% vol.",
      format: "750 ml",
      appellation: "Cilento DOC Fiano",
      category: "Vini Bianchi",
      categoryHandle: "vini-bianchi",
    }
  }
  if (handle.includes("aglianico") || handle.includes("riserv")) {
    return {
      image: "/images/aglianico-cilento.jpg",
      badge: "DOC Riserva",
      alcohol: "14.5% vol.",
      format: "750 ml",
      appellation: "Cilento DOC Aglianico",
      category: "Riserve",
      categoryHandle: "riserve",
    }
  }
  return {
    image: "/images/cilento-rosso.jpg",
    badge: "Cilento DOC",
    alcohol: "14.0% vol.",
    format: "750 ml",
    appellation: "Cilento DOC Rosso",
    category: "Vini Rossi",
    categoryHandle: "vini-rossi",
  }
}

export async function getProducts(categoryFilter?: string): Promise<WineProduct[]> {
  const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
  const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

  try {
    const url = new URL(`${backendUrl}/store/products`)
    url.searchParams.set("fields", "*variants,*categories,*variants.prices")

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
      const price = rawPrice > 100 ? rawPrice / 100 : rawPrice // handle cents if present

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
        badge: meta.badge,
        appellation: meta.appellation,
      }
    })

    return filterProducts(formattedProducts, categoryFilter)
  } catch (err) {
    console.warn("[Storefront] Could not connect to Medusa backend during fetch. Using fallback catalog.", err)
    return filterProducts(FALLBACK_PRODUCTS, categoryFilter)
  }
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
