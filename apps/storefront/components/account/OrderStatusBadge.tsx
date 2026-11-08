import type { OrderStatusKey } from "@/lib/data/account";
import type { Dictionary } from "@/lib/i18n";

const STYLES: Record<OrderStatusKey, string> = {
  processing: "bg-gold-100 text-gold-700 border-gold-300",
  shipped: "bg-sky-50 text-sky-800 border-sky-200",
  delivered: "bg-olive-500/10 text-olive-800 border-olive-500/30",
  canceled: "bg-rose-50 text-rose-700 border-rose-200",
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
    <span className={`inline-flex border px-2.5 py-0.5 text-[11px] font-semibold ${STYLES[status]}`}>
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
