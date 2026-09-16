"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  AlertCircle,
  User,
  Mail,
  Building,
  Lock,
  UserPlus,
} from "lucide-react";
import { useAdminAuth } from "@/components/admin/AdminAuthContext";

function AdminRegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { isAuthenticated, isLoading, register } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/admin/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await register(name, email, password, organization);
      if (result.success) {
        window.location.href = "/admin/dashboard";
      } else {
        setErrorMsg(result.message || "Registration failed. Please try again.");
      }
    } catch {
      setErrorMsg("Unable to connect to registration server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-7 shadow-xl shadow-slate-900/5">
      {/* Logo & Heading */}
      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-[#218A59]/10 border border-[#218A59]/20 flex items-center justify-center mb-3">
          <UserPlus className="w-7 h-7 text-[#218A59]" />
        </div>
        <h1 className="text-xl font-extrabold font-display text-slate-900 tracking-tight">
          Create Organizer Account
        </h1>
        <p className="text-xs text-slate-500 font-body mt-1">
          Secretariat Access & Management Console
        </p>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div
          role="alert"
          className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 font-medium"
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Register Form */}
      <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
        <div>
          <label
            htmlFor="name-input"
            className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
          >
            Full Name *
          </label>
          <div className="relative">
            <input
              id="name-input"
              type="text"
              required
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ram Bahadur Thapa"
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50/80 border border-slate-300 text-slate-900 text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#218A59] focus:ring-2 focus:ring-[#218A59]/20 transition-all shadow-xs"
            />
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div>
          <label
            htmlFor="reg-email-input"
            className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
          >
            Official Email Address *
          </label>
          <div className="relative">
            <input
              id="reg-email-input"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="officer@ippan.org.np"
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50/80 border border-slate-300 text-slate-900 text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#218A59] focus:ring-2 focus:ring-[#218A59]/20 transition-all shadow-xs"
            />
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div>
          <label
            htmlFor="org-input"
            className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
          >
            Organization / Department
          </label>
          <div className="relative">
            <input
              id="org-input"
              type="text"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder="e.g. IPPAN / Event Solution / Secretariat"
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50/80 border border-slate-300 text-slate-900 text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#218A59] focus:ring-2 focus:ring-[#218A59]/20 transition-all shadow-xs"
            />
            <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div>
          <label
            htmlFor="reg-password-input"
            className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
          >
            Password (min. 6 characters) *
          </label>
          <div className="relative">
            <input
              id="reg-password-input"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50/80 border border-slate-300 text-slate-900 text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#218A59] focus:ring-2 focus:ring-[#218A59]/20 transition-all shadow-xs"
            />
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="p-2 text-slate-400 hover:text-slate-700 absolute right-1.5 top-1/2 -translate-y-1/2 cursor-pointer transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label
            htmlFor="confirm-password-input"
            className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
          >
            Confirm Password *
          </label>
          <div className="relative">
            <input
              id="confirm-password-input"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50/80 border border-slate-300 text-slate-900 text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#218A59] focus:ring-2 focus:ring-[#218A59]/20 transition-all shadow-xs"
            />
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* High-contrast solid button visible in light mode */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-2 h-11 rounded-xl bg-gradient-to-r from-[#5B9F35] to-[#218A59] hover:brightness-105 text-white font-bold text-xs tracking-wider uppercase transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 shadow-md shadow-[#218A59]/30 active:scale-[0.99]"
        >
          {isSubmitting ? (
            <div className="w-4 h-4 rounded-full border-2 border-white/60 border-t-white animate-spin" />
          ) : (
            <span>Register Organizer Account</span>
          )}
        </button>
      </form>

      {/* Link back to Sign In */}
      <div className="mt-5 pt-4 border-t border-slate-100 text-center text-xs text-slate-600">
        Already have an account?{" "}
        <Link
          href="/admin/login"
          className="font-bold text-[#218A59] hover:text-[#1B7249] hover:underline"
        >
          Sign in here
        </Link>
      </div>
    </div>
  );
}

export default function AdminRegisterPage() {
  return (
    <div className="min-h-screen w-full bg-[#F4F7F5] text-slate-900 flex flex-col justify-between font-sans transition-colors duration-300 relative overflow-hidden">
      {/* Background Soft Ambient Light */}
      <div
        aria-hidden="true"
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[650px] h-[350px] bg-gradient-to-b from-[#218A59]/15 via-[#234679]/8 to-transparent blur-3xl pointer-events-none rounded-full"
      />

      {/* Top Bar */}
      <header className="relative z-10 w-full max-w-5xl mx-auto px-6 pt-7 pb-2 flex items-center justify-between">
        <Link
          href="/admin/login"
          className="group inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-slate-950 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-1" />
          <span>Back to Sign In</span>
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 w-full max-w-sm mx-auto px-5 py-6 my-auto">
        <Suspense
          fallback={
            <div className="bg-white border border-slate-200 rounded-2xl p-7 flex items-center justify-center min-h-[300px]">
              <div className="w-6 h-6 rounded-full border-2 border-[#218A59] border-t-transparent animate-spin" />
            </div>
          }
        >
          <AdminRegisterForm />
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-5xl mx-auto px-6 py-5 text-center text-xs text-slate-500 font-body">
        <p>© 2027 Himalayan Green Energy Expo · Secretariat Management System</p>
      </footer>
    </div>
  );
}
