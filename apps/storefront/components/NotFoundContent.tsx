"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Wine, ArrowLeft } from "lucide-react";

interface NotFoundTexts {
  errorLabel: string;
  title: string;
  description: string;
  back: string;
}

/**
 * Body of the 404 page in the language of the URL (ADR 049). The not-found boundary receives no
 * search params, so it gets both (tiny) text sets and picks one here.
 */
export function NotFoundContent({ it, en }: { it: NotFoundTexts; en: NotFoundTexts }) {
  const isEn = useSearchParams().get("lang") === "en";
  const t = isEn ? en : it;
  return (
    <div className="max-w-md w-full text-center space-y-6 bg-white p-8 sm:p-12 border border-ivory-200">
      <div className="w-16 h-16 rounded-full bg-ivory-100 border border-gold-400/30 flex items-center justify-center mx-auto text-wine-950">
        <Wine className="w-8 h-8 text-wine-950" />
      </div>
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-terracotta-700">{t.errorLabel}</span>
        <h1 className="font-serif text-3xl font-bold text-wine-950">{t.title}</h1>
        <p className="text-sm text-cellar-600 leading-relaxed font-sans">{t.description}</p>
      </div>
      <div className="pt-2">
        <Link
          href={isEn ? "/vini?lang=en" : "/vini"}
          className="inline-flex items-center gap-2 px-6 py-3.5 bg-wine-950 hover:bg-wine-900 text-gold-100 font-bold text-xs uppercase tracking-wider transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-gold-300" />
          <span>{t.back}</span>
        </Link>
      </div>
    </div>
  );
}
