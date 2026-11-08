"use client";

import { useState, useTransition } from "react";
import { Check, AlertCircle } from "lucide-react";
import { selectShippingOptions, type CheckoutActionError } from "@/lib/actions/checkout";
import type { ShippingGroup } from "@/lib/data/checkout";
import type { Dictionary } from "@/lib/i18n";
import { shippingDescription, shippingName } from "@/lib/shipping-labels";

interface CheckoutShippingFormProps {
  t: Dictionary["checkout"];
  /** Translated names of the known shipping options (ADR 049). */
  labels: Dictionary["shipping"];
  groups: ShippingGroup[];
  /** Currently selected option id per shipping profile. */
  selected: Record<string, string>;
}

function formatEuro(amount: number) {
  return amount.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Step 2: one shipping choice per shipping profile (ADR 037); the wine-only catalog has one,
 * courier or pickup at the cellar (ADR 043). Prices come from Medusa (free-shipping rule
 * already applied).
 */
export function CheckoutShippingForm({ t, labels, groups, selected }: CheckoutShippingFormProps) {
  const [selection, setSelection] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = { ...selected };
    for (const group of groups) {
      // A group with a single option needs no choice.
      if (!initial[group.profileId] && group.options.length === 1) {
        initial[group.profileId] = group.options[0].id;
      }
    }
    return initial;
  });
  const [error, setError] = useState<CheckoutActionError | "choose_all" | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(false);
    if (!groups.every((g) => selection[g.profileId])) {
      setError("choose_all");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await selectShippingOptions({
        optionIds: groups.map((g) => selection[g.profileId]),
      });
      if (result.ok) {
        setSaved(true);
        return;
      }
      setError(result.error);
    });
  };

  const errorMessage =
    error === "choose_all"
      ? t.errorChooseAll
      : error === "not_allowed"
        ? t.errorNotAllowed
        : error === "not_found"
          ? t.errorNotFound
          : error
            ? t.errorUnavailable
            : null;

  if (groups.length === 0) {
    return <p className="text-sm text-gray-600">{t.noShippingOptions}</p>;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" aria-busy={isPending}>
      {groups.map((group) => (
        <fieldset key={group.profileId} className="[&>label:first-of-type]:border-t [&>label:first-of-type]:border-ivory-300">
          <legend className="float-left w-full mb-4 label-caps text-black">{t.shippingChoiceLegend}</legend>
          {group.options.map((option) => {
            const checked = selection[group.profileId] === option.id;
            const amount = option.amount ?? 0;
            return (
              <label
                key={option.id}
                className={`flex items-start gap-4 border-b border-ivory-300 py-5 px-3 cursor-pointer transition-colors ${
                  checked ? "bg-gray-100" : "hover:bg-gray-100/60"
                }`}
              >
                <input
                  type="radio"
                  name={`shipping-${group.profileId}`}
                  value={option.id}
                  checked={checked}
                  onChange={() => setSelection({ ...selection, [group.profileId]: option.id })}
                  className="mt-1 w-4 h-4 accent-black"
                />
                <span className="flex-1">
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="font-sans text-[12px] font-bold uppercase tracking-[3px] text-black">{shippingName(labels, option.name, option.type?.code)}</span>
                    <span className="font-serif text-lg whitespace-nowrap">
                      {amount === 0 ? t.free : `€ ${formatEuro(amount)}`}
                    </span>
                  </span>
                  {option.type?.description && (
                    <span className="block text-sm text-gray-600 mt-1">
                      {shippingDescription(labels, option.type.description, option.type.code)}
                    </span>
                  )}
                </span>
              </label>
            );
          })}
        </fieldset>
      ))}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center bg-black px-8 py-4 label-caps text-white hover:bg-gold-700 transition-colors duration-300 disabled:opacity-60"
        >
          {isPending ? t.saving : t.saveShipping}
        </button>
        {saved && !isPending && (
          <span role="status" className="inline-flex items-center gap-1.5 text-sm text-olive-700">
            <Check className="w-4 h-4" aria-hidden="true" />
            {t.shippingSaved}
          </span>
        )}
      </div>

      {errorMessage && (
        <p role="alert" className="flex items-start gap-1.5 text-sm text-rose-700">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
          {errorMessage}
        </p>
      )}
    </form>
  );
}
