"use client";

import { useState, useEffect } from "react";
import { ShieldAlert, Wine, CheckCircle2, XCircle } from "lucide-react";
import type { getDictionary } from "@/lib/i18n";

interface AgeGateModalProps {
  dict: ReturnType<typeof getDictionary>;
}

export function AgeGateModal({ dict }: AgeGateModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    try {
      const verified = sessionStorage.getItem("cantina_age_verified");
      if (!verified) {
        timer = setTimeout(() => {
          setIsOpen(true);
        }, 0);
      }
    } catch {
      // If sessionStorage is unavailable, fail gracefully
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);

  const handleConfirm = () => {
    try {
      sessionStorage.setItem("cantina_age_verified", "true");
    } catch {
      // ignore
    }
    setIsOpen(false);
  };

  const handleDecline = () => {
    setIsBlocked(true);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cellar-950/85 backdrop-blur-md animate-fadeIn"
    >
      <div className="relative w-full max-w-lg rounded-2xl bg-cellar-900 border border-gold-500/40 p-8 shadow-2xl text-center text-ivory-100">
        {/* Winery Crest Icon */}
        <div className="mx-auto w-16 h-16 rounded-full bg-gradient-wine flex items-center justify-center text-gold-300 shadow-md border border-gold-500/40 mb-6">
          <Wine className="w-8 h-8 text-gold-400" />
        </div>

        {isBlocked ? (
          <div className="space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-red-950/80 border border-red-500/40 flex items-center justify-center text-red-400">
              <XCircle className="w-6 h-6" />
            </div>
            <h2
              id="age-gate-title"
              className="font-serif text-2xl font-bold text-red-300"
            >
              {dict.ageGate.blockedTitle}
            </h2>
            <p className="text-sm text-ivory-200/80 leading-relaxed font-sans">
              {dict.ageGate.blockedDesc}
            </p>
            <div className="pt-4 text-xs text-ivory-300/60 border-t border-ivory-200/10">
              {dict.footer.legalNotice}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-gold-400 block mb-2">
                {dict.common.brand}
              </span>
              <h2
                id="age-gate-title"
                className="font-serif text-3xl font-bold text-ivory-50 mb-3"
              >
                {dict.ageGate.title}
              </h2>
              <p className="text-sm text-ivory-200/80 leading-relaxed font-sans">
                {dict.ageGate.description}
              </p>
            </div>

            {/* Verification Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={handleConfirm}
                className="w-full sm:flex-1 py-3.5 px-4 rounded-xl bg-gradient-gold text-wine-950 font-bold text-sm uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-gold-glow flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{dict.ageGate.confirm}</span>
              </button>

              <button
                type="button"
                onClick={handleDecline}
                className="w-full sm:flex-1 py-3.5 px-4 rounded-xl bg-cellar-800 hover:bg-cellar-700 text-ivory-300/80 hover:text-ivory-100 font-medium text-sm uppercase tracking-wider border border-ivory-200/20 active:scale-95 transition-all"
              >
                <span>{dict.ageGate.decline}</span>
              </button>
            </div>

            {/* Legal Notice Footer */}
            <div className="pt-4 border-t border-ivory-200/10 flex items-center justify-center gap-2 text-xs text-gold-300/70 font-sans">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-gold-400" />
              <span>{dict.footer.legalNotice}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
