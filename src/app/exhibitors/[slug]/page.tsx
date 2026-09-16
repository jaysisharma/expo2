import React from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { exhibitorsData } from "@/data/exhibitors";
import { ArrowLeft, ArrowRight, MapPin, Globe, Mail, Check, Store } from "lucide-react";

export async function generateStaticParams() {
  return exhibitorsData.map((ex) => ({
    slug: ex.slug,
  }));
}

export default async function SingleExhibitorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const exhibitor = exhibitorsData.find((e) => e.slug === slug);

  if (!exhibitor) {
    notFound();
  }

  return (
    <div className="pt-10 sm:pt-14 pb-24 bg-hydro-light text-slate-900 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-12">
        {/* Breadcrumbs */}
        <div className="mb-8">
          <Link
            href="/exhibitors"
            className="inline-flex items-center gap-2 font-technical text-xs text-slate-600 hover:text-hydro-primary transition-colors font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>BACK TO ALL EXHIBITORS</span>
          </Link>
        </div>

        {/* Company Hero Profile Header */}
        <div className="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200 shadow-md mb-12 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-technical text-xs px-3 py-1 rounded bg-hydro-wash text-slate-700 border border-slate-200 font-bold">
                {exhibitor.countryCode} · {exhibitor.country}
              </span>
              <span className="font-technical text-xs px-3 py-1 rounded bg-hydro-water text-hydro-deep border border-hydro-sky font-bold">
                {exhibitor.category}
              </span>
            </div>

            <h1 className="font-display font-black text-3xl sm:text-5xl text-slate-900 tracking-tight">
              {exhibitor.name}
            </h1>

            <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
              {exhibitor.tagline}
            </p>
          </div>

          {/* Booth Location Box */}
          <div className="p-6 rounded-2xl bg-hydro-wash border border-slate-200 text-center shrink-0 min-w-[220px]">
            <span className="text-[10px] font-technical text-slate-500 uppercase tracking-widest block font-bold">
              OFFICIAL STALL
            </span>
            <div className="font-display font-black text-4xl text-hydro-primary my-1">
              {exhibitor.boothNumber}
            </div>
            <span className="text-xs text-slate-600 block">
              {exhibitor.boothLocation.hall}
            </span>
            <span className="text-[11px] font-technical text-slate-500 block mt-1">
              {exhibitor.boothLocation.areaSqM}m² ({exhibitor.boothLocation.type})
            </span>

            <div className="mt-4 pt-3 border-t border-slate-200">
              <Link
                href="/floor-plan"
                className="font-technical text-xs font-bold text-hydro-deep hover:text-hydro-primary flex items-center justify-center gap-1.5"
              >
                <span>LOCATE ON MAP</span>
                <MapPin className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* 2-Column Profile Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Info (8 Cols) */}
          <div className="lg:col-span-8 space-y-8">
            <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-display font-bold text-2xl text-slate-900">
                Corporate Overview
              </h3>
              <p className="text-sm text-slate-600 font-normal leading-relaxed">
                {exhibitor.description}
              </p>
            </div>

            {/* Products Showcase */}
            {exhibitor.products && exhibitor.products.length > 0 && (
              <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
                <h3 className="font-display font-bold text-2xl text-slate-900">
                  Featured Products & Technologies on Display
                </h3>

                <div className="space-y-4">
                  {exhibitor.products.map((prod, idx) => (
                    <div
                      key={idx}
                      className="p-6 rounded-2xl bg-hydro-wash border border-slate-200 space-y-3"
                    >
                      <h4 className="font-display font-bold text-lg text-slate-900">
                        {prod.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
                        {prod.description}
                      </p>

                      {prod.specs && prod.specs.length > 0 && (
                        <div className="pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {prod.specs.map((spec, sIdx) => (
                            <div key={sIdx} className="flex items-center gap-2 text-slate-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-hydro-primary" />
                              <span>{spec}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <h4 className="font-technical text-xs text-hydro-primary tracking-wider uppercase font-bold">
                Services & Capabilities
              </h4>
              <div className="space-y-2">
                {exhibitor.services.map((service, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 p-2.5 rounded-lg bg-hydro-wash border border-slate-200 font-medium">
                    <Check className="w-4 h-4 text-hydro-green shrink-0" />
                    <span>{service}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <h4 className="font-technical text-xs text-hydro-primary tracking-wider uppercase font-bold">
                Contact & Communication
              </h4>
              <div className="space-y-3 text-xs">
                <a
                  href={exhibitor.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-slate-700 hover:text-hydro-primary transition-colors"
                >
                  <Globe className="w-4 h-4 text-hydro-primary" />
                  <span className="truncate">{exhibitor.website}</span>
                </a>

                <a
                  href={`mailto:${exhibitor.contactEmail}`}
                  className="flex items-center gap-2 text-slate-700 hover:text-hydro-primary transition-colors"
                >
                  <Mail className="w-4 h-4 text-hydro-primary" />
                  <span>{exhibitor.contactEmail}</span>
                </a>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <Link
                  href="/register"
                  className="w-full py-3 rounded-xl bg-hydro-primary hover:bg-hydro-deep text-white font-technical text-xs font-bold text-center block shadow-sm transition-colors"
                >
                  BOOK B2B MEETING →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
