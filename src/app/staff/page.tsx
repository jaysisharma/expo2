"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  QrCode,
  Camera,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  LogOut,
  Volume2,
  VolumeX,
  Keyboard,
  Users,
  Clock,
  Building,
  UserCheck,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  RotateCcw,
  MapPin,
  Ticket,
  HelpCircle,
} from "lucide-react";

interface Registration {
  id: string;
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  jobTitle?: string;
  stallNumber?: string;
  country?: string;
  passType?: string;
  checkedIn: boolean;
  checkedInAt?: string;
  checkedInBy?: string;
  status?: string;
  paymentStatus?: string;
  ticketDetails?: any;
}

interface StaffUser {
  name: string;
  role: string;
  gate: string;
  email: string;
}

// Sound effects via Web Audio API
class SoundEffects {
  private ctx: AudioContext | null = null;
  public enabled = true;

  private getContext() {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  playSuccess() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch {}
  }

  playWarning() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(330, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {}
  }

  playError() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch {}
  }
}

const sounds = new SoundEffects();

export default function StaffCheckinPage() {
  const router = useRouter();

  // Authentication & session
  const [staff, setStaff] = useState<StaffUser | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Scanner & Mode
  const [mode, setMode] = useState<"camera" | "manual" | "list">("camera");
  const [manualIdInput, setManualIdInput] = useState("");
  const [isProcessingScan, setIsProcessingScan] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [hasCameraSupport, setHasCameraSupport] = useState<boolean | null>(null);

  // Scan Outcome State
  const [scanResult, setScanResult] = useState<{
    type: "success" | "warning" | "error";
    title: string;
    message: string;
    registration?: Registration;
    timestamp?: string;
  } | null>(null);

  // Live Statistics & Directory
  const [stats, setStats] = useState({ total: 0, checkedIn: 0, pending: 0, rate: 0 });
  const [recentCheckins, setRecentCheckins] = useState<Registration[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "checkedin" | "pending">("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Camera video and stream refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const isScanningActiveRef = useRef(false);

  // 1. Verify staff session
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/staff/auth");
        const json = await res.json();
        if (json.authenticated && json.staff) {
          setStaff(json.staff);
        } else {
          router.replace("/staff/login?from=/staff");
        }
      } catch {
        router.replace("/staff/login?from=/staff");
      } finally {
        setIsLoadingAuth(false);
      }
    }
    checkAuth();
  }, [router]);

  // Debounce search query
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 2. Fetch live data
  const fetchData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch(
        `/api/staff/checkin?q=${encodeURIComponent(debouncedQuery)}&filter=${activeFilter}`
      );
      const json = await res.json();
      if (json.success) {
        setStats(json.stats);
        setRecentCheckins(json.recentCheckins || []);
        setRegistrations(json.registrations || []);
      }
    } catch (err) {
      console.warn("Failed to fetch checkin data:", err);
    } finally {
      setIsRefreshing(false);
    }
  }, [debouncedQuery, activeFilter]);

  const staffEmail = staff?.email;

  useEffect(() => {
    if (!staffEmail) return;

    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [staffEmail, fetchData]);

  // Handle Check-in API call
  const processCheckin = async (code: string) => {
    if (!code || isProcessingScan) return;
    setIsProcessingScan(true);

    try {
      const res = await fetch("/api/staff/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrData: code }),
      });

      const json = await res.json();

      if (json.success) {
        if (json.alreadyCheckedIn) {
          sounds.playWarning();
          if (typeof navigator !== "undefined" && navigator.vibrate) {
            navigator.vibrate([200, 100, 200]);
          }
          setScanResult({
            type: "warning",
            title: "Already Checked In",
            message: json.message || "This pass was already admitted earlier.",
            registration: json.registration,
            timestamp: json.checkedInAt,
          });
        } else {
          sounds.playSuccess();
          if (typeof navigator !== "undefined" && navigator.vibrate) {
            navigator.vibrate(150);
          }
          setScanResult({
            type: "success",
            title: "Admission Confirmed",
            message: json.message || "Attendee admitted successfully.",
            registration: json.registration,
            timestamp: json.checkedInAt,
          });
          setStats((prev) => ({
            ...prev,
            checkedIn: prev.checkedIn + 1,
            pending: Math.max(0, prev.pending - 1),
            rate: prev.total > 0 ? Math.round(((prev.checkedIn + 1) / prev.total) * 100) : 0,
          }));
          fetchData();
        }
      } else {
        sounds.playError();
        if (typeof navigator !== "undefined" && navigator.vibrate) {
          navigator.vibrate([100, 50, 100]);
        }
        setScanResult({
          type: "error",
          title: "Pass Not Found",
          message: json.message || "This pass was not found in the attendee registry. Please verify with the help desk.",
          registration: undefined,
        });
      }
    } catch {
      sounds.playError();
      setScanResult({
        type: "error",
        title: "Connection Error",
        message: "Could not reach the verification server. Please check your internet connection and try again.",
      });
    } finally {
      setIsProcessingScan(false);
      setManualIdInput("");
    }
  };

  // Toggle Camera Stream
  useEffect(() => {
    if (mode !== "camera" || !staff || scanResult) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      isScanningActiveRef.current = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    let isMounted = true;

    async function startCamera() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setHasCameraSupport(false);
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        setHasCameraSupport(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        isScanningActiveRef.current = true;

        if ("BarcodeDetector" in window) {
          const barcodeDetector = new (window as any).BarcodeDetector({
            formats: ["qr_code"],
          });

          const scanLoop = async () => {
            if (!isScanningActiveRef.current || !videoRef.current) return;
            try {
              if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
                const barcodes = await barcodeDetector.detect(videoRef.current);
                if (barcodes.length > 0 && barcodes[0].rawValue) {
                  const raw = barcodes[0].rawValue;
                  isScanningActiveRef.current = false;
                  processCheckin(raw);
                  return;
                }
              }
            } catch {}
            if (isScanningActiveRef.current) {
              animFrameRef.current = requestAnimationFrame(scanLoop);
            }
          };

          animFrameRef.current = requestAnimationFrame(scanLoop);
        }
      } catch (err) {
        console.warn("Camera init failed:", err);
        setHasCameraSupport(false);
      }
    }

    startCamera();

    return () => {
      isMounted = false;
      isScanningActiveRef.current = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [mode, staff, facingMode, scanResult]);

  // Logout handler
  const handleLogout = async () => {
    await fetch("/api/staff/auth", { method: "DELETE" });
    router.replace("/staff/login");
  };

  // Undo Check-in handler
  const handleUndoCheckin = async (regId: string) => {
    if (!confirm("Are you sure you want to undo this check-in?")) return;
    try {
      const res = await fetch("/api/staff/checkin", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regId, checkedIn: false }),
      });
      const json = await res.json();
      if (json.success) {
        setScanResult(null);
        fetchData();
      }
    } catch {}
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-800 font-sans gap-3">
        <RefreshCw className="w-7 h-7 text-emerald-600 animate-spin" />
        <span className="text-xs font-semibold text-slate-500">
          Loading Staff Gate Station...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col selection:bg-emerald-100">
      {/* ── TOP NAVIGATION BAR ─────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 py-3 shadow-2xs">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          {/* Logo & Gate Badge */}
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
              <QrCode className="w-4 h-4 text-emerald-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-sm text-slate-900 tracking-tight leading-none">
                  Staff Pass Check-In
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Live Gate
                </span>
              </div>
              <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="font-medium text-slate-700 truncate max-w-[160px] sm:max-w-xs">
                  {staff?.gate || "Main Gate"}
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-slate-500 truncate max-w-[100px] sm:max-w-xs">{staff?.name}</span>
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Audio Toggle */}
            <button
              type="button"
              onClick={() => {
                const next = !soundEnabled;
                setSoundEnabled(next);
                sounds.enabled = next;
              }}
              title={soundEnabled ? "Mute scan sound" : "Enable scan sound"}
              className={`p-2 rounded-xl border text-xs cursor-pointer transition-colors ${
                soundEnabled
                  ? "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200/80"
                  : "bg-white border-slate-200 text-slate-400 hover:text-slate-600"
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Refresh Sync */}
            <button
              type="button"
              onClick={() => fetchData()}
              disabled={isRefreshing}
              title="Refresh attendee data"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-700 cursor-pointer transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-emerald-600" : ""}`} />
            </button>

            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              title="Sign Out"
              className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-600 hover:text-rose-600 cursor-pointer transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT ────────────────────────────────────────────── */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 space-y-5">
        {/* 1. Simple Summary Statistics */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-0.5">
              <span className="text-[11px] font-medium text-slate-500 block">Total Registered</span>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 font-sans">
                {stats.total}
              </div>
            </div>

            <div className="space-y-0.5 border-x border-slate-100 px-3">
              <span className="text-[11px] font-medium text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Checked In</span>
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl sm:text-2xl font-bold text-emerald-700 font-sans">
                  {stats.checkedIn}
                </span>
                <span className="text-[11px] font-medium text-emerald-600">({stats.rate}%)</span>
              </div>
            </div>

            <div className="space-y-0.5 text-right sm:text-left pl-2">
              <span className="text-[11px] font-medium text-slate-500 block">Awaiting Arrival</span>
              <div className="text-xl sm:text-2xl font-bold text-slate-600 font-sans">
                {stats.pending}
              </div>
            </div>
          </div>

          {/* Simple progress bar */}
          <div className="mt-3 pt-3 border-t border-slate-100">
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, stats.rate)}%` }}
              />
            </div>
          </div>
        </div>

        {/* 2. Mode Selector: Clean, Segmented Tabs */}
        <div className="flex items-center p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/80">
          <button
            type="button"
            onClick={() => {
              setMode("camera");
              setScanResult(null);
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              mode === "camera"
                ? "bg-white text-slate-900 shadow-xs border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
            }`}
          >
            <Camera className="w-4 h-4 text-emerald-600" />
            <span>Scan QR Code</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("manual");
              setScanResult(null);
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              mode === "manual"
                ? "bg-white text-slate-900 shadow-xs border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
            }`}
          >
            <Keyboard className="w-4 h-4 text-slate-600" />
            <span>Type Pass ID</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("list");
              setScanResult(null);
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              mode === "list"
                ? "bg-white text-slate-900 shadow-xs border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
            }`}
          >
            <Users className="w-4 h-4 text-slate-600" />
            <span>Guest List</span>
          </button>
        </div>

        {/* ── 3. SCAN RESULT CARD POPUP (LARGE & UNMISTAKABLE) ─────────── */}
        {scanResult && (
          <div
            className={`p-6 rounded-3xl border shadow-lg transition-all animate-in zoom-in-95 duration-200 ${
              scanResult.type === "success"
                ? "bg-emerald-50/90 border-emerald-300 text-emerald-950"
                : scanResult.type === "warning"
                ? "bg-amber-50/90 border-amber-300 text-amber-950"
                : "bg-rose-50/90 border-rose-300 text-rose-950"
            }`}
          >
            {/* Status Header */}
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-black/5">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                    scanResult.type === "success"
                      ? "bg-emerald-600 text-white"
                      : scanResult.type === "warning"
                      ? "bg-amber-500 text-white"
                      : "bg-rose-600 text-white"
                  }`}
                >
                  {scanResult.type === "success" ? (
                    <CheckCircle2 className="w-7 h-7" />
                  ) : scanResult.type === "warning" ? (
                    <AlertTriangle className="w-7 h-7" />
                  ) : (
                    <XCircle className="w-7 h-7" />
                  )}
                </div>
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider block opacity-70">
                    Admission Result
                  </span>
                  <h3 className="text-xl font-bold tracking-tight">{scanResult.title}</h3>
                </div>
              </div>

              {/* Dismiss / Scan Next */}
              <button
                type="button"
                onClick={() => setScanResult(null)}
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold cursor-pointer hover:bg-slate-50 shadow-2xs transition-colors"
              >
                Scan Next
              </button>
            </div>

            {/* Attendee Details */}
            {scanResult.registration ? (
              <div className="py-5 space-y-4">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wide opacity-60">
                    Visitor Name
                  </span>
                  <div className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
                    {scanResult.registration.name}
                  </div>
                  <div className="text-sm font-medium text-slate-700 mt-1">
                    {scanResult.registration.organization || "Independent Visitor"}
                    {scanResult.registration.jobTitle ? ` · ${scanResult.registration.jobTitle}` : ""}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-0.5">
                    <span className="text-[11px] font-medium text-slate-500 block">Pass Category</span>
                    <span className="font-bold text-slate-900 block truncate">
                      {scanResult.registration.passType || "Trade Visitor"}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-0.5">
                    <span className="text-[11px] font-medium text-slate-500 block">Pass ID</span>
                    <span className="font-mono font-bold text-emerald-700 block">
                      {scanResult.registration.id}
                    </span>
                  </div>
                </div>

                {/* Duplicate Scan Warning */}
                {scanResult.type === "warning" && (
                  <div className="p-3.5 rounded-2xl bg-amber-100/70 border border-amber-300 text-amber-900 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
                      <span>Already Admitted Earlier</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-amber-800">
                      This pass was already scanned in. Please confirm the attendee&apos;s photo identity to ensure passes are not shared.
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1 text-xs text-slate-600">
                  <span>
                    Admitted by: <strong className="text-slate-800">{scanResult.registration.checkedInBy || staff?.name}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleUndoCheckin(scanResult.registration!.id)}
                    className="text-rose-600 hover:text-rose-700 font-semibold cursor-pointer underline"
                  >
                    Undo Check-in
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-5">
                <p className="text-xs text-rose-800 font-medium">{scanResult.message}</p>
              </div>
            )}

            {/* Primary Action Button */}
            <button
              type="button"
              onClick={() => setScanResult(null)}
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
            >
              <span>Ready for Next Pass</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── 4. CAMERA SCANNER MODE ─────────────────────────────────── */}
        {mode === "camera" && !scanResult && (
          <div className="space-y-4">
            <div className="relative w-full aspect-square max-h-[380px] rounded-3xl overflow-hidden bg-slate-900 border border-slate-300 shadow-md flex items-center justify-center">
              {/* Live Video Feed */}
              <video
                ref={videoRef}
                playsInline
                muted
                className="w-full h-full object-cover object-center"
              />

              {/* Viewfinder Target Overlays */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-8">
                <div className="relative w-52 sm:w-60 h-52 sm:h-60 border-2 border-white/60 rounded-3xl overflow-hidden shadow-2xl">
                  {/* Four Corner Accents */}
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-xl" />
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-xl" />
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-xl" />
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-xl" />

                  {/* Pulsing indicator line */}
                  <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399] animate-[bounce_2.5s_infinite]" />
                </div>
              </div>

              {/* Status Pill on top of camera */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                <span className="px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-[11px] font-medium text-white border border-white/20 flex items-center gap-1.5 shadow-md">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Camera Active · Scanning</span>
                </span>

                {/* Flip Camera */}
                <button
                  type="button"
                  onClick={() => setFacingMode((prev) => (prev === "environment" ? "user" : "environment"))}
                  className="p-2 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white backdrop-blur-md border border-white/20 pointer-events-auto cursor-pointer transition-colors shadow-md"
                  title="Switch Front/Back Camera"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Fallback if camera permission denied or unavailable */}
              {hasCameraSupport === false && (
                <div className="absolute inset-0 bg-white p-6 flex flex-col items-center justify-center text-center gap-3">
                  <Camera className="w-10 h-10 text-slate-400" />
                  <div className="space-y-1 max-w-xs">
                    <h4 className="font-bold text-sm text-slate-900">Camera Access Needed</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Please allow camera permission in your browser, or switch to typing the Pass ID manually.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMode("manual")}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs cursor-pointer shadow-xs"
                  >
                    Switch to Manual Entry
                  </button>
                </div>
              )}
            </div>

            <div className="text-center space-y-1">
              <p className="text-xs text-slate-600 font-medium">
                Hold the visitor&apos;s phone pass or paper badge in front of the camera.
              </p>
              <button
                type="button"
                onClick={() => setMode("manual")}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer underline"
              >
                Having trouble scanning? Click here to type Pass ID
              </button>
            </div>
          </div>
        )}

        {/* ── 5. MANUAL PASS ID ENTRY MODE ──────────────────────────── */}
        {mode === "manual" && !scanResult && (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-2xs space-y-4">
            <div>
              <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wide block">
                Quick Lookup
              </span>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight mt-0.5">
                Enter Registration or Pass ID
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Type the ID printed on the pass (e.g. <span className="font-mono font-semibold text-slate-700">HHE27-236435</span>) or scan with a handheld scanner gun.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                processCheckin(manualIdInput);
              }}
              className="space-y-3.5"
            >
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={manualIdInput}
                  onChange={(e) => setManualIdInput(e.target.value)}
                  placeholder="Enter Pass ID or paste verification link..."
                  autoFocus
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white text-sm font-medium transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={!manualIdInput.trim() || isProcessingScan}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40 shadow-xs"
              >
                {isProcessingScan ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Pass...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify &amp; Admit Visitor</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* ── 6. DIRECTORY & GUEST LIST MODE ────────────────────────── */}
        {mode === "list" && !scanResult && (
          <div className="space-y-4">
            {/* Search Bar & Filters */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search guest by name, company, email or Pass ID..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
                {(["all", "checkedin", "pending"] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer capitalize ${
                      activeFilter === filter
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 hover:bg-slate-200/80 text-slate-600"
                    }`}
                  >
                    {filter === "all" ? "All Guests" : filter === "checkedin" ? "Admitted" : "Awaiting Arrival"}
                  </button>
                ))}
              </div>
            </div>

            {/* Attendee List */}
            <div className="space-y-2.5">
              {registrations.length === 0 ? (
                <div className="p-8 rounded-2xl bg-white border border-slate-200/90 text-center space-y-1 shadow-2xs">
                  <p className="text-xs font-semibold text-slate-700">No attendees match your search</p>
                  <p className="text-[11px] text-slate-500">Check the spelling or try searching by Pass ID.</p>
                </div>
              ) : (
                registrations.map((reg) => (
                  <div
                    key={reg.id}
                    className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 flex items-center justify-between gap-3 shadow-2xs transition-colors"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 truncate">{reg.name}</span>
                        {reg.checkedIn ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                            Admitted
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 shrink-0">
                            Pending
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 truncate">
                        {reg.organization || "Independent"} · {reg.passType || "Trade Visitor"}
                      </p>
                      <span className="text-[11px] font-mono font-medium text-slate-400 block">
                        {reg.id}
                      </span>
                    </div>

                    <div className="shrink-0">
                      {reg.checkedIn ? (
                        <button
                          type="button"
                          onClick={() => handleUndoCheckin(reg.id)}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Undo
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => processCheckin(reg.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Check In</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ── 7. RECENT ADMISSIONS STREAM ────────────────────────────── */}
        {recentCheckins.length > 0 && (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Recent Gate Admissions
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                {recentCheckins.length} recent
              </span>
            </div>

            <div className="space-y-1.5">
              {recentCheckins.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="font-semibold text-slate-900 truncate">{item.name}</span>
                    <span className="text-slate-500 text-[11px] truncate">
                      ({item.organization || item.passType})
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-2">
                    {item.checkedInAt
                      ? new Date(item.checkedInAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Admitted"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ── FOOTER ─────────────────────────────────────────────────── */}
      <footer className="py-4 px-4 border-t border-slate-200/90 bg-white text-center text-xs text-slate-500 space-y-0.5">
        <p className="font-medium text-slate-600">
          Himalayan Green Energy Expo 2027 · Gate Verification Station
        </p>
        <p className="text-[11px] text-slate-400">
          Subdomain: <span className="font-mono text-emerald-700">staff.greenenergyexpo.org.np</span> (or <span className="font-mono text-slate-600">/staff</span>)
        </p>
      </footer>
    </div>
  );
}
