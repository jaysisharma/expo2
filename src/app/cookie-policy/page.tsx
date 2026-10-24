import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/components/legal/LegalPage";
import CookieSettingsButton from "@/components/legal/CookieSettingsButton";
import { CONTACT_DETAILS } from "@/data/contactInfo";

export const metadata: Metadata = {
  title: "Cookie Policy | Himalayan Green Energy Expo 2027",
  description: "Which cookies the Himalayan Green Energy Expo website uses and how to control them.",
};

const COOKIES = [
  { name: "hhe_consent", type: "Essential", purpose: "Remembers your cookie choice", duration: "6 months" },
  { name: "hhe_admin_token / hhe_staff_token", type: "Essential", purpose: "Keeps organiser and gate staff signed in (staff only)", duration: "Up to 7 days" },
  { name: "Site data (local storage)", type: "Functional", purpose: "Remembers details you entered in brochure-download and registration forms so you don't retype them, and caches news and pass designs for faster loading", duration: "Until cleared" },
  { name: "hhe_src", type: "Analytics (optional)", purpose: "Remembers which site, social network or campaign link brought you here, so we can see which channels lead to registrations", duration: "90 days" },
  { name: "hhe_visit_tracked (session storage)", type: "Analytics (optional)", purpose: "Counts your visit once per browser session", duration: "Until the tab is closed" },
];

export default function CookiePolicyPage() {
  return (
    <LegalPage
      title="Cookie Policy"
      intro={
        <p>
          Cookies are small text files stored in your browser. This page explains the cookies and similar storage the Himalayan
          Green Energy Expo website uses. Read it together with our <Link href="/privacy-policy" className="text-[#007A5E] underline">Privacy Policy</Link>.
        </p>
      }
      sections={[
        {
          heading: "Cookies we use",
          body: (
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="w-full text-xs sm:text-sm">
                <thead className="bg-slate-50 text-left text-slate-600">
                  <tr>
                    <th className="px-3 py-2 font-semibold">Name</th>
                    <th className="px-3 py-2 font-semibold">Type</th>
                    <th className="px-3 py-2 font-semibold">Purpose</th>
                    <th className="px-3 py-2 font-semibold">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {COOKIES.map((c) => (
                    <tr key={c.name} className="border-t border-slate-100 align-top">
                      <td className="px-3 py-2 font-mono text-[11px] text-slate-800">{c.name}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{c.type}</td>
                      <td className="px-3 py-2">{c.purpose}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{c.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ),
        },
        {
          heading: "Anonymous visit counts",
          body: (
            <p>
              Even if you choose &ldquo;Necessary only&rdquo;, we count page visits anonymously: the referring website, landing page,
              device type and country. We also count, anonymously, when a form is started or submitted and whether a payment
              succeeded, so we can find steps that are confusing. No cookie is set and nothing is stored that identifies you or
              links one visit to another.
            </p>
          ),
        },
        {
          heading: "Web crawlers",
          body: (
            <p>
              We log automated visits from search engines, AI crawlers and link-preview bots (for example Googlebot or the bot that
              builds WhatsApp link previews) as daily counts per crawler. This does not involve visitor data.
            </p>
          ),
        },
        {
          heading: "Third-party cookies",
          body: (
            <p>
              We do not use advertising cookies. When you pay online you are taken to our payment partner&apos;s page, and embedded
              content such as YouTube videos or Google Maps may set their own cookies under their own policies.
            </p>
          ),
        },
        {
          heading: "Managing your choice",
          body: (
            <>
              <p>
                You can change your choice at any time. Choosing &ldquo;Necessary only&rdquo; deletes the analytics cookie. You can
                also block or delete cookies in your browser settings.
              </p>
              <CookieSettingsButton />
            </>
          ),
        },
        {
          heading: "Contact",
          body: (
            <p>
              Questions about cookies? Email <a href={`mailto:${CONTACT_DETAILS.emails.expo}`}>{CONTACT_DETAILS.emails.expo}</a>.
            </p>
          ),
        },
      ]}
    />
  );
}
