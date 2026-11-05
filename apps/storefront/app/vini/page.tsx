import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary, Locale, defaultLocale } from "@/lib/i18n";
import { getProducts, getCategories } from "@/lib/data/products";
import { Navbar } from "@/components/Navbar";
import { WinesCatalogView } from "@/components/WinesCatalogView";
import { CatalogUnavailable } from "@/components/CatalogUnavailable";
import { PromoBanner } from "@/components/PromoBanner";
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
  const t = dict.winesPage;

  // Concurrent fetch of products and categories on the server
  const [catalog, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  // Unknown or retired categories (e.g. old "insaccati" links, ADR 043) show the whole catalog.
  const initialCategory = categories.some((c) => c.handle === searchParams.categoria)
    ? (searchParams.categoria as string)
    : "all";
  const langQuery = currentLocale === "en" ? "?lang=en" : "";

  return (
    <div className="flex min-h-screen flex-col bg-ivory-50 text-cellar-900 selection:bg-[#661022] selection:text-gold-200">
      {/* 1. Floating Smoked Aglianico Glass Island Navbar */}
      <Navbar dict={dict} currentLocale={currentLocale} categories={categories} />

      {/* 2. Main Full-Screen Catalog with Filters & Wines directly visible */}
      <main className="flex-grow pt-24 sm:pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Streamlined Header & Breadcrumbs */}
          <div className="mb-6 pb-4 border-b border-ivory-300">
            <nav
              aria-label="Breadcrumbs"
              className="flex items-center gap-2 text-xs font-semibold text-gold-700 uppercase tracking-wider mb-1.5"
            >
              <Link
                href="/"
                className="hover:text-wine-900 transition-colors"
              >
                {t.breadcrumbsHome}
              </Link>
              <span className="text-ivory-400">•</span>
              <span className="text-cellar-900 font-bold">
                {t.breadcrumbsCurrent}
              </span>
            </nav>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#4a141b] tracking-tight">
              {t.title}
            </h1>
          </div>

          {/* 3. Interactive Catalog Filter & Products Grid */}
          {catalog.status === "ok" ? (
            <WinesCatalogView
              products={catalog.products}
              categories={categories}
              dict={dict}
              initialCategory={initialCategory}
            />
          ) : (
            <CatalogUnavailable
              dict={dict}
              retryHref={`/vini${langQuery}`}
              homeHref={`/${langQuery}`}
            />
          )}
        </div>
      </main>

      {/* 4. Promotional Gift Boxes & Corporate Banner */}
      <PromoBanner dict={dict} />

      {/* 5. Multi-Column Footer */}
      <Footer dict={dict} />

      {/* 6. Legal Age Gate */}
      <AgeGateModal dict={dict} />
    </div>
  );
}
