import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary, Locale, defaultLocale } from "@/lib/i18n";
import { getCategories, getProducts } from "@/lib/data/products";
import { requireCustomer } from "@/lib/data/account-guard";
import { AccountShell } from "@/components/account/AccountShell";
import { WineCard } from "@/components/WineCard";
import { CatalogUnavailable } from "@/components/CatalogUnavailable";

type Props = { searchParams?: Promise<{ lang?: string }> };

async function localeOf(props: Props): Promise<Locale> {
  const sp = props.searchParams ? await props.searchParams : {};
  return sp.lang === "en" ? "en" : defaultLocale;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const dict = getDictionary(await localeOf(props));
  return { title: `${dict.wishlist.pageTitle} | ${dict.accountArea.metaTitle}`, robots: { index: false, follow: false } };
}

/**
 * Wishlist (ADR 042): the customer's saved product ids, shown with live catalog data.
 * Products that are no longer in the catalog are simply not shown.
 */
export default async function WishlistPage(props: Props) {
  const locale = await localeOf(props);
  const dict = getDictionary(locale);
  const t = dict.wishlist;
  const lang = locale === "en" ? "?lang=en" : "";
  const { customer } = await requireCustomer(locale);
  const [categories, catalog] = await Promise.all([getCategories(), getProducts()]);

  const byId = catalog.status === "ok" ? new Map(catalog.products.map((p) => [p.id, p])) : new Map();
  const products = customer.wishlist.map((id) => byId.get(id)).filter((p) => p !== undefined);

  return (
    <AccountShell dict={dict} locale={locale} categories={categories} firstName={customer.firstName} active="wishlist">
      <section aria-labelledby="wishlist-title" className="bg-white/60 border border-ivory-200 p-6 sm:p-7">
        <h2 id="wishlist-title" className="font-serif text-2xl font-bold text-wine-950 mb-5">
          {t.pageTitle}
        </h2>
        {catalog.status !== "ok" ? (
          <CatalogUnavailable dict={dict} retryHref={`/account/preferiti${lang}`} />
        ) : products.length === 0 ? (
          <div className="space-y-4">
            <p className="text-sm text-cellar-600">{t.empty}</p>
            <Link
              href={`/vini${lang}`}
              className="inline-flex items-center bg-wine-900 px-6 py-3 text-sm font-semibold text-ivory-50 hover:bg-wine-950"
            >
              {t.browse}
            </Link>
          </div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {products.map((product) => (
              <li key={product.id}>
                <WineCard product={product} dict={dict} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </AccountShell>
  );
}
