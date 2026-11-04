"use server"

import { cookies } from "next/headers"
import { z } from "zod"
import {
  MAX_ADD_QUANTITY,
  addLineItem,
  createCart,
  retrieveCart,
  summarizeCart,
  type MedusaCart,
} from "@/lib/data/cart"
import { getStoreRegionId } from "@/lib/data/products"

/**
 * Cart Server Actions (ADR 035).
 *
 * Server Actions are reachable through direct POST requests, so every input is validated here.
 * The cart id is NEVER taken from the client: it only lives in an httpOnly cookie. In Medusa,
 * whoever knows a cart id can read the cart (email, address), so the id must not be readable
 * by page JavaScript.
 */

const CART_COOKIE = "cantina_cart_id"
const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

const addToCartInputSchema = z.object({
  variantId: z.string().regex(/^variant_[0-9A-Za-z]+$/),
  quantity: z.number().int().min(1).max(MAX_ADD_QUANTITY),
})

export type AddToCartError = "invalid_input" | "out_of_stock" | "unavailable"

export type AddToCartResult =
  | { ok: true; itemCount: number }
  | { ok: false; error: AddToCartError }

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

  cookieStore.set(CART_COOKIE, created.cart.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: CART_COOKIE_MAX_AGE,
  })
  return created.cart
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

  return { ok: true, itemCount: summarizeCart(result.cart).itemCount }
}
