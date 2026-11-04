"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, Snowflake, AlertCircle } from "lucide-react";
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

  return (
    <li
      className={`flex gap-4 py-5 border-b border-ivory-200 last:border-b-0 transition-opacity ${
        isPending ? "opacity-60" : ""
      }`}
      aria-busy={isPending}
    >
      <Link
        href={productHref}
        className="relative w-20 h-24 sm:w-24 sm:h-28 shrink-0 rounded-xl bg-ivory-50 border border-ivory-200 overflow-hidden"
      >
        <Image src={line.image} alt={line.title} fill sizes="96px" className="object-contain p-1.5" />
      </Link>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              href={productHref}
              className="font-serif text-lg font-bold text-wine-950 hover:underline leading-snug"
            >
              {line.title}
            </Link>
            {line.variantTitle && <p className="text-xs text-cellar-500">{line.variantTitle}</p>}
            <p className="text-xs text-cellar-600 mt-0.5">
              € {formatEuro(line.unitPrice)} {t.each}
              {line.available !== null && (
                <span className="ml-2 text-olive-700">
                  • <strong>{line.available}</strong> {cartT.available}
                </span>
              )}
            </p>
          </div>
          <p className="font-serif text-lg font-bold text-wine-950 whitespace-nowrap">
            € {formatEuro(line.lineTotal)}
          </p>
        </div>

        {line.isFreshMeat && (
          <p className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-sky-50 border border-sky-200 px-2.5 py-1 text-[11px] font-medium text-sky-900">
            <Snowflake className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            {t.freshMeatPickupOnly}
          </p>
        )}

        <div className="mt-3 flex items-center gap-4">
          <div
            className="inline-flex items-center rounded-full border border-ivory-300 bg-white"
            role="group"
            aria-label={`${t.quantity}: ${line.title}`}
          >
            <button
              type="button"
              onClick={() => changeQuantity(line.quantity - 1)}
              disabled={isPending || line.quantity <= 1}
              aria-label={t.decrease}
              className="p-2 rounded-l-full text-cellar-700 hover:bg-ivory-100 disabled:opacity-35 disabled:cursor-not-allowed"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-9 text-center text-sm font-bold text-cellar-900" aria-live="polite">
              {line.quantity}
            </span>
            <button
              type="button"
              onClick={() => changeQuantity(line.quantity + 1)}
              disabled={isPending || atMax}
              aria-label={t.increase}
              className="p-2 rounded-r-full text-cellar-700 hover:bg-ivory-100 disabled:opacity-35 disabled:cursor-not-allowed"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={remove}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-cellar-600 hover:text-rose-700 underline disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
            {t.remove}
          </button>

          {atMax && line.available !== null && (
            <span className="text-[11px] text-cellar-500">{t.maxReached}</span>
          )}
        </div>

        {errorMessage && (
          <p role="alert" className="mt-2 flex items-start gap-1.5 text-xs text-rose-700">
            <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" aria-hidden="true" />
            <span>{errorMessage}</span>
          </p>
        )}
      </div>
    </li>
  );
}
