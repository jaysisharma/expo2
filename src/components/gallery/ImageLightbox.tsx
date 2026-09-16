"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { GalleryItem } from "@/lib/types";
import { X, ChevronLeft, ChevronRight, Download } from "lucide-react";

interface ImageLightboxProps {
  item: GalleryItem | null;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}

export default function ImageLightbox({
  item,
  onClose,
  onPrev,
  onNext,
}: ImageLightboxProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && onPrev) onPrev();
      if (e.key === "ArrowRight" && onNext) onNext();
    };
    if (item) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [item, onClose, onPrev, onNext]);

  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/95 backdrop-blur-md animate-fade-in">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Top Action Buttons */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-3 z-50">
        <a
          href={item.image}
          target="_blank"
          rel="noopener noreferrer"
          download
          className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          title="Open full resolution"
        >
          <Download className="w-5 h-5" />
        </a>
        <button
          onClick={onClose}
          className="p-3 rounded-full bg-white/10 hover:bg-red-500/80 text-white transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Prev Arrow */}
      {onPrev && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 p-3.5 rounded-full bg-white/10 hover:bg-white/25 text-white transition-all z-50 cursor-pointer"
          aria-label="Previous"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Next Arrow */}
      {onNext && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 p-3.5 rounded-full bg-white/10 hover:bg-white/25 text-white transition-all z-50 cursor-pointer"
          aria-label="Next"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Pure Center Image Box (Zero Text) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="relative max-w-6xl w-full h-[85vh] flex items-center justify-center z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full h-full rounded-2xl overflow-hidden">
          <Image
            src={item.image}
            alt="Gallery Full Image"
            fill
            unoptimized
            className="object-contain"
          />
        </div>
      </motion.div>
    </div>
  );
}
