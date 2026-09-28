"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  Users,
  Search,
  Plus,
  Star,
  Edit,
  Trash2,
  Download,
  CheckCircle2,
  X,
  LayoutGrid,
  List,
  Building2,
  Briefcase,
  ShieldCheck,
  AlertCircle,
  Filter,
} from "lucide-react";
import { speakersData as initialIPPANMembers } from "@/data/speakers";
import { eventSolutionTeam as initialEventSolutionTeam } from "@/data/eventSolutionTeam";
import { ImageUploadField } from "@/components/admin/ImageUploadField";

export interface UnifiedMember {
  id: string;
  name: string;
  title: string;
  organization: string;
  orgType: "IPPAN" | "Event Solution";
  photo: string;
  category: string;
  bio?: string;
  featured?: boolean;
}

const STORAGE_KEY = "expo_organization_members";

const defaultMembers: UnifiedMember[] = [
  ...initialIPPANMembers.map((s) => ({
    id: s.id,
    name: s.name,
    title: s.title,
    organization: "Independent Power Producers' Association, Nepal (IPPAN)",
    orgType: "IPPAN" as const,
    photo: s.photo || "/images/committee/mohan-kumar-dangi.webp",
    category: s.category || "IPPAN Leadership",
    bio: s.bio,
    featured: s.featured ?? false,
  })),
  ...initialEventSolutionTeam.map((e) => ({
    id: e.id,
    name: e.name,
    title: e.position,
    organization: "Event Solution Pvt. Ltd.",
    orgType: "Event Solution" as const,
    photo: e.photo || "/images/committee/mohan-kumar-dangi.webp",
    category: e.category || "Executive",
    bio: `${e.position} at Event Solution Pvt. Ltd., organizing the Himalayan Green Energy Expo.`,
    featured: e.category === "Executive",
  })),
];

export default function AdminMembersPage() {
  const [members, setMembers] = useState<UnifiedMember[]>([]);
  const [mounted, setMounted] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<"All" | "IPPAN" | "Event Solution">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingMember, setEditingMember] = useState<UnifiedMember | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addModalPhoto, setAddModalPhoto] = useState("/images/committee/mohan-kumar-dangi.webp");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Load from localStorage or defaults
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMembers(parsed);
          setMounted(true);
          return;
        }
      }
    } catch (e) {
      console.error("Failed to load members from localStorage", e);
    }
    setMembers(defaultMembers);
    setMounted(true);
  }, []);

  // Save to localStorage
  const saveMembers = (updated: UnifiedMember[]) => {
    setMembers(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save members to localStorage", e);
    }
  };

  const notify = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Filtered members list
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchesOrg = selectedOrg === "All" || m.orgType === selectedOrg;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.title.toLowerCase().includes(q) ||
        m.organization.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q);

      return matchesOrg && matchesSearch;
    });
  }, [members, selectedOrg, searchQuery]);

  // Counts
  const ippanCount = members.filter((m) => m.orgType === "IPPAN").length;
  const eventSolutionCount = members.filter((m) => m.orgType === "Event Solution").length;
  const featuredCount = members.filter((m) => m.featured).length;

  // Selection handlers
  const handleToggleSelectAll = () => {
    const filteredIds = filteredMembers.map((m) => m.id);
    const allSelected = filteredIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Bulk actions
  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (
      !confirm(
        `Are you sure you want to delete ${selectedIds.length} selected member${
          selectedIds.length > 1 ? "s" : ""
        }?`
      )
    ) {
      return;
    }
    const updated = members.filter((m) => !selectedIds.includes(m.id));
    saveMembers(updated);
    notify(`Deleted ${selectedIds.length} member(s)`);
    setSelectedIds([]);
  };

  const handleBulkToggleFeatured = (enable: boolean) => {
    if (selectedIds.length === 0) return;
    const updated = members.map((m) =>
      selectedIds.includes(m.id) ? { ...m, featured: enable } : m
    );
    saveMembers(updated);
    notify(
      `${enable ? "Featured" : "Unfeatured"} ${selectedIds.length} member(s)`
    );
  };

  // Single item actions
  const handleToggleFeatured = (id: string) => {
    const updated = members.map((m) =>
      m.id === id ? { ...m, featured: !m.featured } : m
    );
    saveMembers(updated);
    notify("Featured status updated");
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name}?`)) return;
    const updated = members.filter((m) => m.id !== id);
    saveMembers(updated);
    setSelectedIds((prev) => prev.filter((item) => item !== id));
    notify(`Member ${name} removed`);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    const updated = members.map((m) =>
      m.id === editingMember.id ? editingMember : m
    );
    saveMembers(updated);
    notify(`Updated ${editingMember.name}`);
    setEditingMember(null);
  };

  const handleAddSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const title = formData.get("title") as string;
    const orgType = formData.get("orgType") as "IPPAN" | "Event Solution";
    const customOrg = formData.get("organization") as string;
    const category = formData.get("category") as string;
    const bio = formData.get("bio") as string;
    const photo =
      (formData.get("photo") as string) || "/images/committee/mohan-kumar-dangi.webp";
    const featured = formData.get("featured") === "on";

    const defaultOrgName =
      orgType === "IPPAN"
        ? "Independent Power Producers' Association, Nepal (IPPAN)"
        : "Event Solution Pvt. Ltd.";

    const newMember: UnifiedMember = {
      id: `${name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now().toString(36)}`,
      name,
      title,
      organization: customOrg?.trim() || defaultOrgName,
      orgType,
      category: category?.trim() || (orgType === "IPPAN" ? "IPPAN Leadership" : "Executive"),
      photo,
      bio: bio?.trim() || `${title} at ${orgType}.`,
      featured,
    };

    saveMembers([newMember, ...members]);
    notify(`Added ${name}`);
    setShowAddModal(false);
  };

  const exportCSV = () => {
    const headers = ["Name", "Designation", "Organization", "Group", "Category", "Featured"];
    const rows = filteredMembers.map((m) => [
      m.name,
      m.title,
      m.organization,
      m.orgType,
      m.category,
      m.featured ? "Yes" : "No",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.map((val) => `"${val}"`).join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Organization_Members_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isAllFilteredSelected =
    filteredMembers.length > 0 &&
    filteredMembers.every((m) => selectedIds.includes(m.id));

  return (
    <div className="space-y-6 font-sans">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-medium shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono text-[10px] font-semibold uppercase tracking-wider">
              Directory & Administration
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Organization Members
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Profiles for IPPAN Executive Committee & Event Solution organizing management.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={exportCSV}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-slate-200 shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-[#218A59] hover:bg-[#1b734a] text-white font-medium text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
              Total Members
            </span>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              {mounted ? members.length : "—"}
            </div>
            <span className="text-[10px] text-slate-500">Across both organizations</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-100 text-slate-600">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono text-emerald-600 uppercase tracking-wider block">
              IPPAN Committee
            </span>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              {mounted ? ippanCount : "—"}
            </div>
            <span className="text-[10px] text-slate-500">Leadership & Board</span>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono text-blue-600 uppercase tracking-wider block">
              Event Solution Team
            </span>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              {mounted ? eventSolutionCount : "—"}
            </div>
            <span className="text-[10px] text-slate-500">Organizing & Management</span>
          </div>
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-100">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono text-amber-600 uppercase tracking-wider block">
              Featured Profiles
            </span>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              {mounted ? featuredCount : "—"}
            </div>
            <span className="text-[10px] text-slate-500">Key leadership highlights</span>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
            <Star className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Floating Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="p-3 rounded-2xl bg-slate-900 text-white shadow-xl flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 border border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-mono text-xs font-semibold">
              {selectedIds.length} selected
            </span>
            <span className="text-xs text-slate-300 hidden sm:inline">
              Perform bulk operations on selected members
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkToggleFeatured(true)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
            >
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>Mark Featured</span>
            </button>
            <button
              onClick={() => handleBulkToggleFeatured(false)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
            >
              <span>Unfeature</span>
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border border-rose-500/30"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Clear Selection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Filter and View Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Organization Filter Pills */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200 overflow-x-auto text-xs">
          <button
            onClick={() => setSelectedOrg("All")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
              selectedOrg === "All"
                ? "bg-white text-slate-900 font-semibold shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All Members ({members.length})
          </button>
          <button
            onClick={() => setSelectedOrg("IPPAN")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
              selectedOrg === "IPPAN"
                ? "bg-white text-slate-900 font-semibold shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            IPPAN ({ippanCount})
          </button>
          <button
            onClick={() => setSelectedOrg("Event Solution")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
              selectedOrg === "Event Solution"
                ? "bg-white text-slate-900 font-semibold shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Event Solution ({eventSolutionCount})
          </button>
        </div>

        {/* Search & Layout Toggle */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search member, role, org..."
              className="w-full pl-9 pr-8 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 shadow-xs focus:outline-none focus:border-[#218A59]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200">
            <button
              onClick={() => setViewMode("table")}
              title="Table View"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === "table"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              title="Grid View"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === "grid"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === "table" ? (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-mono text-[10px] tracking-wider border-b border-slate-200 uppercase">
                <tr>
                  <th className="p-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={isAllFilteredSelected}
                      onChange={handleToggleSelectAll}
                      className="rounded border-slate-300 text-[#218A59] focus:ring-[#218A59] cursor-pointer"
                      title="Select All Filtered"
                    />
                  </th>
                  <th className="p-3.5 font-semibold">Member</th>
                  <th className="p-3.5 font-semibold">Designation / Role</th>
                  <th className="p-3.5 font-semibold">Organization</th>
                  <th className="p-3.5 font-semibold">Group</th>
                  <th className="p-3.5 font-semibold text-center">Featured</th>
                  <th className="p-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Users className="w-8 h-8 text-slate-300 stroke-1" />
                        <span className="text-sm font-medium text-slate-600">No members found</span>
                        <span className="text-xs text-slate-400">Try modifying search or filter criteria.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((m) => {
                    const isSelected = selectedIds.includes(m.id);
                    return (
                      <tr
                        key={m.id}
                        className={`transition-colors hover:bg-slate-50/80 ${
                          isSelected ? "bg-emerald-50/40" : ""
                        }`}
                      >
                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelect(m.id)}
                            className="rounded border-slate-300 text-[#218A59] focus:ring-[#218A59] cursor-pointer"
                          />
                        </td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <div className="relative w-9 h-9 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                              <Image
                                src={m.photo || "/images/committee/mohan-kumar-dangi.webp"}
                                alt={m.name}
                                fill
                                sizes="36px"
                                className="object-cover"
                                onError={(e) => {
                                  // Fallback handled gracefully
                                  const target = e.target as HTMLImageElement;
                                  target.src = "/images/committee/mohan-kumar-dangi.webp";
                                }}
                              />
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900 leading-tight">
                                {m.name}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                {m.category}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5 font-medium text-slate-800">
                          {m.title}
                        </td>
                        <td className="p-3.5 text-slate-600 max-w-[220px] truncate" title={m.organization}>
                          {m.organization}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono font-medium border ${
                              m.orgType === "IPPAN"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-blue-50 text-blue-700 border-blue-200"
                            }`}
                          >
                            {m.orgType}
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => handleToggleFeatured(m.id)}
                            className={`p-1 rounded-md transition-colors cursor-pointer ${
                              m.featured
                                ? "text-amber-500 hover:text-amber-600"
                                : "text-slate-300 hover:text-slate-500"
                            }`}
                            title={m.featured ? "Featured member" : "Click to feature"}
                          >
                            <Star
                              className={`w-4 h-4 ${
                                m.featured ? "fill-current" : ""
                              }`}
                            />
                          </button>
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setEditingMember(m)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                              title="Edit member"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(m.id, m.name)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Remove member"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 bg-slate-50/50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing {filteredMembers.length} of {members.length} members
            </span>
            {selectedIds.length > 0 && (
              <span className="font-mono text-emerald-700 font-medium">
                {selectedIds.length} row(s) selected
              </span>
            )}
          </div>
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredMembers.map((m) => {
            const isSelected = selectedIds.includes(m.id);
            return (
              <div
                key={m.id}
                className={`p-4 rounded-2xl bg-white border transition-all flex flex-col justify-between space-y-3 relative ${
                  isSelected
                    ? "border-emerald-500 ring-1 ring-emerald-500/20 shadow-xs bg-emerald-50/10"
                    : "border-slate-200 hover:border-slate-300 shadow-xs"
                }`}
              >
                {/* Card Top Row: Checkbox, Badge, Star */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelect(m.id)}
                      className="rounded border-slate-300 text-[#218A59] focus:ring-[#218A59] cursor-pointer"
                    />
                    <span
                      className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-md border ${
                        m.orgType === "IPPAN"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-blue-50 text-blue-700 border-blue-200"
                      }`}
                    >
                      {m.orgType}
                    </span>
                  </div>

                  <button
                    onClick={() => handleToggleFeatured(m.id)}
                    className={`p-1 rounded cursor-pointer ${
                      m.featured
                        ? "text-amber-500"
                        : "text-slate-300 hover:text-slate-500"
                    }`}
                    title={m.featured ? "Featured" : "Click to feature"}
                  >
                    <Star
                      className={`w-4 h-4 ${m.featured ? "fill-current" : ""}`}
                    />
                  </button>
                </div>

                {/* Card Main: Avatar + Details */}
                <div className="flex items-start gap-3">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                    <Image
                      src={m.photo || "/images/committee/mohan-kumar-dangi.webp"}
                      alt={m.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm text-slate-900 truncate">
                      {m.name}
                    </h3>
                    <div className="text-xs text-[#218A59] font-medium truncate mt-0.5">
                      {m.title}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">
                      {m.organization}
                    </div>
                  </div>
                </div>

                {m.bio && (
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {m.bio}
                  </p>
                )}

                {/* Card Footer: Category + Actions */}
                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                    {m.category}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingMember(m)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(m.id, m.name)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Modal */}
      {editingMember && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Edit Member Profile</h3>
                <p className="text-xs text-slate-500 mt-0.5">Update details for {editingMember.name}</p>
              </div>
              <button
                onClick={() => setEditingMember(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-mono text-slate-600 mb-1">
                  FULL NAME
                </label>
                <input
                  type="text"
                  required
                  value={editingMember.name}
                  onChange={(e) =>
                    setEditingMember({ ...editingMember, name: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#218A59]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-600 mb-1">
                    DESIGNATION / TITLE
                  </label>
                  <input
                    type="text"
                    required
                    value={editingMember.title}
                    onChange={(e) =>
                      setEditingMember({ ...editingMember, title: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#218A59]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-600 mb-1">
                    ORGANIZATION GROUP
                  </label>
                  <select
                    value={editingMember.orgType}
                    onChange={(e) => {
                      const newOrgType = e.target.value as "IPPAN" | "Event Solution";
                      setEditingMember({
                        ...editingMember,
                        orgType: newOrgType,
                        organization:
                          newOrgType === "IPPAN"
                            ? "Independent Power Producers' Association, Nepal (IPPAN)"
                            : "Event Solution Pvt. Ltd.",
                      });
                    }}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#218A59] cursor-pointer"
                  >
                    <option value="IPPAN">IPPAN Committee</option>
                    <option value="Event Solution">Event Solution Team</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-600 mb-1">
                  ORGANIZATION FULL NAME
                </label>
                <input
                  type="text"
                  value={editingMember.organization}
                  onChange={(e) =>
                    setEditingMember({ ...editingMember, organization: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#218A59]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-600 mb-1">
                    CATEGORY / COMMITTEE
                  </label>
                  <input
                    type="text"
                    value={editingMember.category}
                    onChange={(e) =>
                      setEditingMember({ ...editingMember, category: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#218A59]"
                  />
                </div>
              <div className="pt-1">
                <ImageUploadField
                  label="Member Photo"
                  value={editingMember.photo}
                  onChange={(url) =>
                    setEditingMember({ ...editingMember, photo: url })
                  }
                  folder="speakers"
                />
              </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-600 mb-1">
                  BIOGRAPHY / RESPONSIBILITY
                </label>
                <textarea
                  rows={2}
                  value={editingMember.bio || ""}
                  onChange={(e) =>
                    setEditingMember({ ...editingMember, bio: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#218A59]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="editFeatured"
                  checked={editingMember.featured ?? false}
                  onChange={(e) =>
                    setEditingMember({ ...editingMember, featured: e.target.checked })
                  }
                  className="rounded border-slate-300 text-[#218A59] focus:ring-[#218A59] cursor-pointer"
                />
                <label htmlFor="editFeatured" className="text-xs text-slate-700 font-medium cursor-pointer">
                  Feature this member on leadership highlights
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-3.5 py-2 rounded-xl text-slate-600 hover:text-slate-900 cursor-pointer font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#218A59] hover:bg-[#1b734a] text-white font-medium cursor-pointer shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Add Organization Member</h3>
                <p className="text-xs text-slate-500 mt-0.5">Add an IPPAN or Event Solution team member</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-mono text-slate-600 mb-1">
                  FULL NAME *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Sunil Bhandari"
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#218A59]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-600 mb-1">
                    DESIGNATION / TITLE *
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    placeholder="e.g. Vice President, Event Lead"
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#218A59]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-600 mb-1">
                    ORGANIZATION GROUP *
                  </label>
                  <select
                    name="orgType"
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#218A59] cursor-pointer"
                  >
                    <option value="IPPAN">IPPAN Committee</option>
                    <option value="Event Solution">Event Solution Team</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-600 mb-1">
                  ORGANIZATION FULL NAME (OPTIONAL)
                </label>
                <input
                  type="text"
                  name="organization"
                  placeholder="Leave empty to use default organization name"
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#218A59]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-600 mb-1">
                    CATEGORY / ROLE
                  </label>
                  <input
                    type="text"
                    name="category"
                    placeholder="e.g. Leadership, Operations"
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#218A59]"
                  />
                </div>
              <div className="pt-1">
                <ImageUploadField
                  name="photo"
                  label="Member Photo"
                  value={addModalPhoto}
                  onChange={setAddModalPhoto}
                  folder="speakers"
                />
              </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-600 mb-1">
                  BIOGRAPHY / RESPONSIBILITY
                </label>
                <textarea
                  name="bio"
                  rows={2}
                  placeholder="Brief responsibilities or profile summary..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#218A59]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  name="featured"
                  id="addFeatured"
                  className="rounded border-slate-300 text-[#218A59] focus:ring-[#218A59] cursor-pointer"
                />
                <label htmlFor="addFeatured" className="text-xs text-slate-700 font-medium cursor-pointer">
                  Feature this member on leadership highlights
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 rounded-xl text-slate-600 hover:text-slate-900 cursor-pointer font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#218A59] hover:bg-[#1b734a] text-white font-medium cursor-pointer shadow-xs"
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
