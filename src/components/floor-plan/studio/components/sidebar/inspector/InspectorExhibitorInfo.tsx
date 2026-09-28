import React from "react";
import { Info, Zap, MapPin, Tag, Building } from "lucide-react";
import { CanvasElement } from "../../../types";

interface InspectorExhibitorInfoProps {
  primarySelected: CanvasElement;
  updateSelectedBatch: (updates: Partial<CanvasElement> | ((el: CanvasElement) => Partial<CanvasElement>)) => void;
}

export function InspectorExhibitorInfo({
  primarySelected,
  updateSelectedBatch,
}: InspectorExhibitorInfoProps) {
  return (
    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3.5">
      <div className="flex items-center justify-between">
        <span className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
          <span>Exhibitor-Facing Information</span>
        </span>
        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono">
          Shown to Exhibitors
        </span>
      </div>

      {/* Power Supply */}
      <div className="space-y-1.5">
        <label className="text-[10px] text-slate-600 dark:text-slate-400 flex items-center gap-1">
          <Zap className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
          <span>Included Power Supply</span>
        </label>
        <input
          type="text"
          value={primarySelected.powerIncluded || "5 kW 3-Phase Power Included"}
          onChange={(e) => updateSelectedBatch({ powerIncluded: e.target.value })}
          placeholder="e.g. 5 kW 3-Phase Power"
          className="w-full p-2 rounded-lg bg-white dark:bg-[#070B12] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-amber-500"
        />
        <div className="flex flex-wrap gap-1">
          {[
            "5 kW 3-Phase Power",
            "15A Single Phase",
            "10 kW Heavy Load",
            "1 kW Basic Lighting",
            "Bare Space (Power Extra)",
          ].map((pwr) => (
            <button
              key={pwr}
              type="button"
              onClick={() => updateSelectedBatch({ powerIncluded: pwr })}
              className="px-2 py-0.5 rounded bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-transparent text-[10px] font-mono cursor-pointer"
            >
              {pwr}
            </button>
          ))}
        </div>
      </div>

      {/* Stall Orientation / Layout Advantage */}
      <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
        <label className="text-[10px] text-slate-600 dark:text-slate-400 flex items-center gap-1">
          <MapPin className="w-3 h-3 text-sky-500 dark:text-sky-400" />
          <span>Orientation & Open Sides</span>
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            "Corner Stall (2-Side Open)",
            "3-Side Open Island",
            "4-Side Open Pavilion",
            "Standard Row (1-Side Open)",
            "Main Plenary Facing",
            "VIP Lounge Adjacent",
          ].map((ori) => (
            <button
              key={ori}
              type="button"
              onClick={() => updateSelectedBatch({ orientation: ori })}
              className={`p-1.5 rounded-lg border text-left text-[10px] font-medium transition-all cursor-pointer ${
                primarySelected.orientation === ori
                  ? "bg-amber-50 dark:bg-amber-500/20 border-amber-400 text-amber-800 dark:text-amber-300 font-bold"
                  : "bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              {ori}
            </button>
          ))}
        </div>
      </div>

      {/* Included Amenities & Deliverables Checklist */}
      <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <label className="text-[10px] text-slate-600 dark:text-slate-400 flex items-center gap-1">
            <Tag className="w-3 h-3 text-pink-500 dark:text-pink-400" />
            <span>Included Stall Amenities</span>
          </label>
          <span className="text-[9px] text-slate-500 dark:text-slate-400 font-mono">Click to toggle</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[
            "1 Reception Counter",
            "2 Visitor Chairs",
            "3 LED Spotlights",
            "1 Power Socket (5A)",
            "Needle Punch Carpet",
            "Fascia Name Board",
            "Octanorm Wall Panels",
            "Daily Stall Cleaning",
            "High-Speed Wi-Fi",
            "2 Delegate Passes",
            "4 Exhibitor Badges",
            "Directory Listing",
          ].map((amenity) => {
            const currentInclusions = primarySelected.inclusions || [
              "1 Reception Counter",
              "2 Visitor Chairs",
              "3 LED Spotlights",
              "1 Power Socket (5A)",
              "Needle Punch Carpet",
              "Fascia Name Board",
              "Octanorm Wall Panels",
              "Daily Stall Cleaning",
              "High-Speed Wi-Fi",
            ];
            const hasAmenity = currentInclusions.includes(amenity);
            return (
              <button
                key={amenity}
                type="button"
                onClick={() => {
                  const next = hasAmenity
                    ? currentInclusions.filter((a: string) => a !== amenity)
                    : [...currentInclusions, amenity];
                  updateSelectedBatch({ inclusions: next });
                }}
                className={`px-2 py-1 rounded-md text-[10px] border transition-all cursor-pointer ${
                  hasAmenity
                    ? "bg-emerald-50 dark:bg-emerald-500/20 border-emerald-500/40 text-emerald-800 dark:text-emerald-300 font-bold"
                    : "bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                {hasAmenity ? `✓ ${amenity}` : `+ ${amenity}`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Target / Recommended Industry */}
      <div className="space-y-1 pt-2 border-t border-slate-200 dark:border-slate-800">
        <label className="text-[10px] text-slate-600 dark:text-slate-400">Recommended Industry Focus</label>
        <input
          type="text"
          value={primarySelected.suitableFor || "Hydro Turbines, Generators, Solar EPC, Green Hydrogen"}
          onChange={(e) => updateSelectedBatch({ suitableFor: e.target.value })}
          placeholder="e.g. Turbine Manufacturers, EPCs, Inverters"
          className="w-full p-2 rounded-lg bg-white dark:bg-[#070B12] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* Marketing Highlight / Description */}
      <div className="space-y-1 pt-2 border-t border-slate-200 dark:border-slate-800">
        <label className="text-[10px] text-slate-600 dark:text-slate-400">Marketing Highlights (Shown in Stall Popup)</label>
        <textarea
          rows={2}
          value={primarySelected.description || ""}
          onChange={(e) => updateSelectedBatch({ description: e.target.value })}
          placeholder="e.g. Prime front-row stall directly facing the main plenary entrance with maximum dignitary footfall."
          className="w-full p-2 rounded-lg bg-white dark:bg-[#070B12] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-amber-500 resize-none"
        />
      </div>

      {/* Assigned Exhibitor (If Booked/Reserved) */}
      <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
        <label className="text-[10px] text-sky-600 dark:text-sky-400 flex items-center gap-1 font-bold">
          <Building className="w-3 h-3" />
          <span>Assigned Occupant / Exhibitor (If Booked)</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            value={primarySelected.bookedBy || ""}
            onChange={(e) => updateSelectedBatch({ bookedBy: e.target.value })}
            placeholder="Company Name (e.g. Voith Hydro)"
            className="w-full p-1.5 rounded bg-white dark:bg-[#070B12] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
          />
          <input
            type="text"
            value={primarySelected.exhibitorCountry || ""}
            onChange={(e) => updateSelectedBatch({ exhibitorCountry: e.target.value })}
            placeholder="Country (e.g. Austria)"
            className="w-full p-1.5 rounded bg-white dark:bg-[#070B12] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
          />
        </div>
        <input
          type="url"
          value={primarySelected.exhibitorWebsite || ""}
          onChange={(e) => updateSelectedBatch({ exhibitorWebsite: e.target.value })}
          placeholder="Website (e.g. https://voith.com)"
          className="w-full p-1.5 rounded bg-white dark:bg-[#070B12] border border-slate-200 dark:border-slate-700 text-sky-600 dark:text-sky-400 text-xs font-mono"
        />
      </div>
    </div>
  );
}
