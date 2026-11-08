import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { getDictionary } from "@/lib/i18n";
import { TickerBar } from "@/components/TickerBar";

interface HeroSectionProps {
  dict: ReturnType<typeof getDictionary>;
  /** "?lang=en" or "" */
  langQuery?: string;
}

/**
 * Editorial hero (ADR 045): full-width chiaroscuro photograph, centered white serif title with
 * a fade-in, and the bottle photograph on the right on large screens. Texts and links unchanged.
 */
export function HeroSection({ dict, langQuery = "" }: HeroSectionProps) {
  return (
    <section
      aria-label={dict.a11y.heroSection}
      className="relative min-h-[100svh] flex flex-col overflow-hidden bg-black text-white"
    >
      {/* Background: the vineyard in deep chiaroscuro */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/home_page.jpeg"
          alt={dict.hero.imageAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_35%] grayscale brightness-[0.45] contrast-125"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-black/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60" />
      </div>

      {/* Space for the fixed header */}
      <div className="h-16 lg:h-[72px] shrink-0" />

      <div className="relative z-10 flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 grid lg:grid-cols-12 items-center gap-10 py-16 lg:py-24">
        {/* Title block, centered */}
        <div className="lg:col-span-8 flex flex-col items-center text-center animate-fade-in">
          <p className="label-caps text-gold-400 mb-8">{dict.hero.badge}</p>

          <h1 className="title-hero text-white max-w-4xl text-balance">{dict.hero.title}</h1>

          <p className="mt-8 text-editorial text-white/80 max-w-2xl font-light">{dict.hero.subtitle}</p>

          <div className="mt-12 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link
              href={`/vini${langQuery}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-9 py-4 bg-white text-black label-caps hover:bg-gold-400 transition-colors duration-300"
            >
              <span>{dict.hero.ctaCollection}</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <a
              href="#storia"
              className="w-full sm:w-auto inline-flex items-center justify-center px-9 py-4 border border-white/60 text-white label-caps hover:border-gold-400 hover:text-gold-400 transition-colors duration-300"
            >
              {dict.hero.ctaEstate}
            </a>
          </div>
        </div>

        {/* The bottle, aligned right (large screens) */}
        <div className="hidden lg:block lg:col-span-4 animate-fade-in [animation-delay:250ms]">
          <div className="relative aspect-[3/4] w-full max-w-sm ml-auto">
            <Image
              src="/images/VecchiaBottiglia.jpeg"
              alt={dict.images.heroBottle}
              fill
              sizes="(min-width: 1024px) 384px, 0px"
              className="object-cover brightness-90"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-transparent to-black/30" />
          </div>
        </div>
      </div>

      <TickerBar dict={dict} />
    </section>
  );
}
