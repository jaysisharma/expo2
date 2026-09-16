"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Download,
  Plus,
  CheckCircle2,
  Eye,
  Trash2,
  X,
  Printer,
} from "lucide-react";
import IDCardBadgePreview from "@/components/booking/IDCardBadgePreview";
import { BadgeConfig } from "@/components/booking/AdminBadgeDesigner";

export default function AdminRegistrationsPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPassType, setSelectedPassType] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [previewingAttendee, setPreviewingAttendee] = useState<any | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [badgeTemplates, setBadgeTemplates] = useState<{ visitor?: BadgeConfig; exhibitor?: BadgeConfig }>({});
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [newReg, setNewReg] = useState({
    name: "",
    email: "",
    phone: "",
    organization: "",
    jobTitle: "",
    country: "Nepal",
    passType: "Trade Visitor (Free)",
    stallNumber: "",
    interests: ["Hydropower & Turbines"],
  });

  const notify = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const fetchData = async () => {
    try {
      const res = await fetch("/api/admin/data");
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (e) {
      console.warn("Failed to fetch admin registrations", e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBadgeTemplates = async () => {
    try {
      const res = await fetch(`/api/badge-template?t=${Date.now()}`);
      const json = await res.json();
      if (json.success && json.data) {
        setBadgeTemplates(json.data);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchData();
    fetchBadgeTemplates();
  }, []);

  const registrations = data?.registrations || [];

  const filteredRegistrations = registrations.filter((reg: any) => {
    const matchesPass =
      selectedPassType === "All" ||
      (selectedPassType === "Visitor" && reg.passType?.includes("Visitor")) ||
      (selectedPassType === "Exhibitor" && reg.passType?.includes("Exhibitor")) ||
      (selectedPassType === "VIP" && reg.passType?.includes("VIP"));

    const matchesStatus =
      selectedStatus === "All" ||
      (selectedStatus === "Checked-in" && reg.checkedIn) ||
      (selectedStatus === "Pending" && !reg.checkedIn);

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      reg.name?.toLowerCase().includes(q) ||
      reg.email?.toLowerCase().includes(q) ||
      reg.id?.toLowerCase().includes(q) ||
      reg.organization?.toLowerCase().includes(q);

    return matchesPass && matchesStatus && matchesSearch;
  });

  const checkedInCount = registrations.filter((r: any) => r.checkedIn).length;
  const visitorCount = registrations.filter((r: any) => r.passType?.includes("Visitor")).length;
  const exhibitorCount = registrations.filter((r: any) => r.passType?.includes("Exhibitor")).length;

  const handleToggleCheckin = async (regId: string, currentStatus: boolean) => {
    setData((prev: any) => {
      if (!prev?.registrations) return prev;
      return {
        ...prev,
        registrations: prev.registrations.map((r: any) =>
          r.id === regId ? { ...r, checkedIn: !currentStatus } : r
        ),
      };
    });

    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle_checkin",
          payload: { regId, checkedIn: !currentStatus },
        }),
      });
      const json = await res.json();
      if (json.success) {
        notify(`Check-in updated for ${regId}`);
      } else {
        fetchData();
      }
    } catch (e) {
      notify("Failed to update check-in");
      fetchData();
    }
  };

  const handleDeleteRegistration = async (regId: string) => {
    if (!confirm(`Are you sure you want to delete ${regId}?`)) return;

    setData((prev: any) => {
      if (!prev?.registrations) return prev;
      return {
        ...prev,
        registrations: prev.registrations.filter((r: any) => r.id !== regId),
      };
    });

    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete_registration",
          payload: { regId },
        }),
      });
      const json = await res.json();
      if (json.success) {
        notify("Registration removed");
      } else {
        fetchData();
      }
    } catch (e) {
      notify("Failed to delete registration");
      fetchData();
    }
  };

  const handleAddRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_registration",
          payload: newReg,
        }),
      });
      const json = await res.json();
      if (json.success) {
        notify("Attendee registered");
        setShowAddModal(false);
        setNewReg({
          name: "",
          email: "",
          phone: "",
          organization: "",
          jobTitle: "",
          country: "Nepal",
          passType: "Trade Visitor (Free)",
          stallNumber: "",
          interests: ["Hydropower & Turbines"],
        });
        fetchData();
      }
    } catch (e) {
      notify("Failed to create registration");
    }
  };

  const exportCSV = () => {
    const headers = ["Badge ID", "Full Name", "Email", "Phone", "Organization", "Job Title", "Pass Type", "Stall", "Checked In"];
    const rows = filteredRegistrations.map((r: any) => [
      r.id,
      r.name,
      r.email,
      r.phone,
      r.organization,
      r.jobTitle || "",
      r.passType,
      r.stallNumber || "—",
      r.checkedIn ? "Yes" : "No",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e: any) => e.map((val: any) => `"${val}"`).join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Attendees_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 font-sans">
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 px-4 py-2 rounded-xl bg-white border border-emerald-200 text-emerald-700 text-xs font-semibold shadow-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-display font-bold text-slate-900 tracking-tight">Attendee Registrations</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Registered trade visitors, exhibitors, and VIP delegates with live check-in control.
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
            <span>Add Attendee</span>
          </button>
        </div>
      </div>

      {/* Metric chips */}
      <div className="flex flex-wrap gap-2.5 text-xs font-mono">
        <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-xs">
          Total: <strong className="text-slate-900">{registrations.length}</strong>
        </span>
        <span className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold shadow-xs">
          Checked In: <strong>{checkedInCount}</strong>
        </span>
        <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 shadow-xs">
          Visitors: <strong className="text-slate-900">{visitorCount}</strong>
        </span>
        <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 shadow-xs">
          Exhibitors: <strong className="text-slate-900">{exhibitorCount}</strong>
        </span>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200 overflow-x-auto">
          {["All", "Visitor", "Exhibitor", "VIP"].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedPassType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                selectedPassType === type
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:border-[#218A59] shadow-xs cursor-pointer"
          >
            <option value="All">All Status</option>
            <option value="Checked-in">Checked In</option>
            <option value="Pending">Pending</option>
          </select>

          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name, org, badge..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 shadow-xs focus:outline-none focus:border-[#218A59]"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 font-mono text-[10px] tracking-wider border-b border-slate-200 uppercase">
              <tr>
                <th className="p-3.5 font-bold">Badge ID</th>
                <th className="p-3.5 font-bold">Name</th>
                <th className="p-3.5 font-bold">Organization</th>
                <th className="p-3.5 font-bold">Pass Type</th>
                <th className="p-3.5 font-bold">Contact</th>
                <th className="p-3.5 font-bold text-center">Status</th>
                <th className="p-3.5 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRegistrations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 text-xs">
                    No attendees found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredRegistrations.map((reg: any) => (
                  <tr key={reg.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-[#234679]">
                      {reg.id}
                    </td>
                    <td className="p-3.5 font-semibold text-slate-900">
                      {reg.name}
                    </td>
                    <td className="p-3.5 text-slate-800">
                      <div className="font-medium">{reg.organization}</div>
                      <div className="text-[11px] text-slate-500">{reg.jobTitle}</div>
                    </td>
                    <td className="p-3.5">
                      <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {reg.passType}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-600 text-[11px]">
                      <div>{reg.email}</div>
                      <div className="font-mono text-slate-400 text-[10px]">{reg.phone}</div>
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => handleToggleCheckin(reg.id, reg.checkedIn)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold transition-colors cursor-pointer ${
                          reg.checkedIn
                            ? "text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200"
                            : "text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200"
                        }`}
                      >
                        {reg.checkedIn ? "Checked In" : "Pending"}
                      </button>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setPreviewingAttendee(reg)}
                          title="View Badge"
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteRegistration(reg.id)}
                          title="Delete"
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
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

      {/* ID Card Badge Modal Preview */}
      {previewingAttendee && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-semibold text-sm text-slate-900">Digital Entry Badge</h3>
              <button
                onClick={() => setPreviewingAttendee(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-2 flex justify-center">
              <IDCardBadgePreview
                name={previewingAttendee.name}
                organization={previewingAttendee.organization}
                jobTitle={previewingAttendee.jobTitle}
                stallNumber={previewingAttendee.stallNumber || "HALL A"}
                delegateId={previewingAttendee.id}
                country={previewingAttendee.country}
                role={previewingAttendee.passType?.includes("Exhibitor") ? "exhibitor" : "visitor"}
                templateConfig={
                  previewingAttendee.passType?.includes("Exhibitor")
                    ? badgeTemplates.exhibitor
                    : badgeTemplates.visitor
                }
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
              <button
                onClick={() => setPreviewingAttendee(null)}
                className="px-3.5 py-1.5 rounded-lg bg-[#218A59] hover:bg-[#1b734a] text-white font-medium cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Attendee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-semibold text-sm text-slate-900">Add Attendee</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddRegistration} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-mono text-slate-600 mb-1">NAME</label>
                <input
                  type="text"
                  required
                  value={newReg.name}
                  onChange={(e) => setNewReg({ ...newReg, name: e.target.value })}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#218A59]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-mono text-slate-600 mb-1">EMAIL</label>
                  <input
                    type="email"
                    required
                    value={newReg.email}
                    onChange={(e) => setNewReg({ ...newReg, email: e.target.value })}
                    placeholder="email@domain.com"
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#218A59]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-600 mb-1">PHONE</label>
                  <input
                    type="text"
                    required
                    value={newReg.phone}
                    onChange={(e) => setNewReg({ ...newReg, phone: e.target.value })}
                    placeholder="+977..."
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#218A59]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-mono text-slate-600 mb-1">ORGANIZATION</label>
                  <input
                    type="text"
                    required
                    value={newReg.organization}
                    onChange={(e) => setNewReg({ ...newReg, organization: e.target.value })}
                    placeholder="Company / Entity"
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#218A59]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-600 mb-1">DESIGNATION</label>
                  <input
                    type="text"
                    value={newReg.jobTitle}
                    onChange={(e) => setNewReg({ ...newReg, jobTitle: e.target.value })}
                    placeholder="Engineer"
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#218A59]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-mono text-slate-600 mb-1">PASS TYPE</label>
                  <select
                    value={newReg.passType}
                    onChange={(e) => setNewReg({ ...newReg, passType: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#218A59] cursor-pointer"
                  >
                    <option value="Trade Visitor (Free)">Trade Visitor</option>
                    <option value="Exhibitor Pass (All Access)">Exhibitor Pass</option>
                    <option value="VIP / Government Delegate">VIP Delegate</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-600 mb-1">STALL #</label>
                  <input
                    type="text"
                    value={newReg.stallNumber}
                    onChange={(e) => setNewReg({ ...newReg, stallNumber: e.target.value })}
                    placeholder="A-101 (optional)"
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
                  Save Attendee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
