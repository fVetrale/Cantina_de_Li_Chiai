"use client";

import { useState } from "react";
import { Eye, Wind, Wine, CheckCircle2, Plus } from "lucide-react";
import type { WineProduct } from "@/lib/data/products";
import type { getDictionary } from "@/lib/i18n";

interface ProductTabsProps {
  product: WineProduct;
  dict: ReturnType<typeof getDictionary>;
}

type TabKey = "tasting" | "terroir" | "pairings" | "technical";

export function ProductTabs({ product, dict }: ProductTabsProps) {
  // Accordion (ADR 045): one section open at a time, the first one open by default.
  const [openKey, setOpenKey] = useState<TabKey | null>("tasting");

  const details = product.details;

  const tabs: Array<{ key: TabKey; label: string }> = [
    { key: "tasting", label: dict.pdp.tabs.tasting },
    { key: "terroir", label: dict.pdp.tabs.terroir },
    { key: "pairings", label: dict.pdp.tabs.pairings },
    { key: "technical", label: dict.pdp.tabs.technical },
  ];

  const panes: Record<TabKey, React.ReactNode> = {
    tasting: (
          <div className="space-y-8">
            <div className="max-w-2xl">
              <span className="label-caps text-gold-700 block mb-2">
                {dict.pdp.tastingEyebrow}
              </span>
              <h3 className="font-serif text-xl text-wine-950 mb-3">
                {dict.pdp.tastingTitle}
              </h3>
              <p className="text-sm text-cellar-600 leading-relaxed font-sans">
                {product.description}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 pt-1">
              {/* Esame Visivo */}
              <div className="p-6 bg-ivory-50 border border-ivory-200 space-y-3">
                <div className="flex items-center gap-2.5 text-wine-950 font-bold text-xs uppercase tracking-wider">
                  <div className="p-2 bg-white border border-ivory-200">
                    <Eye className="w-4 h-4" />
                  </div>
                  <span>{dict.pdp.tastingLabels.visual}</span>
                </div>
                <p className="text-xs sm:text-sm text-cellar-700 leading-relaxed">
                  {details?.tastingNotes.visual ||
                    dict.pdp.fallbacks.visual}
                </p>
              </div>

              {/* Esame Olfattivo */}
              <div className="p-6 bg-ivory-50 border border-ivory-200 space-y-3">
                <div className="flex items-center gap-2.5 text-wine-950 font-bold text-xs uppercase tracking-wider">
                  <div className="p-2 bg-white border border-ivory-200">
                    <Wind className="w-4 h-4" />
                  </div>
                  <span>{dict.pdp.tastingLabels.olfactory}</span>
                </div>
                <p className="text-xs sm:text-sm text-cellar-700 leading-relaxed">
                  {details?.tastingNotes.olfactory ||
                    dict.pdp.fallbacks.olfactory}
                </p>
              </div>

              {/* Esame Gustativo */}
              <div className="p-6 bg-ivory-50 border border-ivory-200 space-y-3">
                <div className="flex items-center gap-2.5 text-wine-950 font-bold text-xs uppercase tracking-wider">
                  <div className="p-2 bg-white border border-ivory-200">
                    <Wine className="w-4 h-4" />
                  </div>
                  <span>{dict.pdp.tastingLabels.gustatory}</span>
                </div>
                <p className="text-xs sm:text-sm text-cellar-700 leading-relaxed">
                  {details?.tastingNotes.gustatory ||
                    dict.pdp.fallbacks.gustatory}
                </p>
              </div>
            </div>
          </div>
    ),
    terroir: (
          <div className="space-y-8">
            <div className="max-w-2xl">
              <span className="label-caps text-gold-700 block mb-2">
                {dict.pdp.terroirEyebrow}
              </span>
              <h3 className="font-serif text-xl text-wine-950 mb-3">
                {dict.pdp.terroirTitle}
              </h3>
              <p className="text-sm text-cellar-600 leading-relaxed font-sans">
                {dict.pdp.terroirText}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div className="p-5 bg-ivory-50 border border-ivory-200">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gold-700 block mb-1">
                  {dict.pdp.terroirLabels.soil}
                </span>
                <p className="text-xs sm:text-sm text-cellar-800 font-medium leading-snug">
                  {details?.terroir.soil ||
                    dict.pdp.fallbacks.soil}
                </p>
              </div>

              <div className="p-5 bg-ivory-50 border border-ivory-200">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gold-700 block mb-1">
                  {dict.pdp.terroirLabels.altitude}
                </span>
                <p className="text-xs sm:text-sm text-cellar-800 font-medium leading-snug">
                  {details?.terroir.altitude || dict.pdp.fallbacks.altitude}
                </p>
              </div>

              <div className="p-5 bg-ivory-50 border border-ivory-200">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gold-700 block mb-1">
                  {dict.pdp.terroirLabels.exposure}
                </span>
                <p className="text-xs sm:text-sm text-cellar-800 font-medium leading-snug">
                  {details?.terroir.exposure || dict.pdp.fallbacks.exposure}
                </p>
              </div>

              <div className="p-5 bg-ivory-50 border border-ivory-200">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gold-700 block mb-1">
                  {dict.pdp.terroirLabels.harvest}
                </span>
                <p className="text-xs sm:text-sm text-cellar-800 font-medium leading-snug">
                  {details?.terroir.harvest || dict.pdp.fallbacks.harvest}
                </p>
              </div>

              <div className="p-5 bg-ivory-50 border border-ivory-200">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gold-700 block mb-1">
                  {dict.pdp.terroirLabels.aging}
                </span>
                <p className="text-xs sm:text-sm text-cellar-800 font-medium leading-snug">
                  {details?.terroir.aging || dict.pdp.fallbacks.aging}
                </p>
              </div>
            </div>
          </div>
    ),
    pairings: (
          <div className="space-y-6">
            <div className="max-w-2xl">
              <span className="label-caps text-gold-700 block mb-2">
                {dict.pdp.pairingsEyebrow}
              </span>
              <h3 className="font-serif text-xl text-wine-950 mb-2">
                {dict.pdp.pairingsTitle}
              </h3>
              <p className="text-sm text-cellar-600 leading-relaxed font-sans">
                {dict.pdp.pairingsSubtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 pt-1">
              {(details?.pairings || dict.pdp.fallbacks.pairings).map((pairing, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-ivory-50 border border-ivory-200 flex items-start gap-3"
                >
                  <CheckCircle2 className="w-5 h-5 text-olive-700 shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm text-cellar-800 font-medium leading-snug">
                    {pairing}
                  </span>
                </div>
              ))}
            </div>
          </div>
    ),
    technical: (
          <div className="space-y-6">
            <div className="max-w-2xl">
              <span className="label-caps text-gold-700 block mb-2">
                {dict.pdp.technicalEyebrow}
              </span>
              <h3 className="font-serif text-xl text-wine-950 mb-4">
                {dict.pdp.technicalTitle}
              </h3>
            </div>

            <div className="divide-y divide-ivory-200 border-y border-ivory-200 text-xs sm:text-sm">
              <div className="py-3 flex items-start justify-between gap-4">
                <span className="text-cellar-600">{dict.pdp.technicalLabels.appellation}</span>
                <span className="font-bold text-black text-right">{product.appellation}</span>
              </div>
              {details?.grapes && (
                <div className="py-3 flex items-start justify-between gap-4">
                  <span className="text-cellar-600">{dict.pdp.technicalLabels.grape}</span>
                  <span className="font-bold text-black text-right">{details.grapes}</span>
                </div>
              )}
              {details?.vintage && (
                <div className="py-3 flex items-start justify-between gap-4">
                  <span className="text-cellar-600">{dict.pdp.vintageLabel}</span>
                  <span className="font-bold text-black text-right">{details.vintage}</span>
                </div>
              )}
              {product.alcohol && (
                <div className="py-3 flex items-start justify-between gap-4">
                  <span className="text-cellar-600">{dict.pdp.alcoholLabel}</span>
                  <span className="font-bold text-black text-right">{product.alcohol}</span>
                </div>
              )}
              {product.format && (
                <div className="py-3 flex items-start justify-between gap-4">
                  <span className="text-cellar-600">{dict.pdp.formatLabel}</span>
                  <span className="font-bold text-black text-right">{product.format}</span>
                </div>
              )}
              {details?.technical?.serviceTemp && (
                <div className="py-3 flex items-start justify-between gap-4">
                  <span className="text-cellar-600">{dict.pdp.tempLabel}</span>
                  <span className="font-bold text-black text-right">
                    {details.technical.serviceTemp}
                  </span>
                </div>
              )}
              <div className="py-3 flex items-start justify-between gap-4">
                <span className="text-cellar-600">{dict.pdp.technicalLabels.glass}</span>
                <span className="font-bold text-black text-right">
                  {details?.technical.glass || dict.pdp.fallbacks.glass}
                </span>
              </div>
              <div className="py-3 flex items-start justify-between gap-4">
                <span className="text-cellar-600">{dict.pdp.technicalLabels.potential}</span>
                <span className="font-bold text-black text-right">
                  {details?.technical.agingPotential || dict.pdp.fallbacks.potential}
                </span>
              </div>
              <div className="py-3 flex items-start justify-between gap-4">
                <span className="text-cellar-600">{dict.pdp.technicalLabels.sku}</span>
                <span className="font-mono text-cellar-500">{product.sku}</span>
              </div>
            </div>
          </div>
    ),
  };

  return (
    <div className="border-t border-black">
      {tabs.map((tab) => {
        const isOpen = openKey === tab.key;
        const buttonId = `pdp-accordion-${tab.key}`;
        const panelId = `pdp-panel-${tab.key}`;
        return (
          <div key={tab.key} className="border-b border-ivory-300">
            <h2>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenKey(isOpen ? null : tab.key)}
                className="w-full flex items-center gap-4 py-5 text-left label-caps text-black hover:text-gold-700 transition-colors duration-200"
              >
                <span
                  aria-hidden="true"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-black/40"
                >
                  <Plus className={`h-3.5 w-3.5 transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`} />
                </span>
                <span>{tab.label}</span>
              </button>
            </h2>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
            >
              <div className="overflow-hidden" inert={!isOpen}>
                <div className="pb-8 text-sm">{panes[tab.key]}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
