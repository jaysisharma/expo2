'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Mail, Phone, MapPin, FileDown } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full bg-slate-900 text-white border-t border-slate-800 pt-14 pb-10 px-4 sm:px-6 lg:px-12 font-sans select-none">
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 pb-12 border-b border-slate-800/80">
          {/* Brand & Organizers (Col 1-5) */}
          <div className="lg:col-span-5 space-y-5">
            <Link href="/" className="inline-block group focus-visible:outline-2 focus-visible:outline-[#25C176]">
              <div className="bg-white/95 px-4 py-3 rounded-xl flex flex-col items-start gap-1 shadow-md hover:shadow-lg transition-all duration-200 group-hover:scale-[1.01]">
                <Image
                  src="/images/logo.jpeg"
                  alt="Himalayan Green Energy Expo"
                  width={300}
                  height={90}
                  className="h-12 sm:h-14 lg:h-16 w-auto object-contain"
                />
                <span className="text-[10px] sm:text-[11px] font-mono font-bold tracking-wider text-[#218A59] uppercase pl-0.5 whitespace-nowrap">
                  Resilient Energy, Prosperous Nepal
                </span>
              </div>
            </Link>

            <p className="text-xs text-slate-300 font-normal leading-relaxed max-w-sm">
              South Asia&apos;s premier clean energy summit connecting developers, turbine OEMs, and sovereign finance with Nepal&apos;s 30,000 MW roadmap.
            </p>

            {/* Compact Organizer Badges */}
            <div className="pt-1 flex items-center gap-4">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                Organized by:
              </span>
              <div className="flex items-center gap-3">
                <div className="h-8 px-2.5 bg-white rounded-lg flex items-center justify-center shadow-xs">
                  <Image
                    src="/ippan.png"
                    alt="IPPAN"
                    width={56}
                    height={22}
                    className="object-contain max-h-5"
                  />
                </div>
                <div className="h-8 px-2.5 bg-white rounded-lg flex items-center justify-center shadow-xs">
                  <Image
                    src="/event_solution.png"
                    alt="Event Solution"
                    width={56}
                    height={22}
                    className="object-contain max-h-5"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Navigation (Col 6-7) */}
          <div className="lg:col-span-2 space-y-3.5">
            <h4 className="text-xs font-mono font-bold text-slate-100 tracking-wider uppercase">
              Exhibition
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300 font-medium">
              <li>
                <Link href="/book-stall" className="hover:text-[#4ADE80] transition-colors">
                  Book a Stall
                </Link>
              </li>
              <li>
                <Link href="/floor-plan" className="hover:text-[#4ADE80] transition-colors">
                  Interactive Floor Plan
                </Link>
              </li>
              <li>
                <Link href="/exhibit" className="hover:text-[#4ADE80] transition-colors">
                  Exhibitor Packages
                </Link>
              </li>
              <li>
                <Link href="/exhibitors" className="hover:text-[#4ADE80] transition-colors">
                  Exhibitors Directory
                </Link>
              </li>
              <li>
                <a
                  href="/files/hydroproposal-13-2-2024.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[#38BDF8] hover:text-[#7DD3FC] transition-colors font-semibold"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Download Proposal (PDF)</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Events & Visitor (Col 8-9) */}
          <div className="lg:col-span-2 space-y-3.5">
            <h4 className="text-xs font-mono font-bold text-slate-100 tracking-wider uppercase">
              Event & Venue
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300 font-medium">
              <li>
                <Link href="/register" className="hover:text-[#4ADE80] transition-colors">
                  Visitor Registration
                </Link>
              </li>
              <li>
                <Link href="/conference" className="hover:text-[#4ADE80] transition-colors">
                  Conference Plenaries
                </Link>
              </li>
              <li>
                <Link href="/venue" className="hover:text-[#4ADE80] transition-colors">
                  Bhrikutimandap Venue
                </Link>
              </li>
              <li>
                <Link href="/press" className="text-[#38BDF8] hover:text-[#7DD3FC] font-semibold transition-colors">
                  Official Press Room
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-[#4ADE80] transition-colors">
                  Past Photo Gallery
                </Link>
              </li>
            </ul>
          </div>

          {/* Secretarial Contact (Col 10-12) */}
          <div className="lg:col-span-3 space-y-3.5">
            <h4 className="text-xs font-mono font-bold text-slate-100 tracking-wider uppercase">
              Secretariat Desk
            </h4>
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-[#25C176] shrink-0" />
                <span>Bhrikutimandap, Kathmandu, Nepal</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#25C176] shrink-0" />
                <span>+977-1-4412345 / +977-1-4435678</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#25C176] shrink-0" />
                <span>expo@ippan.org.np</span>
              </div>
            </div>
          </div>
        </div>

        {/* Clean Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-normal">
          <p>© 2027 Himalayan Green Energy Expo. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
