import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, IdCard, Store } from "lucide-react";
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
    <div className="flex min-h-screen flex-col bg-ivory-50 text-cellar-900 selection:bg-wine-800 selection:text-gold-200">
      <Navbar dict={dict} currentLocale={currentLocale} categories={categories} />

      <main className="flex-grow pt-24 sm:pt-28 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {view.status === "unavailable" && (
            <CatalogUnavailable
              dict={dict}
              headingLevel="h1"
              retryHref={`/ordine/confermato${langQuery}`}
              homeHref={`/${langQuery}`}
            />
          )}

          {view.status === "none" && (
            <section className="py-16 text-center" aria-labelledby="no-order-title">
              <h1 id="no-order-title" className="font-serif text-3xl font-bold text-wine-950 mb-6">
                {t.noOrder}
              </h1>
              <Link
                href={`/vini${langQuery}`}
                className="inline-flex items-center bg-wine-900 px-6 py-3 text-sm font-semibold text-ivory-50 hover:bg-wine-950"
              >
                {t.continueShopping}
              </Link>
            </section>
          )}

          {view.status === "ok" && (
            <section aria-labelledby="order-title" className="bg-white border border-ivory-200 p-6 sm:p-9">
              <div className="flex items-start gap-3 mb-6">
                <CheckCircle2 className="w-8 h-8 text-olive-700 shrink-0" aria-hidden="true" />
                <div>
                  <h1 id="order-title" className="font-serif text-3xl sm:text-4xl font-bold text-wine-950">
                    {t.title}
                  </h1>
                  <p className="text-sm text-cellar-700 mt-1">{t.thanks}</p>
                </div>
              </div>

              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-6">
                <div className="bg-ivory-50 border border-ivory-200 p-4">
                  <dt className="text-xs text-cellar-500">{t.orderNumber}</dt>
                  <dd className="font-serif text-2xl font-bold text-wine-950">
                    {view.order.displayId !== null ? `#${view.order.displayId}` : "—"}
                  </dd>
                </div>
                <div className="bg-ivory-50 border border-ivory-200 p-4">
                  <dt className="text-xs text-cellar-500">{t.summaryFor}</dt>
                  <dd className="font-semibold text-cellar-900 break-all">{view.order.email}</dd>
                </div>
              </dl>

              <h2 className="text-sm font-semibold text-cellar-900 mb-2">{t.items}</h2>
              <ul className="divide-y divide-ivory-200 mb-4">
                {view.order.lines.map((line) => (
                  <li key={line.id} className="flex items-center gap-3 py-3">
                    <span className="relative w-10 h-12 shrink-0 bg-ivory-50 border border-ivory-200 overflow-hidden">
                      <Image src={line.image} alt="" fill sizes="40px" className="object-contain p-0.5" />
                    </span>
                    <span className="flex-1 min-w-0 text-sm">
                      <span className="block font-semibold text-cellar-900">{line.title}</span>
                      <span className="text-xs text-cellar-500">
                        {line.variantTitle} × {line.quantity}
                      </span>
                    </span>
                    <span className="text-sm font-semibold whitespace-nowrap">€ {formatEuro(line.lineTotal)}</span>
                  </li>
                ))}
              </ul>

              <dl className="space-y-1.5 border-t border-ivory-200 pt-4 text-sm">
                {view.order.shippingMethods.map((method) => (
                  <div key={method.id} className="flex justify-between">
                    <dt className="text-cellar-700">
                      {t.shipping}: {method.name}
                    </dt>
                    <dd className="font-semibold">{method.amount === 0 ? t.free : `€ ${formatEuro(method.amount)}`}</dd>
                  </div>
                ))}
                <div className="flex justify-between items-baseline border-t border-ivory-200 pt-3 mt-2">
                  <dt className="font-semibold text-cellar-900">{t.total}</dt>
                  <dd className="font-serif text-2xl font-bold text-wine-950">€ {formatEuro(view.order.total)}</dd>
                </div>
              </dl>
              <p className="text-[11px] text-cellar-500 text-right">{t.ivaIncluded}</p>

              <ul className="mt-6 space-y-2 text-xs text-cellar-700">
                <li className="flex items-start gap-2">
                  <IdCard className="w-4 h-4 shrink-0 text-wine-900" aria-hidden="true" />
                  {t.idCheckNotice}
                </li>
                <li className="flex items-start gap-2">
                  <Store className="w-4 h-4 shrink-0 text-wine-900" aria-hidden="true" />
                  {t.pickupInfo}
                </li>
              </ul>
              <p className="mt-4 text-xs text-cellar-500">{t.contactNote}</p>

              <Link
                href={`/vini${langQuery}`}
                className="mt-6 inline-flex items-center bg-wine-900 px-6 py-3 text-sm font-semibold text-ivory-50 hover:bg-wine-950"
              >
                {t.continueShopping}
              </Link>
            </section>
          )}
        </div>
      </main>

      <Footer dict={dict} />
      <AgeGateModal dict={dict} />
    </div>
  );
}
