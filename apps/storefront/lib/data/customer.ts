import { z } from "zod"
import { storeRequest } from "@/lib/data/cart"

/**
 * Customer authentication with Medusa's built-in emailpass provider (ADR 040). Server-side only.
 * Passwords are hashed and checked by Medusa: we never store, hash or log them. Emails and
 * passwords travel only in request bodies (never in URLs or logs).
 */

// A JWT has three base64url parts. Anything else (e.g. a tampered cookie) is never sent.
export const JWT_PATTERN = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/

const tokenResponseSchema = z.object({ token: z.string().regex(JWT_PATTERN) })

const customerSchema = z.object({
  id: z.string(),
  email: z.string(),
  first_name: z.string().nullish(),
  last_name: z.string().nullish(),
  phone: z.string().nullish(),
})
const customerResponseSchema = z.object({ customer: customerSchema })

export type MedusaCustomer = z.infer<typeof customerSchema>

export type AuthResult =
  | { ok: true; token: string }
  | { ok: false; error: "invalid_credentials" | "rejected" | "unavailable" }

/** Email + password login. Any refusal is reported as `invalid_credentials` (no detail). */
export async function loginWithEmailPassword(email: string, password: string): Promise<AuthResult> {
  const result = await storeRequest(
    "/auth/customer/emailpass",
    { method: "POST", body: { email, password } },
    tokenResponseSchema
  )
  if (result.ok) {
    return { ok: true, token: result.data.token }
  }
  return {
    ok: false,
    error: result.status === 401 || result.status === 400 ? "invalid_credentials" : "unavailable",
  }
}

/**
 * Creates the auth identity, then the customer profile, then logs in (Medusa's flow:
 * the registration token can only create the customer; a normal login token is needed after).
 * Any refusal (e.g. the email already exists) is reported as `rejected` without detail, so the
 * form cannot be used to discover registered emails.
 */
export async function registerCustomer(input: {
  email: string
  password: string
  firstName: string
  lastName: string
}): Promise<AuthResult> {
  const registration = await storeRequest(
    "/auth/customer/emailpass/register",
    { method: "POST", body: { email: input.email, password: input.password } },
    tokenResponseSchema
  )
  if (!registration.ok) {
    return {
      ok: false,
      error: registration.status === 401 || registration.status === 400 ? "rejected" : "unavailable",
    }
  }

  const customer = await storeRequest(
    "/store/customers",
    {
      method: "POST",
      body: { email: input.email, first_name: input.firstName, last_name: input.lastName },
      authToken: registration.data.token,
    },
    customerResponseSchema
  )
  if (!customer.ok) {
    return { ok: false, error: customer.status && customer.status < 500 ? "rejected" : "unavailable" }
  }

  const login = await loginWithEmailPassword(input.email, input.password)
  return login.ok ? login : { ok: false, error: "unavailable" }
}

export type CustomerResult =
  | { ok: true; customer: MedusaCustomer }
  | { ok: false; error: "unauthenticated" | "unavailable" }

/** The logged-in customer. `unauthenticated` when the token is missing, invalid or expired. */
export async function retrieveCustomer(token: string): Promise<CustomerResult> {
  if (!JWT_PATTERN.test(token)) {
    return { ok: false, error: "unauthenticated" }
  }
  const result = await storeRequest(
    "/store/customers/me?fields=id,email,first_name,last_name,phone",
    { method: "GET", authToken: token },
    customerResponseSchema
  )
  if (result.ok) {
    return { ok: true, customer: result.data.customer }
  }
  return {
    ok: false,
    error: result.status === 401 || result.error === "not_found" ? "unauthenticated" : "unavailable",
  }
}
