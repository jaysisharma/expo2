"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { X, Sparkles, Heart, Share2, Award, Check } from "lucide-react";

export default function VishwakarmaPujaModal() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    try {
      const todayStr = new Date().toISOString().slice(0, 10);
      const dismissedDate = localStorage.getItem("vishwakarma_puja_dismissed_date");
      if (dismissedDate !== todayStr) {
        const timer = setTimeout(() => {
          setIsOpen(true);
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.4 },
            colors: ["#F59E0B", "#EF4444", "#10B981", "#EAB308", "#EC4899"],
          });
        }, 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    try {
      const todayStr = new Date().toISOString().slice(0, 10);
      localStorage.setItem("vishwakarma_puja_dismissed_date", todayStr);
    } catch {}
  };

  const handleShare = () => {
    const textToCopy = `🌺 विश्वकर्मा पूजा तथा राष्ट्रिय निर्माण दिवसको हार्दिक शुभकामना 🌺\n\nइभेन्ट सोलुसन परिवारका सम्पूर्ण कर्मचारी साथीहरूमा हार्दिक मंगलमय शुभकामना!\n\n- विजय सागर प्रधान (प्रबन्ध निर्देशक, इभेन्ट सोलुसन प्रा.लि.)`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <>
      {/* Top Festive Floating Ribbon Button if dismissed, so users can re-open anytime */}
      {!isOpen && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="fixed bottom-4 left-4 z-50 flex items-center"
        >
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-amber-600 via-red-600 to-amber-700 text-white font-sans text-xs font-bold shadow-2xl border-2 border-amber-300 hover:scale-105 transition-all cursor-pointer group"
          >
            <span className="text-base animate-bounce">🌺</span>
            <span>विश्वकर्मा पूजा शुभकामना सन्देश</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-200 group-hover:rotate-12 transition-transform" />
          </button>
        </motion.div>
      )}

      {/* Main Festive Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            />

            {/* Festive Greeting Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="relative w-full max-w-xl bg-gradient-to-b from-[#7C121D] via-[#520B13] to-[#2B0509] border-2 border-amber-400/80 shadow-[0_0_50px_rgba(245,158,11,0.4)] rounded-3xl overflow-hidden text-white z-10 my-auto flex flex-col max-h-[92vh]"
            >
              {/* Decorative Golden Corner Accents */}
              <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-amber-400/30 to-transparent pointer-events-none" />
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-amber-400/30 to-transparent pointer-events-none" />

              {/* Close Button */}
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close Greeting"
                className="absolute top-3.5 right-3.5 z-20 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 border border-amber-400/50 text-amber-200 hover:text-white flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Card Scrollable Content */}
              <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
                {/* Header Garland & Title */}
                <div className="text-center space-y-2 pt-2">
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-mono font-bold uppercase tracking-widest shadow-xs">
                    <span>🪔</span>
                    <span>पवित्र चाड पर्व शुभकामना</span>
                    <span>🪔</span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-amber-300 tracking-wide font-sans leading-snug drop-shadow-md pt-1">
                    🌺 विश्वकर्मा पूजा तथा राष्ट्रिय निर्माण दिवसको हार्दिक शुभकामना 🌺
                  </h2>

                  <p className="text-amber-100/90 text-sm font-semibold pt-1">
                    इभेन्ट सोलुसन परिवारका सम्पूर्ण कर्मचारी साथीहरूमा हार्दिक मंगलमय शुभकामना!
                  </p>
                </div>

                {/* Decorative Divider */}
                <div className="flex items-center justify-center gap-3">
                  <div className="h-[1px] w-16 bg-gradient-to-r from-transparent to-amber-400" />
                  <span className="text-amber-400 text-sm">✨ 🌺 ✨</span>
                  <div className="h-[1px] w-16 bg-gradient-to-l from-transparent to-amber-400" />
                </div>

                {/* Message Body in Nepali */}
                <div className="space-y-4 text-xs sm:text-sm text-amber-50/90 leading-relaxed text-justify sm:text-center font-normal px-1 sm:px-4">
                  <p>
                    आजको पवित्र विश्वकर्मा पूजा हाम्रो संस्था <strong>इभेन्ट सोलुसन प्रा.लि.</strong> का लागि विशेष र महत्वपूर्ण दिन हो। निर्माण, सिर्जना, सीप, प्रविधि र कर्मका प्रतीक भगवान् विश्वकर्माको पूजा गर्दै हामीले आफ्नो कामप्रतिको मेहनत, इमानदारी, समर्पण र उत्कृष्टताको भावना अझ मजबुत बनाउने अवसर पनि हो।
                  </p>

                  <p>
                    हाम्रो संस्थाको सफलता कुनै एक व्यक्तिको प्रयासले मात्र सम्भव हुँदैन; यो सम्पूर्ण टिमको एकता, सहकार्य, अनुशासन, सिर्जनशीलता र मेहनतको परिणाम हो। आगामी दिनमा पनि यही भावना र उत्साहका साथ अझ उत्कृष्ट काम गर्दै नयाँ उचाइ हासिल गर्न हामी सबै एकजुट भएर अघि बढौँ।
                  </p>

                  <p className="font-medium text-amber-200 pt-1">
                    भगवान् विश्वकर्माको आशीर्वादले सम्पूर्ण कर्मचारी साथीहरू तथा परिवारमा सुख, शान्ति, समृद्धि, सु-स्वास्थ्य र निरन्तर प्रगति प्रदान होस्।
                  </p>
                </div>

                {/* Salutation Box */}
                <div className="pt-2 text-center">
                  <div className="inline-block p-4 rounded-2xl bg-black/30 border border-amber-400/30 space-y-1 shadow-inner">
                    <div className="text-amber-400 text-xs font-mono font-bold tracking-wider uppercase">
                      शुभकामना व्यक्तकर्ता
                    </div>
                    <div className="font-sans font-black text-base sm:text-lg text-white">
                      विजय सागर प्रधान
                    </div>
                    <div className="text-amber-200 text-xs">
                      प्रबन्ध निर्देशक
                    </div>
                    <div className="text-amber-300/90 text-xs font-semibold">
                      इभेन्ट सोलुसन प्रा.लि.
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Actions Bar */}
              <div className="p-4 bg-black/50 border-t border-amber-500/20 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleShare}
                  className="px-4 py-2 rounded-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-200 font-sans text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copied ? "सन्देश कपि भयो!" : "सन्देश कपि गर्नुहोस्"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-sans text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  शुभकामना स्वीकार गर्नुहोस् 🙏
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
