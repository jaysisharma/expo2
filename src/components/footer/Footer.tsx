'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Mail, Phone, MapPin, ArrowUpRight } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full bg-slate-900 text-white border-t border-slate-800 pt-14 pb-10 px-4 sm:px-6 lg:px-12 font-sans select-none">
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 pb-12 border-b border-slate-800/80">
          {/* Brand & Organizers (Col 1-5) */}
          <div className="lg:col-span-5 space-y-5">
            <Link href="/" className="inline-flex items-center gap-3">
              <Image
                src="/images/logo.png"
                alt="Himalayan Green Energy Expo"
                width={36}
                height={36}
                className="object-contain brightness-0 invert"
              />
              <div>
                <span className="font-display font-extrabold text-base tracking-tight text-white block">
                  HIMALAYAN GREEN ENERGY EXPO
                </span>
                <span className="text-[10px] font-mono font-semibold text-[#25C176] tracking-wider uppercase block">
                  5th Edition · 16–18 January 2027
                </span>
              </div>
            </Link>

            <p className="text-xs text-slate-400 font-normal leading-relaxed max-w-sm">
              South Asia&apos;s premier clean energy summit connecting developers, turbine OEMs, and sovereign finance with Nepal&apos;s 30,000 MW roadmap.
            </p>

            {/* Compact Organizer Badges */}
            <div className="pt-1 flex items-center gap-4">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
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
            <h4 className="text-xs font-mono font-bold text-slate-200 tracking-wider uppercase">
              Exhibition
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400 font-medium">
              <li>
                <Link href="/book-stall" className="hover:text-white transition-colors">
                  Book a Stall
                </Link>
              </li>
              <li>
                <Link href="/floor-plan" className="hover:text-white transition-colors">
                  Interactive Floor Plan
                </Link>
              </li>
              <li>
                <Link href="/exhibit" className="hover:text-white transition-colors">
                  Exhibitor Packages
                </Link>
              </li>
              <li>
                <Link href="/exhibitors" className="hover:text-white transition-colors">
                  Exhibitors Directory
                </Link>
              </li>
            </ul>
          </div>

          {/* Events & Visitor (Col 8-9) */}
          <div className="lg:col-span-2 space-y-3.5">
            <h4 className="text-xs font-mono font-bold text-slate-200 tracking-wider uppercase">
              Event & Venue
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400 font-medium">
              <li>
                <Link href="/register" className="hover:text-white transition-colors">
                  Visitor Registration
                </Link>
              </li>
              <li>
                <Link href="/conference" className="hover:text-white transition-colors">
                  Conference Plenaries
                </Link>
              </li>
              <li>
                <Link href="/venue" className="hover:text-white transition-colors">
                  Bhrikutimandap Venue
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-white transition-colors">
                  Past Photo Gallery
                </Link>
              </li>
            </ul>
          </div>

          {/* Secretarial Contact (Col 10-12) */}
          <div className="lg:col-span-3 space-y-3.5">
            <h4 className="text-xs font-mono font-bold text-slate-200 tracking-wider uppercase">
              Secretariat Desk
            </h4>
            <div className="space-y-2.5 text-xs text-slate-400">
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
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-normal">
          <p>© 2027 Himalayan Green Energy Expo. All rights reserved.</p>
          <div className="flex items-center gap-6 text-xs text-slate-400">
            <Link href="/about" className="hover:text-white transition-colors">
              About
            </Link>
            <Link href="/contact" className="hover:text-white transition-colors">
              Contact
            </Link>
            <Link
              href="/admin/login"
              className="text-slate-300 hover:text-white transition-colors flex items-center gap-1 font-mono font-semibold"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#25C176]" />
              <span>Secretariat Login</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
