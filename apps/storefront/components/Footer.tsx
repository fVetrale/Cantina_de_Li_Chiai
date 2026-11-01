import Link from "next/link";
import { Wine, Mail, Phone, MapPin, ShieldAlert, Clock } from "lucide-react";
import type { getDictionary } from "@/lib/i18n";

interface FooterProps {
  dict: ReturnType<typeof getDictionary>;
}

export function Footer({ dict }: FooterProps) {
  return (
    <footer
      id="footer"
      aria-label="Informazioni Legali e Contatti"
      className="bg-[#120509] text-ivory-200"
    >
      {/* 1. Mandatory Legal Alcohol Notice Bar */}
      <div className="bg-[#24050b] border-b border-white/10 py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2.5 text-center text-xs text-gold-300 font-medium">
          <ShieldAlert className="w-4 h-4 text-gold-400 shrink-0" />
          <span>{dict.footer.legalNotice}</span>
        </div>
      </div>

      {/* 2. Main Multi-Column Footer (Signorvino Style) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info & Address */}
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
              {dict.footer.description}
            </p>
            <div className="pt-2 space-y-2 text-xs text-ivory-300/90">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                <span>{dict.footer.locationAddress}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gold-400 shrink-0" />
                <span>{dict.footer.hours}</span>
              </div>
            </div>
          </div>

          {/* Vini & Tipologie */}
          <div className="space-y-3">
            <h3 className="font-serif text-xs uppercase tracking-widest text-gold-300 font-bold border-b border-white/10 pb-2">
              I Nostri Vini
            </h3>
            <ul className="space-y-2 text-xs text-ivory-300/80">
              <li>
                <Link href="/prodotti/fiano-del-cilento-doc" className="hover:text-gold-300 transition-colors">
                  Fiano del Cilento DOC
                </Link>
              </li>
              <li>
                <Link href="/prodotti/aglianico-del-cilento-doc-riserva" className="hover:text-gold-300 transition-colors">
                  Aglianico del Cilento DOC Riserva
                </Link>
              </li>
              <li>
                <Link href="/prodotti/cilento-doc-rosso-paestum-igt" className="hover:text-gold-300 transition-colors">
                  Cilento DOC Rosso - Paestum IGT
                </Link>
              </li>
              <li>
                <Link href="/vini?categoria=riserve" className="hover:text-gold-300 transition-colors">
                  Riserve Speciali del Parco
                </Link>
              </li>
              <li>
                <Link href="/#promo" className="hover:text-gold-300 transition-colors">
                  Confezioni Regalo in Legno
                </Link>
              </li>
            </ul>
          </div>

          {/* La Cantina */}
          <div className="space-y-3">
            <h3 className="font-serif text-xs uppercase tracking-widest text-gold-300 font-bold border-b border-white/10 pb-2">
              La Cantina
            </h3>
            <ul className="space-y-2 text-xs text-ivory-300/80">
              <li>
                <Link href="/la-cantina" className="hover:text-gold-300 transition-colors">
                  Storia &amp; Filosofia
                </Link>
              </li>
              <li>
                <Link href="/#terroir" className="hover:text-gold-300 transition-colors">
                  Il Flysch Cilentano
                </Link>
              </li>
              <li>
                <Link href="/#story" className="hover:text-gold-300 transition-colors">
                  Vendemmia Manuale
                </Link>
              </li>
              <li>
                <Link href="/#promo" className="hover:text-gold-300 transition-colors">
                  Visite &amp; Degustazioni
                </Link>
              </li>
              <li>
                <Link href="/#footer" className="hover:text-gold-300 transition-colors">
                  Lavora con Noi
                </Link>
              </li>
            </ul>
          </div>

          {/* Servizio Clienti */}
          <div className="space-y-3">
            <h3 className="font-serif text-xs uppercase tracking-widest text-gold-300 font-bold border-b border-white/10 pb-2">
              {dict.footer.contactsTitle}
            </h3>
            <div className="space-y-2.5 text-xs text-ivory-300/80">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gold-400 shrink-0" />
                <a
                  href={`mailto:${dict.footer.email}`}
                  className="hover:text-gold-300 transition-colors"
                >
                  {dict.footer.email}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gold-400 shrink-0" />
                <a
                  href={`tel:${dict.footer.phone.replace(/\s+/g, "")}`}
                  className="hover:text-gold-300 transition-colors"
                >
                  {dict.footer.phone}
                </a>
              </div>
              <ul className="pt-2 space-y-1.5 border-t border-white/10 text-ivory-400">
                <li>
                  <a href="#footer" className="hover:text-gold-300 transition-colors">
                    {dict.footer.privacy}
                  </a>
                </li>
                <li>
                  <a href="#footer" className="hover:text-gold-300 transition-colors">
                    {dict.footer.terms}
                  </a>
                </li>
                <li>
                  <a href="#footer" className="hover:text-gold-300 transition-colors">
                    {dict.footer.cookie}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 3. Payment Methods Row (Signorvino Style) */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-ivory-300/60">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-ivory-300/80">{dict.footer.paymentsTitle}:</span>
            <div className="flex items-center gap-2 text-ivory-200">
              <span className="px-2 py-1 rounded bg-white/10 text-[10px] font-bold">VISA</span>
              <span className="px-2 py-1 rounded bg-white/10 text-[10px] font-bold">Mastercard</span>
              <span className="px-2 py-1 rounded bg-white/10 text-[10px] font-bold">PayPal</span>
              <span className="px-2 py-1 rounded bg-white/10 text-[10px] font-bold">Apple Pay</span>
              <span className="px-2 py-1 rounded bg-white/10 text-[10px] font-bold">Scalapay</span>
            </div>
          </div>

          <p>{dict.footer.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
