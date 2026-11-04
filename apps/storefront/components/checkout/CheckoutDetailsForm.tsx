"use client";

import { useState, useTransition } from "react";
import { Check, AlertCircle } from "lucide-react";
import { saveCheckoutDetails, type CheckoutActionError } from "@/lib/actions/checkout";
import type { AddressView } from "@/lib/data/checkout";
import type { Dictionary } from "@/lib/i18n";

type T = Dictionary["checkout"];

type AddressFields = Omit<AddressView, "phone">;

const EMPTY_ADDRESS: AddressFields = {
  firstName: "",
  lastName: "",
  address1: "",
  address2: "",
  postalCode: "",
  city: "",
  province: "",
};

function pickAddress(address: AddressView | null): AddressFields {
  if (!address) return EMPTY_ADDRESS;
  const { phone: _phone, ...rest } = address;
  void _phone;
  return rest;
}

interface CheckoutDetailsFormProps {
  t: T;
  initial: {
    email: string;
    shipping: AddressView | null;
    billing: AddressView | null;
    billingSameAsShipping: boolean;
  };
}

/** Step 1: contact and addresses (ADR 037). Saved on the Medusa cart through a Server Action. */
export function CheckoutDetailsForm({ t, initial }: CheckoutDetailsFormProps) {
  const [email, setEmail] = useState(initial.email);
  const [phone, setPhone] = useState(initial.shipping?.phone ?? "");
  const [shipping, setShipping] = useState<AddressFields>(pickAddress(initial.shipping));
  const [billingSame, setBillingSame] = useState(initial.billingSameAsShipping);
  const [billing, setBilling] = useState<AddressFields>(pickAddress(initial.billing));
  const [invalidFields, setInvalidFields] = useState<Set<string>>(new Set());
  const [error, setError] = useState<CheckoutActionError | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await saveCheckoutDetails({
        email,
        phone,
        shipping,
        billingSameAsShipping: billingSame,
        billing: billingSame ? undefined : billing,
      });
      if (result.ok) {
        setInvalidFields(new Set());
        setSaved(true);
        return;
      }
      setInvalidFields(new Set(result.fields ?? []));
      setError(result.error);
    });
  };

  const field = (
    name: string,
    label: string,
    value: string,
    onChange: (v: string) => void,
    options: { autoComplete: string; type?: string; required?: boolean; inputMode?: "numeric" | "tel" | "email"; maxLength?: number; className?: string }
  ) => {
    const id = `checkout-${name.replace(".", "-")}`;
    const invalid = invalidFields.has(name);
    return (
      <div className={options.className}>
        <label htmlFor={id} className="block text-xs font-semibold text-cellar-700 mb-1">
          {label}
        </label>
        <input
          id={id}
          name={name}
          type={options.type ?? "text"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={options.autoComplete}
          inputMode={options.inputMode}
          maxLength={options.maxLength}
          required={options.required ?? true}
          aria-invalid={invalid}
          aria-describedby={invalid ? `${id}-error` : undefined}
          className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-cellar-900 focus:outline-none focus:ring-2 focus:ring-wine-800/30 ${
            invalid ? "border-rose-500" : "border-ivory-300 focus:border-wine-800"
          }`}
        />
        {invalid && (
          <p id={`${id}-error`} className="mt-1 text-[11px] text-rose-700">
            {t.fieldInvalid}
          </p>
        )}
      </div>
    );
  };

  const addressFields = (
    prefix: "shipping" | "billing",
    value: AddressFields,
    set: (v: AddressFields) => void,
    section: string
  ) => (
    <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
      {field(`${prefix}.firstName`, t.firstName, value.firstName, (v) => set({ ...value, firstName: v }), {
        autoComplete: `${section} given-name`,
        maxLength: 60,
        className: "sm:col-span-3",
      })}
      {field(`${prefix}.lastName`, t.lastName, value.lastName, (v) => set({ ...value, lastName: v }), {
        autoComplete: `${section} family-name`,
        maxLength: 60,
        className: "sm:col-span-3",
      })}
      {field(`${prefix}.address1`, t.address1, value.address1, (v) => set({ ...value, address1: v }), {
        autoComplete: `${section} address-line1`,
        maxLength: 120,
        className: "sm:col-span-6",
      })}
      {field(`${prefix}.address2`, t.address2, value.address2, (v) => set({ ...value, address2: v }), {
        autoComplete: `${section} address-line2`,
        maxLength: 120,
        required: false,
        className: "sm:col-span-6",
      })}
      {field(`${prefix}.postalCode`, t.postalCode, value.postalCode, (v) => set({ ...value, postalCode: v }), {
        autoComplete: `${section} postal-code`,
        inputMode: "numeric",
        maxLength: 5,
        className: "sm:col-span-2",
      })}
      {field(`${prefix}.city`, t.city, value.city, (v) => set({ ...value, city: v }), {
        autoComplete: `${section} address-level2`,
        maxLength: 60,
        className: "sm:col-span-2",
      })}
      {field(`${prefix}.province`, t.province, value.province, (v) => set({ ...value, province: v.toUpperCase() }), {
        autoComplete: `${section} address-level1`,
        maxLength: 2,
        className: "sm:col-span-2",
      })}
    </div>
  );

  const errorMessage =
    error === "not_found" ? t.errorNotFound : error === "unavailable" ? t.errorUnavailable : null;

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5" aria-busy={isPending}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {field("email", t.email, email, setEmail, { autoComplete: "email", type: "email", inputMode: "email", maxLength: 254 })}
        {field("phone", t.phone, phone, setPhone, { autoComplete: "tel", type: "tel", inputMode: "tel", maxLength: 20 })}
      </div>

      {addressFields("shipping", shipping, setShipping, "shipping")}

      <div>
        <p className="block text-xs font-semibold text-cellar-700 mb-1">{t.country}</p>
        <p className="text-sm text-cellar-900">
          {t.countryItaly} <span className="text-xs text-cellar-500">— {t.italyOnlyNote}</span>
        </p>
      </div>

      <label className="flex items-center gap-2.5 text-sm text-cellar-800 cursor-pointer">
        <input
          type="checkbox"
          checked={billingSame}
          onChange={(e) => setBillingSame(e.target.checked)}
          className="w-4 h-4 rounded border-ivory-400 text-wine-900 focus:ring-wine-800"
        />
        {t.billingSame}
      </label>

      {!billingSame && (
        <fieldset className="space-y-4 rounded-2xl border border-ivory-200 p-4">
          <legend className="px-1 text-sm font-semibold text-cellar-900">{t.billingTitle}</legend>
          {addressFields("billing", billing, setBilling, "billing")}
        </fieldset>
      )}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center rounded-full bg-wine-900 px-6 py-3 text-sm font-bold uppercase tracking-wider text-ivory-50 hover:bg-wine-950 disabled:opacity-60"
        >
          {isPending ? t.saving : t.saveDetails}
        </button>
        {saved && !isPending && (
          <span role="status" className="inline-flex items-center gap-1.5 text-sm text-olive-700">
            <Check className="w-4 h-4" aria-hidden="true" />
            {t.saved}
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
