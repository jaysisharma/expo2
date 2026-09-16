"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Sun,
  Moon,
  ShieldCheck,
} from "lucide-react";
import { useAdminAuth } from "@/components/admin/AdminAuthContext";
import { useTheme } from "@/components/ThemeProvider";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("admin@hydroexpo.org.np");
  const [password, setPassword] = useState("expo2027admin");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { isAuthenticated, isLoading, login, quickDemoLogin } = useAdminAuth();
  const { theme, toggle } = useTheme();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/admin/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const success = await login(email, password);
      if (success) {
        router.push("/admin/dashboard");
      } else {
        setErrorMsg("Invalid email or password. Please check your credentials.");
      }
    } catch (err) {
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950">
        <div className="w-6 h-6 rounded-full border-2 border-stone-300 dark:border-stone-700 border-t-stone-800 dark:border-t-stone-200 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col justify-between font-sans transition-colors duration-200">
      {/* Top minimal bar */}
      <header className="w-full max-w-5xl mx-auto px-6 pt-8 pb-4 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to public site</span>
        </Link>

        <button
          onClick={toggle}
          type="button"
          aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          className="p-2 rounded-lg border border-stone-200 dark:border-stone-800 text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-900 transition-colors cursor-pointer"
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </button>
      </header>

      {/* Main card */}
      <main className="w-full max-w-md mx-auto px-6 py-10 my-auto">
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-8 sm:p-10 shadow-xs">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 p-1.5 flex items-center justify-center shrink-0">
                <Image
                  src="/images/logo.png"
                  alt="Himalayan Green Energy Expo"
                  width={28}
                  height={28}
                  className="object-contain"
                  priority
                />
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  Secretariat Portal
                </p>
                <h1 className="text-base font-semibold text-stone-900 dark:text-stone-100 leading-tight">
                  Himalayan Green Energy Expo 2027
                </h1>
              </div>
            </div>

            <h2 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              Sign in to your account
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Enter your credentials to access the organizer dashboard.
            </p>
          </div>

          {/* Error notice */}
          {errorMsg && (
            <div
              role="alert"
              className="mb-6 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs"
            >
              {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email-input"
                className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1.5"
              >
                Email address
              </label>
              <input
                id="email-input"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3.5 py-2.5 rounded-lg bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 text-sm placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 focus:ring-1 focus:ring-stone-900 dark:focus:ring-stone-100 transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password-input"
                  className="block text-xs font-medium text-stone-700 dark:text-stone-300"
                >
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  id="password-input"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-lg bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 text-sm placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 focus:ring-1 focus:ring-stone-900 dark:focus:ring-stone-100 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 absolute right-1 top-1/2 -translate-y-1/2 transition-colors cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-2.5 px-4 rounded-lg bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-medium text-xs tracking-wide transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200 dark:border-stone-800" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white dark:bg-stone-900 px-2 text-stone-400 text-[11px]">
                Demo access
              </span>
            </div>
          </div>

          {/* 1-Click Quick Demo Sign In Button */}
          <button
            onClick={quickDemoLogin}
            type="button"
            className="w-full py-2.5 px-4 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 hover:bg-stone-100 dark:bg-stone-800/60 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 font-medium text-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Continue with demo credentials</span>
          </button>

          {/* Hint */}
          <div className="mt-6 pt-4 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between text-[11px] text-stone-400 dark:text-stone-500">
            <span>Demo: admin@hydroexpo.org.np</span>
            <span>Key: expo2027admin</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl mx-auto px-6 py-6 text-center text-xs text-stone-400 dark:text-stone-500">
        <p>© 2027 Himalayan Green Energy Expo · Organizers: IPPAN & Event Solution</p>
      </footer>
    </div>
  );
}

