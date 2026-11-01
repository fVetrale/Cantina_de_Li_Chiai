import { Truck, Wine, Award, ArrowRight } from "lucide-react";
import type { getDictionary } from "@/lib/i18n";

interface FeaturesSectionProps {
  dict: ReturnType<typeof getDictionary>;
}

export function FeaturesSection({ dict }: FeaturesSectionProps) {
  const pillarIcons = [Award, Wine, Truck];

  return (
    <section
      id="terroir"
      aria-label="I Valori e Servizi di Cantina de Li Chiai"
      className="py-16 bg-white border-b border-ivory-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-gold-700 block mb-1.5">
            Eccellenza &amp; Garanzia
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-wine-950 mb-2">
            {dict.features.title}
          </h2>
          <p className="text-cellar-600 text-sm">
            {dict.features.subtitle}
          </p>
        </div>

        {/* 3 Pillars Grid (Signorvino Style) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {dict.features.items.map((item, index) => {
            const Icon = pillarIcons[index] || Award;
            return (
              <div
                key={index}
                className="group p-8 rounded-2xl bg-ivory-50 border border-ivory-200 hover:border-wine-300 hover:shadow-lg transition-all duration-300 flex flex-col items-start"
              >
                <div className="w-12 h-12 rounded-xl bg-white border border-ivory-300 text-[#4a141b] flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-[#4a141b] group-hover:text-gold-200 transition-all duration-300 shadow-sm">
                  <Icon className="w-6 h-6" />
                </div>

                <h3 className="font-serif text-lg font-bold text-wine-950 mb-2 group-hover:text-[#4a141b] transition-colors">
                  {item.title}
                </h3>

                <p className="text-xs sm:text-sm text-cellar-600 leading-relaxed flex-grow">
                  {item.description}
                </p>

                <div className="mt-4 pt-3 border-t border-ivory-200 w-full flex items-center gap-1.5 text-xs font-bold text-terracotta-700 group-hover:text-[#4a141b] transition-colors">
                  <span>Scopri di più</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
