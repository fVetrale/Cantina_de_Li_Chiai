/**
 * Age verification for alcohol sales (ADR 038). Protected zone: written with the user's explicit
 * authorization on 2026-11-05.
 *
 * Italian law (L. 125/2001) forbids selling alcohol to people under 18. The storefront asks for
 * the date of birth and an explicit declaration, checks the age on its server and then DISCARDS
 * the date of birth (privacy: it is never sent to Medusa nor stored). It stores only this
 * declaration in the cart metadata, which Medusa copies to the order:
 *
 *   metadata.age_verification = {
 *     method: "self_declaration",
 *     declared_adult: true,
 *     minimum_age: 18,
 *     declared_at: "<ISO timestamp>"
 *   }
 *
 * The declaration contains no personal data on purpose: an order can be read through the Store
 * API by anyone who knows its id.
 *
 * Extensible: a certified method (e.g. AGCOM "double anonymity" provider, EU age verification
 * app, IT-Wallet) can be added to SUPPORTED_METHODS with its own token check, if a lawyer
 * confirms that AGCOM 96/25/CONS applies to this shop.
 */

export const AGE_VERIFICATION_METADATA_KEY = "age_verification"
export const MINIMUM_AGE = 18
export const SUPPORTED_METHODS = ["self_declaration"] as const
export type AgeVerificationMethod = (typeof SUPPORTED_METHODS)[number]

/** A declaration older than this is stale: the buyer must confirm again. */
export const DECLARATION_MAX_AGE_MS = 24 * 60 * 60 * 1000
/** Tolerance for clock differences between the storefront and the backend. */
export const CLOCK_SKEW_MS = 5 * 60 * 1000

/** Message returned to the client when completion is refused (no personal data in it). */
export const AGE_VERIFICATION_REQUIRED_MESSAGE =
  "Age verification required: the buyer must declare to be at least 18 years old."

export type AgeVerificationFailure =
  | "missing"
  | "invalid"
  | "unsupported_method"
  | "not_adult"
  | "stale"

export type AgeVerificationResult =
  | { ok: true; method: AgeVerificationMethod }
  | { ok: false; reason: AgeVerificationFailure }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

/**
 * Checks the age declaration stored in a cart's (or order's) metadata.
 * Pure function: `now` is injected so the rule is fully unit-testable.
 */
export function validateAgeDeclaration(metadata: unknown, now: Date): AgeVerificationResult {
  if (!isRecord(metadata) || !(AGE_VERIFICATION_METADATA_KEY in metadata)) {
    return { ok: false, reason: "missing" }
  }
  const declaration = metadata[AGE_VERIFICATION_METADATA_KEY]
  if (!isRecord(declaration)) {
    return { ok: false, reason: "invalid" }
  }

  const { method, declared_adult, minimum_age, declared_at } = declaration
  if (!SUPPORTED_METHODS.includes(method as AgeVerificationMethod)) {
    return { ok: false, reason: "unsupported_method" }
  }
  if (declared_adult !== true || minimum_age !== MINIMUM_AGE) {
    return { ok: false, reason: "not_adult" }
  }
  if (typeof declared_at !== "string") {
    return { ok: false, reason: "invalid" }
  }
  const declaredAt = Date.parse(declared_at)
  if (Number.isNaN(declaredAt)) {
    return { ok: false, reason: "invalid" }
  }
  const ageMs = now.getTime() - declaredAt
  if (ageMs < -CLOCK_SKEW_MS || ageMs > DECLARATION_MAX_AGE_MS) {
    return { ok: false, reason: "stale" }
  }

  return { ok: true, method: method as AgeVerificationMethod }
}
