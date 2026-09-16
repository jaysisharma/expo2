"use client";

import React, { useState } from "react";
import { MapPin, Eye, Compass, Navigation, ExternalLink, Sparkles } from "lucide-react";

export default function VenueMapAnd360() {
  const [viewMode, setViewMode] = useState<"360" | "map">("360");
  const [streetViewLocation, setStreetViewLocation] = useState<"front" | "grounds">("front");

  // Google Maps embed with explicit place location marker / query
  const mapEmbedUrl =
    "https://maps.google.com/maps?q=Bhrikutimandap+Exhibition+Hall,+Pradarshani+Marg,+Kathmandu,+Nepal&t=&z=16&ie=UTF8&iwloc=&output=embed";

  // Google Street View / 360 Photosphere embeds for Bhrikutimandap Exhibition Complex
  const streetViewFrontUrl =
    "https://www.google.com/maps/embed?pb=!4v1708940000000!6m8!1m7!1sCAoSLEFGMVFpcE5uOG1nSWlKcmh2M1l5aDJscjBhX1hJbV9tWVpCSG5jT0V6Vl82!2m2!1d27.701988!2d85.318035!3f240!4f5!5f0.7820865974627469";

  const streetViewGroundsUrl =
    "https://www.google.com/maps/embed?pb=!4v1708940000000!6m8!1m7!1sCAoSLEFGMVFpcE50T1ZwY2Z4UWtfZmVIdlM5bDRlcm1uYV81M3dSZkVqWlR5M0xK!2m2!1d27.702488!2d85.318435!3f120!4f0!5f0.7820865974627469";

  const active360Url =
    streetViewLocation === "front" ? streetViewFrontUrl : streetViewGroundsUrl;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-4 sm:p-6 font-sans">
      {/* Top Bar: View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>Venue Visual Explorer</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#19A974]/15 text-[#19A974] font-bold">
              360° LIVE
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Explore Bhrikutimandap Exhibition Complex in interactive 360° view or pinned 2D map.
          </p>
        </div>

        {/* Toggle Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setViewMode("360")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === "360"
                ? "bg-white text-[#087EA4] shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-[#19A974]" />
            <span>360° View</span>
          </button>

          <button
            onClick={() => setViewMode("map")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === "map"
                ? "bg-white text-[#087EA4] shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-[#087EA4]" />
            <span>Pinned Map View</span>
          </button>
        </div>
      </div>

      {/* 360 Location Angle Selectors (When in 360 mode) */}
      {viewMode === "360" && (
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <Compass className="w-4 h-4 text-[#087EA4]" />
            <span className="font-medium">360° Viewpoint:</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setStreetViewLocation("front")}
              className={`px-3 py-1 rounded-lg font-medium text-xs transition-colors ${
                streetViewLocation === "front"
                  ? "bg-[#087EA4] text-white shadow-xs"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              Main Exhibition Gate & Entrance
            </button>
            <button
              onClick={() => setStreetViewLocation("grounds")}
              className={`px-3 py-1 rounded-lg font-medium text-xs transition-colors ${
                streetViewLocation === "grounds"
                  ? "bg-[#087EA4] text-white shadow-xs"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              Inner Exhibition Grounds & Hall
            </button>
          </div>
        </div>
      )}

      {/* Viewer Frame Container */}
      <div className="relative w-full h-[400px] sm:h-[480px] rounded-xl overflow-hidden bg-slate-900 border border-slate-200">
        {viewMode === "360" ? (
          <>
            <iframe
              title="Bhrikutimandap Exhibition Complex 360 View"
              src={active360Url}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full"
            />
            {/* 360 Interaction Guide Overlay Pill */}
            <div className="absolute bottom-4 left-4 pointer-events-none bg-black/80 backdrop-blur-md text-white text-[11px] px-3.5 py-1.5 rounded-full border border-white/20 flex items-center gap-2 shadow-lg z-10">
              <span className="w-2 h-2 rounded-full bg-[#19A974] animate-ping" />
              <span>Click & drag to look 360° around the venue</span>
            </div>
          </>
        ) : (
          <iframe
            title="Bhrikutimandap Exhibition Complex Pinned Location Map"
            src={mapEmbedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={true}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-full"
          />
        )}
      </div>
    </div>
  );
}
