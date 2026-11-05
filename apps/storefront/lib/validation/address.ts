import { z } from "zod"

/**
 * Italian address and phone rules shared by the checkout (ADR 037) and the address book
 * (ADR 041). Server-side validation is authoritative; the country is always Italy (ADR 029).
 */

const requiredText = (max: number) => z.string().trim().min(1).max(max)

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[0-9][0-9 ]{5,19}$/)

export const addressInputSchema = z.object({
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

export type AddressInput = z.infer<typeof addressInputSchema>
