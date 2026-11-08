import Link from "next/link";
import { Mail, MapPin, ShieldAlert, Clock, Truck, Sparkles, ExternalLink } from "lucide-react";
import type { getDictionary } from "@/lib/i18n";

interface FooterProps {
  dict: ReturnType<typeof getDictionary>;
}

export function Footer({ dict }: FooterProps) {
  const f = dict.footer;

  return (
    <footer
      id="footer"
      aria-label="Informazioni Legali, Prodotti e Contatti"
      className="bg-black text-white"
    >
      {/* 1. Mandatory Legal Alcohol Notice Bar */}
      <div className="border-b border-white/10 py-4 px-4">
        <div className="max-w-[1400px] mx-auto flex items-center justify-center gap-2.5 text-center font-sans text-[11px] font-bold uppercase tracking-[3px] text-white/70">
          <ShieldAlert className="w-4 h-4 text-gold-400 shrink-0" />
          <span>{f.legalNotice}</span>
        </div>
      </div>

      {/* 2. Main Multi-Column Footer */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-16 lg:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Info & Cellar Location */}
          <div className="space-y-4 lg:col-span-2">
            <div className="flex flex-col">
              <span className="font-serif text-2xl tracking-[3px] text-white uppercase">
                {dict.common.brand}
              </span>
              <span className="mt-2 font-sans text-[10px] font-bold uppercase tracking-[4px] text-gold-400">
                {dict.common.origin}
              </span>
            </div>

            <p className="text-sm text-white/70 leading-relaxed font-sans max-w-sm">
              {f.description}
            </p>

            <div className="pt-2 space-y-3 text-sm text-white/70">
              <a
                href="https://maps.google.com/?q=Contrada+Pozzo+15,+84040+Abatemarco+SA"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2 hover:text-gold-400 transition-colors group"
                title={f.directionsLabel}
              >
                <MapPin className="w-4 h-4 text-gold-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                <span className="underline-offset-2 group-hover:underline">
                  {f.locationAddress}
                </span>
                <ExternalLink className="w-3 h-3 text-gold-400/60 shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>

              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gold-400 shrink-0" />
                <span>{f.hours}</span>
              </div>

              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-gold-400 shrink-0" />
                <span>{f.shippingNotice}</span>
              </div>
            </div>
          </div>

          {/* I Nostri Prodotti (Authentic Catalog Categories) */}
          <div className="space-y-3">
            <h3 className="label-caps text-white pb-3 border-b border-white/15">
              {f.productsTitle}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/vini?categoria=vini-rossi"
                  className="block py-0.5 font-sans text-[11px] font-bold uppercase tracking-[3px] text-white/70 hover:text-gold-400 transition-colors"
                >
                  {f.productsRedWines}
                </Link>
              </li>
              <li>
                <Link
                  href="/vini?categoria=vini-bianchi"
                  className="block py-0.5 font-sans text-[11px] font-bold uppercase tracking-[3px] text-white/70 hover:text-gold-400 transition-colors"
                >
                  {f.productsWhiteWines}
                </Link>
              </li>
              <li>
                <Link
                  href="/vini?categoria=vini-dolci"
                  className="block py-0.5 font-sans text-[11px] font-bold uppercase tracking-[3px] text-white/70 hover:text-gold-400 transition-colors"
                >
                  {f.productsSweetWines}
                </Link>
              </li>
              <li className="pt-2 border-t border-white/10">
                <Link
                  href="/vini"
                  className="block py-0.5 font-sans text-[11px] font-bold uppercase tracking-[3px] text-gold-400 hover:text-white transition-colors"
                >
                  {f.productsAll} &rarr;
                </Link>
              </li>
            </ul>
          </div>

          {/* La Cantina & Territorio (Real Working Links) */}
          <div className="space-y-3">
            <h3 className="label-caps text-white pb-3 border-b border-white/15">
              {f.estateTitle}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/la-cantina"
                  className="block py-0.5 font-sans text-[11px] font-bold uppercase tracking-[3px] text-white/70 hover:text-gold-400 transition-colors"
                >
                  {f.estateStory}
                </Link>
              </li>
              <li>
                <Link
                  href="/la-cantina#galleria"
                  className="block py-0.5 font-sans text-[11px] font-bold uppercase tracking-[3px] text-white/70 hover:text-gold-400 transition-colors"
                >
                  {f.estateGallery}
                </Link>
              </li>
              <li>
                <Link
                  href="/la-cantina#valori"
                  className="block py-0.5 font-sans text-[11px] font-bold uppercase tracking-[3px] text-white/70 hover:text-gold-400 transition-colors"
                >
                  {f.estateValues}
                </Link>
              </li>
              <li>
                <Link
                  href="/#storia"
                  className="block py-0.5 font-sans text-[11px] font-bold uppercase tracking-[3px] text-white/70 hover:text-gold-400 transition-colors"
                >
                  {f.estateMeetUs}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contatti & Note Legali */}
          <div className="space-y-3">
            <h3 className="label-caps text-white pb-3 border-b border-white/15">
              {f.contactsTitle}
            </h3>
            <div className="space-y-4 text-sm text-white/70">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gold-400 shrink-0" />
                <a
                  href={`mailto:${f.email}`}
                  className="hover:text-gold-400 transition-colors break-all"
                  title={f.emailAction}
                >
                  {f.email}
                </a>
              </div>

              <div className="flex items-start gap-2 text-white/80 p-3 border border-white/15">
                <Sparkles className="w-3.5 h-3.5 text-gold-400 shrink-0 mt-0.5" />
                <span className="text-xs leading-relaxed">
                  {f.pickupTasting}
                </span>
              </div>

              <ul className="pt-4 space-y-2 border-t border-white/10">
                <li>
                  <Link
                    href="/legal#privacy"
                    className="block font-sans text-[11px] font-bold uppercase tracking-[3px] text-white/60 hover:text-gold-400 transition-colors"
                  >
                    {f.privacy}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/legal#termini"
                    className="block font-sans text-[11px] font-bold uppercase tracking-[3px] text-white/60 hover:text-gold-400 transition-colors"
                  >
                    {f.terms}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/legal#cookie"
                    className="block font-sans text-[11px] font-bold uppercase tracking-[3px] text-white/60 hover:text-gold-400 transition-colors"
                  >
                    {f.cookie}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 3. Payment Methods & Copyright Row */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-white/60">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-sans text-[10px] font-bold uppercase tracking-[3px] text-white/70 mr-1">
              {f.paymentsTitle}:
            </span>
            <span className="px-2.5 py-1 border border-white/20 text-white/80 text-[10px] font-bold uppercase tracking-[2px]">
              VISA / Mastercard
            </span>
            <span className="px-2.5 py-1 border border-white/20 text-white/80 text-[10px] font-bold uppercase tracking-[2px]">
              PayPal
            </span>
            <span className="px-2.5 py-1 border border-white/20 text-white/80 text-[10px] font-bold uppercase tracking-[2px]">
              {f.paymentWire}
            </span>
            <span className="px-2.5 py-1 border border-white/20 text-white/80 text-[10px] font-bold uppercase tracking-[2px]">
              {f.paymentCash}
            </span>
          </div>

          <p className="text-center md:text-right text-white/60">
            {f.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}
