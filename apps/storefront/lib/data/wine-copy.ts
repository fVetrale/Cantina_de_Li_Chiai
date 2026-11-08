import type { Locale } from "@/lib/i18n"
import type { WineProduct } from "@/lib/data/products"

/**
 * English editorial copy of the wines (ADR 049). Server-side only: pages localize the products
 * before passing them to components, so this text never ships in a client bundle.
 *
 * The Italian copy lives in Medusa (description) and in the local metadata of
 * `lib/data/products.ts`; product names are proper names and stay the same. Translations written
 * by the developer on 2026-11-08: to be reviewed by the client.
 */

type WineDetails = NonNullable<WineProduct["details"]>

interface WineCopy {
  description: string
  badge: string
  appellation: string
  details: WineDetails
}

const WHITE_DETAILS_EN: WineDetails = {
  vintage: "2024",
  grapes: "Fiano & historic white grapes of Cilento",
  tastingNotes: {
    visual: "Bright straw yellow with lively greenish highlights.",
    olfactory: "Floral and fresh: broom, aromatic Mediterranean herbs, quince and Cilento citrus.",
    gustatory: "Dry, light and vibrant on the palate, with a fresh sea-salt tang and an easy, thirst-quenching finish.",
  },
  terroir: {
    soil: "Cilento flysch: quartz-limestone sandstone and clay marl of Contrada Pozzo.",
    altitude: "280 metres a.s.l.",
    exposure: "West / South-West, cooled by breezes from the Tyrrhenian Sea.",
    harvest: "Picked by hand into crates, selecting the bunches on the slopes of Abatemarco.",
    aging: "Fermented and rested in temperature-controlled steel to keep its primary freshness.",
  },
  technical: {
    serviceTemp: "8 - 10 °C",
    glass: "Tulip glass for fresh whites",
    agingPotential: "2 - 3 years, best drunk young and fragrant",
  },
  pairings: [
    "Fresh goat's cheese from Cilento",
    "Marinated Menaica anchovies and fried small fish",
    "Buffalo mozzarella and garden tomatoes",
    "An aperitivo with friends at the cellar counter",
  ],
}

const COPY_EN: Record<string, WineCopy> = {
  "chiai-rosso": {
    description:
      "Our family red, honest and everyday. Handcrafted from Aglianico grapes grown on the hills of Abatemarco.",
    badge: "Our Red",
    appellation: "Red Wine · 2023 Vintage",
    details: {
      vintage: "2023",
      grapes: "Aglianico & traditional family grapes",
      tastingNotes: {
        visual: "Vivid ruby red with bright violet highlights.",
        olfactory: "Fragrant and genuine: fresh cherry, wild plum, violet and sweet Mediterranean spices.",
        gustatory: "Our everyday red, the one we drink at dinner ourselves. Straightforward, balanced and easy to drink.",
      },
      terroir: {
        soil: "Sandstone and marl of Abatemarco (SA).",
        altitude: "250 metres a.s.l.",
        exposure: "South-East, kissed by the morning sun.",
        harvest: "Picked by hand at dawn into 15 kg crates.",
        aging: "Traditional artisanal winemaking and rest in the cellar.",
      },
      technical: {
        serviceTemp: "16 - 18 °C",
        glass: "Medium glass for everyday reds",
        agingPotential: "4 - 5 years",
      },
      pairings: [
        "Traditional Cilento pasta e fagioli",
        "Wood-fired pizza",
        "Medium-aged Cilento cheeses",
        "Convivial family dinners",
      ],
    },
  },
  "rosso-vecchio": {
    description:
      "The cellar's important red. Long aged in barrel: austere, deep and enveloping, with notes of ripe sour cherry and carob.",
    badge: "Barrel Aged",
    appellation: "Red Wine · 2021 Vintage",
    details: {
      vintage: "2021",
      grapes: "100% Aglianico del Cilento",
      tastingNotes: {
        visual: "Deep, impenetrable ruby with warm garnet highlights.",
        olfactory: "An enveloping bouquet: ripe sour cherry, wild blackberry, carob, pipe tobacco and Mediterranean scrub.",
        gustatory: "Full-bodied, austere and deep. Long aged in barrel: tannins smoothed by time and a very long finish.",
      },
      terroir: {
        soil: "Clay-rich Cilento flysch of Contrada Pozzo, Abatemarco.",
        altitude: "320 metres a.s.l.",
        exposure: "Due South, sheltered from cold winds.",
        harvest: "Picked by hand at the end of October, at full phenolic ripeness.",
        aging: "Long aging in oak barrels and rest in the underground stone cellars.",
      },
      technical: {
        serviceTemp: "18 - 20 °C (open half an hour before serving)",
        glass: "Large glass for structured reds",
        agingPotential: "10 - 15 years",
      },
      pairings: [
        "Aged Podolico caciocavallo cheese",
        "Fusilli al ferretto with porcini mushroom sauce",
        "Traditional Cilento lagane pasta with chickpeas",
        "Aubergine parmigiana",
      ],
    },
  },
  "chiai-bianco": {
    description:
      "A fresh, savoury and mineral white wine. Scents of broom and Cilento citrus, a true expression of the flysch soils and the sea breezes.",
    badge: "Fresh & Dry",
    appellation: "White Wine · 2024 Vintage",
    details: WHITE_DETAILS_EN,
  },
  "bianco-dolce": {
    description:
      "A sweet, aromatic wine for the end of the meal, with hints of Cilento white fig, wildflower honey and toasted almond.",
    badge: "Soft & Fruity",
    appellation: "Sweet White Wine · 2024 Vintage",
    details: WHITE_DETAILS_EN,
  },
}

const CATEGORY_EN: Record<string, string> = {
  "vini-rossi": "Red Wines",
  "vini-bianchi": "White Wines",
  "vini-dolci": "Sweet Wines",
}

/** "Bottiglia 75 cl" → "75 cl bottle"; other formats are left as they are. */
function formatEn(format: string): string {
  const match = /^Bottiglia\s+(.+)$/i.exec(format.trim())
  return match ? `${match[1]} bottle` : format
}

/** The wine in the page language. Italian is the source, so it is returned unchanged. */
export function localizeWine(product: WineProduct, locale: Locale): WineProduct {
  if (locale !== "en") return product
  const copy = COPY_EN[product.handle]
  return {
    ...product,
    description: copy?.description ?? product.description,
    badge: copy?.badge ?? product.badge,
    appellation: copy?.appellation ?? product.appellation,
    format: product.format ? formatEn(product.format) : product.format,
    category: CATEGORY_EN[product.categoryHandle] ?? product.category,
    details: copy?.details ?? product.details,
  }
}

/** Localized display name of a wine category (Medusa names are Italian). */
export function localizeCategoryName(handle: string, name: string, locale: Locale): string {
  return locale === "en" ? CATEGORY_EN[handle] ?? name : name
}

/**
 * Medusa variant titles are Italian ("Bottiglia 0,75 l"). In English: "0.75 l bottle".
 * Unknown titles are left as they are.
 */
export function localizeVariantTitle(title: string, locale: Locale): string {
  if (locale !== "en") return title
  const match = /^Bottiglia\s+(.+)$/i.exec(title.trim())
  return match ? `${match[1].replace(",", ".")} bottle` : title
}
