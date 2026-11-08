import type { Metadata } from "next";
import { getDictionary, Locale, defaultLocale } from "@/lib/i18n";
import { getCategories } from "@/lib/data/products";
import { requireCustomer } from "@/lib/data/account-guard";
import { retrieveProfile } from "@/lib/data/account";
import { AccountShell } from "@/components/account/AccountShell";
import { ProfileForm } from "@/components/account/ProfileForm";
import { CatalogUnavailable } from "@/components/CatalogUnavailable";

type Props = { searchParams?: Promise<{ lang?: string }> };

async function localeOf(props: Props): Promise<Locale> {
  const sp = props.searchParams ? await props.searchParams : {};
  return sp.lang === "en" ? "en" : defaultLocale;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const t = getDictionary(await localeOf(props)).accountArea;
  return { title: `${t.profileTitle} | ${t.metaTitle}`, robots: { index: false, follow: false } };
}

/** Profile (ADR 041): only for the logged-in customer. */
export default async function ProfilePage(props: Props) {
  const locale = await localeOf(props);
  const dict = getDictionary(locale);
  const t = dict.accountArea;
  const { customer, token } = await requireCustomer(locale);
  const [categories, profile] = await Promise.all([getCategories(), retrieveProfile(token)]);

  return (
    <AccountShell dict={dict} locale={locale} categories={categories} firstName={customer.firstName} active="profile">
      <section aria-labelledby="profile-title" className="max-w-5xl">
        <h2 id="profile-title" className="title-section mb-8 pb-6 border-b border-black">
          {t.profileTitle}
        </h2>
        {profile.ok ? (
          <ProfileForm t={t} profile={profile.data} />
        ) : (
          <CatalogUnavailable dict={dict} retryHref={`/account/profilo${locale === "en" ? "?lang=en" : ""}`} />
        )}
      </section>
    </AccountShell>
  );
}
