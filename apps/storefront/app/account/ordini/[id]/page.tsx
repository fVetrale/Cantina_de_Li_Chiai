import type { Metadata } from "next";
import { localizeVariantTitle } from "@/lib/data/wine-copy";
import Link from "next/link";
import { shippingName } from "@/lib/shipping-labels";
import Image from "next/image";
import { notFound } from "next/navigation";
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
      <Link href={`/account/ordini${lang}`} className="mb-10 link-editorial text-black hover:text-gold-700">
        {t.backToOrders}
      </Link>

      {!result.ok ? (
        <CatalogUnavailable dict={dict} retryHref={`/account/ordini/${encodeURIComponent(id)}${lang}`} />
      ) : (
        <section aria-labelledby="order-title" className="space-y-10 max-w-4xl">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <h2 id="order-title" className="title-section">
              {t.orderNumber} {result.data.display_id ? `#${result.data.display_id}` : "—"}
            </h2>
            <OrderStatusBadge status={toStatusKey(result.data.status, result.data.fulfillment_status)} t={t} />
            <span className="text-sm text-gray-600">{formatDate(result.data.created_at, locale)}</span>
          </div>

          <div>
            <h3 className="label-caps text-black mb-4">{t.products}</h3>
            <ul className="border-t border-black">
              {(result.data.items ?? []).map((item) => (
                <li key={item.id} className="flex items-center gap-5 py-5 border-b border-ivory-300">
                  <span className="relative w-14 h-20 shrink-0 bg-gray-100 overflow-hidden">
                    <Image src={getLocalProductImage(item.product_handle ?? "")} alt="" fill sizes="56px" className="object-cover" />
                  </span>
                  <span className="flex-1 min-w-0 text-sm">
                    <span className="block font-serif text-xl text-black">{item.product_title ?? item.title}</span>
                    <span className="font-sans text-[11px] font-bold uppercase tracking-[2px] text-gray-600">
                      {localizeVariantTitle(item.variant_title ?? "", locale)} × {item.quantity}
                    </span>
                  </span>
                  <span className="font-serif text-lg whitespace-nowrap">
                    € {formatEuro((item.unit_price ?? 0) * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <dl className="space-y-2 bg-gray-100 p-6 lg:p-8 text-sm max-w-md ml-auto">
            {(result.data.shipping_methods ?? []).map((m) => (
              <div key={m.id} className="flex justify-between">
                <dt className="text-gray-600">
                  {t.shipping}: {shippingName(dict.shipping, m.name)}
                </dt>
                <dd className="font-semibold">{(m.amount ?? 0) === 0 ? t.free : `€ ${formatEuro(m.amount ?? 0)}`}</dd>
              </div>
            ))}
            <div className="flex justify-between items-baseline border-t border-ivory-400 pt-4 mt-3">
              <dt className="label-caps text-black">{t.total}</dt>
              <dd className="font-serif text-3xl">€ {formatEuro(result.data.total ?? 0)}</dd>
            </div>
          </dl>
          <p className="text-xs text-gray-600 text-right -mt-8">{t.ivaIncluded}</p>

          {result.data.shipping_address?.address_1 && (
            <div>
              <h3 className="label-caps text-black mb-3">
                {t.shippingAddress}
              </h3>
              <address className="not-italic text-sm text-gray-600 leading-relaxed">
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
