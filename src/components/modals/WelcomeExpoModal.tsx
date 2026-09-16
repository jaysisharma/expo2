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
  ExternalLink,
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

    // Fallback timer if event is missed or page loaded directly
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
          {/* Dimmed luxury backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-slate-950/85 backdrop-blur-md transition-opacity"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-2xl bg-gradient-to-b from-[#042018] via-[#02140F] to-[#010C09] border border-emerald-500/30 ring-1 ring-white/10 shadow-[0_30px_90px_rgba(0,0,0,0.85)] rounded-3xl overflow-hidden text-white z-10 my-auto flex flex-col max-h-[94vh]"
          >
            {/* Ambient Background Glow */}
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Top Bar: Tabs & Close Button */}
            <div className="relative px-5 py-4 border-b border-white/10 flex items-center justify-between gap-3 bg-black/40 backdrop-blur-md shrink-0">
              {/* Tab Selector */}
              <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/10 border border-white/10">
                <button
                  onClick={() => setActiveTab("invitation")}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold tracking-wide transition-all inline-flex items-center gap-1.5 cursor-pointer ${
                    activeTab === "invitation"
                      ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-md"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  <Scroll className="w-3.5 h-3.5" />
                  <span>Invitation Card</span>
                </button>

                <button
                  onClick={() => setActiveTab("banner")}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold tracking-wide transition-all inline-flex items-center gap-1.5 cursor-pointer ${
                    activeTab === "banner"
                      ? "bg-[#10B981] text-slate-950 shadow-md"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  <Newspaper className="w-3.5 h-3.5" />
                  <span>Official Press Meet</span>
                </button>
              </div>

              {/* Close Button */}
              <button
                onClick={handleClose}
                aria-label="Close modal"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer border border-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
              {/* TAB 1: OFFICIAL INVITATION (हार्दिक निमन्त्रणा) */}
              {activeTab === "invitation" && (
                <motion.div
                  key="tab-invitation"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  {/* Invitation Card Showcase */}
                  <div className="relative w-full max-w-sm sm:max-w-md mx-auto aspect-[3/4.2] rounded-2xl overflow-hidden border-2 border-amber-400/40 shadow-2xl bg-white group">
                    <Image
                      src="/images/invitation.jpeg"
                      alt="Official Invitation - Himalayan Green Energy Expo 2027"
                      fill
                      priority
                      className="object-contain object-top"
                    />

                    {/* Lightbox Trigger */}
                    <button
                      onClick={() => setIsZoomed(true)}
                      className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/85 text-white font-mono text-[11px] font-bold backdrop-blur-md border border-white/20 inline-flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-105"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>Zoom Card</span>
                    </button>
                  </div>

                  {/* Highlighted Event Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs font-mono">
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center shrink-0">
                        <Calendar className="w-4 h-4 text-amber-400" />
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-bold">DATE & TIME</div>
                        <div className="text-white font-semibold">2083 Asoj 1, Thursday · 2:00 PM</div>
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-400/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
                        <MapPin className="w-4 h-4 text-[#34D399]" />
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-bold">VENUE</div>
                        <div className="text-white font-semibold truncate">Hotel Royal Tulip, Gwarko</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 2: 5TH EDITION PRESS MEET BANNER */}
              {activeTab === "banner" && (
                <motion.div
                  key="tab-banner"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-slate-950 group">
                    <Image
                      src="/images/press_meet.jpeg"
                      alt="Himalayan Green Energy Expo 2027 Official Press Meet"
                      fill
                      priority
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                    <button
                      onClick={() => setIsZoomed(true)}
                      className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/85 text-white font-mono text-[11px] font-bold backdrop-blur-md border border-white/20 inline-flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-105"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>Full View</span>
                    </button>

                    <div className="absolute bottom-3 left-3 right-3 p-3 bg-black/75 backdrop-blur-md border border-white/10 rounded-xl">
                      <span className="text-[10px] font-mono text-[#34D399] uppercase font-bold tracking-wider block">
                        5TH EDITION · 17–19 JAN 2027 (MAGH 3–5, 2083)
                      </span>
                      <span className="text-xs text-white font-medium">
                        Bhrikutimandap, Kathmandu · &ldquo;Resilient Energy, Prosperous Nepal&rdquo;
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-emerald-100/80 leading-relaxed text-center max-w-lg mx-auto">
                    South Asia&apos;s clean energy summit spotlighting Green Hydrogen, Hydro Power, Solar PV, Wind Energy, EV Mobility, and Alternative Renewables.
                  </p>
                </motion.div>
              )}
            </div>

            {/* Bottom Action Footer Bar */}
            <div className="p-4 sm:p-5 border-t border-white/10 bg-black/50 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 shrink-0">
              <a
                href={activeTab === "invitation" ? "/images/invitation.jpeg" : "/images/press_meet.jpeg"}
                download={
                  activeTab === "invitation"
                    ? "Himalayan_Green_Energy_Expo_Invitation.jpeg"
                    : "Himalayan_Green_Energy_Expo_Press_Meet.jpeg"
                }
                className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-semibold tracking-wider inline-flex items-center gap-1.5 transition-all border border-white/15 active:scale-95"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Download {activeTab === "invitation" ? "Card" : "Banner"}</span>
              </a>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleClose}
                  className="px-4 py-2.5 rounded-full text-slate-300 hover:text-white font-mono text-xs font-medium transition-colors cursor-pointer"
                >
                  Dismiss
                </button>

                <Link
                  href="/register"
                  onClick={handleClose}
                  className="px-5 py-2.5 rounded-full bg-[#10B981] hover:bg-[#059669] text-slate-950 font-mono text-xs font-black uppercase tracking-wider inline-flex items-center gap-1.5 shadow-lg transition-all hover:scale-105 active:scale-95"
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
