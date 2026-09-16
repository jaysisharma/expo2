"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  FileDown,
  ArrowRight,
  Sparkles,
  Calendar,
  MapPin,
  Maximize2,
  Newspaper,
  Scroll,
  Zap,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export default function WelcomeExpoModal() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"invitation" | "banner">("invitation");
  const [isZoomed, setIsZoomed] = useState<boolean>(false);

  useEffect(() => {
    const handleLoaderComplete = () => {
      try {
        const dismissed = sessionStorage.getItem("expo_welcome_modal_dismissed");
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

    // Fallback timer if event is missed
    const fallbackTimer = setTimeout(() => {
      try {
        const dismissed = sessionStorage.getItem("expo_welcome_modal_dismissed");
        if (!dismissed) {
          setIsOpen(true);
        }
      } catch {
        setIsOpen(true);
      }
    }, 2200);

    return () => {
      window.removeEventListener("hydro-loader-complete", handleLoaderComplete);
      clearTimeout(fallbackTimer);
    };
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
      if (e.key === "Escape") {
        if (isZoomed) {
          setIsZoomed(false);
        } else if (isOpen) {
          handleClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isZoomed]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
          {/* Deep Luxurious Backdrop with Ambient Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-slate-950/85 backdrop-blur-md transition-opacity"
          />

          {/* Premium Modal Card Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 25 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 25 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-2xl bg-gradient-to-b from-[#062A1F] via-[#031912] to-[#010C08] border-2 border-emerald-400/40 shadow-[0_0_80px_rgba(16,185,129,0.25),0_30px_90px_rgba(0,0,0,0.95)] rounded-3xl overflow-hidden text-white z-10 my-auto flex flex-col max-h-[94vh]"
          >
            {/* Ambient Aurora Glow Circles */}
            <div className="absolute -top-28 -right-28 w-80 h-80 bg-gradient-to-br from-emerald-400/25 to-teal-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-28 -left-28 w-80 h-80 bg-gradient-to-tr from-amber-400/20 to-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Top Brand Banner & Navigation Bar */}
            <div className="relative px-5 py-3.5 border-b border-white/15 flex items-center justify-between gap-3 bg-black/40 backdrop-blur-md shrink-0">
              {/* Brand Lockup / Tag */}
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse shadow-[0_0_10px_#10B981]" />
                <span className="font-mono text-[11px] font-black tracking-widest text-[#34D399] uppercase">
                  HIMALAYAN GREEN ENERGY EXPO 2027
                </span>
              </div>

              {/* Close Button */}
              <button
                onClick={handleClose}
                aria-label="Close modal"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-red-500/30 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-white/15 hover:border-red-400/50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Glowing Tab Switcher */}
            <div className="px-5 pt-3 pb-1 flex items-center justify-center">
              <div className="inline-flex p-1 rounded-full bg-white/10 border border-white/15 backdrop-blur-md shadow-inner">
                <button
                  onClick={() => setActiveTab("invitation")}
                  className={`px-4 py-2 rounded-full text-xs font-mono font-bold tracking-wider transition-all inline-flex items-center gap-2 cursor-pointer ${
                    activeTab === "invitation"
                      ? "bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black shadow-[0_0_20px_rgba(251,191,36,0.5)] scale-[1.02]"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Scroll className="w-4 h-4" />
                  <span>OFFICIAL INVITATION (हार्दिक निमन्त्रणा)</span>
                </button>

                <button
                  onClick={() => setActiveTab("banner")}
                  className={`px-4 py-2 rounded-full text-xs font-mono font-bold tracking-wider transition-all inline-flex items-center gap-2 cursor-pointer ${
                    activeTab === "banner"
                      ? "bg-gradient-to-r from-[#10B981] via-[#059669] to-[#047857] text-white font-black shadow-[0_0_20px_rgba(16,185,129,0.5)] scale-[1.02]"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Newspaper className="w-4 h-4" />
                  <span>PRESS MEET CREATIVE</span>
                </button>
              </div>
            </div>

            {/* Scrollable Modal Content */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
              {/* TAB 1: OFFICIAL INVITATION (हार्दिक निमन्त्रणा) */}
              {activeTab === "invitation" && (
                <motion.div
                  key="tab-invitation"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4"
                >
                  {/* Invitation Card Frame */}
                  <div className="relative w-full max-w-sm sm:max-w-md mx-auto aspect-[3/4.2] rounded-2xl overflow-hidden border-2 border-amber-400/50 shadow-[0_15px_40px_rgba(0,0,0,0.8)] bg-white group">
                    <Image
                      src="/images/invitation.jpeg"
                      alt="Official Invitation - Himalayan Green Energy Expo 2027"
                      fill
                      priority
                      className="object-contain object-top transition-transform duration-500 group-hover:scale-[1.01]"
                    />

                    {/* Top Gold Badge */}
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-amber-400/40 text-amber-300 font-mono text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>IPPAN PRESIDENT INVITATION</span>
                    </div>

                    {/* Lightbox Zoom Trigger */}
                    <button
                      onClick={() => setIsZoomed(true)}
                      className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-black/75 hover:bg-black text-white font-mono text-[11px] font-bold backdrop-blur-md border border-white/20 inline-flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-105"
                    >
                      <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
                      <span>Full Resolution</span>
                    </button>
                  </div>

                  {/* Colored Information Grid with Rich Accents */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {/* Date Card */}
                    <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/15 via-yellow-500/10 to-transparent border border-amber-400/35 flex items-center gap-3.5 shadow-xs">
                      <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center shrink-0 shadow-inner">
                        <Calendar className="w-5 h-5 text-amber-300" />
                      </div>
                      <div>
                        <div className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider">
                          PROGRAM DATE & TIME
                        </div>
                        <div className="text-white font-bold text-sm">२०८३ असोज १ गते, २:०० बजे</div>
                        <div className="text-xs text-amber-200/70 font-mono">17–19 Jan 2027 Expo Launch</div>
                      </div>
                    </div>

                    {/* Venue Card */}
                    <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-transparent border border-emerald-400/35 flex items-center gap-3.5 shadow-xs">
                      <div className="w-10 h-10 rounded-xl bg-emerald-400/20 border border-emerald-400/40 flex items-center justify-center shrink-0 shadow-inner">
                        <MapPin className="w-5 h-5 text-[#34D399]" />
                      </div>
                      <div>
                        <div className="text-[10px] font-mono font-bold text-[#34D399] uppercase tracking-wider">
                          VENUE LOCATION
                        </div>
                        <div className="text-white font-bold text-sm truncate">होटल रोयल टुलिप, ग्वार्को</div>
                        <div className="text-xs text-emerald-200/70 font-mono">Hotel Royal Tulip, Lalitpur</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 2: 5TH EDITION PRESS MEET BANNER */}
              {activeTab === "banner" && (
                <motion.div
                  key="tab-banner"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4"
                >
                  <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden border-2 border-emerald-400/40 shadow-[0_15px_40px_rgba(0,0,0,0.8)] bg-slate-950 group">
                    <Image
                      src="/images/press_meet.jpeg"
                      alt="Himalayan Green Energy Expo 2027 Official Press Meet"
                      fill
                      priority
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent pointer-events-none" />

                    <button
                      onClick={() => setIsZoomed(true)}
                      className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-black/75 hover:bg-black text-white font-mono text-[11px] font-bold backdrop-blur-md border border-white/20 inline-flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-105"
                    >
                      <Maximize2 className="w-3.5 h-3.5 text-[#34D399]" />
                      <span>Full Resolution</span>
                    </button>

                    <div className="absolute bottom-3 left-3 right-3 p-3.5 bg-black/80 backdrop-blur-md border border-white/15 rounded-xl flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-mono text-[#34D399] uppercase font-bold tracking-wider block">
                          5TH EDITION · 17–19 JAN 2027 (MAGH 3–5, 2083)
                        </span>
                        <span className="text-xs text-white font-medium">
                          Bhrikutimandap, Kathmandu · &ldquo;Resilient Energy, Prosperous Nepal&rdquo;
                        </span>
                      </div>
                      <span className="px-2.5 py-1 rounded-md bg-[#10B981] text-slate-950 font-mono text-[10px] font-black uppercase">
                        CONFIRMED
                      </span>
                    </div>
                  </div>

                  {/* 6 Sub-Shows Micro Pills */}
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                    <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider text-center">
                      6 CONCURRENT CLEAN ENERGY SHOWS
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-1.5">
                      {[
                        "Green Hydrogen",
                        "EV Show",
                        "Alternative Energy",
                        "Windmill Energy",
                        "Solar Energy",
                        "Green Hydro Energy",
                      ].map((show) => (
                        <span
                          key={show}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-200 font-mono text-[10px] font-bold"
                        >
                          {show}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* High-Impact Bottom Actions Bar */}
            <div className="p-4 sm:p-5 border-t border-white/15 bg-black/60 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 shrink-0">
              <a
                href={activeTab === "invitation" ? "/images/invitation.jpeg" : "/images/press_meet.jpeg"}
                download={
                  activeTab === "invitation"
                    ? "Himalayan_Green_Energy_Expo_Invitation.jpeg"
                    : "Himalayan_Green_Energy_Expo_Press_Meet.jpeg"
                }
                className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-bold tracking-wider inline-flex items-center gap-2 transition-all border border-white/20 active:scale-95 shadow-xs"
              >
                <FileDown className="w-4 h-4 text-amber-300" />
                <span>Download {activeTab === "invitation" ? "Invitation (JPEG)" : "Banner (JPEG)"}</span>
              </a>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleClose}
                  className="px-4 py-2.5 rounded-full text-slate-300 hover:text-white font-mono text-xs font-semibold transition-colors cursor-pointer"
                >
                  Enter Site
                </button>

                <Link
                  href="/register"
                  onClick={handleClose}
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#10B981] via-[#059669] to-[#047857] hover:from-[#059669] hover:to-[#047857] text-white font-mono text-xs font-black uppercase tracking-wider inline-flex items-center gap-2 shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all hover:scale-105 active:scale-95"
                >
                  <span>Register Free</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Full Resolution Zoom Modal */}
          {isZoomed && (
            <div
              onClick={() => setIsZoomed(false)}
              className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/95 backdrop-blur-lg cursor-zoom-out"
            >
              <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center">
                <button
                  onClick={() => setIsZoomed(false)}
                  className="absolute -top-12 right-0 p-2 text-white hover:text-emerald-400 transition-colors"
                  aria-label="Close Zoom"
                >
                  <X className="w-6 h-6" />
                </button>
                <div className="relative w-full aspect-[3/4.2] sm:aspect-[16/10] max-h-[85vh]">
                  <Image
                    src={activeTab === "invitation" ? "/images/invitation.jpeg" : "/images/press_meet.jpeg"}
                    alt="Full preview"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </AnimatePresence>
  );
}
