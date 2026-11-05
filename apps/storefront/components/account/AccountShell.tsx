import Link from "next/link";
import type { ReactNode } from "react";
import { LayoutDashboard, User, ClipboardList, MapPin, Heart, CreditCard } from "lucide-react";
import type { getDictionary, Locale } from "@/lib/i18n";
import type { WineCategory } from "@/lib/data/products";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AgeGateModal } from "@/components/AgeGateModal";
import { LogoutButton } from "@/components/auth/LogoutButton";

export type AccountSection = "overview" | "profile" | "orders" | "addresses" | "wishlist";

interface AccountShellProps {
  dict: ReturnType<typeof getDictionary>;
  locale: Locale;
  categories: WineCategory[];
  firstName: string;
  active: AccountSection;
  children: ReactNode;
}

/** Common frame of the reserved-area pages (ADR 041). Server component. */
export function AccountShell({ dict, locale, categories, firstName, active, children }: AccountShellProps) {
  const t = dict.accountArea;
  const lang = locale === "en" ? "?lang=en" : "";
  const links: { key: AccountSection; href: string; label: string; icon: typeof User }[] = [
    { key: "overview", href: `/account${lang}`, label: t.navOverview, icon: LayoutDashboard },
    { key: "profile", href: `/account/profilo${lang}`, label: t.navProfile, icon: User },
    { key: "orders", href: `/account/ordini${lang}`, label: t.navOrders, icon: ClipboardList },
    { key: "addresses", href: `/account/indirizzi${lang}`, label: t.navAddresses, icon: MapPin },
    { key: "wishlist", href: `/account/preferiti${lang}`, label: t.navWishlist, icon: Heart },
  ];
  const comingSoon = [{ label: t.navCards, icon: CreditCard }];

  return (
    <div className="flex min-h-screen flex-col bg-ivory-50 text-cellar-900 selection:bg-[#661022] selection:text-gold-200">
      <Navbar dict={dict} currentLocale={locale} categories={categories} />

      <main className="flex-grow pt-24 sm:pt-28 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="mb-8 pb-4 border-b border-ivory-300 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-gold-700 uppercase tracking-wider mb-1">{t.title}</p>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#4a141b] tracking-tight">
                {t.greeting.replace("{name}", firstName)}
              </h1>
            </div>
            <LogoutButton label={dict.accountModal.logout} homeHref={`/${lang}`} />
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <nav aria-label={t.title} className="lg:col-span-3">
              <ul className="flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0">
                {links.map(({ key, href, label, icon: Icon }) => (
                  <li key={key} className="shrink-0">
                    <Link
                      href={href}
                      aria-current={active === key ? "page" : undefined}
                      className={`flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors whitespace-nowrap ${
                        active === key
                          ? "bg-wine-900 text-ivory-50"
                          : "bg-white border border-ivory-200 text-cellar-800 hover:border-wine-300"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                      {label}
                    </Link>
                  </li>
                ))}
                {comingSoon.map(({ label, icon: Icon }) => (
                  <li key={label} className="shrink-0">
                    <span
                      aria-disabled="true"
                      className="flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-medium text-cellar-400 bg-white/60 border border-dashed border-ivory-300 whitespace-nowrap"
                    >
                      <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                      {label}
                      <span className="ml-auto rounded-full bg-ivory-100 px-2 py-0.5 text-[10px] font-semibold text-cellar-500">
                        {t.comingSoon}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="lg:col-span-9">{children}</div>
          </div>
        </div>
      </main>

      <Footer dict={dict} />
      <AgeGateModal dict={dict} />
    </div>
  );
}
