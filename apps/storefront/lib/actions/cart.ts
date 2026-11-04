"use server"

import { cookies } from "next/headers"
import { refresh } from "next/cache"
import { z } from "zod"
import {
  LINE_ITEM_ID_PATTERN,
  MAX_ADD_QUANTITY,
  addLineItem,
  createCart,
  deleteLineItem,
  retrieveCart,
  summarizeCart,
  updateLineItem,
  type CartResult,
  type MedusaCart,
} from "@/lib/data/cart"
import { CART_COOKIE, CART_COOKIE_OPTIONS } from "@/lib/data/cart-session"
import { getStoreRegionId } from "@/lib/data/products"

/**
 * Cart Server Actions (ADR 035, 036).
 *
 * Server Actions are reachable through direct POST requests, so every input is validated here.
 * The cart id is NEVER taken from the client: it only lives in an httpOnly cookie. In Medusa,
 * whoever knows a cart id can read the cart (email, address), so the id must not be readable
 * by page JavaScript. Line ids from the client are only used inside the cookie's cart, and
 * Medusa answers 404 for a line that belongs to another cart.
 *
 * After every successful change, refresh() re-renders the current route (root layout included),
 * so the Navbar counter and the /carrello page show the new cart.
 */

const quantitySchema = z.number().int().min(1).max(MAX_ADD_QUANTITY)

const addToCartInputSchema = z.object({
  variantId: z.string().regex(/^variant_[0-9A-Za-z]+$/),
  quantity: quantitySchema,
})

const updateCartItemInputSchema = z.object({
  lineItemId: z.string().regex(LINE_ITEM_ID_PATTERN),
  quantity: quantitySchema,
})

const removeCartItemInputSchema = z.object({
  lineItemId: z.string().regex(LINE_ITEM_ID_PATTERN),
})

export type AddToCartError = "invalid_input" | "out_of_stock" | "unavailable"

export type AddToCartResult =
  | { ok: true; itemCount: number }
  | { ok: false; error: AddToCartError }

export type CartItemError = "invalid_input" | "out_of_stock" | "not_found" | "unavailable"

export type CartItemResult = { ok: true; itemCount: number } | { ok: false; error: CartItemError }

/** Returns the visitor's open cart, creating a new one (and its cookie) when needed. */
async function getOrCreateCart(): Promise<MedusaCart | null> {
  const cookieStore = await cookies()
  const existingId = cookieStore.get(CART_COOKIE)?.value

  if (existingId) {
    const existing = await retrieveCart(existingId)
    // A completed cart has become an order: start a new one.
    if (existing.ok && !existing.cart.completed_at) {
      return existing.cart
    }
    if (!existing.ok && existing.error === "unavailable") {
      return null
    }
  }

  const regionId = await getStoreRegionId()
  if (!regionId) {
    return null
  }
  const created = await createCart(regionId)
  if (!created.ok) {
    return null
  }

  cookieStore.set(CART_COOKIE, created.cart.id, CART_COOKIE_OPTIONS)
  return created.cart
}

function toItemResult(result: CartResult): CartItemResult {
  if (!result.ok) {
    return { ok: false, error: result.error }
  }
  refresh()
  return { ok: true, itemCount: summarizeCart(result.cart).itemCount }
}

export async function addToCart(input: unknown): Promise<AddToCartResult> {
  const parsed = addToCartInputSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: "invalid_input" }
  }

  const cart = await getOrCreateCart()
  if (!cart) {
    return { ok: false, error: "unavailable" }
  }

  const result = await addLineItem(cart.id, parsed.data.variantId, parsed.data.quantity)
  if (!result.ok) {
    return { ok: false, error: result.error === "out_of_stock" ? "out_of_stock" : "unavailable" }
  }

  refresh()
  return { ok: true, itemCount: summarizeCart(result.cart).itemCount }
}

/** Sets the quantity of a line in the visitor's cart (cart from the cookie only). */
export async function updateCartItem(input: unknown): Promise<CartItemResult> {
  const parsed = updateCartItemInputSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: "invalid_input" }
  }
  const cartId = (await cookies()).get(CART_COOKIE)?.value
  if (!cartId) {
    return { ok: false, error: "not_found" }
  }
  return toItemResult(await updateLineItem(cartId, parsed.data.lineItemId, parsed.data.quantity))
}

/** Removes a line from the visitor's cart (cart from the cookie only). */
export async function removeCartItem(input: unknown): Promise<CartItemResult> {
  const parsed = removeCartItemInputSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: "invalid_input" }
  }
  const cartId = (await cookies()).get(CART_COOKIE)?.value
  if (!cartId) {
    return { ok: false, error: "not_found" }
  }
  return toItemResult(await deleteLineItem(cartId, parsed.data.lineItemId))
}
