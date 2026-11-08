import type { Metadata } from "next";
import { localizeVariantTitle } from "@/lib/data/wine-copy";
import Link from "next/link";
import Image from "next/image";
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
    <div className="flex min-h-screen flex-col bg-white text-black selection:bg-black selection:text-white">
      <Navbar dict={dict} currentLocale={currentLocale} categories={categories} />

      <main className={`flex-grow pt-16 lg:pt-[72px] ${view.status === "ok" ? "pb-28 lg:pb-24" : ""}`}>
        {view.status === "unavailable" && (
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-16">
            <CatalogUnavailable dict={dict} retryHref={`/carrello${langQuery}`} homeHref={`/${langQuery}`} />
          </div>
        )}

        {/* Empty cart: full-screen, over the blurred vineyard like the wines selector (ADR 050) */}
        {view.status === "empty" && (
          <section
            aria-labelledby="cart-empty-title"
            className="relative overflow-hidden min-h-[calc(100svh-4rem)] lg:min-h-[calc(100svh-72px)] flex items-center justify-center text-center px-4"
          >
            <div className="absolute inset-0" aria-hidden="true">
              <Image src="/images/vigneto.jpeg" alt="" fill priority sizes="100vw" className="object-cover blur-2xl scale-110 opacity-40" />
              <div className="absolute inset-0 bg-white/80" />
            </div>
            <div className="relative animate-fade-in">
              <p className="label-caps text-gold-700 mb-6">{t.eyebrow}</p>
              <h1 id="cart-empty-title" className="title-page max-w-3xl">{t.empty}</h1>
              <Link href={`/vini${langQuery}`} className="mt-12 link-editorial text-black hover:text-gold-700">
                {t.emptyCta}
              </Link>
            </div>
          </section>
        )}

        {view.status === "ok" && (
          <>
            <header className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 pt-12 lg:pt-20 pb-8">
              <p className="label-caps text-gold-700 mb-5">{t.eyebrow}</p>
              <h1 className="title-page">{t.title}</h1>
              <p className="mt-4 text-sm text-gray-600">
                {view.cart.itemCount} {t.itemsLabel}
              </p>
            </header>

            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-16 items-start">
              {/* Lines */}
              <section className="lg:col-span-7 border-t border-black" aria-label={t.title}>
                <ul>
                  {view.cart.lines.map((line) => (
                    <CartLineItem
                      key={line.id}
                      line={{ ...line, variantTitle: localizeVariantTitle(line.variantTitle, currentLocale) }}
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

              {/* Summary on light gray, kept in view while scrolling */}
              <aside
                className="lg:col-span-5 bg-gray-100 p-8 lg:p-10 lg:sticky lg:top-[calc(var(--header-offset)+2rem)] transition-[top] duration-300"
                aria-labelledby="cart-summary-title"
              >
                <h2 id="cart-summary-title" className="label-caps text-black mb-8">
                  {t.summaryTitle}
                </h2>

                <div className="flex items-baseline justify-between gap-4">
                  <span className="text-sm text-gray-600">
                    {t.itemsTotal} ({view.cart.itemCount} {t.itemsLabel})
                  </span>
                  <span className="font-serif text-3xl">€ {formatEuro(view.cart.itemTotal)}</span>
                </div>
                <p className="mt-1 text-xs text-gray-600 text-right">
                  {t.ivaIncluded} · {t.shippingAtCheckout}
                </p>

                <FreeShippingProgress itemTotal={view.cart.itemTotal} t={t} />

                <p className="mt-6 text-sm text-gray-600">{t.pickupFree}</p>

                <Link
                  href={`/checkout${langQuery}`}
                  className="mt-10 w-full inline-flex items-center justify-center bg-black px-6 py-5 label-caps text-white hover:bg-gold-700 transition-colors duration-300"
                >
                  {t.proceedToCheckout}
                </Link>

                <div className="mt-6 text-center">
                  <Link href={`/vini${langQuery}`} className="link-editorial text-black hover:text-gold-700">
                    {t.continueShopping}
                  </Link>
                </div>
              </aside>
            </div>

            {/* Mobile: total and checkout always at hand */}
            <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-black text-white px-4 py-3 flex items-center justify-between gap-4">
              <div>
                <p className="font-sans text-[10px] font-bold uppercase tracking-[2px] text-white/60">{dict.common.cartTotal}</p>
                <p className="font-serif text-xl">€ {formatEuro(view.cart.itemTotal)}</p>
              </div>
              <Link
                href={`/checkout${langQuery}`}
                className="inline-flex items-center justify-center bg-white px-5 py-3 font-sans text-[11px] font-bold uppercase tracking-[3px] text-black hover:bg-gold-400 transition-colors"
              >
                {t.proceedToCheckout}
              </Link>
            </div>
          </>
        )}
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
    <div className="mt-8">
      <p className="text-sm text-black">{label}</p>
      <div
        className="mt-3 h-px w-full bg-ivory-400"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
        aria-label={label}
      >
        <div className={`h-0.5 -mt-px ${remaining > 0 ? "bg-gold-500" : "bg-olive-600"}`} style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
