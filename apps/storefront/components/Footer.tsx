import Link from "next/link";
import { Wine, Mail, MapPin, ShieldAlert, Clock, Truck, Sparkles, ExternalLink } from "lucide-react";
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
      className="bg-[#120509] text-ivory-200"
    >
      {/* 1. Mandatory Legal Alcohol Notice Bar */}
      <div className="bg-[#24050b] border-b border-white/10 py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2.5 text-center text-xs text-gold-300 font-medium">
          <ShieldAlert className="w-4 h-4 text-gold-400 shrink-0" />
          <span>{f.legalNotice}</span>
        </div>
      </div>

      {/* 2. Main Multi-Column Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info & Cellar Location */}
          <div className="space-y-4 lg:col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#661022] flex items-center justify-center text-gold-300 border border-gold-500/40">
                <Wine className="w-5 h-5 text-gold-400" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-xl font-bold tracking-wider text-white uppercase">
                  {dict.common.brand}
                </span>
                <span className="text-[10px] uppercase tracking-widest text-gold-400 font-semibold">
                  {dict.common.origin}
                </span>
              </div>
            </div>

            <p className="text-xs text-ivory-300/80 leading-relaxed font-sans max-w-sm">
              {f.description}
            </p>

            <div className="pt-2 space-y-2 text-xs text-ivory-300/90">
              <a
                href="https://maps.google.com/?q=Contrada+Pozzo+15,+84040+Abatemarco+SA"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2 hover:text-gold-300 transition-colors group"
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
            <h3 className="font-serif text-xs uppercase tracking-widest text-gold-300 font-bold border-b border-white/10 pb-2">
              {f.productsTitle}
            </h3>
            <ul className="space-y-2 text-xs text-ivory-300/80">
              <li>
                <Link
                  href="/vini?categoria=vini-rossi"
                  className="hover:text-gold-300 transition-colors block py-0.5"
                >
                  {f.productsRedWines}
                </Link>
              </li>
              <li>
                <Link
                  href="/vini?categoria=vini-bianchi"
                  className="hover:text-gold-300 transition-colors block py-0.5"
                >
                  {f.productsWhiteWines}
                </Link>
              </li>
              <li>
                <Link
                  href="/vini?categoria=vini-dolci"
                  className="hover:text-gold-300 transition-colors block py-0.5"
                >
                  {f.productsSweetWines}
                </Link>
              </li>
              <li className="pt-1 border-t border-white/5">
                <Link
                  href="/vini"
                  className="text-gold-300/90 font-semibold hover:text-white transition-colors block py-0.5"
                >
                  {f.productsAll} &rarr;
                </Link>
              </li>
            </ul>
          </div>

          {/* La Cantina & Territorio (Real Working Links) */}
          <div className="space-y-3">
            <h3 className="font-serif text-xs uppercase tracking-widest text-gold-300 font-bold border-b border-white/10 pb-2">
              {f.estateTitle}
            </h3>
            <ul className="space-y-2 text-xs text-ivory-300/80">
              <li>
                <Link
                  href="/la-cantina"
                  className="hover:text-gold-300 transition-colors block py-0.5"
                >
                  {f.estateStory}
                </Link>
              </li>
              <li>
                <Link
                  href="/la-cantina#galleria"
                  className="hover:text-gold-300 transition-colors block py-0.5"
                >
                  {f.estateGallery}
                </Link>
              </li>
              <li>
                <Link
                  href="/la-cantina#valori"
                  className="hover:text-gold-300 transition-colors block py-0.5"
                >
                  {f.estateValues}
                </Link>
              </li>
              <li>
                <Link
                  href="/#vieni-a-conoscerci"
                  className="hover:text-gold-300 transition-colors block py-0.5"
                >
                  {f.estateMeetUs}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contatti & Note Legali */}
          <div className="space-y-3">
            <h3 className="font-serif text-xs uppercase tracking-widest text-gold-300 font-bold border-b border-white/10 pb-2">
              {f.contactsTitle}
            </h3>
            <div className="space-y-3 text-xs text-ivory-300/80">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gold-400 shrink-0" />
                <a
                  href={`mailto:${f.email}`}
                  className="hover:text-gold-300 transition-colors break-all"
                  title={f.emailAction}
                >
                  {f.email}
                </a>
              </div>

              <div className="flex items-start gap-2 text-gold-300/90 bg-white/5 p-2.5 rounded-xl border border-white/10">
                <Sparkles className="w-3.5 h-3.5 text-gold-400 shrink-0 mt-0.5" />
                <span className="text-[11px] leading-relaxed">
                  {f.pickupTasting}
                </span>
              </div>

              <ul className="pt-2 space-y-1.5 border-t border-white/10 text-ivory-400">
                <li>
                  <Link
                    href="/legal#privacy"
                    className="hover:text-gold-300 transition-colors block"
                  >
                    {f.privacy}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/legal#termini"
                    className="hover:text-gold-300 transition-colors block"
                  >
                    {f.terms}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/legal#cookie"
                    className="hover:text-gold-300 transition-colors block"
                  >
                    {f.cookie}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 3. Payment Methods & Copyright Row */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-ivory-300/60">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-semibold text-ivory-300/80 mr-1">
              {f.paymentsTitle}:
            </span>
            <span className="px-2.5 py-1 rounded-md bg-white/10 text-ivory-200 text-[10px] font-bold tracking-wide">
              VISA / Mastercard
            </span>
            <span className="px-2.5 py-1 rounded-md bg-white/10 text-ivory-200 text-[10px] font-bold tracking-wide">
              PayPal
            </span>
            <span className="px-2.5 py-1 rounded-md bg-white/10 text-ivory-200 text-[10px] font-bold tracking-wide">
              {f.paymentWire}
            </span>
            <span className="px-2.5 py-1 rounded-md bg-white/10 text-ivory-200 text-[10px] font-bold tracking-wide">
              {f.paymentCash}
            </span>
          </div>

          <p className="text-center md:text-right text-ivory-400/80">
            {f.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}
