import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, Mountain, ShieldCheck, Award, ArrowRight, Quote } from "lucide-react";
import { getDictionary, Locale, defaultLocale } from "@/lib/i18n";
import { getCategories } from "@/lib/data/products";
import { Navbar } from "@/components/Navbar";
import { FeaturesSection } from "@/components/FeaturesSection";
import { Footer } from "@/components/Footer";
import { AgeGateModal } from "@/components/AgeGateModal";
import { CellarGallery } from "@/components/CellarGallery";

export async function generateMetadata(props: {
  searchParams?: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const searchParams = props.searchParams ? await props.searchParams : {};
  const currentLocale: Locale =
    searchParams.lang === "en" ? "en" : defaultLocale;
  const dict = getDictionary(currentLocale);

  return {
    title: dict.estatePage.metaTitle,
    description: dict.estatePage.metaDesc,
    openGraph: {
      title: dict.estatePage.metaTitle,
      description: dict.estatePage.metaDesc,
      type: "article",
    },
  };
}

export default async function EstatePage(props: {
  searchParams?: Promise<{ lang?: string }>;
}) {
  const searchParams = props.searchParams ? await props.searchParams : {};
  const currentLocale: Locale =
    searchParams.lang === "en" ? "en" : defaultLocale;
  const dict = getDictionary(currentLocale);
  const t = dict.estatePage;

  const categories = await getCategories();

  return (
    <div className="flex min-h-screen flex-col bg-ivory-50 text-cellar-900 selection:bg-[#661022] selection:text-gold-200">
      {/* 1. Floating Smoked Aglianico Glass Island Navbar */}
      <Navbar dict={dict} currentLocale={currentLocale} categories={categories} />

      {/* 2. Main Central Body: Story, Cellar Photography & Historical Heritage */}
      <main className="flex-grow pt-24 sm:pt-32 pb-20">
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Breadcrumbs & Header */}
          <header className="space-y-4 text-center max-w-3xl mx-auto">
            <nav
              aria-label="Breadcrumbs"
              className="flex items-center justify-center gap-2 text-xs font-semibold text-gold-700 uppercase tracking-wider mb-2"
            >
              <Link
                href="/"
                className="hover:text-wine-900 transition-colors"
              >
                {t.breadcrumbsHome}
              </Link>
              <span className="text-ivory-400">•</span>
              <span className="text-cellar-900 font-bold">
                {t.breadcrumbsCurrent}
              </span>
            </nav>

            {/* Prestige Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#4a141b]/10 border border-gold-500/30 text-wine-900 text-xs font-semibold tracking-widest uppercase shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-gold-600" />
              <span>{t.eyebrow}</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#4a141b] tracking-tight leading-tight">
              {t.title}
            </h1>

            <p className="text-sm sm:text-base text-cellar-700 font-light leading-relaxed">
              {t.subtitle}
            </p>
          </header>

          {/* Authentic Documentary Cellar Gallery (Sliding Carousel & Archive) */}
          <CellarGallery dict={dict} />

          {/* 3 Pillar Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="bg-white rounded-2xl p-5 border border-ivory-300 shadow-sm text-center space-y-1.5">
              <div className="w-10 h-10 rounded-full bg-[#4a141b]/10 text-[#4a141b] flex items-center justify-center mx-auto mb-2">
                <Award className="w-5 h-5 text-gold-600" />
              </div>
              <div className="font-serif text-2xl font-bold text-wine-900">
                {t.stat1Number}
              </div>
              <div className="text-xs text-cellar-600 font-medium">
                {t.stat1Label}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-ivory-300 shadow-sm text-center space-y-1.5">
              <div className="w-10 h-10 rounded-full bg-[#4a141b]/10 text-[#4a141b] flex items-center justify-center mx-auto mb-2">
                <ShieldCheck className="w-5 h-5 text-gold-600" />
              </div>
              <div className="font-serif text-2xl font-bold text-wine-900">
                {t.stat2Number}
              </div>
              <div className="text-xs text-cellar-600 font-medium">
                {t.stat2Label}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-ivory-300 shadow-sm text-center space-y-1.5">
              <div className="w-10 h-10 rounded-full bg-[#4a141b]/10 text-[#4a141b] flex items-center justify-center mx-auto mb-2">
                <Mountain className="w-5 h-5 text-gold-600" />
              </div>
              <div className="font-serif text-2xl font-bold text-wine-900">
                {t.stat3Number}
              </div>
              <div className="text-xs text-cellar-600 font-medium">
                {t.stat3Label}
              </div>
            </div>
          </div>

          {/* Historical Narrative Chapters */}
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-ivory-300 shadow-sm space-y-10 text-cellar-800 leading-relaxed font-sans">
            {/* Chapter 1 */}
            <section className="space-y-3">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#4a141b]">
                {t.p1Title}
              </h2>
              <p className="text-sm sm:text-base text-cellar-700 leading-relaxed">
                {t.p1}
              </p>
            </section>

            {/* Chapter 2 */}
            <section className="space-y-3 pt-6 border-t border-ivory-200">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#4a141b]">
                {t.p2Title}
              </h2>
              <p className="text-sm sm:text-base text-cellar-700 leading-relaxed">
                {t.p2}
              </p>
            </section>

            {/* Winemaker Quote Card */}
            <div className="rounded-2xl bg-gradient-to-br from-[#290a12] to-[#17050a] text-white p-6 sm:p-8 border border-gold-500/30 shadow-md relative overflow-hidden">
              <Quote className="absolute -bottom-2 -right-2 w-24 h-24 text-gold-500/10 pointer-events-none" />
              <p className="font-serif italic text-base sm:text-lg text-gold-100 leading-relaxed mb-4 relative z-10">
                {t.quote}
              </p>
              <span className="text-xs uppercase tracking-widest text-gold-300 font-bold block relative z-10">
                — {t.quoteAuthor}
              </span>
            </div>

            {/* Chapter 3 */}
            <section className="space-y-3 pt-6 border-t border-ivory-200">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#4a141b]">
                {t.p3Title}
              </h2>
              <p className="text-sm sm:text-base text-cellar-700 leading-relaxed">
                {t.p3}
              </p>
            </section>

            {/* Final Clean CTA to browse wines */}
            <div className="pt-8 border-t border-ivory-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <span className="font-serif text-xl font-bold text-wine-900 block">
                  Dalla Cantina al tuo Calice
                </span>
                <span className="text-xs text-cellar-600">
                  Scopri la tiratura limitata di Fiano e Aglianico
                </span>
              </div>
              <Link
                href="/vini"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-[#521521] hover:bg-[#3d0f18] text-white font-bold text-xs uppercase tracking-wider shadow-lg transition-all border border-gold-400/30 hover:scale-105 active:scale-95"
              >
                <span>{t.ctaExploreWines}</span>
                <ArrowRight className="w-4 h-4 text-gold-300" />
              </Link>
            </div>
          </div>
        </article>

        {/* 3. I Valori e il Terroir di Cantina de Li Chiai */}
        <div className="mt-16 sm:mt-24">
          <FeaturesSection dict={dict} />
        </div>
      </main>

      {/* 4. Footer Finale */}
      <Footer dict={dict} />

      {/* 4. Legal Age Gate */}
      <AgeGateModal dict={dict} />
    </div>
  );
}
