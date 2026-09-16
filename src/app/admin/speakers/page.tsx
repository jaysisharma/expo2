"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Users,
  Search,
  Plus,
  Star,
  Building2,
  Edit,
  Trash2,
  Download,
  CheckCircle2,
  X,
  Save,
  LayoutGrid,
  List,
} from "lucide-react";
import { speakersData as initialIPPANMembers } from "@/data/speakers";
import { eventSolutionTeam as initialEventSolutionTeam, EventSolutionMember } from "@/data/eventSolutionTeam";

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

const initialUnifiedMembers: UnifiedMember[] = [
  ...initialIPPANMembers.map((s) => ({
    id: s.id,
    name: s.name,
    title: s.title,
    organization: "Independent Power Producers' Association, Nepal (IPPAN)",
    orgType: "IPPAN" as const,
    photo: s.photo,
    category: s.category || "IPPAN Leadership",
    bio: s.bio,
    featured: s.featured,
  })),
  ...initialEventSolutionTeam.map((e) => ({
    id: e.id,
    name: e.name,
    title: e.position,
    organization: "Event Solution Pvt. Ltd.",
    orgType: "Event Solution" as const,
    photo: e.photo,
    category: e.category || "Executive",
    bio: `${e.position} at Event Solution Pvt. Ltd., organizing the Himalayan Green Energy Expo.`,
    featured: e.category === "Executive",
  })),
];

export default function AdminMembersPage() {
  const [members, setMembers] = useState<UnifiedMember[]>(initialUnifiedMembers);
  const [selectedOrg, setSelectedOrg] = useState<"All" | "IPPAN" | "Event Solution">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [editingMember, setEditingMember] = useState<UnifiedMember | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const notify = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const filteredMembers = members.filter((m) => {
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

  const ippanCount = members.filter((m) => m.orgType === "IPPAN").length;
  const eventSolutionCount = members.filter((m) => m.orgType === "Event Solution").length;

  const handleToggleFeatured = (id: string) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, featured: !m.featured } : m))
    );
    notify("Featured status updated");
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name}?`)) return;
    setMembers((prev) => prev.filter((m) => m.id !== id));
    notify(`Member ${name} removed`);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    setMembers((prev) =>
      prev.map((m) => (m.id === editingMember.id ? editingMember : m))
    );
    notify(`Updated ${editingMember.name}`);
    setEditingMember(null);
  };

  const handleAddSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const title = formData.get("title") as string;
    const orgType = formData.get("orgType") as "IPPAN" | "Event Solution";
    const category = formData.get("category") as string;
    const bio = formData.get("bio") as string;
    const photo = (formData.get("photo") as string) || "/images/committee/mohan-kumar-dangi.png";

    const newMember: UnifiedMember = {
      id: name.toLowerCase().replace(/\s+/g, "-"),
      name,
      title,
      organization:
        orgType === "IPPAN"
          ? "Independent Power Producers' Association, Nepal (IPPAN)"
          : "Event Solution Pvt. Ltd.",
      orgType,
      category: category || (orgType === "IPPAN" ? "IPPAN Leadership" : "Executive"),
      photo,
      bio: bio || `${title} at ${orgType}.`,
      featured: false,
    };

    setMembers([newMember, ...members]);
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
    link.setAttribute("download", `Members_IPPAN_EventSolution_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5 font-sans">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 px-3.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 text-xs font-medium shadow-xl flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono text-[10px] font-bold uppercase">
              Leadership & Organizers
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight mt-1">
            Members of IPPAN & Event Solution
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Profiles for IPPAN Executive Committee and Event Solution organizing team.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      {/* Metric chips */}
      <div className="flex flex-wrap gap-2 text-xs font-mono">
        <span className="px-3 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 shadow-xs">
          Total Members: <strong className="text-slate-900 dark:text-white">{members.length}</strong>
        </span>
        <span className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-medium">
          IPPAN Committee: <strong>{ippanCount}</strong>
        </span>
        <span className="px-3 py-1 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400 font-medium">
          Event Solution Team: <strong>{eventSolutionCount}</strong>
        </span>
      </div>

      {/* Filters & View Toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-x-auto">
          {(["All", "IPPAN", "Event Solution"] as const).map((org) => (
            <button
              key={org}
              onClick={() => setSelectedOrg(org)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                selectedOrg === org
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              {org === "All" ? "All Members" : org === "IPPAN" ? "IPPAN Committee" : "Event Solution"}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search member, role, org..."
              className="w-full pl-8 pr-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-slate-700"
            />
          </div>

          <div className="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setViewMode("table")}
              title="Table View"
              className={`p-1 rounded-md transition-colors cursor-pointer ${
                viewMode === "table"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              title="Grid View"
              className={`p-1 rounded-md transition-colors cursor-pointer ${
                viewMode === "grid"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content: Table View */}
      {viewMode === "table" ? (
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-[#051320] text-slate-500 dark:text-slate-400 font-mono text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800 uppercase">
                <tr>
                  <th className="p-3 font-semibold">Member</th>
                  <th className="p-3 font-semibold">Designation</th>
                  <th className="p-3 font-semibold">Organization</th>
                  <th className="p-3 font-semibold">Group</th>
                  <th className="p-3 font-semibold text-center">Featured</th>
                  <th className="p-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                      No members found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="relative w-8 h-8 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
                            <Image
                              src={m.photo || "/images/committee/mohan-kumar-dangi.png"}
                              alt={m.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-medium text-slate-900 dark:text-white">{m.name}</div>
                            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                              {m.category}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 font-medium text-slate-800 dark:text-slate-200">
                        {m.title}
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-400 truncate max-w-[220px]">
                        {m.organization}
                      </td>
                      <td className="p-3">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                            m.orgType === "IPPAN"
                              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                              : "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20"
                          }`}
                        >
                          {m.orgType}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleToggleFeatured(m.id)}
                          className={`p-1 rounded transition-colors cursor-pointer ${
                            m.featured
                              ? "text-amber-500 dark:text-amber-400"
                              : "text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400"
                          }`}
                        >
                          <Star className="w-3.5 h-3.5 fill-current" />
                        </button>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setEditingMember(m)}
                            className="p-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(m.id, m.name)}
                            className="p-1 rounded bg-slate-100 hover:bg-rose-500/10 dark:bg-slate-800 dark:hover:bg-rose-500/10 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Content: Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((m) => (
            <div
              key={m.id}
              className="p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs transition-all flex flex-col justify-between space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
                    <Image
                      src={m.photo || "/images/committee/mohan-kumar-dangi.png"}
                      alt={m.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">{m.name}</h3>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium block line-clamp-1">
                      {m.title}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      {m.organization}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleToggleFeatured(m.id)}
                  className={`p-1.5 rounded-lg shrink-0 cursor-pointer ${
                    m.featured
                      ? "text-amber-500 dark:text-amber-400"
                      : "text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400"
                  }`}
                  title={m.featured ? "Featured" : "Click to feature"}
                >
                  <Star className="w-3.5 h-3.5 fill-current" />
                </button>
              </div>

              {m.bio && (
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {m.bio}
                </p>
              )}

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                    m.orgType === "IPPAN"
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                      : "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20"
                  }`}
                >
                  {m.orgType}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setEditingMember(m)}
                    className="p-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(m.id, m.name)}
                    className="p-1 rounded bg-slate-100 hover:bg-rose-500/10 dark:bg-slate-800 dark:hover:bg-rose-500/10 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingMember && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white">Edit Member</h3>
              <button
                onClick={() => setEditingMember(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-mono text-slate-500 dark:text-slate-400 mb-1">
                  FULL NAME
                </label>
                <input
                  type="text"
                  required
                  value={editingMember.name}
                  onChange={(e) =>
                    setEditingMember({ ...editingMember, name: e.target.value })
                  }
                  className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-400 dark:focus:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-mono text-slate-500 dark:text-slate-400 mb-1">
                    DESIGNATION / TITLE
                  </label>
                  <input
                    type="text"
                    required
                    value={editingMember.title}
                    onChange={(e) =>
                      setEditingMember({ ...editingMember, title: e.target.value })
                    }
                    className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-400 dark:focus:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-500 dark:text-slate-400 mb-1">
                    ORGANIZATION GROUP
                  </label>
                  <select
                    value={editingMember.orgType}
                    onChange={(e) =>
                      setEditingMember({
                        ...editingMember,
                        orgType: e.target.value as "IPPAN" | "Event Solution",
                        organization:
                          e.target.value === "IPPAN"
                            ? "Independent Power Producers' Association, Nepal (IPPAN)"
                            : "Event Solution Pvt. Ltd.",
                      })
                    }
                    className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-400 dark:focus:border-slate-700 cursor-pointer"
                  >
                    <option value="IPPAN">IPPAN Committee</option>
                    <option value="Event Solution">Event Solution Team</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-500 dark:text-slate-400 mb-1">
                  CATEGORY / ROLE
                </label>
                <input
                  type="text"
                  value={editingMember.category}
                  onChange={(e) =>
                    setEditingMember({ ...editingMember, category: e.target.value })
                  }
                  className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-400 dark:focus:border-slate-700"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-500 dark:text-slate-400 mb-1">
                  BIOGRAPHY / PROFILE NOTE
                </label>
                <textarea
                  rows={3}
                  value={editingMember.bio || ""}
                  onChange={(e) =>
                    setEditingMember({ ...editingMember, bio: e.target.value })
                  }
                  className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-400 dark:focus:border-slate-700"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-3 py-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium cursor-pointer"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white">Add Member</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-mono text-slate-500 dark:text-slate-400 mb-1">
                  FULL NAME
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Sunil Bhandari"
                  className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-slate-400 dark:focus:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-mono text-slate-500 dark:text-slate-400 mb-1">
                    DESIGNATION / TITLE
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    placeholder="e.g. Chairman / VP"
                    className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-slate-400 dark:focus:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-500 dark:text-slate-400 mb-1">
                    ORGANIZATION GROUP
                  </label>
                  <select
                    name="orgType"
                    className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-400 dark:focus:border-slate-700 cursor-pointer"
                  >
                    <option value="IPPAN">IPPAN Committee</option>
                    <option value="Event Solution">Event Solution Team</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-500 dark:text-slate-400 mb-1">
                  CATEGORY / ROLE
                </label>
                <input
                  type="text"
                  name="category"
                  placeholder="e.g. Executive, Operations, Leadership"
                  className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-slate-400 dark:focus:border-slate-700"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-500 dark:text-slate-400 mb-1">
                  BIOGRAPHY / NOTE
                </label>
                <textarea
                  name="bio"
                  rows={3}
                  placeholder="Responsibilities and brief background..."
                  className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-slate-400 dark:focus:border-slate-700"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium cursor-pointer"
                >
                  Save Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
