import { cache } from "react"
import { cookies } from "next/headers"
import { retrieveCustomer } from "@/lib/data/customer"
import { parseWishlist } from "@/lib/data/wishlist"

/**
 * The logged-in customer, as seen from the server (ADR 040, docs/sicurezza-sessioni-e-produzione.md).
 *
 * The Medusa JWT lives ONLY in this httpOnly cookie: page JavaScript cannot read it, and it is
 * forwarded to Medusa only by our server ("Authorization: Bearer"). It expires with the JWT
 * (Medusa default: 1 day), after which the visitor is simply a guest again.
 */
export const AUTH_COOKIE = "cantina_auth"

export const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24, // 1 day, same as Medusa's default jwtExpiresIn
}

export async function getAuthToken(): Promise<string | undefined> {
  return (await cookies()).get(AUTH_COOKIE)?.value
}

export interface CurrentCustomer {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string
  /** Product ids saved in the wishlist (ADR 042). */
  wishlist: string[]
}

/**
 * The current customer, or null for guests, expired tokens or an unreachable backend.
 * Memoised per request, so the layout and the page share one Medusa call.
 */
export const getCurrentCustomer = cache(async (): Promise<CurrentCustomer | null> => {
  const token = await getAuthToken()
  if (!token) {
    return null
  }
  const result = await retrieveCustomer(token)
  if (!result.ok) {
    return null
  }
  return {
    id: result.customer.id,
    email: result.customer.email,
    firstName: result.customer.first_name ?? "",
    lastName: result.customer.last_name ?? "",
    phone: result.customer.phone ?? "",
    wishlist: parseWishlist(result.customer.metadata),
  }
})
