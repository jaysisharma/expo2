"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, FileDown, ArrowRight } from "lucide-react";

export default function WelcomeExpoModal() {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    // Avoid conflicting popup on initial load while Vishwakarma Puja celebration is active
    const dismissed = sessionStorage.getItem("expo_welcome_modal_dismissed");
    if (dismissed === "active") {
      setIsOpen(true);
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
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          {/* Subtle Dark Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
          />

          {/* Clean, Elegant Modal Frame */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative w-full max-w-md sm:max-w-lg bg-slate-900 border border-white/15 shadow-2xl rounded-3xl overflow-hidden text-white z-10 my-auto flex flex-col max-h-[92vh]"
          >
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close"
              className="
    fixed top-4 right-4 z-[9999]
    flex h-11 w-11 items-center justify-center
    rounded-full
    bg-black text-white
    border-2 border-white
    shadow-2xl
    hover:bg-red-600
    hover:scale-110
    active:scale-95
    transition-all duration-200
    cursor-pointer
  "
            >
              <X className="h-6 w-6 stroke-[3]" />
            </button>
            {/* Official Invitation Graphic (Full & Crisp) */}
            <div className="relative w-full aspect-[3/4.2] bg-white overflow-hidden">
              <Image
                src="/images/invitation.jpeg"
                alt="Himalayan Green Energy Expo 2027 Invitation"
                fill
                priority
                className="object-contain object-top"
              />
            </div>

            {/* Clean, Minimal Action Bar */}
            <div className="p-3.5 sm:p-4 bg-slate-950/90 border-t border-white/10 flex items-center gap-2.5">
              <a
                href="/images/invitation.jpeg"
                download="Himalayan_Green_Energy_Expo_Invitation.jpeg"
                className="flex-1 py-2.5 px-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-semibold tracking-wider inline-flex items-center justify-center gap-1.5 transition-all border border-white/15 active:scale-95"
              >
                <FileDown className="w-3.5 h-3.5 text-amber-400" />
                <span>Download</span>
              </a>

              <Link
                href="/register"
                onClick={handleClose}
                className="flex-1 py-2.5 px-4 rounded-full bg-[#10B981] hover:bg-[#059669] text-slate-950 font-mono text-xs font-black uppercase tracking-wider inline-flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
              >
                <span>Register Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
