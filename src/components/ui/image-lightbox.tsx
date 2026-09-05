"use client";

import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import {
  X,
  ExternalLink,
  Download,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export interface ImageLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  src?: string;
  images?: string[];
  initialIndex?: number;
  alt?: string;
  author?: {
    name?: string | null;
    username: string;
    photo?: string | null;
  };
  time?: string;
}

export default function ImageLightbox({
  isOpen,
  onClose,
  src,
  images,
  initialIndex = 0,
  alt = "Post image preview",
  author,
  time,
}: ImageLightboxProps) {
  const [mounted, setMounted] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  // Normalize image list
  const allImages = images && images.length > 0 ? images : src ? [src] : [];
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync index when opening
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(Math.min(initialIndex, Math.max(0, allImages.length - 1)));
      setIsZoomed(false);
    }
  }, [isOpen, initialIndex, allImages.length]);

  const activeSrc = allImages[currentIndex] || src || "";

  const handlePrev = useCallback(() => {
    if (allImages.length <= 1) return;
    setIsZoomed(false);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
  }, [allImages.length]);

  const handleNext = useCallback(() => {
    if (allImages.length <= 1) return;
    setIsZoomed(false);
    setCurrentIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
  }, [allImages.length]);

  // Handle keyboard keys (ESC, ArrowLeft, ArrowRight)
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      }
    },
    [onClose, handlePrev, handleNext]
  );

  useEffect(() => {
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown, true);
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      return () => {
        window.removeEventListener("keydown", handleKeyDown, true);
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen, handleKeyDown]);

  if (!mounted || !activeSrc) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center select-none"
        >
          {/* Backdrop */}
          <motion.div
            key="lightbox-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="absolute inset-0 bg-black/92 backdrop-blur-xl cursor-zoom-out"
          />

          {/* Top Floating Control Bar */}
          <motion.div
            key="lightbox-header"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="absolute top-0 inset-x-0 z-20 px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2 bg-gradient-to-b from-black/85 via-black/45 to-transparent pointer-events-none"
          >
            {/* Author pill (if provided) */}
            <div className="pointer-events-auto flex items-center gap-2 min-w-0 flex-1">
              {author && (
                <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-2.5 sm:px-3 py-1.5 rounded-full border border-white/15 min-w-0">
                  <div className="relative w-6 h-6 rounded-full overflow-hidden border border-white/20 shrink-0">
                    <Image
                      src={author.photo || "/user-placeholder.png"}
                      alt={author.name || author.username}
                      fill
                      sizes="24px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-white min-w-0 whitespace-nowrap">
                    <span className="font-medium truncate">
                      {author.name || author.username}
                    </span>
                    <span className="hidden sm:inline text-white/60 text-[11px] shrink-0">
                      @{author.username}
                    </span>
                    {time && (
                      <>
                        <span className="hidden md:inline text-white/40 shrink-0">·</span>
                        <span className="hidden md:inline text-white/60 text-[11px] shrink-0">
                          {time}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Multi-image counter badge */}
              {allImages.length > 1 && (
                <div className="bg-black/50 backdrop-blur-md text-white/90 px-2.5 py-1 rounded-full border border-white/15 text-xs font-mono shrink-0">
                  {currentIndex + 1} / {allImages.length}
                </div>
              )}
            </div>

            {/* Action Tools */}
            <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Zoom toggle button */}
              <button
                type="button"
                onClick={() => setIsZoomed((prev) => !prev)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white/90 flex items-center justify-center transition-[color,background-color,border-color,transform] cursor-pointer border border-white/10"
                title={isZoomed ? "Zoom out" : "Zoom in"}
                aria-label={isZoomed ? "Zoom out" : "Zoom in"}
              >
                {isZoomed ? (
                  <ZoomOut className="w-4 h-4" />
                ) : (
                  <ZoomIn className="w-4 h-4" />
                )}
              </button>

              {/* Open in new tab */}
              <a
                href={activeSrc}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white/90 flex items-center justify-center transition-[color,background-color,border-color,transform] cursor-pointer border border-white/10"
                title="Open original in new tab"
                aria-label="Open original in new tab"
              >
                <ExternalLink className="w-4 h-4" />
              </a>

              {/* Download original */}
              <a
                href={activeSrc}
                download={`vibee-image-${currentIndex + 1}.jpg`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white/90 flex items-center justify-center transition-[color,background-color,border-color,transform] cursor-pointer border border-white/10"
                title="Download image"
                aria-label="Download image"
              >
                <Download className="w-4 h-4" />
              </a>

              {/* Close button with Esc indicator */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="flex items-center gap-1.5 h-9 px-2.5 sm:px-3 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 text-white justify-center transition-[color,background-color,border-color,transform] cursor-pointer border border-white/15 shrink-0"
                title="Close (Esc)"
                aria-label="Close image viewer"
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline-block text-[11px] font-mono text-white/70">
                  Esc
                </span>
              </button>
            </div>
          </motion.div>

          {/* Left Arrow Navigation Button */}
          {allImages.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3 rounded-full bg-black/60 hover:bg-black/85 text-white/90 hover:text-white backdrop-blur-md border border-white/15 transition-[color,background-color,border-color,transform] active:scale-95 cursor-pointer"
              title="Previous image (Left arrow)"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}

          {/* Right Arrow Navigation Button */}
          {allImages.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3 rounded-full bg-black/60 hover:bg-black/85 text-white/90 hover:text-white backdrop-blur-md border border-white/15 transition-[color,background-color,border-color,transform] active:scale-95 cursor-pointer"
              title="Next image (Right arrow)"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}

          {/* Central Image Canvas with AnimatePresence for Smooth Sliding */}
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                onClose();
              }
            }}
            className="relative z-10 w-full h-full flex items-center justify-center p-4 sm:p-8 overflow-auto"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSrc}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{
                  opacity: 1,
                  scale: isZoomed ? 1.4 : 1,
                }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{
                  duration: 0.18,
                  ease: "easeOut",
                }}
                className={`relative max-w-full max-h-full flex items-center justify-center transition-[transform] duration-200 ease-out ${
                  isZoomed ? "cursor-zoom-out my-auto" : "cursor-zoom-in"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsZoomed((prev) => !prev);
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeSrc}
                  alt={`${alt} ${allImages.length > 1 ? `(${currentIndex + 1}/${allImages.length})` : ""}`}
                  className="max-h-[78vh] max-w-[88vw] w-auto h-auto object-contain rounded-xl ring-1 ring-white/10"
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom Thumbnails & Zoom Cue Bar */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-4 inset-x-4 flex flex-col items-center gap-2 z-20 pointer-events-none"
          >
            {/* Multi-image Thumbnail Strip */}
            {allImages.length > 1 && (
              <div className="pointer-events-auto flex items-center gap-2 p-1.5 rounded-2xl bg-black/60 backdrop-blur-md border border-white/15 max-w-full overflow-x-auto subtle-scrollbar">
                {allImages.map((img, idx) => (
                  <button
                    key={img + idx}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsZoomed(false);
                      setCurrentIndex(idx);
                    }}
                    className={`relative w-12 h-12 rounded-xl overflow-hidden border transition-[opacity,transform,border-color] cursor-pointer shrink-0 ${
                      idx === currentIndex
                        ? "border-primary ring-2 ring-primary/40 scale-105"
                        : "border-white/20 opacity-60 hover:opacity-100"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* The hint has to match the input device: a phone has no Esc key
                and no arrow keys, so the pointer-coarse copy drops both. */}
            <span className="max-w-full text-center text-[11px] font-medium text-white/60 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
              <span className="[@media(pointer:coarse)]:hidden">
                {isZoomed
                  ? "Click image to zoom out"
                  : allImages.length > 1
                  ? "← / → to navigate · Click image to zoom in · Esc to close"
                  : "Click image to zoom in · Click outside to close"}
              </span>
              <span className="hidden [@media(pointer:coarse)]:inline">
                {isZoomed
                  ? "Tap image to zoom out"
                  : "Tap image to zoom · Tap outside to close"}
              </span>
            </span>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
