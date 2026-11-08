"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Plus } from "lucide-react";
import type { WineProduct } from "@/lib/data/products";
import { addToCart, type AddToCartError } from "@/lib/actions/cart";
import { WishlistButton } from "./WishlistButton";
import type { getDictionary } from "@/lib/i18n";

interface WineCardProps {
  product: WineProduct;
  dict: ReturnType<typeof getDictionary>;
  priority?: boolean;
}

export function WineCard({ product, dict, priority = false }: WineCardProps) {
  const [isAdded, setIsAdded] = useState(false);
  const [addError, setAddError] = useState<AddToCartError | null>(null);
  const [isPending, startTransition] = useTransition();

  // Real stock from Medusa (ADR 034/035). null = not limited.
  const available = product.availableQuantity;
  const isSoldOut = available === 0;

  const handleAddToCart = () => {
    if (isSoldOut || isPending) return;
    setAddError(null);
    startTransition(async () => {
      const result = await addToCart({ variantId: product.variantId, quantity: 1 });
      if (!result.ok) {
        setAddError(result.error);
        return;
      }
      setIsAdded(true);
      setTimeout(() => {
        setIsAdded(false);
      }, 2000);
    });
  };

  const errorMessage =
    addError === "out_of_stock"
      ? dict.cart.errorOutOfStock
      : addError
        ? dict.cart.errorUnavailable
        : null;

  const formattedPrice = Number(product.price).toLocaleString("it-IT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const productUrl = `/prodotti/${product.handle}`;

  return (
    <article className="group relative bg-white border border-ivory-300 hover:border-black transition-colors duration-300 flex flex-col overflow-hidden">
      {/* Top Header: Badge on left, Price on right (Signorvino Style) */}
      <div className="p-4 sm:p-5 flex items-start justify-between gap-2 z-10">
        <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-[2px] bg-black text-white">
          {product.badge}
        </span>
        <div className="flex flex-col items-end">
          <span className="text-xl sm:text-2xl font-bold font-serif text-wine-950">
            € {formattedPrice}
          </span>
          <span className="text-[10px] text-cellar-500 font-medium">
            {product.unitPrice ? `${product.unitPrice} • ${dict.common.vatIncShort}` : dict.common.vatIncluded}
          </span>
        </div>
      </div>

      {/* Center Image Container */}
      {/* Image link + wishlist heart side by side (a button cannot live inside a link). */}
      <div className="relative">
        <Link
          href={productUrl}
          className="relative w-full h-72 sm:h-80 flex items-center justify-center p-4 overflow-hidden bg-gradient-to-b from-white via-ivory-50/40 to-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-wine-800"
          aria-label={`${dict.common.viewDetails}: ${product.title}`}
        >
          <div className="relative w-full h-full max-h-72 transition-transform duration-500 ease-out group-hover:scale-105">
            <Image
              src={product.image}
              alt={`${product.title} - ${product.badge}, ${dict.common.brand}`}
              fill
              priority={priority}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-contain drop-shadow-md"
            />
          </div>
        </Link>
        <WishlistButton
          productId={product.id}
          productTitle={product.title}
          t={dict.wishlist}
          loginHref="/account"
          variant="card"
        />
      </div>

      {/* Information Block Below Bottle */}
      <div className="p-5 sm:p-6 flex flex-col flex-grow border-t border-ivory-100 bg-white">
        {/* Region | Format | Optional Alcohol */}
        <div className="flex items-center gap-1.5 text-[11px] text-cellar-500 uppercase tracking-widest font-semibold mb-1">
          <span>Abatemarco (SA)</span>
          <span>•</span>
          <span>{product.format}</span>
          {product.alcohol && (
            <>
              <span>•</span>
              <span>{product.alcohol}</span>
            </>
          )}
        </div>

        {/* Brand / Denomination in bold uppercase */}
        <span className="text-xs font-bold uppercase tracking-wider text-terracotta-700 mb-1">
          {product.appellation}
        </span>

        {/* Product Full Title */}
        <h3 className="font-serif text-lg sm:text-xl font-bold text-wine-950 mb-2 leading-snug group-hover:text-wine-950 transition-colors">
          <Link href={productUrl} className="hover:underline">
            {product.title}
          </Link>
        </h3>

        {/* Sensory Tasting Notes */}
        <p className="text-xs text-cellar-600 line-clamp-2 leading-relaxed mb-4 flex-grow">
          {product.description}
        </p>

        {/* In Stock status and available count */}
        <div
          className={`flex items-center justify-between text-[11px] font-medium mb-4 ${
            isSoldOut ? "text-rose-700" : "text-olive-700"
          }`}
        >
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${isSoldOut ? "bg-rose-600" : "bg-olive-600"}`} />
            <span>{isSoldOut ? dict.cart.soldOut : dict.common.inStock}</span>
          </div>
          {available !== null && !isSoldOut && (
            <span className="text-cellar-500 text-[10px]">
              <strong className="text-cellar-800">{available}</strong> {dict.cart.available}
            </span>
          )}
        </div>

        {/* Signorvino-Style "Aggiungi" Button */}
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isSoldOut || isPending}
          aria-busy={isPending}
          className={`w-full py-3.5 px-4 label-caps flex items-center justify-center gap-2 transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${
            isAdded
              ? "bg-olive-700 text-white"
              : "bg-black hover:bg-gold-700 text-white"
          }`}
          aria-label={`${dict.common.addToCart}: ${product.title}`}
        >
          {isSoldOut ? (
            <span>{dict.cart.soldOut}</span>
          ) : isPending ? (
            <span>{dict.cart.adding}</span>
          ) : isAdded ? (
            <>
              <Check className="w-4 h-4 text-emerald-300" />
              <span>{dict.common.addedToCart}</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 text-gold-400" />
              <span>{dict.common.addToCart}</span>
            </>
          )}
        </button>

        {errorMessage && (
          <p role="alert" className="mt-2 text-[11px] leading-snug text-rose-700">
            {errorMessage}
          </p>
        )}
      </div>
    </article>
  );
}
