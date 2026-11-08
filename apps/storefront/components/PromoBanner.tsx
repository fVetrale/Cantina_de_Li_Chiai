import Image from "next/image";
import { Gift, ShieldCheck } from "lucide-react";
import type { getDictionary } from "@/lib/i18n";

interface PromoBannerProps {
  dict: ReturnType<typeof getDictionary>;
}

export function PromoBanner({ dict }: PromoBannerProps) {
  return (
    <section
      id="promo"
      aria-label="Confezioni regalo e degustazioni"
      className="py-16 lg:py-24 bg-white"
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="relative overflow-hidden bg-black text-white p-8 sm:p-12 lg:p-16 flex flex-col lg:flex-row items-center justify-between gap-10">
          {/* Left Narrative Block */}
          <div className="max-w-xl space-y-5 text-center lg:text-left">
            <p className="label-caps text-gold-400">{dict.promoBanner.badge}</p>

            <h2 className="title-section text-white">
              {dict.promoBanner.title}
            </h2>

            <p className="text-editorial text-white/75">
              {dict.promoBanner.description}
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <a
                href="/vini"
                className="inline-flex items-center gap-2.5 px-8 py-4 bg-white text-black label-caps hover:bg-gold-400 transition-colors duration-300"
              >
                <Gift className="w-4 h-4" />
                <span>{dict.promoBanner.cta}</span>
              </a>
              <div className="flex items-center gap-2 text-xs text-white/70">
                <ShieldCheck className="w-4 h-4 text-gold-400 shrink-0" />
                <span>Consegna in 24/48h con imballi anti-rottura</span>
              </div>
            </div>
          </div>

          {/* Right Visual Frame */}
          <div className="relative w-full max-w-sm sm:max-w-md aspect-[4/3] overflow-hidden">
            <Image
              src="/images/VecchiaBottiglia.jpeg"
              alt="La bottiglia di Chiai, Aglianico della famiglia"
              fill
              sizes="(max-width: 1024px) 100vw, 450px"
              className="object-cover object-center"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
