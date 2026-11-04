import { getDictionary, Locale, defaultLocale } from "@/lib/i18n";
import { getProducts, getCategories } from "@/lib/data/products";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { WineCatalog } from "@/components/WineCatalog";
import { CatalogUnavailable } from "@/components/CatalogUnavailable";
import { PromoBanner } from "@/components/PromoBanner";
import { MeetUsBanner } from "@/components/MeetUsBanner";
import { SocialMosaic } from "@/components/SocialMosaic";
import { NewsletterSection } from "@/components/NewsletterSection";
import { Footer } from "@/components/Footer";
import { AgeGateModal } from "@/components/AgeGateModal";

export default async function HomePage(props: {
  searchParams?: Promise<{ lang?: string }>;
}) {
  const searchParams = props.searchParams ? await props.searchParams : {};
  const currentLocale: Locale =
    searchParams.lang === "en" ? "en" : defaultLocale;
  const dict = getDictionary(currentLocale);

  // Fetch products and categories concurrently on the server
  const [catalog, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);
  const langQuery = currentLocale === "en" ? "?lang=en" : "";

  return (
    <div className="flex min-h-screen flex-col bg-white text-cellar-900 selection:bg-[#661022] selection:text-gold-200">
      {/* 1. Floating Glass Island Header */}
      <Navbar dict={dict} currentLocale={currentLocale} categories={categories} />

      <main className="flex-grow">
        {/* 2. Full-Screen 100vh Hero with docked single-line TickerBar */}
        <HeroSection dict={dict} />

        {/* 3. Vetrina Prodotti (La nostra grande cantina) */}
        {catalog.status === "ok" ? (
          <WineCatalog
            products={catalog.products}
            categories={categories}
            dict={dict}
          />
        ) : (
          <CatalogUnavailable
            id="catalog"
            dict={dict}
            retryHref={`/${langQuery}#catalog`}
          />
        )}

        {/* 4. Promotional Corporate & Gift Banner */}
        <PromoBanner dict={dict} />

        {/* 5. Vieni a conoscerci Banner */}
        <MeetUsBanner dict={dict} />

        {/* 8. Social Mosaic */}
        <SocialMosaic dict={dict} />

        {/* 9. Newsletter Club */}
        <NewsletterSection dict={dict} />
      </main>

      {/* 10. Multi-Column Footer */}
      <Footer dict={dict} />

      {/* 11. Legal Age Verification Modal */}
      <AgeGateModal dict={dict} />
    </div>
  );
}
