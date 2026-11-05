"use client";

import { useState, useTransition } from "react";
import { login, register, type AuthActionError } from "@/lib/actions/auth";
import type { Dictionary } from "@/lib/i18n";

/**
 * Shared state and submit logic for the login / registration forms (AuthModal and
 * AccountAuthCard). Validation is authoritative on the server (ADR 040): the server returns
 * only field paths and a generic error code, and this hook maps them to i18n messages.
 */
export function useAuthForms(t: Dictionary["accountModal"], onSuccess?: () => void) {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const [invalidFields, setInvalidFields] = useState<Set<string>>(new Set());
  const [error, setError] = useState<AuthActionError | null>(null);
  const [isPending, startTransition] = useTransition();

  const reset = () => {
    setInvalidFields(new Set());
    setError(null);
  };

  const run = (action: () => ReturnType<typeof login>) => {
    reset();
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        // Clear secrets from memory as soon as they are no longer needed.
        setLoginPassword("");
        setRegPassword("");
        onSuccess?.();
        return;
      }
      setInvalidFields(new Set(result.fields ?? []));
      setError(result.error);
    });
  };

  const submitLogin = (e: React.FormEvent) => {
    e.preventDefault();
    run(() => login({ email: loginEmail.trim(), password: loginPassword }));
  };

  const submitRegister = (e: React.FormEvent) => {
    e.preventDefault();
    run(() =>
      register({
        firstName,
        lastName,
        email: regEmail.trim(),
        password: regPassword,
        ageConfirmed,
        privacyAccepted,
      })
    );
  };

  /** i18n message for an invalid field, or null. */
  const fieldError = (field: string, mode: "login" | "register"): string | null => {
    if (!invalidFields.has(field)) return null;
    switch (field) {
      case "email":
        return t.errorEmail;
      case "password":
        return mode === "register" ? t.errorPasswordLength : t.errorPassword;
      case "firstName":
        return t.errorFirstName;
      case "lastName":
        return t.errorLastName;
      case "ageConfirmed":
        return t.errorAgeCheck;
      case "privacyAccepted":
        return t.errorPrivacy;
      default:
        return null;
    }
  };

  const errorMessage =
    error === "invalid_credentials"
      ? t.errorInvalidCredentials
      : error === "rejected"
        ? t.errorRejected
        : error === "unavailable"
          ? t.errorUnavailable
          : null;

  return {
    login: { email: loginEmail, setEmail: setLoginEmail, password: loginPassword, setPassword: setLoginPassword },
    register: {
      firstName,
      setFirstName,
      lastName,
      setLastName,
      email: regEmail,
      setEmail: setRegEmail,
      password: regPassword,
      setPassword: setRegPassword,
      ageConfirmed,
      setAgeConfirmed,
      privacyAccepted,
      setPrivacyAccepted,
    },
    submitLogin,
    submitRegister,
    fieldError,
    errorMessage,
    isPending,
    reset,
  };
}
