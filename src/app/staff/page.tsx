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
  Sparkles,
  RotateCcw,
  Zap,
  MapPin,
  Ticket,
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

// Synthesize audio beeps via Web Audio API without needing external sound files
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
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.12); // E6
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

  // 2. Fetch live data
  const fetchData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch(
        `/api/staff/checkin?q=${encodeURIComponent(searchQuery)}&filter=${activeFilter}`
      );
      const json = await res.json();
      if (json.success) {
        setStats(json.stats);
        setRecentCheckins(json.recentCheckins || []);
        setRegistrations(json.registrations || []);
        if (json.staff) setStaff(json.staff);
      }
    } catch (err) {
      console.warn("Failed to fetch checkin data:", err);
    } finally {
      setIsRefreshing(false);
    }
  }, [searchQuery, activeFilter]);

  useEffect(() => {
    if (staff) {
      fetchData();
      const interval = setInterval(fetchData, 15000); // 15s polling
      return () => clearInterval(interval);
    }
  }, [staff, fetchData]);

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
            message: json.message,
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
            message: json.message,
            registration: json.registration,
            timestamp: json.checkedInAt,
          });
          // Update stats locally
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
          title: "Invalid Pass",
          message: json.message || "Pass not recognized in registry.",
          registration: undefined,
        });
      }
    } catch {
      sounds.playError();
      setScanResult({
        type: "error",
        title: "Network Error",
        message: "Failed to communicate with check-in verification server.",
      });
    } finally {
      setIsProcessingScan(false);
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

        // Native BarcodeDetector loop (Supported in Chrome Android, Safari iOS 17+, Edge)
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
      <div className="min-h-screen bg-[#071322] flex flex-col items-center justify-center text-white font-sans gap-3">
        <RefreshCw className="w-8 h-8 text-[#00E599] animate-spin" />
        <span className="text-xs text-slate-400 font-mono tracking-wider">
          AUTHENTICATING STAFF SESSION...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#071322] text-slate-100 font-sans flex flex-col selection:bg-[#00E599]/30">
      {/* ── TOP APP BAR ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          {/* Brand & Gate Identity */}
          <div className="flex items-center gap-2.5">
            <div className="relative w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <QrCode className="w-4 h-4 text-[#00E599]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-sm text-white tracking-tight leading-none">
                  HIGEX Gate Control
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="truncate max-w-[140px] sm:max-w-[200px]">
                  {staff?.gate || "Main Gate"}
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-slate-400 font-medium">{staff?.name}</span>
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Audio Toggle */}
            <button
              type="button"
              onClick={() => {
                const next = !soundEnabled;
                setSoundEnabled(next);
                sounds.enabled = next;
              }}
              title={soundEnabled ? "Mute Scanner Audio" : "Enable Scanner Audio"}
              className={`p-2 rounded-xl border text-xs cursor-pointer transition-colors ${
                soundEnabled
                  ? "bg-slate-900 border-slate-800 text-emerald-400 hover:bg-slate-800"
                  : "bg-slate-900/50 border-slate-800 text-slate-500 hover:text-slate-300"
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Refresh */}
            <button
              type="button"
              onClick={() => fetchData()}
              disabled={isRefreshing}
              title="Sync Registrations"
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-emerald-400" : ""}`} />
            </button>

            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              title="Staff Logout"
              className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 cursor-pointer transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT CONTAINER ───────────────────────────────────── */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-5">
        {/* 1. Real-time KPI Metric Cards */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3 bg-slate-900/90 border border-slate-800 p-3.5 sm:p-4 rounded-2xl shadow-xl backdrop-blur-md">
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              Registered
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-black text-white font-mono">
                {stats.total}
              </span>
              <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">attendees</span>
            </div>
          </div>

          <div className="space-y-0.5 border-x border-slate-800 px-2 sm:px-3">
            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Admitted</span>
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
                {stats.checkedIn}
              </span>
              <span className="text-[10px] font-mono text-emerald-500/80">({stats.rate}%)</span>
            </div>
          </div>

          <div className="space-y-0.5 text-right sm:text-left">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              Pending
            </span>
            <div className="flex items-baseline justify-end sm:justify-start gap-1.5">
              <span className="text-xl sm:text-2xl font-black text-slate-300 font-mono">
                {stats.pending}
              </span>
              <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">remaining</span>
            </div>
          </div>

          {/* Progress Strip */}
          <div className="col-span-3 pt-2">
            <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-[#00E599] rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, stats.rate)}%` }}
              />
            </div>
          </div>
        </div>

        {/* 2. Mode Selector: Scanner | Manual ID | Directory */}
        <div className="grid grid-cols-3 p-1 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setMode("camera");
              setScanResult(null);
            }}
            className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === "camera"
                ? "bg-[#218A59] text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>QR Scanner</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("manual");
              setScanResult(null);
            }}
            className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === "manual"
                ? "bg-[#218A59] text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Keyboard className="w-4 h-4" />
            <span>Pass ID Entry</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("list");
              setScanResult(null);
            }}
            className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === "list"
                ? "bg-[#218A59] text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Directory</span>
          </button>
        </div>

        {/* ── 3. SCAN RESULT CARD POPUP / BANNER ────────────────────── */}
        {scanResult && (
          <div
            className={`p-5 rounded-3xl border shadow-2xl transition-all animate-in zoom-in-95 duration-200 ${
              scanResult.type === "success"
                ? "bg-emerald-950/90 border-emerald-500/50 text-emerald-100"
                : scanResult.type === "warning"
                ? "bg-amber-950/90 border-amber-500/60 text-amber-100"
                : "bg-rose-950/90 border-rose-500/50 text-rose-100"
            }`}
          >
            {/* Status Header */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                    scanResult.type === "success"
                      ? "bg-emerald-500 text-slate-950 shadow-emerald-500/30"
                      : scanResult.type === "warning"
                      ? "bg-amber-400 text-slate-950 shadow-amber-400/30"
                      : "bg-rose-500 text-white shadow-rose-500/30"
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
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider block opacity-75">
                    SCANNER FEEDBACK //
                  </span>
                  <h3 className="text-xl font-black tracking-tight">{scanResult.title}</h3>
                </div>
              </div>

              {/* Dismiss / Scan Next */}
              <button
                type="button"
                onClick={() => setScanResult(null)}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold cursor-pointer transition-colors"
              >
                Scan Next
              </button>
            </div>

            {/* Attendee Details if recognized */}
            {scanResult.registration ? (
              <div className="py-4 space-y-3.5">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider opacity-60">
                    DELEGATE / VISITOR NAME
                  </span>
                  <div className="text-2xl font-black text-white tracking-tight">
                    {scanResult.registration.name}
                  </div>
                  <div className="text-sm font-medium text-slate-200 mt-0.5">
                    {scanResult.registration.organization || "Independent Energy Professional"}
                    {scanResult.registration.jobTitle ? ` · ${scanResult.registration.jobTitle}` : ""}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-black/25 border border-white/5 space-y-0.5">
                    <span className="text-[10px] font-mono opacity-60 block">PASS TIER</span>
                    <span className="font-bold text-white block truncate">
                      {scanResult.registration.passType || "Trade Visitor"}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-black/25 border border-white/5 space-y-0.5">
                    <span className="text-[10px] font-mono opacity-60 block">PASS ID</span>
                    <span className="font-mono font-bold text-emerald-300 block">
                      {scanResult.registration.id}
                    </span>
                  </div>
                </div>

                {/* Warning details if duplicate */}
                {scanResult.type === "warning" && (
                  <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-200 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <ShieldAlert className="w-4 h-4 text-amber-400" />
                      <span>Duplicate Scan Warning</span>
                    </div>
                    <p className="text-[11px] leading-relaxed opacity-90">
                      This pass was already admitted earlier. Verify photo ID or badge holder identity to ensure the pass is not being shared between multiple visitors.
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 text-[11px] opacity-75">
                  <span>
                    Admitted by: {scanResult.registration.checkedInBy || staff?.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleUndoCheckin(scanResult.registration!.id)}
                    className="text-rose-400 hover:underline font-semibold cursor-pointer"
                  >
                    Undo Check-in
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-4">
                <p className="text-xs text-rose-200">{scanResult.message}</p>
              </div>
            )}

            {/* Quick Action Button */}
            <button
              type="button"
              onClick={() => setScanResult(null)}
              className="w-full py-3 rounded-xl bg-white text-slate-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md hover:bg-slate-100 transition-colors"
            >
              <span>Ready for Next Pass</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── 4. CAMERA SCANNER MODE ─────────────────────────────────── */}
        {mode === "camera" && !scanResult && (
          <div className="space-y-4">
            <div className="relative w-full aspect-square max-h-[420px] rounded-3xl overflow-hidden bg-black border-2 border-slate-800 shadow-2xl flex items-center justify-center">
              {/* Live Video Feed */}
              <video
                ref={videoRef}
                playsInline
                muted
                className="w-full h-full object-cover object-center"
              />

              {/* Animated Target Viewfinder Overlays */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-8">
                <div className="relative w-56 sm:w-64 h-56 sm:h-64 border-2 border-emerald-400/60 rounded-3xl overflow-hidden shadow-[0_0_40px_rgba(0,229,153,0.25)]">
                  {/* Four Corner Accents */}
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-[#00E599] rounded-tl-xl" />
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-[#00E599] rounded-tr-xl" />
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-[#00E599] rounded-bl-xl" />
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-[#00E599] rounded-br-xl" />

                  {/* Pulsing Scan Laser Line */}
                  <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#00E599] to-transparent shadow-[0_0_15px_#00E599] animate-[bounce_2.5s_infinite]" />
                </div>
              </div>

              {/* Status Pill on top of video */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-mono font-bold text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>CAMERA LIVE // SCANNING</span>
                </span>

                {/* Flip Camera */}
                <button
                  type="button"
                  onClick={() => setFacingMode((prev) => (prev === "environment" ? "user" : "environment"))}
                  className="p-2 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md border border-white/20 pointer-events-auto cursor-pointer transition-colors shadow-lg"
                  title="Switch Front/Back Camera"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Fallback if camera permission denied or unavailable */}
              {hasCameraSupport === false && (
                <div className="absolute inset-0 bg-slate-950 p-6 flex flex-col items-center justify-center text-center gap-3">
                  <Camera className="w-10 h-10 text-slate-600" />
                  <div className="space-y-1 max-w-xs">
                    <h4 className="font-bold text-sm text-white">Camera Access Required</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Allow camera permission in browser settings, or switch to Manual ID entry below.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMode("manual")}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow-md"
                  >
                    Switch to Manual ID Entry
                  </button>
                </div>
              )}
            </div>

            <p className="text-center text-xs text-slate-400 font-medium">
              Point camera at visitor&apos;s digital phone QR pass or printed conference badge.
            </p>
          </div>
        )}

        {/* ── 5. MANUAL ID / BARCODE GUN ENTRY MODE ─────────────────── */}
        {mode === "manual" && !scanResult && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-4">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 tracking-wider block">
                BARCODE GUN / MANUAL LOOKUP
              </span>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Enter Registration or Pass ID
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Type the ID printed on the badge (e.g. <span className="font-mono text-emerald-400">HHE27-236435</span> or <span className="font-mono text-emerald-400">GALA-2027-817220</span>) or scan with a USB/Bluetooth barcode gun.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                processCheckin(manualIdInput);
              }}
              className="space-y-3"
            >
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={manualIdInput}
                  onChange={(e) => setManualIdInput(e.target.value)}
                  placeholder="Paste URL, scan QR barcode, or type Pass ID..."
                  autoFocus
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono text-sm uppercase tracking-wider"
                />
              </div>

              <button
                type="submit"
                disabled={!manualIdInput.trim() || isProcessingScan}
                className="w-full py-3 rounded-2xl bg-[#218A59] hover:bg-[#1b734a] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40 shadow-lg shadow-emerald-500/20"
              >
                {isProcessingScan ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying in Registry...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify &amp; Admit Pass</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* ── 6. DIRECTORY & SEARCH MODE ────────────────────────────── */}
        {mode === "list" && !scanResult && (
          <div className="space-y-3.5">
            {/* Filter & Search Bar */}
            <div className="space-y-2.5">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search attendee by name, company, email or pass ID..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
                {(["all", "checkedin", "pending"] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer capitalize ${
                      activeFilter === filter
                        ? "bg-[#218A59] text-white"
                        : "bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800"
                    }`}
                  >
                    {filter === "all" ? "All Delegates" : filter === "checkedin" ? "Admitted" : "Pending Arrival"}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="space-y-2">
              {registrations.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-1">
                  <p className="text-xs font-semibold text-slate-300">No attendees match your query</p>
                  <p className="text-[11px] text-slate-500">Try searching with a different name or pass ID.</p>
                </div>
              ) : (
                registrations.map((reg) => (
                  <div
                    key={reg.id}
                    className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white truncate">{reg.name}</span>
                        {reg.checkedIn ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                            ADMITTED
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-800 text-slate-400 shrink-0">
                            PENDING
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 truncate">
                        {reg.organization || "Independent"} · {reg.passType || "Trade Visitor"}
                      </p>
                      <span className="text-[10px] font-mono text-emerald-400/80 block">
                        {reg.id}
                      </span>
                    </div>

                    <div className="shrink-0">
                      {reg.checkedIn ? (
                        <button
                          type="button"
                          onClick={() => handleUndoCheckin(reg.id)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Undo
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => processCheckin(reg.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-[#218A59] hover:bg-[#1b734a] text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Admit</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ── 7. RECENT ADMISSIONS LOG STRIP ─────────────────────────── */}
        {recentCheckins.length > 0 && (
          <div className="pt-2 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                Recent Admissions at this Summit
              </span>
              <span className="text-[10px] font-mono text-emerald-400">
                {recentCheckins.length} recent
              </span>
            </div>

            <div className="space-y-1.5">
              {recentCheckins.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="font-semibold text-white truncate">{item.name}</span>
                    <span className="text-slate-500 font-mono text-[10px] truncate">
                      ({item.organization || item.passType})
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">
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

      {/* ── FOOTER: SUBDOMAIN & NETWORK NOTICE ─────────────────────── */}
      <footer className="py-4 px-4 border-t border-slate-800/80 text-center text-[11px] text-slate-400 space-y-1">
        <p>
          Staff Check-In Subdomain:{" "}
          <span className="font-mono text-emerald-400 font-semibold">
            staff.greenenergyexpo.org.np
          </span>{" "}
          (or direct route <span className="font-mono text-slate-300">/staff</span>)
        </p>
        <p className="text-[10px] text-slate-400">
          Himalayan Green Energy Expo 2027 · Real-time Entry Gate Verification
        </p>
      </footer>
    </div>
  );
}
