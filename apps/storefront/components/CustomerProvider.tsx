"use client";

import { createContext, useContext, type ReactNode } from "react";

/**
 * Who is logged in, as far as the browser needs to know (ADR 040, 042): the first name (for the
 * "Ciao, Nome" greeting) and the product ids in the wishlist (for the hearts). No email,
 * customer id or token ever reaches client components.
 */
export interface CustomerGreeting {
  firstName: string;
  wishlist: string[];
}

const CustomerContext = createContext<CustomerGreeting | null>(null);

export function CustomerProvider({
  customer,
  children,
}: {
  customer: CustomerGreeting | null;
  children: ReactNode;
}) {
  return <CustomerContext value={customer}>{children}</CustomerContext>;
}

/** null for guests. */
export function useCustomer(): CustomerGreeting | null {
  return useContext(CustomerContext);
}
