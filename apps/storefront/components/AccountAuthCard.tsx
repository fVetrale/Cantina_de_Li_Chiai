"use client";

import { useState } from "react";
import Link from "next/link";
import { z } from "zod";
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
  Clock,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import type { getDictionary, Locale } from "@/lib/i18n";

interface AccountAuthCardProps {
  dict: ReturnType<typeof getDictionary>;
  currentLocale: Locale;
}

const signInSchema = z.object({
  email: z.string().email("Inserisci un indirizzo email valido"),
  password: z.string().min(8, "La password deve contenere almeno 8 caratteri"),
  rememberMe: z.boolean().optional(),
});

const registerSchema = z.object({
  firstName: z.string().min(2, "Il nome deve contenere almeno 2 caratteri"),
  lastName: z.string().min(2, "Il cognome deve contenere almeno 2 caratteri"),
  email: z.string().email("Inserisci un indirizzo email valido"),
  password: z.string().min(8, "La password deve contenere almeno 8 caratteri"),
  ageCheck: z.boolean().refine((val) => val === true, {
    message: "Devi confermare di avere almeno 18 anni per procedere",
  }),
});

export function AccountAuthCard({ dict }: AccountAuthCardProps) {
  const t = dict.accountPage;
  const notice = dict.accountModal;
  const [activeTab, setActiveTab] = useState<"signin" | "register">("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "info" | "error";
    message: string;
  } | null>(null);

  // Form states
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  const [regFirstName, setRegFirstName] = useState("");
  const [regLastName, setRegLastName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regAgeCheck, setRegAgeCheck] = useState(false);

  // Errors state
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setFormErrors({});

    const result = signInSchema.safeParse({
      email: signInEmail.trim(),
      password: signInPassword,
      rememberMe,
    });

    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) errors[err.path[0].toString()] = err.message;
      });
      setFormErrors(errors);
      return;
    }

    // Customer auth is not live yet (ADR 031): never simulate a successful sign-in.
    setFeedback({ type: "info", message: notice.unavailableDesc });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setFormErrors({});

    const result = registerSchema.safeParse({
      firstName: regFirstName.trim(),
      lastName: regLastName.trim(),
      email: regEmail.trim(),
      password: regPassword,
      ageCheck: regAgeCheck,
    });

    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) errors[err.path[0].toString()] = err.message;
      });
      setFormErrors(errors);
      return;
    }

    // Customer auth is not live yet (ADR 031): never simulate a registration.
    setFeedback({ type: "info", message: notice.unavailableDesc });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Colonna Sinistra / Principale: Form Card con Fondo Bianco */}
      <div className="lg:col-span-7 bg-white text-cellar-900 rounded-3xl p-6 sm:p-10 border border-ivory-200 shadow-xl">
        {/* Tab Buttons */}
        <div className="flex border-b border-ivory-200 pb-4 mb-8 gap-6">
          <button
            type="button"
            onClick={() => {
              setActiveTab("signin");
              setFeedback(null);
              setFormErrors({});
            }}
            className={`pb-2 px-1 text-sm sm:text-base font-bold uppercase tracking-wider transition-all relative ${
              activeTab === "signin"
                ? "text-[#72182b] border-b-2 border-[#72182b]"
                : "text-cellar-500 hover:text-cellar-900"
            }`}
          >
            {t.tabSignIn}
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("register");
              setFeedback(null);
              setFormErrors({});
            }}
            className={`pb-2 px-1 text-sm sm:text-base font-bold uppercase tracking-wider transition-all relative ${
              activeTab === "register"
                ? "text-[#72182b] border-b-2 border-[#72182b]"
                : "text-cellar-500 hover:text-cellar-900"
            }`}
          >
            {t.tabRegister}
          </button>
        </div>

        {/* Customer area not live yet (ADR 031) */}
        <div
          role="note"
          className="mb-6 p-4 rounded-2xl bg-ivory-100 border border-gold-400/40 text-cellar-800"
        >
          <p className="flex items-center gap-2 text-sm font-bold text-[#72182b]">
            <Clock className="w-4 h-4 shrink-0" aria-hidden="true" />
            {notice.unavailableTitle}
          </p>
          <p id="account-unavailable-desc" className="mt-1 text-xs sm:text-sm leading-relaxed">
            {notice.unavailableDesc}
          </p>
          <Link
            href="/#footer"
            className="mt-2 inline-block text-xs font-semibold text-[#72182b] underline hover:text-[#581321]"
          >
            {notice.unavailableContact}
          </Link>
        </div>

        {/* Feedback Banner */}
        {feedback && (
          <div
            className={`mb-6 p-4 rounded-2xl flex items-center gap-3 text-xs sm:text-sm font-medium ${
              feedback.type === "info"
                ? "bg-ivory-100 border border-ivory-300 text-cellar-800"
                : "bg-rose-50 border border-rose-200 text-rose-800"
            }`}
          >
            {feedback.type === "info" ? (
              <Info className="w-5 h-5 text-gold-700 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* TAB 1: ACCEDI */}
        {activeTab === "signin" && (
          <form onSubmit={handleSignIn} className="space-y-5">
            {/* Disabled until real customer auth exists (ADR 031) */}
            <fieldset
              disabled
              aria-describedby="account-unavailable-desc"
              className="m-0 min-w-0 border-0 p-0 space-y-5 opacity-60"
            >
              <div>
                <label
                  htmlFor="signin-email"
                  className="block text-xs uppercase tracking-wider font-semibold text-cellar-800 mb-1.5"
                >
                  {t.emailLabel} *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cellar-400" />
                  <input
                    id="signin-email"
                    type="email"
                    required
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    placeholder="nome@dominio.it"
                    className="w-full pl-10 pr-4 py-3 bg-ivory-50/70 border border-ivory-300 rounded-xl text-cellar-900 placeholder:text-cellar-400 text-sm focus:outline-none focus:bg-white focus:border-[#72182b] focus:ring-1 focus:ring-[#72182b] transition-colors"
                  />
                </div>
                {formErrors.email && (
                  <p className="text-rose-600 text-xs mt-1.5">{formErrors.email}</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="signin-password"
                    className="block text-xs uppercase tracking-wider font-semibold text-cellar-800"
                  >
                    {t.passwordLabel} *
                  </label>
                  <button
                    type="button"
                    className="text-xs text-gold-700 hover:text-wine-900 hover:underline transition-colors font-medium"
                  >
                    {t.forgotPassword}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cellar-400" />
                  <input
                    id="signin-password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-11 py-3 bg-ivory-50/70 border border-ivory-300 rounded-xl text-cellar-900 placeholder:text-cellar-400 text-sm focus:outline-none focus:bg-white focus:border-[#72182b] focus:ring-1 focus:ring-[#72182b] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-cellar-400 hover:text-cellar-700 transition-colors"
                    aria-label="Mostra o nascondi password"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {formErrors.password && (
                  <p className="text-rose-600 text-xs mt-1.5">{formErrors.password}</p>
                )}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-ivory-400 text-[#72182b] focus:ring-[#72182b]"
                />
                <label htmlFor="remember-me" className="text-xs text-cellar-700 cursor-pointer">
                  {t.rememberMe}
                </label>
              </div>

              <button
                type="submit"
                className="w-full mt-6 py-3.5 px-6 rounded-full bg-[#72182b] hover:bg-[#581321] text-white font-bold text-xs uppercase tracking-widest shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                <ArrowRight className="w-4 h-4 text-gold-300" />
                <span>{t.signInBtn}</span>
              </button>
            </fieldset>
          </form>
        )}

        {/* TAB 2: CREA ACCOUNT */}
        {activeTab === "register" && (
          <form onSubmit={handleRegister} className="space-y-4">
            {/* Disabled until real customer auth exists (ADR 031) */}
            <fieldset
              disabled
              aria-describedby="account-unavailable-desc"
              className="m-0 min-w-0 border-0 p-0 space-y-4 opacity-60"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="reg-firstname"
                    className="block text-xs uppercase tracking-wider font-semibold text-cellar-800 mb-1.5"
                  >
                    {t.firstNameLabel} *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cellar-400" />
                    <input
                      id="reg-firstname"
                      type="text"
                      required
                      value={regFirstName}
                      onChange={(e) => setRegFirstName(e.target.value)}
                      placeholder="Giuseppe"
                      className="w-full pl-10 pr-4 py-2.5 bg-ivory-50/70 border border-ivory-300 rounded-xl text-cellar-900 placeholder:text-cellar-400 text-sm focus:outline-none focus:bg-white focus:border-[#72182b] focus:ring-1 focus:ring-[#72182b] transition-colors"
                    />
                  </div>
                  {formErrors.firstName && (
                    <p className="text-rose-600 text-xs mt-1">{formErrors.firstName}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="reg-lastname"
                    className="block text-xs uppercase tracking-wider font-semibold text-cellar-800 mb-1.5"
                  >
                    {t.lastNameLabel} *
                  </label>
                  <input
                    id="reg-lastname"
                    type="text"
                    required
                    value={regLastName}
                    onChange={(e) => setRegLastName(e.target.value)}
                    placeholder="Esposito"
                    className="w-full px-4 py-2.5 bg-ivory-50/70 border border-ivory-300 rounded-xl text-cellar-900 placeholder:text-cellar-400 text-sm focus:outline-none focus:bg-white focus:border-[#72182b] focus:ring-1 focus:ring-[#72182b] transition-colors"
                  />
                  {formErrors.lastName && (
                    <p className="text-rose-600 text-xs mt-1">{formErrors.lastName}</p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="reg-email"
                  className="block text-xs uppercase tracking-wider font-semibold text-cellar-800 mb-1.5"
                >
                  {t.emailLabel} *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cellar-400" />
                  <input
                    id="reg-email"
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="giuseppe.esposito@email.it"
                    className="w-full pl-10 pr-4 py-2.5 bg-ivory-50/70 border border-ivory-300 rounded-xl text-cellar-900 placeholder:text-cellar-400 text-sm focus:outline-none focus:bg-white focus:border-[#72182b] focus:ring-1 focus:ring-[#72182b] transition-colors"
                  />
                </div>
                {formErrors.email && (
                  <p className="text-rose-600 text-xs mt-1">{formErrors.email}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="reg-password"
                  className="block text-xs uppercase tracking-wider font-semibold text-cellar-800 mb-1.5"
                >
                  {t.passwordLabel} (minimo 8 caratteri) *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cellar-400" />
                  <input
                    id="reg-password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-11 py-2.5 bg-ivory-50/70 border border-ivory-300 rounded-xl text-cellar-900 placeholder:text-cellar-400 text-sm focus:outline-none focus:bg-white focus:border-[#72182b] focus:ring-1 focus:ring-[#72182b] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-cellar-400 hover:text-cellar-700 transition-colors"
                    aria-label="Mostra o nascondi password"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {formErrors.password && (
                  <p className="text-rose-600 text-xs mt-1">{formErrors.password}</p>
                )}
              </div>

              {/* Checkbox Maggiorenne */}
              <div className="pt-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={regAgeCheck}
                    onChange={(e) => setRegAgeCheck(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-ivory-400 text-[#72182b] focus:ring-[#72182b]"
                  />
                  <span className="text-xs text-cellar-700 leading-relaxed">
                    {t.ageCheck} (conforme alla legislazione vigente per l&apos;acquisto di vino).
                  </span>
                </label>
                {formErrors.ageCheck && (
                  <p className="text-rose-600 text-xs mt-1">{formErrors.ageCheck}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full mt-6 py-3.5 px-6 rounded-full bg-[#72182b] hover:bg-[#581321] text-white font-bold text-xs uppercase tracking-widest shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                <ArrowRight className="w-4 h-4 text-gold-300" />
                <span>{t.registerBtn}</span>
              </button>
            </fieldset>
          </form>
        )}
      </div>

      {/* Colonna Destra: Vantaggi Account & Garanzie */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-ivory-200 shadow-sm">
          <div className="flex items-center gap-2.5 text-[#72182b] mb-4">
            <Wine className="w-5 h-5 text-gold-600" />
            <h3 className="font-serif text-lg font-bold text-cellar-950">
              {t.benefitsTitle}
            </h3>
          </div>
          <ul className="space-y-4 text-xs sm:text-sm text-cellar-700">
            <li className="flex items-start gap-3">
              <PackageCheck className="w-4 h-4 text-[#72182b] shrink-0 mt-0.5" />
              <span>{t.benefit1}</span>
            </li>
            <li className="flex items-start gap-3">
              <Wine className="w-4 h-4 text-[#72182b] shrink-0 mt-0.5" />
              <span>{t.benefit2}</span>
            </li>
            <li className="flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-[#72182b] shrink-0 mt-0.5" />
              <span>{t.benefit3}</span>
            </li>
          </ul>
        </div>

      </div>
    </div>
  );
}
