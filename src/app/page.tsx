import { Hero } from '@/components/hero';
import { MountainRidgeDivider } from '@/components/ui';
import { AboutExpoPlatform, WhyParticipateSection, WhoWillYouMeetSection, EventAttractionsSection, GalaDinnerSection, LatestNewsSection } from '@/components/home';
import { ExpoJourney, OrganizersSection, InaugurationMomentsSection } from '@/components/story';
import { ConferenceThemesSection } from '@/components/conference';
import { SpeakersSection } from '@/components/speakers';
import { OfficialPatronsStrip, CurrentPartnersStrip } from '@/components/sponsors';
import { ConversionCTASection } from '@/components/booking';

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--c-bg)] text-[var(--c-text-primary)] transition-colors duration-300">
      {/* ── Main Landing Page Content Flow ── */}
      <main className="relative flex flex-col w-full">
        {/* 01: Hero (Header, Cinematic Video, Awwwards 5th Edition Badge) */}
        <Hero />

        {/* ── Seamless Himalayan Mountain Ridge Skyline Divider ── */}
        <div className="relative w-full bg-[#071322] -mt-1 z-10">
          <MountainRidgeDivider fillColor="#ffffff" accentColor="#00E599" />
        </div>

        {/* 02: About The Expo / Regional Platform */}
        <AboutExpoPlatform />

        {/* 03: Why Participate? — Reasons to attend HIGEX 2027 */}
        <WhyParticipateSection />

        {/* 04: Who Will You Meet? — The People Behind Nepal's Energy Future */}
        <WhoWillYouMeetSection />

        {/* 05: The Expo Journey (2018–2024 Track Record + 5th Edition Announcement) */}
        <ExpoJourney />

        {/* 06: Exhibition Sectors & Dedicated Pavilions */}
        <ConferenceThemesSection />

        {/* 07: Key Event Attractions (11 Official Highlights across 4 Pillars) */}
        <EventAttractionsSection />

        {/* 08: Distinguished Keynote Speakers & Organising Leadership */}
        <SpeakersSection />

        {/* 09: Networking Dinner */}
        <GalaDinnerSection />

        {/* 10: State Inaugural Moments & Chief Guests */}
        <InaugurationMomentsSection />

        {/* 11: Behind The Expo (IPPAN × Event Solution Joint Summit Leadership) */}
        <OrganizersSection />

        {/* 12a: Current 2027 Edition Official Partners & Sponsors (Hidden automatically when empty) */}
        <CurrentPartnersStrip />

        {/* 12b: Official Patronage, Government Endorsements & Previous Partners */}
        <OfficialPatronsStrip />

        {/* 13: Latest News & Events Section */}
        <LatestNewsSection />

        {/* 14: High-Conversion Closing CTA */}
        <ConversionCTASection />
      </main>
    </div>
  );
}
