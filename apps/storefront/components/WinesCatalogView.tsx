"use client";

import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, RotateCcw, Wine, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { WineCard } from "./WineCard";
import type { WineProduct, WineCategory } from "@/lib/data/products";
import type { getDictionary } from "@/lib/i18n";

interface WinesCatalogViewProps {
  products: WineProduct[];
  categories: WineCategory[];
  dict: ReturnType<typeof getDictionary>;
  initialCategory?: string;
}

type SortOption = "recommended" | "price-asc" | "price-desc" | "alcohol" | "name";
type PriceFilter = "all" | "under-30" | "over-30";

export function WinesCatalogView({
  products,
  categories,
  dict,
  initialCategory = "all",
}: WinesCatalogViewProps) {
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);
  const [activePrice, setActivePrice] = useState<PriceFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("recommended");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(0);

  const itemsPerPage = 6;

  const t = dict.winesPage;

  // Dynamic filter options based on categories prop or i18n fallback
  const categoryFilters = useMemo(() => {
    const list: Array<{ id: string; name: string; handle: string }> = [
      { id: "all", name: t.filterAll, handle: "all" },
    ];
    if (categories && categories.length > 0) {
      list.push(
        ...categories.map((cat) => ({
          id: cat.id,
          name: cat.name,
          handle: cat.handle,
        }))
      );
    } else {
      list.push(
        { id: "cat_vini", name: t.filterWhites, handle: "vini" },
        { id: "cat_insaccati", name: t.filterReds, handle: "insaccati" },
        { id: "cat_carne", name: "Carne fresca", handle: "carne" },
        { id: "cat_olio", name: "Olio EVO", handle: "olio" }
      );
    }
    return list;
  }, [t, categories]);

  // Filtered and sorted products
  const processedProducts = useMemo(() => {
    let result = [...products];

    // 1. Text Search Filter
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.badge.toLowerCase().includes(q) ||
          p.appellation.toLowerCase().includes(q) ||
          (p.details?.terroir.soil.toLowerCase().includes(q) ?? false) ||
          (p.details?.grapes.toLowerCase().includes(q) ?? false)
      );
    }

    // 2. Category Filter
    if (activeCategory !== "all") {
      result = result.filter((p) => {
        const handle = p.categoryHandle.toLowerCase();
        const cat = p.category.toLowerCase();
        const target = activeCategory.toLowerCase();
        return (
          handle === target ||
          cat.includes(target) ||
          (target === "vini" && (handle.includes("vino") || cat.includes("vino"))) ||
          (target === "carne" && (handle.includes("carne") || cat.includes("carne"))) ||
          (target === "olio" && (handle.includes("olio") || cat.includes("olio"))) ||
          (target === "insaccati" &&
            (handle.includes("insaccat") ||
              cat.includes("insaccat") ||
              handle.includes("salum") ||
              cat.includes("salum")))
        );
      });
    }

    // 3. Price Filter
    if (activePrice === "under-30") {
      result = result.filter((p) => p.price <= 30);
    } else if (activePrice === "over-30") {
      result = result.filter((p) => p.price > 30);
    }

    // 4. Sorting
    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "alcohol":
        result.sort((a, b) => {
          const alcA = parseFloat(a.alcohol || "0") || 0;
          const alcB = parseFloat(b.alcohol || "0") || 0;
          return alcB - alcA;
        });
        break;
      case "name":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "recommended":
      default:
        // Keep natural curated order
        break;
    }

    return result;
  }, [products, searchQuery, activeCategory, activePrice, sortBy]);

  const hasActiveFilters =
    activeCategory !== "all" || activePrice !== "all" || searchQuery.trim().length > 0;

  const handleResetFilters = () => {
    setActiveCategory("all");
    setActivePrice("all");
    setSortBy("recommended");
    setSearchQuery("");
    setCurrentPage(0);
  };

  const totalPages = Math.ceil(processedProducts.length / itemsPerPage);

  const paginatedProducts = useMemo(() => {
    const start = currentPage * itemsPerPage;
    return processedProducts.slice(start, start + itemsPerPage);
  }, [processedProducts, currentPage, itemsPerPage]);

  return (
    <div className="space-y-10">
      {/* Control Bar: Filters, Search and Sorting */}
      <div className="bg-white rounded-2xl p-6 border border-ivory-300 shadow-sm space-y-6">
        {/* Top Row: Search input + Sorting selector */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Quick Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cellar-600" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-10 pr-4 py-2.5 bg-ivory-50 border border-ivory-300 rounded-xl text-xs sm:text-sm text-cellar-900 placeholder:text-cellar-600 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-cellar-600 hover:text-cellar-900"
              >
                ✕
              </button>
            )}
          </div>

          {/* Right Controls: Sort Dropdown + Reset if filters active */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-cellar-700">
              <ArrowUpDown className="w-3.5 h-3.5 text-gold-600" />
              <label htmlFor="sort-select" className="hidden sm:inline">
                {t.sortLabel}:
              </label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-ivory-50 border border-ivory-300 rounded-xl px-3 py-2 text-xs font-semibold text-cellar-900 focus:outline-none focus:border-gold-500 cursor-pointer"
              >
                <option value="recommended">{t.sortRecommended}</option>
                <option value="price-asc">{t.sortPriceAsc}</option>
                <option value="price-desc">{t.sortPriceDesc}</option>
                <option value="alcohol">{t.sortAlcohol}</option>
                <option value="name">{t.sortName}</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-terracotta-700 bg-terracotta-100 hover:bg-terracotta-300/40 transition-colors"
                title={t.resetFilters}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.resetFilters}</span>
              </button>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-ivory-200" />

        {/* Bottom Row: Category Tabs & Price Pills */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Categories Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {categoryFilters.map((cat) => {
              const isSelected = activeCategory === cat.handle;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.handle)}
                  className={`px-4 py-2 rounded-full text-xs font-bold tracking-wider uppercase transition-all duration-200 border ${
                    isSelected
                      ? "bg-[#4a141b] text-gold-200 border-gold-400 shadow-sm scale-105"
                      : "bg-ivory-50 text-cellar-700 border-ivory-300 hover:border-wine-800 hover:text-wine-900"
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>

          {/* Price Range Filter */}
          <div className="flex items-center gap-2 text-xs font-semibold text-cellar-700">
            <SlidersHorizontal className="w-3.5 h-3.5 text-gold-600" />
            <span className="hidden sm:inline">{t.priceLabel}:</span>
            <div className="inline-flex rounded-lg border border-ivory-300 p-0.5 bg-ivory-50 text-[11px]">
              <button
                type="button"
                onClick={() => setActivePrice("all")}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  activePrice === "all"
                    ? "bg-[#4a141b] text-gold-200 font-bold"
                    : "text-cellar-700 hover:text-cellar-900"
                }`}
              >
                {t.priceAll}
              </button>
              <button
                type="button"
                onClick={() => setActivePrice("under-30")}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  activePrice === "under-30"
                    ? "bg-[#4a141b] text-gold-200 font-bold"
                    : "text-cellar-700 hover:text-cellar-900"
                }`}
              >
                {t.priceUnder30}
              </button>
              <button
                type="button"
                onClick={() => setActivePrice("over-30")}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  activePrice === "over-30"
                    ? "bg-[#4a141b] text-gold-200 font-bold"
                    : "text-cellar-700 hover:text-cellar-900"
                }`}
              >
                {t.priceOver30}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Header Counter & Active Tags */}
      <div className="flex items-center justify-between text-xs text-cellar-600 px-1">
        <div className="flex items-center gap-2">
          <Wine className="w-4 h-4 text-gold-600" />
          <span className="font-semibold text-cellar-800">
            {processedProducts.length}{" "}
            {processedProducts.length === 1 ? t.singleResultCount : t.resultsCount}
          </span>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center gap-2">
            <span className="text-gold-700 font-medium">Filtri attivi</span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-gold-500" />
          </div>
        )}
      </div>

      {/* Products Grid */}
      {processedProducts.length > 0 ? (
        <div className="space-y-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {paginatedProducts.map((wine, index) => (
              <WineCard
                key={wine.id}
                product={wine}
                dict={dict}
                priority={index < 3}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-4 pt-6 border-t border-ivory-200">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                disabled={currentPage === 0}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-ivory-300 bg-white text-xs font-semibold text-cellar-800 hover:border-wine-800 hover:text-wine-900 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-sm"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Precedente</span>
              </button>

              <div className="flex items-center gap-2 overflow-x-auto py-1 max-w-full no-scrollbar">
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const isCurrent = idx === currentPage;
                  return (
                    <button
                      key={`page-${idx}`}
                      type="button"
                      onClick={() => setCurrentPage(idx)}
                      className={`h-9 min-w-9 px-3 rounded-full text-xs font-bold transition-all duration-200 flex items-center justify-center border ${
                        isCurrent
                          ? "bg-[#4a141b] text-gold-200 border-[#4a141b] shadow-md scale-105"
                          : "bg-white text-cellar-700 border-ivory-300 hover:border-wine-800 hover:text-wine-900 shadow-sm"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))}
                disabled={currentPage >= totalPages - 1}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-ivory-300 bg-white text-xs font-semibold text-cellar-800 hover:border-wine-800 hover:text-wine-900 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-sm"
              >
                <span>Successiva</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-3xl p-12 text-center border border-ivory-300 max-w-xl mx-auto space-y-4">
          <div className="w-14 h-14 rounded-full bg-[#4a141b]/10 text-[#4a141b] mx-auto flex items-center justify-center">
            <Wine className="w-7 h-7" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-cellar-900">
            {t.noResultsTitle}
          </h3>
          <p className="text-sm text-cellar-600 leading-relaxed">
            {t.noResultsDesc}
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#4a141b] text-gold-200 font-bold text-xs uppercase tracking-wider hover:bg-[#3d0f18] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.resetFilters}</span>
          </button>
        </div>
      )}
    </div>
  );
}
