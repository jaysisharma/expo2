"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { speakersData } from "@/data/speakers";
import { Search, Users } from "lucide-react";

export default function SpeakerGrid({ limit }: { limit?: number }) {
  const [selectedRole, setSelectedRole] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const roleCategories = [
    { key: "ALL", label: "All Members" },
    { key: "PRESIDENCY", label: "President & Vice Presidents" },
    { key: "SECRETARIAT", label: "Secretariat & Treasury" },
    { key: "MEMBERS", label: "Executive Members" },
  ];

  const filteredMembers = useMemo(() => {
    return speakersData.filter((member) => {
      // Role categorization filter
      let matchesRole = true;
      if (selectedRole === "PRESIDENCY") {
        matchesRole =
          member.title.includes("President") ||
          member.title.includes("Senior Vice President") ||
          member.title.includes("Vice President");
      } else if (selectedRole === "SECRETARIAT") {
        matchesRole =
          member.title.includes("General Secretary") ||
          member.title.includes("Secretary") ||
          member.title.includes("Treasurer");
      } else if (selectedRole === "MEMBERS") {
        matchesRole = member.title.includes("Member");
      }

      // Search query filter
      const matchesSearch =
        searchQuery.trim() === "" ||
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.title.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesRole && matchesSearch;
    });
  }, [selectedRole, searchQuery]);

  const displayedMembers = limit
    ? filteredMembers.slice(0, limit)
    : filteredMembers;

  return (
    <div className="w-full space-y-8 font-sans">
      {/* Search & Category Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {roleCategories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedRole(cat.key)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedRole === cat.key
                  ? "bg-[#087EA4] text-white font-bold shadow-xs"
                  : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name or position..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#087EA4] transition-all shadow-xs"
          />
        </div>
      </div>

      {/* Clean Grid with Just Photo, Name & Position */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        {displayedMembers.map((member) => (
          <div
            key={member.id}
            className="group rounded-xl bg-white border border-slate-200 p-2.5 shadow-2xs hover:shadow-md hover:border-[#087EA4] transition-all duration-200 flex flex-col justify-between"
          >
            {/* Portrait Image (4:5 Aspect Ratio) */}
            <div className="relative aspect-[4/5] w-full rounded-lg overflow-hidden bg-slate-100">
              <Image
                src={member.photo}
                alt={member.name}
                fill
                unoptimized
                className="object-cover object-top group-hover:scale-104 transition-transform duration-300 ease-out"
              />
            </div>

            {/* Just Name & Position */}
            <div className="pt-2 pb-0.5 px-0.5 text-center space-y-0.5">
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-[#087EA4] transition-colors leading-snug line-clamp-1">
                {member.name}
              </h3>
              <p className="text-[10px] sm:text-[11px] font-mono font-medium text-[#087EA4] line-clamp-1">
                {member.title}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {displayedMembers.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 space-y-2">
          <Users className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-sm font-bold text-slate-800">
            No committee members found matching &ldquo;{searchQuery}&rdquo;
          </p>
          <p className="text-xs text-slate-500">
            Try searching with a different name or clearing your filter selection.
          </p>
        </div>
      )}
    </div>
  );
}
