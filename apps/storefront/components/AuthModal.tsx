"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { X, Eye, EyeOff, Info, AlertCircle, ArrowRight } from "lucide-react";
import type { Dictionary, Locale } from "@/lib/i18n";
import { useAuthForms } from "./auth/useAuthForms";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "register";
  dict: Pick<Dictionary, "accountModal">;
  currentLocale: Locale;
}

const emptySubscribe = () => () => {};

const inputClass =
  "w-full pb-2.5 pt-1 border-b-2 bg-transparent text-sm text-cellar-900 placeholder:text-cellar-300 focus:outline-none transition-colors";

/** Login / registration popup (ADR 040). Real Medusa auth through Server Actions. */
export function AuthModal({ isOpen, onClose, initialMode = "login", dict, currentLocale }: AuthModalProps) {
  const isMounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const t = dict.accountModal;

  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotNotice, setShowForgotNotice] = useState(false);
  const forms = useAuthForms(t, onClose);
  const privacyHref = currentLocale === "en" ? "/legal?lang=en" : "/legal";

  // Lock body scroll and listen for Escape key
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isMounted || !isOpen) return null;

  const switchMode = (next: "login" | "register") => {
    setMode(next);
    setShowForgotNotice(false);
    forms.reset();
  };

  const fieldErrorText = (field: string) => {
    const message = forms.fieldError(field, mode);
    return message ? (
      <p id={`auth-${mode}-${field}-error`} className="text-rose-600 text-xs mt-1">
        {message}
      </p>
    ) : null;
  };
  const invalidProps = (field: string) => {
    const invalid = !!forms.fieldError(field, mode);
    return {
      "aria-invalid": invalid,
      "aria-describedby": invalid ? `auth-${mode}-${field}-error` : undefined,
      className: `${inputClass} ${invalid ? "border-rose-500" : "border-cellar-200 focus:border-[#72182b]"}`,
    };
  };

  const passwordToggle = (
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute right-0 bottom-2 text-cellar-400 hover:text-cellar-700 transition-colors"
      aria-label={showPassword ? "Nascondi password" : "Mostra password"}
    >
      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
    </button>
  );

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-[9999] bg-black/65 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 sm:p-9 border border-ivory-200 text-cellar-900 my-auto">
        <button
          type="button"
          onClick={onClose}
          aria-label="Chiudi finestra"
          className="absolute top-5 right-5 p-2 rounded-full text-cellar-400 hover:text-cellar-900 hover:bg-ivory-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <span className="text-xs uppercase tracking-wider font-bold text-cellar-500 block mb-1">
            {t.modalLoginTitle}
          </span>
          <h2 id="auth-modal-title" className="font-serif text-2xl sm:text-3xl font-bold text-cellar-950 tracking-tight">
            {mode === "login" ? t.modalSubtitleLogin : t.modalSubtitleRegister}
          </h2>
        </div>

        {forms.errorMessage && (
          <div
            role="alert"
            className="mb-5 p-3.5 rounded-2xl flex items-center gap-2.5 text-xs font-semibold bg-rose-50 border border-rose-200 text-rose-800"
          >
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" aria-hidden="true" />
            <span>{forms.errorMessage}</span>
          </div>
        )}

        {mode === "login" ? (
          <form onSubmit={forms.submitLogin} noValidate className="space-y-5" aria-busy={forms.isPending}>
            <div>
              <label htmlFor="modal-email" className="block text-xs font-semibold text-cellar-700 mb-1">
                {t.emailLabel}
              </label>
              <input
                id="modal-email"
                type="email"
                autoComplete="email"
                required
                value={forms.login.email}
                onChange={(e) => forms.login.setEmail(e.target.value)}
                placeholder="nome@dominio.it"
                {...invalidProps("email")}
              />
              {fieldErrorText("email")}
            </div>

            <div>
              <label htmlFor="modal-password" className="block text-xs font-semibold text-cellar-700 mb-1">
                {t.passwordLabel}
              </label>
              <div className="relative">
                <input
                  id="modal-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={forms.login.password}
                  onChange={(e) => forms.login.setPassword(e.target.value)}
                  placeholder="••••••••••"
                  {...invalidProps("password")}
                />
                {passwordToggle}
              </div>
              {fieldErrorText("password")}
            </div>

            <div>
              <button
                type="button"
                onClick={() => setShowForgotNotice(!showForgotNotice)}
                aria-expanded={showForgotNotice}
                className="text-xs font-medium text-cellar-800 underline hover:text-[#72182b] transition-colors"
              >
                {t.forgotPassword}
              </button>
              {showForgotNotice && (
                <p role="status" className="mt-2 flex items-start gap-2 rounded-xl bg-ivory-100 border border-ivory-300 p-3 text-xs text-cellar-800">
                  <Info className="w-4 h-4 text-gold-700 shrink-0" aria-hidden="true" />
                  {t.forgotPasswordNotice}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={forms.isPending}
              className="w-full mt-3 py-3.5 px-6 rounded-full bg-[#72182b] hover:bg-[#581321] text-white font-bold text-sm tracking-wide shadow-md hover:shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <span>{forms.isPending ? t.loggingIn : t.loginBtn}</span>
            </button>

            <div className="pt-2 space-y-2 text-center">
              <p className="text-xs text-cellar-600">{t.socialOr}</p>
              {/* Not available yet: shown as such, never a fake sign-in (ADR 040). */}
              <button
                type="button"
                disabled
                aria-describedby="google-soon"
                className="w-full py-2.5 px-4 rounded-xl border border-cellar-200 flex items-center justify-center gap-2.5 text-xs font-semibold text-cellar-800 shadow-sm opacity-60 cursor-not-allowed"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>{t.googleBtn}</span>
                <span id="google-soon" className="ml-1 rounded-full bg-ivory-100 px-2 py-0.5 text-[10px] font-semibold text-cellar-600">
                  {t.googleSoon}
                </span>
              </button>
              <p className="text-[10px] text-cellar-500 leading-tight pt-1">{t.privacyDisclaimer}</p>
            </div>

            <div className="relative py-2 flex items-center justify-center">
              <div className="grow border-t border-cellar-200" />
              <span className="shrink-0 px-3 text-xs text-cellar-500 font-medium">{t.newUserPrompt}</span>
              <div className="grow border-t border-cellar-200" />
            </div>

            <button
              type="button"
              onClick={() => switchMode("register")}
              className="w-full py-3 rounded-full border-2 border-[#72182b] text-[#72182b] hover:bg-[#72182b]/5 font-bold text-sm tracking-wide transition-colors cursor-pointer"
            >
              {t.registerNowBtn}
            </button>
          </form>
        ) : (
          <form onSubmit={forms.submitRegister} noValidate className="space-y-4" aria-busy={forms.isPending}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="reg-name" className="block text-xs font-semibold text-cellar-700 mb-1">
                  {t.firstNameLabel}
                </label>
                <input
                  id="reg-name"
                  type="text"
                  autoComplete="given-name"
                  required
                  maxLength={60}
                  value={forms.register.firstName}
                  onChange={(e) => forms.register.setFirstName(e.target.value)}
                  placeholder="Giuseppe"
                  {...invalidProps("firstName")}
                />
                {fieldErrorText("firstName")}
              </div>
              <div>
                <label htmlFor="reg-surname" className="block text-xs font-semibold text-cellar-700 mb-1">
                  {t.lastNameLabel}
                </label>
                <input
                  id="reg-surname"
                  type="text"
                  autoComplete="family-name"
                  required
                  maxLength={60}
                  value={forms.register.lastName}
                  onChange={(e) => forms.register.setLastName(e.target.value)}
                  placeholder="Esposito"
                  {...invalidProps("lastName")}
                />
                {fieldErrorText("lastName")}
              </div>
            </div>

            <div>
              <label htmlFor="reg-email" className="block text-xs font-semibold text-cellar-700 mb-1">
                {t.emailLabel}
              </label>
              <input
                id="reg-email"
                type="email"
                autoComplete="email"
                required
                value={forms.register.email}
                onChange={(e) => forms.register.setEmail(e.target.value)}
                placeholder="nome@dominio.it"
                {...invalidProps("email")}
              />
              {fieldErrorText("email")}
            </div>

            <div>
              <label htmlFor="reg-pwd" className="block text-xs font-semibold text-cellar-700 mb-1">
                {t.passwordLabel}
              </label>
              <div className="relative">
                <input
                  id="reg-pwd"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={10}
                  value={forms.register.password}
                  onChange={(e) => forms.register.setPassword(e.target.value)}
                  placeholder="••••••••••"
                  {...invalidProps("password")}
                />
                {passwordToggle}
              </div>
              {fieldErrorText("password") ?? <p className="text-[11px] text-cellar-500 mt-1">{t.passwordHint}</p>}
            </div>

            <div className="pt-2 space-y-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={forms.register.ageConfirmed}
                  onChange={(e) => forms.register.setAgeConfirmed(e.target.checked)}
                  aria-invalid={!!forms.fieldError("ageConfirmed", "register")}
                  className="mt-0.5 w-4 h-4 rounded border-cellar-300 text-[#72182b] focus:ring-[#72182b]"
                />
                <span className="text-xs text-cellar-700 leading-relaxed">{t.ageCheckbox}</span>
              </label>
              {fieldErrorText("ageConfirmed")}
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={forms.register.privacyAccepted}
                  onChange={(e) => forms.register.setPrivacyAccepted(e.target.checked)}
                  aria-invalid={!!forms.fieldError("privacyAccepted", "register")}
                  className="mt-0.5 w-4 h-4 rounded border-cellar-300 text-[#72182b] focus:ring-[#72182b]"
                />
                <span className="text-xs text-cellar-700 leading-relaxed">
                  {t.privacyAcceptPrefix}{" "}
                  <Link href={privacyHref} target="_blank" className="underline text-[#72182b]">
                    {t.privacyLinkLabel}
                  </Link>
                </span>
              </label>
              {fieldErrorText("privacyAccepted")}
            </div>

            <button
              type="submit"
              disabled={forms.isPending}
              className="w-full mt-3 py-3.5 px-6 rounded-full bg-[#72182b] hover:bg-[#581321] text-white font-bold text-sm tracking-wide shadow-md hover:shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <ArrowRight className="w-4 h-4 text-gold-300" aria-hidden="true" />
              <span>{forms.isPending ? t.registering : t.registerSubmitBtn}</span>
            </button>

            <div className="relative py-2 flex items-center justify-center">
              <div className="grow border-t border-cellar-200" />
              <span className="shrink-0 px-3 text-xs text-cellar-500 font-medium">{t.haveAccountPrompt}</span>
              <div className="grow border-t border-cellar-200" />
            </div>

            <button
              type="button"
              onClick={() => switchMode("login")}
              className="w-full py-3 rounded-full border-2 border-[#72182b] text-[#72182b] hover:bg-[#72182b]/5 font-bold text-sm tracking-wide transition-colors cursor-pointer"
            >
              {t.loginNowBtn}
            </button>
          </form>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
