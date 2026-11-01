"use client";

import { useState, useEffect, useCallback, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, Sparkles, Maximize2 } from "lucide-react";
import type { WineProduct } from "@/lib/data/products";

interface WineBottleGalleryProps {
  product: WineProduct;
}

const emptySubscribe = () => () => {};

export function WineBottleGallery({ product }: WineBottleGalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Hook idratazione sicuro per Next.js senza trigger di cascading render
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  // Blocca lo scroll del body quando il popup è aperto in primo piano
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  // Array di foto scorrevoli (supporta multiple immagini del prodotto)
  const images =
    product.images && product.images.length > 0
      ? product.images
      : [product.image];

  const handlePrev = useCallback(() => {
    setActiveIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const handleNext = useCallback(() => {
    setActiveIdx((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  // Gestione tastiera per scorrimento (frecce sinistra/destra ed Esc)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "Escape") {
        setIsModalOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlePrev, handleNext]);

  return (
    <div className="relative w-full">
      {/* 1. Main Studio Showcase Card */}
      <div className="relative rounded-3xl bg-white border border-ivory-200 shadow-sm p-6 sm:p-10 min-h-[500px] sm:min-h-[580px] flex flex-col items-center justify-center overflow-hidden">

        {/* Top Badges */}
        <div className="absolute top-5 left-5 z-10 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#521521] text-gold-200 border border-gold-400/30 shadow-sm">
            <Sparkles className="w-3 h-3 text-gold-300" />
            <span>{product.badge || "Edizione Limitata"}</span>
          </span>
        </div>

        {/* Top Right Expand Icon Button (In Primo Piano) */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          aria-label="Ingrandisci foto a tutto schermo"
          title="Visualizza in primo piano"
          className="absolute top-5 right-5 p-2 rounded-full bg-white/90 hover:bg-white border border-ivory-300 shadow-sm text-cellar-600 hover:text-[#521521] transition-all hover:scale-105 active:scale-95 z-20"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Carousel Navigation Arrow - Left */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Foto precedente"
            className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/95 hover:bg-white border border-ivory-300 shadow-md text-cellar-800 hover:text-[#521521] flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 z-20"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {/* Centered Bottle Image (Nessun ingrandimento al passaggio del mouse) */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setIsModalOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              setIsModalOpen(true);
            }
          }}
          aria-label="Clicca per aprire la foto in primo piano"
          className="relative z-10 w-full h-[390px] sm:h-[460px] max-w-sm flex items-center justify-center cursor-pointer select-none"
        >
          <Image
            src={images[activeIdx] || product.image}
            alt={`${product.title} - Foto ${activeIdx + 1} di ${images.length}`}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-contain drop-shadow-2xl"
          />
        </div>

        {/* Carousel Navigation Arrow - Right */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={handleNext}
            aria-label="Foto successiva"
            className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/95 hover:bg-white border border-ivory-300 shadow-md text-cellar-800 hover:text-[#521521] flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 z-20"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        {/* Miniature Thumbnails Strip (Foto scorrevoli e selezionabili) */}
        {images.length > 1 && (
          <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-2 z-10 px-4">
            {images.map((imgUrl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveIdx(idx)}
                aria-label={`Visualizza foto ${idx + 1}`}
                className={`relative w-11 h-11 rounded-xl overflow-hidden border-2 transition-all bg-white shadow-sm ${
                  activeIdx === idx
                    ? "border-[#72182b] ring-2 ring-[#72182b]/20 scale-105"
                    : "border-ivory-300 hover:border-ivory-400 opacity-70 hover:opacity-100"
                }`}
              >
                <Image
                  src={imgUrl}
                  alt={`Miniatura ${idx + 1}`}
                  fill
                  className="object-contain p-1"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. Modal ad Alta Risoluzione in Primo Piano (Teletrasportato su document.body con z-[9999] e sfondo 98% opaco) */}
      {isMounted &&
        isModalOpen &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-[9999] bg-[#080204]/98 backdrop-blur-3xl flex items-center justify-center p-3 sm:p-8 animate-fadeIn"
            onClick={() => setIsModalOpen(false)}
          >
            <div
              className="relative bg-white rounded-3xl p-5 sm:p-8 max-w-4xl w-full border border-gold-400/40 shadow-2xl space-y-5 text-cellar-900 z-10 max-h-[94vh] flex flex-col justify-between"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Bar with Title, Counter and Close Button */}
              <div className="flex items-center justify-between border-b border-ivory-200 pb-3">
                <div>
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#72182b] block">
                    Cantina de Li Chiai • Cilento DOC
                  </span>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-wine-950">
                    {product.title}
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  {images.length > 1 && (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-ivory-100 text-cellar-700">
                      Foto {activeIdx + 1} di {images.length}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 rounded-full text-cellar-600 hover:bg-ivory-100 hover:text-cellar-900 transition-colors"
                    aria-label="Chiudi visualizzazione in primo piano"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* High-Resolution Viewport with Lateral Arrows */}
              <div className="relative w-full h-[360px] sm:h-[480px] flex items-center justify-center bg-[#f9f8f5] rounded-2xl p-4 overflow-hidden">
                {/* Prev Button inside modal */}
                {images.length > 1 && (
                  <button
                    type="button"
                    onClick={handlePrev}
                    aria-label="Foto precedente"
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white border border-ivory-300 shadow-md text-cellar-800 hover:text-[#72182b] flex items-center justify-center transition-all z-20"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}

                <div className="relative w-full h-full flex items-center justify-center">
                  <Image
                    src={images[activeIdx] || product.image}
                    alt={`${product.title} vista ad alta risoluzione`}
                    fill
                    className="object-contain drop-shadow-xl select-none"
                  />
                </div>

                {/* Next Button inside modal */}
                {images.length > 1 && (
                  <button
                    type="button"
                    onClick={handleNext}
                    aria-label="Foto successiva"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white border border-ivory-300 shadow-md text-cellar-800 hover:text-[#72182b] flex items-center justify-center transition-all z-20"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Thumbnails Bar inside Modal */}
              {images.length > 1 && (
                <div className="flex items-center justify-center gap-2.5 pt-1 overflow-x-auto pb-1">
                  {images.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveIdx(idx)}
                      aria-label={`Visualizza foto ${idx + 1}`}
                      className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 transition-all bg-white shadow-sm shrink-0 ${
                        activeIdx === idx
                          ? "border-[#72182b] ring-2 ring-[#72182b]/20 scale-105"
                          : "border-ivory-300 hover:border-ivory-400 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <Image
                        src={imgUrl}
                        alt={`Miniatura ${idx + 1}`}
                        fill
                        className="object-contain p-1"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Footer Specs Pills */}
              <div className="grid grid-cols-2 gap-3 text-xs pt-1 border-t border-ivory-200">
                <div className="p-2.5 rounded-xl bg-ivory-50 border border-ivory-200">
                  <span className="text-cellar-500 block text-[10px] uppercase font-bold tracking-wider">
                    Uve Certificate
                  </span>
                  <span className="font-semibold text-cellar-900">
                    {product.details?.grapes || "100% Selezione Manuale"}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-ivory-50 border border-ivory-200">
                  <span className="text-cellar-500 block text-[10px] uppercase font-bold tracking-wider">
                    Suolo d&apos;Origine
                  </span>
                  <span className="font-semibold text-cellar-900">
                    Flysch Cilentano Arenaceo
                  </span>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
