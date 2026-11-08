import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getDictionary, Locale, defaultLocale } from "@/lib/i18n";
import { getCategories } from "@/lib/data/products";
import { Navbar } from "@/components/Navbar";
import { ChapterNav } from "@/components/ChapterNav";
import { Reveal } from "@/components/Reveal";
import { FeaturesSection } from "@/components/FeaturesSection";
import { Footer } from "@/components/Footer";
import { AgeGateModal } from "@/components/AgeGateModal";
import { CellarGallery } from "@/components/CellarGallery";

export async function generateMetadata(props: {
  searchParams?: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const searchParams = props.searchParams ? await props.searchParams : {};
  const currentLocale: Locale =
    searchParams.lang === "en" ? "en" : defaultLocale;
  const dict = getDictionary(currentLocale);

  return {
    title: dict.estatePage.metaTitle,
    description: dict.estatePage.metaDesc,
    openGraph: {
      title: dict.estatePage.metaTitle,
      description: dict.estatePage.metaDesc,
      type: "article",
    },
  };
}

export default async function EstatePage(props: {
  searchParams?: Promise<{ lang?: string }>;
}) {
  const searchParams = props.searchParams ? await props.searchParams : {};
  const currentLocale: Locale =
    searchParams.lang === "en" ? "en" : defaultLocale;
  const dict = getDictionary(currentLocale);
  const t = dict.estatePage;
  const langQuery = currentLocale === "en" ? "?lang=en" : "";

  const categories = await getCategories();

  // Full-screen narrative chapters (ADR 045). Ids are stable: the footer links to #galleria and #valori.
  const chapters = [
    { id: "terra", label: t.chapters.land },
    { id: "lavoro", label: t.chapters.craft },
    { id: "ritiro", label: t.chapters.pickup },
    { id: "story", label: t.chapters.family },
    { id: "galleria", label: t.chapters.gallery },
    { id: "valori", label: t.chapters.values },
  ];

  const chapterClass =
    "scroll-mt-32 min-h-[100svh] flex items-center py-20 lg:py-28 border-b border-ivory-300";
  const frame = "relative aspect-[4/5] w-full max-w-md mx-auto shadow-[0_20px_50px_-20px_rgba(0,0,0,0.35)]";

  return (
    <div className="flex min-h-screen flex-col bg-white text-black selection:bg-black selection:text-white">
      <Navbar dict={dict} currentLocale={currentLocale} categories={categories} />

      <main className="flex-grow pt-16 lg:pt-[72px]">
        {/* Chapter tabs: under the header on small screens */}
        <ChapterNav chapters={chapters} label={t.chaptersLabel} className="lg:hidden sticky top-16 z-30 border-b" />

        {/* Opening: emblem, title, family facts */}
        <header className="min-h-[calc(100svh-4rem)] lg:min-h-[calc(100svh-72px)] flex flex-col items-center justify-center text-center px-4 sm:px-6 py-20 bg-ivory">
          {/* Placeholder emblem until the client provides the real one (see docs/restyling-editoriale.md) */}
          <div
            role="img"
            aria-label={t.emblemPlaceholder}
            className="mb-10 flex h-20 w-20 items-center justify-center rounded-full border border-black/30 font-serif text-2xl tracking-[2px] animate-fade-in"
          >
            LC
          </div>
          <nav aria-label="Breadcrumbs" className="flex items-center gap-3 label-caps text-[11px] mb-6">
            <Link href={`/${langQuery}`} className="text-gray-600 hover:text-black transition-colors">
              {t.breadcrumbsHome}
            </Link>
            <span aria-hidden="true" className="text-gray-300">/</span>
            <span className="text-gold-700" aria-current="page">{t.breadcrumbsCurrent}</span>
          </nav>
          <p className="label-caps text-gold-700 mb-6">{t.eyebrow}</p>
          <h1 className="title-page max-w-4xl text-balance animate-fade-in">{t.title}</h1>
          <p className="mt-8 text-editorial text-gray-600 max-w-2xl">{t.subtitle}</p>
          <dl className="mt-14 grid grid-cols-3 gap-6 sm:gap-16">
            {[
              [t.stat1Number, t.stat1Label],
              [t.stat2Number, t.stat2Label],
              [t.stat3Number, t.stat3Label],
            ].map(([n, l]) => (
              <div key={n} className="flex flex-col items-center">
                <dt className="font-serif text-xl sm:text-2xl">{n}</dt>
                <dd className="mt-2 font-sans text-[10px] font-bold uppercase tracking-[3px] text-gray-600">{l}</dd>
              </div>
            ))}
          </dl>
        </header>

        {/* 1. The land: text left, photo right */}
        <section id="terra" aria-labelledby="terra-title" className={chapterClass}>
          <Reveal className="mx-auto max-w-[1400px] w-full px-4 sm:px-6 lg:px-10 grid lg:grid-cols-2 gap-14 items-center">
            <div className="max-w-xl lg:ml-auto">
              <h2 id="terra-title" className="title-page text-[clamp(2rem,4vw,3.5rem)]">{t.p1Title}</h2>
              <p className="mt-8 text-editorial lg:text-[1.375rem] lg:leading-[1.7] text-gray-600 drop-cap">{t.p1}</p>
            </div>
            <div className={frame}>
              <Image src="/images/raccolta.jpeg" alt="La vendemmia a mano a Li Chiai" fill loading="lazy" sizes="(min-width: 1024px) 448px, 90vw" className="object-cover" />
            </div>
          </Reveal>
        </section>

        {/* 2. The craft: photo left, text right, with the quote */}
        <section id="lavoro" aria-labelledby="lavoro-title" className={`${chapterClass} bg-gray-100`}>
          <Reveal className="mx-auto max-w-[1400px] w-full px-4 sm:px-6 lg:px-10 grid lg:grid-cols-2 gap-14 items-center">
            <div className={`${frame} lg:order-first order-last`}>
              <Image src="/images/lavorazione.jpeg" alt="La lavorazione del vino in cantina" fill loading="lazy" sizes="(min-width: 1024px) 448px, 90vw" className="object-cover" />
            </div>
            <div className="max-w-xl">
              <h2 id="lavoro-title" className="title-page text-[clamp(2rem,4vw,3.5rem)]">{t.p2Title}</h2>
              <p className="mt-8 text-editorial lg:text-[1.375rem] lg:leading-[1.7] text-gray-600">{t.p2}</p>
              <blockquote className="mt-10 border-l border-gold-500 pl-6">
                <p className="font-serif italic text-xl leading-relaxed">{t.quote}</p>
                <footer className="mt-4 label-caps text-[10px] text-gold-700">— {t.quoteAuthor}</footer>
              </blockquote>
            </div>
          </Reveal>
        </section>

        {/* 3. Pickup and tasting: text left, photo right */}
        <section id="ritiro" aria-labelledby="ritiro-title" className={chapterClass}>
          <Reveal className="mx-auto max-w-[1400px] w-full px-4 sm:px-6 lg:px-10 grid lg:grid-cols-2 gap-14 items-center">
            <div className="max-w-xl lg:ml-auto">
              <h2 id="ritiro-title" className="title-page text-[clamp(2rem,4vw,3.5rem)]">{t.p3Title}</h2>
              <p className="mt-8 text-editorial lg:text-[1.375rem] lg:leading-[1.7] text-gray-600">{t.p3}</p>
              <Link href={`/vini${langQuery}`} className="mt-10 link-editorial text-black hover:text-gold-700">
                {t.ctaExploreWines}
              </Link>
            </div>
            <div className={frame}>
              <Image src="/images/produzione.jpeg" alt="Le bottiglie pronte in cantina" fill loading="lazy" sizes="(min-width: 1024px) 448px, 90vw" className="object-cover" />
            </div>
          </Reveal>
        </section>

        {/* 4. The family (Antonio and Matteo): dark chapter */}
        <section id="story" aria-labelledby="story-title" className={`${chapterClass} bg-black text-white border-black`}>
          <Reveal className="mx-auto max-w-[1400px] w-full px-4 sm:px-6 lg:px-10 grid lg:grid-cols-2 gap-14 items-center">
            <div className={`${frame} lg:order-first order-last`}>
              <Image src="/images/vigneto.jpeg" alt="I filari della vigna di famiglia" fill loading="lazy" sizes="(min-width: 1024px) 448px, 90vw" className="object-cover" />
            </div>
            <div className="max-w-xl">
              <p className="label-caps text-gold-400">{dict.story.eyebrow}</p>
              <h2 id="story-title" className="mt-6 title-page text-[clamp(2rem,4vw,3.5rem)]">{dict.story.title}</h2>
              <p className="mt-8 font-serif italic text-xl leading-relaxed text-white/90">{dict.story.quote}</p>
              <p className="mt-8 text-editorial text-white/70">{dict.story.p1}</p>
              <p className="mt-5 text-editorial text-white/70">{dict.story.p2}</p>
              <dl className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-white/15 pt-8">
                {[
                  [dict.story.badge1, dict.story.badge1Desc],
                  [dict.story.badge2, dict.story.badge2Desc],
                  [dict.story.badge3, dict.story.badge3Desc],
                ].map(([title, desc]) => (
                  <div key={title}>
                    <dt className="font-serif text-lg text-gold-400">{title}</dt>
                    <dd className="mt-2 text-xs leading-relaxed text-white/60">{desc}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </Reveal>
        </section>

        {/* 5. Photo gallery (id="galleria" inside) */}
        <div className="scroll-mt-32 py-20 lg:py-28 mx-auto max-w-5xl w-full px-4 sm:px-6">
          <CellarGallery dict={dict} />
        </div>

        {/* 6. Values (id="valori" inside) */}
        <FeaturesSection dict={dict} className="scroll-mt-32 py-20 lg:py-28 bg-gray-100" />

        {/* Chapter tabs anchored at the bottom on large screens */}
        <ChapterNav chapters={chapters} label={t.chaptersLabel} className="hidden lg:block sticky bottom-0 z-30 border-t" />
      </main>

      <Footer dict={dict} />
      <AgeGateModal dict={dict} />
    </div>
  );
}
