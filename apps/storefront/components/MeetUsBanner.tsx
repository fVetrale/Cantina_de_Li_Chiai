import Image from "next/image";
import Link from "next/link";
import { Truck, Wine, ArrowRight, Sparkles, MapPin } from "lucide-react";
import type { getDictionary } from "@/lib/i18n";

interface MeetUsBannerProps {
  dict: ReturnType<typeof getDictionary>;
}

export function MeetUsBanner({ dict }: MeetUsBannerProps) {
  const t = dict.meetUs;

  return (
    <section
      id="vieni-a-conoscerci"
      aria-label={t.title}
      className="py-20 bg-gradient-to-b from-white via-ivory-50 to-white border-b border-ivory-200 relative overflow-hidden"
    >
      {/* Subtle ambient light accents */}
      <div className="absolute top-10 left-1/4 w-80 h-80 bg-gold-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-[#72182b]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="rounded-3xl bg-white border border-ivory-300 shadow-xl overflow-hidden p-8 sm:p-12 lg:p-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left Narrative Block */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#4a141b]/10 border border-gold-500/30 text-wine-900 text-xs uppercase tracking-widest font-bold shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-gold-600" />
                <span>{t.eyebrow}</span>
              </div>

              {/* Title */}
              <h2 className="font-serif italic text-3xl sm:text-4xl lg:text-5xl font-bold text-[#4a141b] leading-tight">
                {t.title}
              </h2>

              {/* Description */}
              <p className="text-sm sm:text-base text-cellar-700 leading-relaxed font-sans max-w-2xl">
                {t.description}
              </p>

              {/* Dual Experience Cards: Online Delivery vs Cellar Pickup */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-left">
                {/* 1. Spedizione Online */}
                <div className="p-5 rounded-2xl bg-ivory-50/80 border border-ivory-300 space-y-2.5 transition-all hover:border-gold-400 hover:shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-white text-[#72182b] border border-ivory-200 shadow-2xs">
                      <Truck className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-terracotta-700">
                      {t.cardOnlineBadge}
                    </span>
                  </div>
                  <h3 className="font-serif text-base font-bold text-wine-950">
                    {t.cardOnlineTitle}
                  </h3>
                  <p className="text-xs text-cellar-600 leading-relaxed">
                    {t.cardOnlineDesc}
                  </p>
                </div>

                {/* 2. Ritiro & Degustazione */}
                <div className="p-5 rounded-2xl bg-ivory-50/80 border border-ivory-300 space-y-2.5 transition-all hover:border-gold-400 hover:shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-white text-[#72182b] border border-ivory-200 shadow-2xs">
                      <Wine className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gold-700">
                      {t.cardCellarBadge}
                    </span>
                  </div>
                  <h3 className="font-serif text-base font-bold text-wine-950">
                    {t.cardCellarTitle}
                  </h3>
                  <p className="text-xs text-cellar-600 leading-relaxed">
                    {t.cardCellarDesc}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  href="/la-cantina"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-[#4a141b] hover:bg-[#3d0f18] text-gold-200 font-bold text-xs uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 transition-all border border-gold-400/30"
                >
                  <span>{t.ctaStory}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-gold-300" />
                </Link>

                <a
                  href="#catalog"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white hover:bg-ivory-50 text-cellar-800 font-semibold text-xs uppercase tracking-wider border border-ivory-300 hover:border-wine-800 shadow-xs transition-all"
                >
                  <span>{t.ctaCatalog}</span>
                </a>
              </div>
            </div>

            {/* Right Visual Image Frame */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto w-full max-w-md aspect-[4/5] rounded-3xl overflow-hidden border border-ivory-300 shadow-2xl">
                <Image
                  src="/images/vigneto.jpeg"
                  alt="Tenuta e vigneti di Cantina de Li Chiai ad Abatemarco"
                  fill
                  sizes="(max-width: 1024px) 100vw, 450px"
                  className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent flex items-end p-6">
                  <div className="bg-white/90 backdrop-blur-md border border-ivory-300 rounded-2xl p-4 w-full shadow-lg text-center">
                    <div className="flex items-center justify-center gap-1.5 text-[#72182b] mb-1 font-bold text-xs uppercase tracking-wider">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{t.stampTitle}</span>
                    </div>
                    <p className="text-xs text-cellar-700 font-medium font-sans">
                      {t.stampSubtitle}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
