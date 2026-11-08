import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getDictionary, Locale, defaultLocale } from "@/lib/i18n";
import { getCategories } from "@/lib/data/products";
import { requireCustomer } from "@/lib/data/account-guard";
import { listOrders } from "@/lib/data/account";
import { AccountShell } from "@/components/account/AccountShell";
import { OrderStatusBadge, formatDate, formatEuro } from "@/components/account/OrderStatusBadge";
import { CatalogUnavailable } from "@/components/CatalogUnavailable";

type Props = { searchParams?: Promise<{ lang?: string }> };

async function localeOf(props: Props): Promise<Locale> {
  const sp = props.searchParams ? await props.searchParams : {};
  return sp.lang === "en" ? "en" : defaultLocale;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const t = getDictionary(await localeOf(props)).accountArea;
  return { title: `${t.ordersTitle} | ${t.metaTitle}`, robots: { index: false, follow: false } };
}

/** Order history (ADR 041): Medusa returns only the authenticated customer's orders. */
export default async function OrdersPage(props: Props) {
  const locale = await localeOf(props);
  const dict = getDictionary(locale);
  const t = dict.accountArea;
  const lang = locale === "en" ? "?lang=en" : "";
  const { customer, token } = await requireCustomer(locale);
  const [categories, orders] = await Promise.all([getCategories(), listOrders(token)]);

  return (
    <AccountShell dict={dict} locale={locale} categories={categories} firstName={customer.firstName} active="orders">
      <section aria-labelledby="orders-title">
        <h2 id="orders-title" className="title-section mb-6">
          {t.ordersTitle}
        </h2>
        {!orders.ok ? (
          <CatalogUnavailable dict={dict} retryHref={`/account/ordini${lang}`} />
        ) : orders.data.length === 0 ? (
          <p className="text-sm text-gray-600 border-t border-black pt-6">{t.ordersEmpty}</p>
        ) : (
          <ul className="border-t border-black">
            {orders.data.map((order) => (
              <li key={order.id} className="border-b border-ivory-300">
                <Link
                  href={`/account/ordini/${order.id}${lang}`}
                  className="group grid grid-cols-2 sm:grid-cols-[1.3fr_1fr_1fr_1fr_auto] items-center gap-x-6 gap-y-2 py-5 px-3 -mx-3 hover:bg-gray-100 transition-colors"
                >
                  <span className="font-serif text-xl">
                    {t.orderNumber} {order.displayId !== null ? `#${order.displayId}` : "—"}
                  </span>
                  <span className="text-sm text-gray-600">{formatDate(order.createdAt, locale)}</span>
                  <span>
                    <OrderStatusBadge status={order.status} t={t} />
                  </span>
                  <span className="font-serif text-lg">
                    € {formatEuro(order.total)} <span className="font-sans text-xs text-gray-600">· {order.itemCount} {t.orderItems}</span>
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1 font-sans text-[11px] font-bold uppercase tracking-[2px] text-black group-hover:text-gold-700">
                    {t.viewOrder}
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-6 text-xs text-gray-600">{t.guestOrdersNote}</p>
      </section>
    </AccountShell>
  );
}
