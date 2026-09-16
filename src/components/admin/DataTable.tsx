"use client";

import React, { useState, useMemo } from "react";
import { Search, ChevronLeft, ChevronRight, Download, Filter } from "lucide-react";

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  searchFields?: (keyof T)[];
  itemsPerPage?: number;
  actions?: React.ReactNode;
  title?: string;
  subtitle?: string;
  onExport?: () => void;
}

export default function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchPlaceholder = "Search records...",
  searchFields = [],
  itemsPerPage = 10,
  actions,
  title,
  subtitle,
  onExport,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Filtering
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const query = searchQuery.toLowerCase();

    return data.filter((item) => {
      if (searchFields.length > 0) {
        return searchFields.some((field) => {
          const val = item[field];
          return val ? String(val).toLowerCase().includes(query) : false;
        });
      }
      return Object.values(item).some((val) =>
        val ? String(val).toLowerCase().includes(query) : false
      );
    });
  }, [data, searchQuery, searchFields]);

  // Sorting
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      const compare = aVal > bVal ? 1 : -1;
      return sortOrder === "asc" ? compare : -compare;
    });
  }, [filteredData, sortKey, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(start, start + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortOrder === "asc") setSortOrder("desc");
      else {
        setSortKey(null);
        setSortOrder("asc");
      }
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  return (
    <div className="w-full bg-white dark:bg-[#0A1220]/95 border border-black/[0.08] dark:border-white/10 rounded-2xl shadow-xl overflow-hidden font-sans backdrop-blur-md transition-colors duration-300">
      {/* Table Header Controls */}
      <div className="p-5 border-b border-black/[0.06] dark:border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          {title && <h3 className="font-display font-black text-lg text-gray-900 dark:text-white tracking-tight">{title}</h3>}
          {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-sans">{subtitle}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={searchPlaceholder}
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-xs text-gray-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#218A59] dark:focus:border-[#25C176] font-sans"
            />
          </div>

          {/* Export Button */}
          {onExport && (
            <button
              onClick={onExport}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-black/[0.04] dark:bg-white/10 hover:bg-black/[0.08] dark:hover:bg-white/15 text-gray-900 dark:text-white text-xs font-mono font-bold border border-black/10 dark:border-white/10 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#218A59] dark:text-[#25C176]" />
              <span>EXPORT</span>
            </button>
          )}

          {/* Custom Actions */}
          {actions}
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-black/[0.02] dark:bg-white/[0.03] text-[#234679] dark:text-[#6FA0E8] uppercase font-mono text-[10px] font-bold tracking-wider border-b border-black/[0.06] dark:border-white/10">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                  className={`p-3.5 ${
                    col.sortable !== false ? "cursor-pointer hover:text-[#218A59] dark:hover:text-[#25C176]" : ""
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <span>{col.header}</span>
                    {sortKey === col.key && (
                      <span className="text-[#218A59] dark:text-[#25C176]">{sortOrder === "asc" ? "▲" : "▼"}</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.05] dark:divide-white/[0.06]">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs font-sans">
                  No records matching your search query.
                </td>
              </tr>
            ) : (
              paginatedData.map((item, idx) => (
                <tr
                  key={item.id || idx}
                  className="hover:bg-[#218A59]/[0.04] dark:hover:bg-white/[0.04] transition-colors text-gray-800 dark:text-slate-300 font-sans"
                >
                  {columns.map((col) => (
                    <td key={col.key} className="p-3.5 align-middle">
                      {col.render ? col.render(item) : String(item[col.key] ?? "-")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-black/[0.06] dark:border-white/10 bg-black/[0.01] dark:bg-white/[0.02] flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono">
        <div>
          Showing <strong className="text-gray-900 dark:text-white">{paginatedData.length}</strong> of{" "}
          <strong className="text-gray-900 dark:text-white">{sortedData.length}</strong> entries
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg bg-black/5 dark:bg-white/10 text-gray-700 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#218A59] hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span>
            Page <strong className="text-gray-900 dark:text-white">{currentPage}</strong> of{" "}
            <strong className="text-gray-900 dark:text-white">{totalPages}</strong>
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg bg-black/5 dark:bg-white/10 text-gray-700 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#218A59] hover:text-white transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
