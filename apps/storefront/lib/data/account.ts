import { z } from "zod"
import { storeRequest, type StoreResult } from "@/lib/data/cart"
import { JWT_PATTERN } from "@/lib/data/customer"
import { ORDER_ID_PATTERN } from "@/lib/data/checkout"

/**
 * Reserved-area data (ADR 041). Server-side only: every call carries the customer's token from
 * the httpOnly cookie, and Medusa scopes it to that customer (`/store/customers/me…`,
 * `/store/orders` filtered by the authenticated customer). Ownership is proven by the backend
 * integration tests (integration-tests/http/customer-ownership.spec.ts).
 */

export const ADDRESS_ID_PATTERN = /^cuaddr_[0-9A-Za-z]+$/

export type AccountError = "unauthenticated" | "not_found" | "unavailable"
export type AccountResult<T> = { ok: true; data: T } | { ok: false; error: AccountError }

function toAccountError(result: { error: string; status?: number }): { ok: false; error: AccountError } {
  if (result.status === 401) return { ok: false, error: "unauthenticated" }
  if (result.error === "not_found") return { ok: false, error: "not_found" }
  return { ok: false, error: "unavailable" }
}

function toAccountResult<T, U>(result: StoreResult<T>, map: (data: T) => U): AccountResult<U> {
  return result.ok ? { ok: true, data: map(result.data) } : toAccountError(result)
}

function invalidToken<T>(token: string): AccountResult<T> | null {
  return JWT_PATTERN.test(token) ? null : { ok: false, error: "unauthenticated" }
}

// ─── Profile ─────────────────────────────────────────────────────────────────

const profileSchema = z.object({
  id: z.string(),
  email: z.string(),
  first_name: z.string().nullish(),
  last_name: z.string().nullish(),
  phone: z.string().nullish(),
})
const profileResponseSchema = z.object({ customer: profileSchema })

export interface Profile {
  email: string
  firstName: string
  lastName: string
  phone: string
}

function toProfile(c: z.infer<typeof profileSchema>): Profile {
  return { email: c.email, firstName: c.first_name ?? "", lastName: c.last_name ?? "", phone: c.phone ?? "" }
}

export async function retrieveProfile(token: string): Promise<AccountResult<Profile>> {
  const invalid = invalidToken<Profile>(token)
  if (invalid) return invalid
  return toAccountResult(
    await storeRequest(
      "/store/customers/me?fields=id,email,first_name,last_name,phone",
      { method: "GET", authToken: token },
      profileResponseSchema
    ),
    (d) => toProfile(d.customer)
  )
}

/** Updates name and phone. The email is not changeable here (needs verification, ADR 041). */
export async function updateProfile(
  token: string,
  input: { firstName: string; lastName: string; phone: string }
): Promise<AccountResult<Profile>> {
  const invalid = invalidToken<Profile>(token)
  if (invalid) return invalid
  return toAccountResult(
    await storeRequest(
      "/store/customers/me?fields=id,email,first_name,last_name,phone",
      {
        method: "POST",
        body: { first_name: input.firstName, last_name: input.lastName, phone: input.phone || null },
        authToken: token,
      },
      profileResponseSchema
    ),
    (d) => toProfile(d.customer)
  )
}

// ─── Addresses ───────────────────────────────────────────────────────────────

const addressSchema = z.object({
  id: z.string(),
  first_name: z.string().nullish(),
  last_name: z.string().nullish(),
  address_1: z.string().nullish(),
  address_2: z.string().nullish(),
  city: z.string().nullish(),
  postal_code: z.string().nullish(),
  province: z.string().nullish(),
  country_code: z.string().nullish(),
  phone: z.string().nullish(),
  is_default_shipping: z.boolean().nullish(),
})

export interface SavedAddress {
  id: string
  firstName: string
  lastName: string
  address1: string
  address2: string
  postalCode: string
  city: string
  province: string
  phone: string
  isDefault: boolean
}

function toSavedAddress(a: z.infer<typeof addressSchema>): SavedAddress {
  return {
    id: a.id,
    firstName: a.first_name ?? "",
    lastName: a.last_name ?? "",
    address1: a.address_1 ?? "",
    address2: a.address_2 ?? "",
    postalCode: a.postal_code ?? "",
    city: a.city ?? "",
    province: a.province ?? "",
    phone: a.phone ?? "",
    isDefault: !!a.is_default_shipping,
  }
}

/** The customer's Italian addresses, default first. */
export async function listAddresses(token: string): Promise<AccountResult<SavedAddress[]>> {
  const invalid = invalidToken<SavedAddress[]>(token)
  if (invalid) return invalid
  return toAccountResult(
    await storeRequest(
      "/store/customers/me/addresses?limit=50",
      { method: "GET", authToken: token },
      z.object({ addresses: z.array(addressSchema) })
    ),
    (d) =>
      d.addresses
        .filter((a) => !a.country_code || a.country_code.toLowerCase() === "it")
        .map(toSavedAddress)
        .sort((a, b) => Number(b.isDefault) - Number(a.isDefault))
  )
}

export interface AddressWrite {
  firstName: string
  lastName: string
  address1: string
  address2: string
  postalCode: string
  city: string
  province: string
  phone: string
  isDefault: boolean
}

function toMedusaAddress(a: AddressWrite) {
  return {
    first_name: a.firstName,
    last_name: a.lastName,
    address_1: a.address1,
    address_2: a.address2,
    city: a.city,
    postal_code: a.postalCode,
    province: a.province,
    country_code: "it", // Italy only (ADR 029)
    phone: a.phone || null,
    is_default_shipping: a.isDefault,
  }
}

const customerWithAddressesSchema = z.object({ customer: z.object({ id: z.string() }) })

/** Creates an address, or updates one (Medusa answers 404 for an address of another customer). */
export async function saveAddress(
  token: string,
  addressId: string | null,
  input: AddressWrite
): Promise<AccountResult<true>> {
  const invalid = invalidToken<true>(token)
  if (invalid) return invalid
  if (addressId !== null && !ADDRESS_ID_PATTERN.test(addressId)) {
    return { ok: false, error: "not_found" }
  }
  const path = addressId ? `/store/customers/me/addresses/${addressId}` : "/store/customers/me/addresses"
  return toAccountResult(
    await storeRequest(
      `${path}?fields=id`,
      { method: "POST", body: toMedusaAddress(input), authToken: token },
      customerWithAddressesSchema
    ),
    () => true as const
  )
}

export async function deleteAddress(token: string, addressId: string): Promise<AccountResult<true>> {
  const invalid = invalidToken<true>(token)
  if (invalid) return invalid
  if (!ADDRESS_ID_PATTERN.test(addressId)) return { ok: false, error: "not_found" }
  return toAccountResult(
    await storeRequest(
      `/store/customers/me/addresses/${addressId}`,
      { method: "DELETE", authToken: token },
      z.object({ deleted: z.literal(true) })
    ),
    () => true as const
  )
}

// ─── Orders ──────────────────────────────────────────────────────────────────

const orderSummarySchema = z.object({
  id: z.string(),
  display_id: z.number().nullish(),
  created_at: z.string(),
  status: z.string().nullish(),
  fulfillment_status: z.string().nullish(),
  total: z.number().nullish(),
  items: z.array(z.object({ quantity: z.number() })).nullish(),
})

export interface OrderSummary {
  id: string
  displayId: number | null
  createdAt: string
  status: OrderStatusKey
  total: number
  itemCount: number
}

/** Customer-facing status, from Medusa's order and fulfillment status. */
export type OrderStatusKey = "processing" | "shipped" | "delivered" | "canceled"

export function toStatusKey(status?: string | null, fulfillment?: string | null): OrderStatusKey {
  if (status === "canceled") return "canceled"
  if (fulfillment === "delivered" || fulfillment === "partially_delivered") return "delivered"
  if (fulfillment === "shipped" || fulfillment === "partially_shipped") return "shipped"
  return "processing"
}

export async function listOrders(token: string, page = 1): Promise<AccountResult<OrderSummary[]>> {
  const invalid = invalidToken<OrderSummary[]>(token)
  if (invalid) return invalid
  const params = new URLSearchParams({
    fields: "id,display_id,created_at,status,fulfillment_status,total,items.quantity",
    order: "-created_at",
    limit: "20",
    offset: String((Math.max(1, Math.floor(page)) - 1) * 20),
  })
  return toAccountResult(
    await storeRequest(
      `/store/orders?${params.toString()}`,
      { method: "GET", authToken: token },
      z.object({ orders: z.array(orderSummarySchema) })
    ),
    (d) =>
      d.orders.map((o) => ({
        id: o.id,
        displayId: o.display_id ?? null,
        createdAt: o.created_at,
        status: toStatusKey(o.status, o.fulfillment_status),
        total: o.total ?? 0,
        itemCount: (o.items ?? []).reduce((sum, i) => sum + i.quantity, 0),
      }))
  )
}

const orderDetailSchema = orderSummarySchema.extend({
  email: z.string().nullish(),
  item_total: z.number().nullish(),
  shipping_total: z.number().nullish(),
  items: z
    .array(
      z.object({
        id: z.string(),
        product_title: z.string().nullish(),
        product_handle: z.string().nullish(),
        title: z.string().nullish(),
        variant_title: z.string().nullish(),
        quantity: z.number(),
        unit_price: z.number().nullish(),
      })
    )
    .nullish(),
  shipping_methods: z
    .array(z.object({ id: z.string(), name: z.string().nullish(), amount: z.number().nullish() }))
    .nullish(),
  shipping_address: addressSchema.omit({ id: true, is_default_shipping: true }).extend({ id: z.string().nullish() }).nullish(),
})

export type OrderDetail = z.infer<typeof orderDetailSchema>

/**
 * One order of the authenticated customer. It deliberately uses the customer-scoped LIST
 * endpoint filtered by id, never the public GET /store/orders/:id: an order of another customer
 * is simply not returned, and the page answers 404.
 */
export async function retrieveOwnOrder(token: string, orderId: string): Promise<AccountResult<OrderDetail>> {
  const invalid = invalidToken<OrderDetail>(token)
  if (invalid) return invalid
  if (!ORDER_ID_PATTERN.test(orderId)) return { ok: false, error: "not_found" }
  const params = new URLSearchParams({
    id: orderId,
    fields: [
      "id",
      "display_id",
      "created_at",
      "status",
      "fulfillment_status",
      "email",
      "item_total",
      "shipping_total",
      "total",
      "items.id",
      "items.product_title",
      "items.product_handle",
      "items.title",
      "items.variant_title",
      "items.quantity",
      "items.unit_price",
      // On the customer-scoped list Medusa returns shipping methods and the address only with
      // the "*" relation syntax (dotted fields come back empty); Zod keeps just what the page shows.
      "*shipping_methods",
      "*shipping_address",
    ].join(","),
    limit: "1",
  })
  const result = await storeRequest(
    `/store/orders?${params.toString()}`,
    { method: "GET", authToken: token },
    z.object({ orders: z.array(orderDetailSchema) })
  )
  if (result.ok) {
    const order = result.data.orders.find((o) => o.id === orderId)
    return order ? { ok: true, data: order } : { ok: false, error: "not_found" }
  }
  return toAccountError(result)
}
