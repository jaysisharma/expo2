'use client';

import React from 'react';

/**
 * Custom lively animated SVG badges for the 6 Core Clean Energy Sectors.
 * Pure SVG + GPU-accelerated CSS animations.
 */

export function HydroTurbineSvg({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="hydroGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00E599" />
          <stop offset="100%" stopColor="#007A5E" />
        </linearGradient>
        <style>{`
          @keyframes spinTurbine {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes waterPulse {
            0%, 100% { transform: scale(1); opacity: 0.3; }
            50% { transform: scale(1.12); opacity: 0.7; }
          }
          .anim-runner {
            transform-origin: 50px 50px;
            animation: spinTurbine 6s linear infinite;
          }
          .anim-water-pulse {
            transform-origin: 50px 50px;
            animation: waterPulse 3s ease-in-out infinite;
          }
        `}</style>
      </defs>

      {/* Water Surge Vortex Rings */}
      <circle cx="50" cy="50" r="44" stroke="#00E599" strokeWidth="1.5" strokeDasharray="6 4" className="anim-water-pulse" opacity="0.4" />
      <circle cx="50" cy="50" r="38" stroke="url(#hydroGrad)" strokeWidth="2" opacity="0.6" />

      {/* Rotating Francis Turbine Runner */}
      <g className="anim-runner">
        {/* Central Hub */}
        <circle cx="50" cy="50" r="10" fill="#007A5E" stroke="#00E599" strokeWidth="2" />
        {/* 6 Curved Curved Blades */}
        <path d="M 50,40 C 50,22 62,18 70,22 C 60,30 55,36 50,40 Z" fill="url(#hydroGrad)" />
        <path d="M 60,50 C 78,50 82,62 78,70 C 70,60 64,55 60,50 Z" fill="url(#hydroGrad)" />
        <path d="M 50,60 C 50,78 38,82 30,78 C 40,70 45,64 50,60 Z" fill="url(#hydroGrad)" />
        <path d="M 40,50 C 22,50 18,38 22,30 C 30,40 36,45 40,50 Z" fill="url(#hydroGrad)" />
      </g>
      {/* Center jewel */}
      <circle cx="50" cy="50" r="4" fill="#FFFFFF" />
    </svg>
  );
}

export function HydrogenMoleculeSvg({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="h2Grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#00E599" />
        </linearGradient>
        <style>{`
          @keyframes orbitH2 {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes bubbleFlow {
            0% { transform: translateY(0); opacity: 0; }
            50% { opacity: 0.9; }
            100% { transform: translateY(-24px); opacity: 0; }
          }
          .anim-orbit {
            transform-origin: 50px 50px;
            animation: orbitH2 8s linear infinite;
          }
          .anim-orbit-rev {
            transform-origin: 50px 50px;
            animation: orbitH2 5s linear reverse infinite;
          }
          .anim-bubble {
            animation: bubbleFlow 2s ease-out infinite;
          }
        `}</style>
      </defs>

      {/* Orbit Rings */}
      <ellipse cx="50" cy="50" rx="42" ry="18" stroke="#38BDF8" strokeWidth="1.2" strokeDasharray="4 4" transform="rotate(30 50 50)" opacity="0.5" />
      <ellipse cx="50" cy="50" rx="42" ry="18" stroke="#00E599" strokeWidth="1.2" strokeDasharray="4 4" transform="rotate(-30 50 50)" opacity="0.5" />

      {/* Orbiting Electrons */}
      <g className="anim-orbit">
        <circle cx="92" cy="50" r="3.5" fill="#38BDF8" />
      </g>
      <g className="anim-orbit-rev">
        <circle cx="8" cy="50" r="3.5" fill="#00E599" />
      </g>

      {/* Central H2 Molecule Nucleus */}
      <circle cx="42" cy="50" r="12" fill="#0284C7" opacity="0.85" />
      <text x="42" y="54" fill="#FFFFFF" fontSize="10" fontWeight="bold" textAnchor="middle">H</text>

      <circle cx="58" cy="50" r="12" fill="#007A5E" opacity="0.85" />
      <text x="58" y="54" fill="#FFFFFF" fontSize="10" fontWeight="bold" textAnchor="middle">H</text>

      {/* Bond Link */}
      <line x1="42" y1="50" x2="58" y2="50" stroke="#FFFFFF" strokeWidth="2.5" />

      {/* Micro Bubbles */}
      <circle cx="50" cy="30" r="2.5" fill="#00E599" className="anim-bubble" />
      <circle cx="45" cy="24" r="1.8" fill="#38BDF8" className="anim-bubble" style={{ animationDelay: '0.7s' }} />
    </svg>
  );
}

export function EvMobilitySvg({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="evGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00E599" />
          <stop offset="100%" stopColor="#38BDF8" />
        </linearGradient>
        <style>{`
          @keyframes boltPulse {
            0%, 100% { transform: scale(1); filter: drop-shadow(0 0 2px #00E599); }
            50% { transform: scale(1.15); filter: drop-shadow(0 0 8px #00E599); }
          }
          @keyframes wheelSpin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .anim-bolt {
            transform-origin: 50px 42px;
            animation: boltPulse 2s ease-in-out infinite;
          }
          .anim-wheel {
            transform-origin: 32px 64px;
            animation: wheelSpin 2s linear infinite;
          }
          .anim-wheel-2 {
            transform-origin: 68px 64px;
            animation: wheelSpin 2s linear infinite;
          }
        `}</style>
      </defs>

      {/* Aerodynamic Speed Lines */}
      <path d="M 12,38 L 26,38" stroke="#00E599" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <path d="M 8,46 L 22,46" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" opacity="0.7" />

      {/* EV Aerodynamic Silhouette Body */}
      <path
        d="M 22,54 C 24,46 32,38 42,36 L 58,36 C 68,36 78,44 82,54 L 86,56 C 88,58 86,62 82,62 L 77,62 C 75,56 69,56 68,62 L 32,62 C 31,56 25,56 23,62 L 16,62 C 14,62 14,58 18,56 Z"
        fill="url(#evGrad)"
      />

      {/* Windshield */}
      <path d="M 44,40 L 56,40 L 64,50 L 36,50 Z" fill="#062018" opacity="0.85" />

      {/* Wheels */}
      <g className="anim-wheel">
        <circle cx="32" cy="64" r="8" fill="#1E293B" stroke="#00E599" strokeWidth="2" />
        <circle cx="32" cy="64" r="3" fill="#FFFFFF" />
      </g>
      <g className="anim-wheel-2">
        <circle cx="68" cy="64" r="8" fill="#1E293B" stroke="#00E599" strokeWidth="2" />
        <circle cx="68" cy="64" r="3" fill="#FFFFFF" />
      </g>

      {/* Dynamic Lightning Bolt Center Badge */}
      <g className="anim-bolt">
        <path d="M 52,24 L 46,38 L 51,38 L 47,52 L 57,36 L 52,36 Z" fill="#FACC15" />
      </g>
    </svg>
  );
}

export function WindmillTurbineSvg({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>{`
          @keyframes spinRotor {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes windWave {
            0% { stroke-dashoffset: 60; }
            100% { stroke-dashoffset: 0; }
          }
          .anim-rotor {
            transform-origin: 50px 38px;
            animation: spinRotor 3.5s linear infinite;
          }
          .anim-wind {
            stroke-dasharray: 10 10;
            animation: windWave 1.5s linear infinite;
          }
        `}</style>
      </defs>

      {/* Wind Flow Stream vectors */}
      <path d="M 10,22 Q 30,16 60,22 T 95,20" stroke="#38BDF8" strokeWidth="1.8" strokeLinecap="round" className="anim-wind" opacity="0.7" />
      <path d="M 5,32 Q 25,26 55,30 T 90,28" stroke="#00E599" strokeWidth="1.8" strokeLinecap="round" className="anim-wind" opacity="0.8" style={{ animationDelay: '0.5s' }} />

      {/* Turbine Tower Mast */}
      <path d="M 48,88 L 49,38 L 51,38 L 52,88 Z" fill="#94A3B8" />
      <ellipse cx="50" cy="88" rx="14" ry="4" fill="#64748B" />

      {/* Rotor Blades */}
      <g className="anim-rotor">
        <circle cx="50" cy="38" r="4.5" fill="#00E599" />
        {/* Blade 1 (Up) */}
        <path d="M 50,38 L 49,10 C 51,7 52,7 53,10 L 51,38 Z" fill="#FFFFFF" stroke="#007A5E" strokeWidth="0.8" />
        {/* Blade 2 (Down-Right) */}
        <path d="M 50,38 L 74,52 C 76,54 75,56 72,56 L 50,38 Z" fill="#FFFFFF" stroke="#007A5E" strokeWidth="0.8" />
        {/* Blade 3 (Down-Left) */}
        <path d="M 50,38 L 26,52 C 24,54 25,56 28,56 L 50,38 Z" fill="#FFFFFF" stroke="#007A5E" strokeWidth="0.8" />
      </g>
      <circle cx="50" cy="38" r="2" fill="#007A5E" />
    </svg>
  );
}

export function SolarPhotovoltaicSvg({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>{`
          @keyframes sunRadiate {
            0%, 100% { transform: scale(1); opacity: 0.8; }
            50% { transform: scale(1.15); opacity: 1; }
          }
          @keyframes rayShimmer {
            0% { opacity: 0.3; }
            50% { opacity: 0.9; }
            100% { opacity: 0.3; }
          }
          .anim-sun {
            transform-origin: 50px 22px;
            animation: sunRadiate 3s ease-in-out infinite;
          }
          .anim-ray {
            animation: rayShimmer 2s ease-in-out infinite;
          }
        `}</style>
      </defs>

      {/* Sun Ray Beams */}
      <g className="anim-sun">
        <circle cx="50" cy="22" r="10" fill="#FACC15" />
        <line x1="50" y1="6" x2="50" y2="10" stroke="#FACC15" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="64" y1="12" x2="61" y2="15" stroke="#FACC15" strokeWidth="2" strokeLinecap="round" />
        <line x1="66" y1="22" x2="62" y2="22" stroke="#FACC15" strokeWidth="2" strokeLinecap="round" />
        <line x1="36" y1="12" x2="39" y2="15" stroke="#FACC15" strokeWidth="2" strokeLinecap="round" />
        <line x1="34" y1="22" x2="38" y2="22" stroke="#FACC15" strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* Angled Solar Array Lattice in 3D Perspective */}
      <g transform="translate(0, 16)">
        <polygon points="20,58 50,42 80,42 50,58" fill="#0284C7" stroke="#38BDF8" strokeWidth="1.5" />
        <polygon points="12,74 44,58 74,58 42,74" fill="#0369A1" stroke="#38BDF8" strokeWidth="1.5" />

        {/* Photovoltaic Monocrystalline Grid Lines */}
        <line x1="35" y1="50" x2="65" y2="50" stroke="#38BDF8" strokeWidth="0.8" opacity="0.7" />
        <line x1="28" y1="66" x2="58" y2="66" stroke="#38BDF8" strokeWidth="0.8" opacity="0.7" />
        
        {/* Shimmering Photovoltaic Reflection */}
        <polygon points="26,62 38,56 46,56 34,62" fill="#FFFFFF" className="anim-ray" opacity="0.7" />
      </g>
    </svg>
  );
}

export function AlternativeEnergySvg({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bioGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
        <style>{`
          @keyframes cycleRotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .anim-cycle {
            transform-origin: 50px 50px;
            animation: cycleRotate 7s linear infinite;
          }
        `}</style>
      </defs>

      {/* Closed-Loop Circular Eco Flow */}
      <g className="anim-cycle">
        <circle cx="50" cy="50" r="38" stroke="url(#bioGrad)" strokeWidth="2.5" strokeDasharray="14 10" strokeLinecap="round" />
        <circle cx="88" cy="50" r="4" fill="#10B981" />
        <circle cx="12" cy="50" r="4" fill="#F59E0B" />
      </g>

      {/* Geothermal & Biomass Central Flame / Leaf Icon */}
      <path
        d="M 50,26 C 58,38 66,48 62,62 C 58,74 42,74 38,62 C 34,48 42,38 50,26 Z"
        fill="#10B981"
        opacity="0.85"
      />
      <path
        d="M 50,38 C 54,46 58,54 55,62 C 52,70 45,70 43,62 C 41,54 46,46 50,38 Z"
        fill="#F59E0B"
      />
      <circle cx="50" cy="54" r="3" fill="#FFFFFF" />
    </svg>
  );
}

export function EnergyStorageSvg({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="storageGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <style>{`
          @keyframes batteryCharge {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 1; }
          }
          .anim-charge-1 { animation: batteryCharge 2s ease-in-out infinite 0.2s; }
          .anim-charge-2 { animation: batteryCharge 2s ease-in-out infinite 0.5s; }
          .anim-charge-3 { animation: batteryCharge 2s ease-in-out infinite 0.8s; }
        `}</style>
      </defs>

      {/* Battery Casing */}
      <rect x="26" y="24" width="48" height="58" rx="8" stroke="url(#storageGrad)" strokeWidth="3" />
      <path d="M 40,18 H 60 V 24 H 40 Z" fill="url(#storageGrad)" rx="2" />

      {/* Dynamic Charge Bars */}
      <rect x="33" y="66" width="34" height="9" rx="3" fill="#10B981" className="anim-charge-1" />
      <rect x="33" y="52" width="34" height="9" rx="3" fill="#10B981" className="anim-charge-2" />
      <rect x="33" y="38" width="34" height="9" rx="3" fill="#10B981" className="anim-charge-3" />

      {/* Energy Spark Symbol */}
      <polygon points="50,30 44,48 51,48 48,64 56,46 49,46" fill="#FACC15" opacity="0.9" />
    </svg>
  );
}

export function SmartEnergySvg({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="smartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#00E599" />
        </linearGradient>
        <style>{`
          @keyframes pulseNodes {
            0%, 100% { transform: scale(1); opacity: 0.7; }
            50% { transform: scale(1.3); opacity: 1; }
          }
          .anim-node { transform-origin: center; animation: pulseNodes 2.5s ease-in-out infinite; }
        `}</style>
      </defs>

      {/* Central Smart Microchip */}
      <rect x="34" y="34" width="32" height="32" rx="6" fill="#0F172A" stroke="url(#smartGrad)" strokeWidth="2.5" />
      
      {/* Circuit Nodes */}
      <line x1="50" y1="14" x2="50" y2="34" stroke="url(#smartGrad)" strokeWidth="2" strokeDasharray="3 3" />
      <line x1="50" y1="66" x2="50" y2="86" stroke="url(#smartGrad)" strokeWidth="2" strokeDasharray="3 3" />
      <line x1="14" y1="50" x2="34" y2="50" stroke="url(#smartGrad)" strokeWidth="2" strokeDasharray="3 3" />
      <line x1="66" y1="50" x2="86" y2="50" stroke="url(#smartGrad)" strokeWidth="2" strokeDasharray="3 3" />

      {/* Pulsing Nodes */}
      <circle cx="50" cy="14" r="5" fill="#00E599" className="anim-node" />
      <circle cx="50" cy="86" r="5" fill="#0284C7" className="anim-node" />
      <circle cx="14" cy="50" r="5" fill="#00E599" className="anim-node" />
      <circle cx="86" cy="50" r="5" fill="#0284C7" className="anim-node" />

      {/* Center AI / IoT Core */}
      <circle cx="50" cy="50" r="7" fill="#00E599" opacity="0.9" />
      <circle cx="50" cy="50" r="3" fill="#FFFFFF" />
    </svg>
  );
}
