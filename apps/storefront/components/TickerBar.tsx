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
      className="z-10 w-full bg-[#18060b]/90 backdrop-blur-md border-t border-gold-400/20 py-2.5 px-3 sm:px-6 overflow-x-auto no-scrollbar"
    >
      <div
        className="flex items-center justify-center min-w-max mx-auto gap-4 sm:gap-6 lg:gap-8 text-xs font-medium tracking-wide text-gold-200 whitespace-nowrap select-none"
        style={{ flexWrap: "nowrap" }}
      >
        {parts[0] && (
          <div className="flex items-center gap-2 shrink-0 whitespace-nowrap">
            <Truck className="w-4 h-4 text-gold-400 shrink-0" />
            <span className="whitespace-nowrap">{parts[0]}</span>
          </div>
        )}
        <span className="text-gold-400/40 shrink-0">•</span>
        {parts[1] && (
          <div className="flex items-center gap-2 shrink-0 whitespace-nowrap">
            <ShieldCheck className="w-4 h-4 text-gold-400 shrink-0" />
            <span className="whitespace-nowrap">{parts[1]}</span>
          </div>
        )}
        <span className="text-gold-400/40 shrink-0">•</span>
        {parts[2] && (
          <div className="flex items-center gap-2 shrink-0 whitespace-nowrap">
            <Wine className="w-4 h-4 text-gold-400 shrink-0" />
            <span className="whitespace-nowrap">{parts[2]}</span>
          </div>
        )}
        <span className="text-gold-400/40 shrink-0">•</span>
        {parts[3] && (
          <div className="flex items-center gap-2 shrink-0 whitespace-nowrap">
            <Award className="w-4 h-4 text-gold-400 shrink-0" />
            <span className="whitespace-nowrap">{parts[3]}</span>
          </div>
        )}
      </div>
    </aside>
  );
}
