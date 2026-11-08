"use client";

import { useState } from "react";
import Link from "next/link";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  PackageCheck,
  Wine,
  Info,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import type { getDictionary, Locale } from "@/lib/i18n";
import { useAuthForms } from "./auth/useAuthForms";

interface AccountAuthCardProps {
  dict: ReturnType<typeof getDictionary>;
  currentLocale: Locale;
}

const inputBase =
  "w-full py-3 bg-ivory-50/70 border text-cellar-900 placeholder:text-cellar-400 text-sm focus:outline-none focus:bg-white focus:ring-1 transition-colors";

/** Login / registration on the /account page (ADR 040). Same Server Actions as the popup. */
export function AccountAuthCard({ dict, currentLocale }: AccountAuthCardProps) {
  const t = dict.accountPage;
  const m = dict.accountModal;
  const [activeTab, setActiveTab] = useState<"signin" | "register">("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotNotice, setShowForgotNotice] = useState(false);
  // On success the Server Action refreshes the page, which then shows the account panel.
  const forms = useAuthForms(m);
  const mode = activeTab === "signin" ? "login" : "register";
  const privacyHref = currentLocale === "en" ? "/legal?lang=en" : "/legal";

  const switchTab = (tab: "signin" | "register") => {
    setActiveTab(tab);
    setShowForgotNotice(false);
    forms.reset();
  };

  const fieldProps = (field: string, padding: string) => {
    const invalid = !!forms.fieldError(field, mode);
    return {
      "aria-invalid": invalid,
      "aria-describedby": invalid ? `account-${mode}-${field}-error` : undefined,
      className: `${inputBase} ${padding} ${
        invalid ? "border-rose-500 focus:ring-rose-500" : "border-ivory-300 focus:border-wine-700 focus:ring-wine-700"
      }`,
    };
  };
  const fieldErrorText = (field: string) => {
    const message = forms.fieldError(field, mode);
    return message ? (
      <p id={`account-${mode}-${field}-error`} className="text-rose-600 text-xs mt-1.5">
        {message}
      </p>
    ) : null;
  };

  const labelClass = "block text-xs uppercase tracking-wider font-semibold text-cellar-800 mb-1.5";
  const passwordToggle = (
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-cellar-400 hover:text-cellar-700 transition-colors"
      aria-label={showPassword ? "Nascondi password" : "Mostra password"}
    >
      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
    </button>
  );
  const submitClass =
    "w-full mt-6 py-3.5 px-6 bg-wine-700 hover:bg-wine-800 text-white font-bold text-xs uppercase tracking-widest shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-7 bg-white text-cellar-900 p-6 sm:p-10 border border-ivory-200">
        <div className="flex border-b border-ivory-200 pb-4 mb-8 gap-6" role="tablist">
          {(["signin", "register"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              onClick={() => switchTab(tab)}
              className={`pb-2 px-1 text-sm sm:text-base font-bold uppercase tracking-wider transition-all relative ${
                activeTab === tab ? "text-wine-700 border-b-2 border-wine-700" : "text-cellar-500 hover:text-cellar-900"
              }`}
            >
              {tab === "signin" ? t.tabSignIn : t.tabRegister}
            </button>
          ))}
        </div>

        {forms.errorMessage && (
          <div role="alert" className="mb-6 p-4 flex items-center gap-3 text-xs sm:text-sm font-medium bg-rose-50 border border-rose-200 text-rose-800">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" aria-hidden="true" />
            <span>{forms.errorMessage}</span>
          </div>
        )}

        {activeTab === "signin" ? (
          <form onSubmit={forms.submitLogin} noValidate className="space-y-5" aria-busy={forms.isPending}>
            <div>
              <label htmlFor="signin-email" className={labelClass}>
                {t.emailLabel} *
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cellar-400" aria-hidden="true" />
                <input
                  id="signin-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={forms.login.email}
                  onChange={(e) => forms.login.setEmail(e.target.value)}
                  placeholder="nome@dominio.it"
                  {...fieldProps("email", "pl-10 pr-4")}
                />
              </div>
              {fieldErrorText("email")}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="signin-password" className="block text-xs uppercase tracking-wider font-semibold text-cellar-800">
                  {t.passwordLabel} *
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotNotice(!showForgotNotice)}
                  aria-expanded={showForgotNotice}
                  className="text-xs text-gold-700 hover:text-wine-900 hover:underline transition-colors font-medium"
                >
                  {t.forgotPassword}
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cellar-400" aria-hidden="true" />
                <input
                  id="signin-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={forms.login.password}
                  onChange={(e) => forms.login.setPassword(e.target.value)}
                  placeholder="••••••••••"
                  {...fieldProps("password", "pl-10 pr-11")}
                />
                {passwordToggle}
              </div>
              {fieldErrorText("password")}
              {showForgotNotice && (
                <p role="status" className="mt-2 flex items-start gap-2 bg-ivory-100 border border-ivory-300 p-3 text-xs text-cellar-800">
                  <Info className="w-4 h-4 text-gold-700 shrink-0" aria-hidden="true" />
                  {m.forgotPasswordNotice}
                </p>
              )}
            </div>

            <button type="submit" disabled={forms.isPending} className={submitClass}>
              <ArrowRight className="w-4 h-4 text-gold-300" aria-hidden="true" />
              <span>{forms.isPending ? m.loggingIn : t.signInBtn}</span>
            </button>
          </form>
        ) : (
          <form onSubmit={forms.submitRegister} noValidate className="space-y-4" aria-busy={forms.isPending}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="reg-firstname" className={labelClass}>
                  {t.firstNameLabel} *
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cellar-400" aria-hidden="true" />
                  <input
                    id="reg-firstname"
                    type="text"
                    autoComplete="given-name"
                    required
                    maxLength={60}
                    value={forms.register.firstName}
                    onChange={(e) => forms.register.setFirstName(e.target.value)}
                    placeholder="Giuseppe"
                    {...fieldProps("firstName", "pl-10 pr-4")}
                  />
                </div>
                {fieldErrorText("firstName")}
              </div>
              <div>
                <label htmlFor="reg-lastname" className={labelClass}>
                  {t.lastNameLabel} *
                </label>
                <input
                  id="reg-lastname"
                  type="text"
                  autoComplete="family-name"
                  required
                  maxLength={60}
                  value={forms.register.lastName}
                  onChange={(e) => forms.register.setLastName(e.target.value)}
                  placeholder="Esposito"
                  {...fieldProps("lastName", "px-4")}
                />
                {fieldErrorText("lastName")}
              </div>
            </div>

            <div>
              <label htmlFor="reg-email" className={labelClass}>
                {t.emailLabel} *
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cellar-400" aria-hidden="true" />
                <input
                  id="reg-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={forms.register.email}
                  onChange={(e) => forms.register.setEmail(e.target.value)}
                  placeholder="giuseppe.esposito@email.it"
                  {...fieldProps("email", "pl-10 pr-4")}
                />
              </div>
              {fieldErrorText("email")}
            </div>

            <div>
              <label htmlFor="reg-password" className={labelClass}>
                {t.passwordLabel} *
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cellar-400" aria-hidden="true" />
                <input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={10}
                  value={forms.register.password}
                  onChange={(e) => forms.register.setPassword(e.target.value)}
                  placeholder="••••••••••"
                  {...fieldProps("password", "pl-10 pr-11")}
                />
                {passwordToggle}
              </div>
              {fieldErrorText("password") ?? <p className="text-[11px] text-cellar-500 mt-1.5">{m.passwordHint}</p>}
            </div>

            <div className="pt-2 space-y-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={forms.register.ageConfirmed}
                  onChange={(e) => forms.register.setAgeConfirmed(e.target.checked)}
                  aria-invalid={!!forms.fieldError("ageConfirmed", "register")}
                  className="mt-0.5 w-4 h-4 rounded border-ivory-400 text-wine-700 focus:ring-wine-700"
                />
                <span className="text-xs text-cellar-700 leading-relaxed">{t.ageCheck}</span>
              </label>
              {fieldErrorText("ageConfirmed")}
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={forms.register.privacyAccepted}
                  onChange={(e) => forms.register.setPrivacyAccepted(e.target.checked)}
                  aria-invalid={!!forms.fieldError("privacyAccepted", "register")}
                  className="mt-0.5 w-4 h-4 rounded border-ivory-400 text-wine-700 focus:ring-wine-700"
                />
                <span className="text-xs text-cellar-700 leading-relaxed">
                  {m.privacyAcceptPrefix}{" "}
                  <Link href={privacyHref} target="_blank" className="underline text-wine-700">
                    {m.privacyLinkLabel}
                  </Link>
                </span>
              </label>
              {fieldErrorText("privacyAccepted")}
            </div>

            <button type="submit" disabled={forms.isPending} className={submitClass}>
              <ArrowRight className="w-4 h-4 text-gold-300" aria-hidden="true" />
              <span>{forms.isPending ? m.registering : t.registerBtn}</span>
            </button>
          </form>
        )}
      </div>

      <div className="lg:col-span-5 space-y-6">
        <div className="bg-white p-6 sm:p-8 border border-ivory-200">
          <div className="flex items-center gap-2.5 text-wine-700 mb-4">
            <Wine className="w-5 h-5 text-gold-600" aria-hidden="true" />
            <h3 className="font-serif text-lg font-bold text-cellar-950">{t.benefitsTitle}</h3>
          </div>
          <ul className="space-y-4 text-xs sm:text-sm text-cellar-700">
            <li className="flex items-start gap-3">
              <PackageCheck className="w-4 h-4 text-wine-700 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{t.benefit1}</span>
            </li>
            <li className="flex items-start gap-3">
              <Wine className="w-4 h-4 text-wine-700 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{t.benefit2}</span>
            </li>
            <li className="flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-wine-700 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{t.benefit3}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
