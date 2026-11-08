import Link from "next/link";
import { Wine, ArrowLeft } from "lucide-react";
import { getDictionary, defaultLocale, pickNavbarDictionary } from "@/lib/i18n";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function NotFound() {
  const dict = getDictionary(defaultLocale);

  return (
    <div className="flex min-h-screen flex-col bg-ivory-50 text-cellar-900">
      {/* The root 404 boundary is serialized into every page: pass only the Navbar slices. */}
      <Navbar dict={pickNavbarDictionary(dict)} currentLocale={defaultLocale} />

      <main className="flex-grow flex items-center justify-center pt-28 pb-20 px-4">
        <div className="max-w-md w-full text-center space-y-6 bg-white p-8 sm:p-12 border border-ivory-200">
          <div className="w-16 h-16 rounded-full bg-ivory-100 border border-gold-400/30 flex items-center justify-center mx-auto text-wine-950">
            <Wine className="w-8 h-8 text-wine-950" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-terracotta-700">
              Errore 404
            </span>
            <h1 className="font-serif text-3xl font-bold text-wine-950">
              {dict.pdp.notFoundTitle}
            </h1>
            <p className="text-sm text-cellar-600 leading-relaxed font-sans">
              {dict.pdp.notFoundDesc}
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/vini"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-wine-950 hover:bg-wine-900 text-gold-100 font-bold text-xs uppercase tracking-wider transition-all active:scale-95"
            >
              <ArrowLeft className="w-4 h-4 text-gold-300" />
              <span>{dict.pdp.backToCatalog}</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer dict={dict} />
    </div>
  );
}
