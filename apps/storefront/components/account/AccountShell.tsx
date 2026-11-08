import Link from "next/link";
import type { ReactNode } from "react";
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

/**
 * Common frame of the reserved-area pages (ADR 041, restyled in ADR 050): a black header with the
 * greeting, a horizontal tab bar under it (sticky, follows the auto-hiding site header) and the
 * page content with editorial form fields. Server component.
 */
export function AccountShell({ dict, locale, categories, firstName, active, children }: AccountShellProps) {
  const t = dict.accountArea;
  const lang = locale === "en" ? "?lang=en" : "";
  const links: { key: AccountSection; href: string; label: string }[] = [
    { key: "overview", href: `/account${lang}`, label: t.navOverview },
    { key: "profile", href: `/account/profilo${lang}`, label: t.navProfile },
    { key: "orders", href: `/account/ordini${lang}`, label: t.navOrders },
    { key: "addresses", href: `/account/indirizzi${lang}`, label: t.navAddresses },
    { key: "wishlist", href: `/account/preferiti${lang}`, label: t.navWishlist },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-white text-black selection:bg-black selection:text-white">
      <Navbar dict={dict} currentLocale={locale} categories={categories} />

      <main className="flex-grow pt-16 lg:pt-[72px]">
        <header className="bg-black text-white">
          <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10 py-14 lg:py-20 flex flex-wrap items-end justify-between gap-6">
            <div className="animate-fade-in">
              <p className="label-caps text-gold-400 mb-5">{t.title}</p>
              <h1 className="title-page text-white">{t.greeting.replace("{name}", firstName)}</h1>
            </div>
            <LogoutButton label={dict.accountModal.logout} homeHref={`/${lang}`} />
          </div>
        </header>

        <nav aria-label={t.title} className="sticky-under-header z-30 bg-white border-b border-ivory-300">
          <ul className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10 flex items-center gap-7 lg:gap-10 overflow-x-auto no-scrollbar">
            {links.map(({ key, href, label }) => (
              <li key={key} className="shrink-0">
                <Link
                  href={href}
                  aria-current={active === key ? "page" : undefined}
                  className={`relative block py-4 font-sans text-[11px] font-bold uppercase tracking-[3px] whitespace-nowrap transition-colors duration-200 ${
                    active === key
                      ? "text-black after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-black"
                      : "text-gray-500 hover:text-black"
                  }`}
                >
                  {label}
                </Link>
              </li>
            ))}
            <li className="shrink-0">
              <span aria-disabled="true" className="block py-4 font-sans text-[11px] font-bold uppercase tracking-[3px] whitespace-nowrap text-gray-300">
                {t.navCards} · {t.comingSoon}
              </span>
            </li>
          </ul>
        </nav>

        <div className="form-editorial mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10 py-12 lg:py-16">{children}</div>
      </main>

      <Footer dict={dict} />
      <AgeGateModal dict={dict} />
    </div>
  );
}
