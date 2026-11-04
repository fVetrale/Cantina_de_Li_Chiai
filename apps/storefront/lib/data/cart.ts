import { z } from "zod"

/**
 * Medusa Store API cart calls (ADR 035). Server-side only: called from the Server Actions in
 * `lib/actions/cart.ts`. Carts are never cached (`cache: "no-store"`), and every response is
 * validated with Zod at the boundary.
 */

// Medusa cart ids look like "cart_01JABCDEF...". Anything else (e.g. a tampered cookie) is
// rejected before it reaches a URL path.
export const CART_ID_PATTERN = /^cart_[0-9A-Za-z]+$/

// Max units per "add to cart" (same bound as the custom quantity field on the product page).
export const MAX_ADD_QUANTITY = 120

const cartLineItemSchema = z.object({
  id: z.string(),
  variant_id: z.string().nullish(),
  quantity: z.number(),
})

const cartSchema = z.object({
  id: z.string(),
  currency_code: z.string(),
  completed_at: z.string().nullish(),
  item_total: z.number().nullish(),
  items: z.array(cartLineItemSchema).nullish(),
})

const cartResponseSchema = z.object({ cart: cartSchema })

export type MedusaCart = z.infer<typeof cartSchema>

export interface CartSummary {
  id: string
  /** Total units in the cart (sum of line quantities). */
  itemCount: number
  /** Items total, IVA included, in major units. */
  itemTotal: number
  currencyCode: string
}

/** Why a cart request failed, in terms the UI can act on. */
export type CartErrorCode = "out_of_stock" | "not_found" | "unavailable"

export type CartResult = { ok: true; cart: MedusaCart } | { ok: false; error: CartErrorCode }

async function storeRequest(
  path: string,
  init: { method: "GET" | "POST"; body?: unknown }
): Promise<CartResult> {
  const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
  const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

  try {
    const res = await fetch(`${backendUrl}${path}`, {
      method: init.method,
      headers: {
        "x-publishable-api-key": publishableKey,
        ...(init.body !== undefined ? { "content-type": "application/json" } : {}),
      },
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
      cache: "no-store", // a cart is per-customer, mutable state: never cache it
    })

    const json: unknown = await res.json().catch(() => null)

    if (!res.ok) {
      const message =
        json && typeof json === "object" && "message" in json ? String(json.message) : ""
      if (res.status === 404) {
        return { ok: false, error: "not_found" }
      }
      // Medusa answers 400 "Some variant does not have the required inventory" (ADR 034).
      if (res.status === 400 && /inventory/i.test(message)) {
        return { ok: false, error: "out_of_stock" }
      }
      console.warn(`[Storefront] Medusa ${init.method} ${path} returned status ${res.status}.`)
      return { ok: false, error: "unavailable" }
    }

    const parsed = cartResponseSchema.safeParse(json)
    if (!parsed.success) {
      console.warn(`[Storefront] Unexpected Medusa cart response shape:\n${z.prettifyError(parsed.error)}`)
      return { ok: false, error: "unavailable" }
    }
    return { ok: true, cart: parsed.data.cart }
  } catch (err) {
    console.warn(`[Storefront] Could not reach the Medusa backend (${init.method} ${path}).`, err)
    return { ok: false, error: "unavailable" }
  }
}

/** Reads a cart. `not_found` when the id no longer exists in Medusa. */
export async function retrieveCart(cartId: string): Promise<CartResult> {
  if (!CART_ID_PATTERN.test(cartId)) {
    return { ok: false, error: "not_found" }
  }
  return storeRequest(`/store/carts/${cartId}`, { method: "GET" })
}

/** Creates an empty cart in the given region (prices, taxes and shipping depend on it). */
export async function createCart(regionId: string): Promise<CartResult> {
  return storeRequest("/store/carts", { method: "POST", body: { region_id: regionId } })
}

/** Adds a variant to a cart. Medusa checks stock and answers `out_of_stock` if it is not enough. */
export async function addLineItem(
  cartId: string,
  variantId: string,
  quantity: number
): Promise<CartResult> {
  if (!CART_ID_PATTERN.test(cartId)) {
    return { ok: false, error: "not_found" }
  }
  return storeRequest(`/store/carts/${cartId}/line-items`, {
    method: "POST",
    body: { variant_id: variantId, quantity },
  })
}

export function summarizeCart(cart: MedusaCart): CartSummary {
  return {
    id: cart.id,
    itemCount: (cart.items ?? []).reduce((sum, item) => sum + item.quantity, 0),
    itemTotal: cart.item_total ?? 0,
    currencyCode: cart.currency_code.toUpperCase(),
  }
}
