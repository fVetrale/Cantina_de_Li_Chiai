import Image from "next/image";
import { Sparkles, ArrowRight, Compass } from "lucide-react";
import type { getDictionary } from "@/lib/i18n";
import { TickerBar } from "@/components/TickerBar";

interface HeroSectionProps {
  dict: ReturnType<typeof getDictionary>;
}

export function HeroSection({ dict }: HeroSectionProps) {
  return (
    <section
      aria-label="Presentazione Cantina de Li Chiai"
      className="relative h-screen min-h-[580px] flex flex-col justify-between overflow-hidden bg-[#180a0e] text-white"
    >
      {/* Background High-Res Vineyard Photography */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-vineyard.jpg"
          alt="Vigneti e colline del Parco Nazionale del Cilento al tramonto - Cantina de Li Chiai"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center brightness-90"
        />
        {/* Layered Gradient: Caldo e sobrio */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#151211] via-black/35 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#2e0e13]/50 via-transparent to-black/40" />
      </div>

      {/* Top Spacer for floating navbar */}
      <div className="h-20 sm:h-24 pointer-events-none" />

      {/* Center Content Container */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 my-auto py-4 sm:py-6 text-center flex flex-col items-center">
        {/* Prestige Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#4a141b]/90 backdrop-blur-md border border-gold-400/30 text-gold-200 text-xs sm:text-sm font-semibold tracking-widest uppercase mb-6 shadow-md">
          <Sparkles className="w-3.5 h-3.5 text-gold-400" />
          <span>{dict.hero.badge}</span>
        </div>

        {/* Big Headline */}
        <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1] mb-6 drop-shadow-md">
          {dict.hero.title}
        </h1>

        {/* Subtitle Payoff */}
        <p className="text-base sm:text-lg lg:text-xl text-ivory-100 font-light max-w-2xl leading-relaxed mb-10 drop-shadow">
          {dict.hero.subtitle}
        </p>

        {/* Call to Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <a
            href="#catalog"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-[#521521] hover:bg-[#3d0f18] text-white font-bold tracking-wider text-xs sm:text-sm uppercase shadow-xl transition-all duration-200 border border-gold-400/30 hover:scale-105 active:scale-95"
          >
            <span>{dict.hero.ctaCollection}</span>
            <ArrowRight className="w-4 h-4 text-gold-300" />
          </a>
          <a
            href="#story"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md text-white font-semibold tracking-wider text-xs sm:text-sm uppercase border border-white/30 transition-all duration-200 active:scale-95"
          >
            <Compass className="w-4 h-4 text-gold-300" />
            <span>{dict.hero.ctaEstate}</span>
          </a>
        </div>
      </div>

      {/* Bottom Docked Single-Line Ticker Bar */}
      <TickerBar dict={dict} />
    </section>
  );
}
