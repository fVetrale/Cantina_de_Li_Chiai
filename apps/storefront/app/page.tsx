import { getDictionary, Locale, defaultLocale } from "@/lib/i18n";
import { getCategories } from "@/lib/data/products";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { HomeHighlights } from "@/components/HomeHighlights";
import { Footer } from "@/components/Footer";
import { AgeGateModal } from "@/components/AgeGateModal";

export default async function HomePage(props: {
  searchParams?: Promise<{ lang?: string }>;
}) {
  const searchParams = props.searchParams ? await props.searchParams : {};
  const currentLocale: Locale =
    searchParams.lang === "en" ? "en" : defaultLocale;
  const dict = getDictionary(currentLocale);

  // The catalog lives on /vini (reached from the navbar): the home only needs the categories.
  const categories = await getCategories();
  const langQuery = currentLocale === "en" ? "?lang=en" : "";

  return (
    <div className="flex min-h-screen flex-col bg-white text-cellar-900 selection:bg-wine-800 selection:text-gold-200">
      {/* 1. Floating Glass Island Header */}
      <Navbar dict={dict} currentLocale={currentLocale} categories={categories} />

      <main className="flex-grow">
        <HeroSection dict={dict} langQuery={langQuery} />

        {/* Delivery and story, side by side */}
        <HomeHighlights dict={dict} langQuery={langQuery} />
      </main>

      {/* 10. Multi-Column Footer */}
      <Footer dict={dict} />

      {/* 11. Legal Age Verification Modal */}
      <AgeGateModal dict={dict} />
    </div>
  );
}
