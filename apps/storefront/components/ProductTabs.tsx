"use client";

import { useState } from "react";
import { Eye, Wind, Wine, Mountain, Sparkles, Utensils, CheckCircle2 } from "lucide-react";
import type { WineProduct } from "@/lib/data/products";
import type { getDictionary } from "@/lib/i18n";

interface ProductTabsProps {
  product: WineProduct;
  dict: ReturnType<typeof getDictionary>;
}

type TabKey = "tasting" | "terroir" | "pairings" | "technical";

export function ProductTabs({ product, dict }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("tasting");

  const details = product.details;

  const tabs: Array<{ key: TabKey; label: string; icon: typeof Wine }> = [
    { key: "tasting", label: dict.pdp.tabs.tasting, icon: Wine },
    { key: "terroir", label: dict.pdp.tabs.terroir, icon: Mountain },
    { key: "pairings", label: dict.pdp.tabs.pairings, icon: Utensils },
    { key: "technical", label: dict.pdp.tabs.technical, icon: Sparkles },
  ];

  return (
    <div className="mt-16 rounded-3xl bg-white border border-ivory-200 shadow-sm overflow-hidden">
      {/* Tab Navigation Buttons */}
      <div className="flex items-center overflow-x-auto border-b border-ivory-200 bg-ivory-50/60 p-2 gap-2 no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-200 whitespace-nowrap ${
                isActive
                  ? "bg-[#4a141b] text-gold-200 shadow-md scale-100"
                  : "text-cellar-600 hover:text-cellar-900 hover:bg-white/80"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-gold-300" : "text-cellar-500"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Panes */}
      <div className="p-6 sm:p-10">
        {/* 1. Note di Degustazione */}
        {activeTab === "tasting" && (
          <div className="space-y-8 animate-fadeIn">
            <div className="max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-widest text-[#4a141b] block mb-1">
                Profilo Sensoriale
              </span>
              <h3 className="font-serif text-2xl font-bold text-wine-950 mb-3">
                L&apos;Esperienza nel Calice
              </h3>
              <p className="text-sm text-cellar-600 leading-relaxed font-sans">
                {product.description}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              {/* Esame Visivo */}
              <div className="p-6 rounded-2xl bg-ivory-50 border border-ivory-200 space-y-3">
                <div className="flex items-center gap-2.5 text-[#4a141b] font-bold text-xs uppercase tracking-wider">
                  <div className="p-2 rounded-lg bg-white border border-ivory-200">
                    <Eye className="w-4 h-4" />
                  </div>
                  <span>{dict.pdp.tastingLabels.visual}</span>
                </div>
                <p className="text-xs sm:text-sm text-cellar-700 leading-relaxed">
                  {details?.tastingNotes.visual ||
                    "Tonalità brillante e limpida con riflessi tipici del vitigno autoctono."}
                </p>
              </div>

              {/* Esame Olfattivo */}
              <div className="p-6 rounded-2xl bg-ivory-50 border border-ivory-200 space-y-3">
                <div className="flex items-center gap-2.5 text-[#4a141b] font-bold text-xs uppercase tracking-wider">
                  <div className="p-2 rounded-lg bg-white border border-ivory-200">
                    <Wind className="w-4 h-4" />
                  </div>
                  <span>{dict.pdp.tastingLabels.olfactory}</span>
                </div>
                <p className="text-xs sm:text-sm text-cellar-700 leading-relaxed">
                  {details?.tastingNotes.olfactory ||
                    "Bouquet ricco ed elegante con sentori tipici della macchia mediterranea."}
                </p>
              </div>

              {/* Esame Gustativo */}
              <div className="p-6 rounded-2xl bg-ivory-50 border border-ivory-200 space-y-3">
                <div className="flex items-center gap-2.5 text-[#4a141b] font-bold text-xs uppercase tracking-wider">
                  <div className="p-2 rounded-lg bg-white border border-ivory-200">
                    <Wine className="w-4 h-4" />
                  </div>
                  <span>{dict.pdp.tastingLabels.gustatory}</span>
                </div>
                <p className="text-xs sm:text-sm text-cellar-700 leading-relaxed">
                  {details?.tastingNotes.gustatory ||
                    "Sorso armonico, fresco e minerale, con finale persistente e pulito."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 2. Terroir & Flysch */}
        {activeTab === "terroir" && (
          <div className="space-y-8 animate-fadeIn">
            <div className="max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-widest text-[#4a141b] block mb-1">
                Geologia &amp; Natura
              </span>
              <h3 className="font-serif text-2xl font-bold text-wine-950 mb-3">
                Il Flysch del Parco Nazionale del Cilento
              </h3>
              <p className="text-sm text-cellar-600 leading-relaxed font-sans">
                I vigneti di Cantina de Li Chiai sorgono su terreni flyschoidi millenari composti da
                un&apos;alternanza di arenarie e marne argillose ricche di fossili e sali minerali,
                modellati dal sole campano e dalle correnti del Mar Tirreno.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="p-5 rounded-2xl bg-ivory-50 border border-ivory-200">
                <span className="text-[11px] font-bold uppercase tracking-wider text-terracotta-700 block mb-1">
                  {dict.pdp.terroirLabels.soil}
                </span>
                <p className="text-xs sm:text-sm text-cellar-800 font-medium leading-snug">
                  {details?.terroir.soil ||
                    "Flysch Cilentano: arenarie e marne ricche di microelementi."}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-ivory-50 border border-ivory-200">
                <span className="text-[11px] font-bold uppercase tracking-wider text-terracotta-700 block mb-1">
                  {dict.pdp.terroirLabels.altitude}
                </span>
                <p className="text-xs sm:text-sm text-cellar-800 font-medium leading-snug">
                  {details?.terroir.altitude || "250 - 350 m s.l.m."}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-ivory-50 border border-ivory-200">
                <span className="text-[11px] font-bold uppercase tracking-wider text-terracotta-700 block mb-1">
                  {dict.pdp.terroirLabels.exposure}
                </span>
                <p className="text-xs sm:text-sm text-cellar-800 font-medium leading-snug">
                  {details?.terroir.exposure || "Sud-Ovest verso il Tirreno"}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-ivory-50 border border-ivory-200">
                <span className="text-[11px] font-bold uppercase tracking-wider text-terracotta-700 block mb-1">
                  {dict.pdp.terroirLabels.harvest}
                </span>
                <p className="text-xs sm:text-sm text-cellar-800 font-medium leading-snug">
                  {details?.terroir.harvest || "100% manuale in piccole cassette all'alba"}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-ivory-50 border border-ivory-200 sm:col-span-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-terracotta-700 block mb-1">
                  {dict.pdp.terroirLabels.aging}
                </span>
                <p className="text-xs sm:text-sm text-cellar-800 font-medium leading-snug">
                  {details?.terroir.aging || "Affinamento controllato in cantina naturale."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 3. Abbinamenti Cilentani */}
        {activeTab === "pairings" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-widest text-[#4a141b] block mb-1">
                Tavola &amp; Tradizione
              </span>
              <h3 className="font-serif text-2xl font-bold text-wine-950 mb-2">
                {dict.pdp.pairingsTitle}
              </h3>
              <p className="text-sm text-cellar-600 leading-relaxed font-sans">
                {dict.pdp.pairingsSubtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {(details?.pairings || [
                "Mozzarella di Bufala Campana DOP",
                "Piatti della tradizione campana e cilentana",
              ]).map((pairing, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-ivory-50 border border-ivory-200 flex items-start gap-3"
                >
                  <CheckCircle2 className="w-5 h-5 text-olive-700 shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm text-cellar-800 font-medium leading-snug">
                    {pairing}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Scheda Tecnica */}
        {activeTab === "technical" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-widest text-[#4a141b] block mb-1">
                Specifiche Enologiche
              </span>
              <h3 className="font-serif text-2xl font-bold text-wine-950 mb-4">
                Dati Tecnici &amp; Servizio
              </h3>
            </div>

            <div className="divide-y divide-ivory-200 border-y border-ivory-200 text-xs sm:text-sm">
              <div className="py-3.5 flex items-center justify-between">
                <span className="text-cellar-600">{dict.pdp.technicalLabels.appellation}</span>
                <span className="font-bold text-wine-950">{product.appellation}</span>
              </div>
              {details?.grapes && (
                <div className="py-3.5 flex items-center justify-between">
                  <span className="text-cellar-600">{dict.pdp.technicalLabels.grape}</span>
                  <span className="font-bold text-wine-950">{details.grapes}</span>
                </div>
              )}
              {details?.vintage && (
                <div className="py-3.5 flex items-center justify-between">
                  <span className="text-cellar-600">{dict.pdp.vintageLabel}</span>
                  <span className="font-bold text-wine-950">{details.vintage}</span>
                </div>
              )}
              {product.alcohol && (
                <div className="py-3.5 flex items-center justify-between">
                  <span className="text-cellar-600">{dict.pdp.alcoholLabel}</span>
                  <span className="font-bold text-wine-950">{product.alcohol}</span>
                </div>
              )}
              {product.format && (
                <div className="py-3.5 flex items-center justify-between">
                  <span className="text-cellar-600">{dict.pdp.formatLabel}</span>
                  <span className="font-bold text-wine-950">{product.format}</span>
                </div>
              )}
              {details?.technical?.serviceTemp && (
                <div className="py-3.5 flex items-center justify-between">
                  <span className="text-cellar-600">{dict.pdp.tempLabel}</span>
                  <span className="font-bold text-wine-950">
                    {details.technical.serviceTemp}
                  </span>
                </div>
              )}
              <div className="py-3.5 flex items-center justify-between">
                <span className="text-cellar-600">{dict.pdp.technicalLabels.glass}</span>
                <span className="font-bold text-wine-950">
                  {details?.technical.glass || "Calice da degustazione"}
                </span>
              </div>
              <div className="py-3.5 flex items-center justify-between">
                <span className="text-cellar-600">{dict.pdp.technicalLabels.potential}</span>
                <span className="font-bold text-wine-950">
                  {details?.technical.agingPotential || "Ottima evoluzione"}
                </span>
              </div>
              <div className="py-3.5 flex items-center justify-between">
                <span className="text-cellar-600">{dict.pdp.technicalLabels.sku}</span>
                <span className="font-mono text-cellar-500">{product.sku}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
