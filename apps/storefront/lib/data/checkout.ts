import { z } from "zod"
import { CART_ID_PATTERN, storeRequest, type CartErrorCode } from "@/lib/data/cart"
import { getCartIdFromCookie, getCurrentCartView, type CartLineView } from "@/lib/data/cart-session"

/**
 * Checkout data (ADR 037). Server-side only. Totals, shipping prices and taxes always come
 * from Medusa: the storefront never computes them.
 */

// Shipping option type code of the fresh-meat pickup option created by the seed (ADR 033).
export const FRESH_MEAT_PICKUP_OPTION_CODE = "pickup-fresh-meat"
export const SHIPPING_OPTION_ID_PATTERN = /^so_[0-9A-Za-z]+$/

const medusaAddressSchema = z.object({
  first_name: z.string().nullish(),
  last_name: z.string().nullish(),
  address_1: z.string().nullish(),
  address_2: z.string().nullish(),
  city: z.string().nullish(),
  postal_code: z.string().nullish(),
  province: z.string().nullish(),
  country_code: z.string().nullish(),
  phone: z.string().nullish(),
})

const checkoutCartSchema = z.object({
  id: z.string(),
  email: z.string().nullish(),
  currency_code: z.string(),
  completed_at: z.string().nullish(),
  item_total: z.number().nullish(),
  shipping_total: z.number().nullish(),
  tax_total: z.number().nullish(),
  total: z.number().nullish(),
  shipping_address: medusaAddressSchema.nullish(),
  billing_address: medusaAddressSchema.nullish(),
  shipping_methods: z
    .array(
      z.object({
        id: z.string(),
        shipping_option_id: z.string().nullish(),
        name: z.string().nullish(),
        amount: z.number().nullish(),
      })
    )
    .nullish(),
})

const checkoutCartResponseSchema = z.object({ cart: checkoutCartSchema })

const shippingOptionSchema = z.object({
  id: z.string(),
  name: z.string(),
  amount: z.number().nullish(),
  shipping_profile_id: z.string(),
  type: z
    .object({
      code: z.string().nullish(),
      label: z.string().nullish(),
      description: z.string().nullish(),
    })
    .nullish(),
})

const shippingOptionsResponseSchema = z.object({ shipping_options: z.array(shippingOptionSchema) })

export type CheckoutCart = z.infer<typeof checkoutCartSchema>
export type MedusaShippingOption = z.infer<typeof shippingOptionSchema>
export type MedusaAddressInput = {
  first_name: string
  last_name: string
  address_1: string
  address_2: string
  city: string
  postal_code: string
  province: string
  country_code: "it"
  phone: string
}

type CheckoutResult<T> = { ok: true; data: T } | { ok: false; error: CartErrorCode }

function invalidCart<T>(cartId: string): CheckoutResult<T> | null {
  return CART_ID_PATTERN.test(cartId) ? null : { ok: false, error: "not_found" }
}

export async function retrieveCheckoutCart(cartId: string): Promise<CheckoutResult<CheckoutCart>> {
  const invalid = invalidCart<CheckoutCart>(cartId)
  if (invalid) return invalid
  const result = await storeRequest(`/store/carts/${cartId}`, { method: "GET" }, checkoutCartResponseSchema)
  return result.ok ? { ok: true, data: result.data.cart } : result
}

/** Sets email and addresses. The country is always Italy (ADR 029). */
export async function updateCheckoutCart(
  cartId: string,
  body: { email: string; shipping_address: MedusaAddressInput; billing_address: MedusaAddressInput }
): Promise<CheckoutResult<CheckoutCart>> {
  const invalid = invalidCart<CheckoutCart>(cartId)
  if (invalid) return invalid
  const result = await storeRequest(
    `/store/carts/${cartId}`,
    { method: "POST", body },
    checkoutCartResponseSchema
  )
  return result.ok ? { ok: true, data: result.data.cart } : result
}

/** Shipping options Medusa offers for this cart (address, profile and price rules applied). */
export async function listCartShippingOptions(
  cartId: string
): Promise<CheckoutResult<MedusaShippingOption[]>> {
  const invalid = invalidCart<MedusaShippingOption[]>(cartId)
  if (invalid) return invalid
  const result = await storeRequest(
    `/store/shipping-options?cart_id=${encodeURIComponent(cartId)}`,
    { method: "GET" },
    shippingOptionsResponseSchema
  )
  return result.ok ? { ok: true, data: result.data.shipping_options } : result
}

/**
 * Adds one shipping method per option. Medusa replaces only the existing methods of the same
 * shipping profiles, so "courier for wine" and "pickup for meat" can coexist.
 */
export async function setCartShippingMethods(
  cartId: string,
  optionIds: string[]
): Promise<CheckoutResult<CheckoutCart>> {
  const invalid = invalidCart<CheckoutCart>(cartId)
  if (invalid) return invalid
  const result = await storeRequest(
    `/store/carts/${cartId}/shipping-methods`,
    { method: "POST", body: optionIds.map((id) => ({ option_id: id })) },
    checkoutCartResponseSchema
  )
  return result.ok ? { ok: true, data: result.data.cart } : result
}

export type ShippingGroupKey = "general" | "freshMeat"

export interface ShippingGroup {
  key: ShippingGroupKey
  profileId: string
  options: MedusaShippingOption[]
}

/**
 * Groups the offered options by shipping profile and keeps only the groups the cart needs.
 * The Store API does not expose a product's shipping profile, so the fresh-meat group is the
 * profile of the "pickup-fresh-meat" option and is needed when a line is fresh meat (category
 * `carne-fresca`). Medusa re-validates the profiles when the order is completed (ADR 033).
 */
export function groupShippingOptions(
  options: MedusaShippingOption[],
  needs: { general: boolean; freshMeat: boolean }
): ShippingGroup[] {
  const meatProfiles = new Set(
    options.filter((o) => o.type?.code === FRESH_MEAT_PICKUP_OPTION_CODE).map((o) => o.shipping_profile_id)
  )
  const byProfile = new Map<string, MedusaShippingOption[]>()
  for (const option of options) {
    byProfile.set(option.shipping_profile_id, [...(byProfile.get(option.shipping_profile_id) ?? []), option])
  }

  const groups: ShippingGroup[] = []
  for (const [profileId, profileOptions] of byProfile) {
    const key: ShippingGroupKey = meatProfiles.has(profileId) ? "freshMeat" : "general"
    if ((key === "freshMeat" && needs.freshMeat) || (key === "general" && needs.general)) {
      groups.push({ key, profileId, options: profileOptions })
    }
  }
  // General goods first, fresh meat second.
  return groups.sort((a, b) => (a.key === b.key ? 0 : a.key === "general" ? -1 : 1))
}

export interface AddressView {
  firstName: string
  lastName: string
  address1: string
  address2: string
  postalCode: string
  city: string
  province: string
  phone: string
}

function toAddressView(address: CheckoutCart["shipping_address"]): AddressView | null {
  if (!address?.address_1) {
    return null
  }
  return {
    firstName: address.first_name ?? "",
    lastName: address.last_name ?? "",
    address1: address.address_1 ?? "",
    address2: address.address_2 ?? "",
    postalCode: address.postal_code ?? "",
    city: address.city ?? "",
    province: address.province ?? "",
    phone: address.phone ?? "",
  }
}

export interface CheckoutView {
  email: string
  shippingAddress: AddressView | null
  billingAddress: AddressView | null
  billingSameAsShipping: boolean
  lines: CartLineView[]
  itemTotal: number
  shippingTotal: number
  total: number
  /** Null until an address is saved (Medusa filters options by address). */
  shippingGroups: ShippingGroup[] | null
  /** Selected option id per shipping profile. */
  selectedOptionIds: Record<string, string>
  /** True when every needed group has a selected method. */
  shippingComplete: boolean
}

export type CurrentCheckoutView =
  | { status: "ok"; checkout: CheckoutView }
  | { status: "empty" }
  | { status: "unavailable" }

export async function getCurrentCheckoutView(): Promise<CurrentCheckoutView> {
  const [cartView, cartId] = await Promise.all([getCurrentCartView(), getCartIdFromCookie()])
  if (cartView.status !== "ok") {
    return cartView
  }
  if (!cartId) {
    return { status: "empty" }
  }

  const cartResult = await retrieveCheckoutCart(cartId)
  if (!cartResult.ok) {
    return cartResult.error === "unavailable" ? { status: "unavailable" } : { status: "empty" }
  }
  const cart = cartResult.data
  const shippingAddress = toAddressView(cart.shipping_address)
  const billingAddress = toAddressView(cart.billing_address)

  let shippingGroups: ShippingGroup[] | null = null
  if (shippingAddress) {
    const optionsResult = await listCartShippingOptions(cartId)
    if (!optionsResult.ok) {
      return optionsResult.error === "unavailable" ? { status: "unavailable" } : { status: "empty" }
    }
    shippingGroups = groupShippingOptions(optionsResult.data, {
      general: cartView.cart.lines.some((l) => !l.isFreshMeat),
      freshMeat: cartView.cart.lines.some((l) => l.isFreshMeat),
    })
  }

  const offeredById = new Map(
    (shippingGroups ?? []).flatMap((g) => g.options.map((o) => [o.id, g.profileId] as const))
  )
  const selectedOptionIds: Record<string, string> = {}
  for (const method of cart.shipping_methods ?? []) {
    const profileId = method.shipping_option_id ? offeredById.get(method.shipping_option_id) : undefined
    if (profileId && method.shipping_option_id) {
      selectedOptionIds[profileId] = method.shipping_option_id
    }
  }

  return {
    status: "ok",
    checkout: {
      email: cart.email ?? "",
      shippingAddress,
      billingAddress,
      billingSameAsShipping:
        !billingAddress || JSON.stringify(billingAddress) === JSON.stringify(shippingAddress),
      lines: cartView.cart.lines,
      itemTotal: cart.item_total ?? cartView.cart.itemTotal,
      shippingTotal: cart.shipping_total ?? 0,
      total: cart.total ?? cartView.cart.itemTotal,
      shippingGroups,
      selectedOptionIds,
      shippingComplete:
        !!shippingGroups &&
        shippingGroups.length > 0 &&
        shippingGroups.every((g) => !!selectedOptionIds[g.profileId]),
    },
  }
}
