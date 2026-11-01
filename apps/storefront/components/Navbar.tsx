"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Wine,
  ShoppingBag,
  Search,
  Heart,
  User,
  Menu,
  X,
  ShieldCheck,
} from "lucide-react";
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
  const [searchQuery, setSearchQuery] = useState("");

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
    <header className="sticky top-0 z-40 w-full shadow-md">
      {/* 1. Topmost Utility / Announcement Bar */}
      <div className="bg-[#480d19] text-gold-200 text-xs py-1.5 px-4 border-b border-white/10 hidden sm:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-gold-400" />
            <span className="font-medium tracking-wide">
              {dict.announcement}
            </span>
          </div>
          <div className="flex items-center gap-6 text-[11px] text-ivory-200/80">
            <span>Parco Nazionale del Cilento (Salerno)</span>
            <span>•</span>
            <span>Assistenza Clienti: +39 089 800000</span>
          </div>
        </div>
      </div>

      {/* 2. Main Level 1 Bar (Caldo Bordeaux Aglianico del Cilento) */}
      <div className="bg-[#4a141b] text-white py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 lg:gap-8">
          {/* Brand Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 shrink-0 group focus:outline-none"
          >
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-gold-300 border border-gold-400/30 group-hover:bg-white/20 transition-all">
              <Wine className="w-5 h-5 text-gold-400" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-wider text-white uppercase group-hover:text-gold-200 transition-colors">
                {dict.common.brand}
              </span>
              <span className="text-[10px] uppercase tracking-widest text-gold-300 font-medium">
                {dict.common.origin}
              </span>
            </div>
          </Link>

          {/* Central Search Input Pill (Signorvino Style) */}
          <div className="hidden md:flex flex-1 max-w-md mx-auto">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={dict.searchPlaceholder}
                className="w-full pl-11 pr-4 py-2.5 rounded-full bg-white text-cellar-900 placeholder:text-cellar-500 text-xs sm:text-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-gold-400 transition-all"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cellar-400" />
            </div>
          </div>

          {/* Right Action Icons & Cart Pill */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              type="button"
              className="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider rounded-md border border-white/20 bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Switch language"
            >
              {currentLocale === "it" ? "EN" : "IT"}
            </button>

            {/* Account Link */}
            <a
              href="#footer"
              className="hidden lg:flex items-center gap-1.5 text-xs text-ivory-200 hover:text-white transition-colors"
            >
              <User className="w-4 h-4 text-gold-300" />
              <span>{dict.nav.account}</span>
            </a>

            {/* Wishlist */}
            <a
              href="#catalog"
              className="hidden sm:flex items-center justify-center p-2 rounded-full text-ivory-200 hover:text-white hover:bg-white/10 transition-colors"
              aria-label={dict.wishlist}
              title={dict.wishlist}
            >
              <Heart className="w-5 h-5" />
            </a>

            {/* Cart Pill (Signorvino Style: Icon + Amount in €) */}
            <a
              href="#catalog"
              className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#480d19] hover:bg-[#3d0a14] border border-gold-500/40 text-white shadow-sm transition-all duration-200 group"
              aria-label={dict.nav.cart}
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4 text-gold-300 group-hover:scale-110 transition-transform" />
                <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-gold-500 text-wine-950 font-bold text-[9px] rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              </div>
              <span className="font-semibold text-xs tracking-wide text-gold-200">
                € {formattedTotal}
              </span>
            </a>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-white hover:bg-white/10 transition-colors"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar Row */}
        <div className="md:hidden mt-3">
          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={dict.searchPlaceholder}
              className="w-full pl-10 pr-4 py-2 rounded-full bg-white text-cellar-900 placeholder:text-cellar-500 text-xs shadow-inner focus:outline-none focus:ring-2 focus:ring-gold-400"
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cellar-400" />
          </div>
        </div>
      </div>

      {/* 3. Level 2 Secondary Categories Bar (Signorvino Horizontal Menu) */}
      <nav className="bg-white border-b border-ivory-200 px-4 sm:px-6 lg:px-8 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-cellar-800 py-3">
          <div className="flex items-center gap-6 lg:gap-8 overflow-x-auto no-scrollbar">
            <a
              href="#catalog"
              className="text-wine-800 font-bold hover:text-wine-600 border-b-2 border-wine-800 pb-0.5 transition-colors"
            >
              {dict.secondaryNav.all}
            </a>
            <a
              href="#catalog"
              className="hover:text-wine-800 hover:border-b-2 hover:border-wine-800 pb-0.5 transition-all text-cellar-700"
            >
              {dict.secondaryNav.whites}
            </a>
            <a
              href="#catalog"
              className="hover:text-wine-800 hover:border-b-2 hover:border-wine-800 pb-0.5 transition-all text-cellar-700"
            >
              {dict.secondaryNav.reds}
            </a>
            <a
              href="#catalog"
              className="hover:text-wine-800 hover:border-b-2 hover:border-wine-800 pb-0.5 transition-all text-cellar-700"
            >
              {dict.secondaryNav.reserves}
            </a>
            <span className="h-4 w-px bg-ivory-300" />
            <a
              href="#story"
              className="hover:text-wine-800 hover:border-b-2 hover:border-wine-800 pb-0.5 transition-all text-cellar-700"
            >
              {dict.secondaryNav.estate}
            </a>
            <a
              href="#terroir"
              className="hover:text-wine-800 hover:border-b-2 hover:border-wine-800 pb-0.5 transition-all text-cellar-700"
            >
              {dict.secondaryNav.terroir}
            </a>
            <a
              href="#promo"
              className="hover:text-wine-800 hover:border-b-2 hover:border-wine-800 pb-0.5 transition-all text-cellar-700"
            >
              {dict.secondaryNav.visits}
            </a>
            <a
              href="#footer"
              className="hover:text-wine-800 hover:border-b-2 hover:border-wine-800 pb-0.5 transition-all text-cellar-700"
            >
              {dict.secondaryNav.contacts}
            </a>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-wine-800 text-[11px] font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Vendemmia 2022/2023 Disponibile</span>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-ivory-200 px-6 py-5 shadow-2xl animate-fadeIn space-y-3">
          <div className="flex flex-col space-y-2.5 font-medium text-sm text-cellar-800">
            <a
              href="#catalog"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 border-b border-ivory-100 text-wine-800 font-bold"
            >
              {dict.secondaryNav.all}
            </a>
            <a
              href="#catalog"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 border-b border-ivory-100 hover:text-wine-800"
            >
              {dict.secondaryNav.whites}
            </a>
            <a
              href="#catalog"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 border-b border-ivory-100 hover:text-wine-800"
            >
              {dict.secondaryNav.reds}
            </a>
            <a
              href="#catalog"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 border-b border-ivory-100 hover:text-wine-800"
            >
              {dict.secondaryNav.reserves}
            </a>
            <a
              href="#story"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 border-b border-ivory-100 hover:text-wine-800"
            >
              {dict.secondaryNav.estate}
            </a>
            <a
              href="#terroir"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 border-b border-ivory-100 hover:text-wine-800"
            >
              {dict.secondaryNav.terroir}
            </a>
            <a
              href="#footer"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-wine-800"
            >
              {dict.secondaryNav.contacts}
            </a>
          </div>

          <div className="pt-3 border-t border-ivory-200 flex items-center justify-between text-xs text-cellar-600">
            <span>Parco Nazionale del Cilento (Salerno)</span>
            <button
              onClick={toggleLanguage}
              type="button"
              className="px-3 py-1 bg-ivory-100 rounded font-semibold text-wine-800"
            >
              Lingua: {currentLocale.toUpperCase()}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
