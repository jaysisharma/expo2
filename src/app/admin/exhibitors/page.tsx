"use client";

import React, { useState } from "react";
import {
  Building2,
  Search,
  Plus,
  Star,
  Download,
  CheckCircle2,
  X,
  Trash2,
  Edit,
} from "lucide-react";
import { exhibitorsData as initialExhibitors } from "@/data/exhibitors";
import { Exhibitor } from "@/lib/types";

export default function AdminExhibitorsPage() {
  const [exhibitors, setExhibitors] = useState<Exhibitor[]>(initialExhibitors);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [editingExhibitor, setEditingExhibitor] = useState<Exhibitor | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const notify = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const filteredExhibitors = exhibitors.filter((ex) => {
    const matchesCategory = selectedCategory === "All" || ex.category.includes(selectedCategory);
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      ex.name.toLowerCase().includes(q) ||
      ex.country.toLowerCase().includes(q) ||
      ex.boothNumber.toLowerCase().includes(q) ||
      ex.category.toLowerCase().includes(q);

    return matchesCategory && matchesSearch;
  });

  const handleToggleFeatured = (id: string) => {
    setExhibitors((prev) =>
      prev.map((e) => (e.id === id ? { ...e, featured: !e.featured } : e))
    );
    notify("Featured status updated");
  };

  const handleDeleteExhibitor = (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    setExhibitors((prev) => prev.filter((e) => e.id !== id));
    notify(`Exhibitor ${name} removed`);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExhibitor) return;
    setExhibitors((prev) =>
      prev.map((item) => (item.id === editingExhibitor.id ? editingExhibitor : item))
    );
    notify(`Exhibitor ${editingExhibitor.name} updated`);
    setEditingExhibitor(null);
  };

  const handleAddSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const category = formData.get("category") as string;
    const boothNumber = formData.get("boothNumber") as string;
    const country = formData.get("country") as string;
    const contactEmail = formData.get("contactEmail") as string;
    const website = formData.get("website") as string;
    const tagline = formData.get("tagline") as string;

    const newEx: Exhibitor = {
      id: name.toLowerCase().replace(/\s+/g, "-"),
      slug: name.toLowerCase().replace(/\s+/g, "-"),
      name,
      logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80",
      country: country || "Nepal",
      countryCode: "NP",
      category: category || "Turbines & Electro-Mechanical",
      boothNumber: boothNumber || "A-101",
      hall: "Hall A",
      featured: false,
      tagline: tagline || "Clean energy solutions.",
      description: tagline || "Clean energy enterprise.",
      website: website || "https://example.com",
      contactEmail: contactEmail || "info@example.com",
      products: [],
      services: [],
      boothLocation: {
        hall: "Hall A",
        zone: "Heavy Machinery",
        areaSqM: 18,
        type: "Standard Shell",
      },
    };

    setExhibitors([newEx, ...exhibitors]);
    notify(`Added ${name}`);
    setShowAddModal(false);
  };

  const exportCSV = () => {
    const headers = ["Company Name", "Country", "Category", "Booth #", "Email", "Featured"];
    const rows = filteredExhibitors.map((e) => [
      e.name,
      e.country,
      e.category,
      e.boothNumber,
      e.contactEmail,
      e.featured ? "Yes" : "No",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.map((v) => `"${v}"`).join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Exhibitors_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 font-sans">
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 px-4 py-2 rounded-xl bg-white border border-emerald-200 text-emerald-800 text-xs font-semibold shadow-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-display font-bold text-slate-900 tracking-tight">Exhibitors Directory</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Profiles, stalls, categories, and contacts for exhibition companies.
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
            <span>Add Exhibitor</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200 overflow-x-auto">
          {["All", "Turbines", "Automation", "Transmission", "Civil"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? "bg-white text-slate-900 font-bold shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search company, booth #..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 shadow-xs focus:outline-none focus:border-[#218A59]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 font-mono text-[10px] tracking-wider border-b border-slate-200 uppercase">
              <tr>
                <th className="p-3.5 font-bold">Company</th>
                <th className="p-3.5 font-bold">Category</th>
                <th className="p-3.5 font-bold">Booth #</th>
                <th className="p-3.5 font-bold">Country</th>
                <th className="p-3.5 font-bold text-center">Featured</th>
                <th className="p-3.5 font-bold">Email</th>
                <th className="p-3.5 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExhibitors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 text-xs">
                    No exhibitors found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredExhibitors.map((ex) => (
                  <tr key={ex.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-900">{ex.name}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[200px]">{ex.tagline}</div>
                    </td>
                    <td className="p-3.5 text-slate-600 text-[11px] font-mono">
                      {ex.category}
                    </td>
                    <td className="p-3.5 font-mono font-bold text-[#234679]">
                      {ex.boothNumber}
                    </td>
                    <td className="p-3.5 text-slate-700">
                      {ex.country}
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => handleToggleFeatured(ex.id)}
                        className={`p-1 rounded transition-colors cursor-pointer ${
                          ex.featured ? "text-amber-500" : "text-slate-300 hover:text-slate-500"
                        }`}
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </button>
                    </td>
                    <td className="p-3.5 text-slate-600 text-[11px] font-mono">
                      {ex.contactEmail}
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setEditingExhibitor(ex)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteExhibitor(ex.id, ex.name)}
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

      {/* Edit Modal */}
      {editingExhibitor && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-semibold text-sm text-slate-900">Edit Exhibitor</h3>
              <button
                onClick={() => setEditingExhibitor(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-mono text-slate-600 mb-1">COMPANY NAME</label>
                <input
                  type="text"
                  required
                  value={editingExhibitor.name}
                  onChange={(e) =>
                    setEditingExhibitor({ ...editingExhibitor, name: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#218A59]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-mono text-slate-600 mb-1">BOOTH #</label>
                  <input
                    type="text"
                    value={editingExhibitor.boothNumber}
                    onChange={(e) =>
                      setEditingExhibitor({ ...editingExhibitor, boothNumber: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#218A59]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-600 mb-1">COUNTRY</label>
                  <input
                    type="text"
                    value={editingExhibitor.country}
                    onChange={(e) =>
                      setEditingExhibitor({ ...editingExhibitor, country: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#218A59]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-600 mb-1">EMAIL</label>
                <input
                  type="email"
                  value={editingExhibitor.contactEmail}
                  onChange={(e) =>
                    setEditingExhibitor({ ...editingExhibitor, contactEmail: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#218A59]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 text-xs">
                <button
                  type="button"
                  onClick={() => setEditingExhibitor(null)}
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
              <h3 className="font-semibold text-sm text-slate-900">Add Exhibitor</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-mono text-slate-600 mb-1">COMPANY NAME</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Siemens Energy"
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#218A59]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-mono text-slate-600 mb-1">CATEGORY</label>
                  <select
                    name="category"
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#218A59] cursor-pointer"
                  >
                    <option value="Turbines & Electro-Mechanical">Turbines</option>
                    <option value="Power Systems & Automation">Automation</option>
                    <option value="Transmission & Grid Infrastructure">Transmission</option>
                    <option value="Civil & Tunneling">Civil</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-600 mb-1">BOOTH #</label>
                  <input
                    type="text"
                    name="boothNumber"
                    required
                    placeholder="A-101"
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#218A59]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-mono text-slate-600 mb-1">COUNTRY</label>
                  <input
                    type="text"
                    name="country"
                    placeholder="Nepal"
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#218A59]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-600 mb-1">EMAIL</label>
                  <input
                    type="email"
                    name="contactEmail"
                    placeholder="contact@domain.com"
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#218A59]"
                  />
                </div>
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
                  Save Exhibitor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
