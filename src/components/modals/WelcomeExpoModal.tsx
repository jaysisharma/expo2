"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Calendar, ArrowRight, Sparkles } from "lucide-react";

export default function WelcomeExpoModal() {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      const dismissed = sessionStorage.getItem("expo_welcome_modal_dismissed");
      if (!dismissed) {
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 2400);
        return () => clearTimeout(timer);
      }
    } catch {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 2400);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    try {
      sessionStorage.setItem("expo_welcome_modal_dismissed", "true");
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          {/* Light translucent backdrop so hero section stays visible */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
          />

          {/* Green Color Background Card with Rounded Styling */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative w-full max-w-lg bg-gradient-to-b from-[#065F46] via-[#044E3B] to-[#022C22] border border-[#34D399]/30 shadow-[0_20px_60px_rgba(0,0,0,0.6)] rounded-3xl overflow-hidden text-white z-10 text-center"
          >
            {/* Top Visual Banner from Official Press Meet Creative */}
            <div className="relative w-full aspect-[21/9] sm:aspect-[2/1] overflow-hidden border-b border-white/15">
              <Image
                src="/images/press_meet.jpeg"
                alt="Himalayan Green Energy Expo 2027 Official Announcement"
                fill
                priority
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#065F46] via-[#065F46]/30 to-transparent" />
              
              {/* Close Button on top right of banner */}
              <button
                onClick={handleClose}
                aria-label="Close"
                className="absolute top-3 right-3 text-white bg-black/50 hover:bg-black/80 p-1.5 cursor-pointer transition-colors rounded-full backdrop-blur-md z-20"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Top Left Badge */}
              <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-[#10B981] text-slate-950 font-mono text-[10px] font-black uppercase tracking-wider shadow-md">
                5TH EDITION · 2027
              </div>
            </div>

            <div className="p-6 sm:p-7 space-y-4">
              {/* 5th Edition Badge & Main Title */}
              <div className="space-y-1.5">
                <h2 className="font-sans font-black text-xl sm:text-2xl text-white tracking-tight leading-tight drop-shadow-sm">
                  Himalayan Green Energy Expo 2027
                </h2>

                <p className="text-xs font-mono font-bold text-[#34D399] tracking-wide">
                  &ldquo;Resilient Energy, Prosperous Nepal&rdquo;
                </p>

                {/* Location well just below the title with location icon (no bg pill) */}
                <div className="pt-1 flex items-center justify-center gap-1.5 text-xs font-mono text-emerald-100">
                  <MapPin className="w-4 h-4 text-[#34D399] shrink-0" />
                  <span className="font-medium text-white">
                    Bhrikutimandap Exhibition Complex, Kathmandu
                  </span>
                </div>

                <div className="flex items-center justify-center gap-1.5 text-xs font-mono text-[#38BDF8] font-bold">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>17–19 January 2027 · Magh 3–5, 2083</span>
                </div>
              </div>

              {/* Short & Sweet Inviting Description */}
              <p className="text-xs text-emerald-50/90 font-normal leading-relaxed max-w-md mx-auto">
                South Asia&apos;s flagship clean energy summit connecting developers, turbine OEMs, solar, EV, and green hydrogen leaders.
              </p>

            {/* Action Buttons with rounded-full matching Navbar CTA */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <Link
                href="/register"
                onClick={handleClose}
                className="flex-1 flex items-center justify-center py-3 px-6 rounded-full bg-white hover:bg-emerald-50 text-black font-extrabold text-xs tracking-wider uppercase text-center transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98]"
              >
                <span className="text-black">Register as Visitor</span>
              </Link>

              <Link
                href="/book-stall"
                onClick={handleClose}
                className="flex-1 py-3 px-6 rounded-full bg-[#10B981] hover:bg-[#059669] text-slate-950 font-bold text-xs tracking-wider uppercase text-center transition-all shadow-lg border border-white/20 hover:scale-102 active:scale-98"
              >
                Register as Exhibitor
              </Link>
            </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
