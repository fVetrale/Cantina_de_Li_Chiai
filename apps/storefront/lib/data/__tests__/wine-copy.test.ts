import { describe, expect, it } from "vitest"
import { localizeCategoryName, localizeVariantTitle, localizeWine } from "@/lib/data/wine-copy"
import type { WineProduct } from "@/lib/data/products"

const rosso = {
  id: "prod_1",
  handle: "rosso-vecchio",
  title: "Rosso Vecchio",
  description: "Il rosso importante della cantina.",
  category: "Vini Rossi",
  categoryHandle: "vini-rossi",
  badge: "Invecchiato in Botte",
  appellation: "Vino Rosso · Annata 2021",
  format: "Bottiglia 75 cl",
  price: 15,
} as unknown as WineProduct

describe("localizeWine (ADR 049)", () => {
  it("returns the Italian product unchanged", () => {
    expect(localizeWine(rosso, "it")).toBe(rosso)
  })

  it("translates the editorial copy and keeps the name and price", () => {
    const en = localizeWine(rosso, "en")
    expect(en.title).toBe("Rosso Vecchio")
    expect(en.price).toBe(15)
    expect(en.category).toBe("Red Wines")
    expect(en.badge).toBe("Barrel Aged")
    expect(en.appellation).toBe("Red Wine · 2021 Vintage")
    expect(en.format).toBe("75 cl bottle")
    expect(en.description).toMatch(/barrel/i)
    expect(en.details?.pairings).toHaveLength(4)
  })

  it("keeps unknown wines readable (Italian fallback)", () => {
    const other = { ...rosso, handle: "nuovo-vino", categoryHandle: "altro", category: "Altro" } as WineProduct
    const en = localizeWine(other, "en")
    expect(en.description).toBe(rosso.description)
    expect(en.category).toBe("Altro")
  })
})

describe("localizeCategoryName / localizeVariantTitle", () => {
  it("translates the known categories only in English", () => {
    expect(localizeCategoryName("vini-dolci", "Vini Dolci", "en")).toBe("Sweet Wines")
    expect(localizeCategoryName("vini-dolci", "Vini Dolci", "it")).toBe("Vini Dolci")
    expect(localizeCategoryName("altro", "Altro", "en")).toBe("Altro")
  })

  it("translates the Medusa bottle variant title", () => {
    expect(localizeVariantTitle("Bottiglia 0,75 l", "en")).toBe("0.75 l bottle")
    expect(localizeVariantTitle("Bottiglia 0,75 l", "it")).toBe("Bottiglia 0,75 l")
    expect(localizeVariantTitle("Magnum", "en")).toBe("Magnum")
  })
})
