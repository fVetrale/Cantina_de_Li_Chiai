"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, AlertCircle } from "lucide-react";
import { removeCartItem, updateCartItem, type CartItemError } from "@/lib/actions/cart";
import type { CartLineView } from "@/lib/data/cart-session";
import type { Dictionary } from "@/lib/i18n";

// Same bound as MAX_ADD_QUANTITY in lib/data/cart.ts (validated again on the server).
const MAX_QUANTITY = 120;

interface CartLineItemProps {
  line: CartLineView;
  productHref: string;
  t: Dictionary["cartPage"];
  cartT: Pick<Dictionary["cart"], "available" | "errorOutOfStock" | "errorUnavailable" | "errorInvalid">;
}

function formatEuro(amount: number) {
  return amount.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** One cart row (ADR 036). Changes go through Server Actions; refresh() re-renders the page. */
export function CartLineItem({ line, productHref, t, cartT }: CartLineItemProps) {
  const [error, setError] = useState<CartItemError | null>(null);
  const [isPending, startTransition] = useTransition();

  const maxQuantity = line.available === null ? MAX_QUANTITY : Math.min(line.available, MAX_QUANTITY);
  const atMax = line.quantity >= maxQuantity;

  const run = (action: () => Promise<{ ok: true } | { ok: false; error: CartItemError }>) => {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        setError(result.error);
      }
    });
  };

  const changeQuantity = (quantity: number) =>
    run(() => updateCartItem({ lineItemId: line.id, quantity }));
  const remove = () => run(() => removeCartItem({ lineItemId: line.id }));

  const errorMessage =
    error === "out_of_stock"
      ? cartT.errorOutOfStock
      : error === "not_found"
        ? t.errorNotFound
        : error === "invalid_input"
          ? cartT.errorInvalid
          : error === "unavailable"
            ? cartT.errorUnavailable
            : null;

  // Editorial cart row (ADR 050): portrait photo, serif name, thin quantity stepper, text link to remove.
  return (
    <li
      className={`grid grid-cols-[auto_1fr] gap-5 sm:gap-8 py-8 border-b border-ivory-300 transition-opacity ${
        isPending ? "opacity-60" : ""
      }`}
      aria-busy={isPending}
    >
      <Link href={productHref} className="relative block w-24 h-32 sm:w-28 sm:h-36 shrink-0 overflow-hidden bg-gray-100">
        <Image src={line.image} alt={line.title} fill sizes="112px" className="object-cover" />
      </Link>

      <div className="min-w-0 flex flex-col">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <Link href={productHref} className="font-serif text-2xl leading-tight text-black hover:text-gold-700 transition-colors">
              {line.title}
            </Link>
            {line.variantTitle && (
              <p className="mt-2 font-sans text-[11px] font-bold uppercase tracking-[2px] text-gray-600">{line.variantTitle}</p>
            )}
            <p className="mt-1 text-sm text-gray-600">
              € {formatEuro(line.unitPrice)} {t.each}
              {line.available !== null && (
                <span className="ml-2 text-olive-700">
                  · <strong>{line.available}</strong> {cartT.available}
                </span>
              )}
            </p>
          </div>
          <p className="font-serif text-xl text-black whitespace-nowrap">€ {formatEuro(line.lineTotal)}</p>
        </div>

        <div className="mt-auto pt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
          <div className="inline-flex items-center border border-ivory-400" role="group" aria-label={`${t.quantity}: ${line.title}`}>
            <button
              type="button"
              onClick={() => changeQuantity(line.quantity - 1)}
              disabled={isPending || line.quantity <= 1}
              aria-label={t.decrease}
              className="flex h-10 w-10 items-center justify-center text-black hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-10 text-center text-sm font-bold text-black" aria-live="polite">
              {line.quantity}
            </span>
            <button
              type="button"
              onClick={() => changeQuantity(line.quantity + 1)}
              disabled={isPending || atMax}
              aria-label={t.increase}
              className="flex h-10 w-10 items-center justify-center text-black hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={remove}
            disabled={isPending}
            className="link-editorial text-gray-600 hover:text-black disabled:opacity-50"
          >
            {t.remove}
          </button>

          {atMax && line.available !== null && <span className="text-[11px] text-gray-600">{t.maxReached}</span>}
        </div>

        {errorMessage && (
          <p role="alert" className="mt-3 flex items-start gap-1.5 text-xs text-rose-700">
            <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" aria-hidden="true" />
            <span>{errorMessage}</span>
          </p>
        )}
      </div>
    </li>
  );
}
