"use client";

import { useState } from "react";
import { Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import type { getDictionary } from "@/lib/i18n";

interface NewsletterSectionProps {
  dict: ReturnType<typeof getDictionary>;
}

export function NewsletterSection({ dict }: NewsletterSectionProps) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <section
      aria-label="Iscrizione alla Newsletter"
      className="bg-[#1a2e26] text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-ivory-200"
    >
      <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-gold-300 border border-gold-400/30 mb-4">
          <Mail className="w-6 h-6 text-gold-400" />
        </div>

        <h2 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight text-ivory-50 mb-3">
          {dict.newsletter.title}
        </h2>

        <p className="text-xs sm:text-sm text-ivory-200/80 max-w-xl mb-8 leading-relaxed">
          {dict.newsletter.subtitle}
        </p>

        {subscribed ? (
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-900/80 border border-emerald-500/40 text-emerald-200 text-xs font-semibold animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Iscrizione completata con successo! Benvenuto nel nostro club.</span>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={dict.newsletter.placeholder}
              className="w-full px-5 py-3.5 rounded-full bg-white text-cellar-900 placeholder:text-cellar-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 shadow-inner"
            />
            <button
              type="submit"
              className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#4a141b] hover:bg-[#3d0f18] text-white font-bold text-xs uppercase tracking-wider shrink-0 shadow-md transition-all flex items-center justify-center gap-2 border border-gold-400/30 active:scale-95"
            >
              <span>{dict.newsletter.button}</span>
              <ArrowRight className="w-4 h-4 text-gold-300" />
            </button>
          </form>
        )}

        <span className="text-[11px] text-ivory-300/60 mt-4 block">
          {dict.newsletter.legal}
        </span>
      </div>
    </section>
  );
}
