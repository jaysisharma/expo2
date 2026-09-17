"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { X, Sparkles, Share2, Check, Flame } from "lucide-react";

export default function VishwakarmaPujaModal() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    // Show automatically on page load
    const showGreeting = () => {
      setIsOpen(true);
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.35 },
        colors: ["#F59E0B", "#EF4444", "#10B981", "#EAB308", "#EC4899", "#8B5CF6"],
      });
    };

    const handleLoaderComplete = () => {
      setTimeout(showGreeting, 400);
    };

    window.addEventListener("hydro-loader-complete", handleLoaderComplete);

    // Fallback timer if loader is already done
    const fallbackTimer = setTimeout(() => {
      showGreeting();
    }, 800);

    return () => {
      window.removeEventListener("hydro-loader-complete", handleLoaderComplete);
      clearTimeout(fallbackTimer);
    };
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleShare = () => {
    const textToCopy = `🌺 विश्वकर्मा पूजा तथा राष्ट्रिय निर्माण दिवसको हार्दिक शुभकामना 🌺\n\nइभेन्ट सोलुसन परिवारका सम्पूर्ण कर्मचारी साथीहरूमा हार्दिक मंगलमय शुभकामना!\n\n- विजय सागर प्रधान (प्रबन्ध निर्देशक, इभेन्ट सोलुसन प्रा.लि.)`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <>
      {/* Top Sticky Festive Announcement Bar across entire site */}
      <div className="w-full bg-gradient-to-r from-amber-600 via-red-700 to-amber-700 text-amber-100 py-2 px-3 text-center text-xs font-sans font-bold flex items-center justify-center gap-2 border-b border-amber-400/40 shadow-md relative z-40">
        <span className="animate-pulse text-base">🌺</span>
        <span className="tracking-wide">
          विश्वकर्मा पूजा तथा राष्ट्रिय निर्माण दिवसको हार्दिक मंगलमय शुभकामना!
        </span>
        <button
          onClick={() => setIsOpen(true)}
          className="ml-2 px-3 py-1 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-[11px] transition-all shadow-xs cursor-pointer inline-flex items-center gap-1"
        >
          <span>सन्देश पढ्नुहोस्</span>
          <Sparkles className="w-3 h-3 text-amber-900" />
        </button>
      </div>



      {/* Main Festive Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[10001] flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm transition-opacity"
            />

            {/* Festive Greeting Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative w-full max-w-xl bg-gradient-to-b from-[#7A0C16] via-[#50060E] to-[#250307] border-2 border-amber-400 shadow-[0_0_60px_rgba(245,158,11,0.45)] rounded-3xl overflow-hidden text-white z-10 my-auto flex flex-col max-h-[92vh]"
            >
              {/* Decorative Corner Lights */}
              <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-amber-400/30 to-transparent pointer-events-none rounded-br-full" />
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-400/30 to-transparent pointer-events-none rounded-bl-full" />

              {/* Close Button */}
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close Greeting"
                className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/60 hover:bg-red-600 border border-amber-400/50 text-amber-200 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-lg"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Scrollable Content */}
              <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
                {/* Header Garland & Title */}
                <div className="text-center space-y-2 pt-1">
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/25 border border-amber-400/50 text-amber-300 text-xs font-mono font-bold uppercase tracking-widest shadow-xs">
                    <Flame className="w-3.5 h-3.5 text-amber-300" />
                    <span>पवित्र चाड पर्व शुभकामना सन्देश</span>
                    <Flame className="w-3.5 h-3.5 text-amber-300" />
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-amber-300 tracking-wide font-sans leading-snug drop-shadow-md pt-1">
                    🌺 विश्वकर्मा पूजा तथा राष्ट्रिय निर्माण दिवसको हार्दिक शुभकामना 🌺
                  </h2>

                  <p className="text-amber-100 text-sm font-bold pt-0.5">
                    इभेन्ट सोलुसन परिवारका सम्पूर्ण कर्मचारी साथीहरूमा हार्दिक मंगलमय शुभकामना!
                  </p>
                </div>

                {/* Decorative Divider */}
                <div className="flex items-center justify-center gap-3">
                  <div className="h-[1px] w-20 bg-gradient-to-r from-transparent to-amber-400" />
                  <span className="text-amber-400 text-base">🪔 🌺 🪔</span>
                  <div className="h-[1px] w-20 bg-gradient-to-l from-transparent to-amber-400" />
                </div>

                {/* Message Body */}
                <div className="space-y-4 text-xs sm:text-sm text-amber-50/95 leading-relaxed text-justify sm:text-center font-normal px-1 sm:px-3">
                  <p>
                    आजको पवित्र विश्वकर्मा पूजा हाम्रो संस्था <strong>इभेन्ट सोलुसन प्रा.लि.</strong> का लागि विशेष र महत्वपूर्ण दिन हो। निर्माण, सिर्जना, सीप, प्रविधि र कर्मका प्रतीक भगवान् विश्वकर्माको पूजा गर्दै हामीले आफ्नो कामप्रतिको मेहनत, इमानदारी, समर्पण र उत्कृष्टताको भावना अझ मजबुत बनाउने अवसर पनि हो।
                  </p>

                  <p>
                    हाम्रो संस्थाको सफलता कुनै एक व्यक्तिको प्रयासले मात्र सम्भव हुँदैन; यो सम्पूर्ण टिमको एकता, सहकार्य, अनुशासन, सिर्जनशीलता र मेहनतको परिणाम हो। आगामी दिनमा पनि यही भावना र उत्साहका साथ अझ उत्कृष्ट काम गर्दै नयाँ उचाइ हासिल गर्न हामी सबै एकजुट भएर अघि बढौँ।
                  </p>

                  <p className="font-semibold text-amber-200 pt-1">
                    भगवान् विश्वकर्माको आशीर्वादले सम्पूर्ण कर्मचारी साथीहरू तथा परिवारमा सुख, शान्ति, समृद्धि, सु-स्वास्थ्य र निरन्तर प्रगति प्रदान होस्।
                  </p>

                  <p className="font-bold text-amber-300 text-sm pt-1">
                    विश्वकर्मा पूजाको हार्दिक मंगलमय शुभकामना! 🙏🌺
                  </p>
                </div>

                {/* Sign-off Box */}
                <div className="pt-2 text-center">
                  <div className="inline-block p-4 rounded-2xl bg-black/40 border border-amber-400/40 space-y-1 shadow-inner min-w-[240px]">
                    <div className="font-sans font-black text-base sm:text-lg text-white">
                      विजय सागर प्रधान
                    </div>
                    <div className="text-amber-200 text-xs font-semibold">
                      प्रबन्ध निर्देशक
                    </div>
                    <div className="text-amber-400 text-xs font-bold tracking-wide">
                      इभेन्ट सोलुसन प्रा.लि.
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="p-4 bg-black/60 border-t border-amber-500/30 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleShare}
                  className="px-4 py-2 rounded-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-200 font-sans text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copied ? "सन्देश कपि भयो!" : "सन्देश शेयर / कपि गर्नुहोस्"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-sans text-xs font-black uppercase tracking-wider transition-all shadow-lg active:scale-95 cursor-pointer"
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
