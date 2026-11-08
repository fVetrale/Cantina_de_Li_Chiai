"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
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

  // Filter options: "all" plus the catalog categories
  const categoryFilters = useMemo(() => {
    const list: Array<{ id: string; name: string; handle: string }> = [
      { id: "all", name: t.filterAll, handle: "all" },
    ];
    list.push(
      ...categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        handle: cat.handle,
      }))
    );
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
      result = result.filter((p) => p.categoryHandle === activeCategory);
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

  const selectCategory = (handle: string) => {
    setActiveCategory(handle);
    setCurrentPage(0);
  };
  const selectedCategory = categoryFilters.find((c) => c.handle === activeCategory && c.handle !== "all");
  const winesInSelected = selectedCategory
    ? products.filter((p) => p.categoryHandle === selectedCategory.handle)
    : [];

  const priceButton = (value: PriceFilter, label: string) => (
    <button
      type="button"
      onClick={() => setActivePrice(value)}
      aria-pressed={activePrice === value}
      className={`relative py-2 font-sans text-[11px] font-bold uppercase tracking-[2px] transition-colors duration-200 ${
        activePrice === value ? "text-black after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-black" : "text-gray-500 hover:text-black"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-12">
      {/* Catalog selector (ADR 045): large serif categories over a blurred, almost white vineyard */}
      <section aria-label={t.title} className="relative overflow-hidden -mx-4 sm:-mx-6 lg:-mx-10">
        <div className="absolute inset-0" aria-hidden="true">
          <Image src="/images/vigneto.jpeg" alt="" fill sizes="100vw" className="object-cover blur-2xl scale-110 opacity-40" />
          <div className="absolute inset-0 bg-white/80" />
        </div>
        <div
          className={`relative px-4 sm:px-6 lg:px-10 py-16 lg:py-24 grid gap-10 transition-all duration-300 ${
            selectedCategory ? "lg:grid-cols-2 items-center" : "grid-cols-1"
          }`}
        >
          <ul className={`flex flex-col gap-2 sm:gap-3 ${selectedCategory ? "items-center lg:items-start" : "items-center"}`}>
            {categoryFilters.map((cat) => {
              const isSelected = activeCategory === cat.handle;
              return (
                <li key={cat.id}>
                  <button
                    type="button"
                    onClick={() => selectCategory(cat.handle)}
                    aria-pressed={isSelected}
                    className={`font-serif text-[clamp(2rem,5.5vw,4.5rem)] leading-[1.1] transition-colors duration-300 ${
                      isSelected ? "text-gold-700" : "text-black hover:text-gold-700"
                    }`}
                  >
                    {cat.name}
                  </button>
                </li>
              );
            })}
          </ul>

          {selectedCategory && (
            <div className="relative flex gap-6 lg:gap-10 justify-center lg:justify-start animate-fade-in">
              <span aria-hidden="true" className="w-px self-stretch bg-gradient-to-b from-gold-500 via-gold-500/60 to-black" />
              <div>
                <p className="label-caps text-gray-600">
                  {selectedCategory.name} · {winesInSelected.length}
                </p>
                <ul className="mt-6 space-y-4">
                  {winesInSelected.map((wine) => (
                    <li key={wine.id}>
                      <Link
                        href={`/prodotti/${wine.handle}`}
                        className="group flex items-baseline gap-4 font-serif text-2xl sm:text-3xl hover:text-gold-700 transition-colors duration-200"
                      >
                        <span>{wine.title}</span>
                        <span className="font-sans text-xs text-gray-600 group-hover:text-gold-700">€ {wine.price.toLocaleString("it-IT", { minimumFractionDigits: 2 })}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Control bar: search, sorting, price */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-y border-ivory-300 py-5">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" aria-hidden="true" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            aria-label={t.searchPlaceholder}
            className="w-full pl-7 pr-8 py-2 bg-transparent border-b border-ivory-400 text-sm text-black placeholder:text-gray-500 focus:outline-none focus:border-black transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              aria-label={t.resetFilters}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-xs text-gray-600 hover:text-black"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          <div className="flex items-center gap-4" role="group" aria-label={t.priceLabel}>
            <SlidersHorizontal className="w-3.5 h-3.5 text-gray-600" aria-hidden="true" />
            {priceButton("all", t.priceAll)}
            {priceButton("under-30", t.priceUnder30)}
            {priceButton("over-30", t.priceOver30)}
          </div>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-gray-600" aria-hidden="true" />
            <label htmlFor="sort-select" className="sr-only">
              {t.sortLabel}
            </label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-transparent border-b border-ivory-400 py-2 pr-2 font-sans text-[11px] font-bold uppercase tracking-[2px] text-black focus:outline-none focus:border-black cursor-pointer"
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
              className="inline-flex items-center gap-1.5 font-sans text-[11px] font-bold uppercase tracking-[2px] text-gold-700 hover:text-black transition-colors"
              title={t.resetFilters}
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{t.resetFilters}</span>
            </button>
          )}
        </div>
      </div>

      {/* Results Header Counter & Active Tags */}
      <div className="flex items-center justify-between text-xs text-cellar-600 px-1">
        <div className="flex items-center gap-2">
          <Wine className="w-4 h-4 text-gold-600" />
          <span className="label-caps text-black">
            {processedProducts.length}{" "}
            {processedProducts.length === 1 ? t.singleResultCount : t.resultsCount}
          </span>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center gap-2">
            <span className="text-gold-700 font-medium">Filtri attivi</span>
            <span className="inline-block w-1.5 h-1.5 bg-gold-500" />
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
                className="inline-flex items-center gap-1.5 px-4 py-2 border border-ivory-300 bg-white text-xs font-semibold text-cellar-800 hover:border-black hover:text-black disabled:opacity-30 disabled:pointer-events-none transition-colors"
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
                      className={`h-9 min-w-9 px-3 text-xs font-bold transition-all duration-200 flex items-center justify-center border ${
                        isCurrent
                          ? "bg-black text-white border-black"
                          : "bg-white text-gray-600 border-ivory-300 hover:border-black hover:text-black"
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
                className="inline-flex items-center gap-1.5 px-4 py-2 border border-ivory-300 bg-white text-xs font-semibold text-cellar-800 hover:border-black hover:text-black disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <span>Successiva</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white p-12 text-center border border-ivory-300 max-w-xl mx-auto space-y-4">
          <div className="w-14 h-14 rounded-full border border-black/20 text-black mx-auto flex items-center justify-center">
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
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-black text-white label-caps hover:bg-gold-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.resetFilters}</span>
          </button>
        </div>
      )}
    </div>
  );
}
