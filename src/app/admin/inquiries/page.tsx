"use client";

import React, { useState, useEffect } from "react";
import {
  MessageSquareQuote,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Mail,
  Phone,
  Building,
  Store,
  Calendar,
  X,
  Reply,
  RefreshCw,
} from "lucide-react";

export default function AdminInquiriesPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [viewingInquiry, setViewingInquiry] = useState<any | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const fetchInquiries = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/data");
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (e) {
      console.warn("Failed to load inquiries", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const notify = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const inquiries = data?.inquiries || [];

  const filteredInquiries = inquiries.filter((inq: any) => {
    const matchesStatus = selectedStatus === "All" || inq.status === selectedStatus;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      inq.name.toLowerCase().includes(q) ||
      (inq.company && inq.company.toLowerCase().includes(q)) ||
      inq.subject.toLowerCase().includes(q) ||
      inq.message.toLowerCase().includes(q) ||
      inq.email.toLowerCase().includes(q);

    return matchesStatus && matchesSearch;
  });

  const handleUpdateStatus = async (inquiryId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_inquiry_status",
          payload: { inquiryId, status: newStatus },
        }),
      });
      const json = await res.json();
      if (json.success) {
        notify(`Inquiry status updated to ${newStatus}`);
        if (viewingInquiry && viewingInquiry.id === inquiryId) {
          setViewingInquiry({ ...viewingInquiry, status: newStatus });
        }
        fetchInquiries();
      }
    } catch (e) {
      notify("Failed to update status");
    }
  };

  const newCount = inquiries.filter((i: any) => i.status === "New").length;
  const inProgressCount = inquiries.filter((i: any) => i.status === "In Progress").length;
  const resolvedCount = inquiries.filter((i: any) => i.status === "Resolved").length;

  return (
    <div className="space-y-6 font-sans">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 px-3.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 text-xs font-medium shadow-xl flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-bold uppercase">
              Leads & CRM
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Inquiries & Contact CRM
            </h1>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Track stall booking queries, delegate requests, and sponsorship proposals.
          </p>
        </div>

        <button
          onClick={fetchInquiries}
          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 ${isLoading ? "animate-spin" : ""}`} />
          <span>Refresh Leads</span>
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-mono">TOTAL LEADS</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white">{inquiries.length}</span>
          <span className="text-[10px] text-slate-500 dark:text-slate-500 block mt-0.5">All received requests</span>
        </div>
        <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/10 border border-rose-500/30">
          <span className="text-[11px] text-rose-600 dark:text-rose-400 block font-mono">NEW INQUIRIES</span>
          <span className="text-2xl font-black text-rose-700 dark:text-rose-300">{newCount}</span>
          <span className="text-[10px] text-rose-600/80 dark:text-rose-500/80 block mt-0.5">Needs action</span>
        </div>
        <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/10 border border-amber-500/30">
          <span className="text-[11px] text-amber-600 dark:text-amber-400 block font-mono">IN PROGRESS</span>
          <span className="text-2xl font-black text-amber-700 dark:text-amber-300">{inProgressCount}</span>
          <span className="text-[10px] text-amber-600/80 dark:text-amber-500/80 block mt-0.5">Secretariat reviewing</span>
        </div>
        <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-500/30">
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 block font-mono">RESOLVED</span>
          <span className="text-2xl font-black text-emerald-700 dark:text-emerald-300">{resolvedCount}</span>
          <span className="text-[10px] text-emerald-600/80 dark:text-emerald-500/80 block mt-0.5">Confirmed & answered</span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-x-auto">
          {["All", "New", "In Progress", "Resolved"].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedStatus === st
                  ? "bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-950 font-bold shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search company, subject, email..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Inquiries Cards Grid */}
      <div className="space-y-4">
        {filteredInquiries.length === 0 ? (
          <div className="p-12 text-center text-slate-500 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs shadow-sm">
            No inquiries found matching the search criteria.
          </div>
        ) : (
          filteredInquiries.map((inq: any) => (
            <div
              key={inq.id}
              className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-sm dark:shadow-xl space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400">
                      {inq.id}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        inq.status === "New"
                          ? "bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30"
                          : inq.status === "In Progress"
                          ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30"
                          : "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                      }`}
                    >
                      {inq.status}
                    </span>
                    {inq.stallInterest && (
                      <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-500/30 text-[10px] font-mono">
                        Stall {inq.stallInterest}
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-base text-slate-900 dark:text-white">{inq.subject}</h3>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
                    {inq.message}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <select
                    value={inq.status}
                    onChange={(e) => handleUpdateStatus(inq.id, e.target.value)}
                    className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="New">Mark New</option>
                    <option value="In Progress">Mark In Progress</option>
                    <option value="Resolved">Mark Resolved</option>
                  </select>
                </div>
              </div>

              {/* Contact Footer */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                    <Building className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                    <span>{inq.company || inq.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
                    <span>{inq.email}</span>
                  </div>
                  {inq.phone && (
                    <div className="flex items-center gap-1.5 font-mono">
                      <Phone className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                      <span>{inq.phone}</span>
                    </div>
                  )}
                </div>

                <a
                  href={`mailto:${inq.email}?subject=Re: ${encodeURIComponent(inq.subject)} - Himalayan Green Energy Expo Nepal`}
                  className="flex items-center gap-1 text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-semibold"
                >
                  <Reply className="w-3.5 h-3.5" />
                  <span>Reply via Email</span>
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
