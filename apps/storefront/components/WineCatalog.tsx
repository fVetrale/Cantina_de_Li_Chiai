"use client";

import { useState, useMemo } from "react";
import { Sparkles, Gift, ArrowRight } from "lucide-react";
import { WineCard } from "./WineCard";
import type { WineProduct, WineCategory } from "@/lib/data/products";
import type { getDictionary } from "@/lib/i18n";

interface WineCatalogProps {
  products: WineProduct[];
  categories: WineCategory[];
  dict: ReturnType<typeof getDictionary>;
}

export function WineCatalog({ products, categories, dict }: WineCatalogProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filterOptions = useMemo(() => {
    const defaultOption = {
      id: "all",
      name: dict.catalog.filterAll,
      handle: "all",
    };
    if (categories && categories.length > 0) {
      return [
        defaultOption,
        ...categories.map((cat) => ({
          id: cat.id,
          name: cat.name,
          handle: cat.handle,
        })),
      ];
    }
    return [
      defaultOption,
      { id: "vini-bianchi", name: dict.catalog.filterWhite, handle: "vini-bianchi" },
      { id: "vini-rossi", name: dict.catalog.filterRed, handle: "vini-rossi" },
      { id: "riserve", name: dict.catalog.filterRiserva, handle: "riserve" },
    ];
  }, [dict, categories]);

  const filteredProducts = useMemo(() => {
    if (activeCategory === "all") {
      return products;
    }
    return products.filter((p) => {
      const handle = p.categoryHandle.toLowerCase();
      const cat = p.category.toLowerCase();
      const target = activeCategory.toLowerCase();
      return (
        handle === target ||
        cat.includes(target) ||
        (target === "riserve" &&
          (handle.includes("riserv") || p.badge.toLowerCase().includes("riserv")))
      );
    });
  }, [products, activeCategory]);

  return (
    <section
      id="catalog"
      aria-label="Catalogo Vini Cantina de Li Chiai"
      className="py-20 bg-ivory-50 scroll-mt-20 border-b border-ivory-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Signorvino-Style Section Header with Italic Title */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-gold-700 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{dict.catalog.eyebrow}</span>
          </div>
          {/* Cursive italic heading like "La nostra grande cantina" */}
          <h2 className="font-serif italic text-3xl sm:text-5xl font-normal text-[#4a141b] mb-3">
            {dict.catalog.title}
          </h2>
          <p className="text-cellar-600 text-sm sm:text-base leading-relaxed">
            {dict.catalog.subtitle}
          </p>
        </div>

        {/* Filter Pills Bar */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-12">
          {filterOptions.map((opt) => {
            const isSelected = activeCategory === opt.handle;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setActiveCategory(opt.handle)}
                className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold tracking-wider uppercase transition-all duration-200 border ${
                  isSelected
                    ? "bg-[#4a141b] text-gold-200 border-gold-400 shadow-sm scale-105"
                    : "bg-white text-cellar-700 border-ivory-300 hover:border-wine-800 hover:text-wine-900"
                }`}
              >
                {opt.name}
              </button>
            );
          })}
        </div>

        {/* Products Grid (Signorvino Style including promotional gift box card) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Signorvino-Style Embedded Promo Card */}
          <div className="rounded-2xl bg-gradient-to-br from-[#3b0f18] to-[#1c1815] p-6 text-white flex flex-col justify-between border border-gold-500/20 shadow-md">
            <div>
              <div className="w-10 h-10 rounded-full bg-gold-500/20 flex items-center justify-center text-gold-300 mb-4 border border-gold-400/40">
                <Gift className="w-5 h-5 text-gold-400" />
              </div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-gold-300 block mb-2">
                {dict.promoBanner.badge}
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-bold leading-snug mb-3 text-gold-100">
                {dict.promoBanner.title}
              </h3>
              <p className="text-xs text-ivory-200/80 leading-relaxed mb-6 font-sans">
                {dict.promoBanner.description}
              </p>
            </div>
            <a
              href="#promo"
              className="inline-flex items-center justify-between w-full py-3 px-4 rounded-xl bg-gradient-gold text-wine-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 transition-all shadow-sm"
            >
              <span>{dict.promoBanner.cta}</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Wine Bottle Cards */}
          {filteredProducts.map((wine, index) => (
            <WineCard
              key={wine.id}
              product={wine}
              dict={dict}
              priority={index < 3}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
