"use client";

import { useState, useTransition } from "react";
import { Plus, AlertCircle, Star } from "lucide-react";
import { deleteAddress, saveAddress, type AccountActionError } from "@/lib/actions/account";
import type { SavedAddress } from "@/lib/data/account";
import type { Dictionary } from "@/lib/i18n";

type T = Dictionary["accountArea"];
type Draft = Omit<SavedAddress, "id">;

const EMPTY: Draft = {
  firstName: "",
  lastName: "",
  address1: "",
  address2: "",
  postalCode: "",
  city: "",
  province: "",
  phone: "",
  isDefault: false,
};

/** Address book (ADR 041). Italy only; ids are only ever used under /store/customers/me. */
export function AddressBook({ t, checkoutT, addresses }: { t: T; checkoutT: Dictionary["checkout"]; addresses: SavedAddress[] }) {
  // null = closed, "new" = new address, otherwise the id being edited
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [invalid, setInvalid] = useState<Set<string>>(new Set());
  const [error, setError] = useState<AccountActionError | null>(null);
  const [isPending, startTransition] = useTransition();

  const open = (address?: SavedAddress) => {
    setError(null);
    setInvalid(new Set());
    setEditing(address ? address.id : "new");
    setDraft(address ? { ...address } : { ...EMPTY, isDefault: addresses.length === 0 });
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const { phone, isDefault, ...address } = draft;
    startTransition(async () => {
      const result = await saveAddress({ id: editing === "new" ? null : editing, address, phone, isDefault });
      if (result.ok) {
        setEditing(null);
        return;
      }
      setInvalid(new Set(result.fields ?? []));
      setError(result.error === "invalid_input" ? null : result.error);
    });
  };

  const onDelete = (id: string) => {
    if (!window.confirm(t.confirmDelete)) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteAddress({ id });
      if (!result.ok) setError(result.error);
    });
  };

  const errorMessage =
    error === "unauthenticated" ? t.errorUnauthenticated : error === "not_found" ? t.errorNotFound : error ? t.errorUnavailable : null;

  const field = (key: keyof Draft, path: string, label: string, autoComplete: string, opts: { maxLength?: number; inputMode?: "numeric" | "tel"; required?: boolean; span?: string } = {}) => {
    const isInvalid = invalid.has(path);
    const id = `address-${key}`;
    return (
      <div className={opts.span}>
        <label htmlFor={id} className="block font-sans text-[11px] font-bold uppercase tracking-[2px] text-gray-600 mb-1">
          {label}
        </label>
        <input
          id={id}
          value={String(draft[key])}
          onChange={(e) => setDraft({ ...draft, [key]: key === "province" ? e.target.value.toUpperCase() : e.target.value })}
          autoComplete={autoComplete}
          inputMode={opts.inputMode}
          maxLength={opts.maxLength}
          required={opts.required ?? true}
          aria-invalid={isInvalid}
          aria-describedby={isInvalid ? `${id}-error` : undefined}
          className={`w-full border bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-wine-800/30 ${
 isInvalid ?"border-rose-500" : "border-ivory-300 focus:border-wine-800"
          }`}
        />
        {isInvalid && (
          <p id={`${id}-error`} className="mt-1 text-[11px] text-rose-700">
            {t.fieldInvalid}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-5" aria-busy={isPending}>
      {addresses.length === 0 && editing === null && <p className="text-sm text-cellar-600">{t.addressesEmpty}</p>}

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {addresses.map((a) => (
          <li key={a.id} className="border-t border-black pt-5 pb-2">
            <div className="flex items-start gap-2">
                            <address className="not-italic text-sm text-cellar-800 flex-1">
                <span className="font-semibold text-cellar-900">
                  {a.firstName} {a.lastName}
                </span>
                <br />
                {a.address1}
                {a.address2 && `, ${a.address2}`}
                <br />
                {a.postalCode} {a.city} ({a.province})
                {a.phone && (
                  <>
                    <br />
                    {a.phone}
                  </>
                )}
              </address>
              {a.isDefault && (
                <span className="inline-flex items-center gap-1 font-sans text-[10px] font-bold uppercase tracking-[2px] text-gold-700">
                  <Star className="w-3 h-3" aria-hidden="true" />
                  {t.defaultAddress}
                </span>
              )}
            </div>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
              <button type="button" onClick={() => open(a)} disabled={isPending} className="link-editorial text-black hover:text-gold-700">
                {t.editAddress}
              </button>
              <button type="button" onClick={() => onDelete(a.id)} disabled={isPending} className="link-editorial text-gray-600 hover:text-rose-700">
                {t.deleteAddress}
              </button>
            </div>
          </li>
        ))}
      </ul>

      {editing === null ? (
        <button
          type="button"
          onClick={() => open()}
          className="inline-flex items-center gap-2 border border-black px-8 py-4 label-caps text-black hover:bg-black hover:text-white transition-colors duration-300"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          {t.addAddress}
        </button>
      ) : (
        <form onSubmit={onSubmit} noValidate className="bg-gray-100 p-6 lg:p-8 space-y-6">
          <h3 className="font-serif text-2xl">{editing === "new" ? t.newAddressTitle : t.editAddressTitle}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
            {field("firstName", "address.firstName", checkoutT.firstName, "given-name", { maxLength: 60, span: "sm:col-span-3" })}
            {field("lastName", "address.lastName", checkoutT.lastName, "family-name", { maxLength: 60, span: "sm:col-span-3" })}
            {field("address1", "address.address1", checkoutT.address1, "address-line1", { maxLength: 120, span: "sm:col-span-6" })}
            {field("address2", "address.address2", checkoutT.address2, "address-line2", { maxLength: 120, required: false, span: "sm:col-span-6" })}
            {field("postalCode", "address.postalCode", checkoutT.postalCode, "postal-code", { maxLength: 5, inputMode: "numeric", span: "sm:col-span-2" })}
            {field("city", "address.city", checkoutT.city, "address-level2", { maxLength: 60, span: "sm:col-span-2" })}
            {field("province", "address.province", checkoutT.province, "address-level1", { maxLength: 2, span: "sm:col-span-2" })}
            {field("phone", "phone", t.phone, "tel", { maxLength: 20, inputMode: "tel", required: false, span: "sm:col-span-3" })}
          </div>
          <p className="text-xs text-cellar-500">{t.italyOnly}</p>
          <label className="flex items-center gap-2.5 text-sm text-cellar-800 cursor-pointer">
            <input
              type="checkbox"
              checked={draft.isDefault}
              onChange={(e) => setDraft({ ...draft, isDefault: e.target.checked })}
              className="w-4 h-4 rounded border-ivory-400 accent-black"
            />
            {t.setDefault}
          </label>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center justify-center bg-black px-8 py-4 label-caps text-white hover:bg-gold-700 transition-colors duration-300 disabled:opacity-60"
            >
              {isPending ? t.saving : t.saveAddress}
            </button>
            <button type="button" onClick={() => setEditing(null)} className="link-editorial text-gray-600 hover:text-black">
              {t.cancel}
            </button>
          </div>
        </form>
      )}

      {errorMessage && (
        <p role="alert" className="flex items-start gap-1.5 text-sm text-rose-700">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
          {errorMessage}
        </p>
      )}
    </div>
  );
}
