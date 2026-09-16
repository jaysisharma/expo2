'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, X, ChevronDown, ArrowRight, Ticket } from 'lucide-react';
import { useTheme } from '../ThemeProvider';

/* ─── Nav Items Configuration ─────────────────────────────────────────────── */
/* ─── Nav Items Configuration (Imported from Desktop expo) ───────────────── */
interface NavDropdownItem {
  label: string;
  href: string;
  desc?: string;
  badge?: string;
}

interface NavItem {
  label: string;
  href: string;
  children?: NavDropdownItem[];
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '/' },
  {
    label: 'About',
    href: '/about',
    children: [
      {
        label: 'About The Expo 2027',
        href: '/about',
        desc: 'Vision, 2035 targets & clean energy revolution',
        badge: 'Overview',
      },
      {
        label: 'Behind the Expo',
        href: '/expo',
        desc: 'IPPAN & Event Solution joint organizers',
      },
      {
        label: 'Download Event Proposal',
        href: '/files/hydroproposal-13-2-2024.pdf',
        desc: 'Official scope, sponsor packages & guidelines',
        badge: 'PDF',
      },
      {
        label: 'Patrons & Sponsors',
        href: '/sponsors',
        desc: 'Ministry, NEA, ERC & chamber partners',
      },
    ],
  },
  {
    label: 'Exhibit',
    href: '/exhibit',
    children: [
      {
        label: 'Exhibit & Book Stall',
        href: '/book-stall',
        desc: 'Reserve 9m², 18m² or 36m² premium booths',
        badge: 'Early Bird',
      },
      {
        label: 'Interactive Floor Plan',
        href: '/floor-plan',
        desc: 'Real-time hall map & stall availability',
      },
      {
        label: 'Floor Plan Studio',
        href: '/floor-plan/builder',
        desc: 'Live visual stall inspector & canvas studio',
        badge: 'Studio',
      },
      {
        label: 'Exhibitors Directory',
        href: '/exhibitors',
        desc: '150+ international OEMs & developers',
      },
    ],
  },
  {
    label: 'Conference',
    href: '/conference',
    children: [
      {
        label: 'Conference Plenaries',
        href: '/conference',
        desc: '12 strategic clean energy summits & plenaries',
        badge: '3 Days',
      },
      {
        label: 'Student CleanTech Challenge',
        href: '/events',
        desc: 'Youth innovation challenge & competition entry',
        badge: 'Awards',
      },
    ],
  },
  {
    label: 'News & Gallery',
    href: '/gallery',
    children: [
      {
        label: 'Photo Gallery',
        href: '/gallery',
        desc: 'Moments & showcases from 2018, 2019, 2022 & 2024',
        badge: 'Highlights',
      },
      {
        label: 'News & Press Releases',
        href: '/news',
        desc: 'Latest announcements & energy treaties',
      },
    ],
  },
  {
    label: 'Visit',
    href: '/venue',
    children: [
      {
        label: 'Venue & Kathmandu Guide',
        href: '/venue',
        desc: 'Bhrikutimandap complex layout & access',
      },
      {
        label: 'Visitor Registration',
        href: '/register',
        desc: 'Get your free digital visitor badge',
        badge: 'Free Pass',
      },
      {
        label: 'Frequently Asked Questions',
        href: '/faq',
        desc: 'Visas, stalls, badges & logistics FAQs',
      },
    ],
  },
  { label: 'Contact', href: '/contact' },
];

export function Navbar() {
  const { theme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isDark = theme === 'dark';

  /* Close dropdown when clicking outside */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /* Lock body scroll when mobile drawer is open */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const navLinkClasses =
    'inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[13.5px] font-medium font-body text-slate-800 hover:text-[#218A59] hover:bg-[#218A59]/10 transition-all duration-150 cursor-pointer bg-transparent border-none';

  return (
    <>
      {/* ── Non-Sticky Navbar with Border Bottom ───────────────────────────── */}
      <nav className="relative w-full z-40 bg-[var(--c-bg)] border-b border-black/[0.08] transition-colors duration-200">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-10 h-[78px] sm:h-[86px] grid grid-cols-[auto_1fr_auto] gap-4 items-center">

          {/* ── Col 1: Single Logo (Left) ─────────────────────────────────── */}
          <div className="flex items-center justify-start shrink-0">
            <Link
              href="/"
              aria-label="Himalayan Hydro Expo — Home"
              className="inline-flex items-center focus-visible:outline-2 focus-visible:outline-[#218A59] focus-visible:rounded-md transition-opacity hover:opacity-90"
            >
              <Image
                src="/images/logo.png"
                alt="Himalayan Green Energy Expo"
                width={220}
                height={70}
                priority
                className="h-12 sm:h-14 lg:h-16 w-auto object-contain transition-transform duration-200"
              />
            </Link>
          </div>

          {/* ── Col 2: Navigation Items (Centered) ─────────────────────────── */}
          <div ref={dropdownRef} className="hidden lg:flex items-center justify-center gap-0.5 xl:gap-1">
            {NAV_ITEMS.map((item) => (
              <div key={item.label} className="relative">
                {item.children ? (
                  <>
                    <button
                      onClick={() =>
                        setActiveDropdown(activeDropdown === item.label ? null : item.label)
                      }
                      aria-expanded={activeDropdown === item.label}
                      aria-haspopup="menu"
                      className={`${navLinkClasses} ${activeDropdown === item.label
                        ? 'text-[#218A59] bg-[#218A59]/10 font-semibold'
                        : ''
                        }`}
                    >
                      <span>{item.label}</span>
                      <ChevronDown
                        size={13}
                        strokeWidth={2.2}
                        aria-hidden="true"
                        className={`transition-transform duration-200 opacity-60 ${activeDropdown === item.label ? 'rotate-180 opacity-100 text-[#218A59]' : ''
                          }`}
                      />
                    </button>

                    {/* Rich Dropdown Menu */}
                    {activeDropdown === item.label && (
                      <div
                        role="menu"
                        className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 w-80 p-2 bg-white border border-black/[0.08] rounded-2xl shadow-xl shadow-black/[0.08] overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150"
                      >
                        <div className="flex flex-col gap-1">
                          {item.children.map((child) => (
                            <Link
                              key={child.label}
                              href={child.href}
                              role="menuitem"
                              onClick={() => setActiveDropdown(null)}
                              className="group flex flex-col p-2.5 rounded-xl hover:bg-[#218A59]/8 transition-all text-left"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-semibold text-[13.5px] text-slate-800 group-hover:text-[#218A59] transition-colors">
                                  {child.label}
                                </span>
                                {child.badge && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#218A59]/10 text-[#218A59] border border-[#218A59]/20">
                                    {child.badge}
                                  </span>
                                )}
                              </div>
                              {child.desc && (
                                <span className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                                  {child.desc}
                                </span>
                              )}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <Link href={item.href} className={navLinkClasses}>
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* ── Col 3: CTA Buttons (Right) ──────────────────── */}
          <div className="flex items-center justify-end gap-2.5 sm:gap-3 shrink-0">
            {/* Secondary CTA: Register Pass */}
            <Link
              href="/register"
              className="hidden sm:inline-flex items-center gap-1.5 h-10 px-5 rounded-full border-[1.5px] border-[#234679] text-[#234679] font-body text-xs font-bold uppercase tracking-wider bg-transparent hover:bg-[#234679] hover:!text-white transition-all duration-200 active:scale-95 shadow-xs"
            >
              <Ticket
                size={14}
                strokeWidth={2.2}
                aria-hidden="true"
                className="!text-inherit !stroke-current"
              />
              <span className="!text-inherit">Register</span>
            </Link>
            {/* Primary CTA: Book Stall */}
            <Link
              href="/book-stall"
              className="group hidden sm:inline-flex items-center gap-2 h-10 px-5 rounded-full bg-gradient-to-r from-[#5B9F35] to-[#218A59] text-white font-body text-xs font-bold uppercase tracking-wider shadow-md shadow-[#218A59]/25 hover:shadow-lg hover:shadow-[#218A59]/40 hover:brightness-105 active:scale-95 transition-all duration-200"
            >
              <span>Book Stall</span>
              <ArrowRight
                size={14}
                strokeWidth={2.5}
                aria-hidden="true"
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </Link>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileOpen}
              className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl border border-black/10 text-slate-800 bg-black/[0.02] hover:bg-black/[0.05] transition-colors cursor-pointer"
            >
              {mobileOpen ? <X size={20} strokeWidth={2} /> : <Menu size={20} strokeWidth={2} />}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile Drawer ─────────────────────────────────────────────────── */}
      <div
        aria-hidden={!mobileOpen}
        className={`lg:hidden fixed top-[78px] sm:top-[86px] left-0 right-0 bottom-0 z-40 bg-white border-t border-black/[0.06] overflow-y-auto transition-transform duration-300 ease-out ${mobileOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        style={{ display: mobileOpen ? 'block' : undefined }}
      >
        <div className="px-6 py-6 flex flex-col gap-1 min-h-[calc(100vh-78px)] sm:min-h-[calc(100vh-86px)] justify-between">
          <div className="flex flex-col">
            {NAV_ITEMS.map((item) => (
              <div key={item.label} className="border-b border-black/[0.06]">
                {item.children ? (
                  <div>
                    <button
                      onClick={() =>
                        setActiveDropdown(activeDropdown === item.label ? null : item.label)
                      }
                      aria-expanded={activeDropdown === item.label}
                      className="flex items-center justify-between w-full py-4 text-[15px] font-semibold font-body text-slate-800 bg-transparent border-none cursor-pointer hover:text-[#218A59] transition-colors"
                    >
                      <span>{item.label}</span>
                      <ChevronDown
                        size={16}
                        className={`transition-transform duration-200 opacity-60 ${activeDropdown === item.label ? 'rotate-180 opacity-100 text-[#218A59]' : ''
                          }`}
                      />
                    </button>
                    {activeDropdown === item.label && (
                      <div className="pb-3 pl-2 flex flex-col gap-2">
                        {item.children.map((child) => (
                          <Link
                            key={child.label}
                            href={child.href}
                            onClick={() => {
                              setMobileOpen(false);
                              setActiveDropdown(null);
                            }}
                            className="block py-2 px-3 rounded-xl hover:bg-[#218A59]/10 transition-colors"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-semibold text-[13.5px] text-slate-800">
                                {child.label}
                              </span>
                              {child.badge && (
                                <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-[#218A59]/10 text-[#218A59]">
                                  {child.badge}
                                </span>
                              )}
                            </div>
                            {child.desc && (
                              <span className="text-xs text-slate-500 mt-0.5 block">
                                {child.desc}
                              </span>
                            )}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center py-4 text-[15px] font-semibold font-body text-slate-800 hover:text-[#218A59] transition-colors"
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* Mobile CTA Buttons */}
          <div className="flex flex-col gap-3 pt-6 pb-4">
            <Link
              href="/register"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 h-12 w-full rounded-full border-[1.5px] border-[#234679] text-[#234679] font-body text-sm font-bold uppercase tracking-wider hover:bg-[#234679] hover:text-white transition-all duration-200 shadow-sm"
            >
              <Ticket size={16} strokeWidth={2.2} />
              <span>Register Pass</span>
            </Link>
            <Link
              href="/book-stall"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 h-12 w-full rounded-full bg-gradient-to-r from-[#5B9F35] to-[#218A59] text-white font-body text-sm font-bold uppercase tracking-wider shadow-md shadow-[#218A59]/25 hover:brightness-105 transition-all duration-200"
            >
              <span>Book Exhibition Stall</span>
              <ArrowRight size={16} strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          aria-hidden="true"
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 z-30 bg-black/40 backdrop-blur-xs"
        />
      )}
    </>
  );
}

export default Navbar;
