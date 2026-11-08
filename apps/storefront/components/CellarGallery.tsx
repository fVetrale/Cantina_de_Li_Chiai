"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Sparkles,
  Camera,
  Layers,
} from "lucide-react";
import type { getDictionary } from "@/lib/i18n";

interface CellarGalleryProps {
  dict: ReturnType<typeof getDictionary>;
}

export function CellarGallery({ dict }: CellarGalleryProps) {
  const gallery = dict.estatePage.gallery;
  const items = gallery.items;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const thumbnailTrackRef = useRef<HTMLDivElement>(null);

  const currentItem = items[currentIndex] || items[0];

  const scrollActiveThumbnailIntoView = useCallback((index: number) => {
    if (!thumbnailTrackRef.current) return;
    const track = thumbnailTrackRef.current;
    const child = track.children[index] as HTMLElement | undefined;
    if (child) {
      child.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, []);

  const goToIndex = useCallback(
    (index: number) => {
      const targetIndex = (index + items.length) % items.length;
      setCurrentIndex(targetIndex);
      scrollActiveThumbnailIntoView(targetIndex);
    },
    [items.length, scrollActiveThumbnailIntoView]
  );

  const goToNext = useCallback(() => {
    goToIndex(currentIndex + 1);
  }, [currentIndex, goToIndex]);

  const goToPrev = useCallback(() => {
    goToIndex(currentIndex - 1);
  }, [currentIndex, goToIndex]);

  // Keyboard navigation (arrows and escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxOpen) {
        if (e.key === "Escape") setLightboxOpen(false);
        if (e.key === "ArrowRight") goToNext();
        if (e.key === "ArrowLeft") goToPrev();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, goToNext, goToPrev]);

  const scrollThumbnailsTrack = (direction: "left" | "right") => {
    if (!thumbnailTrackRef.current) return;
    const offset = direction === "left" ? -320 : 320;
    thumbnailTrackRef.current.scrollBy({ left: offset, behavior: "smooth" });
  };

  return (
    <section
      id="galleria"
      aria-label={gallery.title}
      className="space-y-6 pt-4"
    >
      {/* 1. Header Section */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-wine-950/10 border border-gold-500/30 text-wine-900 text-xs font-semibold tracking-widest uppercase shadow-sm">
          <Camera className="w-3.5 h-3.5 text-gold-600" />
          <span>{gallery.badge}</span>
        </div>

        <h2 className="font-serif text-2xl sm:text-4xl font-bold text-wine-950 tracking-tight">
          {gallery.title}
        </h2>

        <p className="text-xs sm:text-sm text-cellar-700 font-light leading-relaxed">
          {gallery.subtitle}
        </p>
      </div>

      {/* 2. Main Cinematic Active Showcase Frame */}
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] md:aspect-[16/9] overflow-hidden shadow-2xl border border-gold-500/30 bg-black group select-none">
        {/* Active High-Res Image with smooth zoom on hover */}
        <Image
          src={currentItem.image}
          alt={currentItem.title}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 896px"
          className="object-cover object-center transition-all duration-700 ease-out group-hover:scale-105"
        />

        {/* Ambient Darkened Gradient Overlays for High Legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-black/20 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent pointer-events-none" />

        {/* Top Badges Bar */}
        <div className="absolute top-4 left-4 right-4 sm:top-6 sm:left-6 sm:right-6 flex items-center justify-between z-10 pointer-events-auto">
          {/* Category Chip */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-wine-950/85 backdrop-blur-md border border-gold-400/40 text-gold-200 text-[11px] sm:text-xs font-semibold uppercase tracking-wider shadow-md">
            <Layers className="w-3 h-3 text-gold-400" />
            <span>{currentItem.category}</span>
          </div>

          {/* Right Action: Counter + Fullscreen Lightbox Button */}
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-ivory-200 text-xs font-mono tracking-wider shadow-sm">
              {gallery.counterLabel} {currentIndex + 1} {gallery.ofLabel}{" "}
              {items.length}
            </span>
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              aria-label={gallery.openLightbox}
              className="p-2 rounded-full bg-wine-950/85 hover:bg-wine-800 border border-gold-400/40 text-gold-200 backdrop-blur-md transition-all duration-200 hover:scale-110 active:scale-95 shadow-md"
              title={gallery.openLightbox}
            >
              <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold-300" />
            </button>
          </div>
        </div>

        {/* Floating Side Arrow Navigation Buttons */}
        <button
          type="button"
          onClick={goToPrev}
          aria-label={gallery.prevButton}
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-wine-950/80 hover:bg-wine-800 border border-gold-400/40 text-gold-200 flex items-center justify-center backdrop-blur-md shadow-2xl transition-all duration-200 hover:scale-110 active:scale-95"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gold-300" />
        </button>

        <button
          type="button"
          onClick={goToNext}
          aria-label={gallery.nextButton}
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-wine-950/80 hover:bg-wine-800 border border-gold-400/40 text-gold-200 flex items-center justify-center backdrop-blur-md shadow-2xl transition-all duration-200 hover:scale-110 active:scale-95"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gold-300" />
        </button>

        {/* Bottom Cinematic Story Caption Overlay */}
        <div
          onClick={() => setLightboxOpen(true)}
          className="absolute bottom-0 inset-x-0 p-4 sm:p-6 lg:p-8 z-10 text-white cursor-pointer group/caption"
        >
          <div className="space-y-1 sm:space-y-2 max-w-2xl">
            <span className="text-gold-300 text-xs sm:text-sm font-semibold tracking-wide block">
              {currentItem.subtitle}
            </span>
            <h3 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-white drop-shadow-md group-hover/caption:text-gold-200 transition-colors">
              {currentItem.title}
            </h3>
            <p className="text-xs sm:text-sm text-ivory-200/90 font-light leading-relaxed line-clamp-2 sm:line-clamp-3 drop-shadow">
              {currentItem.description}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Horizontal Sliding Thumbnail Track (Galleria Scorrevole) */}
      <div className="relative group/track pt-2">
        {/* Track Header & View Action */}
        <div className="flex items-center justify-between px-1 mb-2">
          <span className="text-xs font-semibold text-gold-700 uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-gold-600" />
            <span>{gallery.viewAll}</span>
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => scrollThumbnailsTrack("left")}
              aria-label={gallery.prevButton}
              className="p-1.5 rounded-full bg-white hover:bg-ivory-100 border border-ivory-300 text-cellar-800 transition-colors shadow-xs active:scale-95"
            >
              <ChevronLeft className="w-4 h-4 text-wine-900" />
            </button>
            <button
              type="button"
              onClick={() => scrollThumbnailsTrack("right")}
              aria-label={gallery.nextButton}
              className="p-1.5 rounded-full bg-white hover:bg-ivory-100 border border-ivory-300 text-cellar-800 transition-colors shadow-xs active:scale-95"
            >
              <ChevronRight className="w-4 h-4 text-wine-900" />
            </button>
          </div>
        </div>

        {/* Scrollable Container with Snap & Custom Scrollbar */}
        <div
          ref={thumbnailTrackRef}
          className="flex gap-3 sm:gap-4 overflow-x-auto pb-3 pt-1 px-1 snap-x scroll-smooth no-scrollbar"
          style={{ scrollbarWidth: "none" }}
        >
          {items.map((item, idx) => {
            const isActive = idx === currentIndex;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => goToIndex(idx)}
                aria-label={`${item.title} (${idx + 1}/${items.length})`}
                className={`relative shrink-0 w-32 sm:w-44 aspect-[4/3] overflow-hidden snap-center transition-all duration-300 text-left group ${
                  isActive
                    ? "ring-2 ring-gold-500 border-2 border-gold-400 scale-[1.03] shadow-lg"
                    : "border border-ivory-300/80 opacity-75 hover:opacity-100 hover:border-gold-400/60 shadow-sm"
                }`}
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 128px, 176px"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Bottom Title Bar on Thumbnail */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-2 sm:p-2.5 text-white">
                  <span className="text-[10px] text-gold-300 font-mono font-medium block">
                    {String(idx + 1).padStart(2, "0")} • {item.category}
                  </span>
                  <span className="text-[11px] sm:text-xs font-semibold text-white truncate leading-tight mt-0.5">
                    {item.title}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Fullscreen Lightbox Modal */}
      {lightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={currentItem.title}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-8 animate-in fade-in duration-200"
        >
          {/* Lightbox Top Bar */}
          <div className="flex items-center justify-between text-white z-10 max-w-6xl mx-auto w-full">
            <div className="space-y-0.5">
              <span className="text-gold-300 text-xs uppercase tracking-widest font-semibold block">
                {currentItem.category} • {gallery.counterLabel}{" "}
                {currentIndex + 1} {gallery.ofLabel} {items.length}
              </span>
              <h4 className="font-serif text-lg sm:text-xl font-bold text-white">
                {currentItem.title}
              </h4>
            </div>

            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              aria-label={gallery.closeLightbox}
              className="p-2 sm:p-3 rounded-full bg-white/10 hover:bg-gold-500 hover:text-black text-ivory-100 border border-white/20 transition-all duration-200 hover:scale-110 active:scale-95"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Lightbox Main Image Area with Left/Right Arrows */}
          <div className="relative flex-grow flex items-center justify-center my-4 max-w-6xl mx-auto w-full h-[60vh] sm:h-[68vh]">
            <Image
              src={currentItem.image}
              alt={currentItem.title}
              fill
              priority
              sizes="100vw"
              className="object-contain"
            />

            {/* Prev / Next buttons in Lightbox */}
            <button
              type="button"
              onClick={goToPrev}
              aria-label={gallery.prevButton}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 p-3 sm:p-4 rounded-full bg-wine-950/80 hover:bg-wine-800 border border-gold-400/40 text-gold-200 backdrop-blur-md shadow-2xl transition-all duration-200 hover:scale-110 active:scale-95"
            >
              <ChevronLeft className="w-6 h-6 text-gold-300" />
            </button>

            <button
              type="button"
              onClick={goToNext}
              aria-label={gallery.nextButton}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 p-3 sm:p-4 rounded-full bg-wine-950/80 hover:bg-wine-800 border border-gold-400/40 text-gold-200 backdrop-blur-md shadow-2xl transition-all duration-200 hover:scale-110 active:scale-95"
            >
              <ChevronRight className="w-6 h-6 text-gold-300" />
            </button>
          </div>

          {/* Lightbox Bottom Story Box */}
          <div className="max-w-2xl mx-auto w-full z-10 text-center bg-wine-950/80 border border-gold-500/25 p-4 sm:p-5 backdrop-blur-md shadow-xl text-white space-y-1.5">
            <span className="text-xs text-gold-300 font-semibold block">
              {currentItem.subtitle}
            </span>
            <p className="text-xs sm:text-sm text-ivory-200/90 font-light leading-relaxed">
              {currentItem.description}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
