"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Plane, Building2, Wifi, ArrowRight, Compass } from "lucide-react";

export default function KathmanduVenueGuide() {
  const [activeTab, setActiveTab] = useState<"LOCATION" | "AIRPORT" | "HOTELS" | "FACILITIES">("LOCATION");

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm overflow-hidden font-sans">
      <div className="w-full">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Bhrikutimandap Exhibition Complex
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Exhibition Road, Kathmandu — Nepal&apos;s premier convention hub.
            </p>
          </div>
          <a
            href="https://maps.google.com/?q=Bhrikutimandap+Exhibition+Complex+Kathmandu"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors self-start lg:self-auto"
          >
            <span>Open in Google Maps</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Split View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Main Visual */}
          <div className="lg:col-span-7 relative min-h-[400px] sm:min-h-[480px] rounded-3xl overflow-hidden shadow-lg border border-slate-200 group">
            <Image
              src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1600&q=85"
              alt="Kathmandu Valley & Himalayan Backdrop"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-95"
            />

            {/* Float Coordinates */}
            <div className="absolute top-6 left-6 p-3 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 text-xs font-technical text-slate-800 shadow-sm font-semibold">
              <div className="flex items-center gap-2 text-hydro-primary font-bold">
                <Compass className="w-4 h-4" />
                <span>BHRIKUTIMANDAP COMPLEX</span>
              </div>
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                27°42&apos;09&quot;N · 85°19&apos;07&quot;E · 1,400M ASL
              </span>
            </div>

            {/* Bottom Venue Highlights */}
            <div className="absolute bottom-6 left-6 right-6 p-6 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 text-slate-900 shadow-xl">
              <h4 className="font-display font-bold text-xl text-slate-900">
                Bhrikutimandap Exhibition Grounds
              </h4>
              <p className="text-xs text-slate-600 mt-1 font-normal">
                Exhibition Road, Kathmandu. Nepal&apos;s premier purpose-built convention hub featuring 10,000+ m² indoor exhibition space and extensive outdoor demonstration arenas.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                <Link
                  href="/venue"
                  className="font-technical text-xs font-bold text-hydro-primary hover:text-hydro-deep transition-colors flex items-center gap-1.5"
                >
                  <span>EXPLORE VENUE FLOOR GUIDE</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Interactive Info Tabs */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            {/* Tab Navigation */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-hydro-wash p-1.5 rounded-2xl border border-slate-200">
              <button
                onClick={() => setActiveTab("LOCATION")}
                className={`py-2.5 px-3 rounded-xl text-[10px] font-technical tracking-wider font-bold transition-all ${
                  activeTab === "LOCATION"
                    ? "bg-hydro-primary text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                LOCATION
              </button>
              <button
                onClick={() => setActiveTab("AIRPORT")}
                className={`py-2.5 px-3 rounded-xl text-[10px] font-technical tracking-wider font-bold transition-all ${
                  activeTab === "AIRPORT"
                    ? "bg-hydro-primary text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                AIRPORT
              </button>
              <button
                onClick={() => setActiveTab("HOTELS")}
                className={`py-2.5 px-3 rounded-xl text-[10px] font-technical tracking-wider font-bold transition-all ${
                  activeTab === "HOTELS"
                    ? "bg-hydro-primary text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                HOTELS
              </button>
              <button
                onClick={() => setActiveTab("FACILITIES")}
                className={`py-2.5 px-3 rounded-xl text-[10px] font-technical tracking-wider font-bold transition-all ${
                  activeTab === "FACILITIES"
                    ? "bg-hydro-primary text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                FACILITIES
              </button>
            </div>

            {/* Tab Content Body */}
            <div className="p-6 sm:p-8 rounded-3xl bg-hydro-wash border border-slate-200 shadow-sm flex-grow flex flex-col justify-between">
              {activeTab === "LOCATION" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-hydro-primary font-technical text-xs font-bold uppercase">
                    <MapPin className="w-4 h-4" />
                    <span>Prime City Center Location</span>
                  </div>
                  <h3 className="font-display font-bold text-2xl text-slate-900">
                    Centrally Positioned in Kathmandu
                  </h3>
                  <p className="text-xs text-slate-600 font-normal leading-relaxed">
                    Located adjacent to the historic Tudikhel and within 10 minutes drive from central government ministries (Singha Durbar), Nepal Electricity Authority headquarters, and foreign diplomatic missions.
                  </p>
                  <div className="space-y-2 pt-2 text-xs text-slate-700 font-medium">
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200 shadow-sm">
                      <span>Singha Durbar (Energy Ministry)</span>
                      <span className="font-technical text-hydro-primary font-bold">1.2 km (5 mins)</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200 shadow-sm">
                      <span>Durbar Marg (Diplomatic & 5-Star Hub)</span>
                      <span className="font-technical text-hydro-primary font-bold">2.0 km (8 mins)</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "AIRPORT" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-hydro-deep font-technical text-xs font-bold uppercase">
                    <Plane className="w-4 h-4" />
                    <span>International Flight Access</span>
                  </div>
                  <h3 className="font-display font-bold text-2xl text-slate-900">
                    Tribhuvan International Airport (KTM)
                  </h3>
                  <p className="text-xs text-slate-600 font-normal leading-relaxed">
                    Just 5.5 km (20 minutes) from the venue. Direct daily international flight connections from Dubai, Doha, Singapore, Bangkok, Delhi, Mumbai, Kuala Lumpur, Guangzhou, and Istanbul.
                  </p>
                  <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2 text-xs shadow-sm">
                    <span className="text-hydro-primary font-technical font-bold block">
                      OFFICIAL DELEGATE SHUTTLE:
                    </span>
                    <p className="text-slate-600 text-[11px]">
                      Complimentary VIP shuttle service operating every 30 minutes between KTM Airport, official partner hotels, and the Expo grounds.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "HOTELS" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-amber-700 font-technical text-xs font-bold uppercase">
                    <Building2 className="w-4 h-4" />
                    <span>Official 5-Star Partner Hotels</span>
                  </div>
                  <h3 className="font-display font-bold text-2xl text-slate-900">
                    Exclusive Delegate Rates
                  </h3>
                  <p className="text-xs text-slate-600 font-normal leading-relaxed">
                    Preferential discount corporate rates negotiated for all international exhibitors and conference attendees.
                  </p>
                  <div className="space-y-2 pt-1 text-xs">
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200 shadow-sm">
                      <span className="text-slate-900 font-medium">Hotel Yak & Yeti (Heritage 5-Star)</span>
                      <span className="font-technical text-hydro-deep font-bold">1.5 km</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200 shadow-sm">
                      <span className="text-slate-900 font-medium">Kathmandu Marriott Hotel</span>
                      <span className="font-technical text-hydro-deep font-bold">2.4 km</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200 shadow-sm">
                      <span className="text-slate-900 font-medium">Radisson Hotel Kathmandu</span>
                      <span className="font-technical text-hydro-deep font-bold">3.1 km</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "FACILITIES" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-hydro-primary font-technical text-xs font-bold uppercase">
                    <Wifi className="w-4 h-4" />
                    <span>International Standard Infrastructure</span>
                  </div>
                  <h3 className="font-display font-bold text-2xl text-slate-900">
                    Exhibition Amenities
                  </h3>
                  <p className="text-xs text-slate-600 font-normal leading-relaxed">
                    Equipped with redundant high-speed gigabit Wi-Fi, 3-phase industrial power grid, heavy equipment loading docks, dedicated press lounge, and gourmet catering.
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700 pt-2 font-medium">
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-sm">
                      ✓ Simultaneous Translation (EN/NE/ZH)
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-sm">
                      ✓ Heavy Machinery Gantry Access
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-sm">
                      ✓ Dedicated B2B Business Lounges
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-sm">
                      ✓ 24/7 Security & Medical Desk
                    </div>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div className="pt-6 border-t border-slate-200">
                <Link
                  href="/venue"
                  className="w-full py-3.5 rounded-xl bg-white hover:bg-slate-50 text-hydro-deep font-technical text-xs font-bold text-center tracking-wider border border-slate-300 hover:border-hydro-primary transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>GET FULL TRAVEL & VENUE DIRECTIONS</span>
                  <ArrowRight className="w-4 h-4 text-hydro-primary" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
