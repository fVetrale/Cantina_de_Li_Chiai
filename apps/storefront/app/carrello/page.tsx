import type { Metadata } from "next";
import Link from "next/link";
import { ShoppingBag, Truck, Store, Lock } from "lucide-react";
import { getDictionary, Locale, defaultLocale } from "@/lib/i18n";
import { getCategories } from "@/lib/data/products";
import { getCurrentCartView } from "@/lib/data/cart-session";
import { FREE_SHIPPING_THRESHOLD_EUR } from "@/lib/data/cart";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AgeGateModal } from "@/components/AgeGateModal";
import { CartLineItem } from "@/components/CartLineItem";
import { CatalogUnavailable } from "@/components/CatalogUnavailable";

export async function generateMetadata(props: {
  searchParams?: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const searchParams = props.searchParams ? await props.searchParams : {};
  const currentLocale: Locale = searchParams.lang === "en" ? "en" : defaultLocale;
  const dict = getDictionary(currentLocale);
  return {
    title: dict.cartPage.metaTitle,
    // A cart is personal: never index it.
    robots: { index: false, follow: false },
  };
}

function formatEuro(amount: number) {
  return amount.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Cart page (ADR 036). Reads the visitor's cart from the httpOnly cookie on the server. */
export default async function CartPage(props: { searchParams?: Promise<{ lang?: string }> }) {
  const searchParams = props.searchParams ? await props.searchParams : {};
  const currentLocale: Locale = searchParams.lang === "en" ? "en" : defaultLocale;
  const dict = getDictionary(currentLocale);
  const t = dict.cartPage;
  const langQuery = currentLocale === "en" ? "?lang=en" : "";

  const [view, categories] = await Promise.all([getCurrentCartView(), getCategories()]);

  return (
    <div className="flex min-h-screen flex-col bg-ivory-50 text-cellar-900 selection:bg-wine-800 selection:text-gold-200">
      <Navbar dict={dict} currentLocale={currentLocale} categories={categories} />

      <main className="flex-grow pt-24 sm:pt-28 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 pb-4 border-b border-ivory-300">
            <nav
              aria-label="Breadcrumbs"
              className="flex items-center gap-2 text-xs font-semibold text-gold-700 uppercase tracking-wider mb-1.5"
            >
              <Link href={`/${langQuery}`} className="hover:text-wine-900 transition-colors">
                {t.breadcrumbsHome}
              </Link>
              <span className="text-ivory-400">•</span>
              <span className="text-cellar-900 font-bold">{t.title}</span>
            </nav>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-wine-950 tracking-tight">
              {t.title}
            </h1>
          </div>

          {view.status === "unavailable" && (
            <CatalogUnavailable
              dict={dict}
              retryHref={`/carrello${langQuery}`}
              homeHref={`/${langQuery}`}
            />
          )}

          {view.status === "empty" && (
            <section className="py-16 text-center" aria-labelledby="cart-empty-title">
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-ivory-100 border border-ivory-300">
                <ShoppingBag className="h-6 w-6 text-wine-900" aria-hidden="true" />
              </div>
              <h2 id="cart-empty-title" className="font-serif text-2xl font-bold text-wine-950 mb-6">
                {t.empty}
              </h2>
              <Link
                href={`/vini${langQuery}`}
                className="inline-flex items-center bg-wine-900 px-6 py-3 text-sm font-semibold text-ivory-50 hover:bg-wine-950 transition-colors"
              >
                {t.emptyCta}
              </Link>
            </section>
          )}

          {view.status === "ok" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Lines */}
              <section className="lg:col-span-8 bg-white border border-ivory-200 px-5 sm:px-7" aria-label={t.title}>
                <ul>
                  {view.cart.lines.map((line) => (
                    <CartLineItem
                      key={line.id}
                      line={line}
                      productHref={`/prodotti/${line.handle}${langQuery}`}
                      t={t}
                      cartT={{
                        available: dict.cart.available,
                        errorOutOfStock: dict.cart.errorOutOfStock,
                        errorUnavailable: dict.cart.errorUnavailable,
                        errorInvalid: dict.cart.errorInvalid,
                      }}
                    />
                  ))}
                </ul>
              </section>

              {/* Summary */}
              <aside
                className="lg:col-span-4 bg-white border border-ivory-200 p-6 sm:p-7 lg:sticky lg:top-28"
                aria-labelledby="cart-summary-title"
              >
                <h2 id="cart-summary-title" className="font-serif text-2xl font-bold text-wine-950 mb-4">
                  {t.summaryTitle}
                </h2>

                <div className="flex items-baseline justify-between text-sm">
                  <span className="text-cellar-700">
                    {t.itemsTotal} ({view.cart.itemCount} {t.itemsLabel})
                  </span>
                  <span className="font-serif text-2xl font-bold text-wine-950">
                    € {formatEuro(view.cart.itemTotal)}
                  </span>
                </div>
                <p className="text-[11px] text-cellar-500 text-right">
                  {t.ivaIncluded} • {t.shippingAtCheckout}
                </p>

                <FreeShippingProgress itemTotal={view.cart.itemTotal} t={t} />

                <ul className="mt-4 space-y-2 text-xs text-cellar-700">
                  <li className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-wine-900 shrink-0" aria-hidden="true" />
                    {t.pickupFree}
                  </li>
                </ul>

                <Link
                  href={`/checkout${langQuery}`}
                  className="mt-6 w-full inline-flex items-center justify-center gap-2 bg-wine-900 px-6 py-3.5 text-sm font-bold uppercase tracking-wider text-ivory-50 hover:bg-wine-950 transition-colors"
                >
                  <Lock className="w-4 h-4" aria-hidden="true" />
                  {t.proceedToCheckout}
                </Link>

                <Link
                  href={`/vini${langQuery}`}
                  className="mt-4 block text-center text-xs font-semibold text-wine-900 underline hover:text-wine-950"
                >
                  {t.continueShopping}
                </Link>
              </aside>
            </div>
          )}
        </div>
      </main>

      <Footer dict={dict} />
      <AgeGateModal dict={dict} />
    </div>
  );
}

/** "€X away from free shipping" bar. Medusa applies the real rule at checkout (ADR 033). */
function FreeShippingProgress({
  itemTotal,
  t,
}: {
  itemTotal: number;
  t: ReturnType<typeof getDictionary>["cartPage"];
}) {
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD_EUR - itemTotal);
  const progress = Math.min(100, Math.round((itemTotal / FREE_SHIPPING_THRESHOLD_EUR) * 100));
  const label =
    remaining > 0
      ? t.freeShippingRemaining.replace("{amount}", `€ ${formatEuro(remaining)}`)
      : t.freeShippingReached;

  return (
    <div className="mt-5 bg-ivory-50 border border-ivory-200 p-4">
      <p className="flex items-center gap-2 text-xs font-semibold text-cellar-800">
        <Truck className="w-4 h-4 text-wine-900 shrink-0" aria-hidden="true" />
        {label}
      </p>
      <div
        className="mt-2.5 h-2 w-full rounded-full bg-ivory-200 overflow-hidden"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
        aria-label={label}
      >
        <div
          className={`h-full rounded-full ${remaining > 0 ? "bg-gold-500" : "bg-olive-600"}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
