"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Sun,
  Moon,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useAdminAuth } from "@/components/admin/AdminAuthContext";
import { useTheme } from "@/components/ThemeProvider";

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
    <div className="bg-white dark:bg-[#0D1525] border border-stone-200 dark:border-white/10 rounded-2xl p-7 shadow-lg shadow-black/5 dark:shadow-black/40">
      {/* Logo & Heading */}
      <div className="flex flex-col items-center text-center mb-6">
        <Image
          src="/images/logo.png"
          alt="Expo Logo"
          width={38}
          height={38}
          className="object-contain mb-3"
          priority
        />
        <h1 className="text-lg font-bold font-display text-gray-900 dark:text-white">
          Create Organizer Account
        </h1>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div
          role="alert"
          className="mb-4 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2"
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600 dark:text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Register Form */}
      <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
        <div>
          <label
            htmlFor="name-input"
            className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Full Name
          </label>
          <input
            id="name-input"
            type="text"
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Ram Bahadur Thapa"
            className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-white/[0.04] border border-stone-300 dark:border-white/10 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#218A59] dark:focus:border-[#25C176] focus:ring-1 focus:ring-[#218A59] transition-colors"
          />
        </div>

        <div>
          <label
            htmlFor="reg-email-input"
            className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Email Address
          </label>
          <input
            id="reg-email-input"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="officer@ippan.org.np"
            className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-white/[0.04] border border-stone-300 dark:border-white/10 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#218A59] dark:focus:border-[#25C176] focus:ring-1 focus:ring-[#218A59] transition-colors"
          />
        </div>

        <div>
          <label
            htmlFor="org-input"
            className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Organization
          </label>
          <input
            id="org-input"
            type="text"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            placeholder="e.g. IPPAN / Event Solution"
            className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-white/[0.04] border border-stone-300 dark:border-white/10 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#218A59] dark:focus:border-[#25C176] focus:ring-1 focus:ring-[#218A59] transition-colors"
          />
        </div>

        <div>
          <label
            htmlFor="reg-password-input"
            className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Password (min. 6 characters)
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
              className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-stone-50 dark:bg-white/[0.04] border border-stone-300 dark:border-white/10 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#218A59] dark:focus:border-[#25C176] focus:ring-1 focus:ring-[#218A59] transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 absolute right-1 top-1/2 -translate-y-1/2 cursor-pointer"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label
            htmlFor="confirm-password-input"
            className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Confirm Password
          </label>
          <input
            id="confirm-password-input"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-white/[0.04] border border-stone-300 dark:border-white/10 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#218A59] dark:focus:border-[#25C176] focus:ring-1 focus:ring-[#218A59] transition-colors"
          />
        </div>

        {/* High-contrast solid button visible in light and dark mode */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-2 h-11 rounded-xl bg-[#218A59] hover:bg-[#1B7249] dark:bg-[#25C176] dark:hover:bg-[#1FA866] text-white dark:text-[#0A0F1A] font-bold text-xs tracking-wider uppercase transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 shadow-md shadow-[#218A59]/30 active:scale-[0.99]"
        >
          {isSubmitting ? (
            <div className="w-4 h-4 rounded-full border-2 border-white/60 border-t-white animate-spin" />
          ) : (
            <span>Register Account</span>
          )}
        </button>
      </form>

      {/* Link back to Sign In */}
      <div className="mt-5 pt-4 border-t border-stone-200 dark:border-white/10 text-center text-xs text-gray-500 dark:text-gray-400">
        Already have an account?{" "}
        <Link
          href="/admin/login"
          className="font-semibold text-[#218A59] dark:text-[#25C176] hover:underline"
        >
          Sign in here
        </Link>
      </div>
    </div>
  );
}

export default function AdminRegisterPage() {
  const { theme, toggle } = useTheme();

  return (
    <div className="min-h-screen w-full bg-[#F9FBFA] dark:bg-[#070D16] text-[var(--c-text-primary)] flex flex-col justify-between font-sans transition-colors duration-300 relative overflow-hidden">
      {/* Background Soft Ambient Light */}
      <div
        aria-hidden="true"
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[650px] h-[350px] bg-gradient-to-b from-[#218A59]/10 via-[#234679]/6 to-transparent blur-3xl pointer-events-none rounded-full"
      />

      {/* Top Bar */}
      <header className="relative z-10 w-full max-w-5xl mx-auto px-6 pt-7 pb-2 flex items-center justify-between">
        <Link
          href="/admin/login"
          className="group inline-flex items-center gap-2 text-xs font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-1" />
          <span>Back to Sign In</span>
        </Link>

        <button
          onClick={toggle}
          type="button"
          aria-label="Toggle theme"
          className="p-2 rounded-xl border border-stone-200 dark:border-white/10 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-all cursor-pointer"
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-[#234679]" />
          )}
        </button>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 w-full max-w-sm mx-auto px-5 py-6 my-auto">
        <Suspense
          fallback={
            <div className="bg-white dark:bg-[#0D1525] border border-stone-200 dark:border-white/10 rounded-2xl p-7 flex items-center justify-center min-h-[300px]">
              <div className="w-6 h-6 rounded-full border-2 border-[#218A59] border-t-transparent animate-spin" />
            </div>
          }
        >
          <AdminRegisterForm />
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-5xl mx-auto px-6 py-5 text-center text-[11px] text-gray-400 dark:text-gray-500 font-body">
        <p>© 2027 Himalayan Green Energy Expo</p>
      </footer>
    </div>
  );
}
