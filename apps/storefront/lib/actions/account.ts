"use server"

import { refresh } from "next/cache"
import { z } from "zod"
import { getAuthToken } from "@/lib/data/auth-session"
import {
  ADDRESS_ID_PATTERN,
  deleteAddress as deleteAddressData,
  saveAddress as saveAddressData,
  updateProfile as updateProfileData,
  type AccountResult,
} from "@/lib/data/account"
import { MAX_NAME_LENGTH } from "@/lib/auth-rules"
import { addressInputSchema, phoneSchema } from "@/lib/validation/address"

/**
 * Reserved-area Server Actions (ADR 041).
 * - The customer token comes ONLY from the httpOnly cookie; no customer or cart id is ever
 *   accepted from the client.
 * - Address ids from the client are format-checked and only used under /store/customers/me,
 *   where Medusa answers 404 for an address of another customer (integration-tested).
 * - Inputs are validated with Zod; the country is always Italy.
 */

export type AccountActionError = "invalid_input" | "unauthenticated" | "not_found" | "unavailable"
export type AccountActionResult = { ok: true } | { ok: false; error: AccountActionError; fields?: string[] }

const profileInputSchema = z.object({
  firstName: z.string().trim().min(1).max(MAX_NAME_LENGTH),
  lastName: z.string().trim().min(1).max(MAX_NAME_LENGTH),
  // Optional: empty string clears it.
  phone: z.union([z.literal(""), phoneSchema]).default(""),
})

const addressSaveInputSchema = z.object({
  id: z.string().regex(ADDRESS_ID_PATTERN).nullable().default(null),
  address: addressInputSchema,
  phone: z.union([z.literal(""), phoneSchema]).default(""),
  isDefault: z.boolean().default(false),
})

const addressDeleteInputSchema = z.object({ id: z.string().regex(ADDRESS_ID_PATTERN) })

function fieldsOf(error: z.ZodError): string[] {
  return [...new Set(error.issues.map((issue) => issue.path.join(".")))]
}

function done(result: AccountResult<unknown>): AccountActionResult {
  if (!result.ok) return { ok: false, error: result.error }
  refresh()
  return { ok: true }
}

async function requireToken(): Promise<string | null> {
  return (await getAuthToken()) ?? null
}

export async function updateProfile(input: unknown): Promise<AccountActionResult> {
  const parsed = profileInputSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: "invalid_input", fields: fieldsOf(parsed.error) }
  const token = await requireToken()
  if (!token) return { ok: false, error: "unauthenticated" }
  return done(await updateProfileData(token, parsed.data))
}

export async function saveAddress(input: unknown): Promise<AccountActionResult> {
  const parsed = addressSaveInputSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: "invalid_input", fields: fieldsOf(parsed.error) }
  const token = await requireToken()
  if (!token) return { ok: false, error: "unauthenticated" }
  const { id, address, phone, isDefault } = parsed.data
  return done(await saveAddressData(token, id, { ...address, phone, isDefault }))
}

export async function deleteAddress(input: unknown): Promise<AccountActionResult> {
  const parsed = addressDeleteInputSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: "invalid_input" }
  const token = await requireToken()
  if (!token) return { ok: false, error: "unauthenticated" }
  return done(await deleteAddressData(token, parsed.data.id))
}
