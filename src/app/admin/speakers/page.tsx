"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { speakersData as initialIPPANMembers } from "@/data/speakers";
import { eventSolutionTeam as initialEventSolutionTeam } from "@/data/eventSolutionTeam";

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
    <div className="space-y-6 font-sans">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 px-4 py-2 rounded-xl bg-white border border-emerald-200 text-emerald-800 text-xs font-semibold shadow-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#218A59] border border-emerald-200 font-mono text-[10px] font-bold uppercase">
              Leadership & Organizers
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-display font-bold text-slate-900 tracking-tight mt-1">
            Members of IPPAN & Event Solution
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Profiles for IPPAN Executive Committee and Event Solution organizing team.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-[#218A59] hover:bg-[#1b734a] text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      {/* Metric chips */}
      <div className="flex flex-wrap gap-2.5 text-xs font-mono">
        <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-xs">
          Total Members: <strong className="text-slate-900">{members.length}</strong>
        </span>
        <span className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold shadow-xs">
          IPPAN Committee: <strong>{ippanCount}</strong>
        </span>
        <span className="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 font-semibold shadow-xs">
          Event Solution Team: <strong>{eventSolutionCount}</strong>
        </span>
      </div>

      {/* Filters & View Toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200 overflow-x-auto">
          {(["All", "IPPAN", "Event Solution"] as const).map((org) => (
            <button
              key={org}
              onClick={() => setSelectedOrg(org)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                selectedOrg === org
                  ? "bg-white text-slate-900 font-bold shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {org === "All" ? "All Members" : org === "IPPAN" ? "IPPAN Committee" : "Event Solution"}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search member, role, org..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 shadow-xs focus:outline-none focus:border-[#218A59]"
            />
          </div>

          <div className="flex items-center p-0.5 rounded-xl bg-slate-100 border border-slate-200">
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

      {/* Content: Table View */}
      {viewMode === "table" ? (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 font-mono text-[10px] tracking-wider border-b border-slate-200 uppercase">
                <tr>
                  <th className="p-3.5 font-bold">Member</th>
                  <th className="p-3.5 font-bold">Designation</th>
                  <th className="p-3.5 font-bold">Organization</th>
                  <th className="p-3.5 font-bold">Group</th>
                  <th className="p-3.5 font-bold text-center">Featured</th>
                  <th className="p-3.5 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 text-xs">
                      No members found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <div className="relative w-8 h-8 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                            <Image
                              src={m.photo || "/images/committee/mohan-kumar-dangi.png"}
                              alt={m.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{m.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {m.category}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 font-medium text-slate-800">
                        {m.title}
                      </td>
                      <td className="p-3.5 text-slate-600 truncate max-w-[220px]">
                        {m.organization}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${
                            m.orgType === "IPPAN"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : "bg-blue-50 text-blue-800 border-blue-200"
                          }`}
                        >
                          {m.orgType}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => handleToggleFeatured(m.id)}
                          className={`p-1 rounded transition-colors cursor-pointer ${
                            m.featured
                              ? "text-amber-500"
                              : "text-slate-300 hover:text-slate-500"
                          }`}
                        >
                          <Star className="w-4 h-4 fill-current" />
                        </button>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setEditingMember(m)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(m.id, m.name)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
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
              className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-xs transition-all flex flex-col justify-between space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                    <Image
                      src={m.photo || "/images/committee/mohan-kumar-dangi.png"}
                      alt={m.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 line-clamp-1">{m.name}</h3>
                    <span className="text-xs text-[#218A59] font-semibold block line-clamp-1">
                      {m.title}
                    </span>
                    <span className="text-[10px] text-slate-500 line-clamp-1">
                      {m.organization}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleToggleFeatured(m.id)}
                  className={`p-1.5 rounded-lg shrink-0 cursor-pointer ${
                    m.featured
                      ? "text-amber-500"
                      : "text-slate-300 hover:text-slate-500"
                  }`}
                  title={m.featured ? "Featured" : "Click to feature"}
                >
                  <Star className="w-4 h-4 fill-current" />
                </button>
              </div>

              {m.bio && (
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {m.bio}
                </p>
              )}

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span
                  className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${
                    m.orgType === "IPPAN"
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : "bg-blue-50 text-blue-800 border-blue-200"
                  }`}
                >
                  {m.orgType}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setEditingMember(m)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(m.id, m.name)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
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
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-semibold text-sm text-slate-900">Edit Member</h3>
              <button
                onClick={() => setEditingMember(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
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

              <div className="grid grid-cols-2 gap-2.5">
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
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#218A59] cursor-pointer"
                  >
                    <option value="IPPAN">IPPAN Committee</option>
                    <option value="Event Solution">Event Solution Team</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-600 mb-1">
                  CATEGORY / ROLE
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

              <div>
                <label className="block text-[11px] font-mono text-slate-600 mb-1">
                  BIOGRAPHY / PROFILE NOTE
                </label>
                <textarea
                  rows={3}
                  value={editingMember.bio || ""}
                  onChange={(e) =>
                    setEditingMember({ ...editingMember, bio: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#218A59]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 text-xs">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-3.5 py-2 rounded-xl text-slate-600 hover:text-slate-900 cursor-pointer font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#218A59] hover:bg-[#1b734a] text-white font-semibold cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-semibold text-sm text-slate-900">Add Member</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-mono text-slate-600 mb-1">
                  FULL NAME
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Sunil Bhandari"
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#218A59]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-mono text-slate-600 mb-1">
                    DESIGNATION / TITLE
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    placeholder="e.g. Chairman / VP"
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#218A59]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-600 mb-1">
                    ORGANIZATION GROUP
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
                  CATEGORY / ROLE
                </label>
                <input
                  type="text"
                  name="category"
                  placeholder="e.g. Executive, Operations, Leadership"
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#218A59]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-600 mb-1">
                  BIOGRAPHY / NOTE
                </label>
                <textarea
                  name="bio"
                  rows={3}
                  placeholder="Responsibilities and brief background..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#218A59]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 text-xs">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 rounded-xl text-slate-600 hover:text-slate-900 cursor-pointer font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#218A59] hover:bg-[#1b734a] text-white font-semibold cursor-pointer"
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
