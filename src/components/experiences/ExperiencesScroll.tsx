"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function ExperiencesScroll() {
  const experiences = [
    {
      number: "01",
      title: "LIVE TURBINE & EROSION DEMONSTRATIONS",
      tagline: "Water-to-Wire Precision in Action",
      description:
        "Witness live acoustic cavitation testing, robotic HVOF hard-coating demonstrations, and hydraulic governor response rigs in the outdoor arena.",
      image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1000&q=80",
      badge: "LIVE SHOWCASE",
    },
    {
      number: "02",
      title: "CLEANTECH STUDENT & YOUTH INNOVATION CHALLENGE",
      tagline: "NPR 1,000,000 Seed Grant Finale",
      description:
        "Top engineering university teams pitch working prototypes—including silt sensors, micro-vortex generators, and AI dam safety telemetry—before global venture heads.",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=80",
      badge: "YOUTH & R&D",
    },
    {
      number: "03",
      title: "VIP B2B INVESTMENT & EPC MATCHMAKING SUITE",
      tagline: "Private Deal Rooms & Bilateral MOUs",
      description:
        "Dedicated matchmaking concierge connecting independent developers with international EPC syndicates, export-import banks, and institutional lenders.",
      image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1000&q=80",
      badge: "INVITATION ONLY",
    },
    {
      number: "04",
      title: "HIGH-ALTITUDE HYDROPOWER TECHNICAL SITE VISITS",
      tagline: "Field Excursions to Upper Tamakoshi & Trishuli",
      description:
        "Post-expo technical field tours inspecting 822m high-head penstocks, underground caverns, desanding basins, and automated 400kV substations.",
      image: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=1000&q=80",
      badge: "DELEGATE EXCURSION",
    },
    {
      number: "05",
      title: "STARTUP & HYDROTECH INNOVATION ZONE",
      tagline: "Drones, Bathymetry & Early Warning AI",
      description:
        "Showcasing emerging startups developing autonomous underwater ROVs for tunnel inspection, LiDAR terrain models, and GLOF glacier flood early warning systems.",
      image: "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1000&q=80",
      badge: "TECH INCUBATOR",
    },
  ];

  return (
    <section className="relative py-24 sm:py-32 bg-white px-4 sm:px-6 lg:px-12 border-b border-slate-200 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-technical text-hydro-primary tracking-widest uppercase mb-3 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-hydro-primary" />
              13 / IMMERSIVE EXPERIENCES
            </div>
            <h2 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl text-slate-900 tracking-tight">
              BEYOND THE <br />
              <span className="text-hydro-primary">EXHIBITION FLOOR.</span>
            </h2>
          </div>
          <p className="text-sm sm:text-base text-slate-600 max-w-md font-normal">
            Specialized experiential zones, live technology testing, student innovation prizes, and high-altitude engineering field visits.
          </p>
        </div>

        {/* Experience Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {experiences.map((item, idx) => (
            <div
              key={idx}
              className="group relative rounded-3xl bg-hydro-wash border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:border-hydro-primary transition-all duration-300 flex flex-col justify-between"
            >
              {/* Image Header */}
              <div className="relative h-60 w-full overflow-hidden bg-slate-100">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-95"
                />

                <div className="absolute top-4 left-4 font-technical text-xs font-bold text-slate-900 bg-white/95 backdrop-blur-md px-3 py-1 rounded-md border border-slate-200 shadow-sm">
                  EXP // {item.number}
                </div>

                <div className="absolute top-4 right-4 font-technical text-[10px] font-bold text-hydro-deep bg-hydro-water border border-hydro-sky px-2.5 py-1 rounded-md shadow-sm">
                  {item.badge}
                </div>
              </div>

              {/* Body */}
              <div className="p-6 flex flex-col justify-between flex-grow">
                <div>
                  <span className="text-xs font-technical text-hydro-deep tracking-wider uppercase block mb-1 font-bold">
                    {item.tagline}
                  </span>

                  <h3 className="font-display font-bold text-xl text-slate-900 group-hover:text-hydro-primary transition-colors">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-xs text-slate-600 font-normal leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between">
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-1.5 font-technical text-xs font-bold text-hydro-primary hover:text-hydro-deep transition-colors"
                  >
                    <span>ACCESS EXPERIENCE</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
