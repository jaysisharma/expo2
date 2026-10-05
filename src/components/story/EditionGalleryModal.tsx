"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Download, Images, Sparkles } from "lucide-react";

interface EditionGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  year: string;
  title: string;
  edition: string;
  images: string[];
}

export default function EditionGalleryModal({
  isOpen,
  onClose,
  year,
  title,
  edition,
  images,
}: EditionGalleryModalProps) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (activeIdx !== null) {
          setActiveIdx(null);
        } else {
          onClose();
        }
      }
      if (activeIdx !== null) {
        if (e.key === "ArrowLeft") {
          setActiveIdx((prev) => (prev !== null && prev > 0 ? prev - 1 : images.length - 1));
        }
        if (e.key === "ArrowRight") {
          setActiveIdx((prev) => (prev !== null && prev < images.length - 1 ? prev + 1 : 0));
        }
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
      setActiveIdx(null);
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, activeIdx, images.length, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Click outside to close main modal */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Modal Container */}
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col z-10 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between gap-4 bg-slate-50/60 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[#007A5E] font-mono text-[10px] font-bold tracking-wider uppercase">
                {edition}
              </span>
              <span className="text-xs text-slate-400 font-mono font-semibold">
                · {images.length} Archival Photos
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>{title}</span>
              <span className="text-emerald-600 font-mono text-lg">({year})</span>
            </h3>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Photo Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 overscroll-contain">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {images.map((imgSrc, idx) => (
              <div
                key={idx}
                onClick={() => setActiveIdx(idx)}
                className="group relative aspect-4/3 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 hover:border-emerald-500 shadow-2xs hover:shadow-lg transition-all duration-300 cursor-pointer"
              >
                <Image
                  src={imgSrc}
                  alt={`${year} Edition Photo ${idx + 1}`}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5">
                  <span className="text-[10px] text-white font-mono font-semibold">
                    View Photo #{idx + 1}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span className="font-mono">
            Himalayan Green Energy Expo · Official Photo Archive {year}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>

      {/* ── Lightbox for Single Photo Fullscreen ── */}
      {activeIdx !== null && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-6 bg-black/95 backdrop-blur-md animate-in fade-in duration-200">
          {/* Click backdrop to exit lightbox */}
          <div className="absolute inset-0" onClick={() => setActiveIdx(null)} />

          {/* Top Bar */}
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-2 z-50">
            <a
              href={images[activeIdx]}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="Open full resolution"
            >
              <Download className="w-5 h-5" />
            </a>
            <button
              onClick={() => setActiveIdx(null)}
              className="p-3 rounded-full bg-white/10 hover:bg-red-500/80 text-white transition-colors cursor-pointer"
              aria-label="Close Lightbox"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Prev Arrow */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveIdx((prev) => (prev !== null && prev > 0 ? prev - 1 : images.length - 1));
            }}
            className="absolute left-3 sm:left-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer z-50"
            aria-label="Previous photo"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Full Photo */}
          <div className="relative max-w-5xl max-h-[85vh] w-full h-[75vh] flex items-center justify-center z-10 pointer-events-none">
            <Image
              src={images[activeIdx]}
              alt={`${year} Photo Full`}
              fill
              priority
              className="object-contain pointer-events-auto"
            />
          </div>

          {/* Next Arrow */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveIdx((prev) => (prev !== null && prev < images.length - 1 ? prev + 1 : 0));
            }}
            className="absolute right-3 sm:right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer z-50"
            aria-label="Next photo"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Bottom Caption Pill */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-xs font-mono z-50">
            {year} Edition · Photo {activeIdx + 1} of {images.length}
          </div>
        </div>
      )}
    </div>
  );
}
