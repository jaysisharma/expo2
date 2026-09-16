'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HydroLoadingScreen({ onComplete }: { onComplete?: () => void }) {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    document.body.style.overflow = 'hidden';

    const startTime = Date.now();
    const duration = 1400; // Snappy 1.4s

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);

      if (pct >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setLoading(false);
          document.body.style.overflow = '';
          if (onComplete) onComplete();
          // Dispatch window event so hero and other components know loader finished
          window.dispatchEvent(new CustomEvent('hydro-loader-complete'));
        }, 120);
      }
    }, 20);

    return () => {
      clearInterval(interval);
      document.body.style.overflow = '';
    };
  }, [onComplete]);

  if (!isClient) return null;

  const waveY = 100 - progress;

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          key="water-only-loader"
          initial={{ y: 0 }}
          exit={{
            y: '-100%',
            transition: { duration: 0.65, ease: [0.76, 0, 0.24, 1] },
          }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#FAFCFB] dark:bg-[#070D16] select-none pointer-events-auto transition-colors duration-300"
        >
          {/* Subtle Ambient Light Glow */}
          <div
            aria-hidden="true"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-gradient-to-b from-[#218A59]/12 via-[#234679]/6 to-transparent blur-3xl pointer-events-none rounded-full"
          />

          {/* ── Water SVG Droplet / Reservoir ── */}
          <div className="relative flex flex-col items-center">
            <div className="relative w-28 h-28 sm:w-32 sm:h-32">
              <svg
                viewBox="0 0 100 100"
                className="w-full h-full drop-shadow-[0_12px_28px_rgba(33,138,89,0.18)] dark:drop-shadow-[0_12px_28px_rgba(0,0,0,0.6)]"
              >
                <defs>
                  {/* Water Gradient */}
                  <linearGradient id="waterGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#234679" />
                    <stop offset="60%" stopColor="#218A59" />
                    <stop offset="100%" stopColor="#5B9F35" />
                  </linearGradient>

                  {/* Droplet & Vessel Shape Clip Mask */}
                  <clipPath id="dropletClip">
                    <path d="M50 8 C50 8 18 46 18 68 C18 85.67 32.33 100 50 100 C67.67 100 82 85.67 82 68 C82 46 50 8 50 8 Z" />
                  </clipPath>
                </defs>

                {/* Vessel Outer Outline */}
                <path
                  d="M50 8 C50 8 18 46 18 68 C18 85.67 32.33 100 50 100 C67.67 100 82 85.67 82 68 C82 46 50 8 50 8 Z"
                  className="fill-white/80 dark:fill-[#0D1524] stroke-gray-200/80 dark:stroke-white/10"
                  strokeWidth="2"
                />

                {/* Filled Rising Animated Water */}
                <g clipPath="url(#dropletClip)">
                  <rect
                    x="0"
                    y={waveY}
                    width="100"
                    height="100"
                    fill="url(#waterGrad)"
                    className="transition-all duration-150 ease-out"
                  />

                  {/* Flowing Water Wave Surface */}
                  <path
                    d={`M-20 ${waveY} Q5 ${waveY - 4} 30 ${waveY} T80 ${waveY} T130 ${waveY} L130 105 L-20 105 Z`}
                    fill="#5B9F35"
                    opacity="0.6"
                    className="animate-pulse"
                  />
                  <path
                    d={`M-20 ${waveY} Q15 ${waveY - 3} 45 ${waveY} T95 ${waveY} T145 ${waveY} L145 105 L-20 105 Z`}
                    fill="#6BC944"
                    opacity="0.4"
                  />
                </g>

                {/* Soft highlight reflection */}
                <path
                  d="M30 48 C25 58 25 72 32 82"
                  fill="none"
                  className="stroke-white/40 dark:stroke-white/20"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>

              {/* Water Wave Ripple Pulse */}
              <div className="absolute inset-0 rounded-full border border-[#218A59]/25 dark:border-[#25C176]/25 animate-ping pointer-events-none opacity-30 [animation-duration:3s]" />
            </div>

            {/* Percentage Number Loader */}
            <div className="mt-5 flex items-center justify-center">
              <span className="text-sm sm:text-base font-mono font-medium tracking-widest text-gray-700 dark:text-gray-200">
                {progress}%
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
