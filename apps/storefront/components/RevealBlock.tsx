"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Pause, Play } from "lucide-react";

interface RevealImage {
  src: string;
  alt: string;
}

interface RevealBlockProps {
  /** One photo, or several for a cross-fading slider (every 5 s, with a pause button). */
  images: RevealImage[];
  /** "split": photo and text side by side (default). "stacked": photo above the text (cards). */
  layout?: "split" | "stacked";
  /** Split layout only: photo on the left (zig-zag "reversed"). By default the photo is on the right. */
  reversed?: boolean;
  /** Curtain color: MUST match the background around the photo, otherwise it shows as a moving box. */
  curtainColor: string;
  /** Link in the side strip that slides in over the photo. */
  overlayLink?: { href: string; label: string };
  /** Slider button labels (i18n), required when there is more than one photo. */
  sliderLabels?: { pause: string; play: string };
  /** Text column. Elements with the `text-reveal` class enter with the 3D effect. */
  children: ReactNode;
  className?: string;
  mediaClassName?: string;
  contentClassName?: string;
  sizes?: string;
  id?: string;
  /** Split layout: the photo fills its half at full height (50/50 sections) instead of a centered frame. */
  fullBleed?: boolean;
}

const SLIDE_INTERVAL_MS = 5000;

/**
 * Image + text block with the "dynamic reveal" effect (ADR 046): fade-in, a curtain sliding off
 * the photo, text entering with a slight 3D rotation, and on hover a slow zoom with a side strip
 * carrying a link. Plain IntersectionObserver, no library. Plays when the page loads (blocks already on
 * screen) and again every time a block comes back into view.
 *
 * The block is rendered "armed" (hidden) on the server so there is no flash. Safety nets: a
 * <noscript> style in the root layout shows everything without JavaScript, a CSS fail-safe shows it
 * if hydration never happens, and prefers-reduced-motion disables the effect entirely.
 */
export function RevealBlock({
  images,
  layout = "split",
  reversed = false,
  curtainColor,
  overlayLink,
  sliderLabels,
  children,
  className = "",
  mediaClassName = "",
  contentClassName = "",
  sizes = "(min-width: 1024px) 448px, 90vw",
  id,
  fullBleed = false,
}: RevealBlockProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"armed" | "active">("armed");
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hoverPaused, setHoverPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const isSlider = images.length > 1;

  // Activation: immediately if already on screen, otherwise when the top edge enters the viewport.
  useEffect(() => {
    document.documentElement.dataset.revealReady = "true"; // disables the CSS fail-safe
    const el = ref.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!el || reduce || typeof IntersectionObserver === "undefined") {
      // Reduced motion or no observer: show it, no animation.
      const frame = requestAnimationFrame(() => {
        if (reduce) setReducedMotion(true);
        setState("active");
      });
      return () => cancelAnimationFrame(frame);
    }
    // Replays every time the block comes back into view (ADR 047): re-armed when fully out of view.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setState("active");
          else setState("armed");
        }
      },
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Slider: next photo every 5 s, stopped by the pause button, by hover/focus and by reduced motion.
  useEffect(() => {
    if (!isSlider || reducedMotion || paused || hoverPaused || state !== "active") return;
    const timer = setInterval(() => setCurrent((i) => (i + 1) % images.length), SLIDE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [isSlider, reducedMotion, paused, hoverPaused, state, images.length]);

  const split = layout === "split";

  return (
    <div
      id={id}
      ref={ref}
      data-state={state}
      data-reversed={reversed ? "true" : undefined}
      style={{ ["--reveal-bg" as string]: curtainColor }}
      className={`reveal-block ${split ? `grid lg:grid-cols-2 ${fullBleed ? "items-stretch" : "items-center"}` : "flex flex-col"} ${className}`}
    >
      <div
        className={`reveal-block__media relative overflow-hidden ${split ? (reversed ? "lg:order-first" : "lg:order-last") : "order-first"} ${mediaClassName}`}
        onMouseEnter={() => setHoverPaused(true)}
        onMouseLeave={() => setHoverPaused(false)}
        onFocus={() => setHoverPaused(true)}
        onBlur={() => setHoverPaused(false)}
      >
        {images.map((img, index) => (
          <Image
            key={img.src}
            src={img.src}
            alt={img.alt}
            fill
            loading="lazy"
            sizes={sizes}
            aria-hidden={isSlider && index !== current ? true : undefined}
            className={`reveal-block__image object-cover ${
              isSlider ? (index === current ? "opacity-100" : "opacity-0") : ""
            }`}
          />
        ))}

        {overlayLink && (
          <Link href={overlayLink.href} className="reveal-block__overlay">
            <span className="reveal-block__overlay-label">
              <span aria-hidden="true" className="reveal-block__overlay-plus">+</span>
              {overlayLink.label}
            </span>
          </Link>
        )}

        {isSlider && sliderLabels && !reducedMotion && (
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? sliderLabels.play : sliderLabels.pause}
            aria-pressed={paused}
            className={`absolute bottom-4 ${reversed ? "right-4" : "left-4"} z-[3] flex h-9 w-9 items-center justify-center rounded-full border border-white/70 bg-black/40 text-white hover:bg-black/70 transition-colors`}
          >
            {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
          </button>
        )}
      </div>

      <div className={`reveal-block__content ${fullBleed ? "self-center" : ""} ${contentClassName}`}>{children}</div>
    </div>
  );
}
