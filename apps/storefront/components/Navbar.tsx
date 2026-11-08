"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Wine,
  ShoppingCart,
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
  LogOut,
} from "lucide-react";
import type { NavbarDictionary, Locale } from "@/lib/i18n";
import type { WineCategory } from "@/lib/data/products";
import { AuthModal } from "./AuthModal";
import { useCartCounter } from "./CartProvider";
import { useCustomer } from "./CustomerProvider";
import { logout } from "@/lib/actions/auth";

// Same wine categories as DEFAULT_CATEGORIES in lib/data/products.ts (ADR 043).
const DEFAULT_CATEGORIES: WineCategory[] = [
  { id: "cat_vini_rossi", name: "Vini Rossi", handle: "vini-rossi" },
  { id: "cat_vini_bianchi", name: "Vini Bianchi", handle: "vini-bianchi" },
  { id: "cat_vini_dolci", name: "Vini Dolci", handle: "vini-dolci" },
];

interface NavbarProps {
  dict: NavbarDictionary;
  currentLocale: Locale;
  categories?: WineCategory[];
}

export function Navbar({
  dict,
  currentLocale,
  categories,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "register">("login");
  // Real cart from the root layout (ADR 036).
  const { itemCount: cartCount, itemTotal: cartTotal } = useCartCounter();
  const cartHref = currentLocale === "en" ? "/carrello?lang=en" : "/carrello";
  // Logged-in customer (ADR 040): only the first name is known on the client.
  const customer = useCustomer();
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const winesActive = pathname.startsWith("/vini") || pathname.startsWith("/prodotti");
  const langSuffix = currentLocale === "en" ? "&lang=en" : "";
  const langQuery = currentLocale === "en" ? "?lang=en" : "";

  // Auto-hiding header (ADR 047): hidden while scrolling down, shown again when scrolling up,
  // always visible near the top, with a menu open, or when keyboard focus is inside it.
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);
  const headerRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastScrollY.current;
      if (Math.abs(delta) < 6) return; // ignore tiny jitter
      setHidden(y > 80 && delta > 0);
      lastScrollY.current = y;
    };
    const onFocusIn = (e: FocusEvent) => {
      if (headerRef.current?.contains(e.target as Node)) setHidden(false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("focusin", onFocusIn);
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("focusin", onFocusIn);
    };
  }, []);
  const headerHidden = hidden && !mobileMenuOpen && !accountMenuOpen && !authModalOpen;
  // Sticky bars under the header (PDP wines bar, chapter tabs) read this to move up with it.
  useEffect(() => {
    if (headerHidden) document.documentElement.dataset.headerHidden = "true";
    else delete document.documentElement.dataset.headerHidden;
  }, [headerHidden]);
  const estateActive = pathname.startsWith("/la-cantina");
  const accountLabel = customer
    ? dict.accountModal.greeting.replace("{name}", customer.firstName)
    : dict.nav.account;

  /** Account menu entries: the given reserved-area page when logged in, otherwise the login popup. */
  const openAccountEntry = (section = "") => {
    setAccountMenuOpen(false);
    setMobileMenuOpen(false);
    if (customer) {
      router.push(`/account${section}${currentLocale === "en" ? "?lang=en" : ""}`);
      return;
    }
    setAuthModalMode("login");
    setAuthModalOpen(true);
  };

  const handleLogout = async () => {
    setAccountMenuOpen(false);
    setMobileMenuOpen(false);
    await logout();
    router.push(currentLocale === "en" ? "/?lang=en" : "/");
  };

  // Medusa category names are Italian: show the translated name when the dictionary has one.
  const categoryNames: Record<string, string> = dict.common.categoryNames;
  const categoryLabel = (cat: WineCategory) => categoryNames[cat.handle] ?? cat.name;

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

  // Editorial header (ADR 045): black bar, Lato uppercase items around the centered name,
  // each item preceded by a thin diagonal line. Behaviour is unchanged.
  const navItem =
    "relative inline-flex items-center gap-1.5 py-2 pl-5 font-sans text-[12px] font-bold uppercase tracking-[4px] hover:text-gold-400 focus-visible:text-gold-400 transition-colors duration-200 whitespace-nowrap " +
    "before:content-[''] before:absolute before:left-1 before:top-1/2 before:h-4 before:w-px before:-translate-y-1/2 before:rotate-[30deg] before:bg-white/40";
  // Active page: gold text with a thin white bar under it.
  const navActive = "text-gold-400 after:content-[''] after:absolute after:left-5 after:right-0 after:-bottom-1 after:h-px after:bg-white";
  const navClass = (active = false) => `${navItem} ${active ? navActive : "text-white/90"}`;
  const iconButton =
    "relative flex items-center justify-center p-2 text-white/90 hover:text-gold-400 transition-colors duration-200 shrink-0";

  return (
    <header
      ref={headerRef}
      className={`fixed top-0 inset-x-0 z-50 bg-black text-white border-b border-white/10 transition-transform duration-300 ease-out ${
        headerHidden ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="mx-auto max-w-[1400px] h-16 lg:h-[72px] px-4 sm:px-6 lg:px-10 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        {/* Left: main navigation (desktop) or menu toggle (mobile) */}
        <div className="flex items-center min-w-0">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden -ml-2 p-2 text-white hover:text-gold-400 transition-colors"
            aria-label={mobileMenuOpen ? dict.common.closeMenu : dict.common.openMenu}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <nav aria-label={dict.common.mainNav} className="hidden lg:flex items-center gap-5 xl:gap-7">
            {/* Wines, with the category dropdown (opens on hover and on keyboard focus) */}
            <div className="relative group">
              <Link href={`/vini${langQuery}`} className={navClass(winesActive)} aria-current={winesActive ? "page" : undefined}>
                <span>{dict.nav.wines}</span>
                <ChevronDown className="w-3 h-3 transition-transform duration-200 group-hover:rotate-180 group-focus-within:rotate-180" />
              </Link>
              <div className="absolute top-full left-0 pt-4 opacity-0 invisible translate-y-1 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 transition-all duration-200 z-50">
                <div className="w-64 bg-black border border-white/15 p-2 text-left shadow-2xl">
                  <Link
                    href={`/vini${langQuery}`}
                    className="flex items-center justify-between px-4 py-3 font-sans text-[11px] font-bold uppercase tracking-[3px] text-gold-400 hover:bg-white/10 transition-colors border-b border-white/10 whitespace-nowrap"
                  >
                    <span>{dict.winesPage.filterAll}</span>
                    <Wine className="w-3.5 h-3.5" />
                  </Link>
                  {dynamicCategories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/vini?categoria=${cat.handle}${langSuffix}`}
                      className="flex items-center justify-between px-4 py-3 font-sans text-[11px] font-bold uppercase tracking-[3px] text-white/85 hover:text-gold-400 hover:bg-white/10 transition-colors whitespace-nowrap"
                    >
                      <span>{categoryLabel(cat)}</span>
                      <span aria-hidden="true">→</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <Link href="/la-cantina" className={navClass(estateActive)} aria-current={estateActive ? "page" : undefined}>
              {dict.nav.estate}
            </Link>

            <Link href="/#footer" className={navClass()}>
              {dict.nav.contact}
            </Link>
          </nav>
        </div>

        {/* Center: the name as logo */}
        <Link
          href="/"
          className="flex flex-col items-center text-center leading-none whitespace-nowrap"
          aria-label={dict.common.homeLink}
        >
          <span className="font-serif text-[15px] sm:text-lg lg:text-[22px] tracking-[2px] sm:tracking-[3px] uppercase text-white">
            {dict.common.brand}
          </span>
          <span className="mt-1 font-sans text-[9px] font-bold uppercase tracking-[4px] text-gold-400">
            Cilento
          </span>
        </Link>

        {/* Right: language, search, account, cart */}
        <div className="flex items-center justify-end gap-1 sm:gap-2 min-w-0">
          <button
            onClick={toggleLanguage}
            type="button"
            className="hidden sm:flex items-center gap-1.5 px-2 py-2 font-sans text-[11px] font-bold uppercase tracking-[3px] transition-colors shrink-0"
            aria-label={dict.common.changeLanguage}
          >
            <span className={currentLocale === "it" ? "text-gold-400" : "text-white/60 hover:text-white"}>IT</span>
            <span className="text-white/30" aria-hidden="true">/</span>
            <span className={currentLocale === "en" ? "text-gold-400" : "text-white/60 hover:text-white"}>EN</span>
          </button>

          <Link
            href={`/vini${langQuery}`}
            className={`hidden sm:flex ${iconButton}`}
            aria-label={dict.common.searchCatalog}
            title={dict.common.searchCatalog}
          >
            <Search className="w-4 h-4" />
          </Link>

          {/* Account: dropdown on hover, login popup or reserved area on click */}
          <div
            className="relative hidden sm:block shrink-0"
            onMouseEnter={() => setAccountMenuOpen(true)}
            onMouseLeave={() => setAccountMenuOpen(false)}
          >
            <button
              type="button"
              onClick={() => openAccountEntry()}
              className="flex items-center gap-2 px-2 py-2 text-white/90 hover:text-gold-400 transition-colors duration-200 cursor-pointer whitespace-nowrap"
              aria-label={accountLabel}
              title={accountLabel}
            >
              <User className="w-4 h-4 shrink-0" />
              <span className="hidden xl:inline font-sans text-[11px] font-bold uppercase tracking-[3px] whitespace-nowrap">
                {accountLabel}
              </span>
              <ChevronDown className="w-3 h-3 shrink-0" />
            </button>
            {/* Menu a Tendina Account (Identico a Signorvino) */}
            {accountMenuOpen && (
              <div className="absolute right-0 top-full pt-2 z-50 w-72 animate-fadeIn pointer-events-auto">
                <div className="bg-white text-black border border-ivory-300 shadow-2xl overflow-hidden py-2 divide-y divide-ivory-300">
                  {!customer && (<>
                  {/* Riga 1: Accedi/Registrazione > */}
                  <div className="p-1.5">
                    <button
                      type="button"
                      onClick={() => openAccountEntry()}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-wine-700 hover:bg-ivory-50 transition-colors text-left cursor-pointer group"
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
                      <div className="w-7 h-7 rounded-lg bg-wine-700/10 text-wine-700 flex items-center justify-center font-bold text-xs shrink-0 font-serif">
                        CC
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-cellar-900">
                          {dict.accountModal.club}
                        </span>
                        <span className="text-[11px] text-cellar-500 underline group-hover:text-wine-700">
                          {dict.accountModal.clubDesc}
                        </span>
                      </div>
                    </button>
                  </div>

                  </>)}

                  {/* Riga 3: Voci Profilo, Ordini, Indirizzi, Carte, Preferiti */}
                  <div className="p-1.5 space-y-0.5">
                    <button
                      type="button"
                      onClick={() => openAccountEntry("/profilo")}
                      className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-cellar-700 hover:text-cellar-950 hover:bg-ivory-50 transition-colors text-left cursor-pointer"
                    >
                      <User className="w-4 h-4 text-cellar-400" />
                      <span>{dict.accountModal.profile}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => openAccountEntry("/ordini")}
                      className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-cellar-700 hover:text-cellar-950 hover:bg-ivory-50 transition-colors text-left cursor-pointer"
                    >
                      <ClipboardList className="w-4 h-4 text-cellar-400" />
                      <span>{dict.accountModal.orders}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => openAccountEntry("/indirizzi")}
                      className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-cellar-700 hover:text-cellar-950 hover:bg-ivory-50 transition-colors text-left cursor-pointer"
                    >
                      <MapPin className="w-4 h-4 text-cellar-400" />
                      <span>{dict.accountModal.addresses}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => openAccountEntry()}
                      className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-cellar-700 hover:text-cellar-950 hover:bg-ivory-50 transition-colors text-left cursor-pointer"
                    >
                      <CreditCard className="w-4 h-4 text-cellar-400" />
                      <span>{dict.accountModal.cards}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => openAccountEntry("/preferiti")}
                      className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-cellar-700 hover:text-cellar-950 hover:bg-ivory-50 transition-colors text-left cursor-pointer"
                    >
                      <Heart className="w-4 h-4 text-cellar-400" />
                      <span>{dict.accountModal.wishlist}</span>
                    </button>
                  </div>

                  {customer && (
                    <div className="p-1.5">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-wine-700 hover:bg-ivory-50 transition-colors text-left cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" aria-hidden="true" />
                        <span>{dict.accountModal.logout}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <Link
            href={cartHref}
            className={`${iconButton} group`}
            aria-label={`${dict.nav.cart}: ${cartCount} (€ ${formattedTotal})`}
            title={`${dict.nav.cart} (€ ${formattedTotal})`}
          >
            <ShoppingCart className="w-[18px] h-[18px]" />
            <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-gold-400 text-black font-bold text-[9px] flex items-center justify-center">
              {cartCount}
            </span>
          </Link>
        </div>
      </div>

      {/* Mobile menu: full-width panel under the bar */}
      {mobileMenuOpen && (
        <div id="mobile-menu" className="lg:hidden border-t border-white/10 bg-black px-6 pb-8 pt-4 animate-fade-in max-h-[calc(100vh-4rem)] overflow-y-auto">
          <nav aria-label={dict.common.mobileMenu} className="flex flex-col">
            <Link
              href={`/vini${langQuery}`}
              onClick={() => setMobileMenuOpen(false)}
              className="py-4 border-b border-white/10 font-sans text-xs font-bold uppercase tracking-[4px] text-white hover:text-gold-400 transition-colors flex items-center justify-between"
            >
              <span>{dict.nav.wines}</span>
              <Wine className="w-4 h-4 text-gold-400" />
            </Link>
            <div className="py-2 pl-4 border-b border-white/10">
              {dynamicCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/vini?categoria=${cat.handle}${langSuffix}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2.5 font-sans text-[11px] font-bold uppercase tracking-[3px] text-white/70 hover:text-gold-400 transition-colors"
                >
                  {categoryLabel(cat)}
                </Link>
              ))}
            </div>
            <Link
              href="/la-cantina"
              onClick={() => setMobileMenuOpen(false)}
              className="py-4 border-b border-white/10 font-sans text-xs font-bold uppercase tracking-[4px] text-white hover:text-gold-400 transition-colors"
            >
              {dict.nav.estate}
            </Link>
            <Link
              href="/#footer"
              onClick={() => setMobileMenuOpen(false)}
              className="py-4 border-b border-white/10 font-sans text-xs font-bold uppercase tracking-[4px] text-white hover:text-gold-400 transition-colors"
            >
              {dict.nav.contact}
            </Link>
            <button
              type="button"
              onClick={() => openAccountEntry()}
              className="py-4 border-b border-white/10 font-sans text-xs font-bold uppercase tracking-[4px] text-white hover:text-gold-400 transition-colors flex items-center gap-3 w-full cursor-pointer text-left"
            >
              <User className="w-4 h-4 text-gold-400" />
              <span>{accountLabel}</span>
            </button>
            {customer && (
              <button
                type="button"
                onClick={handleLogout}
                className="py-4 border-b border-white/10 font-sans text-xs font-bold uppercase tracking-[4px] text-white hover:text-gold-400 transition-colors flex items-center gap-3 w-full cursor-pointer text-left"
              >
                <LogOut className="w-4 h-4 text-gold-400" aria-hidden="true" />
                <span>{dict.accountModal.logout}</span>
              </button>
            )}
          </nav>
          <div className="pt-6 flex items-center justify-between font-sans text-[11px] font-bold uppercase tracking-[3px] text-white/60">
            <span>{dict.common.parkName}</span>
            <button
              onClick={() => {
                toggleLanguage();
                setMobileMenuOpen(false);
              }}
              type="button"
              className="px-3 py-2 border border-white/30 text-gold-400"
              aria-label={dict.common.changeLanguage}
            >
              {currentLocale === "it" ? "EN" : "IT"}
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
