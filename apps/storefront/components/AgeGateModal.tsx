"use client";

import { useState, useEffect } from "react";
import { ShieldAlert } from "lucide-react";
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

  // Full-screen black "entrance" with a radial vignette and the emblem (ADR 045).
  // Same behaviour as before: confirm stores the flag in sessionStorage, decline blocks.
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
      className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black text-white animate-fade-in"
      style={{ backgroundImage: "radial-gradient(ellipse at center, #1a1a1a 0%, #000000 70%)" }}
    >
      <div className="relative w-full max-w-xl text-center">
        {/* Placeholder emblem until the client provides the real one */}
        <div
          role="img"
          aria-label={dict.estatePage.emblemPlaceholder}
          className="mx-auto mb-10 flex h-20 w-20 items-center justify-center rounded-full border border-white/40 font-serif text-2xl tracking-[2px]"
        >
          LC
        </div>

        {isBlocked ? (
          <div className="space-y-6">
            <h2 id="age-gate-title" className="title-section text-white">
              {dict.ageGate.blockedTitle}
            </h2>
            <p className="text-editorial text-white/75">{dict.ageGate.blockedDesc}</p>
            <p className="pt-6 border-t border-white/15 font-sans text-[10px] font-bold uppercase tracking-[3px] text-white/60">
              {dict.footer.legalNotice}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            <div>
              <p className="label-caps text-gold-400 mb-6">{dict.common.brand}</p>
              <h2 id="age-gate-title" className="title-section text-white mb-5">
                {dict.ageGate.title}
              </h2>
              <p className="text-editorial text-white/75">{dict.ageGate.description}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={handleConfirm}
                className="w-full sm:flex-1 py-4 px-4 bg-white text-black label-caps hover:bg-gold-400 transition-colors duration-300"
              >
                {dict.ageGate.confirm}
              </button>
              <button
                type="button"
                onClick={handleDecline}
                className="w-full sm:flex-1 py-4 px-4 border border-white/40 text-white label-caps hover:border-white transition-colors duration-300"
              >
                {dict.ageGate.decline}
              </button>
            </div>

            <p className="pt-6 border-t border-white/15 flex items-center justify-center gap-2 font-sans text-[10px] font-bold uppercase tracking-[3px] text-white/60">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>{dict.footer.legalNotice}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
