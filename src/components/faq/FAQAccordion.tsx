"use client";

import React, { useState, useMemo } from "react";
import { faqsData } from "@/data/faqs";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Search, HelpCircle, CheckCircle2 } from "lucide-react";

export default function FAQAccordion({ limit }: { limit?: number }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const categories = [
    { key: "ALL", label: "All Questions" },
    { key: "General & Visiting", label: "Visiting & Entry" },
    { key: "Exhibition & Stalls", label: "Stalls & Booking" },
    { key: "Conference & Speakers", label: "Conference & Summits" },
    { key: "International Delegates & Visas", label: "International & Visas" },
    { key: "Sponsorship", label: "Sponsorship" },
  ];

  const filteredFaqs = useMemo(() => {
    return faqsData.filter((item) => {
      const matchesCategory =
        selectedCategory === "ALL" || item.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === "" ||
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const displayedFaqs = limit ? filteredFaqs.slice(0, limit) : filteredFaqs;

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="w-full space-y-8 font-sans">
      {/* Search & Category Filter Bar */}
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative w-full max-w-xl">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search questions by topic (e.g. visa, badge, stall size, parking)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#087EA4] focus:ring-2 focus:ring-[#087EA4]/10 transition-all shadow-xs"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => {
                setSelectedCategory(cat.key);
                setOpenIndex(0);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.key
                  ? "bg-[#087EA4] text-white font-bold shadow-xs"
                  : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Accordion List */}
      <div className="space-y-3">
        {displayedFaqs.length > 0 ? (
          displayedFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.id}
                className="rounded-xl bg-white border border-slate-200 overflow-hidden shadow-xs hover:border-[#087EA4]/40 transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggleFAQ(idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-md bg-sky-50 text-[#087EA4] text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                      Q
                    </span>
                    <span className="font-bold text-sm sm:text-base text-slate-900 leading-snug">
                      {faq.question}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-[#087EA4]" : ""
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                      <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pl-11">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200 p-8 space-y-2">
            <HelpCircle className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-bold text-slate-800">
              No questions found matching &ldquo;{searchQuery}&rdquo;
            </p>
            <p className="text-xs text-slate-500">
              Try searching with different keywords or contact our support secretariat.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
