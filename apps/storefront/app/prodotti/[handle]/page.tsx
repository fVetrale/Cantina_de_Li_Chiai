import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getProductByHandle, getProducts, getCategories } from "@/lib/data/products";
import { getDictionary, Locale, defaultLocale } from "@/lib/i18n";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WineHeroGallery } from "@/components/WineHeroGallery";
import { localizeWine } from "@/lib/data/wine-copy";
import { ProductPurchaseSection } from "@/components/ProductPurchaseSection";
import { ProductTabs } from "@/components/ProductTabs";
import { AgeGateModal } from "@/components/AgeGateModal";
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
      title: dict.pdp.notFoundMetaTitle,
    };
  }

  const product = localizeWine(result.product, currentLocale);

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

  // Editorial copy in the page language (ADR 049); the data layer stays Italian.
  const product = localizeWine(result.product, currentLocale);

  // The other wines are reachable from the sticky wines bar: no "Scopri anche" cards (2026-11-08).
  const [categories, catalog] = await Promise.all([getCategories(), getProducts()]);
  const langQuery = currentLocale === "en" ? "?lang=en" : "";
  // Every wine, for the sticky "variants" bar (ADR 045). Falls back to this wine alone.
  const allWines = catalog.status === "ok" && catalog.products.length > 0 ? catalog.products : [product];
  // Hero photos (ADR 048): the large ambient photos only; the small bottle PNGs (354–400 px) would blur.
  const allPhotos = product.images && product.images.length > 0 ? product.images : [product.image];
  const largePhotos = allPhotos.filter((src) => !src.startsWith("/images/products/"));
  const galleryImages = largePhotos.length > 0 ? largePhotos : allPhotos;

  return (
    <div className="flex min-h-screen flex-col bg-white text-black selection:bg-black selection:text-white">
      <Navbar dict={dict} currentLocale={currentLocale} categories={categories} />

      <main className="flex-grow">
        {/* 1. Full-screen hero (ADR 048): the wine name on the left, the bottle photo selector on the right
            (photo first on mobile). This is the only place where the photos appear. */}
        <section aria-label={product.title} className="relative overflow-hidden bg-black text-white">
          <div className="absolute inset-0">
            <Image
              src="/images/home_page.jpeg"
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover grayscale brightness-[0.3] contrast-125"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-black/70" />
          </div>
          <div className="relative min-h-[100svh] mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10 pt-24 lg:pt-[104px] pb-12 grid lg:grid-cols-12 items-center gap-10 lg:gap-16">
            <div className="lg:col-span-5 order-last lg:order-first text-center lg:text-left flex flex-col items-center lg:items-start animate-fade-in">
              <p className="label-caps text-gold-400 mb-6">{product.appellation}</p>
              <h1 className="title-hero text-white">{product.title}</h1>
              <p className="mt-6 label-caps text-white/70">{product.category}</p>
              <p className="mt-8 text-editorial text-white/75 max-w-md">{product.description}</p>
              <a
                href="#acquista"
                className="mt-12 group flex flex-col items-center lg:items-start gap-3 font-sans text-[10px] font-bold uppercase tracking-[4px] text-white/80 hover:text-gold-400 transition-colors"
              >
                <span>{dict.pdp.scrollToOrder}</span>
                <span aria-hidden="true" className="scroll-cue block h-10 w-px bg-white/60 group-hover:bg-gold-400" />
              </a>
            </div>
            <div className="lg:col-span-7 animate-fade-in [animation-delay:200ms]">
              <WineHeroGallery
                images={galleryImages}
                title={product.title}
                labels={{
                  gallery: dict.pdp.galleryLabel,
                  prev: dict.pdp.galleryPrev,
                  next: dict.pdp.galleryNext,
                  photo: dict.pdp.galleryPhoto,
                }}
              />
            </div>
          </div>
        </section>

        {/* 2. Sticky bar: the wines, the current one in gold */}
        <nav
          aria-label={dict.nav.wines}
          className="sticky-under-header z-30 bg-white border-b border-ivory-300"
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

        {/* 3. Two columns: purchase · details (one column below 900px) */}
        <section
          id="acquista"
          className="scroll-mt-32 mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10 py-12 lg:py-20 grid grid-cols-1 min-[900px]:grid-cols-2 gap-12 xl:gap-20 items-start"
        >
          <div>
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

          <div className="min-[900px]:pt-14">
            <ProductTabs product={product} dict={dict} />
          </div>
        </section>
      </main>

      <Footer dict={dict} />
      <AgeGateModal dict={dict} />
    </div>
  );
}
