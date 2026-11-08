import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getProductByHandle, getProducts, getRelatedProducts, getCategories } from "@/lib/data/products";
import { getDictionary, Locale, defaultLocale } from "@/lib/i18n";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WineCard } from "@/components/WineCard";
import { WineBottleGallery } from "@/components/WineBottleGallery";
import { ProductPurchaseSection } from "@/components/ProductPurchaseSection";
import { ProductTabs } from "@/components/ProductTabs";
import { AgeGateModal } from "@/components/AgeGateModal";
import { Reveal } from "@/components/Reveal";
import { CatalogUnavailable } from "@/components/CatalogUnavailable";

interface ProductPageProps {
  params: Promise<{ handle: string }>;
  searchParams?: Promise<{ lang?: string }>;
}

export async function generateStaticParams() {
  const catalog = await getProducts();
  // Backend down at build time: render every product page on demand instead.
  if (catalog.status !== "ok") {
    return [];
  }
  return catalog.products.map((p) => ({
    handle: p.handle,
  }));
}

export async function generateMetadata({
  params,
  searchParams,
}: ProductPageProps): Promise<Metadata> {
  const { handle } = await params;
  const sParams = searchParams ? await searchParams : {};
  const currentLocale: Locale = sParams.lang === "en" ? "en" : defaultLocale;
  const dict = getDictionary(currentLocale);
  const result = await getProductByHandle(handle);

  if (result.status === "unavailable") {
    return {
      title: `${dict.catalogUnavailable.title} | ${dict.common.brand}`,
    };
  }

  if (result.status === "not_found") {
    return {
      title: "Vino non trovato | Cantina de Li Chiai",
    };
  }

  const { product } = result;

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

  const result = await getProductByHandle(handle);

  if (result.status === "not_found") {
    notFound();
  }

  if (result.status === "unavailable") {
    const langQuery = currentLocale === "en" ? "?lang=en" : "";
    const categories = await getCategories();

    return (
      <div className="flex min-h-screen flex-col bg-ivory-50 text-cellar-900 selection:bg-wine-800 selection:text-gold-200">
        <Navbar dict={dict} currentLocale={currentLocale} categories={categories} />
        <main className="flex-grow pt-24 sm:pt-28 pb-12">
          <CatalogUnavailable
            dict={dict}
            headingLevel="h1"
            retryHref={`/prodotti/${encodeURIComponent(handle)}${langQuery}`}
            homeHref={`/${langQuery}`}
          />
        </main>
        <Footer dict={dict} />
        <AgeGateModal dict={dict} />
      </div>
    );
  }

  const { product } = result;

  const [relatedProducts, categories, catalog] = await Promise.all([
    getRelatedProducts(product.handle),
    getCategories(),
    getProducts(),
  ]);
  const langQuery = currentLocale === "en" ? "?lang=en" : "";
  // Every wine, for the sticky "variants" bar (ADR 045). Falls back to this wine alone.
  const allWines = catalog.status === "ok" && catalog.products.length > 0 ? catalog.products : [product];
  const heroImage = product.images?.[0] || product.image;

  return (
    <div className="flex min-h-screen flex-col bg-white text-black selection:bg-black selection:text-white">
      <Navbar dict={dict} currentLocale={currentLocale} categories={categories} />

      <main className="flex-grow">
        {/* 1. Hero: chiaroscuro photograph, centered serif title, the wine on the right */}
        <section aria-label={product.title} className="relative overflow-hidden bg-black text-white">
          <div className="absolute inset-0">
            <Image
              src="/images/home_page.jpeg"
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover grayscale brightness-[0.35] contrast-125"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-black/80" />
          </div>
          <div className="h-16 lg:h-[72px]" />
          <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10 py-14 lg:py-20 grid lg:grid-cols-12 items-center gap-10">
            <div className="lg:col-span-8 text-center flex flex-col items-center animate-fade-in">
              <p className="label-caps text-gold-400 mb-6">{product.appellation}</p>
              <h1 className="title-hero text-white">{product.title}</h1>
              <p className="mt-6 label-caps text-white/70">{product.category}</p>
            </div>
            <div className="hidden lg:block lg:col-span-4 animate-fade-in [animation-delay:250ms]">
              <div className="relative aspect-[3/4] w-full max-w-xs ml-auto">
                <Image
                  src={heroImage}
                  alt={product.title}
                  fill
                  priority
                  sizes="320px"
                  className="object-cover brightness-90"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 2. Sticky bar: the wines, the current one in gold */}
        <nav
          aria-label={dict.nav.wines}
          className="sticky top-16 lg:top-[72px] z-30 bg-white border-b border-ivory-300"
        >
          <ul className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10 flex items-center gap-8 overflow-x-auto no-scrollbar">
            {allWines.map((wine) => {
              const current = wine.handle === product.handle;
              return (
                <li key={wine.id} className="shrink-0">
                  <Link
                    href={`/prodotti/${wine.handle}${langQuery}`}
                    aria-current={current ? "page" : undefined}
                    className={`relative block py-4 label-caps whitespace-nowrap transition-colors duration-200 ${
                      current
                        ? "text-gold-700 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-gold-500"
                        : "text-gray-500 hover:text-black"
                    }`}
                  >
                    {wine.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* 3. Three columns: purchase · photograph · details (one column below 900px) */}
        <section className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10 py-12 lg:py-20 grid grid-cols-1 min-[900px]:grid-cols-12 gap-10 xl:gap-14 items-start">
          <div className="min-[900px]:col-span-4">
            <nav aria-label="Breadcrumb" className="mb-8 flex flex-wrap items-center gap-x-3 gap-y-1 label-caps text-[11px]">
              <Link href={`/vini${langQuery}`} className="text-gray-600 hover:text-black transition-colors">
                {dict.nav.wines}
              </Link>
              <span aria-hidden="true" className="text-gray-300">/</span>
              <Link
                href={`/vini?categoria=${product.categoryHandle || "vini-rossi"}${langQuery ? "&lang=en" : ""}`}
                className="text-gray-600 hover:text-black transition-colors"
              >
                {product.category}
              </Link>
              <span aria-hidden="true" className="text-gray-300">/</span>
              <span className="text-gold-700" aria-current="page">{product.title}</span>
            </nav>
            <ProductPurchaseSection product={product} dict={dict} />
          </div>

          <div className="min-[900px]:col-span-4 min-[900px]:sticky min-[900px]:top-36">
            <WineBottleGallery product={product} />
          </div>

          <div className="min-[900px]:col-span-4">
            <ProductTabs product={product} dict={dict} />
          </div>
        </section>

        {/* 4. 50/50: the land, with a link to the cellar story */}
        <Reveal>
          <section aria-label={dict.meetUs.title} className="grid grid-cols-1 lg:grid-cols-2">
            <div className="relative min-h-[320px] lg:min-h-[560px]">
              <Image
                src="/images/vigneto.jpeg"
                alt="Tenuta e vigneti di Cantina de Li Chiai ad Abatemarco"
                fill
                loading="lazy"
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="bg-gray-100 flex items-center">
              <div className="px-6 sm:px-12 lg:px-20 py-16 lg:py-24 max-w-2xl">
                <p className="label-caps text-gold-700">{dict.meetUs.eyebrow}</p>
                <h2 className="mt-5 title-section">{dict.meetUs.title}</h2>
                <p className="mt-6 text-editorial text-gray-600 drop-cap">{dict.meetUs.description}</p>
                <Link href={`/la-cantina${langQuery}`} className="mt-10 link-editorial text-black hover:text-gold-700">
                  {dict.meetUs.ctaStory}
                </Link>
              </div>
            </div>
          </section>
        </Reveal>

        {/* 5. Related wines */}
        {relatedProducts.length > 0 && (
          <Reveal>
            <section className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10 py-16 lg:py-24" aria-label="Vini correlati">
              <div className="text-center max-w-xl mx-auto mb-12">
                <span className="label-caps text-gold-700 block mb-3">Scopri Anche</span>
                <h2 className="title-section mb-3">{dict.pdp.relatedTitle}</h2>
                <p className="text-sm text-gray-600">{dict.pdp.relatedSubtitle}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedProducts.map((relProduct) => (
                  <WineCard key={relProduct.id} product={relProduct} dict={dict} />
                ))}
              </div>
            </section>
          </Reveal>
        )}
      </main>

      <Footer dict={dict} />
      <AgeGateModal dict={dict} />
    </div>
  );
}
