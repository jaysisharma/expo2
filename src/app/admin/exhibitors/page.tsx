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
  Save,
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
    <div className="space-y-5 font-sans">
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 px-3.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 text-xs font-medium shadow-xl flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Exhibitors Directory</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Profiles, stalls, categories, and contacts for exhibition companies.
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
            <span>Add Exhibitor</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-x-auto">
          {["All", "Turbines", "Automation", "Transmission", "Civil"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search company, booth #..."
            className="w-full pl-8 pr-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-slate-700"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-[#051320] text-slate-500 dark:text-slate-400 font-mono text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800 uppercase">
              <tr>
                <th className="p-3 font-semibold">Company</th>
                <th className="p-3 font-semibold">Category</th>
                <th className="p-3 font-semibold">Booth #</th>
                <th className="p-3 font-semibold">Country</th>
                <th className="p-3 font-semibold text-center">Featured</th>
                <th className="p-3 font-semibold">Email</th>
                <th className="p-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {filteredExhibitors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                    No exhibitors found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredExhibitors.map((ex) => (
                  <tr key={ex.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-3">
                      <div className="font-medium text-slate-900 dark:text-white">{ex.name}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[200px]">{ex.tagline}</div>
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-400 text-[11px] font-mono">
                      {ex.category}
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                      {ex.boothNumber}
                    </td>
                    <td className="p-3 text-slate-700 dark:text-slate-300">
                      {ex.country}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleToggleFeatured(ex.id)}
                        className={`p-1 rounded transition-colors cursor-pointer ${
                          ex.featured ? "text-amber-500 dark:text-amber-400" : "text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400"
                        }`}
                      >
                        <Star className="w-3.5 h-3.5 fill-current" />
                      </button>
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-400 text-[11px] font-mono">
                      {ex.contactEmail}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEditingExhibitor(ex)}
                          className="p-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteExhibitor(ex.id, ex.name)}
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

      {/* Edit Modal */}
      {editingExhibitor && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white">Edit Exhibitor</h3>
              <button
                onClick={() => setEditingExhibitor(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-mono text-slate-500 dark:text-slate-400 mb-1">COMPANY NAME</label>
                <input
                  type="text"
                  required
                  value={editingExhibitor.name}
                  onChange={(e) =>
                    setEditingExhibitor({ ...editingExhibitor, name: e.target.value })
                  }
                  className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-400 dark:focus:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-mono text-slate-500 dark:text-slate-400 mb-1">BOOTH #</label>
                  <input
                    type="text"
                    value={editingExhibitor.boothNumber}
                    onChange={(e) =>
                      setEditingExhibitor({ ...editingExhibitor, boothNumber: e.target.value })
                    }
                    className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-400 dark:focus:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-500 dark:text-slate-400 mb-1">COUNTRY</label>
                  <input
                    type="text"
                    value={editingExhibitor.country}
                    onChange={(e) =>
                      setEditingExhibitor({ ...editingExhibitor, country: e.target.value })
                    }
                    className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-400 dark:focus:border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-500 dark:text-slate-400 mb-1">EMAIL</label>
                <input
                  type="email"
                  value={editingExhibitor.contactEmail}
                  onChange={(e) =>
                    setEditingExhibitor({ ...editingExhibitor, contactEmail: e.target.value })
                  }
                  className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-400 dark:focus:border-slate-700"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setEditingExhibitor(null)}
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
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white">Add Exhibitor</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-mono text-slate-500 dark:text-slate-400 mb-1">COMPANY NAME</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Siemens Energy"
                  className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-slate-400 dark:focus:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-mono text-slate-500 dark:text-slate-400 mb-1">CATEGORY</label>
                  <select
                    name="category"
                    className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-400 dark:focus:border-slate-700 cursor-pointer"
                  >
                    <option value="Turbines & Electro-Mechanical">Turbines</option>
                    <option value="Power Systems & Automation">Automation</option>
                    <option value="Transmission & Grid Infrastructure">Transmission</option>
                    <option value="Civil & Tunneling">Civil</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-500 dark:text-slate-400 mb-1">BOOTH #</label>
                  <input
                    type="text"
                    name="boothNumber"
                    required
                    placeholder="A-101"
                    className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-slate-400 dark:focus:border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-mono text-slate-500 dark:text-slate-400 mb-1">COUNTRY</label>
                  <input
                    type="text"
                    name="country"
                    placeholder="Nepal"
                    className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-slate-400 dark:focus:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-500 dark:text-slate-400 mb-1">EMAIL</label>
                  <input
                    type="email"
                    name="contactEmail"
                    placeholder="contact@domain.com"
                    className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-slate-400 dark:focus:border-slate-700"
                  />
                </div>
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
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
