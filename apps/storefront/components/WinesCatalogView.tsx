"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { WineProduct, WineCategory } from "@/lib/data/products";
import type { getDictionary } from "@/lib/i18n";

interface WinesCatalogViewProps {
  products: WineProduct[];
  categories: WineCategory[];
  dict: ReturnType<typeof getDictionary>;
  /** Category handle chosen from a link (?categoria=), or "" for no selection. */
  initialCategory?: string;
  /** "?lang=en" or "" */
  langQuery?: string;
}

/**
 * The wines page is only the catalog selector (ADR 047): large serif categories over a blurred,
 * almost white vineyard. Nothing is selected at first. Choosing a category turns it gold, moves the
 * list to the left and slides in, from the right, the column with its wines (each opens its product
 * page, where it can be added to the cart). The URL follows the choice (?categoria=) so links and
 * the back button stay consistent.
 */
export function WinesCatalogView({
  products,
  categories,
  dict,
  initialCategory = "",
  langQuery = "",
}: WinesCatalogViewProps) {
  const t = dict.winesPage;
  const [activeCategory, setActiveCategory] = useState(initialCategory);

  const selected = categories.find((c) => c.handle === activeCategory);
  const wines = selected ? products.filter((p) => p.categoryHandle === selected.handle) : [];

  const selectCategory = (handle: string) => {
    setActiveCategory(handle);
    const params = new URLSearchParams(langQuery);
    params.set("categoria", handle);
    // Next.js keeps the router in sync with the native History API.
    window.history.replaceState(null, "", `/vini?${params.toString()}`);
  };

  return (
    <section
      aria-label={t.title}
      className="relative overflow-hidden min-h-[calc(100svh-4rem)] lg:min-h-[calc(100svh-72px)] flex items-center"
    >
      <div className="absolute inset-0" aria-hidden="true">
        <Image src="/images/vigneto.jpeg" alt="" fill priority sizes="100vw" className="object-cover blur-2xl scale-110 opacity-40" />
        <div className="absolute inset-0 bg-white/80" />
      </div>

      <div
        className={`relative w-full mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10 py-16 lg:py-24 grid gap-12 ${
          selected ? "lg:grid-cols-2 items-center" : "grid-cols-1"
        }`}
      >
        <div className={`flex flex-col ${selected ? "items-center lg:items-start" : "items-center"}`}>
          <h1 className="label-caps text-gold-700 mb-8">{t.title}</h1>
          <ul className={`flex flex-col gap-2 sm:gap-3 ${selected ? "items-center lg:items-start" : "items-center"}`}>
            {categories.map((cat) => {
              const isSelected = cat.handle === activeCategory;
              return (
                <li key={cat.id}>
                  <button
                    type="button"
                    onClick={() => selectCategory(cat.handle)}
                    aria-pressed={isSelected}
                    aria-controls="wine-selector-column"
                    className={`font-serif text-[clamp(2.25rem,6vw,5rem)] leading-[1.1] transition-colors duration-300 ${
                      isSelected ? "text-gold-700" : "text-black hover:text-gold-700"
                    }`}
                  >
                    {cat.name}
                  </button>
                </li>
              );
            })}
          </ul>
          {!selected && <p className="mt-10 text-sm text-gray-600 text-center">{t.selectorHint}</p>}
        </div>

        {/* The column slides in from the right; keyed by category so it replays on every change */}
        <div id="wine-selector-column" aria-live="polite">
          {selected && (
            <div key={selected.handle} className="selector-column flex gap-6 lg:gap-10 justify-center lg:justify-start">
              <span aria-hidden="true" className="w-px self-stretch bg-gradient-to-b from-gold-500 via-gold-500/60 to-black" />
              <div>
                <p className="label-caps text-gray-600">
                  {selected.name} · {wines.length}
                </p>
                <ul className="mt-6 space-y-5">
                  {wines.map((wine, index) => (
                    <li key={wine.id} className="selector-item" style={{ animationDelay: `${0.25 + index * 0.12}s` }}>
                      <Link
                        href={`/prodotti/${wine.handle}${langQuery}`}
                        className="group flex items-baseline gap-4 font-serif text-[clamp(1.75rem,3vw,2.5rem)] leading-tight hover:text-gold-700 transition-colors duration-200"
                      >
                        <span>{wine.title}</span>
                        <span className="font-sans text-xs text-gray-600 group-hover:text-gold-700">
                          € {wine.price.toLocaleString("it-IT", { minimumFractionDigits: 2 })}
                        </span>
                      </Link>
                      <p className="mt-1 font-sans text-[11px] font-bold uppercase tracking-[2px] text-gray-500">{wine.appellation}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
