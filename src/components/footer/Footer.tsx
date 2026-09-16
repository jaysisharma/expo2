'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  ArrowRight,
  ShieldCheck,
  Download,
  CheckCircle2,
  Sparkles,
  Globe,
} from 'lucide-react';

export function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setSubscribed(true);
      setTimeout(() => {
        setNewsletterEmail('');
      }, 3000);
    }
  };

  return (
    <footer className="relative bg-[#F4F7F5] text-slate-800 border-t border-slate-200/90 pt-14 pb-16 px-4 sm:px-6 lg:px-12 overflow-hidden font-sans select-none">
      {/* Top Accent Gradient Border */}
      <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-[#5B9F35] via-[#218A59] to-[#234679]" />

      {/* Subtle Ambient Brand Glow */}
      <div
        aria-hidden="true"
        className="absolute top-0 right-1/4 w-[600px] h-[350px] bg-gradient-to-b from-[#218A59]/8 via-[#234679]/4 to-transparent blur-3xl pointer-events-none rounded-full"
      />
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-10 w-[500px] h-[350px] bg-gradient-to-t from-[#5B9F35]/8 via-transparent to-transparent blur-3xl pointer-events-none rounded-full"
      />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* ── 01: Top Banner (Joint Organizers + Newsletter CTA) ── */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-lg shadow-slate-900/5 mb-14 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Joint Organizers Logos & Credentials */}
          <div className="lg:col-span-7 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* IPPAN */}
            <div className="flex items-center gap-3.5">
              <div className="relative h-13 w-24 bg-white rounded-xl border border-slate-200 p-2 shrink-0 flex items-center justify-center shadow-xs">
                <Image
                  src="/ippan.png"
                  alt="IPPAN Logo"
                  width={85}
                  height={40}
                  className="object-contain max-h-10"
                />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-[#234679] uppercase tracking-wider block">
                  ORGANIZED BY
                </span>
                <h4 className="font-display font-bold text-sm text-slate-900 leading-tight">
                  IPPAN
                </h4>
                <p className="text-[11px] text-slate-500 line-clamp-1">
                  Apex private hydro body
                </p>
              </div>
            </div>

            <div className="hidden sm:block w-px h-10 bg-slate-200" />

            {/* Event Solution */}
            <div className="flex items-center gap-3.5">
              <div className="relative h-13 w-24 bg-white rounded-xl border border-slate-200 p-2 shrink-0 flex items-center justify-center shadow-xs">
                <Image
                  src="/event_solution.png"
                  alt="Event Solution Pvt. Ltd. Logo"
                  width={90}
                  height={40}
                  className="object-contain max-h-10"
                />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-[#218A59] uppercase tracking-wider block">
                  EVENT MANAGER
                </span>
                <h4 className="font-display font-bold text-sm text-slate-900 leading-tight">
                  Event Solution
                </h4>
                <p className="text-[11px] text-slate-500 line-clamp-1">
                  Premier trade expo manager
                </p>
              </div>
            </div>
          </div>

          {/* Newsletter / Bulletin Subscription */}
          <div className="lg:col-span-5 lg:border-l lg:border-slate-200 lg:pl-8">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Sparkles size={13} className="text-[#218A59]" />
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Stay Updated for 2027
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Receive official delegate schedules, plenary releases, and stall openings.
            </p>

            {subscribed ? (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>Thank you! You are subscribed to official expo updates.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex items-center gap-2">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter official work email..."
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#218A59] focus:ring-2 focus:ring-[#218A59]/20 transition-all font-medium"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-[#218A59] hover:bg-[#1B7249] text-white text-xs font-bold uppercase tracking-wider shrink-0 transition-all shadow-sm hover:shadow active:scale-95 flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Join</span>
                  <ArrowRight size={13} />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* ── 02: Main 4-Column Directory ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-12 border-b border-slate-200">
          {/* Col 1: Brand Info & Socials */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative w-11 h-11 rounded-xl bg-white border border-slate-200 p-1.5 flex items-center justify-center shadow-xs">
                <Image
                  src="/images/logo.png"
                  alt="Himalayan Green Energy Expo Nepal"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <div>
                <span className="font-display font-black text-base text-slate-900 tracking-tight block">
                  HIMALAYAN GREEN ENERGY EXPO
                </span>
                <span className="text-[10px] text-[#218A59] tracking-wider block font-mono font-bold">
                  IPPAN × EVENT SOLUTION
                </span>
              </div>
            </Link>

            <p className="text-xs text-slate-600 font-normal leading-relaxed max-w-sm">
              South Asia&apos;s apex clean energy convergence uniting international developers, turbine OEMs, and sovereign finance around Nepal&apos;s 30,000 MW clean energy roadmap.
            </p>

            <div className="flex items-center gap-2 pt-1 text-xs text-slate-700 font-medium">
              <MapPin className="w-4 h-4 text-[#234679] shrink-0" />
              <span>Bhrikutimandap Exhibition Complex, Kathmandu</span>
            </div>

            {/* Social Channels */}
            <div className="flex items-center gap-2 pt-2">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-[#218A59] hover:border-[#218A59]/30 flex items-center justify-center transition-colors shadow-xs"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.64a1.65 1.65 0 0 0-1.66 1.66 1.66 1.66 0 0 0 1.66 1.65 1.66 1.66 0 0 0 1.66-1.65c0-.92-.74-1.66-1.66-1.66Z" />
                </svg>
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-[#218A59] hover:border-[#218A59]/30 flex items-center justify-center transition-colors shadow-xs"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02Z" />
                </svg>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-[#218A59] hover:border-[#218A59]/30 flex items-center justify-center transition-colors shadow-xs"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="m10 15 5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 22c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 2c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73Z" />
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter / X"
                className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-[#218A59] hover:border-[#218A59]/30 flex items-center justify-center transition-colors shadow-xs"
              >
                <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Col 2: Exhibition Directory */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-mono font-bold text-slate-900 tracking-wider uppercase">
              EXHIBITION
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-600 font-medium">
              <li>
                <Link href="/book-stall" className="hover:text-[#218A59] transition-colors flex items-center gap-1 text-[#218A59] font-bold">
                  <span>Book Exhibition Stall</span>
                </Link>
              </li>
              <li>
                <Link href="/floor-plan" className="hover:text-[#218A59] transition-colors">
                  Interactive Floor Plan
                </Link>
              </li>
              <li>
                <Link href="/floor-plan/builder" className="hover:text-[#218A59] transition-colors">
                  Floor Plan Studio
                </Link>
              </li>
              <li>
                <Link href="/exhibit" className="hover:text-[#218A59] transition-colors">
                  Why Exhibit
                </Link>
              </li>
              <li>
                <Link href="/exhibitors" className="hover:text-[#218A59] transition-colors">
                  Exhibitors Directory
                </Link>
              </li>
              <li>
                <a
                  href="/files/hydroproposal-13-2-2024.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#218A59] transition-colors flex items-center gap-1 text-[#234679] font-semibold"
                >
                  <Download className="w-3 h-3" />
                  <span>Proposal (PDF)</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Programs & Official Documents */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-mono font-bold text-slate-900 tracking-wider uppercase">
              PROGRAM & RESOURCES
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-600 font-medium">
              <li>
                <Link href="/conference" className="hover:text-[#218A59] transition-colors">
                  12 Conference Plenaries
                </Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-[#218A59] transition-colors">
                  Student CleanTech Challenge
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-[#218A59] transition-colors">
                  Expo Photo & Video Archive
                </Link>
              </li>
              <li>
                <Link href="/news" className="hover:text-[#218A59] transition-colors">
                  News & Press Releases
                </Link>
              </li>
              <li>
                <a
                  href="https://www.ippan.org.np/wp-content/uploads/2024/04/Ippan-Bulletine_2024-March.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#218A59] transition-colors flex items-center gap-1"
                >
                  <FileText className="w-3 h-3 text-[#218A59]" />
                  <span>IPPAN Bulletin (PDF)</span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.ippan.org.np/wp-content/uploads/2024/04/Himalyan-Hydro-Final-Session.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#218A59] transition-colors flex items-center gap-1"
                >
                  <FileText className="w-3 h-3 text-[#234679]" />
                  <span>Technical Sessions (PDF)</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Secretariat Contact */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-mono font-bold text-slate-900 tracking-wider uppercase">
              JOINT SECRETARIAT DESK
            </h4>
            <div className="space-y-2.5 text-xs text-slate-600 font-medium">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#234679] shrink-0 mt-0.5" />
                <span>
                  Bhrikutimandap Exhibition Complex, Kathmandu, Nepal
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#218A59] shrink-0" />
                <span>+977-1-4412345 / +977-1-4435678</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#234679] shrink-0" />
                <span className="truncate">expo@ippan.org.np</span>
              </div>
              <div className="flex items-center gap-2.5 pt-1">
                <Calendar className="w-4 h-4 text-[#218A59] shrink-0" />
                <span className="text-slate-900 font-bold">
                  16–18 Jan 2027 (09:00 - 18:00 NPT)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── 03: Bottom Sub-Footer ── */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
          <div>
            © 2027 Himalayan Green Energy Expo Nepal. Organized jointly by IPPAN & Event Solution Pvt. Ltd.
          </div>
          <div className="flex items-center gap-5 sm:gap-6 flex-wrap justify-center">
            <Link href="/venue" className="hover:text-slate-900 transition-colors">
              Kathmandu Guide
            </Link>
            <Link href="/faq" className="hover:text-slate-900 transition-colors">
              FAQs
            </Link>
            <Link href="/contact" className="hover:text-slate-900 transition-colors">
              Contact Us
            </Link>
            <Link
              href="/admin/login"
              className="text-[#234679] hover:text-[#218A59] transition-colors flex items-center gap-1.5 font-mono font-bold"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#218A59]" />
              <span>Organizer Portal</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
