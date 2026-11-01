"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Wine,
  ShoppingBag,
  Search,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  User,
  ClipboardList,
  MapPin,
  CreditCard,
  Heart,
} from "lucide-react";
import type { getDictionary, Locale } from "@/lib/i18n";
import type { WineCategory } from "@/lib/data/products";
import { AuthModal } from "./AuthModal";

const DEFAULT_CATEGORIES: WineCategory[] = [
  { id: "pcat_bianchi", name: "Vini Bianchi", handle: "vini-bianchi" },
  { id: "pcat_rossi", name: "Vini Rossi", handle: "vini-rossi" },
  { id: "pcat_riserve", name: "Riserve", handle: "riserve" },
];

interface NavbarProps {
  dict: ReturnType<typeof getDictionary>;
  currentLocale: Locale;
  categories?: WineCategory[];
  cartCount?: number;
  cartTotal?: number;
}

export function Navbar({
  dict,
  currentLocale,
  categories,
  cartCount = 0,
  cartTotal = 0,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "register">("login");

  const dynamicCategories =
    categories && categories.length > 0 ? categories : DEFAULT_CATEGORIES;

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
          className="flex items-center gap-2.5 shrink-0 group focus:outline-none whitespace-nowrap"
          aria-label="Cantina de Li Chiai - Home"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#521521] to-[#20080e] border border-gold-400/40 flex items-center justify-center text-gold-300 shadow-md group-hover:scale-105 transition-transform shrink-0">
            <Wine className="w-4 h-4 text-gold-300" />
          </div>
          <div className="flex flex-col whitespace-nowrap">
            <span className="font-serif text-xs sm:text-sm font-bold tracking-widest text-gold-100 uppercase group-hover:text-gold-300 transition-colors whitespace-nowrap">
              {dict.common.brand}
            </span>
            <span className="text-[9px] uppercase tracking-widest text-gold-400/80 font-medium whitespace-nowrap">
              Cilento
            </span>
          </div>
        </Link>

        {/* Center: Essential Clean Navigation Links (Desktop) */}
        <nav
          aria-label="Navigazione principale"
          className="hidden md:flex items-center gap-1 sm:gap-2 lg:gap-3 whitespace-nowrap shrink-0"
        >
          {/* I Nostri Vini (con Hover Dropdown Dinamico Categorie) */}
          <div className="relative group">
            <Link
              href="/vini"
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider text-ivory-200/90 hover:text-gold-200 hover:bg-white/10 transition-all inline-flex items-center gap-1.5 whitespace-nowrap"
            >
              <span>{dict.nav.wines}</span>
              <ChevronDown className="w-3 h-3 text-gold-400/70 transition-transform duration-200 group-hover:rotate-180" />
            </Link>

            {/* Hover Floating Island Menu */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2.5 opacity-0 invisible translate-y-1.5 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200 z-50">
              <div className="w-60 rounded-2xl bg-[#20080e]/95 backdrop-blur-2xl border border-gold-400/35 shadow-2xl p-2.5 space-y-1 text-left">
                {/* Voce Tutti i Vini */}
                <Link
                  href="/vini"
                  className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-gold-200 hover:bg-white/10 transition-colors border-b border-white/10 pb-2 mb-1 whitespace-nowrap"
                >
                  <span>{dict.winesPage?.filterAll || "Tutti i Vini"}</span>
                  <Wine className="w-3.5 h-3.5 text-gold-400" />
                </Link>

                {/* Categorie dinamiche (da Medusa v2 / database) */}
                {dynamicCategories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/vini?categoria=${cat.handle}`}
                    className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-ivory-200/90 hover:text-gold-200 hover:bg-white/10 transition-colors whitespace-nowrap"
                  >
                    <span>{cat.name}</span>
                    <span className="text-[10px] text-gold-400/60 font-serif">→</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* La Cantina */}
          <Link
            href="/la-cantina"
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider text-ivory-200/90 hover:text-gold-200 hover:bg-white/10 transition-all whitespace-nowrap"
          >
            {dict.nav.estate}
          </Link>

          {/* Contatti */}
          <Link
            href="/#footer"
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider text-ivory-200/90 hover:text-gold-200 hover:bg-white/10 transition-all whitespace-nowrap"
          >
            {dict.nav.contact}
          </Link>
        </nav>

        {/* Right Action Island: Language, Search & Floating Cart Bubble */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 whitespace-nowrap">
          {/* Language Switcher Pill */}
          <button
            onClick={toggleLanguage}
            type="button"
            className="px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-white/10 hover:bg-white/20 border border-gold-400/30 text-gold-200 transition-all active:scale-95 flex items-center gap-1 shrink-0 whitespace-nowrap"
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

          {/* Quick Search Icon: conduce a /vini */}
          <Link
            href="/vini"
            className="hidden sm:flex items-center justify-center p-2 rounded-full text-gold-300 hover:text-white hover:bg-white/10 transition-colors shrink-0"
            aria-label="Cerca nel catalogo vini"
            title="Cerca nel catalogo vini"
          >
            <Search className="w-4 h-4" />
          </Link>

          {/* Account: Accedi / Registrati con Menu a Tendina e Popup Modal (Signorvino Style) */}
          <div
            className="relative hidden sm:block shrink-0"
            onMouseEnter={() => setAccountMenuOpen(true)}
            onMouseLeave={() => setAccountMenuOpen(false)}
          >
            <button
              type="button"
              onClick={() => {
                setAuthModalMode("login");
                setAuthModalOpen(true);
                setAccountMenuOpen(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-ivory-200/90 hover:text-gold-200 hover:bg-white/10 border border-transparent hover:border-gold-400/30 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
              aria-label={dict.nav.account}
              title={dict.nav.account}
            >
              <User className="w-3.5 h-3.5 text-gold-300 shrink-0" />
              <span className="hidden xl:inline text-[11px] uppercase tracking-wider font-bold whitespace-nowrap">
                {dict.nav.account}
              </span>
              <ChevronDown className="w-3 h-3 text-gold-400/70 shrink-0" />
            </button>

            {/* Menu a Tendina Account (Identico a Signorvino) */}
            {accountMenuOpen && (
              <div className="absolute right-0 top-full pt-2 z-50 w-72 animate-fadeIn pointer-events-auto">
                <div className="rounded-2xl bg-white text-cellar-900 border border-ivory-200 shadow-2xl overflow-hidden py-2 divide-y divide-ivory-100">
                  {/* Riga 1: Accedi/Registrazione > */}
                  <div className="p-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthModalMode("login");
                        setAuthModalOpen(true);
                        setAccountMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-[#72182b] hover:bg-ivory-50 transition-colors text-left cursor-pointer group"
                    >
                      <span className="underline group-hover:no-underline">
                        {dict.accountModal.dropdownTitle}
                      </span>
                      <ChevronRight className="w-4 h-4 text-cellar-400 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>

                  {/* Riga 2: Cantina Club */}
                  <div className="p-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthModalMode("register");
                        setAuthModalOpen(true);
                        setAccountMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-ivory-50 transition-colors text-left cursor-pointer group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-[#72182b]/10 text-[#72182b] flex items-center justify-center font-bold text-xs shrink-0 font-serif">
                        CC
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-cellar-900">
                          {dict.accountModal.club}
                        </span>
                        <span className="text-[11px] text-cellar-500 underline group-hover:text-[#72182b]">
                          {dict.accountModal.clubDesc}
                        </span>
                      </div>
                    </button>
                  </div>

                  {/* Riga 3: Voci Profilo, Ordini, Indirizzi, Carte, Preferiti */}
                  <div className="p-1.5 space-y-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthModalMode("login");
                        setAuthModalOpen(true);
                        setAccountMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-cellar-700 hover:text-cellar-950 hover:bg-ivory-50 transition-colors text-left cursor-pointer"
                    >
                      <User className="w-4 h-4 text-cellar-400" />
                      <span>{dict.accountModal.profile}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setAuthModalMode("login");
                        setAuthModalOpen(true);
                        setAccountMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-cellar-700 hover:text-cellar-950 hover:bg-ivory-50 transition-colors text-left cursor-pointer"
                    >
                      <ClipboardList className="w-4 h-4 text-cellar-400" />
                      <span>{dict.accountModal.orders}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setAuthModalMode("login");
                        setAuthModalOpen(true);
                        setAccountMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-cellar-700 hover:text-cellar-950 hover:bg-ivory-50 transition-colors text-left cursor-pointer"
                    >
                      <MapPin className="w-4 h-4 text-cellar-400" />
                      <span>{dict.accountModal.addresses}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setAuthModalMode("login");
                        setAuthModalOpen(true);
                        setAccountMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-cellar-700 hover:text-cellar-950 hover:bg-ivory-50 transition-colors text-left cursor-pointer"
                    >
                      <CreditCard className="w-4 h-4 text-cellar-400" />
                      <span>{dict.accountModal.cards}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setAuthModalMode("login");
                        setAuthModalOpen(true);
                        setAccountMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-cellar-700 hover:text-cellar-950 hover:bg-ivory-50 transition-colors text-left cursor-pointer"
                    >
                      <Heart className="w-4 h-4 text-cellar-400" />
                      <span>{dict.accountModal.wishlist}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Floating Cart Bubble */}
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
            {/* Mobile Wines Group con Categorie */}
            <div className="text-left bg-white/5 rounded-2xl p-2.5 space-y-1">
              <Link
                href="/vini"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 px-2.5 rounded-xl text-gold-200 font-bold flex items-center justify-between text-xs uppercase tracking-wider hover:bg-white/10 transition-colors"
              >
                <span>{dict.nav.wines}</span>
                <Wine className="w-3.5 h-3.5 text-gold-400" />
              </Link>
              <div className="pl-3.5 pt-1 space-y-1 border-l border-gold-400/20 ml-2">
                {dynamicCategories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/vini?categoria=${cat.handle}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-1 px-2 rounded-lg text-xs text-ivory-200/80 hover:text-gold-200 hover:bg-white/5 transition-colors"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* La Cantina */}
            <Link
              href="/la-cantina"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 rounded-xl hover:bg-white/10 text-gold-200 transition-colors"
            >
              {dict.nav.estate}
            </Link>

            {/* Contatti */}
            <Link
              href="/#footer"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 rounded-xl hover:bg-white/10 text-gold-200 transition-colors"
            >
              {dict.nav.contact}
            </Link>

            {/* Accedi / Registrati (Apre Popup Modal) */}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setAuthModalMode("login");
                setAuthModalOpen(true);
              }}
              className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-gold-200 transition-colors flex items-center justify-between text-xs uppercase tracking-wider font-bold w-full cursor-pointer text-left"
            >
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gold-300" />
                <span>{dict.nav.account}</span>
              </div>
              <span className="text-[10px] text-gold-400/60 font-serif">→</span>
            </button>
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

      {/* 3. Popup Modal per Login / Registrazione (Senza navigare in una nuova pagina) */}
      {authModalOpen && (
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          initialMode={authModalMode}
          dict={dict}
          currentLocale={currentLocale}
        />
      )}
    </header>
  );
}
