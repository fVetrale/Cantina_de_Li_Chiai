import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, ShieldCheck } from "lucide-react";
import { getDictionary, Locale, defaultLocale } from "@/lib/i18n";
import { getCategories } from "@/lib/data/products";
import { Navbar } from "@/components/Navbar";
import { AccountAuthCard } from "@/components/AccountAuthCard";
import { Footer } from "@/components/Footer";
import { AgeGateModal } from "@/components/AgeGateModal";

export async function generateMetadata(props: {
  searchParams?: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const searchParams = props.searchParams ? await props.searchParams : {};
  const currentLocale: Locale =
    searchParams.lang === "en" ? "en" : defaultLocale;
  const dict = getDictionary(currentLocale);
  const t = dict.accountPage;

  return {
    title: t.metaTitle,
    description: t.metaDesc,
    openGraph: {
      title: t.metaTitle,
      description: t.metaDesc,
      type: "website",
    },
  };
}

export default async function AccountPage(props: {
  searchParams?: Promise<{ lang?: string }>;
}) {
  const searchParams = props.searchParams ? await props.searchParams : {};
  const currentLocale: Locale =
    searchParams.lang === "en" ? "en" : defaultLocale;
  const dict = getDictionary(currentLocale);
  const t = dict.accountPage;

  const categories = await getCategories();

  return (
    <div className="flex min-h-screen flex-col bg-ivory-50 text-cellar-900 selection:bg-[#661022] selection:text-gold-200">
      {/* 1. Floating Smoked Glass Island Navbar */}
      <Navbar dict={dict} currentLocale={currentLocale} categories={categories} />

      {/* 2. Main Content */}
      <main className="flex-grow pt-28 sm:pt-36 pb-24 relative overflow-hidden">
        {/* Subtle Warm Amber Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-[#72182b]/5 via-gold-500/5 to-transparent pointer-events-none blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Header & Breadcrumbs */}
          <header className="space-y-4 text-center max-w-2xl mx-auto">
            <nav
              aria-label="Breadcrumbs"
              className="flex items-center justify-center gap-2 text-xs font-semibold text-gold-700 uppercase tracking-wider mb-2"
            >
              <Link
                href="/"
                className="hover:text-wine-900 transition-colors"
              >
                Home
              </Link>
              <span className="text-ivory-400">•</span>
              <span className="text-cellar-900 font-bold">{t.tabSignIn}</span>
            </nav>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#4a141b]/10 border border-gold-500/30 text-wine-900 text-xs font-semibold tracking-widest uppercase shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-gold-600" />
              <span>{t.eyebrow}</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold text-cellar-950 tracking-tight leading-tight">
              {t.title}
            </h1>

            <p className="text-sm sm:text-base text-cellar-600 font-light leading-relaxed">
              {t.subtitle}
            </p>
          </header>

          {/* Interactive Luxury Auth Card */}
          <AccountAuthCard dict={dict} currentLocale={currentLocale} />

          {/* Trust Footnote */}
          <div className="flex items-center justify-center gap-2 text-xs text-cellar-500 pt-6">
            <ShieldCheck className="w-4 h-4 text-gold-600" />
            <span>
              {currentLocale === "it"
                ? "Connessione cifrata TLS 1.3 con token di sessione autenticati Medusa v2"
                : "TLS 1.3 encrypted connection with Medusa v2 authenticated customer sessions"}
            </span>
          </div>
        </div>
      </main>

      {/* 3. Footer */}
      <Footer dict={dict} />

      {/* 4. Age Verification Modal */}
      <AgeGateModal dict={dict} />
    </div>
  );
}
