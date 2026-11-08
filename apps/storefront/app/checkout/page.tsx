import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getDictionary, Locale, defaultLocale } from "@/lib/i18n";
import { getCategories } from "@/lib/data/products";
import { getCurrentCheckoutView } from "@/lib/data/checkout";
import { getAuthToken, getCurrentCustomer } from "@/lib/data/auth-session";
import { listAddresses, type SavedAddress } from "@/lib/data/account";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AgeGateModal } from "@/components/AgeGateModal";
import { CatalogUnavailable } from "@/components/CatalogUnavailable";
import { CheckoutDetailsForm } from "@/components/checkout/CheckoutDetailsForm";
import { CheckoutShippingForm } from "@/components/checkout/CheckoutShippingForm";
import { CheckoutPlaceOrderForm } from "@/components/checkout/CheckoutPlaceOrderForm";

export async function generateMetadata(props: {
  searchParams?: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const searchParams = props.searchParams ? await props.searchParams : {};
  const currentLocale: Locale = searchParams.lang === "en" ? "en" : defaultLocale;
  return {
    title: getDictionary(currentLocale).checkout.metaTitle,
    robots: { index: false, follow: false },
  };
}

function formatEuro(amount: number) {
  return amount.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Checkout (ADR 037–039): contact, addresses, shipping, age declaration and order placement. */
export default async function CheckoutPage(props: { searchParams?: Promise<{ lang?: string }> }) {
  const searchParams = props.searchParams ? await props.searchParams : {};
  const currentLocale: Locale = searchParams.lang === "en" ? "en" : defaultLocale;
  const dict = getDictionary(currentLocale);
  const t = dict.checkout;
  const langQuery = currentLocale === "en" ? "?lang=en" : "";

  const [view, categories, customer, token] = await Promise.all([
    getCurrentCheckoutView(),
    getCategories(),
    getCurrentCustomer(),
    getAuthToken(),
  ]);
  // Logged-in customer (ADR 041): prefill the email and offer the saved addresses.
  let savedAddresses: SavedAddress[] = [];
  if (customer && token) {
    const addresses = await listAddresses(token);
    savedAddresses = addresses.ok ? addresses.data : [];
  }
  const defaultAddress = savedAddresses.find((a) => a.isDefault) ?? savedAddresses[0];

  if (view.status === "empty") {
    redirect(`/carrello${langQuery}`);
  }

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
              <Link href={`/carrello${langQuery}`} className="hover:text-wine-900 transition-colors">
                {t.breadcrumbsCart}
              </Link>
              <span className="text-ivory-400">•</span>
              <span className="text-cellar-900 font-bold">{t.title}</span>
            </nav>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-wine-950 tracking-tight">
              {t.title}
            </h1>
          </div>

          {view.status === "unavailable" && (
            <CatalogUnavailable dict={dict} retryHref={`/checkout${langQuery}`} homeHref={`/${langQuery}`} />
          )}

          {view.status === "ok" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-8 space-y-6">
                <section
                  aria-labelledby="step-details"
                  className="bg-white border border-ivory-200 p-6 sm:p-7"
                >
                  <h2 id="step-details" className="font-serif text-2xl font-bold text-wine-950 mb-5">
                    {t.stepDetails}
                  </h2>
                  <CheckoutDetailsForm
                    t={t}
                    initial={{
                      email: view.checkout.email || customer?.email || "",
                      shipping: view.checkout.shippingAddress ?? defaultAddress ?? null,
                      billing: view.checkout.billingAddress,
                      billingSameAsShipping: view.checkout.billingSameAsShipping,
                      phone: customer?.phone ?? "",
                    }}
                    savedAddresses={savedAddresses}
                  />
                </section>

                <section
                  aria-labelledby="step-shipping"
                  className="bg-white border border-ivory-200 p-6 sm:p-7"
                >
                  <h2 id="step-shipping" className="font-serif text-2xl font-bold text-wine-950 mb-5">
                    {t.stepShipping}
                  </h2>
                  {view.checkout.shippingGroups === null ? (
                    <p className="text-sm text-cellar-600">{t.shippingAfterAddress}</p>
                  ) : (
                    <CheckoutShippingForm
                      // Reset the local selection when the offered options change.
                      key={view.checkout.shippingGroups.flatMap((g) => g.options.map((o) => o.id)).join(",")}
                      t={t}
                      groups={view.checkout.shippingGroups}
                      selected={view.checkout.selectedOptionIds}
                    />
                  )}
                </section>

                <section
                  aria-labelledby="step-review"
                  className="bg-white border border-ivory-200 p-6 sm:p-7"
                >
                  <h2 id="step-review" className="font-serif text-2xl font-bold text-wine-950 mb-5">
                    {t.stepReview}
                  </h2>
                  <CheckoutPlaceOrderForm
                    t={t}
                    locale={currentLocale}
                    ready={!!view.checkout.email && view.checkout.shippingComplete}
                  />
                </section>
              </div>

              <aside
                aria-labelledby="checkout-summary"
                className="lg:col-span-4 bg-white border border-ivory-200 p-6 sm:p-7 lg:sticky lg:top-28"
              >
                <h2 id="checkout-summary" className="font-serif text-2xl font-bold text-wine-950 mb-4">
                  {t.summaryTitle}
                </h2>
                <ul className="space-y-3 mb-4">
                  {view.checkout.lines.map((line) => (
                    <li key={line.id} className="flex items-center gap-3">
                      <span className="relative w-10 h-12 shrink-0 bg-ivory-50 border border-ivory-200 overflow-hidden">
                        <Image src={line.image} alt="" fill sizes="40px" className="object-contain p-0.5" />
                      </span>
                      <span className="flex-1 min-w-0 text-xs text-cellar-800">
                        <span className="block font-semibold truncate">{line.title}</span>
                        <span className="text-cellar-500">× {line.quantity}</span>
                      </span>
                      <span className="text-xs font-semibold text-cellar-900 whitespace-nowrap">
                        € {formatEuro(line.lineTotal)}
                      </span>
                    </li>
                  ))}
                </ul>
                <dl className="space-y-1.5 border-t border-ivory-200 pt-4 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-cellar-700">{t.itemsTotal}</dt>
                    <dd className="font-semibold">€ {formatEuro(view.checkout.itemTotal)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-cellar-700">{t.shipping}</dt>
                    <dd className="font-semibold">
                      {view.checkout.shippingComplete
                        ? view.checkout.shippingTotal === 0
                          ? t.free
                          : `€ ${formatEuro(view.checkout.shippingTotal)}`
                        : t.shippingToChoose}
                    </dd>
                  </div>
                  <div className="flex justify-between items-baseline border-t border-ivory-200 pt-3 mt-2">
                    <dt className="font-semibold text-cellar-900">{t.total}</dt>
                    <dd className="font-serif text-2xl font-bold text-wine-950">
                      € {formatEuro(view.checkout.total)}
                    </dd>
                  </div>
                </dl>
                <p className="text-[11px] text-cellar-500 text-right">{t.ivaIncluded}</p>
                <Link
                  href={`/carrello${langQuery}`}
                  className="mt-4 block text-center text-xs font-semibold text-wine-900 underline hover:text-wine-950"
                >
                  {t.editCart}
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
