import React, { useState, useEffect } from "react";
import { DollarSign, Maximize2, Save, Sparkles, Calculator, Check, ArrowRight, Palette } from "lucide-react";
import { CanvasElement } from "../../../types";

interface InspectorPriceAndSizeProps {
  primarySelected: CanvasElement;
  selectedElementsCount: number;
  updateSelectedBatch: (updates: Partial<CanvasElement> | ((el: CanvasElement) => Partial<CanvasElement>)) => void;
  saveToStorage?: () => void;
  isSaving?: boolean;
}

export function InspectorPriceAndSize({
  primarySelected,
  selectedElementsCount,
  updateSelectedBatch,
  saveToStorage,
  isSaving,
}: InspectorPriceAndSizeProps) {
  const [resizeCanvasBox, setResizeCanvasBox] = useState(false);

  // Per sq. meter rates
  const currentSqm = primarySelected.sizeSqM || 1;
  const initialRateNPR =
    primarySelected.ratePerSqMNPR ??
    (primarySelected.priceNPR && primarySelected.sizeSqM
      ? Math.round(primarySelected.priceNPR / primarySelected.sizeSqM)
      : 10500);
  const initialRateUSD =
    primarySelected.ratePerSqMUSD ??
    (primarySelected.priceUSD && primarySelected.sizeSqM
      ? Number((primarySelected.priceUSD / primarySelected.sizeSqM).toFixed(2))
      : 83.33);

  const [rateNPR, setRateNPR] = useState<number>(initialRateNPR);
  const [rateUSD, setRateUSD] = useState<number>(initialRateUSD);

  useEffect(() => {
    const rNpr =
      primarySelected.ratePerSqMNPR ??
      (primarySelected.priceNPR && primarySelected.sizeSqM
        ? Math.round(primarySelected.priceNPR / primarySelected.sizeSqM)
        : 10500);
    const rUsd =
      primarySelected.ratePerSqMUSD ??
      (primarySelected.priceUSD && primarySelected.sizeSqM
        ? Number((primarySelected.priceUSD / primarySelected.sizeSqM).toFixed(2))
        : 83.33);
    setRateNPR(rNpr);
    setRateUSD(rUsd);
  }, [primarySelected.id, primarySelected.ratePerSqMNPR, primarySelected.ratePerSqMUSD]);

  const isIrregular =
    primarySelected.category === "Irregular Bare Space" ||
    Boolean(primarySelected.isIrregular);

  const calculatedTotalNPR = Math.round(currentSqm * rateNPR);
  const calculatedTotalUSD = Math.round(currentSqm * rateUSD);

  const handleApplyRateToPrice = (overrideNPR?: number, overrideUSD?: number) => {
    const finalRateNPR = overrideNPR ?? rateNPR;
    const finalRateUSD = overrideUSD ?? rateUSD;
    const finalNPR = Math.round(currentSqm * finalRateNPR);
    const finalUSD = Math.round(currentSqm * finalRateUSD);

    updateSelectedBatch({
      priceNPR: finalNPR,
      priceUSD: finalUSD,
      ratePerSqMNPR: finalRateNPR,
      ratePerSqMUSD: finalRateUSD,
      isIrregular: true,
      category:
        primarySelected.category === "Hollow Wall / Boundary" ||
        primarySelected.category === "Zone / Functional Area" ||
        primarySelected.category === "Irregular Bare Space"
          ? "Irregular Bare Space"
          : primarySelected.category,
    });
  };

  const handleSetIrregularBareSpace = () => {
    const currentColor =
      primarySelected.color && primarySelected.color !== "transparent"
        ? primarySelected.color
        : "#0D9488";
    const currentBorder = primarySelected.borderColor || "#2DD4BF";

    updateSelectedBatch({
      category: "Irregular Bare Space",
      isIrregular: true,
      color: currentColor,
      fillOpacity: 0.85,
      borderColor: currentBorder,
      textColor: "#FFFFFF",
      dimensions: primarySelected.dimensions || `${currentSqm} m² (Custom)`,
      priceNPR: calculatedTotalNPR,
      priceUSD: calculatedTotalUSD,
      ratePerSqMNPR: rateNPR,
      ratePerSqMUSD: rateUSD,
    });
  };

  return (
    <>
      {/* 1. PRICE CONFIGURATION (NPR & USD) */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
            <span>Price & Commercials</span>
          </span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
            {selectedElementsCount > 1 ? "Batch Updates All" : "Per Stall"}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-slate-600 dark:text-slate-400 block mb-1">Price (NPR)</label>
            <input
              type="number"
              step="5000"
              value={primarySelected.priceNPR || 0}
              onChange={(e) => updateSelectedBatch({ priceNPR: Number(e.target.value) })}
              className="w-full p-2 rounded-lg bg-white dark:bg-[#070B12] border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-600 dark:text-slate-400 block mb-1">Price (USD $)</label>
            <input
              type="number"
              step="50"
              value={primarySelected.priceUSD || 0}
              onChange={(e) => updateSelectedBatch({ priceUSD: Number(e.target.value) })}
              className="w-full p-2 rounded-lg bg-white dark:bg-[#070B12] border border-slate-200 dark:border-slate-700 text-sky-600 dark:text-sky-400 font-mono font-bold text-xs focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        {/* 1.1 PER SQ. METER AMOUNT (IRREGULAR BARE SPACE CALCULATOR) */}
        <div className="p-3 rounded-xl bg-teal-500/10 dark:bg-teal-950/25 border border-teal-500/30 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-teal-900 dark:text-teal-300 text-xs">
              <Calculator className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Rate Per Sq. Meter (Irregular Space)</span>
            </div>
            <span
              className={`text-[9px] px-2 py-0.5 rounded-full font-mono font-bold uppercase ${
                isIrregular
                  ? "bg-teal-600 text-white"
                  : "bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300"
              }`}
            >
              {isIrregular ? "Irregular Space" : "Standard Space"}
            </span>
          </div>

          <p className="text-[10px] text-teal-800 dark:text-teal-300/80 leading-tight">
            Official tariff: Irregular size stalls are charged on actual footprint at <strong>NRs 10,500/m²</strong> (approx. <strong>$83.33/m²</strong>).
          </p>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-teal-900 dark:text-teal-300 font-medium block mb-1">
                Rate / m² (NPR)
              </label>
              <input
                type="number"
                step="500"
                value={rateNPR}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setRateNPR(val);
                  updateSelectedBatch({ ratePerSqMNPR: val });
                }}
                className="w-full p-2 rounded-lg bg-white dark:bg-[#070B12] border border-teal-300 dark:border-teal-700 text-teal-700 dark:text-teal-300 font-mono font-bold text-xs focus:outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-teal-900 dark:text-teal-300 font-medium block mb-1">
                Rate / m² (USD $)
              </label>
              <input
                type="number"
                step="5"
                value={rateUSD}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setRateUSD(val);
                  updateSelectedBatch({ ratePerSqMUSD: val });
                }}
                className="w-full p-2 rounded-lg bg-white dark:bg-[#070B12] border border-teal-300 dark:border-teal-700 text-teal-700 dark:text-teal-300 font-mono font-bold text-xs focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          {/* Quick Per-SQM Tariff Presets */}
          <div className="pt-1">
            <span className="text-[9.5px] text-teal-800 dark:text-teal-400 font-medium block mb-1">
              Official Rate Presets:
            </span>
            <div className="grid grid-cols-3 gap-1">
              {[
                { label: "Bare (10.5k)", npr: 10500, usd: 83.33 },
                { label: "Prime (13.1k)", npr: 13125, usd: 104.17 },
                { label: "Shell (20k)", npr: 20000, usd: 150 },
              ].map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => {
                    setRateNPR(p.npr);
                    setRateUSD(p.usd);
                    handleApplyRateToPrice(p.npr, p.usd);
                  }}
                  className="py-1 px-1.5 rounded bg-white dark:bg-slate-900 hover:bg-teal-50 dark:hover:bg-teal-900/40 border border-teal-200 dark:border-teal-800 text-[9.5px] font-mono text-teal-800 dark:text-teal-200 text-center transition-colors cursor-pointer truncate"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Calculated Output & Apply Buttons */}
          <div className="pt-2 border-t border-teal-500/20 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono font-bold text-teal-950 dark:text-teal-200">
              <span>{currentSqm} m² × Rate:</span>
              <span className="text-teal-700 dark:text-teal-300">
                NPR {calculatedTotalNPR.toLocaleString()} (${calculatedTotalUSD.toLocaleString()})
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => handleApplyRateToPrice()}
                className="py-1.5 px-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-[10px] flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs"
              >
                <Check className="w-3 h-3" />
                <span>Apply Rate × Area</span>
              </button>

              <button
                type="button"
                onClick={handleSetIrregularBareSpace}
                className="py-1.5 px-2 rounded-lg bg-teal-100 hover:bg-teal-200 dark:bg-teal-900/60 dark:hover:bg-teal-800 text-teal-900 dark:text-teal-100 font-bold text-[10px] flex items-center justify-center gap-1 transition-all cursor-pointer border border-teal-300 dark:border-teal-700"
              >
                <ArrowRight className="w-3 h-3" />
                <span>Set Irregular Space</span>
              </button>
            </div>
          </div>

          {/* 1.2 Irregular Space Color & Appearance Customization */}
          <div className="pt-2 border-t border-teal-500/20 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-teal-950 dark:text-teal-200">
              <span className="flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>Irregular Space Color &amp; Appearance</span>
              </span>
              <span className="text-[9.5px] font-mono text-teal-600 dark:text-teal-400">
                {primarySelected.color || "#0D9488"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-teal-900 dark:text-teal-300 font-medium block mb-1">
                  Fill Color
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={
                      primarySelected.color === "transparent" || !primarySelected.color
                        ? "#0D9488"
                        : primarySelected.color
                    }
                    onChange={(e) =>
                      updateSelectedBatch({
                        color: e.target.value,
                        fillOpacity: primarySelected.fillOpacity || 0.85,
                        textColor: "#FFFFFF",
                      })
                    }
                    className="w-7 h-7 rounded-md border border-teal-300 dark:border-teal-700 bg-transparent cursor-pointer shrink-0"
                    title="Choose Custom Fill Color"
                  />
                  <input
                    type="text"
                    value={primarySelected.color || "#0D9488"}
                    onChange={(e) =>
                      updateSelectedBatch({
                        color: e.target.value,
                        fillOpacity: primarySelected.fillOpacity || 0.85,
                        textColor: "#FFFFFF",
                      })
                    }
                    className="w-full px-2 py-1 rounded bg-white dark:bg-[#070B12] border border-teal-300 dark:border-teal-700 text-teal-800 dark:text-teal-200 font-mono text-[10px]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-teal-900 dark:text-teal-300 font-medium block mb-1">
                  Border Color
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={primarySelected.borderColor || "#2DD4BF"}
                    onChange={(e) => updateSelectedBatch({ borderColor: e.target.value })}
                    className="w-7 h-7 rounded-md border border-teal-300 dark:border-teal-700 bg-transparent cursor-pointer shrink-0"
                    title="Choose Custom Border Color"
                  />
                  <input
                    type="text"
                    value={primarySelected.borderColor || "#2DD4BF"}
                    onChange={(e) => updateSelectedBatch({ borderColor: e.target.value })}
                    className="w-full px-2 py-1 rounded bg-white dark:bg-[#070B12] border border-teal-300 dark:border-teal-700 text-teal-800 dark:text-teal-200 font-mono text-[10px]"
                  />
                </div>
              </div>
            </div>

            {/* Quick Theme Presets for Irregular Stall */}
            <div>
              <span className="text-[9.5px] text-teal-800 dark:text-teal-400 font-medium block mb-1">
                Quick Preset Themes:
              </span>
              <div className="grid grid-cols-4 gap-1">
                {[
                  { name: "Teal", fill: "#0D9488", border: "#2DD4BF" },
                  { name: "Emerald", fill: "#059669", border: "#34D399" },
                  { name: "Cyan", fill: "#0891B2", border: "#22D3EE" },
                  { name: "Sky", fill: "#0284C7", border: "#38BDF8" },
                  { name: "Amber", fill: "#D97706", border: "#FBBF24" },
                  { name: "Violet", fill: "#7C3AED", border: "#A78BFA" },
                  { name: "Rose", fill: "#E11D48", border: "#FB7185" },
                  { name: "Slate", fill: "#334155", border: "#94A3B8" },
                ].map((palette) => (
                  <button
                    key={palette.name}
                    type="button"
                    title={palette.name}
                    onClick={() =>
                      updateSelectedBatch({
                        color: palette.fill,
                        borderColor: palette.border,
                        fillOpacity: 0.85,
                        textColor: "#FFFFFF",
                      })
                    }
                    className="flex items-center gap-1 p-1 rounded bg-white dark:bg-slate-900 border border-teal-200 dark:border-teal-800 hover:scale-102 transition-transform cursor-pointer justify-center"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 border border-black/20"
                      style={{ backgroundColor: palette.fill }}
                    />
                    <span className="text-[9px] font-medium text-slate-700 dark:text-slate-300 font-sans truncate">
                      {palette.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Prime Location Toggle */}
        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-300 text-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Prime Location (+25%)</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(primarySelected.isPrime)}
                onChange={(e) => updateSelectedBatch({ isPrime: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-8 h-4.5 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>
          <p className="text-[10px] text-amber-800 dark:text-amber-300/80 leading-tight">
            Prime stalls automatically add the configured prime surcharge on the public interactive map and booking wizard.
          </p>
          {primarySelected.isPrime && (
            <div className="pt-1.5 border-t border-amber-500/20 flex items-center justify-between text-[10px] font-mono font-bold text-amber-900 dark:text-amber-300">
              <span>+25% Surcharge:</span>
              <span>
                NPR {Math.round((primarySelected.priceNPR || 0) * 0.25).toLocaleString()} ($ {Math.round((primarySelected.priceUSD || 0) * 0.25).toLocaleString()})
              </span>
            </div>
          )}
        </div>

        {/* Quick Price Chips */}
        <div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-1">Quick Price Tiers:</span>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { label: "NPR 315k (30m² Irregular)", npr: 315000, usd: 2500 },
              { label: "NPR 378k (6×6 Space)", npr: 378000, usd: 3000 },
              { label: "NPR 180k (Shell 3×3)", npr: 180000, usd: 1350 },
              { label: "NPR 450k (5×6 Space)", npr: 450000, usd: 3400 },
              { label: "NPR 600k (Prime 6×6)", npr: 600000, usd: 4500 },
              { label: "NPR 875k (10×7 Bare)", npr: 875000, usd: 6500 },
              { label: "NPR 1.2M (Pavilion)", npr: 1200000, usd: 9000 },
              { label: "NPR 0 (Wall / Outline)", npr: 0, usd: 0 },
            ].map((tier) => (
              <button
                key={tier.label}
                type="button"
                onClick={() => updateSelectedBatch({ priceNPR: tier.npr, priceUSD: tier.usd })}
                className="p-1.5 rounded bg-white dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] text-left truncate font-mono border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
              >
                {tier.label}
              </button>
            ))}
          </div>
        </div>

        {saveToStorage && (
          <button
            type="button"
            onClick={saveToStorage}
            disabled={isSaving}
            className="w-full mt-2.5 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-60"
          >
            <Save className={`w-3.5 h-3.5 ${isSaving ? "animate-spin" : ""}`} />
            <span>{isSaving ? "Saving to Server..." : "Save Prices to Live Map"}</span>
          </button>
        )}
      </div>

      {/* 2. SIZE & DIMENSIONS CONFIGURATION */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
            <Maximize2 className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
            <span>Dimensions & Size</span>
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
            {primarySelected.sizeSqM} sq.m ({primarySelected.sizeSqFt} sq.ft)
          </span>
        </div>

        {/* Direct Area (sq.m) & Dimension Label Input */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-slate-600 dark:text-slate-400 block mb-1">
              Area (sq.m / m²)
            </label>
            <input
              type="number"
              step="1"
              min="1"
              value={primarySelected.sizeSqM || 0}
              onChange={(e) => {
                const sqm = Math.max(1, Number(e.target.value));
                const sqft = Math.round(sqm * 10.764);
                const updates: Partial<CanvasElement> = {
                  sizeSqM: sqm,
                  sizeSqFt: sqft,
                };
                if (isIrregular) {
                  updates.priceNPR = Math.round(sqm * rateNPR);
                  updates.priceUSD = Math.round(sqm * rateUSD);
                  updates.ratePerSqMNPR = rateNPR;
                  updates.ratePerSqMUSD = rateUSD;
                }
                updateSelectedBatch(updates);
              }}
              className="w-full p-2 rounded-lg bg-white dark:bg-[#070B12] border border-slate-200 dark:border-slate-700 text-sky-600 dark:text-sky-400 font-mono font-bold text-xs focus:outline-none focus:border-sky-500"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-600 dark:text-slate-400 block mb-1">
              Dimensions Text
            </label>
            <input
              type="text"
              value={primarySelected.dimensions || ""}
              onChange={(e) => updateSelectedBatch({ dimensions: e.target.value })}
              placeholder="e.g. Custom m²"
              className="w-full p-2 rounded-lg bg-white dark:bg-[#070B12] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-mono font-semibold text-xs focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        {/* Width & Height Pixel Sliders + Direct Number Inputs */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="flex justify-between items-center text-[10px] text-slate-600 dark:text-slate-400 mb-1">
              <span>Width</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="5"
                  max="600"
                  value={primarySelected.width}
                  onChange={(e) => updateSelectedBatch({ width: Math.max(5, Number(e.target.value)) })}
                  className="w-12 px-1 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-mono text-right text-[10px]"
                />
                <span className="font-mono text-slate-400">px</span>
              </div>
            </div>
            <input
              type="range"
              min="5"
              max="300"
              value={primarySelected.width}
              onChange={(e) => updateSelectedBatch({ width: Number(e.target.value) })}
              className="w-full accent-sky-400 h-1 bg-slate-200 dark:bg-slate-800 rounded cursor-pointer"
            />
          </div>
          <div>
            <div className="flex justify-between items-center text-[10px] text-slate-600 dark:text-slate-400 mb-1">
              <span>Height</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="5"
                  max="600"
                  value={primarySelected.height}
                  onChange={(e) => updateSelectedBatch({ height: Math.max(5, Number(e.target.value)) })}
                  className="w-12 px-1 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-mono text-right text-[10px]"
                />
                <span className="font-mono text-slate-400">px</span>
              </div>
            </div>
            <input
              type="range"
              min="5"
              max="300"
              value={primarySelected.height}
              onChange={(e) => updateSelectedBatch({ height: Number(e.target.value) })}
              className="w-full accent-sky-400 h-1 bg-slate-200 dark:bg-slate-800 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Standard Meter Size Presets */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Standard Physical Sizes:</span>
            <label className="flex items-center gap-1.5 text-[9.5px] text-slate-500 dark:text-slate-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={resizeCanvasBox}
                onChange={(e) => setResizeCanvasBox(e.target.checked)}
                className="rounded text-sky-500 w-3 h-3 cursor-pointer"
              />
              <span>Also resize canvas box</span>
            </label>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { label: "Irregular Bare (30m²)", w: 80, h: 80, sqm: 30, dim: "Custom m²", isIrr: true },
              { label: "3m × 3m (9 sq.m)", w: 45, h: 45, sqm: 9, dim: "3m × 3m" },
              { label: "6m × 6m (36 sq.m)", w: 90, h: 90, sqm: 36, dim: "6m × 6m" },
              { label: "10m × 7m (70 sq.m)", w: 140, h: 98, sqm: 70, dim: "10m × 7m" },
              { label: "5m × 6m (30 sq.m)", w: 75, h: 90, sqm: 30, dim: "5m × 6m" },
              { label: "8m × 8m (64 sq.m)", w: 120, h: 120, sqm: 64, dim: "8m × 8m" },
              { label: "20ft × 60ft Bare", w: 180, h: 60, sqm: 111, dim: "20ft × 60ft" },
            ].map((dim) => {
              const isCurrent = primarySelected.dimensions === dim.dim;
              return (
                <button
                  key={dim.label}
                  type="button"
                  onClick={() =>
                    updateSelectedBatch({
                      sizeSqM: dim.sqm,
                      sizeSqFt: Math.round(dim.sqm * 10.764),
                      dimensions: dim.dim,
                      ...(dim.isIrr
                        ? {
                            category: "Irregular Bare Space",
                            isIrregular: true,
                            priceNPR: Math.round(dim.sqm * rateNPR),
                            priceUSD: Math.round(dim.sqm * rateUSD),
                            ratePerSqMNPR: rateNPR,
                            ratePerSqMUSD: rateUSD,
                            color: "#0D9488",
                            fillOpacity: 0.85,
                            borderColor: "#2DD4BF",
                            textColor: "#FFFFFF",
                          }
                        : {}),
                      ...(resizeCanvasBox ? { width: dim.w, height: dim.h } : {}),
                    })
                  }
                  className={`p-1.5 rounded text-left truncate font-mono border transition-colors cursor-pointer text-[10px] ${
                    isCurrent
                      ? "bg-sky-50 dark:bg-sky-950/60 border-sky-500 text-sky-600 dark:text-sky-300 font-bold shadow-xs"
                      : "bg-white dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800"
                  }`}
                >
                  {dim.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
