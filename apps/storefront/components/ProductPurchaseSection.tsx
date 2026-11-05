"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import {
  ShoppingBag,
  Check,
  Truck,
  Store,
  Calendar,
  Wine,
  FileText,
  Grape,
  ChevronDown,
  AlertCircle,
} from "lucide-react";
import type { WineProduct } from "@/lib/data/products";
import { addToCart, type AddToCartError } from "@/lib/actions/cart";
import { WishlistButton } from "./WishlistButton";
import type { getDictionary } from "@/lib/i18n";

interface ProductPurchaseSectionProps {
  product: WineProduct;
  dict: ReturnType<typeof getDictionary>;
}

function BottleIcon({ className = "w-3.5 h-4.5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M10 2h4" />
      <path d="M10 2v3h4V2" />
      <path d="M10 5c0 2-2 4-2 7v8a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-8c0-3-2-5-2-7" />
    </svg>
  );
}

const QUANTITY_PRESETS = [1, 2, 3, 4, 6, 9, 12, 18];
// Same bound as MAX_ADD_QUANTITY in lib/data/cart.ts (validated again on the server).
const MAX_QUANTITY = 120;

export function ProductPurchaseSection({
  product,
  dict,
}: ProductPurchaseSectionProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [addError, setAddError] = useState<AddToCartError | null>(null);
  const [isPending, startTransition] = useTransition();
  const t = dict.cart;

  // Real stock from Medusa (ADR 034/035). null = not limited.
  const available = product.availableQuantity;
  const isSoldOut = available === 0;
  const maxQuantity = available === null ? MAX_QUANTITY : Math.min(available, MAX_QUANTITY);
  const exceedsStock = quantity > maxQuantity;
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isCustomQtyMode, setIsCustomQtyMode] = useState(false);
  const [customQtyInput, setCustomQtyInput] = useState("");

  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsPopoverOpen(false);
        setIsCustomQtyMode(false);
      }
    }
    if (isPopoverOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isPopoverOpen]);

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

  // Calculate estimated delivery: 2 business days from now
  const getDeliveryEstimate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    const day = d.getDate();
    const month = d.getMonth() + 1;
    const year = String(d.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
  };

  const handleSelectQuantity = (qty: number) => {
    setQuantity(qty);
    setAddError(null);
    setIsPopoverOpen(false);
    setIsCustomQtyMode(false);
  };

  const handleApplyCustomQty = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(customQtyInput, 10);
    if (!isNaN(parsed) && parsed > 0 && parsed <= maxQuantity) {
      setQuantity(parsed);
      setAddError(null);
      setIsPopoverOpen(false);
      setIsCustomQtyMode(false);
      setCustomQtyInput("");
    }
  };

  const handleAddToCart = () => {
    if (isSoldOut || exceedsStock || isPending) return;
    setAddError(null);
    startTransition(async () => {
      const result = await addToCart({ variantId: product.variantId, quantity });
      if (!result.ok) {
        setAddError(result.error);
        return;
      }
      setIsAdded(true);
      setTimeout(() => {
        setIsAdded(false);
      }, 2500);
    });
  };

  const errorMessage =
    addError === "out_of_stock"
      ? t.errorOutOfStock
      : addError === "invalid_input"
        ? t.errorInvalid
        : addError === "unavailable"
          ? t.errorUnavailable
          : null;

  return (
    <div className="space-y-5 text-cellar-900">
      {/* 1. Brand / Winery Header */}
      <div>
        <span className="text-xs font-extrabold uppercase tracking-widest text-[#1e3a3a] block mb-1">
          {dict.common.brand}
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-wine-950 leading-tight">
          {product.title}
        </h1>
        <div className="text-xs text-cellar-500 font-sans mt-2">
          Codice Articolo:{" "}
          <span className="text-cellar-700 font-mono">
            {product.sku || "VFB00021 2025750"}
          </span>
        </div>
      </div>

      {/* Thin Horizontal Divider */}
      <div className="border-b border-ivory-300" />

      {/* 2. Dynamic Price Row (Updates with Selected Quantity) */}
      <div className="flex items-baseline gap-3 flex-wrap">
        <span className="font-serif text-3xl sm:text-4xl font-bold text-wine-950">
          € {formattedTotalPrice}
        </span>
        {product.unitPrice && (
          <span className="text-xs text-cellar-600 font-medium bg-ivory-100 px-2.5 py-1 rounded-md border border-ivory-300">
            {product.unitPrice} • IVA inc.
          </span>
        )}
        {quantity > 1 && (
          <span className="text-xs text-cellar-500 font-medium">
            (€ {formattedUnitPrice} / {product.category === "vini" ? "bottiglia" : "pz."} • {quantity} {product.category === "vini" ? "bt." : "pz."})
          </span>
        )}
      </div>

      {/* 3. Quantity Pill & Primary Add to Cart Button with Popover */}
      <div className="relative">
        <div className="flex items-center gap-3">
          {/* Quantity Dropdown Trigger Button [ 1 ˅ ] */}
          <button
            ref={triggerRef}
            type="button"
            onClick={() => setIsPopoverOpen(!isPopoverOpen)}
            aria-label="Seleziona quantità di bottiglie"
            aria-expanded={isPopoverOpen}
            className={`h-12 px-4 rounded-full border bg-white shadow-sm flex items-center justify-between gap-3 text-sm font-semibold text-cellar-900 transition-all hover:bg-ivory-50 shrink-0 ${
              isPopoverOpen
                ? "border-[#72182b] ring-2 ring-[#72182b]/20"
                : "border-ivory-300 hover:border-wine-300"
            }`}
          >
            <span className="w-5 text-center font-bold">{quantity}</span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-cellar-500 transition-transform duration-200 ${
                isPopoverOpen ? "rotate-180 text-[#72182b]" : ""
              }`}
            />
          </button>

          {/* Primary Pill Add to Cart Button */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isSoldOut || exceedsStock || isPending}
            aria-busy={isPending}
            className={`h-12 flex-1 rounded-full font-bold text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center gap-2.5 transition-all duration-300 shadow-md active:scale-98 disabled:cursor-not-allowed disabled:opacity-60 ${
              isAdded
                ? "bg-emerald-700 text-white shadow-emerald-700/30"
                : "bg-[#72182b] hover:bg-[#581321] text-white hover:shadow-lg"
            }`}
          >
            {isSoldOut ? (
              <span>{t.soldOut}</span>
            ) : isPending ? (
              <span>{t.adding}</span>
            ) : isAdded ? (
              <>
                <Check className="w-4 h-4 text-emerald-200" />
                <span>
                  {t.added} ({quantity})
                </span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4 text-gold-300" />
                <span>{t.addToCart}</span>
              </>
            )}
          </button>
        </div>

        {/* Real availability from Medusa stock (ADR 035): always shown when stock is managed */}
        {available !== null && (
          <p
            className={`mt-2 text-xs font-medium ${isSoldOut ? "text-rose-700" : "text-olive-700"}`}
          >
            {isSoldOut ? (
              t.soldOut
            ) : (
              <>
                <strong className="font-bold">{available}</strong> {t.available}
              </>
            )}
            {exceedsStock && !isSoldOut && (
              <span className="ml-2 text-rose-700">• {t.quantityExceedsStock}</span>
            )}
          </p>
        )}

        {errorMessage && (
          <p role="alert" className="mt-2 flex items-start gap-1.5 text-xs text-rose-700">
            <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" aria-hidden="true" />
            <span>{errorMessage}</span>
          </p>
        )}

        {/* 4. Popover Menu a Tendina Selezione Bottiglia (Exact Replica Image 2) */}
        {isPopoverOpen && (
          <div
            ref={popoverRef}
            className="absolute left-0 top-full mt-2 z-40 w-full max-w-sm sm:max-w-md rounded-2xl bg-white border-2 border-[#72182b] shadow-2xl p-4 sm:p-5 animate-fadeIn"
          >
            {/* Popover Arrow Indicator (Pointing Up to [ 1 ˅ ]) */}
            <div className="absolute -top-2 left-6 w-3.5 h-3.5 bg-white border-t-2 border-l-2 border-[#72182b] rotate-45" />

            {/* Title */}
            <h4 className="font-sans text-sm sm:text-base font-semibold text-cellar-900 mb-3">
              Scegli la quantità di bottiglie da aggiungere al carrello:
            </h4>

            {/* Thin Horizontal Divider */}
            <div className="border-b border-ivory-200 mb-4" />

            {/* 2x4 Bottle Presets Grid */}
            <div className="grid grid-cols-4 gap-2.5 mb-4">
              {QUANTITY_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleSelectQuantity(preset)}
                  disabled={preset > maxQuantity}
                  className={`disabled:cursor-not-allowed disabled:opacity-35 flex items-center justify-center gap-1.5 py-2.5 px-1.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all duration-200 active:scale-95 ${
                    quantity === preset
                      ? "border-2 border-[#72182b] text-[#72182b] bg-[#72182b]/5 shadow-sm font-bold"
                      : "border-ivory-300 hover:border-wine-300 text-cellar-700 hover:bg-ivory-50"
                  }`}
                >
                  <BottleIcon
                    className={`w-3.5 h-4.5 ${
                      quantity === preset ? "text-[#72182b]" : "text-[#72182b]/80"
                    }`}
                  />
                  <span>x {preset}</span>
                </button>
              ))}
            </div>

            {/* Custom Quantity Section */}
            {!isCustomQtyMode ? (
              <button
                type="button"
                onClick={() => setIsCustomQtyMode(true)}
                className="text-xs font-bold uppercase tracking-wider underline text-cellar-900 hover:text-[#72182b] transition-colors inline-block pt-1"
              >
                Quantità Personalizzata
              </button>
            ) : (
              <form onSubmit={handleApplyCustomQty} className="flex items-center gap-2 pt-1">
                <input
                  type="number"
                  min="1"
                  max={maxQuantity}
                  value={customQtyInput}
                  onChange={(e) => setCustomQtyInput(e.target.value)}
                  placeholder="Es. 24"
                  autoFocus
                  className="w-28 px-3 py-1.5 text-xs font-semibold border-2 border-ivory-300 rounded-lg focus:border-[#72182b] focus:outline-none text-cellar-900"
                />
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg bg-[#72182b] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#581321] transition-colors"
                >
                  Applica
                </button>
                <button
                  type="button"
                  onClick={() => setIsCustomQtyMode(false)}
                  className="text-xs text-cellar-500 hover:text-cellar-800 transition-colors ml-1"
                >
                  Annulla
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* 5. Delivery Guarantee Note */}
      <div className="pt-1">
        <div className="flex items-center gap-2 text-xs text-cellar-600">
          <Truck className="w-4 h-4 text-cellar-700 shrink-0" />
          <span>
            Se acquisti entro 24 ore, consegna entro il{" "}
            <strong className="text-cellar-900 font-bold">
              {getDeliveryEstimate()}
            </strong>
          </span>
        </div>
      </div>

      {/* Thin Horizontal Divider */}
      <div className="border-b border-ivory-300" />

      {/* 6. Quick Action Links (Cerca in Negozio / Preferiti) */}
      <div className="flex items-center gap-6 text-xs text-cellar-700 font-medium">
        <button
          type="button"
          className="inline-flex items-center gap-2 hover:text-[#72182b] transition-colors group"
        >
          <Store className="w-4 h-4 text-cellar-500 group-hover:text-[#72182b] transition-colors" />
          <span className="underline">Disponibile in Cantina</span>
        </button>

        {/* Real wishlist (ADR 042) */}
        <WishlistButton
          productId={product.id}
          productTitle={product.title}
          t={dict.wishlist}
          loginHref="/account"
          variant="pdp"
        />
      </div>

      {/* 7. Structured Product Specs with Icons */}
      <div className="space-y-3.5 pt-2 text-sm text-cellar-800">
        {/* Annata (only if present) */}
        {product.details?.vintage && (
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-[#72182b] shrink-0" />
            <span>
              Annata:{" "}
              <strong className="font-bold text-cellar-950 ml-1">
                {product.details.vintage}
              </strong>
            </span>
          </div>
        )}

        {/* Formato / Peso */}
        {product.format && (
          <div className="flex items-center gap-3">
            <BottleIcon className="w-4 h-4 text-[#72182b] shrink-0" />
            <span>
              Formato / Peso:{" "}
              <strong className="font-bold text-cellar-950 ml-1">
                {product.format}
              </strong>
            </span>
          </div>
        )}

        {/* Categoria */}
        <div className="flex items-center gap-3">
          <Wine className="w-4 h-4 text-[#72182b] shrink-0" />
          <span>
            Tipologia:{" "}
            <strong className="font-bold text-cellar-950 ml-1 capitalize">
              {product.category}
            </strong>
          </span>
        </div>

        {/* Denominazione / Origine */}
        <div className="flex items-center gap-3">
          <FileText className="w-4 h-4 text-[#72182b] shrink-0" />
          <span>
            Denominazione:{" "}
            <strong className="font-bold text-cellar-950 ml-1">
              {product.appellation}
            </strong>
          </span>
        </div>

        {/* Uve (only if present) */}
        {product.details?.grapes && (
          <div className="flex items-center gap-3">
            <Grape className="w-4 h-4 text-[#72182b] shrink-0" />
            <span>
              Uve:{" "}
              <strong className="font-bold text-cellar-950 ml-1">
                {product.details.grapes}
              </strong>
            </span>
          </div>
        )}

        {/* Gradazione alcolica (only if present) */}
        {product.alcohol && (
          <div className="flex items-center gap-3">
            <Wine className="w-4 h-4 text-[#72182b] shrink-0" />
            <span>
              Gradazione:{" "}
              <strong className="font-bold text-cellar-950 ml-1">
                {product.alcohol}
              </strong>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
