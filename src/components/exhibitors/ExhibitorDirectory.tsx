"use client";

import React, { useState } from "react";
import { exhibitorsData } from "@/data/exhibitors";
import ExhibitorCard from "./ExhibitorCard";
import { Search, Filter, Building2 } from "lucide-react";

export default function ExhibitorDirectory({ limit }: { limit?: number }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  const categories = [
    "ALL",
    "Turbines & Electro-Mechanical",
    "Transmission & Substations",
    "Engineering & Consulting",
    "Tunneling Technology",
    "Finance & Investment",
    "Hydro-Mechanical & Pumps",
  ];

  const filteredExhibitors = exhibitorsData.filter((ex) => {
    const matchesSearch =
      ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ex.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ex.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ex.boothNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "ALL" || ex.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const displayedExhibitors = limit
    ? filteredExhibitors.slice(0, limit)
    : filteredExhibitors;

  return (
    <div className="w-full">
      {/* Search Bar & Filters Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-8">
        {/* Search Field */}
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search exhibitors by name, country, technology or booth..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 text-xs font-medium focus:outline-none focus:border-hydro-primary transition-all shadow-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-technical text-slate-500 hover:text-slate-900"
            >
              CLEAR
            </button>
          )}
        </div>

        {/* Category Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
          <Filter className="w-4 h-4 text-hydro-primary shrink-0 hidden sm:block" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2 rounded-lg text-[11px] font-technical tracking-wider whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-hydro-primary text-white font-bold shadow-sm"
                  : "bg-white text-slate-700 hover:text-hydro-primary border border-slate-200"
              }`}
            >
              {cat === "ALL" ? "ALL SECTORS" : cat.split("&")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Exhibitor Cards Grid */}
      {displayedExhibitors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedExhibitors.map((exhibitor) => (
            <ExhibitorCard key={exhibitor.id} exhibitor={exhibitor} />
          ))}
        </div>
      ) : (
        <div className="p-12 rounded-2xl bg-hydro-wash border border-slate-200 text-center space-y-3">
          <Building2 className="w-10 h-10 text-slate-400 mx-auto" />
          <h4 className="font-display font-bold text-lg text-slate-900">
            No exhibitors found
          </h4>
          <p className="text-xs text-slate-600">
            Try adjusting your search keywords or sector filters.
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedCategory("ALL");
            }}
            className="px-4 py-2 rounded-lg bg-hydro-primary text-white font-technical text-xs font-bold"
          >
            RESET FILTERS
          </button>
        </div>
      )}
    </div>
  );
}
