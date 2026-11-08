import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, FileText, Cookie, ArrowLeft, ArrowRight, MapPin, Mail } from "lucide-react";
import { getDictionary, Locale, defaultLocale } from "@/lib/i18n";
import { getCategories } from "@/lib/data/products";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AgeGateModal } from "@/components/AgeGateModal";

export async function generateMetadata(props: {
  searchParams?: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const searchParams = props.searchParams ? await props.searchParams : {};
  const currentLocale: Locale =
    searchParams.lang === "en" ? "en" : defaultLocale;
  const dict = getDictionary(currentLocale);

  return {
    title: dict.legalPage.metaTitle,
    description: dict.legalPage.metaDesc,
    openGraph: {
      title: dict.legalPage.metaTitle,
      description: dict.legalPage.metaDesc,
      type: "website",
    },
  };
}

export default async function LegalPage(props: {
  searchParams?: Promise<{ lang?: string }>;
}) {
  const searchParams = props.searchParams ? await props.searchParams : {};
  const currentLocale: Locale =
    searchParams.lang === "en" ? "en" : defaultLocale;
  const dict = getDictionary(currentLocale);
  const categories = await getCategories();
  const t = dict.legalPage;

  return (
    <div className="flex min-h-screen flex-col bg-ivory-50 text-cellar-900 selection:bg-wine-800 selection:text-gold-200">
      {/* 1. Header Navbar */}
      <Navbar dict={dict} currentLocale={currentLocale} categories={categories} />

      <main className="flex-grow pt-28 sm:pt-32 pb-20">
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Breadcrumbs & Header */}
          <header className="space-y-4 text-center max-w-2xl mx-auto">
            <nav
              aria-label="Breadcrumbs"
              className="flex items-center justify-center gap-2 text-xs font-semibold text-gold-700 uppercase tracking-wider mb-2"
            >
              <Link href="/" className="hover:text-wine-900 transition-colors">
                {t.breadcrumbsHome}
              </Link>
              <span className="text-ivory-400">•</span>
              <span className="text-cellar-900 font-bold">
                {t.breadcrumbsCurrent}
              </span>
            </nav>

            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-wine-950 tracking-tight">
              {t.title}
            </h1>
            <p className="text-sm sm:text-base text-cellar-700 font-light leading-relaxed">
              {t.subtitle}
            </p>
          </header>

          {/* Quick Anchor Jump Bar */}
          <div className="flex flex-wrap items-center justify-center gap-3 py-3 border-y border-ivory-200 text-xs font-semibold uppercase tracking-wider text-cellar-700">
            <a
              href="#privacy"
              className="px-4 py-2 bg-white border border-ivory-300 hover:border-wine-800 hover:text-wine-900 transition-colors"
            >
              {dict.footer.privacy}
            </a>
            <a
              href="#termini"
              className="px-4 py-2 bg-white border border-ivory-300 hover:border-wine-800 hover:text-wine-900 transition-colors"
            >
              {dict.footer.terms}
            </a>
            <a
              href="#cookie"
              className="px-4 py-2 bg-white border border-ivory-300 hover:border-wine-800 hover:text-wine-900 transition-colors"
            >
              {dict.footer.cookie}
            </a>
          </div>

          {/* Content Sections */}
          <div className="bg-white p-8 sm:p-12 border border-ivory-300 space-y-12 text-cellar-800 font-sans leading-relaxed">
            {/* 1. Privacy Policy */}
            <section id="privacy" className="scroll-mt-32 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-wine-950/10 text-wine-950">
                  <ShieldCheck className="w-5 h-5 text-gold-600" />
                </div>
                <h2 className="font-serif text-2xl font-bold text-wine-950">
                  {t.privacyTitle}
                </h2>
              </div>
              <p className="text-sm sm:text-base text-cellar-700 leading-relaxed pl-12">
                {t.privacyText}
              </p>
              <div className="ml-12 p-4 bg-ivory-50 border border-ivory-200 text-xs text-cellar-600 space-y-1.5">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gold-600 shrink-0" />
                  <span>Cantina de Li Chiai — Contrada Pozzo 15, Abatemarco (SA)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gold-600 shrink-0" />
                  <a href={`mailto:${dict.footer.email}`} className="hover:text-wine-900 underline">
                    {dict.footer.email}
                  </a>
                </div>
              </div>
            </section>

            {/* 2. Terms of Sale */}
            <section id="termini" className="scroll-mt-32 space-y-4 pt-8 border-t border-ivory-200">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-wine-950/10 text-wine-950">
                  <FileText className="w-5 h-5 text-gold-600" />
                </div>
                <h2 className="font-serif text-2xl font-bold text-wine-950">
                  {t.termsTitle}
                </h2>
              </div>
              <p className="text-sm sm:text-base text-cellar-700 leading-relaxed pl-12">
                {t.termsText}
              </p>
            </section>

            {/* 3. Cookie Policy */}
            <section id="cookie" className="scroll-mt-32 space-y-4 pt-8 border-t border-ivory-200">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-wine-950/10 text-wine-950">
                  <Cookie className="w-5 h-5 text-gold-600" />
                </div>
                <h2 className="font-serif text-2xl font-bold text-wine-950">
                  {t.cookieTitle}
                </h2>
              </div>
              <p className="text-sm sm:text-base text-cellar-700 leading-relaxed pl-12">
                {t.cookieText}
              </p>
            </section>

            {/* Bottom Actions */}
            <div className="pt-8 border-t border-ivory-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <Link
                href="/"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-ivory-50 text-cellar-800 font-semibold text-xs uppercase tracking-wider border border-ivory-300 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t.backHome}</span>
              </Link>
              <Link
                href="/vini"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-wine-800 hover:bg-wine-900 text-white font-bold text-xs uppercase tracking-wider transition-all hover:scale-105 active:scale-95"
              >
                <span>{t.backCatalog}</span>
                <ArrowRight className="w-4 h-4 text-gold-300" />
              </Link>
            </div>
          </div>
        </article>
      </main>

      {/* Footer */}
      <Footer dict={dict} />

      {/* Age Gate */}
      <AgeGateModal dict={dict} />
    </div>
  );
}
