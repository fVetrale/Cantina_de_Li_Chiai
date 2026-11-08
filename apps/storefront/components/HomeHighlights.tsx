import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import type { getDictionary } from "@/lib/i18n";

interface HomeHighlightsProps {
  dict: ReturnType<typeof getDictionary>;
  langQuery: string;
}

/**
 * Home page (2026-11-05): the catalog is reached from the navbar; the home keeps only the
 * delivery banner and the story banner, side by side. Same texts as PromoBanner / MeetUsBanner.
 */
export function HomeHighlights({ dict, langQuery }: HomeHighlightsProps) {
  const promo = dict.promoBanner;
  const meet = dict.meetUs;

  return (
    <section aria-label={`${promo.title} · ${meet.title}`} className="bg-white py-16 lg:py-24">
      <Reveal className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Delivery: home shipping or pickup with tasting */}
        <article id="consegna" className="flex flex-col bg-black text-white">
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image
              src="/images/VecchiaBottiglia.jpeg"
              alt="La bottiglia di Chiai, Aglianico della famiglia, pronta per la spedizione"
              fill
              loading="lazy"
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="flex flex-1 flex-col p-8 sm:p-10 lg:p-14">
            <p className="label-caps text-gold-400">{promo.badge}</p>
            <h2 className="mt-5 title-section text-white">{promo.title}</h2>
            <p className="mt-6 text-editorial text-white/75">{promo.description}</p>
            <div className="mt-auto pt-10">
              <Link
                href={`/vini${langQuery}`}
                className="link-editorial text-white hover:text-gold-400"
              >
                {promo.cta}
              </Link>
            </div>
          </div>
        </article>

        {/* Story: Antonio and Matteo, the land of 'Li Chiai' */}
        <article id="storia" className="flex flex-col bg-gray-100 text-black">
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image
              src="/images/vigneto.jpeg"
              alt="Tenuta e vigneti di Cantina de Li Chiai ad Abatemarco"
              fill
              loading="lazy"
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="flex flex-1 flex-col p-8 sm:p-10 lg:p-14">
            <p className="label-caps text-gold-700">{meet.eyebrow}</p>
            <h2 className="mt-5 title-section">{meet.title}</h2>
            <p className="mt-6 text-editorial text-gray-600">{meet.description}</p>
            <div className="mt-auto pt-10">
              <Link
                href={`/la-cantina${langQuery}`}
                className="link-editorial text-black hover:text-gold-700"
              >
                {meet.ctaStory}
              </Link>
            </div>
          </div>
        </article>
      </Reveal>
    </section>
  );
}
