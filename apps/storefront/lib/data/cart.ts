import { z } from "zod"

/**
 * Medusa Store API cart calls (ADR 035, 036). Server-side only: used by the Server Actions in
 * `lib/actions/cart.ts` and by `lib/data/cart-session.ts`. Carts and stock are never cached
 * (`cache: "no-store"`), and every response is validated with Zod at the boundary.
 */

// Medusa ids. Anything else (e.g. a tampered cookie or form value) is rejected before it
// reaches a URL path.
export const CART_ID_PATTERN = /^cart_[0-9A-Za-z]+$/
export const LINE_ITEM_ID_PATTERN = /^cali_[0-9A-Za-z]+$/

// Max units per line (same bound as the custom quantity field on the product page).
export const MAX_ADD_QUANTITY = 120

// Free home delivery threshold, IVA included. MUST match FREE_SHIPPING_FROM_EUR in
// apps/backend/src/scripts/seed.ts (ADR 033): Medusa applies the real rule, this only drives
// the "Ti mancano €X" hint on the cart page.
export const FREE_SHIPPING_THRESHOLD_EUR = 90

// Products in this category are pickup-only (separate shipping profile, ADR 033).
export const FRESH_MEAT_CATEGORY_HANDLE = "carne-fresca"

const cartLineItemSchema = z.object({
  id: z.string(),
  variant_id: z.string().nullish(),
  product_id: z.string().nullish(),
  product_handle: z.string().nullish(),
  product_title: z.string().nullish(),
  title: z.string().nullish(),
  variant_title: z.string().nullish(),
  thumbnail: z.string().nullish(),
  unit_price: z.number().nullish(),
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

// DELETE /store/carts/:id/line-items/:line_id answers with the updated cart as `parent`.
const lineItemDeleteResponseSchema = z.object({ deleted: z.literal(true), parent: cartSchema })

// Stock and categories are only computed on the product endpoints, not on the cart.
const cartProductsResponseSchema = z.object({
  products: z.array(
    z.object({
      id: z.string(),
      categories: z.array(z.object({ handle: z.string().nullish() })).nullish(),
      variants: z
        .array(
          z.object({
            id: z.string(),
            manage_inventory: z.boolean().nullish(),
            allow_backorder: z.boolean().nullish(),
            inventory_quantity: z.number().nullish(),
          })
        )
        .nullish(),
    })
  ),
})

export type MedusaCart = z.infer<typeof cartSchema>
export type MedusaCartLineItem = z.infer<typeof cartLineItemSchema>

export interface CartSummary {
  id: string
  /** Total units in the cart (sum of line quantities). */
  itemCount: number
  /** Items total, IVA included, in major units. */
  itemTotal: number
  currencyCode: string
}

/** Stock and pickup rules for the variants in a cart. */
export interface CartLineExtras {
  /** Orderable units now (Medusa stock). null = not limited. */
  available: number | null
  isFreshMeat: boolean
}

/** Why a cart request failed, in terms the UI can act on. */
export type CartErrorCode = "out_of_stock" | "not_found" | "unavailable"

export type CartResult = { ok: true; cart: MedusaCart } | { ok: false; error: CartErrorCode }

export type StoreResult<T> = { ok: true; data: T } | { ok: false; error: CartErrorCode }

/** Store API request with the publishable key, never cached, response validated by `schema`. */
export async function storeRequest<T>(
  path: string,
  init: { method: "GET" | "POST" | "DELETE"; body?: unknown },
  schema: z.ZodType<T>
): Promise<StoreResult<T>> {
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
      cache: "no-store", // carts and stock are per-customer / live data: never cache them
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

    const parsed = schema.safeParse(json)
    if (!parsed.success) {
      console.warn(`[Storefront] Unexpected Medusa response shape (${path}):\n${z.prettifyError(parsed.error)}`)
      return { ok: false, error: "unavailable" }
    }
    return { ok: true, data: parsed.data }
  } catch (err) {
    console.warn(`[Storefront] Could not reach the Medusa backend (${init.method} ${path}).`, err)
    return { ok: false, error: "unavailable" }
  }
}

function toCartResult(result: StoreResult<{ cart: MedusaCart }>): CartResult {
  return result.ok ? { ok: true, cart: result.data.cart } : result
}

/** Reads a cart. `not_found` when the id no longer exists in Medusa. */
export async function retrieveCart(cartId: string): Promise<CartResult> {
  if (!CART_ID_PATTERN.test(cartId)) {
    return { ok: false, error: "not_found" }
  }
  return toCartResult(await storeRequest(`/store/carts/${cartId}`, { method: "GET" }, cartResponseSchema))
}

/** Creates an empty cart in the given region (prices, taxes and shipping depend on it). */
export async function createCart(regionId: string): Promise<CartResult> {
  return toCartResult(
    await storeRequest("/store/carts", { method: "POST", body: { region_id: regionId } }, cartResponseSchema)
  )
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
  return toCartResult(
    await storeRequest(
      `/store/carts/${cartId}/line-items`,
      { method: "POST", body: { variant_id: variantId, quantity } },
      cartResponseSchema
    )
  )
}

/**
 * Sets the quantity of a line. Medusa only finds the line inside the given cart (404 otherwise),
 * so a line id from another visitor's cart cannot be touched.
 */
export async function updateLineItem(
  cartId: string,
  lineItemId: string,
  quantity: number
): Promise<CartResult> {
  if (!CART_ID_PATTERN.test(cartId) || !LINE_ITEM_ID_PATTERN.test(lineItemId)) {
    return { ok: false, error: "not_found" }
  }
  return toCartResult(
    await storeRequest(
      `/store/carts/${cartId}/line-items/${lineItemId}`,
      { method: "POST", body: { quantity } },
      cartResponseSchema
    )
  )
}

/** Removes a line from the cart (same ownership rule as updateLineItem). */
export async function deleteLineItem(cartId: string, lineItemId: string): Promise<CartResult> {
  if (!CART_ID_PATTERN.test(cartId) || !LINE_ITEM_ID_PATTERN.test(lineItemId)) {
    return { ok: false, error: "not_found" }
  }
  const result = await storeRequest(
    `/store/carts/${cartId}/line-items/${lineItemId}`,
    { method: "DELETE" },
    lineItemDeleteResponseSchema
  )
  return result.ok ? { ok: true, cart: result.data.parent } : result
}

/**
 * Live stock and fresh-meat flag for the products in a cart, keyed by variant id.
 * Returns an empty map on failure: the cart still renders, only the extras are missing.
 */
export async function getCartLineExtras(productIds: string[]): Promise<Map<string, CartLineExtras>> {
  const extras = new Map<string, CartLineExtras>()
  const ids = [...new Set(productIds)]
  if (ids.length === 0) {
    return extras
  }

  const query = new URLSearchParams({
    fields:
      "id,*categories,variants.id,variants.manage_inventory,variants.allow_backorder,+variants.inventory_quantity",
    limit: String(ids.length),
  })
  for (const id of ids) {
    query.append("id[]", id)
  }

  const result = await storeRequest(
    `/store/products?${query.toString()}`,
    { method: "GET" },
    cartProductsResponseSchema
  )
  if (!result.ok) {
    return extras
  }

  for (const product of result.data.products) {
    const isFreshMeat = (product.categories ?? []).some(
      (c) => c.handle === FRESH_MEAT_CATEGORY_HANDLE
    )
    for (const variant of product.variants ?? []) {
      const available =
        !variant.manage_inventory || variant.allow_backorder
          ? null
          : Math.max(0, Math.floor(variant.inventory_quantity ?? 0))
      extras.set(variant.id, { available, isFreshMeat })
    }
  }
  return extras
}

export function summarizeCart(cart: MedusaCart): CartSummary {
  return {
    id: cart.id,
    itemCount: (cart.items ?? []).reduce((sum, item) => sum + item.quantity, 0),
    itemTotal: cart.item_total ?? 0,
    currencyCode: cart.currency_code.toUpperCase(),
  }
}
