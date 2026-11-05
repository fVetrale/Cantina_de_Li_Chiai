import { cookies } from "next/headers"
import { getLocalProductImage } from "@/lib/data/products"
import { retrieveOrderSummary } from "@/lib/data/checkout"

/**
 * The buyer's last order (ADR 039).
 *
 * Medusa lets anyone who knows an order id read it through the Store API. So the confirmation
 * page never takes an id from the URL: the id lives only in this httpOnly cookie, set by the
 * placeOrder Server Action in the buyer's own browser. Another visitor cannot read the cookie,
 * and changing the URL cannot reveal someone else's order.
 */
export const ORDER_COOKIE = "cantina_last_order"

export const ORDER_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24, // 1 day: long enough to reload the confirmation page
}

export interface OrderLineView {
  id: string
  title: string
  variantTitle: string
  quantity: number
  lineTotal: number
  image: string
}

export interface OrderView {
  displayId: number | null
  email: string
  lines: OrderLineView[]
  shippingMethods: { id: string; name: string; amount: number }[]
  itemTotal: number
  shippingTotal: number
  total: number
}

export type LastOrderView = { status: "ok"; order: OrderView } | { status: "none" } | { status: "unavailable" }

export async function getLastOrderView(): Promise<LastOrderView> {
  const orderId = (await cookies()).get(ORDER_COOKIE)?.value
  if (!orderId) {
    return { status: "none" }
  }
  const result = await retrieveOrderSummary(orderId)
  if (!result.ok) {
    return result.error === "unavailable" ? { status: "unavailable" } : { status: "none" }
  }

  const order = result.data
  return {
    status: "ok",
    order: {
      displayId: order.display_id ?? null,
      email: order.email ?? "",
      lines: (order.items ?? []).map((item) => {
        const unitPrice = item.unit_price ?? 0
        return {
          id: item.id,
          title: item.product_title ?? item.title ?? "",
          variantTitle: item.variant_title ?? "",
          quantity: item.quantity,
          lineTotal: unitPrice * item.quantity,
          image: getLocalProductImage(item.product_handle ?? ""),
        }
      }),
      shippingMethods: (order.shipping_methods ?? []).map((m) => ({
        id: m.id,
        name: m.name ?? "",
        amount: m.amount ?? 0,
      })),
      itemTotal: order.item_total ?? 0,
      shippingTotal: order.shipping_total ?? 0,
      total: order.total ?? 0,
    },
  }
}
