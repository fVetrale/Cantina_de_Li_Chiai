import type { OrderStatusKey } from "@/lib/data/account";
import type { Dictionary } from "@/lib/i18n";

// Editorial status (ADR 050): a small dot and an uppercase label; colors are status only.
const STYLES: Record<OrderStatusKey, { text: string; dot: string }> = {
  processing: { text: "text-gold-700", dot: "bg-gold-500" },
  shipped: { text: "text-black", dot: "bg-black" },
  delivered: { text: "text-olive-700", dot: "bg-olive-600" },
  canceled: { text: "text-rose-700", dot: "bg-rose-600" },
};

export function orderStatusLabel(status: OrderStatusKey, t: Dictionary["accountArea"]): string {
  return {
    processing: t.statusProcessing,
    shipped: t.statusShipped,
    delivered: t.statusDelivered,
    canceled: t.statusCanceled,
  }[status];
}

export function OrderStatusBadge({ status, t }: { status: OrderStatusKey; t: Dictionary["accountArea"] }) {
  return (
    <span className={`inline-flex items-center gap-2 font-sans text-[11px] font-bold uppercase tracking-[2px] ${STYLES[status].text}`}>
      <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${STYLES[status].dot}`} />
      {orderStatusLabel(status, t)}
    </span>
  );
}

export function formatEuro(amount: number) {
  return amount.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatDate(iso: string, locale: "it" | "en") {
  return new Date(iso).toLocaleDateString(locale === "en" ? "en-GB" : "it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Europe/Rome",
  });
}
