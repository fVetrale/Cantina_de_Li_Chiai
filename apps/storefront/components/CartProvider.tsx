"use client";

import { createContext, useContext, type ReactNode } from "react";

/**
 * Cart counter shared by the whole site (ADR 036). The root layout reads the visitor's cart on
 * the server and passes only these two numbers down; cart Server Actions call refresh(), which
 * re-renders the layout with fresh values.
 */
export interface CartCounter {
  /** Units in the cart. */
  itemCount: number;
  /** Items total, IVA included, in EUR. */
  itemTotal: number;
}

const EMPTY_COUNTER: CartCounter = { itemCount: 0, itemTotal: 0 };

const CartCounterContext = createContext<CartCounter>(EMPTY_COUNTER);

export function CartProvider({
  counter,
  children,
}: {
  counter: CartCounter | null;
  children: ReactNode;
}) {
  return (
    <CartCounterContext value={counter ?? EMPTY_COUNTER}>{children}</CartCounterContext>
  );
}

export function useCartCounter(): CartCounter {
  return useContext(CartCounterContext);
}
