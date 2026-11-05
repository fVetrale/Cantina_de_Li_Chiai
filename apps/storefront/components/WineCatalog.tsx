"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { Sparkles, ChevronLeft, ChevronRight, LayoutGrid, SlidersHorizontal } from "lucide-react";
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
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [itemsPerPage, setItemsPerPage] = useState<number>(3);
  const [viewMode, setViewMode] = useState<"slider" | "grid">("slider");

  // Touch swipe support
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  // Responsive calculation of items per page (3 on desktop, 2 on tablet, 1 on mobile)
  useEffect(() => {
    function handleResize() {
      const width = window.innerWidth;
      if (width < 640) {
        setItemsPerPage(1);
      } else if (width < 1024) {
        setItemsPerPage(2);
      } else {
        setItemsPerPage(3);
      }
    }

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Filter options with category items count
  const filterOptions = useMemo(() => {
    const counts: Record<string, number> = { all: products.length };

    products.forEach((p) => {
      counts[p.categoryHandle] = (counts[p.categoryHandle] || 0) + 1;
    });

    const defaultOption = {
      id: "all",
      name: `${dict.catalog.filterAll} (${counts.all || 0})`,
      handle: "all",
    };

    return [
      defaultOption,
      ...categories.map((cat) => ({
        id: cat.id,
        name: `${cat.name} (${counts[cat.handle] || 0})`,
        handle: cat.handle,
      })),
    ];
  }, [dict, categories, products]);

  // Filter products by active category
  const filteredProducts = useMemo(() => {
    if (activeCategory === "all") {
      return products;
    }
    return products.filter((p) => p.categoryHandle === activeCategory);
  }, [products, activeCategory]);

  // Reset to first page when changing category
  const handleCategoryChange = useCallback((newCategory: string) => {
    setActiveCategory(newCategory);
    setCurrentPage(0);
  }, []);

  // Total pages calculation (scales dynamically with product count)
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Safe current page clamps within [0, totalPages - 1] without cascading setState effects
  const safeCurrentPage = totalPages > 0 ? Math.min(currentPage, totalPages - 1) : 0;

  // Pagination navigation helpers
  const handlePrev = useCallback(() => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
  }, [totalPages]);

  // Touch swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartXRef.current === null || touchEndXRef.current === null) return;
    const distance = touchStartXRef.current - touchEndXRef.current;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance && safeCurrentPage < totalPages - 1) {
      handleNext();
    } else if (distance < -minSwipeDistance && safeCurrentPage > 0) {
      handlePrev();
    }

    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  // Group products into pages for the sliding carousel track
  const pages = useMemo(() => {
    const result: WineProduct[][] = [];
    for (let i = 0; i < filteredProducts.length; i += itemsPerPage) {
      result.push(filteredProducts.slice(i, i + itemsPerPage));
    }
    return result;
  }, [filteredProducts, itemsPerPage]);

  return (
    <section
      id="catalog"
      aria-label="Catalogo Prodotti Cantina de Li Chiai"
      className="py-20 bg-ivory-50 scroll-mt-20 border-b border-ivory-200 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-gold-700 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{dict.catalog.eyebrow}</span>
          </div>
          <h2 className="font-serif italic text-3xl sm:text-5xl font-normal text-[#4a141b] mb-3">
            {dict.catalog.title}
          </h2>
          <p className="text-cellar-600 text-sm sm:text-base leading-relaxed">
            {dict.catalog.subtitle}
          </p>
        </div>

        {/* Filter Pills Bar */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-8">
          {filterOptions.map((opt) => {
            const isSelected = activeCategory === opt.handle;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleCategoryChange(opt.handle)}
                className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold tracking-wider uppercase transition-all duration-200 border ${
                  isSelected
                    ? "bg-[#4a141b] text-gold-200 border-gold-400 shadow-md scale-105"
                    : "bg-white text-cellar-700 border-ivory-300 hover:border-wine-800 hover:text-wine-900 shadow-sm"
                }`}
              >
                {opt.name}
              </button>
            );
          })}
        </div>

        {/* Dynamic Controls Bar: Scaling Indicator, View Mode & Sliding Arrows */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-8 pb-3 border-b border-ivory-200">
          {/* Left: Product count & page status */}
          <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-cellar-700">
            <span className="font-bold text-wine-950 font-serif text-base">
              {filteredProducts.length}
            </span>{" "}
            <span>{dict.catalog.productsCount || "prodotti"}</span>
            {totalPages > 1 && viewMode === "slider" && (
              <span className="bg-white px-2.5 py-1 rounded-full border border-ivory-300 text-xs font-semibold text-cellar-800 ml-1">
                {dict.catalog.pageOf || "Pagina"} {safeCurrentPage + 1} {dict.catalog.of || "di"} {totalPages}
              </span>
            )}
          </div>

          {/* Right: View Toggle (Slider vs Grid) & Slider Navigation Arrows */}
          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="inline-flex rounded-full border border-ivory-300 bg-white p-0.5 shadow-sm">
              <button
                type="button"
                onClick={() => setViewMode("slider")}
                title={dict.catalog.viewSlider || "Pagine scorrevoli"}
                aria-label={dict.catalog.viewSlider || "Pagine scorrevoli"}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  viewMode === "slider"
                    ? "bg-[#4a141b] text-gold-200 shadow-sm"
                    : "text-cellar-600 hover:text-cellar-900"
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{dict.catalog.viewSlider || "Pagine scorrevoli"}</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                title={dict.catalog.viewGrid || "Griglia completa"}
                aria-label={dict.catalog.viewGrid || "Griglia completa"}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  viewMode === "grid"
                    ? "bg-[#4a141b] text-gold-200 shadow-sm"
                    : "text-cellar-600 hover:text-cellar-900"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{dict.catalog.viewGrid || "Griglia completa"}</span>
              </button>
            </div>

            {/* Sliding Arrows: Emerge only when totalPages > 1 and in slider mode */}
            {totalPages > 1 && viewMode === "slider" && (
              <div className="flex items-center gap-1.5 ml-2">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={safeCurrentPage === 0}
                  aria-label={dict.catalog.pagePrev || "Pagina precedente"}
                  className="w-9 h-9 rounded-full border border-ivory-300 bg-white shadow-sm flex items-center justify-center text-cellar-800 hover:border-wine-800 hover:text-wine-900 disabled:opacity-30 disabled:pointer-events-none transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={safeCurrentPage >= totalPages - 1}
                  aria-label={dict.catalog.pageNext || "Pagina successiva"}
                  className="w-9 h-9 rounded-full border border-ivory-300 bg-white shadow-sm flex items-center justify-center text-cellar-800 hover:border-wine-800 hover:text-wine-900 disabled:opacity-30 disabled:pointer-events-none transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content Area */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-ivory-200 text-cellar-600 text-sm">
            {dict.catalog.noProducts}
          </div>
        ) : viewMode === "grid" ? (
          /* Grid View Mode: All items stacked cleanly */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((wine, index) => (
              <WineCard
                key={wine.id}
                product={wine}
                dict={dict}
                priority={index < 3}
              />
            ))}
          </div>
        ) : (
          /* Sliding Pages Carousel Mode (Default Dynamic "Pagine Scorrevoli") */
          <div
            className="relative"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Sliding Track Viewport */}
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-out will-change-transform"
                style={{ transform: `translateX(-${safeCurrentPage * 100}%)` }}
              >
                {pages.map((pageItems, pageIdx) => (
                  <div
                    key={`page-${pageIdx}`}
                    className="w-full shrink-0 flex-none px-1"
                    aria-hidden={pageIdx !== safeCurrentPage}
                  >
                    <div
                      className={`grid gap-8 ${
                        itemsPerPage === 1
                          ? "grid-cols-1 max-w-md mx-auto"
                          : itemsPerPage === 2
                          ? "grid-cols-1 sm:grid-cols-2 max-w-4xl mx-auto"
                          : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                      }`}
                    >
                      {pageItems.map((wine, itemIdx) => (
                        <WineCard
                          key={wine.id}
                          product={wine}
                          dict={dict}
                          priority={pageIdx === 0 && itemIdx < 3}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Pagination Bar: Displays only when there are multiple sliding pages */}
            {totalPages > 1 && (
              <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-ivory-200">
                {/* Step Previous */}
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={safeCurrentPage === 0}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-ivory-300 bg-white text-xs font-semibold text-cellar-800 hover:border-wine-800 hover:text-wine-900 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-sm"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>{dict.catalog.pagePrev || "Precedente"}</span>
                </button>

                {/* Page Number Pills / Dots */}
                <div className="flex items-center gap-2 overflow-x-auto py-1 max-w-full no-scrollbar">
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const isCurrent = idx === safeCurrentPage;
                    return (
                      <button
                        key={`dot-${idx}`}
                        type="button"
                        onClick={() => setCurrentPage(idx)}
                        aria-label={`${dict.catalog.pageOf || "Pagina"} ${idx + 1}`}
                        className={`h-9 min-w-9 px-3 rounded-full text-xs font-bold transition-all duration-200 flex items-center justify-center border ${
                          isCurrent
                            ? "bg-[#4a141b] text-gold-200 border-[#4a141b] shadow-md scale-110"
                            : "bg-white text-cellar-700 border-ivory-300 hover:border-wine-800 hover:text-wine-900 shadow-sm"
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>

                {/* Step Next */}
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={safeCurrentPage >= totalPages - 1}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-ivory-300 bg-white text-xs font-semibold text-cellar-800 hover:border-wine-800 hover:text-wine-900 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-sm"
                >
                  <span>{dict.catalog.pageNext || "Successiva"}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
