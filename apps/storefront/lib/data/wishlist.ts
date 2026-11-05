import { z } from "zod"
import { storeRequest } from "@/lib/data/cart"
import { JWT_PATTERN } from "@/lib/data/customer"

/**
 * Wishlist stored in the customer's Medusa metadata (ADR 042): `metadata.wishlist` is a list
 * of product ids. Only the customer can read or change it, through /store/customers/me with
 * their own token. Server-side only.
 */

export const WISHLIST_METADATA_KEY = "wishlist"
export const PRODUCT_ID_PATTERN = /^prod_[0-9A-Za-z]+$/
export const MAX_WISHLIST_ITEMS = 100

/** Cleans whatever is stored: valid product ids only, no duplicates, capped. */
export function parseWishlist(metadata: unknown): string[] {
  const raw =
    metadata && typeof metadata === "object" && !Array.isArray(metadata)
      ? (metadata as Record<string, unknown>)[WISHLIST_METADATA_KEY]
      : undefined
  if (!Array.isArray(raw)) return []
  const ids = raw.filter((id): id is string => typeof id === "string" && PRODUCT_ID_PATTERN.test(id))
  return [...new Set(ids)].slice(0, MAX_WISHLIST_ITEMS)
}

const meMetadataSchema = z.object({
  customer: z.object({ id: z.string(), metadata: z.record(z.string(), z.unknown()).nullish() }),
})

export type WishlistResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: "unauthenticated" | "unavailable" }

function failure(result: { status?: number }): { ok: false; error: "unauthenticated" | "unavailable" } {
  return { ok: false, error: result.status === 401 ? "unauthenticated" : "unavailable" }
}

/** Current metadata and wishlist of the customer. */
export async function readCustomerMetadata(
  token: string
): Promise<WishlistResult<{ metadata: Record<string, unknown>; wishlist: string[] }>> {
  if (!JWT_PATTERN.test(token)) return { ok: false, error: "unauthenticated" }
  const result = await storeRequest(
    "/store/customers/me?fields=id,metadata",
    { method: "GET", authToken: token },
    meMetadataSchema
  )
  if (!result.ok) return failure(result)
  const metadata = result.data.customer.metadata ?? {}
  return { ok: true, data: { metadata, wishlist: parseWishlist(metadata) } }
}

/**
 * Writes the wishlist. The other metadata keys are sent back unchanged, so this works whether
 * Medusa merges or replaces the metadata object.
 */
export async function writeWishlist(
  token: string,
  metadata: Record<string, unknown>,
  wishlist: string[]
): Promise<WishlistResult<string[]>> {
  if (!JWT_PATTERN.test(token)) return { ok: false, error: "unauthenticated" }
  const result = await storeRequest(
    "/store/customers/me?fields=id,metadata",
    { method: "POST", body: { metadata: { ...metadata, [WISHLIST_METADATA_KEY]: wishlist } }, authToken: token },
    meMetadataSchema
  )
  if (!result.ok) return failure(result)
  return { ok: true, data: parseWishlist(result.data.customer.metadata) }
}
