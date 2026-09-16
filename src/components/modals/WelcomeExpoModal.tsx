"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, FileDown, ArrowRight, Sparkles, Calendar, MapPin } from "lucide-react";

export default function WelcomeExpoModal() {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleLoaderComplete = () => {
      try {
        const dismissed = sessionStorage.getItem("expo_invitation_modal_dismissed");
        if (!dismissed) {
          setTimeout(() => {
            setIsOpen(true);
          }, 350);
        }
      } catch {
        setTimeout(() => {
          setIsOpen(true);
        }, 350);
      }
    };

    window.addEventListener("hydro-loader-complete", handleLoaderComplete);

    // Fallback timer if event is missed or already fired
    const fallbackTimer = setTimeout(() => {
      try {
        const dismissed = sessionStorage.getItem("expo_invitation_modal_dismissed");
        if (!dismissed) {
          setIsOpen(true);
        }
      } catch {
        setIsOpen(true);
      }
    }, 2000);

    return () => {
      window.removeEventListener("hydro-loader-complete", handleLoaderComplete);
      clearTimeout(fallbackTimer);
    };
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    try {
      sessionStorage.setItem("expo_invitation_modal_dismissed", "true");
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
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          {/* Dimmed luxury backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
          />

          {/* Invitation Card Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 25 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 25 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-lg sm:max-w-xl max-h-[92vh] flex flex-col bg-[#071F17] border border-amber-400/40 shadow-[0_25px_70px_rgba(0,0,0,0.8)] rounded-3xl overflow-hidden text-white z-10 my-auto"
          >
            {/* Header Ribbon */}
            <div className="px-5 py-3 bg-gradient-to-r from-amber-700 via-yellow-600 to-amber-700 text-slate-950 flex items-center justify-between border-b border-amber-300/30 shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span className="font-mono text-xs font-black uppercase tracking-wider">
                  OFFICIAL INVITATION · हार्दिक निमन्त्रणा
                </span>
              </div>

              {/* Close Button */}
              <button
                onClick={handleClose}
                aria-label="Close Invitation"
                className="w-7 h-7 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable / Visual Image Content */}
            <div className="p-4 sm:p-5 overflow-y-auto flex flex-col items-center space-y-4">
              {/* High-Resolution Invitation Image Card */}
              <div className="relative w-full max-w-sm sm:max-w-md aspect-[3/4.2] rounded-2xl overflow-hidden border-2 border-amber-400/30 shadow-2xl bg-white group">
                <Image
                  src="/images/invitation.jpeg"
                  alt="Official Invitation - Himalayan Green Energy Expo 2027 Press Meet"
                  fill
                  priority
                  className="object-contain object-top hover:scale-[1.02] transition-transform duration-500"
                />
              </div>

              {/* Quick Details Pill Bar */}
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">DATE & TIME</span>
                    <span className="text-white font-semibold">2083 Asoj 1 · 2:00 PM</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-[#34D399] shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">VENUE</span>
                    <span className="text-white font-semibold truncate">Hotel Royal Tulip, Gwarko</span>
                  </div>
                </div>
              </div>

              {/* Action CTAs */}
              <div className="w-full pt-1 flex flex-col sm:flex-row gap-2.5">
                <a
                  href="/images/invitation.jpeg"
                  download="Himalayan_Green_Energy_Expo_Invitation.jpeg"
                  className="flex-1 py-3 px-4 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-mono text-xs font-black uppercase tracking-wider inline-flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Download Card</span>
                </a>

                <Link
                  href="/register"
                  onClick={handleClose}
                  className="flex-1 py-3 px-4 rounded-full bg-[#10B981] hover:bg-[#059669] text-slate-950 font-mono text-xs font-black uppercase tracking-wider inline-flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98"
                >
                  <span>Register Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <button
                  onClick={handleClose}
                  className="sm:w-auto py-3 px-4 rounded-full bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-semibold tracking-wider transition-all border border-white/15 cursor-pointer"
                >
                  Enter Site
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

