"use client";

import { useState, useTransition } from "react";
import { Check, AlertCircle, Lock } from "lucide-react";
import { updateProfile, type AccountActionError } from "@/lib/actions/account";
import type { Profile } from "@/lib/data/account";
import type { Dictionary } from "@/lib/i18n";

/** Name and phone editing (ADR 041). The email is read-only until email verification exists. */
export function ProfileForm({ t, profile }: { t: Dictionary["accountArea"]; profile: Profile }) {
  const [firstName, setFirstName] = useState(profile.firstName);
  const [lastName, setLastName] = useState(profile.lastName);
  const [phone, setPhone] = useState(profile.phone);
  const [invalid, setInvalid] = useState<Set<string>>(new Set());
  const [error, setError] = useState<AccountActionError | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await updateProfile({ firstName, lastName, phone });
      if (result.ok) {
        setInvalid(new Set());
        setSaved(true);
        return;
      }
      setInvalid(new Set(result.fields ?? []));
      setError(result.error === "invalid_input" ? null : result.error);
    });
  };

  const input = (name: string, label: string, value: string, set: (v: string) => void, extra: { autoComplete: string; type?: string; required?: boolean }) => {
    const isInvalid = invalid.has(name);
    return (
      <div>
        <label htmlFor={`profile-${name}`} className="block font-sans text-[11px] font-bold uppercase tracking-[2px] text-gray-600 mb-1">
          {label}
        </label>
        <input
          id={`profile-${name}`}
          type={extra.type ?? "text"}
          value={value}
          onChange={(e) => set(e.target.value)}
          autoComplete={extra.autoComplete}
          required={extra.required ?? true}
          maxLength={60}
          aria-invalid={isInvalid}
          aria-describedby={isInvalid ? `profile-${name}-error` : undefined}
          className={`w-full border bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-wine-800/30 ${
 isInvalid ?"border-rose-500" : "border-ivory-300 focus:border-wine-800"
          }`}
        />
        {isInvalid && (
          <p id={`profile-${name}-error`} className="mt-1 text-[11px] text-rose-700">
            {t.fieldInvalid}
          </p>
        )}
      </div>
    );
  };

  const errorMessage =
    error === "unauthenticated" ? t.errorUnauthenticated : error === "not_found" ? t.errorNotFound : error ? t.errorUnavailable : null;

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5" aria-busy={isPending}>
      <div>
        <p className="block font-sans text-[11px] font-bold uppercase tracking-[2px] text-gray-600 mb-1">{t.email}</p>
        <p className="flex items-center gap-2 border-b border-ivory-300 py-2.5 text-sm text-gray-600 break-all">
          <Lock className="w-3.5 h-3.5 text-cellar-400 shrink-0" aria-hidden="true" />
          {profile.email}
        </p>
        <p className="mt-1 text-[11px] text-cellar-500">{t.emailReadOnly}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {input("firstName", t.firstName, firstName, setFirstName, { autoComplete: "given-name" })}
        {input("lastName", t.lastName, lastName, setLastName, { autoComplete: "family-name" })}
      </div>
      <div className="sm:max-w-xs">
        {input("phone", t.phone, phone, setPhone, { autoComplete: "tel", type: "tel", required: false })}
      </div>
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center bg-black px-8 py-4 label-caps text-white hover:bg-gold-700 transition-colors duration-300 disabled:opacity-60"
        >
          {isPending ? t.saving : t.save}
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
