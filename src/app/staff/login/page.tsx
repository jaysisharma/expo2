"use client";

import React, { useState, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  KeyRound,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  Loader2,
  QrCode,
  MapPin,
  CheckCircle2,
} from "lucide-react";

function StaffLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/staff";

  const [loginMode, setLoginMode] = useState<"passcode" | "credentials">("passcode");
  const [passcode, setPasscode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gate, setGate] = useState("Main Entrance (Hall A)");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const payload: any = { gate };
      if (loginMode === "passcode") {
        payload.passcode = passcode.trim();
      } else {
        payload.email = email.trim();
        payload.password = password;
      }

      const res = await fetch("/api/staff/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        router.push(from);
      } else {
        setError(data.message || "Authentication failed. Check your passcode or credentials.");
      }
    } catch {
      setError("Network error while connecting to staff auth server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#071322] text-white flex flex-col justify-center items-center px-4 py-8 font-sans selection:bg-[#00E599]/30">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-emerald-950/40 via-transparent to-transparent pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Branding & Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
            <QrCode className="w-3.5 h-3.5 text-[#00E599]" />
            <span>STAFF GATE CONTROL // SUBDOMAIN</span>
          </div>

          <div className="flex items-center justify-center gap-2.5 pt-1">
            <div className="relative w-9 h-9 shrink-0">
              <Image
                src="/images/logo.webp"
                alt="HIGEX Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              HIGEX Staff Check-In
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            Official Visitor &amp; Delegate QR Pass Verification Portal
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl backdrop-blur-xl space-y-5">
          {/* Mode Switcher */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setLoginMode("passcode");
                setError(null);
              }}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                loginMode === "passcode"
                  ? "bg-[#218A59] text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Gate Passcode</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMode("credentials");
                setError(null);
              }}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                loginMode === "credentials"
                  ? "bg-[#218A59] text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Staff Login</span>
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <p className="leading-snug">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            {/* Gate Location Selector */}
            <div>
              <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                Current Station / Gate
              </label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={gate}
                  onChange={(e) => setGate(e.target.value)}
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="Main Entrance (Hall A)">Main Entrance (Hall A)</option>
                  <option value="Hall B Gate">Hall B Gate</option>
                  <option value="VIP & Plenary Desk">VIP &amp; Plenary Desk</option>
                  <option value="Gala Dinner Royal Tulip">Gala Dinner (Royal Tulip)</option>
                  <option value="Exhibitor Loading Gate">Exhibitor Loading Gate</option>
                </select>
              </div>
            </div>

            {loginMode === "passcode" ? (
              <div className="space-y-2">
                <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  Gate Security Passcode
                </label>
                <div className="relative">
                  <KeyRound className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="Enter Gate Passcode (e.g. STAFF2027)"
                    autoFocus
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono tracking-widest text-sm uppercase"
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>Default Passcode:</span>
                  <button
                    type="button"
                    onClick={() => setPasscode("STAFF2027")}
                    className="text-emerald-400 font-mono font-bold hover:underline cursor-pointer"
                  >
                    Auto-fill: STAFF2027
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                    Staff Email / Username
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="staff@hydroexpo.org.np or admin"
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00A37A] to-[#00E599] hover:from-[#008f6b] hover:to-[#00cc88] text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Access Scanner Portal</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </form>

          {/* Quick Notice */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="w-3 h-3" />
              <span>Offline Safe &amp; Sync Ready</span>
            </span>
            <span className="font-mono text-slate-500">v5.0-GATE</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StaffLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#071322] flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
        </div>
      }
    >
      <StaffLoginForm />
    </Suspense>
  );
}
