"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Gentle fade-in of a block (ADR 045/046). Plain IntersectionObserver, no library. Plays on
 * load and again every time the block comes back into view. Rendered hidden on the server to avoid a
 * flash; the <noscript> style in app/layout.tsx, the CSS fail-safe and prefers-reduced-motion keep
 * the content visible when the animation cannot or should not run.
 */
export function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.revealReady = "true";
    const el = ref.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!el || reduce || typeof IntersectionObserver === "undefined") {
      const frame = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(frame);
    }
    // Replays every time the block comes back into view (ADR 047): re-armed when fully out of view.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setShown(true);
          else setShown(false);
        }
      },
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`${shown ? "reveal-shown" : "reveal-pending"} ${className}`}>
      {children}
    </div>
  );
}
