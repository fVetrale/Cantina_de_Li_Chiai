/**
 * Age check from a date of birth (ADR 038). Pure functions, usable on the server (authoritative
 * check in the placeOrder Server Action) and in the browser (instant feedback only).
 *
 * The date of birth is never stored or sent to Medusa: only the result is used.
 */

export const MINIMUM_AGE = 18
const MAX_AGE = 120
const BIRTH_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/

export type AgeCheck = "adult" | "underage" | "invalid"

interface YMD {
  year: number
  month: number // 1-12
  day: number
}

function parseYMD(value: string): YMD | null {
  const match = BIRTH_DATE_PATTERN.exec(value)
  if (!match) return null
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])]
  // Reject impossible dates such as 2007-02-30 (Date.UTC would silently roll them over).
  const date = new Date(Date.UTC(year, month - 1, day))
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    return null
  }
  return { year, month, day }
}

/** Today's calendar date in Italy: the birthday counts from midnight in Rome, not UTC. */
export function todayInRome(now: Date): YMD {
  const [year, month, day] = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Rome",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(now)
    .split("-")
    .map(Number)
  return { year, month, day }
}

/** Completed years between birth and today. Born on 29 Feb: the birthday is 1 Mar in common years. */
function completedYears(birth: YMD, today: YMD): number {
  const beforeBirthday =
    today.month < birth.month || (today.month === birth.month && today.day < birth.day)
  return today.year - birth.year - (beforeBirthday ? 1 : 0)
}

export function checkAge(birthDate: string, now: Date, minimumAge = MINIMUM_AGE): AgeCheck {
  const birth = parseYMD(birthDate.trim())
  if (!birth) return "invalid"
  const today = todayInRome(now)
  const years = completedYears(birth, today)
  if (years < 0 || years > MAX_AGE) return "invalid" // future date or implausible
  return years >= minimumAge ? "adult" : "underage"
}

/** Latest date of birth that is adult today (YYYY-MM-DD), for the date input's `max`. */
export function latestAdultBirthDate(now: Date, minimumAge = MINIMUM_AGE): string {
  const today = todayInRome(now)
  // 29 Feb of a leap year minus 18 years may not exist: fall back to 28 Feb.
  const candidate = parseYMD(
    `${today.year - minimumAge}-${String(today.month).padStart(2, "0")}-${String(today.day).padStart(2, "0")}`
  )
  const { year, month, day } = candidate ?? { year: today.year - minimumAge, month: 2, day: 28 }
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}
