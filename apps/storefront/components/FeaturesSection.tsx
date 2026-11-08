import Link from "next/link";
import { Truck, Wine, Award, ArrowRight } from "lucide-react";
import type { getDictionary } from "@/lib/i18n";

interface FeaturesSectionProps {
  dict: ReturnType<typeof getDictionary>;
  className?: string;
}

export function FeaturesSection({ dict, className }: FeaturesSectionProps) {
  const pillarIcons = [Award, Wine, Truck];

  return (
    <section
      id="valori"
      aria-label={dict.a11y.featuresSection}
      className={className || "py-16 bg-white border-y border-ivory-200"}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="label-caps text-gold-700 block mb-4">
            {dict.a11y.featuresEyebrow}
          </span>
          <h2 className="title-section mb-3">
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
              <Link
                key={index}
                href="/vini"
                className="group p-10 bg-white hover:bg-black hover:text-white transition-colors duration-300 flex flex-col items-start block"
              >
                <div className="w-12 h-12 rounded-full border border-current/30 flex items-center justify-center mb-6 text-gold-700 group-hover:text-gold-400 transition-colors duration-300">
                  <Icon className="w-6 h-6" />
                </div>

                <h3 className="font-serif text-xl mb-3">
                  {item.title}
                </h3>

                <p className="text-sm text-gray-600 group-hover:text-white/70 leading-relaxed flex-grow transition-colors duration-300">
                  {item.description}
                </p>

                <div className="mt-6 pt-4 border-t border-current/15 w-full flex items-center gap-1.5 font-sans text-[11px] font-bold uppercase tracking-[3px] text-gold-700 group-hover:text-gold-400 transition-colors">
                  <span>{dict.estatePage.ctaExploreWines}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
