import { cookies } from "next/headers"
import {
  getCartLineExtras,
  retrieveCart,
  summarizeCart,
  type CartSummary,
  type MedusaCart,
} from "@/lib/data/cart"
import { getLocalProductImage } from "@/lib/data/products"

/**
 * The visitor's cart, as seen from the server (ADR 035, 036).
 * The cart id lives ONLY in this httpOnly cookie: page JavaScript cannot read it, and Server
 * Actions never accept a cart id from the client.
 */
export const CART_COOKIE = "cantina_cart_id"

export const CART_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 30, // 30 days
}

export async function getCartIdFromCookie(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get(CART_COOKIE)?.value
}

/** Open (not completed) cart of the visitor, or null when there is none or it is gone. */
async function getOpenCart(): Promise<
  { status: "ok"; cart: MedusaCart } | { status: "none" } | { status: "unavailable" }
> {
  const cartId = await getCartIdFromCookie()
  if (!cartId) {
    return { status: "none" }
  }
  const result = await retrieveCart(cartId)
  if (!result.ok) {
    return result.error === "unavailable" ? { status: "unavailable" } : { status: "none" }
  }
  if (result.cart.completed_at) {
    return { status: "none" }
  }
  return { status: "ok", cart: result.cart }
}

/**
 * Cart counter data for the Navbar (root layout). Never throws: no cart, a missing cart or an
 * unreachable backend all give null, so a backend outage never breaks page rendering.
 */
export async function getCurrentCartSummary(): Promise<CartSummary | null> {
  const open = await getOpenCart()
  return open.status === "ok" ? summarizeCart(open.cart) : null
}

export interface CartLineView {
  id: string
  variantId: string
  handle: string
  title: string
  variantTitle: string
  image: string
  /** IVA included, major units. */
  unitPrice: number
  quantity: number
  lineTotal: number
  /** Max quantity the visitor can set on this line (Medusa stock). null = not limited. */
  available: number | null
  /** Fresh meat is pickup-only (ADR 033). */
  isFreshMeat: boolean
}

export interface CartView {
  id: string
  currencyCode: string
  itemCount: number
  itemTotal: number
  lines: CartLineView[]
}

export type CurrentCartView =
  | { status: "ok"; cart: CartView }
  | { status: "empty" }
  | { status: "unavailable" }

/** Full cart for the /carrello page, with live stock and the fresh-meat flag per line. */
export async function getCurrentCartView(): Promise<CurrentCartView> {
  const open = await getOpenCart()
  if (open.status === "unavailable") {
    return { status: "unavailable" }
  }
  if (open.status === "none" || (open.cart.items ?? []).length === 0) {
    return { status: "empty" }
  }

  const cart = open.cart
  const items = cart.items ?? []
  const extras = await getCartLineExtras(
    items.map((item) => item.product_id).filter((id): id is string => !!id)
  )

  const lines: CartLineView[] = items.map((item) => {
    const handle = item.product_handle ?? ""
    const unitPrice = item.unit_price ?? 0
    const extra = item.variant_id ? extras.get(item.variant_id) : undefined
    return {
      id: item.id,
      variantId: item.variant_id ?? "",
      handle,
      title: item.product_title ?? item.title ?? "",
      variantTitle: item.variant_title ?? "",
      image: item.thumbnail || getLocalProductImage(handle),
      unitPrice,
      quantity: item.quantity,
      lineTotal: unitPrice * item.quantity,
      available: extra?.available ?? null,
      isFreshMeat: extra?.isFreshMeat ?? false,
    }
  })

  const summary = summarizeCart(cart)
  return {
    status: "ok",
    cart: {
      id: cart.id,
      currencyCode: summary.currencyCode,
      itemCount: summary.itemCount,
      itemTotal: summary.itemTotal,
      lines,
    },
  }
}
