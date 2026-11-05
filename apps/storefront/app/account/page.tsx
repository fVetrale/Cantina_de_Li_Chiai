import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { getDictionary, Locale, defaultLocale } from "@/lib/i18n";
import { getCategories } from "@/lib/data/products";
import { Navbar } from "@/components/Navbar";
import { AccountAuthCard } from "@/components/AccountAuthCard";
import { getAuthToken, getCurrentCustomer } from "@/lib/data/auth-session";
import { listOrders } from "@/lib/data/account";
import { AccountShell } from "@/components/account/AccountShell";
import { OrderStatusBadge, formatDate, formatEuro } from "@/components/account/OrderStatusBadge";
import { User, ClipboardList, MapPin, ChevronRight, Trash2 } from "lucide-react";
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

  const [categories, customer] = await Promise.all([getCategories(), getCurrentCustomer()]);
  const langQuery = currentLocale === "en" ? "?lang=en" : "";

  if (customer) {
    // Signed in: overview of the reserved area (ADR 041).
    const a = dict.accountArea;
    const token = await getAuthToken();
    const orders = token ? await listOrders(token) : null;
    const recent = orders?.ok ? orders.data.slice(0, 3) : [];
    const cards = [
      { href: `/account/profilo${langQuery}`, label: a.navProfile, icon: User },
      { href: `/account/ordini${langQuery}`, label: a.navOrders, icon: ClipboardList },
      { href: `/account/indirizzi${langQuery}`, label: a.navAddresses, icon: MapPin },
    ];
    return (
      <AccountShell dict={dict} locale={currentLocale} categories={categories} firstName={customer.firstName} active="overview">
        <div className="space-y-6">
          <p className="text-sm text-cellar-700">{a.overviewIntro}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {cards.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="group flex items-center gap-3 rounded-2xl bg-white border border-ivory-200 p-5 shadow-sm hover:border-wine-300 transition-colors"
              >
                <Icon className="w-5 h-5 text-wine-900" aria-hidden="true" />
                <span className="flex-1 font-semibold text-cellar-900">{label}</span>
                <ChevronRight className="w-4 h-4 text-cellar-400 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
              </Link>
            ))}
          </div>

          <section aria-labelledby="recent-orders" className="rounded-2xl bg-white border border-ivory-200 shadow-sm p-5 sm:p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 id="recent-orders" className="font-serif text-xl font-bold text-wine-950">{a.recentOrders}</h2>
              <Link href={`/account/ordini${langQuery}`} className="text-xs font-semibold text-wine-900 underline">
                {a.viewAllOrders}
              </Link>
            </div>
            {recent.length === 0 ? (
              <p className="text-sm text-cellar-600">{a.ordersEmpty}</p>
            ) : (
              <ul className="divide-y divide-ivory-200">
                {recent.map((order) => (
                  <li key={order.id}>
                    <Link
                      href={`/account/ordini/${order.id}${langQuery}`}
                      className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3 text-sm hover:bg-ivory-50 rounded-lg px-2 -mx-2"
                    >
                      <span className="font-semibold text-cellar-900">
                        {a.orderNumber} {order.displayId !== null ? `#${order.displayId}` : "—"}
                      </span>
                      <span className="text-cellar-500">{formatDate(order.createdAt, currentLocale)}</span>
                      <OrderStatusBadge status={order.status} t={a} />
                      <span className="ml-auto font-semibold">€ {formatEuro(order.total)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby="delete-account" className="rounded-2xl border border-ivory-300 bg-ivory-50 p-5">
            <h2 id="delete-account" className="flex items-center gap-2 text-sm font-semibold text-cellar-900">
              <Trash2 className="w-4 h-4 text-cellar-500" aria-hidden="true" />
              {a.deleteAccountTitle}
            </h2>
            <p className="mt-1 text-xs text-cellar-600">{a.deleteAccountDesc}</p>
            {/* Self-service deletion is a planned improvement (docs/miglioramenti-e-produzione.md). */}
            <Link href="/#footer" className="mt-2 inline-block text-xs font-semibold text-wine-900 underline">
              {a.deleteAccountLink}
            </Link>
          </section>
        </div>
      </AccountShell>
    );
  }

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

          <AccountAuthCard dict={dict} currentLocale={currentLocale} />
        </div>
      </main>

      {/* 3. Footer */}
      <Footer dict={dict} />

      {/* 4. Age Verification Modal */}
      <AgeGateModal dict={dict} />
    </div>
  );
}
