import type { Metadata } from "next";
import { getDictionary, Locale, defaultLocale } from "@/lib/i18n";
import { getProducts, getCategories } from "@/lib/data/products";
import { Navbar } from "@/components/Navbar";
import { WinesCatalogView } from "@/components/WinesCatalogView";
import { CatalogUnavailable } from "@/components/CatalogUnavailable";
import { Footer } from "@/components/Footer";
import { AgeGateModal } from "@/components/AgeGateModal";

export async function generateMetadata(props: {
  searchParams?: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const searchParams = props.searchParams ? await props.searchParams : {};
  const currentLocale: Locale =
    searchParams.lang === "en" ? "en" : defaultLocale;
  const dict = getDictionary(currentLocale);

  return {
    title: dict.winesPage.metaTitle,
    description: dict.winesPage.metaDesc,
    openGraph: {
      title: dict.winesPage.metaTitle,
      description: dict.winesPage.metaDesc,
      type: "website",
    },
  };
}

export default async function WinesPage(props: {
  searchParams?: Promise<{ lang?: string; categoria?: string }>;
}) {
  const searchParams = props.searchParams ? await props.searchParams : {};
  const currentLocale: Locale =
    searchParams.lang === "en" ? "en" : defaultLocale;
  const dict = getDictionary(currentLocale);

  // Concurrent fetch of products and categories on the server
  const [catalog, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  // A known category from a link opens the selector with it chosen; nothing otherwise (ADR 047).
  // Unknown or retired categories (e.g. old "insaccati" links, ADR 043) open it with no choice.
  const initialCategory = categories.some((c) => c.handle === searchParams.categoria)
    ? (searchParams.categoria as string)
    : "";
  const langQuery = currentLocale === "en" ? "?lang=en" : "";

  return (
    <div className="flex min-h-screen flex-col bg-white text-black selection:bg-black selection:text-white">
      <Navbar dict={dict} currentLocale={currentLocale} categories={categories} />

      <main className="flex-grow pt-16 lg:pt-[72px]">
        {catalog.status === "ok" ? (
          // Keyed by the category: menu links to another category remount the selector with it chosen.
          <WinesCatalogView
            key={initialCategory || "none"}
            products={catalog.products}
            categories={categories}
            dict={dict}
            initialCategory={initialCategory}
            langQuery={langQuery}
          />
        ) : (
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-16">
            <CatalogUnavailable dict={dict} retryHref={`/vini${langQuery}`} homeHref={`/${langQuery}`} />
          </div>
        )}
      </main>

      {/* 5. Multi-Column Footer */}
      <Footer dict={dict} />

      {/* 6. Legal Age Gate */}
      <AgeGateModal dict={dict} />
    </div>
  );
}
