"use client";

import { useState, useTransition } from "react";
import { Check, AlertCircle } from "lucide-react";
import { selectShippingOptions, type CheckoutActionError } from "@/lib/actions/checkout";
import type { ShippingGroup } from "@/lib/data/checkout";
import type { Dictionary } from "@/lib/i18n";

interface CheckoutShippingFormProps {
  t: Dictionary["checkout"];
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
export function CheckoutShippingForm({ t, groups, selected }: CheckoutShippingFormProps) {
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
    return <p className="text-sm text-cellar-700">{t.noShippingOptions}</p>;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" aria-busy={isPending}>
      {groups.map((group) => (
        <fieldset key={group.profileId} className="space-y-2.5">
          <legend className="mb-1 text-sm font-semibold text-cellar-900">{t.shippingChoiceLegend}</legend>
          {group.options.map((option) => {
            const checked = selection[group.profileId] === option.id;
            const amount = option.amount ?? 0;
            return (
              <label
                key={option.id}
                className={`flex items-start gap-3 rounded-2xl border p-4 cursor-pointer transition-colors ${
                  checked ? "border-wine-800 bg-wine-900/5" : "border-ivory-300 hover:border-wine-300"
                }`}
              >
                <input
                  type="radio"
                  name={`shipping-${group.profileId}`}
                  value={option.id}
                  checked={checked}
                  onChange={() => setSelection({ ...selection, [group.profileId]: option.id })}
                  className="mt-1 w-4 h-4 text-wine-900 focus:ring-wine-800"
                />
                <span className="flex-1">
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="text-sm font-semibold text-cellar-900">{option.name}</span>
                    <span className="text-sm font-bold text-wine-950 whitespace-nowrap">
                      {amount === 0 ? t.free : `€ ${formatEuro(amount)}`}
                    </span>
                  </span>
                  {option.type?.description && (
                    <span className="block text-xs text-cellar-600 mt-0.5">{option.type.description}</span>
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
          className="inline-flex items-center justify-center rounded-full bg-wine-900 px-6 py-3 text-sm font-bold uppercase tracking-wider text-ivory-50 hover:bg-wine-950 disabled:opacity-60"
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
