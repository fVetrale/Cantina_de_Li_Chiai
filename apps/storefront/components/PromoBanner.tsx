import Image from "next/image";
import { Gift, ShieldCheck, Sparkles } from "lucide-react";
import type { getDictionary } from "@/lib/i18n";

interface PromoBannerProps {
  dict: ReturnType<typeof getDictionary>;
}

export function PromoBanner({ dict }: PromoBannerProps) {
  return (
    <section
      id="promo"
      aria-label="Confezioni regalo e degustazioni"
      className="py-16 bg-white border-b border-ivory-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#3b0f18] via-[#4a141b] to-[#201518] text-white shadow-xl p-8 sm:p-12 lg:p-16 flex flex-col lg:flex-row items-center justify-between gap-10 border border-gold-500/20">
          {/* Left Narrative Block */}
          <div className="max-w-xl space-y-5 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-gold-400/30 text-gold-300 text-xs uppercase tracking-widest font-bold">
              <Sparkles className="w-3.5 h-3.5 text-gold-400" />
              <span>{dict.promoBanner.badge}</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-ivory-50">
              {dict.promoBanner.title}
            </h2>

            <p className="text-sm sm:text-base text-ivory-200/90 leading-relaxed font-sans">
              {dict.promoBanner.description}
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <a
                href="#catalog"
                className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-gradient-gold text-wine-950 font-bold text-xs uppercase tracking-wider shadow-md hover:brightness-110 active:scale-95 transition-all"
              >
                <Gift className="w-4 h-4" />
                <span>{dict.promoBanner.cta}</span>
              </a>
              <div className="flex items-center gap-2 text-xs text-gold-300 font-medium">
                <ShieldCheck className="w-4 h-4 text-gold-400 shrink-0" />
                <span>Consegna in 24/48h con imballi anti-rottura</span>
              </div>
            </div>
          </div>

          {/* Right Visual Frame */}
          <div className="relative w-full max-w-sm sm:max-w-md aspect-[4/3] rounded-2xl overflow-hidden border-2 border-gold-400/20 shadow-xl">
            <Image
              src="/images/hero-vineyard.jpg"
              alt="Confezioni regalo e cofanetti in legno Cantina de Li Chiai nel Parco del Cilento"
              fill
              sizes="(max-width: 1024px) 100vw, 450px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6">
              <div className="text-left">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gold-300 block mb-1">
                  Edizione Limitata
                </span>
                <p className="text-xs text-ivory-100 font-medium">
                  Cofanetto Tradizione Cilentana (2 o 3 bottiglie)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
