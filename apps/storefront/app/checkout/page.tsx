import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Check, ChevronDown } from "lucide-react";
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

  // Step state for the indicator (ADR 051): it only reflects what the checkout already knows.
  const detailsDone = view.status === "ok" && !!view.checkout.email && !!view.checkout.shippingAddress;
  const shippingDone = view.status === "ok" && view.checkout.shippingComplete;
  const steps = [
    { id: "step-details", label: t.stepDetails, done: detailsDone },
    { id: "step-shipping", label: t.stepShipping, done: shippingDone },
    { id: "step-review", label: t.stepReview, done: false },
  ];
  const currentStep = steps.findIndex((s) => !s.done);

  return (
    <div className="flex min-h-screen flex-col bg-white text-black selection:bg-black selection:text-white">
      <Navbar dict={dict} currentLocale={currentLocale} categories={categories} />

      <main className="flex-grow pt-16 lg:pt-[72px] pb-24">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
          <header className="pt-12 lg:pt-20 pb-10">
            <Link href={`/carrello${langQuery}`} className="link-editorial text-gray-600 hover:text-black">
              {t.backToCart}
            </Link>
            <p className="mt-10 label-caps text-gold-700 mb-5">{t.eyebrow}</p>
            <h1 className="title-page">{t.title}</h1>

            {view.status === "ok" && (
              <nav aria-label={t.stepsLabel} className="mt-10">
                <ol className="flex flex-wrap items-center gap-x-8 gap-y-3">
                  {steps.map((step, index) => {
                    const state = step.done ? "done" : index === currentStep ? "current" : "next";
                    return (
                      <li key={step.id}>
                        <a
                          href={`#${step.id}`}
                          aria-current={state === "current" ? "step" : undefined}
                          className={`flex items-center gap-3 font-sans text-[11px] font-bold uppercase tracking-[3px] transition-colors ${
                            state === "done" ? "text-gold-700" : state === "current" ? "text-black" : "text-gray-500"
                          }`}
                        >
                          <span className="font-serif text-lg tracking-normal">{String(index + 1).padStart(2, "0")}</span>
                          <span>{step.label}</span>
                          {state === "done" && (
                            <>
                              <Check className="w-3.5 h-3.5" aria-hidden="true" />
                              <span className="sr-only">({t.stepCompleted})</span>
                            </>
                          )}
                        </a>
                      </li>
                    );
                  })}
                </ol>
              </nav>
            )}
          </header>

          {view.status === "unavailable" && (
            <CatalogUnavailable dict={dict} retryHref={`/checkout${langQuery}`} homeHref={`/${langQuery}`} />
          )}

          {view.status === "ok" && (
            <>
              {/* Mobile: collapsible summary at the top, closed by default */}
              <details className="lg:hidden mb-10 bg-gray-100 group">
                <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                  <span className="label-caps text-black">{t.showSummary}</span>
                  <span className="flex items-center gap-3 font-serif text-xl">
                    € {formatEuro(view.checkout.total)}
                    <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" aria-hidden="true" />
                  </span>
                </summary>
                <div className="px-5 pb-6">
                  <SummaryContent view={view.checkout} t={t} langQuery={langQuery} />
                </div>
              </details>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-16 items-start">
                <div className="lg:col-span-7 form-editorial">
                  <section id="step-details" aria-labelledby="step-details-title" className="scroll-mt-32 border-t border-black pt-8 pb-14">
                    <StepTitle number="01" id="step-details-title" label={t.stepDetails} />
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

                  <section id="step-shipping" aria-labelledby="step-shipping-title" className="scroll-mt-32 border-t border-black pt-8 pb-14">
                    <StepTitle number="02" id="step-shipping-title" label={t.stepShipping} />
                    {view.checkout.shippingGroups === null ? (
                      <p className="text-sm text-gray-600">{t.shippingAfterAddress}</p>
                    ) : (
                      <CheckoutShippingForm
                        labels={dict.shipping}
                        // Reset the local selection when the offered options change.
                        key={view.checkout.shippingGroups.flatMap((g) => g.options.map((o) => o.id)).join(",")}
                        t={t}
                        groups={view.checkout.shippingGroups}
                        selected={view.checkout.selectedOptionIds}
                      />
                    )}
                  </section>

                  <section id="step-review" aria-labelledby="step-review-title" className="scroll-mt-32 border-t border-black pt-8">
                    <StepTitle number="03" id="step-review-title" label={t.stepReview} />
                    <CheckoutPlaceOrderForm
                      t={t}
                      locale={currentLocale}
                      ready={!!view.checkout.email && view.checkout.shippingComplete}
                    />
                  </section>
                </div>

                <aside
                  aria-labelledby="checkout-summary"
                  className="hidden lg:block lg:col-span-5 bg-gray-100 p-8 lg:p-10 lg:sticky lg:top-[calc(var(--header-offset)+2rem)] transition-[top] duration-300"
                >
                  <h2 id="checkout-summary" className="label-caps text-black mb-8">
                    {t.summaryTitle}
                  </h2>
                  <SummaryContent view={view.checkout} t={t} langQuery={langQuery} />
                </aside>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer dict={dict} />
      <AgeGateModal dict={dict} />
    </div>
  );
}

function StepTitle({ number, id, label }: { number: string; id: string; label: string }) {
  return (
    <h2 id={id} className="mb-8 flex items-baseline gap-5">
      <span className="font-serif text-4xl text-gold-700">{number}</span>
      <span className="title-section">{label}</span>
    </h2>
  );
}

type CheckoutData = Extract<Awaited<ReturnType<typeof getCurrentCheckoutView>>, { status: "ok" }>["checkout"];

/** Order summary: wines, totals, IVA (desktop sidebar and mobile collapsible). */
function SummaryContent({
  view,
  t,
  langQuery,
}: {
  view: CheckoutData;
  t: ReturnType<typeof getDictionary>["checkout"];
  langQuery: string;
}) {
  return (
    <>
      <ul className="space-y-4 mb-6">
        {view.lines.map((line) => (
          <li key={line.id} className="flex items-center gap-4">
            <span className="relative w-12 h-16 shrink-0 overflow-hidden bg-white">
              <Image src={line.image} alt="" fill sizes="48px" className="object-cover" />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block font-serif text-lg truncate">{line.title}</span>
              <span className="font-sans text-[11px] font-bold uppercase tracking-[2px] text-gray-600">× {line.quantity}</span>
            </span>
            <span className="font-serif text-lg whitespace-nowrap">€ {formatEuro(line.lineTotal)}</span>
          </li>
        ))}
      </ul>
      <dl className="space-y-2 border-t border-ivory-400 pt-5 text-sm">
        <div className="flex justify-between">
          <dt className="text-gray-600">{t.itemsTotal}</dt>
          <dd>€ {formatEuro(view.itemTotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-gray-600">{t.shipping}</dt>
          <dd>
            {view.shippingComplete
              ? view.shippingTotal === 0
                ? t.free
                : `€ ${formatEuro(view.shippingTotal)}`
              : t.shippingToChoose}
          </dd>
        </div>
        <div className="flex justify-between items-baseline border-t border-ivory-400 pt-4 mt-3">
          <dt className="label-caps text-black">{t.total}</dt>
          <dd className="font-serif text-3xl">€ {formatEuro(view.total)}</dd>
        </div>
      </dl>
      <p className="mt-1 text-xs text-gray-600 text-right">{t.ivaIncluded}</p>
      <div className="mt-6 text-center">
        <Link href={`/carrello${langQuery}`} className="link-editorial text-black hover:text-gold-700">
          {t.editCart}
        </Link>
      </div>
    </>
  );
}
