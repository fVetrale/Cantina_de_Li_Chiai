import type { Metadata } from "next";
import { getDictionary, Locale, defaultLocale } from "@/lib/i18n";
import { getCategories } from "@/lib/data/products";
import { requireCustomer } from "@/lib/data/account-guard";
import { listAddresses } from "@/lib/data/account";
import { AccountShell } from "@/components/account/AccountShell";
import { AddressBook } from "@/components/account/AddressBook";
import { CatalogUnavailable } from "@/components/CatalogUnavailable";

type Props = { searchParams?: Promise<{ lang?: string }> };

async function localeOf(props: Props): Promise<Locale> {
  const sp = props.searchParams ? await props.searchParams : {};
  return sp.lang === "en" ? "en" : defaultLocale;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const t = getDictionary(await localeOf(props)).accountArea;
  return { title: `${t.addressesTitle} | ${t.metaTitle}`, robots: { index: false, follow: false } };
}

/** Address book (ADR 041): only the logged-in customer's own addresses. */
export default async function AddressesPage(props: Props) {
  const locale = await localeOf(props);
  const dict = getDictionary(locale);
  const t = dict.accountArea;
  const { customer, token } = await requireCustomer(locale);
  const [categories, addresses] = await Promise.all([getCategories(), listAddresses(token)]);

  return (
    <AccountShell dict={dict} locale={locale} categories={categories} firstName={customer.firstName} active="addresses">
      <section aria-labelledby="addresses-title" className="max-w-5xl">
        <h2 id="addresses-title" className="title-section mb-8 pb-6 border-b border-black">
          {t.addressesTitle}
        </h2>
        {addresses.ok ? (
          <AddressBook t={t} checkoutT={dict.checkout} addresses={addresses.data} />
        ) : (
          <CatalogUnavailable dict={dict} retryHref={`/account/indirizzi${locale === "en" ? "?lang=en" : ""}`} />
        )}
      </section>
    </AccountShell>
  );
}
