"use client";

import React, { useState } from "react";
import { exhibitorsData } from "@/data/exhibitors";
import ExhibitorCard from "./ExhibitorCard";
import { Search, Filter, Building2, RotateCcw } from "lucide-react";

export default function ExhibitorDirectory({ limit }: { limit?: number }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  const categories = [
    "ALL",
    "Hydropower",
    "Renewable Energy",
    "Power & Electricals",
    "Investment & Finance",
    "Transmission & Distribution",
    "Engineering & Construction",
    "Digital & Smart Energy",
    "Government & Institutions",
    "Knowledge & Innovation",
  ];

  const filteredExhibitors = exhibitorsData.filter((ex) => {
    const matchesSearch =
      !searchTerm.trim() ||
      ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ex.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ex.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ex.boothNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ex.category.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (selectedCategory === "ALL") return true;

    const cat = selectedCategory.toLowerCase();
    const exCat = ex.category.toLowerCase();

    if (exCat.includes(cat) || cat.includes(exCat)) return true;
    if (cat.includes("hydropower") && (exCat.includes("turbine") || exCat.includes("hydro"))) return true;
    if (cat.includes("transmission") && (exCat.includes("transmission") || exCat.includes("substation"))) return true;
    if (cat.includes("engineering") && (exCat.includes("engineering") || exCat.includes("consulting") || exCat.includes("tunnel"))) return true;
    if (cat.includes("finance") && (exCat.includes("finance") || exCat.includes("investment"))) return true;
    if (cat.includes("renewable") && (exCat.includes("solar") || exCat.includes("wind") || exCat.includes("renewable"))) return true;
    if (cat.includes("electrical") && (exCat.includes("electro") || exCat.includes("electrical") || exCat.includes("power"))) return true;

    return false;
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
            placeholder="Search exhibitors by name, country, sector or booth..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-16 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm font-medium focus:outline-none focus:border-[#005C42] focus:ring-2 focus:ring-[#005C42]/20 transition-all shadow-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-500 hover:text-slate-900 font-semibold px-2 py-1 rounded hover:bg-slate-100 transition-colors"
            >
              CLEAR
            </button>
          )}
        </div>

        {/* Category Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
          <Filter className="w-4 h-4 text-[#005C42] shrink-0 hidden sm:block" />
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-lg text-xs font-mono tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#005C42] text-white font-bold shadow-sm border border-[#005C42]"
                    : "bg-white text-slate-700 hover:text-[#005C42] hover:bg-emerald-50/70 border border-slate-200 font-semibold shadow-xs"
                }`}
              >
                {cat === "ALL" ? "ALL SECTORS" : cat}
              </button>
            );
          })}
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
        <div className="p-12 sm:p-16 rounded-2xl bg-white border border-slate-200 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-[#005C42] border border-emerald-100 flex items-center justify-center mx-auto">
            <Building2 className="w-7 h-7" />
          </div>
          <h4 className="font-bold text-xl text-slate-900 tracking-tight">
            {searchTerm || selectedCategory !== "ALL"
              ? "No exhibitors found matching your criteria"
              : "Exhibitor Directory Updating"}
          </h4>
          <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            {searchTerm || selectedCategory !== "ALL"
              ? "Try adjusting your search keywords or switching to ALL SECTORS."
              : "Discover 100+ expected exhibitors across hydropower, renewable energy, power & electricals, and more. Profiles will be published as booth allocations finalize."}
          </p>
          {(searchTerm || selectedCategory !== "ALL") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("ALL");
              }}
              className="px-5 py-2.5 rounded-xl bg-[#005C42] hover:bg-[#004833] text-white text-xs font-bold font-mono tracking-wider transition-colors shadow-sm inline-flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>RESET FILTERS</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
