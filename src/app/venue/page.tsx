import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import VenueMapAnd360 from "@/components/venue/VenueMapAnd360";
import { MapPin, Navigation, ExternalLink, Calendar, ArrowRight, Eye } from "lucide-react";

export const metadata: Metadata = {
  title: "Exhibition Venue & 360° View | Himalayan Green Energy Expo Nepal 2026",
  description:
    "Bhrikutimandap Exhibition Complex, Exhibition Road, Kathmandu, Nepal. Explore the official venue and interactive 360° view for Himalayan Green Energy Expo 2026.",
};

export default function VenuePage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 flex flex-col">
      {/* =========================================================================
          01: SIMPLE HEADER WITH BACKGROUND COLOR (GREEN THEME)
         ========================================================================= */}
      <div className="bg-[#04281E] text-white pt-32 sm:pt-36 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 border-b border-emerald-500/20">
        <div className="max-w-5xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-emerald-300/70 font-mono mb-3">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#34D399]">Venue</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Exhibition Venue
          </h1>
          <p className="mt-3 text-sm sm:text-base text-emerald-100/75 max-w-xl">
            Bhrikutimandap Exhibition Complex, Exhibition Road, Kathmandu, Nepal.
          </p>
        </div>
      </div>

      {/* =========================================================================
          02: FOCUSED VENUE LOCATION CONTENT & 360° EXPLORER
         ========================================================================= */}
      <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 flex-grow">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Venue Info & Visual Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch">
            {/* Venue Image */}
            <div className="lg:col-span-6 relative min-h-[300px] sm:min-h-[380px] bg-slate-900">
              <Image
                src="/images/gallery/2024_expo.jpg"
                alt="Bhrikutimandap Exhibition Complex Kathmandu - Himalayan Hydro Expo"
                fill
                priority
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent lg:hidden" />
              <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-md text-white text-[11px] font-semibold px-3 py-1 rounded-md border border-white/20">
                Bhrikutimandap Main Exhibition Pavilion
              </div>
            </div>

            {/* Venue Details */}
            <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div>
                <span className="text-xs font-semibold text-[#087EA4] uppercase tracking-wider block mb-1">
                  Official Expo Grounds
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  Bhrikutimandap Exhibition Complex
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  Nepal&apos;s premier purpose-built exhibition arena located in central Kathmandu. Hosting 150+ international exhibitors, heavy hydropower machinery displays, and technical conference delegates.
                </p>

                <div className="mt-5 space-y-2.5 pt-4 border-t border-slate-100 text-xs text-slate-700 font-medium">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-[#087EA4] shrink-0 mt-0.5" />
                    <span>Exhibition Road, Pradarshani Marg, Kathmandu 44600, Nepal</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-[#19A974] shrink-0" />
                    <span>Magh 2 – 4, 2083</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
                <a
                  href="https://maps.google.com/?q=Bhrikutimandap+Exhibition+Complex+Kathmandu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs"
                >
                  <Navigation className="w-3.5 h-3.5 text-[#19BFE8]" />
                  <span>Open in Google Maps</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>

                <Link
                  href="/floor-plan"
                  className="px-4 py-2.5 rounded-lg bg-white border border-slate-300 hover:border-[#087EA4] text-slate-800 hover:text-[#087EA4] text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <span>View Floor Plan</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* 360° Virtual Explorer & Interactive Map Component */}
          <VenueMapAnd360 />

          {/* =========================================================================
              03: BHRIKUTIMANDAP COMPLEX PHOTO SHOWCASE
             ========================================================================= */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <span className="text-xs font-semibold text-[#087EA4] uppercase tracking-wider block mb-1">
                  On-Site Complex Facilities
                </span>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                  Bhrikutimandap Exhibition Zones & Arenas
                </h3>
              </div>
              <Link
                href="/gallery"
                className="text-xs font-semibold text-[#087EA4] hover:text-[#065A76] flex items-center gap-1 self-start sm:self-auto"
              >
                <span>Browse Full Photo Gallery</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
              {/* Photo 1: Main Expo Hall */}
              <div className="group rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex flex-col">
                <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                  <Image
                    src="/images/gallery/2022/DSC_6315.webp"
                    alt="Bhrikutimandap Main Exhibition Pavilion"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    HALL A & B
                  </div>
                </div>
                <div className="p-4 flex-grow flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Main Exhibition Pavilion</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Custom-designed indoor exhibition stalls for hydro turbine makers, power distributors, and green tech providers.
                    </p>
                  </div>
                </div>
              </div>

              {/* Photo 2: Inauguration & Conference Stage */}
              <div className="group rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex flex-col">
                <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                  <Image
                    src="/images/gallery/2022/DSC_6673.webp"
                    alt="Bhrikutimandap Opening Ceremony & Plenary Hall"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    PLENARY AUDITORIUM
                  </div>
                </div>
                <div className="p-4 flex-grow flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Plenary & Conference Hall</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Main stage hosting ministerial addresses, policy keynotes, international power trade panels, and awards.
                    </p>
                  </div>
                </div>
              </div>

              {/* Photo 3: Outdoor Expo & Heavy Equipment */}
              <div className="group rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex flex-col">
                <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                  <Image
                    src="/images/gallery/2018/IMG_0020.webp"
                    alt="Bhrikutimandap Outdoor Exhibition Grounds"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    OPEN ARENA
                  </div>
                </div>
                <div className="p-4 flex-grow flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Outdoor Machinery Arena</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Spacious open-air exhibition grounds for heavy earthmovers, high-voltage transformers, cranes, and EV showcases.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
