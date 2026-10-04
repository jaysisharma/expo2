'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { MountainCrestSvg } from '@/components/ui';
import {
  Droplets,
  Wind,
  Sun,
  Flame,
  Zap,
  Compass,
  Play,
  Pause,
  CloudRain,
  SunMedium,
  Globe2,
  Clock,
  CheckCircle2,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════════════════
   SIMULATION ENGINE — Real-Time Energy System Model
   ═══════════════════════════════════════════════════════════════════════════ */

const SEASONAL_PROFILES = {
  monsoon: { hydroFactor: 1.0, windFactor: 0.28, solarFactor: 0.64, h2Intake: 0.92, exportFactor: 0.95, riverFlow: 12400 },
  winter:  { hydroFactor: 0.35, windFactor: 0.80, solarFactor: 1.0, h2Intake: 0.20, exportFactor: 0.40, riverFlow: 3650 },
  export:  { hydroFactor: 0.75, windFactor: 0.55, solarFactor: 0.82, h2Intake: 0.60, exportFactor: 1.0, riverFlow: 8200 },
} as const;

function getHourlyMultipliers(hour: number) {
  const solarRaw = Math.max(0, Math.sin(((hour - 6) / 12) * Math.PI));
  const solar = hour >= 6 && hour <= 18 ? solarRaw : 0;
  const wind = 0.5 + 0.5 * Math.cos(((hour - 3) / 12) * Math.PI);
  const hydro = 0.9 + 0.1 * Math.cos(((hour - 6) / 24) * Math.PI * 2);
  return { solar, wind, hydro };
}

const PLANTS = {
  hydro:    { rated: 456, name: 'Upper Tamakoshi' },
  wind:     { rated: 300, name: 'Mustang Wind Farm' },
  solar:    { rated: 175, name: 'Floating Solar Array' },
  hydrogen: { rated: 420, name: 'Green H₂ Complex' },
  grid:     { rated: 1500, name: '400kV Supergrid' },
};

type Season = 'monsoon' | 'winter' | 'export';

interface SimState {
  hour: number;
  season: Season;
  hydroMW: number;
  windMW: number;
  solarMW: number;
  h2MW: number;
  exportMW: number;
  totalGenMW: number;
  gridFreqHz: number;
  riverFlowM3: number;
  windSpeedMs: number;
}

function computeSimState(hour: number, season: Season, jitter: number): SimState {
  const sp = SEASONAL_PROFILES[season];
  const hm = getHourlyMultipliers(hour);

  const hydroMW = Math.round(PLANTS.hydro.rated * sp.hydroFactor * hm.hydro + jitter * 3);
  const windMW = Math.round(PLANTS.wind.rated * sp.windFactor * hm.wind + jitter * 4);
  const solarMW = Math.round(PLANTS.solar.rated * sp.solarFactor * hm.solar + jitter * 2);
  const totalGen = hydroMW + windMW + solarMW;
  const h2MW = Math.round(Math.max(0, totalGen * sp.h2Intake * 0.3 - 20 + jitter * 3));
  const exportMW = Math.round(Math.max(0, (totalGen - h2MW) * sp.exportFactor * 0.85 + jitter * 6));

  const gridFreqHz = Number((50.00 + (jitter * 0.02)).toFixed(2));
  const riverFlowM3 = Math.round(sp.riverFlow * hm.hydro + jitter * 80);
  const windSpeedMs = Number((11.4 * sp.windFactor * hm.wind + jitter * 0.6).toFixed(1));

  return {
    hour, season, hydroMW, windMW, solarMW, h2MW, exportMW,
    totalGenMW: totalGen, gridFreqHz, riverFlowM3, windSpeedMs,
  };
}

// Compact Number Ticker
function Ticker({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const [display, setDisplay] = useState(value);
  const targetRef = useRef(value);
  targetRef.current = value;

  useEffect(() => {
    let animId: number;
    const startVal = display;
    const startTime = performance.now();
    const duration = 600;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = startVal + (targetRef.current - startVal) * ease;
      setDisplay(Number(current.toFixed(decimals)));
      if (progress < 1) {
        animId = requestAnimationFrame(animate);
      }
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [value, decimals]);

  return <span>{decimals === 0 ? Math.round(display).toLocaleString() : display.toFixed(decimals)}</span>;
}

export function HimalayanEcosystemGraphic() {
  const [season, setSeason] = useState<Season>('monsoon');
  const [simHour, setSimHour] = useState<number>(10);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [selectedPlant, setSelectedPlant] = useState<string>('hydro');
  const [tick, setTick] = useState<number>(0);

  // Pseudo-random jitter
  const jitter = Math.sin(tick * 0.4) * 0.5 + Math.cos(tick * 0.7) * 0.3;
  const sim = computeSimState(simHour, season, jitter);

  // Advance time
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setTick(t => t + 1);
      setSimHour(h => {
        const next = h + 0.25;
        return next >= 24 ? 0 : Number(next.toFixed(2));
      });
    }, 1800);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Format hour as HH:MM
  const formatHour = (h: number) => {
    const hrs = Math.floor(h);
    const mins = Math.round((h - hrs) * 60);
    const ampm = hrs >= 12 ? 'PM' : 'AM';
    const displayH = hrs % 12 === 0 ? 12 : hrs % 12;
    return `${displayH}:${mins.toString().padStart(2, '0')} ${ampm}`;
  };

  // Sky gradient based on time
  const getSkyGradient = (h: number) => {
    if (h >= 6 && h < 8) return 'from-indigo-950 via-amber-950/40 to-emerald-950';
    if (h >= 8 && h < 17) return 'from-sky-950/60 via-emerald-950/40 to-slate-950';
    if (h >= 17 && h < 19) return 'from-orange-950/40 via-rose-950/30 to-slate-950';
    return 'from-slate-950 via-indigo-950/80 to-slate-950';
  };

  // Plant detail catalog
  const plantDetails: Record<string, {
    name: string; category: string; elevation: string;
    basin: string; image: string; coords: string; turbine: string;
    gridRoute: string; desc: string; highlights: string[];
    icon: React.ComponentType<{ className?: string }>;
    currentMW: number; ratedMW: number;
  }> = {
    hydro: {
      name: 'Upper Tamakoshi Glacial Cascade', category: 'HYDROELECTRIC',
      elevation: '3,820m Intake · 822m Head', basin: 'Tamakoshi River Basin, Dolakha',
      image: '/images/nepal_tamakoshi.webp', coords: "27°51'N 86°12'E",
      turbine: '6× Vertical Pelton Turbines', gridRoute: '220kV → 400kV Dhalkebar',
      desc: 'High-head run-of-river project harnessing glacial snowmelt through twin 372m penstock shafts into an underground powerhouse.',
      highlights: ['822m hydraulic head drop', 'Twin vertical pressure shafts', 'Winter baseload firming'],
      icon: Droplets, currentMW: sim.hydroMW, ratedMW: PLANTS.hydro.rated,
    },
    wind: {
      name: 'Mustang Mountain Wind Corridor', category: 'WIND HARVESTING',
      elevation: '2,850m MASL', basin: 'Kali Gandaki Gorge, Mustang',
      image: '/images/sectors/windmill_energy_show.webp', coords: "28°47'N 83°43'E",
      turbine: 'Anti-Icing High Altitude Turbines', gridRoute: '132kV Kali Gandaki → Butwal',
      desc: 'High-altitude wind turbines in the world’s deepest gorge where valley thermal gradients create dependable daytime wind corridors.',
      highlights: ['Anti-icing electro-thermal blades', 'Thermal diurnal wind corridors', 'Complements dry winter hydro'],
      icon: Wind, currentMW: sim.windMW, ratedMW: PLANTS.wind.rated,
    },
    solar: {
      name: 'Trishuli & Kulekhani Floating Solar', category: 'PHOTOVOLTAIC HYBRID',
      elevation: '1,450m MASL', basin: 'Trishuli Watershed & Reservoir',
      image: '/images/sectors/solar_energy_show.webp', coords: "27°42'N 85°08'E",
      turbine: 'N-Type TOPCon Bifacial Panels', gridRoute: '66kV/132kV Inverter Station',
      desc: 'Floating solar arrays on reservoir surfaces leveraging water cooling for +12% conversion boost while cutting water evaporation.',
      highlights: ['Evaporation suppression on reservoirs', 'Albedo capture from mountain snow', 'Utilizes existing grid substations'],
      icon: Sun, currentMW: sim.solarMW, ratedMW: PLANTS.solar.rated,
    },
    hydrogen: {
      name: 'Monsoon Surplus Green H₂ Facility', category: 'CLEAN MOLECULAR',
      elevation: '450m MASL', basin: 'Kathmandu-Hetauda Industrial Corridor',
      image: '/images/sectors/green_hydrogen_show.webp', coords: "27°25'N 85°02'E",
      turbine: 'Modular PEM Electrolyzers (30 bar)', gridRoute: '132kV Industrial Substation',
      desc: 'Absorbs wet-season surplus hydropower and converts spilled electrons into green hydrogen for clean industry and green urea fertilizer.',
      highlights: ['Absorbs monsoon hydro spill', 'Zero-carbon ammonia feedstock', '15-second flexible grid ramping'],
      icon: Flame, currentMW: sim.h2MW, ratedMW: PLANTS.hydrogen.rated,
    },
    grid: {
      name: 'Dhalkebar 400kV Synchronous Supergrid', category: 'INTERCONNECTION',
      elevation: '95m Terai Basin', basin: 'Dhanusha Cross-Border Corridor',
      image: '/images/hydro_transmission.webp', coords: "26°55'N 85°52'E",
      turbine: '960 MVA Gas-Insulated Substation', gridRoute: 'Dhalkebar–Muzaffarpur 400kV',
      desc: 'Strategic 400kV corridor synchronizing Nepal’s clean power generation to the Indian National Grid and Bangladesh under regional treaties.',
      highlights: ['50.00 Hz synchronous interconnect', 'Quad Moose high-capacity conductors', '10,000 MW bilateral export treaty'],
      icon: Zap, currentMW: sim.exportMW, ratedMW: PLANTS.grid.rated,
    },
  };

  const plant = plantDetails[selectedPlant];
  const PlantIcon = plant.icon;
  const loadPct = Math.min(100, Math.round((plant.currentMW / plant.ratedMW) * 100));

  // Facility node coordinates on the 1000x620 SVG canvas
  const nodePositions: Record<string, { x: number; y: number; label: string }> = {
    hydro:    { x: 280, y: 260, label: 'Hydro' },
    wind:     { x: 150, y: 175, label: 'Wind' },
    solar:    { x: 500, y: 310, label: 'Solar' },
    hydrogen: { x: 690, y: 385, label: 'Green H₂' },
    grid:     { x: 885, y: 410, label: 'Export' },
  };

  return (
    <section className="relative w-full py-16 sm:py-20 bg-[#020a07] text-white font-inter-tight overflow-hidden border-t border-emerald-950/60">
      {/* Subtle ambient lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(0,229,153,0.05),transparent_70%)] pointer-events-none" />

      <div className="relative z-20 max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-10">

        {/* ── SECTION HEADER & CONTROLS (Decluttered & Sleek) ── */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-[#00E599] text-[11px] font-mono font-semibold uppercase tracking-wider">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E599] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00E599]" />
              </span>
              <MountainCrestSvg className="w-3.5 h-3.5" />
              <span>LIVE ENERGY SYSTEM SIMULATOR</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
              Himalayan <span className="text-[#00E599]">Clean Energy Architecture</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
              Real-time interactive model of Nepal’s interconnected clean grid. Switch seasons and watch hydro, solar, wind, and cross-border power flows rebalance.
            </p>
          </div>

          {/* Clean Unified Controls Bar */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Season Selector */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/90 border border-emerald-500/20">
              {([
                { id: 'monsoon' as Season, icon: CloudRain, label: 'Monsoon' },
                { id: 'winter' as Season, icon: SunMedium, label: 'Winter' },
                { id: 'export' as Season, icon: Globe2, label: 'Export Max' },
              ]).map(s => {
                const Icon = s.icon;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSeason(s.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      season === s.id
                        ? 'bg-[#00E599] text-[#02140E] shadow-[0_0_10px_rgba(0,229,153,0.3)]'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{s.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Time Indicator & Play/Pause */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-emerald-500/20 text-xs font-mono text-slate-300">
              <Clock className="w-3.5 h-3.5 text-[#00E599]" />
              <span className="font-semibold text-white">{formatHour(simHour)} NPT</span>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="ml-1 w-6 h-6 rounded-md bg-emerald-500/20 hover:bg-emerald-500/30 text-[#00E599] flex items-center justify-center transition-colors"
                title={isPlaying ? "Pause simulation" : "Play simulation"}
              >
                {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>

        {/* ── MAIN 2-COLUMN DISPLAY ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

          {/* ── LEFT: Geospatial Animated Canvas (8 cols) ── */}
          <div className="lg:col-span-7 xl:col-span-8 relative rounded-2xl bg-slate-950 border border-emerald-500/25 overflow-hidden shadow-2xl flex flex-col justify-between">
            <div className={`relative w-full aspect-[16/10] sm:aspect-[16/9] min-h-[380px] bg-gradient-to-b ${getSkyGradient(simHour)} transition-colors duration-1000`}>

              {/* Photo background layer */}
              <Image
                src="/images/dam_reservoir_himalaya.webp"
                alt="Himalayan landscape"
                fill
                priority
                className="object-cover object-center mix-blend-overlay opacity-40"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#020a07] via-[#02140e]/60 to-transparent" />

              {/* Top Corner Pill Badges */}
              <div className="absolute top-3 left-3 z-30 flex items-center gap-2 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-mono text-slate-300">
                <Compass className="w-3 h-3 text-[#00E599]" />
                <span>27°N 85°E · Nepal Energy Grid</span>
              </div>
              <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-emerald-500/30 text-[10px] font-mono text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00E599] animate-pulse" />
                <span>LIVE GRID</span>
              </div>

              {/* ═══════ VECTOR SCENE WITH ANIMATIONS ═══════ */}
              <svg viewBox="0 0 1000 620" className="absolute inset-0 w-full h-full z-10" preserveAspectRatio="xMidYMid slice">
                <defs>
                  <linearGradient id="ecoRiver" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#38BDF8" />
                    <stop offset="50%" stopColor="#00E599" />
                    <stop offset="100%" stopColor="#0284C7" />
                  </linearGradient>

                  <linearGradient id="ecoMtn1" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#D9F2E6" />
                    <stop offset="40%" stopColor="#1E4738" />
                    <stop offset="100%" stopColor="#0a1f17" />
                  </linearGradient>

                  <linearGradient id="ecoMtn2" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#123B2D" />
                    <stop offset="100%" stopColor="#071a12" />
                  </linearGradient>

                  <linearGradient id="ecoMtn3" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#0D2E22" />
                    <stop offset="100%" stopColor="#040e0a" />
                  </linearGradient>

                  <filter id="ecoGlow" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="3" result="b" />
                    <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>

                  <style>{`
                    @keyframes ecoDash { 0%{stroke-dashoffset:40}100%{stroke-dashoffset:0} }
                    @keyframes ecoSpin { from{transform:rotate(0deg)}to{transform:rotate(360deg)} }
                    @keyframes ecoPulseR { 0%,100%{r:5;opacity:0.8}50%{r:8;opacity:0.3} }
                    .eco-flow { stroke-dasharray:10 6; animation:ecoDash 1.8s linear infinite }
                    .eco-energy { stroke-dasharray:6 12; animation:ecoDash 1.2s linear infinite }
                    .eco-pulse { animation:ecoPulseR 2s ease-in-out infinite }
                  `}</style>
                </defs>

                {/* Mountains */}
                <path d="M 0,280 L 80,140 L 160,210 L 280,80 L 360,170 L 500,55 L 620,160 L 740,90 L 860,200 L 940,130 L 1000,230 L 1000,620 L 0,620 Z"
                  fill="url(#ecoMtn1)" opacity="0.75" />
                <path d="M 0,340 Q 150,240 280,275 T 550,265 T 800,295 T 1000,310 L 1000,620 L 0,620 Z"
                  fill="url(#ecoMtn2)" />
                <path d="M 0,410 Q 200,350 380,380 T 750,400 T 1000,440 L 1000,620 L 0,620 Z"
                  fill="url(#ecoMtn3)" />

                {/* Glacial River Flow */}
                <path d="M 260,220 C 275,280 285,320 300,370 C 310,420 305,470 290,560"
                  fill="none" stroke="url(#ecoRiver)" strokeWidth="10" strokeLinecap="round" opacity="0.8" />
                <path d="M 260,220 C 275,280 285,320 300,370 C 310,420 305,470 290,560"
                  fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"
                  className="eco-flow" opacity="0.7" />

                {/* Spinning Wind Turbines */}
                <g>
                  <line x1="150" y1="230" x2="150" y2="160" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="150" cy="160" r="3" fill="#00E599" />
                  <g style={{ transformOrigin: '150px 160px', animation: `ecoSpin ${Math.max(2, 7 - sim.windSpeedMs * 0.3)}s linear infinite` }}>
                    <line x1="150" y1="160" x2="150" y2="125" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
                    <line x1="150" y1="160" x2="180" y2="175" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
                    <line x1="150" y1="160" x2="120" y2="175" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
                  </g>
                </g>

                {/* Solar Arrays */}
                <g transform="translate(460,285)" opacity={sim.solarMW > 10 ? '1' : '0.4'} className="transition-opacity duration-700">
                  <polygon points="0,16 32,0 68,4 32,20" fill="#0284C7" stroke="#38BDF8" strokeWidth="0.8" />
                  <polygon points="10,28 42,12 78,16 42,32" fill="#0369A1" stroke="#38BDF8" strokeWidth="0.8" />
                  <polygon points="20,40 52,24 88,28 52,44" fill="#0284C7" stroke="#38BDF8" strokeWidth="0.8" />
                </g>

                {/* Transmission Pylons and Animated Grid Line */}
                <g>
                  <path d="M 390,340 L 400,290 L 410,340" stroke="#94A3B8" strokeWidth="1.5" fill="none" />
                  <path d="M 600,360 L 612,305 L 624,360" stroke="#CBD5E1" strokeWidth="1.8" fill="none" />
                  <path d="M 830,380 L 844,305 L 858,380" stroke="#E2E8F0" strokeWidth="2" fill="none" />
                  <path d="M 400,290 Q 500,315 612,305 Q 720,325 844,305 Q 920,330 1000,340"
                    fill="none" stroke="#00E599" strokeWidth="2.5"
                    className="eco-energy" filter="url(#ecoGlow)" opacity="0.8" />
                </g>

                {/* Interactive Facility Nodes */}
                {Object.entries(nodePositions).map(([id, pos]) => {
                  const isActive = selectedPlant === id;
                  const detail = plantDetails[id];

                  return (
                    <g key={id} className="cursor-pointer" onClick={() => setSelectedPlant(id)}>
                      {/* Pulse circle */}
                      <circle cx={pos.x} cy={pos.y} r="8" className="eco-pulse"
                        stroke={isActive ? '#00E599' : '#00E59960'} fill="none" strokeWidth="1.5" />

                      {/* Interactive ring */}
                      <circle cx={pos.x} cy={pos.y} r={isActive ? 16 : 11}
                        fill={isActive ? 'rgba(0,229,153,0.3)' : 'rgba(0,229,153,0.1)'}
                        stroke={isActive ? '#00E599' : '#00E59980'}
                        strokeWidth={isActive ? 2 : 1}
                        filter={isActive ? 'url(#ecoGlow)' : undefined}
                        className="transition-all duration-300" />

                      {/* Center dot */}
                      <circle cx={pos.x} cy={pos.y} r={isActive ? 6 : 4}
                        fill={isActive ? '#00E599' : '#94A3B8'} />

                      {/* Pill Badge */}
                      <g>
                        <rect x={pos.x + 12} y={pos.y - 14} width={74} height={20} rx="5"
                          fill="rgba(2,10,7,0.92)" stroke={isActive ? '#00E599' : 'rgba(255,255,255,0.2)'} strokeWidth="0.8" />
                        <text x={pos.x + 18} y={pos.y} fill={isActive ? '#00E599' : '#CBD5E1'} fontSize="9" fontWeight="bold" fontFamily="monospace">
                          {pos.label}: {detail.currentMW}M
                        </text>
                      </g>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* ── SLEEK LIVE HUD FOOTER (Clean 4 metrics, no clutter) ── */}
            <div className="p-4 bg-slate-950/95 border-t border-emerald-500/20">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">Total Generation</div>
                  <div className="text-white font-bold text-sm sm:text-base pt-0.5">
                    <Ticker value={sim.totalGenMW} /> <span className="text-xs text-emerald-400 font-normal">MW</span>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">Grid Frequency</div>
                  <div className={`font-bold text-sm sm:text-base pt-0.5 ${Math.abs(sim.gridFreqHz - 50) < 0.05 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    <Ticker value={sim.gridFreqHz} decimals={2} /> <span className="text-xs text-slate-400 font-normal">Hz</span>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">Cross-Border Export</div>
                  <div className="text-emerald-400 font-bold text-sm sm:text-base pt-0.5">
                    <Ticker value={sim.exportMW} /> <span className="text-xs text-slate-400 font-normal">MW</span>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">River Inflow</div>
                  <div className="text-sky-400 font-bold text-sm sm:text-base pt-0.5">
                    <Ticker value={sim.riverFlowM3} /> <span className="text-xs text-slate-400 font-normal">m³/s</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* ── RIGHT: Focused Facility Spotlight Card (4 cols) ── */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col justify-between rounded-2xl bg-slate-950/90 border border-emerald-500/25 p-5 shadow-2xl space-y-5">
            
            {/* Facility Navigation Tabs */}
            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-2.5">
                Select Facility Node
              </div>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(plantDetails).map(([id, p]) => {
                  const isActive = selectedPlant === id;
                  const Icon = p.icon;
                  return (
                    <button
                      key={id}
                      onClick={() => setSelectedPlant(id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-[#00E599] text-[#02140E] shadow-[0_0_10px_rgba(0,229,153,0.3)]'
                          : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{p.category.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Facility Spotlight */}
            <div className="space-y-4 flex-1">
              {/* Photo Preview */}
              <div className="relative h-44 w-full rounded-xl overflow-hidden border border-white/10">
                <Image
                  src={plant.image}
                  alt={plant.name}
                  fill
                  className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                
                <div className="absolute top-2.5 left-2.5">
                  <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[9px] font-mono font-bold text-emerald-300 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    OPERATIONAL
                  </span>
                </div>

                <div className="absolute bottom-2.5 left-3 right-3">
                  <div className="text-[9px] font-mono text-[#00E599] font-bold uppercase tracking-wider">
                    {plant.category}
                  </div>
                  <h3 className="text-base font-bold text-white tracking-tight leading-snug">
                    {plant.name}
                  </h3>
                </div>
              </div>

              {/* Output Meter */}
              <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/20 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-300">
                  <span>GENERATION CAPACITY</span>
                  <span className="text-[#00E599] font-bold">{loadPct}% LOAD</span>
                </div>
                <div className="text-xl font-bold text-white font-mono">
                  <Ticker value={plant.currentMW} /> <span className="text-xs text-slate-400 font-normal">/ {plant.ratedMW} MW RATED</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-[#00E599] transition-all duration-500 rounded-full"
                    style={{ width: `${loadPct}%` }}
                  />
                </div>
              </div>

              {/* Specifications */}
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Elevation</span>
                  <span className="text-white text-right">{plant.elevation}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Turbine / Technology</span>
                  <span className="text-white text-[11px] text-right truncate max-w-[210px]">{plant.turbine}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Grid Route</span>
                  <span className="text-emerald-400 text-[11px] text-right truncate max-w-[210px]">{plant.gridRoute}</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-300 leading-relaxed pt-1">
                {plant.desc}
              </p>
            </div>

            {/* Highlights bullet points */}
            <div className="pt-2 border-t border-white/10 space-y-1.5">
              {plant.highlights.map((h, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00E599] shrink-0 mt-0.5" />
                  <span>{h}</span>
                </div>
              ))}
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

export default HimalayanEcosystemGraphic;
