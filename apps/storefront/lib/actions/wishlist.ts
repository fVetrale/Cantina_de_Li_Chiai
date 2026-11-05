"use server"

import { refresh } from "next/cache"
import { z } from "zod"
import { getAuthToken } from "@/lib/data/auth-session"
import { getProducts } from "@/lib/data/products"
import {
  MAX_WISHLIST_ITEMS,
  PRODUCT_ID_PATTERN,
  readCustomerMetadata,
  writeWishlist,
} from "@/lib/data/wishlist"

/**
 * Wishlist Server Action (ADR 042).
 * - Needs the login cookie: guests get `unauthenticated` (the UI invites them to sign in).
 * - Only ids of products that exist in the catalog are accepted: no junk in the metadata.
 * - At most MAX_WISHLIST_ITEMS products; adding twice never duplicates.
 * - The customer's other metadata keys are preserved.
 */

const toggleInputSchema = z.object({ productId: z.string().regex(PRODUCT_ID_PATTERN) })

export type WishlistActionError = "invalid_input" | "unauthenticated" | "not_found" | "limit_reached" | "unavailable"

export type WishlistActionResult = { ok: true; inWishlist: boolean } | { ok: false; error: WishlistActionError }

export async function toggleWishlist(input: unknown): Promise<WishlistActionResult> {
  const parsed = toggleInputSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: "invalid_input" }
  const { productId } = parsed.data

  const token = await getAuthToken()
  if (!token) return { ok: false, error: "unauthenticated" }

  const current = await readCustomerMetadata(token)
  if (!current.ok) return { ok: false, error: current.error }

  const isSaved = current.data.wishlist.includes(productId)
  let next: string[]
  if (isSaved) {
    next = current.data.wishlist.filter((id) => id !== productId)
  } else {
    // Only real catalog products (ISR-cached catalog, no extra request in the common case).
    const catalog = await getProducts()
    if (catalog.status !== "ok") return { ok: false, error: "unavailable" }
    if (!catalog.products.some((p) => p.id === productId)) return { ok: false, error: "not_found" }
    if (current.data.wishlist.length >= MAX_WISHLIST_ITEMS) return { ok: false, error: "limit_reached" }
    next = [productId, ...current.data.wishlist] // newest first
  }

  const written = await writeWishlist(token, current.data.metadata, next)
  if (!written.ok) return { ok: false, error: written.error }
  refresh()
  return { ok: true, inWishlist: !isSaved }
}
