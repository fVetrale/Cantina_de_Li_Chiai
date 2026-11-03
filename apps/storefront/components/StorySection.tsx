import Image from "next/image";
import Link from "next/link";
import { Compass, ArrowRight } from "lucide-react";
import type { getDictionary } from "@/lib/i18n";

interface StorySectionProps {
  dict: ReturnType<typeof getDictionary>;
}

export function StorySection({ dict }: StorySectionProps) {
  return (
    <section
      id="story"
      aria-label="La Nostra Storia e Tenuta"
      className="py-24 bg-cellar-950 text-ivory-100 relative overflow-hidden"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-wine-900/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Narrative Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-wine-900/60 border border-gold-500/30 text-gold-300 text-xs uppercase tracking-widest font-semibold">
              <Compass className="w-3.5 h-3.5" />
              <span>{dict.story.eyebrow}</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-ivory-50 leading-tight">
              {dict.story.title}
            </h2>

            {/* Blockquote */}
            <blockquote className="border-l-2 border-gold-400 pl-4 py-1 italic font-serif text-lg sm:text-xl text-gold-200/90 leading-relaxed">
              {dict.story.quote}
            </blockquote>

            <p className="text-base text-ivory-200/80 leading-relaxed font-sans">
              {dict.story.p1}
            </p>

            <p className="text-base text-ivory-200/80 leading-relaxed font-sans">
              {dict.story.p2}
            </p>

            {/* 3 Terroir Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
              <div className="p-4 rounded-xl bg-cellar-900 border border-ivory-200/10 flex flex-col">
                <span className="font-serif text-xl font-bold text-gold-300">
                  {dict.story.badge1}
                </span>
                <span className="text-xs text-ivory-300/70 mt-1 leading-snug">
                  {dict.story.badge1Desc}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-cellar-900 border border-ivory-200/10 flex flex-col">
                <span className="font-serif text-xl font-bold text-gold-300">
                  {dict.story.badge2}
                </span>
                <span className="text-xs text-ivory-300/70 mt-1 leading-snug">
                  {dict.story.badge2Desc}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-cellar-900 border border-ivory-200/10 flex flex-col">
                <span className="font-serif text-xl font-bold text-gold-300">
                  {dict.story.badge3}
                </span>
                <span className="text-xs text-ivory-300/70 mt-1 leading-snug">
                  {dict.story.badge3Desc}
                </span>
              </div>
            </div>

            {/* Link to Cellar Documentary Gallery or Catalog */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href="#galleria"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#4a141b]/80 hover:bg-[#5e1922] border border-gold-400/35 text-gold-200 text-xs font-semibold uppercase tracking-wider transition-all duration-200 hover:scale-105 active:scale-95 shadow-md"
              >
                <span>{dict.estatePage.gallery.viewAll}</span>
                <ArrowRight className="w-3.5 h-3.5 text-gold-300" />
              </a>
              <Link
                href="/vini"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-ivory-200/20 text-ivory-100 text-xs font-semibold uppercase tracking-wider transition-all"
              >
                <span>{dict.estatePage.ctaExploreWines}</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Visual Frame */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto w-full max-w-md aspect-[4/5] rounded-2xl overflow-hidden border-2 border-gold-500/30 shadow-2xl">
              <Image
                src="/images/vigneto.jpeg"
                alt="I vigneti sul Flysch di Cantina de Li Chiai verso il cielo del Cilento"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-cellar-950 via-cellar-950/20 to-transparent" />

              {/* Inset Authenticity Stamp */}
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-cellar-900/90 backdrop-blur-md border border-gold-400/30 text-center">
                <span className="font-serif text-xs uppercase tracking-widest text-gold-300 font-bold block mb-1">
                  Denominazione d&apos;Origine
                </span>
                <p className="text-xs text-ivory-200/90">
                  Contrada Pozzo 15, Abatemarco (SA) • Parco del Cilento
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
