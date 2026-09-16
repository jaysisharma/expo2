"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Save,
  Download,
  RotateCcw,
  CheckCircle2,
  Calendar,
  MapPin,
  Mail,
  Phone,
  DollarSign,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  Database,
  Sparkles,
} from "lucide-react";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    eventName: "Himalayan Green Energy Expo Nepal 2027",
    eventDates: "Magh 2 - 4 · 16–18 Jan 2027",
    venue: "Bhrikutimandap Exhibition Complex, Kathmandu",
    registrationsOpen: true,
    stallBookingsOpen: true,
    contactEmail: "expo@ippan.org.np",
    contactPhone: "+977-1-4412345",
    currencyRateUSD_NPR: 134.5,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/admin/data");
        const json = await res.json();
        if (json.success && json.data?.settings) {
          setSettings(json.data.settings);
        }
      } catch (e) {}
    }
    loadSettings();
  }, []);

  const notify = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_settings",
          payload: settings,
        }),
      });
      const json = await res.json();
      if (json.success) {
        notify("Expo settings and portal parameters saved successfully");
      }
    } catch (e) {
      notify("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const downloadFullDatabaseBackup = async () => {
    try {
      const res = await fetch("/api/admin/data");
      const json = await res.json();
      const blob = new Blob([JSON.stringify(json.data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Himalayan_Expo_Full_Backup_${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      notify("Complete Expo JSON database backup exported successfully");
    } catch (e) {
      notify("Failed to export backup");
    }
  };

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
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-mono text-[10px] font-bold uppercase">
              Configuration
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Event Parameters & System Settings
            </h1>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Manage global dates, portal registration switches, currency exchange rates, and database backups.
          </p>
        </div>

        <button
          onClick={downloadFullDatabaseBackup}
          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors self-start sm:self-auto shadow-xs"
        >
          <Download className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
          <span>Export Full JSON Database Backup</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* General Event Settings Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Calendar className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">General Expo Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
                EVENT NAME
              </label>
              <input
                type="text"
                value={settings.eventName}
                onChange={(e) => setSettings({ ...settings, eventName: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
                OFFICIAL DATES STRING
              </label>
              <input
                type="text"
                value={settings.eventDates}
                onChange={(e) => setSettings({ ...settings, eventDates: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
                VENUE & COMPLEX
              </label>
              <input
                type="text"
                value={settings.venue}
                onChange={(e) => setSettings({ ...settings, venue: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
                EXCHANGE RATE (1 USD = NPR)
              </label>
              <input
                type="number"
                step="0.1"
                value={settings.currencyRateUSD_NPR}
                onChange={(e) =>
                  setSettings({ ...settings, currencyRateUSD_NPR: parseFloat(e.target.value) || 134.5 })
                }
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
                SECRETARIAT CONTACT EMAIL
              </label>
              <input
                type="email"
                value={settings.contactEmail}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300 mb-1">
                SECRETARIAT HOTLINE
              </label>
              <input
                type="text"
                value={settings.contactPhone}
                onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Public Portals Availability Toggles */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <ShieldCheck className="w-4 h-4 text-sky-500 dark:text-sky-400" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Public Portal Controls</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-slate-900 dark:text-white block">
                  Public Visitor Registration
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Allow attendees to register and generate free digital entry badges
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  setSettings({ ...settings, registrationsOpen: !settings.registrationsOpen })
                }
                className={`p-2 rounded-xl text-xs font-bold font-mono transition-all ${
                  settings.registrationsOpen
                    ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/40"
                    : "bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-500/40"
                }`}
              >
                {settings.registrationsOpen ? "OPEN (Active)" : "CLOSED"}
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-slate-900 dark:text-white block">
                  Public Stall Booking System
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Allow exhibitors to submit online booth reservations
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  setSettings({ ...settings, stallBookingsOpen: !settings.stallBookingsOpen })
                }
                className={`p-2 rounded-xl text-xs font-bold font-mono transition-all ${
                  settings.stallBookingsOpen
                    ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/40"
                    : "bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-500/40"
                }`}
              >
                {settings.stallBookingsOpen ? "OPEN (Active)" : "CLOSED"}
              </button>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-all"
          >
            <Save className={`w-4 h-4 ${isSaving ? "animate-spin" : ""}`} />
            <span>{isSaving ? "Saving..." : "Save All Configuration"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
