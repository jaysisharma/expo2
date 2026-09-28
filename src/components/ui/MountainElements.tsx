'use client';

import React from 'react';

/**
 * Topographic contour lines representing Himalayan mountain elevations.
 * Adds subtle geological depth to clean section backgrounds.
 */
export function TopographicContours({
  className = '',
  opacity = 'opacity-[0.035]',
}: {
  className?: string;
  opacity?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 pointer-events-none overflow-hidden select-none ${opacity} ${className}`}
    >
      <svg
        className="w-full h-full object-cover"
        viewBox="0 0 1200 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <path
          d="M-50,150 C120,120 280,240 450,190 C620,140 750,260 920,200 C1090,140 1250,220 1350,180"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
        <path
          d="M-50,230 C150,190 320,310 490,260 C660,210 790,330 960,270 C1130,210 1250,290 1350,250"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M-50,310 C180,270 350,390 520,340 C690,290 820,410 990,350 C1160,290 1250,370 1350,330"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M-50,400 C210,360 380,480 550,430 C720,380 850,500 1020,440 C1190,380 1250,460 1350,420"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="6 6"
        />
        <path
          d="M-50,490 C240,450 410,570 580,520 C750,470 880,590 1050,530 C1220,470 1250,550 1350,510"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M-50,580 C270,540 440,660 610,610 C780,560 910,680 1080,620 C1250,560 1250,640 1350,600"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M-50,670 C300,630 470,750 640,700 C810,650 940,770 1110,710 C1280,650 1250,730 1350,690"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
}

/**
 * Multi-tiered Himalayan Mountain Ridge Silhouette with layered atmospheric shadows.
 * Perfect for bridging Hero to content or capping dark/light transitions.
 */
export function MountainRidgeDivider({
  className = '',
  fillColor = '#ffffff',
  accentColor = '#007A5E',
  reverse = false,
}: {
  className?: string;
  fillColor?: string;
  accentColor?: string;
  reverse?: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className={`relative w-full overflow-hidden leading-none select-none pointer-events-none ${className} ${
        reverse ? 'rotate-180' : ''
      }`}
    >
      <svg
        viewBox="0 0 1440 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="w-full h-24 sm:h-36 lg:h-44 block drop-shadow-2xl"
      >
        <defs>
          {/* Ridge 1: Distant high snowy peaks */}
          <linearGradient id="ridge-distant" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={accentColor} stopOpacity="0.45" />
            <stop offset="100%" stopColor={fillColor} stopOpacity="0.1" />
          </linearGradient>

          {/* Ridge 2: Mid-range rugged Himalayan range */}
          <linearGradient id="ridge-mid" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={accentColor} stopOpacity="0.75" />
            <stop offset="100%" stopColor={fillColor} stopOpacity="0.4" />
          </linearGradient>

          {/* Filter for realistic mountain elevation drop shadow */}
          <filter id="mountain-shadow" x="-5%" y="-5%" width="110%" height="130%">
            <feDropShadow
              dx="0"
              dy="10"
              stdDeviation="12"
              floodColor="#000000"
              floodOpacity="0.3"
            />
          </filter>

        </defs>

        {/* ── Layer 1: Distant High Himalayan Peaks (Fishtail / Annapurna silhouette) ── */}
        <path
          d="M0,150 L60,135 L140,165 L220,110 L280,140 L340,90 L400,125 L490,65 L550,115 L620,80 L710,130 L800,50 L870,115 L940,75 L1020,130 L1110,60 L1180,105 L1260,70 L1340,120 L1440,85 L1440,220 L0,220 Z"
          fill="url(#ridge-distant)"
        />

        {/* ── Layer 2: Mid-Range Alpine Ridges with Soft Shadow ── */}
        <path
          d="M0,165 L90,145 L180,170 L260,130 L350,160 L430,110 L510,145 L600,95 L690,140 L770,100 L860,150 L950,90 L1040,145 L1130,105 L1210,150 L1310,110 L1400,150 L1440,135 L1440,220 L0,220 Z"
          fill="url(#ridge-mid)"
        />

        {/* ── Layer 3: Solid Foreground Mountain Base with Deep Cast Shadow ── */}
        <path
          d="M0,185 L110,160 L210,180 L310,145 L410,175 L520,135 L640,170 L740,125 L850,165 L960,120 L1070,160 L1170,130 L1280,168 L1380,140 L1440,155 L1440,220 L0,220 Z"
          fill={fillColor}
          filter="url(#mountain-shadow)"
        />
      </svg>
    </div>
  );
}

/**
 * Himalayan Mountain Crest Icon / Emblem with dual peaks and clean sun energy halo.
 */
export function MountainCrestSvg({
  className = 'w-5 h-5',
  strokeWidth = 2,
}: {
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Distant Peak */}
      <path d="M7 16l4-7 4 7" opacity="0.6" />
      {/* Sun / Energy Orb */}
      <circle cx="16" cy="6" r="2.5" fill="currentColor" fillOpacity="0.2" />
      {/* Main Sharp Peak with snowcap notch */}
      <path d="M2 20L8.5 7l4 7.5L16 9l6 11H2z" />
      <path d="M6.5 11l2 3.5 2-1" strokeWidth={strokeWidth * 0.8} />
    </svg>
  );
}

/**
 * Organic Mountain Ridge Card Trim (for cards, headers, or image frames).
 */
export function MountainSilhouetteStrip({
  className = '',
  color = '#007A5E',
  opacity = '0.15',
}: {
  className?: string;
  color?: string;
  opacity?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`w-full overflow-hidden leading-none select-none pointer-events-none ${className}`}
    >
      <svg
        viewBox="0 0 600 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="w-full h-6 block"
        style={{ opacity }}
      >
        <path
          d="M0,40 L30,28 L60,35 L95,20 L130,30 L170,12 L210,26 L250,8 L290,22 L330,14 L370,28 L415,6 L460,25 L505,15 L545,28 L580,18 L600,24 L600,40 Z"
          fill={color}
        />
      </svg>
    </div>
  );
}
