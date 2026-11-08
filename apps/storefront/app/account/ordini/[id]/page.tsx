import type { Metadata } from "next";
import { localizeVariantTitle } from "@/lib/data/wine-copy";
import Link from "next/link";
import { shippingName } from "@/lib/shipping-labels";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ChevronLeft, MapPin } from "lucide-react";
import { getDictionary, Locale, defaultLocale } from "@/lib/i18n";
import { getCategories, getLocalProductImage } from "@/lib/data/products";
import { requireCustomer } from "@/lib/data/account-guard";
import { retrieveOwnOrder, toStatusKey } from "@/lib/data/account";
import { AccountShell } from "@/components/account/AccountShell";
import { OrderStatusBadge, formatDate, formatEuro } from "@/components/account/OrderStatusBadge";
import { CatalogUnavailable } from "@/components/CatalogUnavailable";

type Props = { params: Promise<{ id: string }>; searchParams?: Promise<{ lang?: string }> };

async function localeOf(props: Props): Promise<Locale> {
  const sp = props.searchParams ? await props.searchParams : {};
  return sp.lang === "en" ? "en" : defaultLocale;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const t = getDictionary(await localeOf(props)).accountArea;
  return { title: `${t.ordersTitle} | ${t.metaTitle}`, robots: { index: false, follow: false } };
}

/**
 * Order detail (ADR 041). The id in the URL is safe here: the order is fetched through the
 * customer-scoped list, so an order of someone else (or a guessed id) gives 404. A shared link
 * shows nothing to anybody but the owner.
 */
export default async function OrderDetailPage(props: Props) {
  const locale = await localeOf(props);
  const dict = getDictionary(locale);
  const t = dict.accountArea;
  const lang = locale === "en" ? "?lang=en" : "";
  const { id } = await props.params;
  const { customer, token } = await requireCustomer(locale);
  const [categories, result] = await Promise.all([getCategories(), retrieveOwnOrder(token, id)]);

  if (!result.ok && result.error === "not_found") {
    notFound();
  }

  return (
    <AccountShell dict={dict} locale={locale} categories={categories} firstName={customer.firstName} active="orders">
      <Link href={`/account/ordini${lang}`} className="mb-4 inline-flex items-center gap-1 text-xs font-semibold text-wine-900 underline">
        <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
        {t.backToOrders}
      </Link>

      {!result.ok ? (
        <CatalogUnavailable dict={dict} retryHref={`/account/ordini/${encodeURIComponent(id)}${lang}`} />
      ) : (
        <section aria-labelledby="order-title" className="bg-white border border-ivory-200 p-6 sm:p-7 space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <h2 id="order-title" className="font-serif text-2xl font-bold text-wine-950">
              {t.orderNumber} {result.data.display_id ? `#${result.data.display_id}` : "—"}
            </h2>
            <OrderStatusBadge status={toStatusKey(result.data.status, result.data.fulfillment_status)} t={t} />
            <span className="text-sm text-cellar-500">{formatDate(result.data.created_at, locale)}</span>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-cellar-900 mb-2">{t.products}</h3>
            <ul className="divide-y divide-ivory-200">
              {(result.data.items ?? []).map((item) => (
                <li key={item.id} className="flex items-center gap-3 py-3">
                  <span className="relative w-10 h-12 shrink-0 bg-ivory-50 border border-ivory-200 overflow-hidden">
                    <Image src={getLocalProductImage(item.product_handle ?? "")} alt="" fill sizes="40px" className="object-contain p-0.5" />
                  </span>
                  <span className="flex-1 min-w-0 text-sm">
                    <span className="block font-semibold text-cellar-900">{item.product_title ?? item.title}</span>
                    <span className="text-xs text-cellar-500">
                      {localizeVariantTitle(item.variant_title ?? "", locale)} × {item.quantity}
                    </span>
                  </span>
                  <span className="text-sm font-semibold whitespace-nowrap">
                    € {formatEuro((item.unit_price ?? 0) * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <dl className="space-y-1.5 border-t border-ivory-200 pt-4 text-sm">
            {(result.data.shipping_methods ?? []).map((m) => (
              <div key={m.id} className="flex justify-between">
                <dt className="text-cellar-700">
                  {t.shipping}: {shippingName(dict.shipping, m.name)}
                </dt>
                <dd className="font-semibold">{(m.amount ?? 0) === 0 ? t.free : `€ ${formatEuro(m.amount ?? 0)}`}</dd>
              </div>
            ))}
            <div className="flex justify-between items-baseline border-t border-ivory-200 pt-3 mt-2">
              <dt className="font-semibold text-cellar-900">{t.total}</dt>
              <dd className="font-serif text-2xl font-bold text-wine-950">€ {formatEuro(result.data.total ?? 0)}</dd>
            </div>
          </dl>
          <p className="text-[11px] text-cellar-500 text-right -mt-4">{t.ivaIncluded}</p>

          {result.data.shipping_address?.address_1 && (
            <div>
              <h3 className="flex items-center gap-1.5 text-sm font-semibold text-cellar-900 mb-1">
                <MapPin className="w-4 h-4 text-wine-900" aria-hidden="true" />
                {t.shippingAddress}
              </h3>
              <address className="not-italic text-sm text-cellar-700">
                {result.data.shipping_address.first_name} {result.data.shipping_address.last_name}
                <br />
                {result.data.shipping_address.address_1}
                {result.data.shipping_address.address_2 && `, ${result.data.shipping_address.address_2}`}
                <br />
                {result.data.shipping_address.postal_code} {result.data.shipping_address.city} ({result.data.shipping_address.province})
              </address>
            </div>
          )}
        </section>
      )}
    </AccountShell>
  );
}
