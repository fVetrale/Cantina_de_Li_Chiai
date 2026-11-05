import { redirect } from "next/navigation"
import { getAuthToken, getCurrentCustomer, type CurrentCustomer } from "@/lib/data/auth-session"
import type { Locale } from "@/lib/i18n"

/**
 * Reserved-area pages call this first (ADR 041). Guests, expired or invalid tokens are sent to
 * the login page; nothing of the reserved area is rendered for them.
 */
export async function requireCustomer(locale: Locale): Promise<{ customer: CurrentCustomer; token: string }> {
  const [customer, token] = await Promise.all([getCurrentCustomer(), getAuthToken()])
  if (!customer || !token) {
    redirect(locale === "en" ? "/account?lang=en" : "/account")
  }
  return { customer, token }
}
