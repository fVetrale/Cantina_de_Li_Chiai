"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { AlertCircle, IdCard, Lock } from "lucide-react";
import { placeOrder, type PlaceOrderError } from "@/lib/actions/checkout";
import { checkAge, latestAdultBirthDate } from "@/lib/age";
import type { Dictionary, Locale } from "@/lib/i18n";

interface CheckoutPlaceOrderFormProps {
  t: Dictionary["checkout"];
  locale: Locale;
  /** Steps 1 and 2 are complete (email, address, shipping for every group). */
  ready: boolean;
}

type LocalError = "birth_date" | "declaration" | "terms";

/**
 * Step 3: age declaration, terms, place order (ADR 038, 039).
 * The date of birth only lives in this component's state and in the Server Action call:
 * it is not stored in the browser, and the server discards it after the age check.
 */
export function CheckoutPlaceOrderForm({ t, locale, ready }: CheckoutPlaceOrderFormProps) {
  const [birthDate, setBirthDate] = useState("");
  const [declaredAdult, setDeclaredAdult] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState<PlaceOrderError | LocalError | null>(null);
  const [isPending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Instant feedback only: the authoritative checks run on the server and in Medusa.
    const age = checkAge(birthDate, new Date());
    if (age === "invalid") return setError("birth_date");
    if (age === "underage") return setError("underage");
    if (!declaredAdult) return setError("declaration");
    if (!acceptTerms) return setError("terms");

    setError(null);
    startTransition(async () => {
      // On success the action redirects to the confirmation page.
      const result = await placeOrder({ birthDate, declaredAdult: true, acceptTerms: true, locale });
      if (result && !result.ok) {
        setError(result.error);
      }
    });
  };

  const errorMessage: Record<PlaceOrderError | LocalError, string> = {
    birth_date: t.errorBirthDate,
    declaration: t.errorDeclaration,
    terms: t.errorTerms,
    invalid_input: t.errorBirthDate,
    underage: t.errorUnderage,
    incomplete: t.errorIncomplete,
    out_of_stock: t.errorOutOfStock,
    age_rejected: t.errorAgeRejected,
    payment_failed: t.errorPayment,
    rejected: t.errorRejected,
    not_found: t.errorNotFound,
    unavailable: t.errorUnavailable,
  };

  if (!ready) {
    return <p className="text-sm text-cellar-600">{t.completeStepsFirst}</p>;
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5" aria-busy={isPending}>
      <div className="max-w-xs">
        <label htmlFor="checkout-birth-date" className="block text-xs font-semibold text-cellar-700 mb-1">
          {t.birthDate}
        </label>
        <input
          id="checkout-birth-date"
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          min="1900-01-01"
          max={latestAdultBirthDate(new Date())}
          // No autocomplete: the birth date should not be saved by the browser for this site.
          autoComplete="off"
          required
          aria-invalid={error === "birth_date" || error === "underage" || error === "invalid_input"}
          aria-describedby="checkout-birth-date-hint"
          className="w-full border border-ivory-300 bg-white px-3.5 py-2.5 text-sm text-cellar-900 focus:border-wine-800 focus:outline-none focus:ring-2 focus:ring-wine-800/30"
        />
        <p id="checkout-birth-date-hint" className="mt-1 text-[11px] text-cellar-500">
          {t.birthDateHint}
        </p>
      </div>

      <label className="flex items-start gap-2.5 text-sm text-cellar-800 cursor-pointer">
        <input
          type="checkbox"
          checked={declaredAdult}
          onChange={(e) => setDeclaredAdult(e.target.checked)}
          aria-invalid={error === "declaration"}
          className="mt-0.5 w-4 h-4 rounded border-ivory-400 text-wine-900 focus:ring-wine-800"
        />
        <span>{t.declareAdult}</span>
      </label>

      <label className="flex items-start gap-2.5 text-sm text-cellar-800 cursor-pointer">
        <input
          type="checkbox"
          checked={acceptTerms}
          onChange={(e) => setAcceptTerms(e.target.checked)}
          aria-invalid={error === "terms"}
          className="mt-0.5 w-4 h-4 rounded border-ivory-400 text-wine-900 focus:ring-wine-800"
        />
        <span>
          {t.acceptTermsPrefix}{" "}
          <Link
            href={locale === "en" ? "/legal?lang=en" : "/legal"}
            target="_blank"
            className="underline text-wine-900 hover:text-wine-950"
          >
            {t.termsLink}
          </Link>
        </span>
      </label>

      <p className="flex items-start gap-2 text-xs text-cellar-600">
        <IdCard className="w-4 h-4 shrink-0 text-wine-900" aria-hidden="true" />
        {t.idCheckNotice}
      </p>

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center justify-center gap-2 bg-wine-900 px-7 py-3.5 text-sm font-bold uppercase tracking-wider text-ivory-50 hover:bg-wine-950 disabled:opacity-60"
      >
        <Lock className="w-4 h-4" aria-hidden="true" />
        {isPending ? t.placing : t.placeOrder}
      </button>

      {error && (
        <p role="alert" className="flex items-start gap-1.5 text-sm text-rose-700">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
          {errorMessage[error]}
        </p>
      )}
    </form>
  );
}
