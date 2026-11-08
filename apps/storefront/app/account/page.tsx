import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getDictionary, Locale, defaultLocale } from "@/lib/i18n";
import { getCategories } from "@/lib/data/products";
import { Navbar } from "@/components/Navbar";
import { AccountAuthCard } from "@/components/AccountAuthCard";
import { getAuthToken, getCurrentCustomer } from "@/lib/data/auth-session";
import { listOrders } from "@/lib/data/account";
import { AccountShell } from "@/components/account/AccountShell";
import { OrderStatusBadge, formatDate, formatEuro } from "@/components/account/OrderStatusBadge";
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
    const tiles = [
      { href: `/account/profilo${langQuery}`, label: a.navProfile },
      { href: `/account/ordini${langQuery}`, label: a.navOrders },
      { href: `/account/indirizzi${langQuery}`, label: a.navAddresses },
      { href: `/account/preferiti${langQuery}`, label: a.navWishlist },
    ];
    return (
      <AccountShell dict={dict} locale={currentLocale} categories={categories} firstName={customer.firstName} active="overview">
        <p className="text-editorial text-gray-600 max-w-2xl">{a.overviewIntro}</p>

        {/* Sections as editorial tiles */}
        <ul className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-t border-black">
          {tiles.map(({ href, label }, index) => (
            <li key={href} className="border-b border-ivory-300 sm:[&:nth-child(odd)]:border-r lg:border-r lg:last:border-r-0 border-ivory-300">
              <Link href={href} className="group flex h-full flex-col justify-between gap-10 p-6 lg:p-8 hover:bg-gray-100 transition-colors">
                <span className="font-sans text-[11px] font-bold tracking-[3px] text-gold-700">{String(index + 1).padStart(2, "0")}</span>
                <span className="font-serif text-2xl text-black group-hover:text-gold-700 transition-colors">{label}</span>
              </Link>
            </li>
          ))}
        </ul>

        {/* Recent orders */}
        <section aria-labelledby="recent-orders" className="mt-16">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
            <h2 id="recent-orders" className="title-section">{a.recentOrders}</h2>
            <Link href={`/account/ordini${langQuery}`} className="link-editorial text-black hover:text-gold-700">
              {a.viewAllOrders}
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="text-sm text-gray-600 border-t border-black pt-6">{a.ordersEmpty}</p>
          ) : (
            <ul className="border-t border-black">
              {recent.map((order) => (
                <li key={order.id} className="border-b border-ivory-300">
                  <Link
                    href={`/account/ordini/${order.id}${langQuery}`}
                    className="group grid grid-cols-2 sm:grid-cols-[1.4fr_1fr_1fr_auto] items-center gap-x-6 gap-y-2 py-5 hover:bg-gray-100 px-3 -mx-3 transition-colors"
                  >
                    <span className="font-serif text-xl">
                      {a.orderNumber} {order.displayId !== null ? `#${order.displayId}` : "—"}
                    </span>
                    <span className="text-sm text-gray-600">{formatDate(order.createdAt, currentLocale)}</span>
                    <OrderStatusBadge status={order.status} t={a} />
                    <span className="font-serif text-xl text-right">€ {formatEuro(order.total)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Account deletion request (self-service deletion is planned: docs/miglioramenti-e-produzione.md) */}
        <section aria-labelledby="delete-account" className="mt-16 bg-gray-100 p-6 lg:p-8 max-w-2xl">
          <h2 id="delete-account" className="label-caps text-black">{a.deleteAccountTitle}</h2>
          <p className="mt-3 text-sm text-gray-600">{a.deleteAccountDesc}</p>
          <Link href="/#footer" className="mt-5 link-editorial text-black hover:text-gold-700">
            {a.deleteAccountLink}
          </Link>
        </section>
      </AccountShell>
    );
  }

  // Guest: split page (ADR 050), a chiaroscuro photo with the title on the left, the forms on the right.
  return (
    <div className="flex min-h-screen flex-col bg-white text-black selection:bg-black selection:text-white">
      <Navbar dict={dict} currentLocale={currentLocale} categories={categories} />

      <main className="flex-grow pt-16 lg:pt-[72px] grid grid-cols-1 lg:grid-cols-2">
        <section className="relative overflow-hidden bg-black text-white min-h-[320px] lg:min-h-[calc(100svh-72px)] flex items-end lg:items-center">
          <Image
            src="/images/grappolo.jpeg"
            alt={dict.images.grapes}
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover grayscale-[50%] brightness-[0.45] contrast-125"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />
          <div className="relative px-6 sm:px-12 lg:px-16 py-12 lg:py-20 max-w-xl animate-fade-in">
            <p className="label-caps text-gold-400 mb-6">{t.eyebrow}</p>
            <h1 className="title-page text-white">{t.title}</h1>
            <p className="mt-6 text-editorial text-white/80">{t.subtitle}</p>
          </div>
        </section>

        <section className="form-editorial px-4 sm:px-10 lg:px-16 py-12 lg:py-16 flex items-start lg:items-center">
          <div className="w-full max-w-xl mx-auto">
            <AccountAuthCard dict={dict} currentLocale={currentLocale} />
          </div>
        </section>
      </main>

      <Footer dict={dict} />
      <AgeGateModal dict={dict} />
    </div>
  );
}
