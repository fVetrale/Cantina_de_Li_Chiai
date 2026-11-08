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
    <div className="flex min-h-screen flex-col bg-white text-black selection:bg-black selection:text-white">
      <Navbar dict={dict} currentLocale={currentLocale} categories={categories} />

      {/* 2. Main Full-Screen Catalog with Filters & Wines directly visible */}
      <main className="flex-grow pt-16 lg:pt-[72px] pb-16">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="pt-12 lg:pt-16 pb-2 text-center">
            <nav aria-label="Breadcrumbs" className="flex items-center justify-center gap-3 label-caps text-[11px] mb-6">
              <Link href={`/${langQuery}`} className="text-gray-600 hover:text-black transition-colors">
                {t.breadcrumbsHome}
              </Link>
              <span aria-hidden="true" className="text-gray-300">/</span>
              <span className="text-gold-700" aria-current="page">{t.breadcrumbsCurrent}</span>
            </nav>
            <h1 className="title-page">{t.title}</h1>
            <p className="mt-6 text-editorial text-gray-600 max-w-2xl mx-auto">{t.subtitle}</p>
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
