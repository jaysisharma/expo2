'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Users,
  FileText,
  FileCheck,
  Award,
  LayoutGrid,
  Building2,
  MapPin,
  Ticket,
  HelpCircle,
  ExternalLink,
  Calendar,
  Zap,
} from 'lucide-react';
import { EVENT_VENUE, GALA_VENUE } from '@/data/contactInfo';

export interface NavSubItem {
  title: string;
  badge?: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  external?: boolean;
}

export interface NavDropdownItem {
  id: string;
  label: string;
  href?: string;
  items: NavSubItem[];
  highlightNote?: string;
  actionCta?: {
    label: string;
    href: string;
  };
}

export type NavItem =
  | { type: 'link'; label: string; href: string }
  | { type: 'dropdown'; data: NavDropdownItem };

const NAV_STRUCTURE: NavItem[] = [
  { type: 'link', label: 'Home', href: '/' },
  {
    type: 'dropdown',
    data: {
      id: 'about',
      label: 'About',
      highlightNote: '17–19 January 2027 · Magh 3–5, 2083 · Bhrikuti Mandap, Kathmandu',
      actionCta: {
        label: 'View Expo Journey',
        href: '/about#journey',
      },
      items: [
        {
          title: 'About The Expo 2027',
          badge: 'Overview',
          description: 'Vision, 2035 targets & clean energy revolution',
          href: '/about',
          icon: Sparkles,
        },
        {
          title: 'Download Event Proposal',
          badge: 'PDF',
          description: 'Official scope, sponsor packages & guidelines',
          href: '/Proposal.pdf',
          icon: FileText,
          external: true,
        },
        {
          title: 'Patrons & Sponsors',
          description: 'Ministry, NEA, ERC & chamber partners',
          href: '/sponsors',
          icon: Award,
        },
      ],
    },
  },
  {
    type: 'dropdown',
    data: {
      id: 'exhibit',
      label: 'Exhibit',
      highlightNote: 'Reserve Your Space · 150+ Global Exhibitors',
      actionCta: {
        label: 'Book a Stall Online',
        href: '/book-stall',
      },
      items: [
        {
          title: 'Exhibit & Book Stall',
          description: 'Reserve 9m², 18m² or 36m² premium booths',
          href: '/book-stall',
          icon: LayoutGrid,
        },
        // {
        //   title: 'Exhibitors Directory',
        //   description: '150+ international OEMs & developers',
        //   href: '/exhibitors',
        //   icon: Building2,
        // },
      ],
    },
  },
  {
    type: 'dropdown',
    data: {
      id: 'downloads',
      label: 'Downloads',
      highlightNote: 'Official 5th Edition Documentation, Forms & Rate Cards',
      actionCta: {
        label: 'Download Proposal (PDF)',
        href: '/Proposal.pdf',
      },
      items: [
        {
          title: 'Event Proposal',
          badge: 'PDF',
          description: 'Official expo scope, theme tracks & exhibition overview',
          href: '/Proposal.pdf',
          icon: FileText,
          external: true,
        },
        {
          title: 'Stall Booking Form',
          badge: 'Form',
          description: 'Two-sided official registration & booth application form',
          href: '/booking-form.pdf',
          icon: FileCheck,
          external: true,
        },
        {
          title: 'Sponsor Tariff Sheet',
          badge: 'Tariffs',
          description: 'Sponsorship tiers, deliverable matrix & rate card',
          href: '/sponsors-sheet.pdf',
          icon: Award,
          external: true,
        },
      ],
    },
  },
  { type: 'link', label: 'News', href: '/news' },
  { type: 'link', label: 'Gallery', href: '/gallery' },
  {
    type: 'dropdown',
    data: {
      id: 'visit',
      label: 'Visit',
      highlightNote: 'Free Admission · Digital Badge Registration Open',
      actionCta: {
        label: 'Register Free Badge',
        href: '/register',
      },
      items: [
        {
          title: 'Venue & Kathmandu Guide',
          description: 'Bhrikutimandap hall layout & access',
          href: '/venue',
          icon: MapPin,
        },
        {
          title: 'Visitor Registration',
          badge: 'Free Pass',
          description: 'Get your free digital visitor badge',
          href: '/register',
          icon: Ticket,
        },
        {
          title: 'Clean Energy EV Rally',
          badge: 'Rally',
          description: 'Register electric vehicle for the roadshow',
          href: '/ev-rally',
          icon: Zap,
        },
        {
          title: 'Frequently Asked Questions',
          description: 'Visas, stalls, badges & logistics FAQs',
          href: '/faq',
          icon: HelpCircle,
        },
      ],
    },
  },
  { type: 'link', label: 'Contact', href: '/contact' },
];

function getBadgeStyle(badge: string) {
  switch (badge) {
    case 'PDF':
      return 'bg-rose-50 text-rose-700 border-rose-200/70';
    case 'Form':
      return 'bg-sky-50 text-sky-700 border-sky-200/70';
    case 'Tariffs':
      return 'bg-amber-50 text-amber-800 border-amber-200/70';
    case 'Studio':
      return 'bg-sky-50 text-sky-700 border-sky-200/70';
    case 'Latest':
    case 'New':
      return 'bg-emerald-50 text-[#005C42] border-emerald-200/70';
    case 'Highlights':
      return 'bg-teal-50 text-teal-700 border-teal-200/70';
    case 'Free Pass':
      return 'bg-emerald-50 text-[#005C42] border-emerald-200/70';
    case 'Rally':
      return 'bg-emerald-50 text-emerald-800 border-emerald-200/70 font-semibold';
    case 'Overview':
      return 'bg-slate-100 text-slate-700 border-slate-200/70';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200/70';
  }
}

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<Record<string, boolean>>({
    about: false,
    exhibit: false,
    downloads: false,
    'news-media': false,
    visit: false,
  });

  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (id: string) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setActiveDropdown(id);
  };

  const handleMouseLeave = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    closeTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 200);
  };

  // Close dropdown on route change or Escape key
  useEffect(() => {
    setActiveDropdown(null);
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveDropdown(null);
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleMobileAccordion = (id: string) => {
    setMobileExpanded((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <header
      className="sticky top-0 z-50 w-full bg-white border-b border-slate-200/90 shadow-xs"
      onMouseLeave={handleMouseLeave}
    >
      {/* ── Top Announcement Strip: Clean Energy EV Rally 2027 ── */}
      <div className="w-full bg-gradient-to-r from-[#032018] via-[#004D38] to-[#032018] text-white border-b border-emerald-500/25 py-2 px-3 sm:px-6 relative z-10">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between text-xs gap-3">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#10B981] text-[#032018] font-black text-[10px] tracking-wider uppercase shrink-0 shadow-xs">
              <Zap className="w-2.5 h-2.5 fill-current animate-pulse" />
              <span>EV RALLY</span>
            </span>
            <div className="flex items-center gap-2 truncate text-[11px] sm:text-xs">
              <span className="font-semibold text-emerald-100 truncate">
                Kathmandu Valley Clean Energy EV Rally
              </span>
              <span className="hidden sm:inline-block text-emerald-400 font-mono text-[11px]">
                · Flag-Off: Friday, 9th Jan 2027 · Bhrikutimandap
              </span>
            </div>
          </div>

          <Link
            href="/ev-rally"
            className="group/rally shrink-0 inline-flex items-center gap-1 sm:gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-[#10B981] text-emerald-200 hover:text-[#032018] text-[11px] font-bold tracking-tight border border-emerald-400/30 hover:border-[#10B981] transition-all duration-200 active:scale-95"
          >
            <span>Register Vehicle</span>
            <ArrowRight className="w-3 h-3 transition-transform duration-200 group-hover/rally:translate-x-0.5" />
          </Link>
        </div>
      </div>

      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 h-20 sm:h-[88px] lg:h-[96px] flex items-center justify-between gap-4">
        {/* ── Left: Official Expo Logo ───────────────────────────────── */}
        <Link
          href="/"
          className="group inline-flex items-center shrink-0 focus-visible:outline-2 focus-visible:outline-[#00A370] rounded-xl transition-transform hover:opacity-95"
          aria-label="Himalayan Green Energy Expo 2027 — Home"
        >
          <Image
            src="/images/logo-expo.webp"
            alt="Himalayan Green Energy Expo"
            width={220}
            height={150}
            priority
            className="h-12 sm:h-14 lg:h-16 w-auto object-contain transition-transform duration-200 group-hover:scale-[1.02]"
          />
        </Link>

        {/* ── Center: Mega-Menu Navigation Links (Desktop) ─────────────── */}
        <nav
          aria-label="Main Navigation"
          className="hidden lg:flex items-center gap-1 xl:gap-2 h-full"
        >
          {NAV_STRUCTURE.map((item) => {
            if (item.type === 'link') {
              const isActive =
                item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onMouseEnter={() => setActiveDropdown(null)}
                  className={`relative px-3.5 py-2 text-[14px] font-semibold font-inter-tight rounded-md transition-colors duration-150 ${isActive
                    ? 'text-[#00A370]'
                    : 'text-slate-700 hover:text-[#00A370] hover:bg-slate-50'
                    }`}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="absolute bottom-1 left-3.5 right-3.5 h-[2px] bg-[#00A370] rounded-full" />
                  )}
                </Link>
              );
            }

            const dropdown = item.data;
            const isOpen = activeDropdown === dropdown.id;
            const isChildActive = dropdown.items.some((sub) =>
              sub.href === '/' ? pathname === '/' : pathname.startsWith(sub.href)
            );

            return (
              <div
                key={dropdown.id}
                className="group/nav relative h-full flex items-center"
                onMouseEnter={() => handleMouseEnter(dropdown.id)}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  type="button"
                  onMouseEnter={() => handleMouseEnter(dropdown.id)}
                  onClick={() =>
                    setActiveDropdown(isOpen ? null : dropdown.id)
                  }
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[13.5px] font-semibold font-inter-tight rounded-lg transition-all duration-150 ${isOpen || isChildActive
                    ? 'text-[#005C42] bg-emerald-50/70'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-slate-50 group-hover/nav:text-[#005C42] group-hover/nav:bg-emerald-50/70'
                    }`}
                  aria-expanded={isOpen}
                  aria-haspopup="true"
                >
                  <span>{dropdown.label}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen
                      ? 'rotate-180 text-[#005C42]'
                      : 'text-slate-400 group-hover/nav:rotate-180 group-hover/nav:text-[#005C42]'
                      }`}
                  />
                </button>

                {/* ── Executive Dropdown Panel (Instant CSS hover + State toggle) ── */}
                <div
                  className={`absolute top-full left-1/2 -translate-x-1/2 w-[380px] xl:w-[400px] pt-1.5 z-50 transition-all duration-200 ease-out ${isOpen
                    ? 'opacity-100 visible translate-y-0 pointer-events-auto'
                    : 'opacity-0 invisible -translate-y-2 pointer-events-none group-hover/nav:opacity-100 group-hover/nav:visible group-hover/nav:translate-y-0 group-hover/nav:pointer-events-auto'
                    }`}
                  onMouseEnter={() => handleMouseEnter(dropdown.id)}
                  onMouseLeave={handleMouseLeave}
                >
                  {/* Invisible hover bridge ensuring mouse never loses contact */}
                  <div className="absolute -top-3 left-0 right-0 h-3" />

                  <div className="bg-white/98 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-900/10 ring-1 ring-slate-950/[0.04] p-2 overflow-hidden">
                    {/* Sub-items list */}
                    <div className="flex flex-col space-y-0.5">
                      {dropdown.items.map((sub) => {
                        const isSubActive =
                          sub.href === '/'
                            ? pathname === '/'
                            : pathname.startsWith(sub.href);

                        const IconComponent = sub.icon;

                        return (
                          <Link
                            key={sub.title}
                            href={sub.href}
                            target={sub.external ? '_blank' : undefined}
                            rel={sub.external ? 'noopener noreferrer' : undefined}
                            onClick={() => setActiveDropdown(null)}
                            className={`group relative p-2.5 rounded-xl flex items-start gap-3 transition-all duration-150 ${isSubActive
                              ? 'bg-emerald-50/80 text-[#005C42]'
                              : 'hover:bg-slate-50 text-slate-800'
                              }`}
                          >
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 mt-0.5 border ${isSubActive
                                ? 'bg-[#005C42] text-white border-[#005C42] shadow-xs'
                                : 'bg-slate-100/80 text-slate-600 border-slate-200/60 group-hover:bg-emerald-50 group-hover:text-[#005C42] group-hover:border-emerald-200/60'
                                }`}
                            >
                              <IconComponent className="w-4 h-4" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span
                                  className={`text-[13px] font-semibold leading-tight transition-colors ${isSubActive
                                    ? 'text-[#005C42]'
                                    : 'text-slate-900 group-hover:text-[#005C42]'
                                    }`}
                                >
                                  {sub.title}
                                </span>

                                {sub.badge && (
                                  <span
                                    className={`text-[9.5px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md border ${getBadgeStyle(
                                      sub.badge
                                    )}`}
                                  >
                                    {sub.badge}
                                  </span>
                                )}

                                {sub.external && (
                                  <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-slate-600 ml-auto shrink-0" />
                                )}
                              </div>

                              <p className="text-[11.5px] text-slate-500 group-hover:text-slate-600 mt-0.5 line-clamp-1 leading-normal">
                                {sub.description}
                              </p>
                            </div>

                            {!sub.external && (
                              <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#005C42] group-hover:translate-x-0.5 transition-all shrink-0 self-center opacity-0 group-hover:opacity-100" />
                            )}
                          </Link>
                        );
                      })}
                    </div>

                    {/* Integrated Action CTA Strip */}
                    {dropdown.actionCta && (
                      <div className="mt-1 pt-1.5 border-t border-slate-100">
                        <Link
                          href={dropdown.actionCta.href}
                          target={dropdown.actionCta.href.endsWith('.pdf') ? '_blank' : undefined}
                          rel={dropdown.actionCta.href.endsWith('.pdf') ? 'noopener noreferrer' : undefined}
                          onClick={() => setActiveDropdown(null)}
                          className="w-full flex items-center justify-between py-2 px-3 rounded-lg bg-slate-50/80 hover:bg-emerald-50/80 text-slate-700 hover:text-[#005C42] font-semibold text-[11.5px] transition-colors group/cta"
                        >
                          <span>{dropdown.actionCta.label}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover/cta:text-[#005C42] group-hover/cta:translate-x-0.5 transition-all" />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </nav>

        {/* ── Right: CTA Buttons + Mobile Menu ───────────── */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">

          {/* Register CTA: Outlined without bg, fills background on hover */}
          <Link
            href="/register"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-full border border-[#005C42] text-[#005C42] bg-transparent hover:bg-[#005C42] hover:text-white text-xs font-bold tracking-wider uppercase font-inter-tight transition-all duration-200 active:scale-98"
          >
            <span>REGISTER</span>
          </Link>

          {/* Deep Forest Green Rounded CTA Button */}
          <Link
            href="/book-stall"
            className="hidden sm:inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full bg-[#005C42] hover:bg-[#004833] text-white text-xs font-bold tracking-wider uppercase font-inter-tight shadow-xs hover:shadow-md transition-all duration-200 active:scale-98"
          >
            <span>BOOK STALL</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            aria-expanded={mobileOpen}
            className="lg:hidden p-2 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* ── Mobile Slide-down Navigation Drawer ───────────────────────────── */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white shadow-2xl max-h-[calc(100vh-80px)] overflow-y-auto animate-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-5 flex flex-col space-y-2">
            <nav className="flex flex-col space-y-1">
              {NAV_STRUCTURE.map((item) => {
                if (item.type === 'link') {
                  const isActive =
                    item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`py-2.5 px-3 rounded-xl text-sm font-semibold transition-colors flex items-center justify-between ${isActive
                        ? 'text-[#00A370] bg-emerald-50 font-bold'
                        : 'text-slate-800 hover:bg-slate-50'
                        }`}
                    >
                      <span>{item.label}</span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </Link>
                  );
                }

                const dropdown = item.data;
                const isExpanded = !!mobileExpanded[dropdown.id];
                const isChildActive = dropdown.items.some((sub) =>
                  sub.href === '/' ? pathname === '/' : pathname.startsWith(sub.href)
                );

                return (
                  <div key={dropdown.id} className="rounded-xl overflow-hidden border border-slate-100 bg-white">
                    <button
                      type="button"
                      onClick={() => toggleMobileAccordion(dropdown.id)}
                      className={`w-full py-2.5 px-3 text-sm font-semibold flex items-center justify-between transition-colors ${isChildActive
                        ? 'bg-emerald-50/70 text-[#005C42]'
                        : 'bg-slate-50/60 text-slate-800 hover:bg-slate-100/60'
                        }`}
                    >
                      <span>{dropdown.label}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-[#005C42]' : ''
                          }`}
                      />
                    </button>

                    {isExpanded && (
                      <div className="p-1.5 bg-white flex flex-col space-y-0.5">
                        {dropdown.items.map((sub) => {
                          const isSubActive =
                            sub.href === '/'
                              ? pathname === '/'
                              : pathname.startsWith(sub.href);

                          const IconComponent = sub.icon;

                          return (
                            <Link
                              key={sub.title}
                              href={sub.href}
                              target={sub.external ? '_blank' : undefined}
                              rel={sub.external ? 'noopener noreferrer' : undefined}
                              onClick={() => setMobileOpen(false)}
                              className={`p-2 rounded-lg flex items-start gap-2.5 transition-colors ${isSubActive ? 'bg-emerald-50 text-[#005C42]' : 'hover:bg-slate-50'
                                }`}
                            >
                              <div className="w-7 h-7 rounded-md bg-slate-100/80 text-slate-600 flex items-center justify-center shrink-0 mt-0.5 border border-slate-200/50">
                                <IconComponent className="w-3.5 h-3.5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-xs font-semibold text-slate-900 leading-snug">
                                    {sub.title}
                                  </span>
                                  {sub.badge && (
                                    <span
                                      className={`text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-md border ${getBadgeStyle(
                                        sub.badge
                                      )}`}
                                    >
                                      {sub.badge}
                                    </span>
                                  )}
                                  {sub.external && (
                                    <ExternalLink className="w-3 h-3 text-slate-400 ml-auto shrink-0" />
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                                  {sub.description}
                                </p>
                              </div>
                            </Link>
                          );
                        })}

                        {dropdown.actionCta && (
                          <div className="pt-1.5 mt-1 border-t border-slate-100">
                            <Link
                              href={dropdown.actionCta.href}
                              target={dropdown.actionCta.href.endsWith('.pdf') ? '_blank' : undefined}
                              rel={dropdown.actionCta.href.endsWith('.pdf') ? 'noopener noreferrer' : undefined}
                              onClick={() => setMobileOpen(false)}
                              className="w-full flex items-center justify-between py-2 px-2.5 rounded-lg bg-slate-50/70 hover:bg-emerald-50/70 text-slate-700 hover:text-[#005C42] font-semibold text-[11px] transition-colors"
                            >
                              <span>{dropdown.actionCta.label}</span>
                              <ArrowRight className="w-3 h-3 text-[#005C42]" />
                            </Link>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-slate-200 flex flex-col gap-2.5">
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#00A370] text-[#00A370] font-bold text-xs hover:bg-emerald-50 transition-colors"
                >
                  <Ticket className="w-3.5 h-3.5" />
                  <span>Free Visitor Pass</span>
                </Link>

                <Link
                  href="/book-stall"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#005C42] text-white font-bold text-xs shadow-xs hover:bg-[#004833] transition-colors"
                >
                  <span>Book Stall</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
