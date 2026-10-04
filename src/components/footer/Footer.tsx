'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';
import { CONTACT_DETAILS } from '@/data/contactInfo';

export function Footer() {
  return (
    <footer className="w-full bg-[#050C16] text-slate-400 border-t border-slate-800/80 font-inter-tight">
      <div className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-12 py-12 lg:py-16">
        
        {/* Main 4-Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-10 border-b border-slate-800/60">
          
          {/* Col 1: Brand & Joint Organizers (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="inline-block group focus-visible:outline-2 focus-visible:outline-emerald-400 rounded-xl">
              <div className="bg-white rounded-xl px-3.5 py-2.5 inline-flex items-center justify-center shadow-sm group-hover:bg-slate-50 transition-colors">
                <Image
                  src="/images/logo-expo.webp"
                  alt="Himalayan Green Energy Expo 2027"
                  width={220}
                  height={150}
                  className="h-12 sm:h-14 w-auto object-contain"
                />
              </div>
            </Link>
            <p className="text-xs sm:text-sm text-slate-400 max-w-sm leading-relaxed">
              South Asia’s premier clean energy trade summit connecting policymakers, project sponsors, financiers, and technology innovators.
            </p>
            
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 pt-1">
              <span className="text-emerald-400 font-medium">17–19 January 2027 (Magh 3–5, 2083)</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-300">BHRIKUTIMANDAP · KATHMANDU, NEPAL</span>
            </div>

            <div className="pt-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 block mb-2">
                Jointly Organized by
              </span>
              <div className="flex items-center gap-3">
                <a
                  href="https://www.ippan.org.np/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 px-3 bg-white/90 hover:bg-white rounded-lg flex items-center justify-center transition-all hover:shadow-sm"
                  title="Independent Power Producers' Association, Nepal (IPPAN)"
                >
                  <Image
                    src="/images/ippan_vector.svg"
                    alt="IPPAN"
                    width={80}
                    height={26}
                    className="h-5 w-auto object-contain"
                  />
                </a>
                <Link
                  href="/contact"
                  className="h-9 px-3 bg-white/90 hover:bg-white rounded-lg flex items-center justify-center transition-all hover:shadow-sm"
                  title="Event Solution Pvt. Ltd."
                >
                  <Image
                    src="/images/event_solution_vector.svg"
                    alt="Event Solution"
                    width={80}
                    height={26}
                    className="h-5 w-auto object-contain"
                  />
                </Link>
              </div>
            </div>
          </div>

          {/* Col 2: Explore (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">
              Explore
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link href="/about" className="hover:text-emerald-400 transition-colors">
                  About Expo
                </Link>
              </li>
              <li>
                <Link href="/floor-plan" className="hover:text-emerald-400 transition-colors">
                  Floor Plan
                </Link>
              </li>
              <li>
                <Link href="/sponsors" className="hover:text-emerald-400 transition-colors">
                  Sponsors &amp; Partners
                </Link>
              </li>
              <li>
                <Link href="/exhibitors" className="hover:text-emerald-400 transition-colors">
                  Exhibitors
                </Link>
              </li>
              <li>
                <a href="/Proposal.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors">
                  Proposal (PDF)
                </a>
              </li>
              <li>
                <a href="/booking-form.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors">
                  Booking Form (PDF)
                </a>
              </li>
              <li>
                <a href="/sponsors-sheet.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors">
                  Sponsor Sheet (PDF)
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Participate (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">
              Participate
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link href="/book-stall" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
                  Book a Stall
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-emerald-400 transition-colors">
                  Visitor Pass
                </Link>
              </li>
              <li>
                <Link href="/networking-dinner" className="hover:text-emerald-400 transition-colors">
                  Networking Dinner
                </Link>
              </li>
              <li>
                <Link href="/sponsors" className="hover:text-emerald-400 transition-colors">
                  Sponsorships
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-emerald-400 transition-colors">
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Contacts (4 cols) - All Provided Details */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">
              Contacts
            </h4>
            <div className="space-y-3 text-xs sm:text-sm">
              
              {/* Mobile / Hotlines */}
              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    Mobile / Hotlines
                  </div>
                  <div className="text-white font-mono text-xs sm:text-sm pt-0.5">
                    <a href="tel:+9779703606348" className="hover:text-emerald-400 transition-colors">
                      +977-9703606348
                    </a>
                    <span className="text-slate-600 mx-2">|</span>
                    <a href="tel:+9779703606345" className="hover:text-emerald-400 transition-colors">
                      9703606345
                    </a>
                  </div>
                </div>
              </div>

              {/* Landlines & Address */}
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    Landline &amp; Address
                  </div>
                  <div className="text-white text-xs sm:text-sm pt-0.5">
                    <span className="font-mono">01-5268535, 4169175</span>
                    <span className="text-slate-500 mx-1.5">•</span>
                    <span>Jwagal, Lalitpur, Nepal</span>
                  </div>
                </div>
              </div>

              {/* Expo Email */}
              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    Expo Email
                  </div>
                  <a
                    href="mailto:info@himalayanenergyexpo.com"
                    className="text-white font-mono text-xs sm:text-sm hover:text-emerald-400 transition-colors block pt-0.5"
                  >
                    info@himalayanenergyexpo.com
                  </a>
                </div>
              </div>

              {/* Event Solution Email */}
              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    Event Solution Email
                  </div>
                  <a
                    href="mailto:info@eventsolutionnepal.com.np"
                    className="text-white font-mono text-xs sm:text-sm hover:text-emerald-400 transition-colors block pt-0.5"
                  >
                    info@eventsolutionnepal.com.np
                  </a>
                </div>
              </div>

              {/* IPPAN Emails */}
              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    IPPAN Emails
                  </div>
                  <div className="text-white font-mono text-xs sm:text-sm pt-0.5 flex flex-wrap items-center gap-1.5">
                    <a
                      href="mailto:info@ippan.org.np"
                      className="hover:text-emerald-400 transition-colors"
                    >
                      info@ippan.org.np
                    </a>
                    <span className="text-slate-600">|</span>
                    <a
                      href="mailto:ippan2001@gmail.com"
                      className="text-slate-300 hover:text-emerald-400 transition-colors"
                    >
                      ippan2001@gmail.com
                    </a>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Bottom Row: Simple Copyright Only */}
        <div className="pt-6 text-center text-xs text-slate-500">
          <p>
            © 2027 Himalayan Green Energy Expo. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}

export default Footer;
