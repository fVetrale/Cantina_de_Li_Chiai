"use server"

import { refresh } from "next/cache"
import { z } from "zod"
import { getCartIdFromCookie } from "@/lib/data/cart-session"
import {
  SHIPPING_OPTION_ID_PATTERN,
  listCartShippingOptions,
  setCartShippingMethods,
  updateCheckoutCart,
  type MedusaAddressInput,
} from "@/lib/data/checkout"

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
