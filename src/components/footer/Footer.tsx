'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Mail, Phone, MapPin, Calendar, FileText } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative bg-gradient-to-b from-[#083E2D] via-[#05291E] to-[#021A13] text-white border-t border-[#25C176]/30 pt-16 pb-20 px-4 sm:px-6 lg:px-12 overflow-hidden font-sans select-none">
      {/* Top luminous green accent border */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#25C176] to-transparent shadow-[0_0_15px_rgba(37,193,118,0.6)]" />

      {/* Radiant ambient emerald glows */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[400px] bg-[#10B981]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-[500px] h-[450px] bg-[#059669]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-[#25C176]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Joint Organizers Banner with Official Logos */}
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#0A4633]/90 via-[#0D523C]/80 to-[#083A2A]/90 border border-[#25C176]/35 shadow-2xl mb-16 grid grid-cols-1 md:grid-cols-2 gap-8 items-center backdrop-blur-xl hover:border-[#25C176]/60 transition-all duration-300">
          {/* IPPAN */}
          <div className="flex items-start gap-4">
            <div className="relative h-14 w-28 bg-white rounded-xl border border-white/20 p-2 shrink-0 flex items-center justify-center shadow-md">
              <Image
                src="/ippan.png"
                alt="IPPAN Logo"
                width={95}
                height={45}
                className="object-contain max-h-11"
              />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-[#6FA0E8] uppercase tracking-wider block">
                ORGANIZED BY
              </span>
              <h4 className="font-display font-bold text-base text-white">
                Independent Power Producers&apos; Association, Nepal (IPPAN)
              </h4>
              <p className="text-xs text-emerald-100/85 mt-1 leading-relaxed">
                Apex representative body of private sector hydropower developers in Nepal.
              </p>
            </div>
          </div>

          {/* Event Solution */}
          <div className="flex items-start gap-4 md:border-l border-[#25C176]/25 md:pl-8">
            <div className="relative h-14 w-28 bg-white rounded-xl border border-white/20 p-2 shrink-0 flex items-center justify-center shadow-md">
              <Image
                src="/event_solution.png"
                alt="Event Solution Pvt. Ltd. Logo"
                width={100}
                height={45}
                className="object-contain max-h-11"
              />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-[#25C176] uppercase tracking-wider block">
                EVENT MANAGER & JOINT ORGANIZER
              </span>
              <h4 className="font-display font-bold text-base text-white">
                Event Solution Pvt. Ltd.
              </h4>
              <p className="text-xs text-emerald-100/85 mt-1 leading-relaxed">
                Nepal&apos;s premier professional trade expo and event management enterprise.
              </p>
            </div>
          </div>
        </div>

        {/* Main Footer Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-12 border-b border-[#25C176]/20">
          {/* Col 1: Brand Info */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-white/10 border border-white/20 p-1.5 flex items-center justify-center shadow-md">
                <Image
                  src="/images/logo.png"
                  alt="Himalayan Green Energy Expo Nepal"
                  width={44}
                  height={44}
                  className="object-contain"
                />
              </div>
              <div>
                <span className="font-display font-black text-base text-white tracking-tight block">
                  HIMALAYAN GREEN ENERGY EXPO
                </span>
                <span className="text-[9px] text-[#25C176] tracking-wider block font-mono font-bold">
                  IPPAN × EVENT SOLUTION PVT. LTD.
                </span>
              </div>
            </Link>

            <p className="text-xs text-emerald-100/80 font-normal leading-relaxed max-w-sm">
              Nepal&apos;s flagship international trade exhibition dedicated to hydropower engineering, cross-border energy trade, renewable energy, and regional investment.
            </p>

            <div className="pt-1 flex items-center gap-2 text-xs text-emerald-200 font-medium">
              <MapPin className="w-4 h-4 text-[#6FA0E8]" />
              <span>Bhrikutimandap, Kathmandu, Nepal</span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-mono font-bold text-white tracking-wider uppercase">
              EXHIBITION
            </h4>
            <ul className="space-y-2 text-xs text-emerald-100/80 font-normal">
              <li>
                <Link href="/floor-plan" className="hover:text-white transition-colors">
                  Floor Plan
                </Link>
              </li>
              <li>
                <a
                  href="/files/hydroproposal-13-2-2024.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors text-left flex items-center gap-1 text-[#25C176] font-medium"
                >
                  <FileText className="w-3 h-3" />
                  <span>Download Proposal (PDF)</span>
                </a>
              </li>
              <li>
                <Link href="/exhibit" className="hover:text-white transition-colors">
                  Why Exhibit
                </Link>
              </li>
              <li>
                <Link href="/exhibitors" className="hover:text-white transition-colors">
                  Exhibitor Directory
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Program & Resources */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-mono font-bold text-white tracking-wider uppercase">
              RESOURCES & MEDIA
            </h4>
            <ul className="space-y-2 text-xs text-emerald-100/80 font-normal">
              <li>
                <Link href="/gallery" className="hover:text-white transition-colors">
                  Photo & Video Gallery
                </Link>
              </li>
              <li>
                <a
                  href="https://www.ippan.org.np/wp-content/uploads/2024/04/Ippan-Bulletine_2024-March.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  <FileText className="w-3 h-3 text-[#25C176]" />
                  <span>IPPAN Bulletin (PDF)</span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.ippan.org.np/wp-content/uploads/2024/04/Himalyan-Hydro-Final-Session.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  <FileText className="w-3 h-3 text-[#6FA0E8]" />
                  <span>Technical Sessions (PDF)</span>
                </a>
              </li>
              <li>
                <Link href="/news" className="hover:text-white transition-colors">
                  News & Press Coverage
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Secretarial Contact */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-xs font-mono font-bold text-white tracking-wider uppercase">
              JOINT SECRETARIAT DESK
            </h4>
            <div className="space-y-2.5 text-xs text-emerald-100/85 font-normal">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#6FA0E8] shrink-0 mt-0.5" />
                <span>
                  Bhrikutimandap Exhibition Complex, Kathmandu, Nepal
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#25C176] shrink-0" />
                <span>+977-1-4412345 / +977-1-4435678</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#6FA0E8] shrink-0" />
                <span>expo@ippan.org.np / info@eventsolution.com.np</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-[#25C176] shrink-0" />
                <span className="text-white font-semibold">Magh 2 - 4 · 16–18 Jan 2027 (09:00 - 18:00 NPT)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Legal Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-emerald-200/70 font-normal">
          <div>
            © 2027 Himalayan Green Energy Expo Nepal. Organized jointly by IPPAN & Event Solution Pvt. Ltd.
          </div>
          <div className="flex items-center gap-6">
            <a
              href="/files/hydroproposal-13-2-2024.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors cursor-pointer text-emerald-200"
            >
              Proposal (PDF)
            </a>
            <Link href="/floor-plan" className="hover:text-white transition-colors">
              Floor Plan
            </Link>
            <Link href="/contact" className="hover:text-white transition-colors">
              Contact
            </Link>
            <Link
              href="/admin"
              className="text-[#6FA0E8] hover:text-white transition-colors flex items-center gap-1 font-mono font-bold"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#25C176]" />
              <span>Organizer Portal</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
