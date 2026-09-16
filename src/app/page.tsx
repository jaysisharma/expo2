'use client';

import React from 'react';
import { Hero } from '@/components/hero';
import { ExpoJourney, OrganizersSection, InaugurationMomentsSection } from '@/components/story';
import { ConferenceThemesSection } from '@/components/conference';
import { SpeakersSection } from '@/components/speakers';
import { GalaDinnerSection } from '@/components/home';
import { OfficialPatronsStrip } from '@/components/sponsors';
import { ConversionCTASection } from '@/components/booking';

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--c-bg)] text-[var(--c-text-primary)] transition-colors duration-300">
      {/* ── Main Landing Page Content Flow ── */}
      <main className="relative flex flex-col w-full">
        {/* 01: Hero (Header, Expanding Video, Nepal Clean Energy Milestones 1911 -> 2035) */}
        <Hero />

        {/* 02: The Expo Journey (2018, 2019, 2022, 2024 & 5th Milestone Preview) */}
        <ExpoJourney />

        {/* 03: Behind The Expo (IPPAN × Event Solution Joint Organizers) */}
        <OrganizersSection />

        {/* 04: Inaugural Moments, Chief Guests & Dignitaries */}
        <InaugurationMomentsSection />

        {/* 05: Major Exhibition Sectors & Focus Pillars */}
        <ConferenceThemesSection />

        {/* 06: Distinguished Leaders & Event Management Team */}
        <SpeakersSection />

        {/* 07: VIP Gala Dinner & Awards (Executive Networking Night) */}
        <GalaDinnerSection />

        {/* 08: Official Patronage, Partners & Endorsing Bodies */}
        <OfficialPatronsStrip />

        {/* 09: Participate / Exhibition Stall Booking & Free Visitor Registration */}
        <ConversionCTASection />
      </main>
    </div>
  );
}
