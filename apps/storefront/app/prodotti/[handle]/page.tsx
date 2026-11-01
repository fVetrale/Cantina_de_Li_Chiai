import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";
import { getProductByHandle, getProducts, getRelatedProducts, getCategories } from "@/lib/data/products";
import { getDictionary, Locale, defaultLocale } from "@/lib/i18n";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WineCard } from "@/components/WineCard";
import { WineBottleGallery } from "@/components/WineBottleGallery";
import { ProductPurchaseSection } from "@/components/ProductPurchaseSection";
import { ProductTabs } from "@/components/ProductTabs";
import { AgeGateModal } from "@/components/AgeGateModal";

interface ProductPageProps {
  params: Promise<{ handle: string }>;
  searchParams?: Promise<{ lang?: string }>;
}

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({
    handle: p.handle,
  }));
}

export async function generateMetadata({
  params,
  searchParams,
}: ProductPageProps): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProductByHandle(handle);

  if (!product) {
    return {
      title: "Vino non trovato | Cantina de Li Chiai",
    };
  }

  const sParams = searchParams ? await searchParams : {};
  const currentLocale: Locale = sParams.lang === "en" ? "en" : defaultLocale;
  const dict = getDictionary(currentLocale);

  return {
    title: `${product.title} | ${dict.common.brand}`,
    description: product.description,
    openGraph: {
      title: `${product.title} — ${product.appellation} | Cantina de Li Chiai`,
      description: product.description,
      images: [
        {
          url: product.image,
          width: 800,
          height: 1067,
          alt: `${product.title} - Cantina de Li Chiai`,
        },
      ],
      locale: currentLocale === "it" ? "it_IT" : "en_US",
      type: "website",
    },
  };
}

export default async function ProductDetailPage({
  params,
  searchParams,
}: ProductPageProps) {
  const { handle } = await params;
  const sParams = searchParams ? await searchParams : {};
  const currentLocale: Locale = sParams.lang === "en" ? "en" : defaultLocale;
  const dict = getDictionary(currentLocale);

  const product = await getProductByHandle(handle);

  if (!product) {
    notFound();
  }

  const [relatedProducts, categories] = await Promise.all([
    getRelatedProducts(product.handle),
    getCategories(),
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-ivory-50 text-cellar-900 selection:bg-[#661022] selection:text-gold-200">
      {/* 1. Floating Header */}
      <Navbar dict={dict} currentLocale={currentLocale} categories={categories} />

      <main className="flex-grow pt-24 sm:pt-28 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb Navigation (Exact Image 1 Style: Vini > Categoria > Nome Vino) */}
          <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-xs text-cellar-500 font-sans">
            <Link href="/vini" className="hover:text-wine-900 transition-colors">
              {dict.nav.wines}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-ivory-300" />
            <Link
              href={`/vini?categoria=${product.categoryHandle || "vini-bianchi"}`}
              className="hover:text-wine-900 transition-colors"
            >
              {product.category}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-ivory-300" />
            <span className="text-cellar-900 font-medium truncate max-w-xs sm:max-w-md">
              {product.title}
            </span>
          </nav>

          {/* Main 2-Column Product Showcase (Exact Replica of Image 1) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start mb-16">
            {/* Left Column: High-Res Studio Bottle Visual with Soft Disc Backdrop & Gallery */}
            <div className="lg:col-span-6 sticky top-28">
              <WineBottleGallery product={product} />
            </div>

            {/* Right Column: Narrative Details & Purchasing Engine with Image 2 Bottle Selector */}
            <div className="lg:col-span-6">
              <ProductPurchaseSection product={product} dict={dict} />
            </div>
          </div>

          {/* Tabbed In-Depth Sections (Tasting Notes, Terroir, Pairings, Technical Data) */}
          <ProductTabs product={product} dict={dict} />

          {/* Related Wines Recommendations */}
          {relatedProducts.length > 0 && (
            <section className="mt-24 pt-16 border-t border-ivory-200" aria-label="Vini correlati">
              <div className="text-center max-w-xl mx-auto mb-12">
                <span className="text-xs font-bold uppercase tracking-widest text-[#4a141b] block mb-1">
                  Scopri Anche
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-wine-950 mb-2">
                  {dict.pdp.relatedTitle}
                </h2>
                <p className="text-xs sm:text-sm text-cellar-600">
                  {dict.pdp.relatedSubtitle}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedProducts.map((relProduct) => (
                  <WineCard
                    key={relProduct.id}
                    product={relProduct}
                    dict={dict}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Footer & Age Verification Gate */}
      <Footer dict={dict} />
      <AgeGateModal dict={dict} />
    </div>
  );
}
