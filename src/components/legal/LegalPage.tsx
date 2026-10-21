import React from "react";
import Link from "next/link";

export interface LegalSection {
  heading: string;
  body: React.ReactNode;
}

export const LEGAL_LAST_UPDATED = "21 October 2026";

export default function LegalPage({
  title,
  intro,
  sections,
}: {
  title: string;
  intro: React.ReactNode;
  sections: LegalSection[];
}) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 flex flex-col">
      <div className="bg-[#04281E] text-white pt-32 sm:pt-36 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 border-b border-emerald-500/20">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 text-xs text-emerald-300/70 font-mono mb-3">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#34D399]">{title}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">{title}</h1>
          <p className="mt-3 text-xs font-mono text-emerald-100/60">Last updated: {LEGAL_LAST_UPDATED}</p>
        </div>
      </div>

      <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 flex-grow">
        <article className="max-w-3xl mx-auto space-y-8 text-sm sm:text-[15px] leading-relaxed text-slate-700">
          <div className="text-slate-600">{intro}</div>

          {sections.map((section, i) => (
            <section key={section.heading} className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                {i + 1}. {section.heading}
              </h2>
              <div className="space-y-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_a]:text-[#007A5E] [&_a]:underline">
                {section.body}
              </div>
            </section>
          ))}

          <div className="pt-6 border-t border-slate-200 text-xs text-slate-500 flex flex-wrap gap-x-4 gap-y-1">
            <Link href="/privacy-policy" className="hover:text-[#007A5E]">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-[#007A5E]">Terms &amp; Conditions</Link>
            <Link href="/cookie-policy" className="hover:text-[#007A5E]">Cookie Policy</Link>
            <Link href="/contact" className="hover:text-[#007A5E]">Contact</Link>
          </div>
        </article>
      </div>
    </div>
  );
}
