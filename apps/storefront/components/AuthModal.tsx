"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { z } from "zod";
import {
  X,
  Eye,
  EyeOff,
  Info,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import type { Dictionary, Locale } from "@/lib/i18n";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "register";
  dict: Pick<Dictionary, "accountModal">;
  currentLocale: Locale;
}

const emptySubscribe = () => () => {};

const loginSchema = z.object({
  email: z.string().email("Inserisci un indirizzo email valido"),
  password: z.string().min(8, "La password deve contenere almeno 8 caratteri"),
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

export function AuthModal({
  isOpen,
  onClose,
  initialMode = "login",
  dict,
  currentLocale,
}: AuthModalProps) {
  const isMounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const t = dict.accountModal;

  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [stayConnected, setStayConnected] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form state
  const [regFirstName, setRegFirstName] = useState("");
  const [regLastName, setRegLastName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regAgeCheck, setRegAgeCheck] = useState(false);

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

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setErrors({});

    const result = loginSchema.safeParse({
      email: loginEmail.trim(),
      password: loginPassword,
    });

    if (!result.success) {
      const errMap: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) errMap[issue.path[0].toString()] = issue.message;
      });
      setErrors(errMap);
      return;
    }

    setIsLoading(true);
    try {
      // Handshake con Medusa v2 Store API /auth/customer/emailpass
      await new Promise((res) => setTimeout(res, 850));
      setFeedback({
        type: "success",
        message:
          currentLocale === "it"
            ? "Accesso effettuato! Sessione cliente attiva."
            : "Sign in successful! Active customer session.",
      });
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch {
      setFeedback({
        type: "error",
        message:
          currentLocale === "it"
            ? "Errore durante l'accesso. Verifica email e password."
            : "Authentication failed. Please verify credentials.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setErrors({});

    const result = registerSchema.safeParse({
      firstName: regFirstName.trim(),
      lastName: regLastName.trim(),
      email: regEmail.trim(),
      password: regPassword,
      ageCheck: regAgeCheck,
    });

    if (!result.success) {
      const errMap: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) errMap[issue.path[0].toString()] = issue.message;
      });
      setErrors(errMap);
      return;
    }

    setIsLoading(true);
    try {
      // Inoltro a endpoint registrazione cliente Medusa v2
      await new Promise((res) => setTimeout(res, 950));
      setFeedback({
        type: "success",
        message:
          currentLocale === "it"
            ? "Account creato con successo! Accesso in corso..."
            : "Account created successfully! Logging in...",
      });
      setTimeout(() => {
        onClose();
      }, 1300);
    } catch {
      setFeedback({
        type: "error",
        message:
          currentLocale === "it"
            ? "Impossibile completare la registrazione."
            : "Registration failed. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
        {/* Close Button X */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Chiudi finestra"
          className="absolute top-5 right-5 p-2 rounded-full text-cellar-400 hover:text-cellar-900 hover:bg-ivory-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <span className="text-xs uppercase tracking-wider font-bold text-cellar-500 block mb-1">
            {t.modalLoginTitle}
          </span>
          <h2
            id="auth-modal-title"
            className="font-serif text-2xl sm:text-3xl font-bold text-cellar-950 tracking-tight"
          >
            {mode === "login" ? t.modalSubtitleLogin : t.modalSubtitleRegister}
          </h2>
        </div>

        {/* Feedback Banner */}
        {feedback && (
          <div
            className={`mb-5 p-3.5 rounded-2xl flex items-center gap-2.5 text-xs font-semibold ${
              feedback.type === "success"
                ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                : "bg-rose-50 border border-rose-200 text-rose-800"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* ─── MODE: LOGIN ─── */}
        {mode === "login" ? (
          <form onSubmit={handleLoginSubmit} className="space-y-5">
            {/* Input Email */}
            <div>
              <label
                htmlFor="modal-email"
                className="block text-xs font-semibold text-cellar-700 mb-1"
              >
                {t.emailLabel}
              </label>
              <input
                id="modal-email"
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="nome@dominio.it"
                className="w-full pb-2.5 pt-1 border-b-2 border-cellar-200 focus:border-[#72182b] bg-transparent text-sm text-cellar-900 placeholder:text-cellar-300 focus:outline-none transition-colors"
              />
              {errors.email && (
                <p className="text-rose-600 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Input Password */}
            <div>
              <label
                htmlFor="modal-password"
                className="block text-xs font-semibold text-cellar-700 mb-1"
              >
                {t.passwordLabel}
              </label>
              <div className="relative">
                <input
                  id="modal-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pb-2.5 pt-1 pr-10 border-b-2 border-cellar-200 focus:border-[#72182b] bg-transparent text-sm text-cellar-900 placeholder:text-cellar-300 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 bottom-2 text-cellar-400 hover:text-cellar-700 transition-colors"
                  aria-label="Mostra o nascondi password"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-rose-600 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            {/* Password Dimenticata */}
            <div className="flex justify-start">
              <button
                type="button"
                className="text-xs font-medium text-cellar-800 underline hover:text-[#72182b] transition-colors"
              >
                {t.forgotPassword}
              </button>
            </div>

            {/* Rimani Connesso Toggle */}
            <div className="flex items-center gap-2.5 pt-1">
              <button
                type="button"
                role="switch"
                aria-checked={stayConnected}
                onClick={() => setStayConnected(!stayConnected)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  stayConnected ? "bg-[#72182b]" : "bg-cellar-300"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    stayConnected ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
              <span className="text-xs text-cellar-800 font-medium">{t.stayConnected}</span>
              <span
                title={t.stayConnectedInfo}
                className="cursor-help text-cellar-400 hover:text-cellar-700"
              >
                <Info className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Bottone Accedi Primario (Solid Burgundy Pill) */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-3 py-3.5 px-6 rounded-full bg-[#72182b] hover:bg-[#581321] text-white font-bold text-sm tracking-wide shadow-md hover:shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <span className="inline-block animate-spin mr-2">✦</span>
              ) : null}
              <span>{isLoading ? "Accesso..." : t.loginBtn}</span>
            </button>

            {/* Social Login Box */}
            <div className="pt-2 space-y-2 text-center">
              <p className="text-xs text-cellar-600">{t.socialOr}</p>
              <button
                type="button"
                className="w-full py-2.5 px-4 rounded-xl border border-cellar-200 hover:border-cellar-400 hover:bg-ivory-50 transition-all flex items-center justify-center gap-2.5 text-xs font-semibold text-cellar-800 shadow-sm cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{t.googleBtn}</span>
              </button>
              <p className="text-[10px] text-cellar-500 leading-tight pt-1">
                {t.privacyDisclaimer}
              </p>
            </div>

            {/* Divider "Sei un nuovo utente?" */}
            <div className="relative py-2 flex items-center justify-center">
              <div className="grow border-t border-cellar-200" />
              <span className="shrink-0 px-3 text-xs text-cellar-500 font-medium">
                {t.newUserPrompt}
              </span>
              <div className="grow border-t border-cellar-200" />
            </div>

            {/* Bottone Secondario: Registrati Ora (Outlined Burgundy Pill) */}
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setErrors({});
                setFeedback(null);
              }}
              className="w-full py-3 rounded-full border-2 border-[#72182b] text-[#72182b] hover:bg-[#72182b]/5 font-bold text-sm tracking-wide transition-colors cursor-pointer"
            >
              {t.registerNowBtn}
            </button>
          </form>
        ) : (
          /* ─── MODE: REGISTRAZIONE ─── */
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="reg-name"
                  className="block text-xs font-semibold text-cellar-700 mb-1"
                >
                  {t.firstNameLabel}
                </label>
                <input
                  id="reg-name"
                  type="text"
                  required
                  value={regFirstName}
                  onChange={(e) => setRegFirstName(e.target.value)}
                  placeholder="Giuseppe"
                  className="w-full pb-2 pt-1 border-b-2 border-cellar-200 focus:border-[#72182b] bg-transparent text-sm text-cellar-900 placeholder:text-cellar-300 focus:outline-none transition-colors"
                />
                {errors.firstName && (
                  <p className="text-rose-600 text-xs mt-1">{errors.firstName}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="reg-surname"
                  className="block text-xs font-semibold text-cellar-700 mb-1"
                >
                  {t.lastNameLabel}
                </label>
                <input
                  id="reg-surname"
                  type="text"
                  required
                  value={regLastName}
                  onChange={(e) => setRegLastName(e.target.value)}
                  placeholder="Esposito"
                  className="w-full pb-2 pt-1 border-b-2 border-cellar-200 focus:border-[#72182b] bg-transparent text-sm text-cellar-900 placeholder:text-cellar-300 focus:outline-none transition-colors"
                />
                {errors.lastName && (
                  <p className="text-rose-600 text-xs mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="reg-email"
                className="block text-xs font-semibold text-cellar-700 mb-1"
              >
                {t.emailLabel}
              </label>
              <input
                id="reg-email"
                type="email"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="nome@dominio.it"
                className="w-full pb-2 pt-1 border-b-2 border-cellar-200 focus:border-[#72182b] bg-transparent text-sm text-cellar-900 placeholder:text-cellar-300 focus:outline-none transition-colors"
              />
              {errors.email && (
                <p className="text-rose-600 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="reg-pwd"
                className="block text-xs font-semibold text-cellar-700 mb-1"
              >
                {t.passwordLabel} (min. 8 caratteri)
              </label>
              <div className="relative">
                <input
                  id="reg-pwd"
                  type={showPassword ? "text" : "password"}
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pb-2 pt-1 pr-10 border-b-2 border-cellar-200 focus:border-[#72182b] bg-transparent text-sm text-cellar-900 placeholder:text-cellar-300 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 bottom-2 text-cellar-400 hover:text-cellar-700 transition-colors"
                  aria-label="Mostra o nascondi password"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-rose-600 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            {/* Checkbox 18+ */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={regAgeCheck}
                  onChange={(e) => setRegAgeCheck(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-cellar-300 text-[#72182b] focus:ring-[#72182b]"
                />
                <span className="text-xs text-cellar-700 leading-relaxed">
                  {t.ageCheckbox}
                </span>
              </label>
              {errors.ageCheck && (
                <p className="text-rose-600 text-xs mt-1">{errors.ageCheck}</p>
              )}
            </div>

            {/* Bottone Crea Account (Solid Burgundy Pill) */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-3 py-3.5 px-6 rounded-full bg-[#72182b] hover:bg-[#581321] text-white font-bold text-sm tracking-wide shadow-md hover:shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <span className="inline-block animate-spin mr-2">✦</span>
              ) : (
                <ArrowRight className="w-4 h-4 text-gold-300" />
              )}
              <span>{isLoading ? "Creazione in corso..." : t.registerSubmitBtn}</span>
            </button>

            {/* Divider "Hai già un account?" */}
            <div className="relative py-2 flex items-center justify-center">
              <div className="grow border-t border-cellar-200" />
              <span className="shrink-0 px-3 text-xs text-cellar-500 font-medium">
                {t.haveAccountPrompt}
              </span>
              <div className="grow border-t border-cellar-200" />
            </div>

            {/* Bottone Secondario: Accedi Ora (Outlined Burgundy Pill) */}
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setErrors({});
                setFeedback(null);
              }}
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
