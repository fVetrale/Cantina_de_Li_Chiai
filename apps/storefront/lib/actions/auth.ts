"use server"

import { cookies } from "next/headers"
import { refresh } from "next/cache"
import { z } from "zod"
import { MAX_NAME_LENGTH, MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from "@/lib/auth-rules"
import { transferCartToCustomer } from "@/lib/data/cart"
import { CART_COOKIE } from "@/lib/data/cart-session"
import { AUTH_COOKIE, AUTH_COOKIE_OPTIONS } from "@/lib/data/auth-session"
import { loginWithEmailPassword, registerCustomer } from "@/lib/data/customer"

/**
 * Customer auth Server Actions (ADR 040, docs/sicurezza-sessioni-e-produzione.md).
 * - Inputs are validated with Zod on the server.
 * - Errors are generic: the forms cannot be used to find out which emails are registered.
 * - The token goes only into the httpOnly cookie: it is never returned to the browser.
 * - Emails and passwords are never logged.
 */

const loginInputSchema = z.object({
  email: z.email().max(254),
  password: z.string().min(1).max(MAX_PASSWORD_LENGTH),
})

const registerInputSchema = z.object({
  firstName: z.string().trim().min(1).max(MAX_NAME_LENGTH),
  lastName: z.string().trim().min(1).max(MAX_NAME_LENGTH),
  email: z.email().max(254),
  password: z.string().min(MIN_PASSWORD_LENGTH).max(MAX_PASSWORD_LENGTH),
  ageConfirmed: z.literal(true),
  privacyAccepted: z.literal(true),
})

export type AuthActionError = "invalid_input" | "invalid_credentials" | "rejected" | "unavailable"

export type AuthActionResult = { ok: true } | { ok: false; error: AuthActionError; fields?: string[] }

function invalidFields(error: z.ZodError): string[] {
  return [...new Set(error.issues.map((issue) => issue.path.join(".")))]
}

/** Stores the token in the httpOnly cookie and links the guest cart (if any) to the customer. */
async function startSession(token: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(AUTH_COOKIE, token, AUTH_COOKIE_OPTIONS)

  const cartId = cookieStore.get(CART_COOKIE)?.value
  if (cartId) {
    // Best effort: a failure here must not block the login (the cart simply stays a guest cart).
    await transferCartToCustomer(cartId, token)
  }
  refresh()
}

export async function login(input: unknown): Promise<AuthActionResult> {
  const parsed = loginInputSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: "invalid_input", fields: invalidFields(parsed.error) }
  }
  const result = await loginWithEmailPassword(parsed.data.email.toLowerCase(), parsed.data.password)
  if (!result.ok) {
    return { ok: false, error: result.error === "unavailable" ? "unavailable" : "invalid_credentials" }
  }
  await startSession(result.token)
  return { ok: true }
}

export async function register(input: unknown): Promise<AuthActionResult> {
  const parsed = registerInputSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: "invalid_input", fields: invalidFields(parsed.error) }
  }
  const result = await registerCustomer({
    email: parsed.data.email.toLowerCase(),
    password: parsed.data.password,
    firstName: parsed.data.firstName,
    lastName: parsed.data.lastName,
  })
  if (!result.ok) {
    return { ok: false, error: result.error === "unavailable" ? "unavailable" : "rejected" }
  }
  await startSession(result.token)
  return { ok: true }
}

/**
 * Ends the session on this browser. The cart cookie is removed too: after login the cart
 * belongs to the customer (it can hold their email and address), and on a shared computer the
 * next visitor must not see it.
 */
export async function logout(): Promise<{ ok: true }> {
  const cookieStore = await cookies()
  cookieStore.delete(AUTH_COOKIE)
  cookieStore.delete(CART_COOKIE)
  refresh()
  return { ok: true }
}
