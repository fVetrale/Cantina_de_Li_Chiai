"use server"

import { cookies } from "next/headers"
import { refresh } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"
import { checkAge, MINIMUM_AGE } from "@/lib/age"
import { CART_COOKIE, getCartIdFromCookie } from "@/lib/data/cart-session"
import {
  SHIPPING_OPTION_ID_PATTERN,
  TEST_PAYMENT_PROVIDER_ID,
  completeCart,
  initiatePaymentSession,
  listCartShippingOptions,
  retrieveCheckoutCart,
  setAgeDeclaration,
  setCartShippingMethods,
  updateCheckoutCart,
  type MedusaAddressInput,
} from "@/lib/data/checkout"
import { ORDER_COOKIE, ORDER_COOKIE_OPTIONS } from "@/lib/data/order-session"

/**
 * Checkout Server Actions (ADR 037). Like the cart actions (ADR 035/036): every input is
 * validated with Zod, the cart comes ONLY from the httpOnly cookie, and the country is always
 * Italy (ADR 029), whatever the client sends.
 */

const requiredText = (max: number) => z.string().trim().min(1).max(max)

const addressInputSchema = z.object({
  firstName: requiredText(60),
  lastName: requiredText(60),
  address1: requiredText(120),
  address2: z.string().trim().max(120).default(""),
  postalCode: z.string().trim().regex(/^\d{5}$/), // Italian CAP
  city: requiredText(60),
  province: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{2}$/), // Italian province code, e.g. "SA"
})

const checkoutDetailsInputSchema = z
  .object({
    email: z.email().max(254),
    phone: z
      .string()
      .trim()
      .regex(/^\+?[0-9][0-9 ]{5,19}$/),
    shipping: addressInputSchema,
    billingSameAsShipping: z.boolean(),
    billing: addressInputSchema.optional(),
  })
  .refine((data) => data.billingSameAsShipping || data.billing, { path: ["billing"] })

const selectShippingInputSchema = z.object({
  optionIds: z
    .array(z.string().regex(SHIPPING_OPTION_ID_PATTERN))
    .min(1)
    .max(5)
    .refine((ids) => new Set(ids).size === ids.length),
})

export type CheckoutActionError = "invalid_input" | "not_allowed" | "not_found" | "unavailable"

export type SaveDetailsResult =
  | { ok: true }
  | { ok: false; error: CheckoutActionError; fields?: string[] }

export type SelectShippingResult = { ok: true } | { ok: false; error: CheckoutActionError }

type AddressInput = z.infer<typeof addressInputSchema>

function toMedusaAddress(address: AddressInput, phone: string): MedusaAddressInput {
  return {
    first_name: address.firstName,
    last_name: address.lastName,
    address_1: address.address1,
    address_2: address.address2,
    city: address.city,
    postal_code: address.postalCode,
    province: address.province,
    country_code: "it",
    phone,
  }
}

/** Saves email, phone and addresses on the visitor's cart. */
export async function saveCheckoutDetails(input: unknown): Promise<SaveDetailsResult> {
  const parsed = checkoutDetailsInputSchema.safeParse(input)
  if (!parsed.success) {
    // Field paths only (e.g. "shipping.postalCode"): the UI shows its own i18n message.
    const fields = [...new Set(parsed.error.issues.map((issue) => issue.path.join(".")))]
    return { ok: false, error: "invalid_input", fields }
  }
  const cartId = await getCartIdFromCookie()
  if (!cartId) {
    return { ok: false, error: "not_found" }
  }

  const { email, phone, shipping, billing, billingSameAsShipping } = parsed.data
  const shippingAddress = toMedusaAddress(shipping, phone)
  const result = await updateCheckoutCart(cartId, {
    email,
    shipping_address: shippingAddress,
    billing_address: billingSameAsShipping || !billing ? shippingAddress : toMedusaAddress(billing, phone),
  })
  if (!result.ok) {
    return { ok: false, error: result.error === "not_found" ? "not_found" : "unavailable" }
  }
  refresh()
  return { ok: true }
}

/**
 * Sets the shipping methods. Only options that Medusa offers for this cart are accepted, at
 * most one per shipping profile.
 */
export async function selectShippingOptions(input: unknown): Promise<SelectShippingResult> {
  const parsed = selectShippingInputSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: "invalid_input" }
  }
  const cartId = await getCartIdFromCookie()
  if (!cartId) {
    return { ok: false, error: "not_found" }
  }

  const offered = await listCartShippingOptions(cartId)
  if (!offered.ok) {
    return { ok: false, error: offered.error === "not_found" ? "not_found" : "unavailable" }
  }
  const profileByOption = new Map(offered.data.map((o) => [o.id, o.shipping_profile_id]))
  const profiles = parsed.data.optionIds.map((id) => profileByOption.get(id))
  if (profiles.some((p) => !p) || new Set(profiles).size !== profiles.length) {
    return { ok: false, error: "not_allowed" }
  }

  const result = await setCartShippingMethods(cartId, parsed.data.optionIds)
  if (!result.ok) {
    return { ok: false, error: result.error === "not_found" ? "not_found" : "unavailable" }
  }
  refresh()
  return { ok: true }
}

// ─── Place order (ADR 038, 039) ──────────────────────────────────────────────

const placeOrderInputSchema = z.object({
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  declaredAdult: z.literal(true),
  acceptTerms: z.literal(true),
  locale: z.enum(["it", "en"]).default("it"),
})

export type PlaceOrderError =
  | "invalid_input"
  | "underage"
  | "incomplete"
  | "out_of_stock"
  | "age_rejected"
  | "payment_failed"
  | "rejected"
  | "not_found"
  | "unavailable"

export type PlaceOrderResult = { ok: false; error: PlaceOrderError }

/**
 * Places the order with Medusa's TEST payment provider (no real charge: Stripe comes in
 * tasks 4–5, and the site must not go live before that).
 *
 * Privacy: the date of birth is only used here to check the age, then discarded. It is never
 * sent to Medusa, stored, returned or logged. Medusa receives only a declaration without
 * personal data, and its age-verification hook refuses completion without it (ADR 038).
 *
 * On success it redirects to /ordine/confermato (redirect() throws, so it never returns).
 */
export async function placeOrder(input: unknown): Promise<PlaceOrderResult> {
  const parsed = placeOrderInputSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: "invalid_input" }
  }

  const age = checkAge(parsed.data.birthDate, new Date())
  if (age === "invalid") {
    return { ok: false, error: "invalid_input" }
  }
  if (age === "underage") {
    return { ok: false, error: "underage" }
  }

  const cartId = await getCartIdFromCookie()
  if (!cartId) {
    return { ok: false, error: "not_found" }
  }

  // Friendly pre-check: Medusa would refuse anyway, with a less helpful message.
  const cart = await retrieveCheckoutCart(cartId)
  if (!cart.ok) {
    return { ok: false, error: cart.error === "not_found" ? "not_found" : "unavailable" }
  }
  if (!cart.data.email || !cart.data.shipping_address?.address_1 || !cart.data.shipping_methods?.length) {
    return { ok: false, error: "incomplete" }
  }

  const declaration = await setAgeDeclaration(cartId, {
    method: "self_declaration",
    declared_adult: true,
    minimum_age: MINIMUM_AGE,
    declared_at: new Date().toISOString(),
  })
  if (!declaration.ok) {
    return { ok: false, error: declaration.error === "not_found" ? "not_found" : "unavailable" }
  }

  const payment = await initiatePaymentSession(cartId, TEST_PAYMENT_PROVIDER_ID)
  if (!payment.ok) {
    return { ok: false, error: payment.error === "not_found" ? "not_found" : "unavailable" }
  }

  const completed = await completeCart(cartId)
  if (!completed.ok) {
    return { ok: false, error: completed.error }
  }

  // The cart is now an order: forget the cart, remember the order for the confirmation page only.
  const cookieStore = await cookies()
  cookieStore.delete(CART_COOKIE)
  cookieStore.set(ORDER_COOKIE, completed.orderId, ORDER_COOKIE_OPTIONS)

  redirect(parsed.data.locale === "en" ? "/ordine/confermato?lang=en" : "/ordine/confermato")
}
