import type { Metadata } from "next";
import { localizeVariantTitle } from "@/lib/data/wine-copy";
import Link from "next/link";
import { shippingName } from "@/lib/shipping-labels";
import Image from "next/image";
import { IdCard, Store } from "lucide-react";
import { getDictionary, Locale, defaultLocale } from "@/lib/i18n";
import { getCategories } from "@/lib/data/products";
import { getLastOrderView } from "@/lib/data/order-session";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AgeGateModal } from "@/components/AgeGateModal";
import { CatalogUnavailable } from "@/components/CatalogUnavailable";

export async function generateMetadata(props: {
  searchParams?: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const searchParams = props.searchParams ? await props.searchParams : {};
  const currentLocale: Locale = searchParams.lang === "en" ? "en" : defaultLocale;
  return {
    title: getDictionary(currentLocale).orderConfirmation.metaTitle,
    robots: { index: false, follow: false },
  };
}

function formatEuro(amount: number) {
  return amount.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Order confirmation (ADR 039). The order id comes ONLY from the buyer's httpOnly cookie,
 * never from the URL: nobody can open someone else's order by guessing or sharing a link.
 * Shows no address or phone (data minimisation).
 */
export default async function OrderConfirmationPage(props: {
  searchParams?: Promise<{ lang?: string }>;
}) {
  const searchParams = props.searchParams ? await props.searchParams : {};
  const currentLocale: Locale = searchParams.lang === "en" ? "en" : defaultLocale;
  const dict = getDictionary(currentLocale);
  const t = dict.orderConfirmation;
  const langQuery = currentLocale === "en" ? "?lang=en" : "";

  const [view, categories] = await Promise.all([getLastOrderView(), getCategories()]);

  return (
    <div className="flex min-h-screen flex-col bg-white text-black selection:bg-black selection:text-white">
      <Navbar dict={dict} currentLocale={currentLocale} categories={categories} />

      <main className="flex-grow pt-16 lg:pt-[72px]">
        {view.status === "unavailable" && (
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-16">
            <CatalogUnavailable
              dict={dict}
              headingLevel="h1"
              retryHref={`/ordine/confermato${langQuery}`}
              homeHref={`/${langQuery}`}
            />
          </div>
        )}

        {/* No recent order in this browser: full screen, like the empty cart (ADR 051) */}
        {view.status === "none" && (
          <section
            aria-labelledby="no-order-title"
            className="relative overflow-hidden min-h-[calc(100svh-4rem)] lg:min-h-[calc(100svh-72px)] flex items-center justify-center text-center px-4"
          >
            <div className="absolute inset-0" aria-hidden="true">
              <Image src="/images/vigneto.jpeg" alt="" fill priority sizes="100vw" className="object-cover blur-2xl scale-110 opacity-40" />
              <div className="absolute inset-0 bg-white/80" />
            </div>
            <div className="relative animate-fade-in">
              <h1 id="no-order-title" className="title-page max-w-3xl">{t.noOrder}</h1>
              <Link href={`/vini${langQuery}`} className="mt-12 link-editorial text-black hover:text-gold-700">
                {t.continueShopping}
              </Link>
            </div>
          </section>
        )}

        {view.status === "ok" && (
          <>
            <header className="bg-black text-white">
              <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10 py-16 lg:py-24 animate-fade-in">
                <p className="label-caps text-gold-400 mb-6">{t.thanks}</p>
                <h1 id="order-title" className="title-page text-white">{t.title}</h1>
                <dl className="mt-10 flex flex-wrap gap-x-16 gap-y-6">
                  <div>
                    <dt className="font-sans text-[11px] font-bold uppercase tracking-[3px] text-white/60">{t.orderNumber}</dt>
                    <dd className="mt-2 font-serif text-4xl">{view.order.displayId !== null ? `#${view.order.displayId}` : "—"}</dd>
                  </div>
                  <div>
                    <dt className="font-sans text-[11px] font-bold uppercase tracking-[3px] text-white/60">{t.summaryFor}</dt>
                    <dd className="mt-3 text-lg break-all">{view.order.email}</dd>
                  </div>
                </dl>
              </div>
            </header>

            <section aria-labelledby="order-title" className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10 py-12 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-16 items-start">
              <div className="lg:col-span-7">
                <h2 className="label-caps text-black mb-4">{t.items}</h2>
                <ul className="border-t border-black">
                  {view.order.lines.map((line) => (
                    <li key={line.id} className="flex items-center gap-5 py-5 border-b border-ivory-300">
                      <span className="relative w-14 h-20 shrink-0 overflow-hidden bg-gray-100">
                        <Image src={line.image} alt="" fill sizes="56px" className="object-cover" />
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block font-serif text-xl">{line.title}</span>
                        <span className="font-sans text-[11px] font-bold uppercase tracking-[2px] text-gray-600">
                          {localizeVariantTitle(line.variantTitle, currentLocale)} × {line.quantity}
                        </span>
                      </span>
                      <span className="font-serif text-lg whitespace-nowrap">€ {formatEuro(line.lineTotal)}</span>
                    </li>
                  ))}
                </ul>

                <ul className="mt-10 space-y-3 text-sm text-gray-600">
                  <li className="flex items-start gap-3">
                    <IdCard className="w-4 h-4 mt-0.5 shrink-0 text-gold-700" aria-hidden="true" />
                    {t.idCheckNotice}
                  </li>
                  <li className="flex items-start gap-3">
                    <Store className="w-4 h-4 mt-0.5 shrink-0 text-gold-700" aria-hidden="true" />
                    {t.pickupInfo}
                  </li>
                </ul>
                <p className="mt-6 text-xs text-gray-600">{t.contactNote}</p>
              </div>

              <aside className="lg:col-span-5 bg-gray-100 p-8 lg:p-10">
                <dl className="space-y-2 text-sm">
                  {view.order.shippingMethods.map((method) => (
                    <div key={method.id} className="flex justify-between gap-4">
                      <dt className="text-gray-600">
                        {t.shipping}: {shippingName(dict.shipping, method.name)}
                      </dt>
                      <dd>{method.amount === 0 ? t.free : `€ ${formatEuro(method.amount)}`}</dd>
                    </div>
                  ))}
                  <div className="flex justify-between items-baseline border-t border-ivory-400 pt-4 mt-3">
                    <dt className="label-caps text-black">{t.total}</dt>
                    <dd className="font-serif text-3xl">€ {formatEuro(view.order.total)}</dd>
                  </div>
                </dl>
                <p className="mt-1 text-xs text-gray-600 text-right">{t.ivaIncluded}</p>
                <Link
                  href={`/vini${langQuery}`}
                  className="mt-10 w-full inline-flex items-center justify-center bg-black px-6 py-5 label-caps text-white hover:bg-gold-700 transition-colors duration-300"
                >
                  {t.continueShopping}
                </Link>
              </aside>
            </section>
          </>
        )}
      </main>

      <Footer dict={dict} />
      <AgeGateModal dict={dict} />
    </div>
  );
}
