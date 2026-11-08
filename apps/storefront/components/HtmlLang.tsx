"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

/**
 * The root layout cannot read `?lang=`, so <html lang> is rendered as "it". This keeps it in sync
 * with the page language on the client (screen readers, browser translation) (ADR 049).
 */
export function HtmlLang() {
  const lang = useSearchParams().get("lang") === "en" ? "en" : "it";
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  return null;
}
