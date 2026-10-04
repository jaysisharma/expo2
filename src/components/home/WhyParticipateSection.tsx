'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ScrollReveal } from '@/components/ui';

interface ReasonItem {
  id: string;
  num: string;
  title: string;
  description: string;
}

const REASONS_TO_ATTEND: ReasonItem[] = [
  {
    id: '01',
    num: '01',
    title: 'Connect with industry leaders and decision-makers',
    description:
      'Meet policymakers, government officials, project developers, investors, technology providers, EPC contractors and energy professionals from Nepal and international markets.',
  },
  {
    id: '02',
    num: '02',
    title: 'Gain knowledge and industry insights',
    description:
      'Engage with experts through the Himalayan Green Energy Conference, technical sessions, industry dialogue and the Green Energy Knowledge Hub.',
  },
  {
    id: '03',
    num: '03',
    title: 'Discover business and investment opportunities',
    description:
      'Connect with project developers, IPPs, investors, banks, financial institutions, technology providers and potential business partners across the energy sector.',
  },
  {
    id: '04',
    num: '04',
    title: 'Explore emerging energy technologies',
    description:
      'Discover solutions across hydropower, solar, wind, energy storage, green hydrogen, e-mobility, digital energy and smart energy technologies.',
  },
  {
    id: '05',
    num: '05',
    title: 'Showcase your solutions and build your presence',
    description:
      'Present your products, projects, technologies and solutions while building connections with potential clients, investors, partners and industry stakeholders.',
  },
];

export function WhyParticipateSection({ className = '' }: { className?: string }) {
  return (
    <section
      id="why-participate"
      className={`relative w-full bg-[#F3F6F6] text-slate-900 py-16 sm:py-24 border-t border-slate-200/70 overflow-hidden font-sans ${className}`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        <ScrollReveal direction="up" distance={25} duration={0.6}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            
            {/* Left Column: Heading, Proposal Narrative, Verified Metrics & CTAs */}
            <div className="lg:col-span-5 self-start pt-0">
              <div className="flex items-center gap-2.5 mb-2.5">
                <span className="text-xs font-bold text-[#147D72] uppercase tracking-wider font-mono">
                  WHY HIMALAYAN GREEN ENERGY EXPO 2027
                </span>
                <div className="w-8 h-0.5 bg-[#147D72]/40 rounded-full" />
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-[46px] font-bold text-[#0D2E37] tracking-tight leading-tight">
                Reasons to attend
              </h2>

              <p className="mt-4 sm:mt-5 text-base sm:text-lg font-semibold text-[#0D2E37] leading-snug">
                Connect with the people shaping Nepal’s clean-energy future.
              </p>

              <p className="mt-3 text-sm sm:text-[15px] text-slate-600 leading-relaxed font-normal">
                HIGEX 2027 brings together industry leaders, investors, policymakers, technology providers, developers and energy professionals around Nepal’s evolving clean-energy landscape.
              </p>

              {/* Verified Proposal Headline Stats */}
              <div className="my-6 py-4 border-y border-slate-200/90 flex items-center gap-6 sm:gap-8">
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#147D72] font-mono leading-none">
                    100+
                  </div>
                  <div className="text-[11px] sm:text-xs font-semibold text-slate-600 uppercase tracking-wider mt-1">
                    Expected Exhibitors
                  </div>
                </div>

                <div className="w-px h-10 bg-slate-300" />

                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#147D72] font-mono leading-none">
                    50,000+
                  </div>
                  <div className="text-[11px] sm:text-xs font-semibold text-slate-600 uppercase tracking-wider mt-1">
                    Expected Visitors
                  </div>
                </div>
              </div>

              {/* Call to Action Note */}
              <div className="pt-1">
                <p className="text-xs sm:text-sm font-semibold text-[#0D2E37] tracking-wide">
                  Be part of Nepal’s evolving green-energy ecosystem.
                </p>
              </div>
            </div>

            {/* Right Column: Verified 5 Reasons List */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-7">
              {REASONS_TO_ATTEND.map((reason) => (
                <div key={reason.id} className="flex items-start gap-3.5 sm:gap-4 group">
                  {/* Number Badge */}
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#147D72] text-white flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5 shadow-2xs group-hover:bg-[#0F5A50] transition-colors">
                    {reason.num}
                  </div>

                  {/* Text Content */}
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-[#0D2E37] leading-snug tracking-tight">
                      {reason.title}
                    </h3>
                    <p className="text-sm sm:text-[15px] leading-relaxed text-slate-600 font-normal mt-1">
                      {reason.description}
                    </p>
                  </div>
                </div>
              ))}

              {/* Action Buttons Below 05 */}
              <div className="pt-4 sm:pt-6 pl-0 sm:pl-11 flex flex-wrap items-center gap-3">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#0F5A50] hover:bg-[#0B443C] text-white text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-sm group"
                >
                  <span>REGISTER</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </Link>

                <Link
                  href="/book-stall"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs sm:text-sm font-semibold tracking-wide transition-all"
                >
                  <span>BOOK EXHIBITION STALL</span>
                </Link>
              </div>
            </div>

          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

export default WhyParticipateSection;
