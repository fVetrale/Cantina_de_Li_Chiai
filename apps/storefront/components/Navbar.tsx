"use client";

import { useState } from "react";
import Link from "next/link";
import { Wine, ShoppingBag, Search, Menu, X } from "lucide-react";
import type { getDictionary, Locale } from "@/lib/i18n";

interface NavbarProps {
  dict: ReturnType<typeof getDictionary>;
  currentLocale: Locale;
  cartCount?: number;
  cartTotal?: number;
}

export function Navbar({
  dict,
  currentLocale,
  cartCount = 0,
  cartTotal = 0,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleLanguage = () => {
    const nextLocale = currentLocale === "it" ? "en" : "it";
    const url = new URL(window.location.href);
    url.searchParams.set("lang", nextLocale);
    window.location.href = url.toString();
  };

  const formattedTotal = Number(cartTotal).toLocaleString("it-IT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <header className="fixed top-3 sm:top-5 inset-x-0 z-50 flex flex-col items-center px-3 sm:px-6 pointer-events-none">
      {/* 1. Main Floating Frosted Glass Island Bar */}
      <div className="pointer-events-auto w-full max-w-5xl rounded-full bg-[#20080e]/85 backdrop-blur-xl border border-gold-400/35 shadow-2xl py-2 px-3 sm:px-6 flex items-center justify-between transition-all duration-300">
        {/* Brand / Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 shrink-0 group focus:outline-none"
          aria-label="Cantina de Li Chiai - Home"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#521521] to-[#20080e] border border-gold-400/40 flex items-center justify-center text-gold-300 shadow-md group-hover:scale-105 transition-transform">
            <Wine className="w-4 h-4 text-gold-300" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-xs sm:text-sm font-bold tracking-widest text-gold-100 uppercase group-hover:text-gold-300 transition-colors">
              {dict.common.brand}
            </span>
            <span className="text-[9px] uppercase tracking-widest text-gold-400/80 font-medium">
              Cilento
            </span>
          </div>
        </Link>

        {/* Center: Essential Clean Navigation Links (Desktop) */}
        <nav
          aria-label="Navigazione principale"
          className="hidden md:flex items-center gap-1 sm:gap-2"
        >
          <Link
            href="/#catalog"
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider text-ivory-200/90 hover:text-gold-200 hover:bg-white/10 transition-all"
          >
            {dict.nav.wines}
          </Link>
          <Link
            href="/#story"
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider text-ivory-200/90 hover:text-gold-200 hover:bg-white/10 transition-all"
          >
            {dict.nav.estate}
          </Link>
          <Link
            href="/#terroir"
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider text-ivory-200/90 hover:text-gold-200 hover:bg-white/10 transition-all"
          >
            {dict.nav.terroir}
          </Link>
          <Link
            href="/#footer"
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider text-ivory-200/90 hover:text-gold-200 hover:bg-white/10 transition-all"
          >
            {dict.nav.contact}
          </Link>
        </nav>

        {/* Right Action Island: Language, Search & Floating Cart Bubble */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Language Switcher Pill */}
          <button
            onClick={toggleLanguage}
            type="button"
            className="px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-white/10 hover:bg-white/20 border border-gold-400/30 text-gold-200 transition-all active:scale-95 flex items-center gap-1"
            aria-label="Cambia lingua"
          >
            <span className={currentLocale === "it" ? "text-gold-300 font-extrabold" : "text-ivory-300/60"}>
              IT
            </span>
            <span className="text-ivory-400/40 font-light">|</span>
            <span className={currentLocale === "en" ? "text-gold-300 font-extrabold" : "text-ivory-300/60"}>
              EN
            </span>
          </button>

          {/* Quick Search Icon */}
          <Link
            href="/#catalog"
            className="hidden sm:flex items-center justify-center p-2 rounded-full text-gold-300 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Cerca nel catalogo"
            title="Cerca nel catalogo"
          >
            <Search className="w-4 h-4" />
          </Link>

          {/* Floating Cart Bubble (Hero element from visual mockup) */}
          <Link
            href="/#catalog"
            className="flex items-center gap-2 pl-3 pr-3.5 py-1.5 rounded-full bg-[#521521] hover:bg-[#681c2b] border border-gold-400/50 shadow-lg text-white group transition-all duration-200 hover:scale-105 active:scale-95"
            aria-label={dict.nav.cart}
          >
            <ShoppingBag className="w-4 h-4 text-gold-300 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-gold-200 hidden sm:inline">
              € {formattedTotal}
            </span>
            <span className="w-4 h-4 rounded-full bg-gold-400 text-wine-950 font-bold text-[10px] flex items-center justify-center">
              {cartCount}
            </span>
          </Link>

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-full text-white hover:bg-white/10 transition-colors"
            aria-label="Apri menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* 2. Mobile Dropdown Floating Island */}
      {mobileMenuOpen && (
        <div className="pointer-events-auto mt-2 w-full max-w-sm rounded-3xl bg-[#20080e]/95 backdrop-blur-2xl border border-gold-400/35 shadow-2xl p-5 text-center space-y-3 animate-fadeIn">
          <div className="flex flex-col space-y-2 text-sm font-semibold text-ivory-100">
            <Link
              href="/#catalog"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 rounded-xl hover:bg-white/10 text-gold-200 transition-colors"
            >
              {dict.nav.wines}
            </Link>
            <Link
              href="/#story"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 rounded-xl hover:bg-white/10 text-gold-200 transition-colors"
            >
              {dict.nav.estate}
            </Link>
            <Link
              href="/#terroir"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 rounded-xl hover:bg-white/10 text-gold-200 transition-colors"
            >
              {dict.nav.terroir}
            </Link>
            <Link
              href="/#footer"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 rounded-xl hover:bg-white/10 text-gold-200 transition-colors"
            >
              {dict.nav.contact}
            </Link>
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-gold-300/80">
            <span>Parco Nazionale del Cilento</span>
            <button
              onClick={() => {
                toggleLanguage();
                setMobileMenuOpen(false);
              }}
              type="button"
              className="px-2.5 py-1 bg-white/10 rounded-full font-bold text-gold-200"
            >
              {currentLocale.toUpperCase()}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
