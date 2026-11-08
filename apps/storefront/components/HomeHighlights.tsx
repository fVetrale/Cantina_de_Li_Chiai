import Link from "next/link";
import { RevealBlock } from "@/components/RevealBlock";
import type { getDictionary } from "@/lib/i18n";

interface HomeHighlightsProps {
  dict: ReturnType<typeof getDictionary>;
  langQuery: string;
}

/**
 * Home page (2026-11-05): the catalog is reached from the navbar; the home keeps only the
 * delivery banner and the story banner, side by side. Same texts as PromoBanner / MeetUsBanner.
 * Each card uses the "dynamic reveal" effect in its stacked layout (ADR 046).
 */
export function HomeHighlights({ dict, langQuery }: HomeHighlightsProps) {
  const promo = dict.promoBanner;
  const meet = dict.meetUs;
  const card = "flex flex-1 flex-col p-8 sm:p-10 lg:p-14";

  return (
    <section aria-label={`${promo.title} · ${meet.title}`} className="bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Delivery: home shipping or pickup with tasting */}
        <RevealBlock
          id="consegna"
          layout="stacked"
          curtainColor="#000000"
          images={[{ src: "/images/VecchiaBottiglia.jpeg", alt: dict.images.deliveryBottle }]}
          overlayLink={{ href: `/vini${langQuery}`, label: dict.common.discover }}
          className="bg-black text-white"
          mediaClassName="aspect-[4/3]"
          contentClassName={card}
          sizes="(min-width: 1024px) 50vw, 100vw"
        >
          <p className="text-reveal label-caps text-gold-400">{promo.badge}</p>
          <h2 className="text-reveal mt-5 title-section text-white">{promo.title}</h2>
          <p className="text-reveal mt-6 text-editorial text-white/75">{promo.description}</p>
          <div className="text-reveal mt-auto pt-10">
            <Link href={`/vini${langQuery}`} className="link-editorial text-white hover:text-gold-400">
              {promo.cta}
            </Link>
          </div>
        </RevealBlock>

        {/* Story: Antonio and Matteo, the land of 'Li Chiai' */}
        <RevealBlock
          id="storia"
          layout="stacked"
          curtainColor="#f5f5f5"
          images={[{ src: "/images/vigneto.jpeg", alt: dict.images.vineyard }]}
          overlayLink={{ href: `/la-cantina${langQuery}`, label: dict.common.discover }}
          className="bg-gray-100 text-black"
          mediaClassName="aspect-[4/3]"
          contentClassName={card}
          sizes="(min-width: 1024px) 50vw, 100vw"
        >
          <p className="text-reveal label-caps text-gold-700">{meet.eyebrow}</p>
          <h2 className="text-reveal mt-5 title-section">{meet.title}</h2>
          <p className="text-reveal mt-6 text-editorial text-gray-600">{meet.description}</p>
          <div className="text-reveal mt-auto pt-10">
            <Link href={`/la-cantina${langQuery}`} className="link-editorial text-black hover:text-gold-700">
              {meet.ctaStory}
            </Link>
          </div>
        </RevealBlock>
      </div>
    </section>
  );
}
