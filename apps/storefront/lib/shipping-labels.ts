import type { Dictionary } from "@/lib/i18n"

/**
 * Shipping option names come from Medusa in Italian (seed, ADR 033). Show the translated label for
 * the known options (by type code, or by the stored Italian name on past orders); otherwise keep
 * Medusa's text. Pure function, no data access (ADR 049).
 */
const CODE_BY_ITALIAN_NAME: Record<string, "standard" | "pickup"> = {
  "Spedizione standard": "standard",
  "Ritiro in cantina": "pickup",
}

type Labels = Dictionary["shipping"]

export function shippingName(labels: Labels, name: string | null | undefined, code?: string | null): string {
  const key = (code === "standard" || code === "pickup" ? code : undefined) ?? (name ? CODE_BY_ITALIAN_NAME[name] : undefined)
  return key ? labels.names[key] : name ?? ""
}

export function shippingDescription(labels: Labels, description: string | null | undefined, code?: string | null): string {
  return code === "standard" || code === "pickup" ? labels.descriptions[code] : description ?? ""
}
