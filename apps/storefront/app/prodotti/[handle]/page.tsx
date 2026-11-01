import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ChevronRight, ArrowLeft, Shield, Sparkles, Award } from "lucide-react";
import { getProductByHandle, getProducts, getRelatedProducts } from "@/lib/data/products";
import { getDictionary, Locale, defaultLocale } from "@/lib/i18n";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WineCard } from "@/components/WineCard";
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

  const relatedProducts = await getRelatedProducts(product.handle);

  return (
    <div className="flex min-h-screen flex-col bg-ivory-50 text-cellar-900 selection:bg-[#661022] selection:text-gold-200">
      {/* 1. Floating Header */}
      <Navbar dict={dict} currentLocale={currentLocale} />

      <main className="flex-grow pt-24 sm:pt-28 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-cellar-500">
            <Link href="/" className="hover:text-wine-800 transition-colors">
              {dict.pdp.breadcrumbHome}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-ivory-300" />
            <Link href="/#catalog" className="hover:text-wine-800 transition-colors">
              {dict.pdp.breadcrumbWines}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-ivory-300" />
            <span className="text-cellar-900 font-semibold truncate max-w-xs sm:max-w-md">
              {product.title}
            </span>
          </nav>

          {/* Back to Catalog Link */}
          <div className="mb-8">
            <Link
              href="/#catalog"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#4a141b] hover:text-[#3d0f18] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{dict.pdp.backToCatalog}</span>
            </Link>
          </div>

          {/* Main 2-Column Product Showcase */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            {/* Left Column: High-Res Bottle Visual on Organic Flysch Pedestal */}
            <div className="lg:col-span-6 sticky top-28">
              <div className="relative rounded-3xl bg-white border border-ivory-200 shadow-lg p-8 sm:p-12 overflow-hidden flex flex-col items-center justify-center min-h-[500px] sm:min-h-[580px]">
                {/* Subtle Ambient Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gold-200/20 rounded-full blur-3xl pointer-events-none" />

                {/* Top Corner Badges */}
                <div className="absolute top-6 left-6 z-10">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#4a141b] text-gold-200 border border-gold-400/20 shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 text-gold-300" />
                    <span>{product.badge}</span>
                  </span>
                </div>

                <div className="absolute top-6 right-6 z-10">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-cellar-500 uppercase tracking-wider">
                    <Shield className="w-3.5 h-3.5 text-olive-600" />
                    <span>Salerno, Campania</span>
                  </span>
                </div>

                {/* Centered Large Wine Bottle */}
                <div className="relative w-full h-[400px] sm:h-[480px] max-w-sm flex items-center justify-center transition-transform duration-500 hover:scale-105">
                  <Image
                    src={product.image}
                    alt={`${product.title} - ${product.badge} Cantina de Li Chiai`}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-contain drop-shadow-2xl"
                  />
                </div>

                {/* Terroir Guarantee Stamp */}
                <div className="mt-4 pt-4 border-t border-ivory-100 w-full text-center">
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-cellar-500">
                    Parco Nazionale del Cilento • Flysch Arenaceo • 100% Vendemmia Manuale
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Narrative Details & Purchasing Engine */}
            <div className="lg:col-span-6 space-y-6">
              {/* Category & Appellation */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-terracotta-700">
                    {product.appellation}
                  </span>
                  <span className="text-ivory-300">•</span>
                  <span className="text-xs text-cellar-500 uppercase tracking-wider font-medium">
                    {product.category}
                  </span>
                </div>

                <h1 className="font-serif text-3xl sm:text-5xl font-bold text-wine-950 leading-tight">
                  {product.title}
                </h1>
              </div>

              {/* Quick Specification Pills */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="px-3 py-1 rounded-lg bg-ivory-100 border border-ivory-200 text-xs font-semibold text-cellar-700">
                  {dict.pdp.vintageLabel}: {product.details?.vintage || "2022"}
                </span>
                <span className="px-3 py-1 rounded-lg bg-ivory-100 border border-ivory-200 text-xs font-semibold text-cellar-700">
                  {dict.pdp.formatLabel}: {product.format}
                </span>
                <span className="px-3 py-1 rounded-lg bg-ivory-100 border border-ivory-200 text-xs font-semibold text-cellar-700">
                  {dict.pdp.alcoholLabel}: {product.alcohol}
                </span>
                <span className="px-3 py-1 rounded-lg bg-ivory-100 border border-ivory-200 text-xs font-semibold text-cellar-700">
                  {dict.pdp.tempLabel}: {product.details?.technical.serviceTemp || "12-14 °C"}
                </span>
              </div>

              {/* Introductory Terroir Description */}
              <p className="text-sm sm:text-base text-cellar-700 leading-relaxed font-sans">
                {product.description}
              </p>

              {/* Highlight Box: Native Terroir Guarantee */}
              <div className="p-4 rounded-2xl bg-white border border-gold-400/20 shadow-sm flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-ivory-100 text-[#4a141b] shrink-0">
                  <Award className="w-5 h-5 text-[#4a141b]" />
                </div>
                <div className="space-y-0.5 text-xs">
                  <span className="font-bold text-wine-950 uppercase tracking-wide block">
                    Espressione Pura del Parco del Cilento
                  </span>
                  <p className="text-cellar-600 leading-relaxed">
                    Coltivato su pendii di arenarie e marne argillose che donano al vino sapidità
                    minerale viva, freschezza e una notevole longevità evolutiva.
                  </p>
                </div>
              </div>

              {/* Interactive Purchase Controls (Price, Quantity, Cart CTA, Guarantees) */}
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
