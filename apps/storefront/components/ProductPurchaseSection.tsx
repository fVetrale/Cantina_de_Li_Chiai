"use client";

import { useState } from "react";
import { Plus, Minus, ShoppingBag, Check, ShieldCheck, Truck, RefreshCw } from "lucide-react";
import type { WineProduct } from "@/lib/data/products";
import type { getDictionary } from "@/lib/i18n";

interface ProductPurchaseSectionProps {
  product: WineProduct;
  dict: ReturnType<typeof getDictionary>;
}

export function ProductPurchaseSection({
  product,
  dict,
}: ProductPurchaseSectionProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const unitPrice = Number(product.price);
  const totalPrice = unitPrice * quantity;

  const formattedUnitPrice = unitPrice.toLocaleString("it-IT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const formattedTotalPrice = totalPrice.toLocaleString("it-IT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleIncrease = () => {
    if (quantity < 36) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleAddToCart = () => {
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 2500);
  };

  return (
    <div className="space-y-6 pt-4 border-t border-ivory-200">
      {/* Price Block */}
      <div className="flex items-baseline justify-between">
        <div className="flex items-baseline gap-2">
          <span className="font-serif text-3xl sm:text-4xl font-bold text-[#4a141b]">
            € {formattedUnitPrice}
          </span>
          <span className="text-xs text-cellar-500 font-medium">
            {dict.pdp.taxIncluded} / bottiglia
          </span>
        </div>

        {quantity > 1 && (
          <div className="text-right">
            <span className="text-xs text-cellar-500 uppercase tracking-wider block">
              {dict.common.cartTotal} ({quantity} bt.)
            </span>
            <span className="font-serif text-xl font-bold text-wine-950">
              € {formattedTotalPrice}
            </span>
          </div>
        )}
      </div>

      {/* Stock Availability Indicator */}
      <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center gap-3 text-xs text-emerald-900">
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600" />
        </span>
        <div>
          <span className="font-bold">{dict.pdp.inStock}</span> —{" "}
          <span className="text-emerald-800">{dict.pdp.inStockNotice}</span>
        </div>
      </div>

      {/* Quantity & Add to Cart Controls */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Quantity Selector */}
          <div className="flex items-center justify-between border-2 border-ivory-300 rounded-xl bg-white px-3 py-2 sm:w-36 shrink-0 shadow-inner">
            <button
              type="button"
              onClick={handleDecrease}
              disabled={quantity <= 1}
              aria-label="Diminuisci quantità"
              className="p-1.5 rounded-lg text-cellar-600 hover:bg-ivory-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="font-serif font-bold text-lg text-cellar-900 px-2 select-none">
              {quantity}
            </span>
            <button
              type="button"
              onClick={handleIncrease}
              disabled={quantity >= 36}
              aria-label="Aumenta quantità"
              className="p-1.5 rounded-lg text-cellar-600 hover:bg-ivory-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Primary Action Button */}
          <button
            type="button"
            onClick={handleAddToCart}
            className={`flex-1 py-4 px-6 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-300 shadow-md active:scale-95 ${
              isAdded
                ? "bg-olive-700 text-white shadow-olive-700/30"
                : "bg-[#4a141b] hover:bg-[#3d0f18] text-gold-100 hover:text-white border border-gold-500/30 hover:shadow-xl"
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>
                  {dict.pdp.addedToCart} ({quantity})
                </span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4 text-gold-300" />
                <span>
                  {dict.pdp.addToCart} • € {formattedTotalPrice}
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Trust & Guarantee Badges */}
      <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-cellar-700">
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-ivory-100/70 border border-ivory-200">
          <Truck className="w-4 h-4 text-[#4a141b] shrink-0" />
          <span className="leading-tight text-[11px] font-medium">
            Imballo protetto anti-rottura
          </span>
        </div>
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-ivory-100/70 border border-ivory-200">
          <ShieldCheck className="w-4 h-4 text-[#4a141b] shrink-0" />
          <span className="leading-tight text-[11px] font-medium">
            Direttamente dal produttore
          </span>
        </div>
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-ivory-100/70 border border-ivory-200">
          <RefreshCw className="w-4 h-4 text-[#4a141b] shrink-0" />
          <span className="leading-tight text-[11px] font-medium">
            Spedizione gratis da 90€
          </span>
        </div>
      </div>
    </div>
  );
}
