import { ShieldCheck, Truck, Award, Wine } from "lucide-react";
import type { getDictionary } from "@/lib/i18n";

interface TickerBarProps {
  dict: ReturnType<typeof getDictionary>;
}

export function TickerBar({ dict }: TickerBarProps) {
  const parts = dict.ticker.split(" • ");

  return (
    <aside
      aria-label="Informazioni spedizioni e garanzie"
      className="bg-[#24050b] text-gold-300 py-2.5 px-4 overflow-hidden border-y border-gold-500/20 text-xs font-medium tracking-wide"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-around flex-wrap gap-4 text-center">
        {parts[0] && (
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-gold-400 shrink-0" />
            <span>{parts[0]}</span>
          </div>
        )}
        <span className="hidden md:inline text-gold-500/40">•</span>
        {parts[1] && (
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-gold-400 shrink-0" />
            <span>{parts[1]}</span>
          </div>
        )}
        <span className="hidden md:inline text-gold-500/40">•</span>
        {parts[2] && (
          <div className="flex items-center gap-2">
            <Wine className="w-4 h-4 text-gold-400 shrink-0" />
            <span>{parts[2]}</span>
          </div>
        )}
        <span className="hidden md:inline text-gold-500/40">•</span>
        {parts[3] && (
          <div className="hidden lg:flex items-center gap-2">
            <Award className="w-4 h-4 text-gold-400 shrink-0" />
            <span>{parts[3]}</span>
          </div>
        )}
      </div>
    </aside>
  );
}
