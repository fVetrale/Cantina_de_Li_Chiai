"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Gentle fade-in when a block scrolls into view (ADR 045). Plain IntersectionObserver, no
 * library. Server-rendered content is visible; it is hidden only after hydration and only if
 * it is still below the fold, so nothing disappears without JavaScript or with reduced motion.
 */
export function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"idle" | "pending" | "shown">("idle");

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return; // already on screen
    setState("pending");
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setState("shown");
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const stateClass = state === "pending" ? "reveal-pending" : state === "shown" ? "reveal-shown" : "";
  return (
    <div ref={ref} className={`${stateClass} ${className}`}>
      {children}
    </div>
  );
}
