"use client";

import { useRef, useState, type KeyboardEvent, type TouchEvent } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface WineHeroGalleryProps {
  images: string[];
  title: string;
  labels: { gallery: string; prev: string; next: string; photo: string };
}

/**
 * Bottle photo selector in the product hero (ADR 048): one large photo with a cross-fade, arrows,
 * thumbnails, swipe on touch screens and arrow keys when focused. No library, no lightbox.
 */
export function WineHeroGallery({ images, title, labels }: WineHeroGalleryProps) {
  const [current, setCurrent] = useState(0);
  const touchX = useRef<number | null>(null);
  const count = images.length;
  const go = (index: number) => setCurrent((index + count) % count);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(current - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      go(current + 1);
    }
  };
  const onTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    touchX.current = e.touches[0]?.clientX ?? null;
  };
  const onTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    if (touchX.current === null) return;
    const delta = (e.changedTouches[0]?.clientX ?? touchX.current) - touchX.current;
    if (Math.abs(delta) > 40) go(current + (delta < 0 ? 1 : -1));
    touchX.current = null;
  };

  const photoLabel = (n: number) => labels.photo.replace("{n}", String(n)).replace("{total}", String(count));

  return (
    <div className="w-full">
      <div
        role="region"
        aria-roledescription="carousel"
        aria-label={`${labels.gallery}: ${title}`}
        tabIndex={count > 1 ? 0 : -1}
        onKeyDown={count > 1 ? onKeyDown : undefined}
        onTouchStart={count > 1 ? onTouchStart : undefined}
        onTouchEnd={count > 1 ? onTouchEnd : undefined}
        className="relative mx-auto aspect-[3/4] w-full max-w-[min(100%,calc((100svh-15rem)*0.75))] overflow-hidden bg-black/40 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.8)]"
      >
        {images.map((src, index) => (
          <Image
            key={src}
            src={src}
            alt={index === current ? `${title} — ${photoLabel(index + 1)}` : ""}
            aria-hidden={index !== current ? true : undefined}
            fill
            priority={index === 0}
            sizes="(min-width: 1024px) 40vw, 90vw"
            className={`object-cover transition-opacity duration-500 ease-out ${index === current ? "opacity-100" : "opacity-0"}`}
          />
        ))}
        <p className="sr-only" aria-live="polite">
          {photoLabel(current + 1)}
        </p>

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(current - 1)}
              aria-label={labels.prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full border border-white/60 bg-black/30 text-white hover:bg-black/60 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => go(current + 1)}
              aria-label={labels.next}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full border border-white/60 bg-black/30 text-white hover:bg-black/60 transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {count > 1 && (
        <ul className="mt-5 flex items-center justify-center gap-3">
          {images.map((src, index) => (
            <li key={src}>
              <button
                type="button"
                onClick={() => go(index)}
                aria-label={photoLabel(index + 1)}
                aria-current={index === current ? "true" : undefined}
                className={`relative block h-16 w-12 overflow-hidden border transition-colors duration-200 ${
                  index === current ? "border-gold-400" : "border-white/25 opacity-60 hover:opacity-100"
                }`}
              >
                <Image src={src} alt="" fill sizes="48px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
