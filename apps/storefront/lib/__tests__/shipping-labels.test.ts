import { describe, expect, it } from "vitest"
import { getDictionary } from "@/lib/i18n"
import { shippingDescription, shippingName } from "@/lib/shipping-labels"

describe("shipping labels (ADR 049)", () => {
  const en = getDictionary("en").shipping
  const it_ = getDictionary("it").shipping

  it("translates by option type code", () => {
    expect(shippingName(en, "Spedizione standard", "standard")).toBe("Standard shipping")
    expect(shippingName(en, "Ritiro in cantina", "pickup")).toBe("Pickup at the cellar")
    expect(shippingDescription(en, "Corriere…", "standard")).toMatch(/courier/i)
  })

  it("translates past orders by the stored Italian name", () => {
    expect(shippingName(en, "Ritiro in cantina")).toBe("Pickup at the cellar")
    expect(shippingName(it_, "Ritiro in cantina")).toBe("Ritiro in cantina")
  })

  it("keeps unknown options as Medusa sends them", () => {
    expect(shippingName(en, "Corriere express", "express")).toBe("Corriere express")
    expect(shippingName(en, null)).toBe("")
    expect(shippingDescription(en, "Descrizione", "express")).toBe("Descrizione")
  })
})
