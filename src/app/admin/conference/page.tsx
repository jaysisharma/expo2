"use client";

import React, { useState } from "react";
import {
  CalendarDays,
  Clock,
  MapPin,
  Users,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  X,
  Save,
  Tag,
} from "lucide-react";
import { conferenceSessionsData as initialSessions } from "@/data/conference";
import { ConferenceSession } from "@/lib/types";

export default function AdminConferencePage() {
  const [sessions, setSessions] = useState<ConferenceSession[]>(initialSessions);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [editingSession, setEditingSession] = useState<ConferenceSession | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const notify = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const daySessions = sessions.filter((s) => s.day === selectedDay);

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete session "${title}"?`)) return;
    setSessions((prev) => prev.filter((s) => s.id !== id));
    notify("Session deleted");
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSession) return;
    setSessions((prev) =>
      prev.map((s) => (s.id === editingSession.id ? editingSession : s))
    );
    notify("Session updated successfully");
    setEditingSession(null);
  };

  const handleAddSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const startTime = formData.get("startTime") as string;
    const endTime = formData.get("endTime") as string;
    const hall = formData.get("hall") as string;
    const track = formData.get("track") as any;
    const sessionType = formData.get("sessionType") as any;
    const description = formData.get("description") as string;

    const newSession: ConferenceSession = {
      id: `session-${Date.now()}`,
      slug: title.toLowerCase().replace(/\s+/g, "-"),
      title,
      day: selectedDay,
      date: selectedDay === 1 ? "April 16, 2026" : selectedDay === 2 ? "April 17, 2026" : "April 18, 2026",
      startTime: startTime || "10:00",
      endTime: endTime || "11:30",
      hall: hall || "Main Plenary Hall (Himalayan Stage)",
      track: track || "Keynote Plenary",
      sessionType: sessionType || "Keynote",
      description: description || "Conference plenary session.",
      speakerIds: [],
    };

    setSessions([...sessions, newSession]);
    notify("New session added to schedule");
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 px-3.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 text-xs font-medium shadow-xl flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono text-[10px] font-bold uppercase">
              Program Agenda
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-1">
            3-Day Conference & Plenaries Manager
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure plenary stages, technical masterclasses, fireside chats, and speaker schedules.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Session</span>
        </button>
      </div>

      {/* 3-Day Switcher */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-fit">
        {[
          { day: 1, label: "Day 01 — Apr 16", theme: "Inauguration & Mega Vision" },
          { day: 2, label: "Day 02 — Apr 17", theme: "Tech, Finance & Hydrogen" },
          { day: 3, label: "Day 03 — Apr 18", theme: "Youth Challenge & Valedictory" },
        ].map((d) => (
          <button
            key={d.day}
            onClick={() => setSelectedDay(d.day)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedDay === d.day
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <div>{d.label}</div>
            <div className="text-[10px] font-normal opacity-80">{d.theme}</div>
          </button>
        ))}
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        {daySessions.length === 0 ? (
          <div className="p-12 text-center text-slate-400 dark:text-slate-500 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs">
            No conference sessions scheduled for Day {selectedDay}. Click "+ Add Session" to create one.
          </div>
        ) : (
          daySessions.map((session) => (
            <div
              key={session.id}
              className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-emerald-700 dark:text-emerald-400 font-mono text-[10px] font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>
                        {session.startTime} – {session.endTime}
                      </span>
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sky-700 dark:text-sky-400 font-mono text-[10px] font-bold flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{session.hall}</span>
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-300 font-mono text-[10px] font-bold">
                      {session.track}
                    </span>
                  </div>

                  <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                    {session.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
                    {session.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-start">
                  <button
                    onClick={() => setEditingSession(session)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-sky-400 transition-colors cursor-pointer"
                    title="Edit Session"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(session.id, session.title)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-rose-500/10 dark:bg-slate-800 dark:hover:bg-rose-500/20 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 transition-colors cursor-pointer"
                    title="Delete Session"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {session.keyTakeaways && session.keyTakeaways.length > 0 && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
                  <span className="font-mono text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    KEY AGENDA TAKEAWAYS
                  </span>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-700 dark:text-slate-300 text-[11px]">
                    {session.keyTakeaways.map((k, idx) => (
                      <li key={idx}>{k}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Edit Session Modal */}
      {editingSession && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Edit Session</h3>
              <button
                onClick={() => setEditingSession(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-500 dark:text-slate-300 mb-1">
                  SESSION TITLE
                </label>
                <input
                  type="text"
                  required
                  value={editingSession.title}
                  onChange={(e) =>
                    setEditingSession({ ...editingSession, title: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-400 dark:focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono font-bold text-slate-500 dark:text-slate-300 mb-1">
                    START TIME
                  </label>
                  <input
                    type="text"
                    value={editingSession.startTime}
                    onChange={(e) =>
                      setEditingSession({ ...editingSession, startTime: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-400 dark:focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono font-bold text-slate-500 dark:text-slate-300 mb-1">
                    END TIME
                  </label>
                  <input
                    type="text"
                    value={editingSession.endTime}
                    onChange={(e) =>
                      setEditingSession({ ...editingSession, endTime: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-400 dark:focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-500 dark:text-slate-300 mb-1">
                  HALL LOCATION
                </label>
                <input
                  type="text"
                  value={editingSession.hall}
                  onChange={(e) =>
                    setEditingSession({ ...editingSession, hall: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-400 dark:focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-500 dark:text-slate-300 mb-1">
                  DESCRIPTION
                </label>
                <textarea
                  rows={3}
                  value={editingSession.description}
                  onChange={(e) =>
                    setEditingSession({ ...editingSession, description: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-400 dark:focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingSession(null)}
                  className="px-4 py-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white cursor-pointer font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Session</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Session Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Add Session to Day 0{selectedDay}</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-500 dark:text-slate-300 mb-1">
                  SESSION TITLE
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g. Scaling Pumped Storage Hydro & Grid Stability"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono font-bold text-slate-500 dark:text-slate-300 mb-1">
                    START TIME
                  </label>
                  <input
                    type="text"
                    name="startTime"
                    defaultValue="11:30"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-400 dark:focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono font-bold text-slate-500 dark:text-slate-300 mb-1">
                    END TIME
                  </label>
                  <input
                    type="text"
                    name="endTime"
                    defaultValue="13:00"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-400 dark:focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono font-bold text-slate-500 dark:text-slate-300 mb-1">
                    STAGE / HALL
                  </label>
                  <input
                    type="text"
                    name="hall"
                    defaultValue="Main Plenary Hall (Himalayan Stage)"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-400 dark:focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono font-bold text-slate-500 dark:text-slate-300 mb-1">
                    TRACK
                  </label>
                  <select
                    name="track"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-400 dark:focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="Keynote Plenary">Keynote Plenary</option>
                    <option value="Engineering & Turbines">Engineering & Turbines</option>
                    <option value="Cross-Border Trade">Cross-Border Trade</option>
                    <option value="Green Hydrogen & Storage">Green Hydrogen & Storage</option>
                    <option value="Project Finance & ESG">Project Finance & ESG</option>
                    <option value="Tunneling & Civil">Tunneling & Civil</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-500 dark:text-slate-300 mb-1">
                  DESCRIPTION
                </label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Overview of plenary focus, topics and objectives..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white cursor-pointer font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Publish Session</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
