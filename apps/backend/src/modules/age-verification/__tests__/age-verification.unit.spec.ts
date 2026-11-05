import {
  AGE_VERIFICATION_METADATA_KEY,
  CLOCK_SKEW_MS,
  DECLARATION_MAX_AGE_MS,
  MINIMUM_AGE,
  validateAgeDeclaration,
} from "../index"

const NOW = new Date("2026-11-05T10:00:00.000Z")

function metadataWith(declaration: unknown, extra: Record<string, unknown> = {}) {
  return { ...extra, [AGE_VERIFICATION_METADATA_KEY]: declaration }
}

const validDeclaration = {
  method: "self_declaration",
  declared_adult: true,
  minimum_age: MINIMUM_AGE,
  declared_at: "2026-11-05T09:58:00.000Z",
}

describe("validateAgeDeclaration", () => {
  it("accepts a fresh self-declaration of an adult", () => {
    expect(validateAgeDeclaration(metadataWith(validDeclaration), NOW)).toEqual({
      ok: true,
      method: "self_declaration",
    })
  })

  it("ignores unrelated metadata keys", () => {
    expect(validateAgeDeclaration(metadataWith(validDeclaration, { gift: true }), NOW).ok).toBe(true)
  })

  it.each([
    ["no metadata", null],
    ["empty metadata", {}],
    ["metadata without the key", { other: 1 }],
    ["metadata is an array", [validDeclaration]],
  ])("rejects %s as missing", (_label, metadata) => {
    expect(validateAgeDeclaration(metadata, NOW)).toEqual({ ok: false, reason: "missing" })
  })

  it.each([
    ["a string", "yes"],
    ["null", null],
    ["an array", [1]],
  ])("rejects a declaration that is %s", (_label, declaration) => {
    expect(validateAgeDeclaration(metadataWith(declaration), NOW)).toEqual({ ok: false, reason: "invalid" })
  })

  it.each(["", "eu_age_app", "SELF_DECLARATION", undefined])("rejects unsupported method %j", (method) => {
    expect(validateAgeDeclaration(metadataWith({ ...validDeclaration, method }), NOW)).toEqual({
      ok: false,
      reason: "unsupported_method",
    })
  })

  it.each([
    ["declared_adult false", { declared_adult: false }],
    ["declared_adult as string", { declared_adult: "true" }],
    ["declared_adult missing", { declared_adult: undefined }],
    ["minimum age 16", { minimum_age: 16 }],
    ["minimum age as string", { minimum_age: "18" }],
  ])("rejects %s", (_label, override) => {
    expect(validateAgeDeclaration(metadataWith({ ...validDeclaration, ...override }), NOW)).toEqual({
      ok: false,
      reason: "not_adult",
    })
  })

  it.each([
    ["missing", undefined],
    ["not a date", "yesterday"],
    ["a number", 1762336680000],
  ])("rejects declared_at %s", (_label, declared_at) => {
    expect(validateAgeDeclaration(metadataWith({ ...validDeclaration, declared_at }), NOW)).toEqual({
      ok: false,
      reason: "invalid",
    })
  })

  it("rejects a declaration older than 24 hours", () => {
    const declared_at = new Date(NOW.getTime() - DECLARATION_MAX_AGE_MS - 1000).toISOString()
    expect(validateAgeDeclaration(metadataWith({ ...validDeclaration, declared_at }), NOW)).toEqual({
      ok: false,
      reason: "stale",
    })
  })

  it("accepts a declaration exactly 24 hours old", () => {
    const declared_at = new Date(NOW.getTime() - DECLARATION_MAX_AGE_MS).toISOString()
    expect(validateAgeDeclaration(metadataWith({ ...validDeclaration, declared_at }), NOW).ok).toBe(true)
  })

  it("tolerates small clock skew but rejects declarations from the future", () => {
    const slightlyAhead = new Date(NOW.getTime() + CLOCK_SKEW_MS - 1000).toISOString()
    const farAhead = new Date(NOW.getTime() + CLOCK_SKEW_MS + 1000).toISOString()
    expect(validateAgeDeclaration(metadataWith({ ...validDeclaration, declared_at: slightlyAhead }), NOW).ok).toBe(true)
    expect(validateAgeDeclaration(metadataWith({ ...validDeclaration, declared_at: farAhead }), NOW)).toEqual({
      ok: false,
      reason: "stale",
    })
  })
})
