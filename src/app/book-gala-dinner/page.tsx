"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Users,
  Wine,
  Building2,
  CreditCard,
  Plus,
  Minus,
  Loader2,
  AlertCircle,
  ArrowRight,
  ChevronRight,
  HelpCircle,
  FileText,
  BadgeCheck,
} from "lucide-react";

function BookGalaDinnerForm() {
  const searchParams = useSearchParams();
  const initialTier = searchParams.get("tier") === "international" ? "international" : "national";
  const [passTier, setPassTier] = useState<"national" | "international">(initialTier);
  const [quantity, setQuantity] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<"khalti" | "bank">("khalti");

  useEffect(() => {
    const tier = searchParams.get("tier");
    if (tier === "international" || tier === "national") {
      setPassTier(tier);
    }
  }, [searchParams]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    organization: "",
    jobTitle: "",
    dietary: "Standard Gourmet (Chef’s Selection)",
    specialRequests: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Official Pricing:
  // National: NPR 6,000 / person
  // International: USD 50 / person (NPR 6,750 for Khalti conversion @ 135)
  const unitPriceNPR = passTier === "international" ? 6750 : 6000;
  const unitPriceUSD = passTier === "international" ? 50 : 45;
  const totalPriceNPR = unitPriceNPR * quantity;
  const totalPriceUSD = unitPriceUSD * quantity;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errorMessage) setErrorMessage("");
  };

  const handleQuantity = (delta: number) => {
    setQuantity((prev) => Math.max(1, Math.min(25, prev + delta)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.name.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (!formData.phone.trim() || formData.phone.length < 7) {
      setErrorMessage("Please enter a valid contact phone or WhatsApp number.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/gala-dinner/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          organization: formData.organization.trim(),
          jobTitle: formData.jobTitle.trim(),
          passType: passTier,
          quantity,
          dietary: formData.dietary,
          specialRequests: formData.specialRequests.trim(),
          paymentMethod,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Unable to process reservation. Please try again.");
      }

      // If Khalti payment method
      if (paymentMethod === "khalti" && data.paymentUrl) {
        window.location.href = data.paymentUrl;
        return;
      }

      // If Bank Wire / Invoice
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
        return;
      }

      // Fallback
      window.location.href = `/payment/success?id=${encodeURIComponent(
        data.orderId || "GALA"
      )}&gateway=bank&type=gala&amount=${totalPriceNPR}&qty=${quantity}`;
    } catch (err: any) {
      console.error("Gala booking submission failed:", err);
      setErrorMessage(err.message || "An error occurred during booking. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030B08] text-white font-sans selection:bg-[#218A59]/30">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none select-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-[#218A59]/20 via-[#0B2E1E]/10 to-transparent blur-3xl opacity-60 rounded-full" />
        <div className="absolute top-1/3 -right-40 w-[600px] h-[400px] bg-[#007A5E]/10 blur-3xl rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 sm:pt-36 sm:pb-28">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-emerald-400/80 font-mono mb-6">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/gala-dinner" className="hover:text-white transition-colors">
            Gala Dinner
          </Link>
          <span>/</span>
          <span className="text-emerald-300">Book Passes</span>
        </div>

        {/* Header Section */}
        <div className="mb-10 sm:mb-14 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-semibold tracking-wider uppercase shadow-xs">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>Royal Tulip Luxury Hotel, Kathmandu</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white font-display">
            Gala Dinner Pass Booking
          </h1>

          <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm text-slate-300 font-medium pt-1">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Saturday, 17 January 2027</span>
            </div>
            <span className="hidden sm:inline text-white/20">·</span>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>6:00 PM onwards</span>
            </div>
            <span className="hidden sm:inline text-white/20">·</span>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Executive Banquet &amp; VIP Networking</span>
            </div>
          </div>
        </div>

        {/* Main Grid: Form (Left) & Order Summary (Right) */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* LEFT COLUMN: Steps 1, 2, 3 */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-8">
              {/* Error Message Alert */}
              {errorMessage && (
                <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-3 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-rose-300">Registration Error</div>
                    <div className="mt-0.5">{errorMessage}</div>
                  </div>
                </div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  STEP 1: SELECT PASS TIER
              ───────────────────────────────────────────────────────────── */}
              <div className="rounded-3xl bg-[#091510]/80 border border-emerald-500/20 p-6 sm:p-8 backdrop-blur-md shadow-xl space-y-6">
                <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                  <div className="w-7 h-7 rounded-full bg-[#218A59] text-white text-xs font-bold font-mono flex items-center justify-center">
                    1
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white tracking-tight">
                      Select Pass Tier
                    </h2>
                    <p className="text-xs text-slate-400">
                      Choose between National or International VIP reservation
                    </p>
                  </div>
                </div>

                {/* Tier Selection Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* National Pass Option */}
                  <div
                    onClick={() => setPassTier("national")}
                    className={`relative p-5 rounded-2xl border cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                      passTier === "national"
                        ? "bg-gradient-to-b from-[#218A59]/20 to-[#0A2016]/90 border-emerald-400 ring-2 ring-emerald-500/20 shadow-lg shadow-emerald-950/40"
                        : "bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.05]"
                    }`}
                  >
                    {passTier === "national" && (
                      <div className="absolute top-3.5 right-3.5">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-950" />
                      </div>
                    )}

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">🇳🇵</span>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                          National
                        </span>
                      </div>

                      <div>
                        <h3 className="font-bold text-sm text-white">
                          National Delegate Pass
                        </h3>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                          For Nepali clean energy professionals, engineers &amp; delegates.
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 mt-3 border-t border-white/10 flex items-baseline gap-1">
                      <span className="text-2xl font-bold font-mono text-white">
                        NPR 6,000
                      </span>
                      <span className="text-xs text-slate-400 font-mono">/ person</span>
                    </div>
                  </div>

                  {/* International Pass Option */}
                  <div
                    onClick={() => setPassTier("international")}
                    className={`relative p-5 rounded-2xl border cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                      passTier === "international"
                        ? "bg-gradient-to-b from-[#218A59]/20 to-[#0A2016]/90 border-emerald-400 ring-2 ring-emerald-500/20 shadow-lg shadow-emerald-950/40"
                        : "bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.05]"
                    }`}
                  >
                    {passTier === "international" && (
                      <div className="absolute top-3.5 right-3.5">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-950" />
                      </div>
                    )}

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">🌐</span>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-300 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800">
                          International
                        </span>
                      </div>

                      <div>
                        <h3 className="font-bold text-sm text-white">
                          International VIP Pass
                        </h3>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                          For foreign delegates, cross-border OEMs &amp; multilateral partners.
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 mt-3 border-t border-white/10 flex items-baseline gap-1.5">
                      <span className="text-2xl font-bold font-mono text-white">
                        USD 50
                      </span>
                      <span className="text-[11px] text-emerald-400 font-mono">
                        ≈ NPR 6,750
                      </span>
                    </div>
                  </div>
                </div>

                {/* Number of Delegates Counter */}
                <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-white tracking-wide">
                      Number of Delegates / Seats
                    </label>
                    <span className="text-[11px] text-slate-400">
                      Max 25 per single reservation
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleQuantity(-1)}
                      disabled={quantity <= 1}
                      className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center text-white transition-colors cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    <div className="w-16 h-10 rounded-xl bg-black/40 border border-white/20 flex items-center justify-center font-mono font-bold text-lg text-white">
                      {quantity}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleQuantity(1)}
                      disabled={quantity >= 25}
                      className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center text-white transition-colors cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* ─────────────────────────────────────────────────────────────
                  STEP 2: DELEGATE DETAILS
              ───────────────────────────────────────────────────────────── */}
              <div className="rounded-3xl bg-[#091510]/80 border border-emerald-500/20 p-6 sm:p-8 backdrop-blur-md shadow-xl space-y-6">
                <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                  <div className="w-7 h-7 rounded-full bg-[#218A59] text-white text-xs font-bold font-mono flex items-center justify-center">
                    2
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white tracking-tight">
                      Delegate Details
                    </h2>
                    <p className="text-xs text-slate-400">
                      Primary contact information for booking confirmation &amp; name badges
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Ramesh K. Adhikari"
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                    />
                  </div>

                  {/* Email & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="delegate@company.com"
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                        Mobile / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+977 98XXXXXXXX"
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Organization & Designation */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                        Organization / Company
                      </label>
                      <input
                        type="text"
                        name="organization"
                        value={formData.organization}
                        onChange={handleChange}
                        placeholder="e.g. Sanima Hydro / ABB"
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                        Job Designation
                      </label>
                      <input
                        type="text"
                        name="jobTitle"
                        value={formData.jobTitle}
                        onChange={handleChange}
                        placeholder="e.g. Managing Director / Chief Engineer"
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Dietary Preference */}
                  <div>
                    <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Dietary Preference
                    </label>
                    <select
                      name="dietary"
                      value={formData.dietary}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-[#081711] border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all cursor-pointer"
                    >
                      <option value="Standard Gourmet (Chef’s Selection)">
                        Standard Gourmet (Chef’s Selection)
                      </option>
                      <option value="Vegetarian Deluxe">Vegetarian Deluxe</option>
                      <option value="Jain / Vegan Pure">Jain / Vegan Pure</option>
                      <option value="Halal Gourmet">Halal Gourmet</option>
                      <option value="Gluten-Free Gourmet">Gluten-Free Gourmet</option>
                    </select>
                  </div>

                  {/* Special Requests */}
                  <div>
                    <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Special Requests / Seating Notes (Optional)
                    </label>
                    <textarea
                      name="specialRequests"
                      rows={2}
                      value={formData.specialRequests}
                      onChange={handleChange}
                      placeholder="e.g. Seating alongside delegates from our delegation..."
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* ─────────────────────────────────────────────────────────────
                  STEP 3: PAYMENT METHOD
              ───────────────────────────────────────────────────────────── */}
              <div className="rounded-3xl bg-[#091510]/80 border border-emerald-500/20 p-6 sm:p-8 backdrop-blur-md shadow-xl space-y-6">
                <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                  <div className="w-7 h-7 rounded-full bg-[#218A59] text-white text-xs font-bold font-mono flex items-center justify-center">
                    3
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white tracking-tight">
                      Payment Method
                    </h2>
                    <p className="text-xs text-slate-400">
                      Select your preferred settlement option
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Khalti ePayment */}
                  <div
                    onClick={() => setPaymentMethod("khalti")}
                    className={`relative p-5 rounded-2xl border cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                      paymentMethod === "khalti"
                        ? "bg-gradient-to-b from-[#5c2d91]/20 to-[#0A1612]/90 border-purple-400 ring-2 ring-purple-500/20 shadow-lg"
                        : "bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.05]"
                    }`}
                  >
                    {paymentMethod === "khalti" && (
                      <div className="absolute top-3.5 right-3.5">
                        <CheckCircle2 className="w-5 h-5 text-purple-400 fill-purple-950" />
                      </div>
                    )}

                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-[#5c2d91] text-white font-bold font-mono text-sm flex items-center justify-center shadow-xs">
                          K
                        </div>
                        <span className="font-bold text-sm text-white">
                          Khalti ePayment
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Instant checkout via Khalti Wallet, eBanking, Mobile Banking &amp; SCT Cards.
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/10 text-[10px] font-mono text-purple-300">
                      ⚡ Instant electronic confirmation
                    </div>
                  </div>

                  {/* Bank Wire / Invoice */}
                  <div
                    onClick={() => setPaymentMethod("bank")}
                    className={`relative p-5 rounded-2xl border cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                      paymentMethod === "bank"
                        ? "bg-gradient-to-b from-[#218A59]/20 to-[#0A1612]/90 border-emerald-400 ring-2 ring-emerald-500/20 shadow-lg"
                        : "bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.05]"
                    }`}
                  >
                    {paymentMethod === "bank" && (
                      <div className="absolute top-3.5 right-3.5">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-950" />
                      </div>
                    )}

                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center shadow-xs">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-sm text-white">
                          Bank Wire / Invoice
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Receive official pro-forma invoice for corporate payment via SWIFT / RTGS.
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/10 text-[10px] font-mono text-emerald-300">
                      📄 Official tax invoice provided
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Sticky Order Summary & Checkout Card */}
            <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-28 space-y-6">
              <div className="rounded-3xl bg-gradient-to-b from-[#0F261E] via-[#091813] to-[#040E0A] border border-emerald-500/30 p-6 sm:p-7 shadow-2xl relative overflow-hidden">
                {/* Decorative glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-2xl pointer-events-none rounded-full" />

                <div className="space-y-5">
                  <div className="pb-4 border-b border-white/10">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 block mb-1">
                      Reservation Summary
                    </span>
                    <h3 className="text-lg font-bold text-white font-display">
                      Gala Banquet &amp; VIP Pass
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Royal Tulip Luxury Hotel, Kathmandu
                    </p>
                  </div>

                  {/* Summary Breakdown */}
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Pass Tier:</span>
                      <span className="font-semibold text-white">
                        {passTier === "national"
                          ? "🇳🇵 National Delegate"
                          : "🌐 International VIP"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-300">
                      <span>Unit Price:</span>
                      <span className="font-mono font-medium text-white">
                        {passTier === "national"
                          ? "NPR 6,000"
                          : `USD 50 (≈ NPR 6,750)`}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-300">
                      <span>Seats Reserved:</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {quantity} {quantity === 1 ? "Delegate" : "Delegates"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-300">
                      <span>Payment Method:</span>
                      <span className="font-medium text-white">
                        {paymentMethod === "khalti" ? "Khalti ePayment" : "Bank Wire / Invoice"}
                      </span>
                    </div>
                  </div>

                  {/* Total Box */}
                  <div className="p-4 rounded-2xl bg-black/40 border border-emerald-500/30 space-y-1">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                        Total Amount
                      </span>
                      <div className="text-right">
                        <div className="text-2xl font-bold font-mono text-emerald-400">
                          NPR {totalPriceNPR.toLocaleString()}
                        </div>
                        {passTier === "international" && (
                          <div className="text-[11px] font-mono text-slate-400">
                            ≈ USD {totalPriceUSD}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Included Perks */}
                  <div className="space-y-2 pt-2 border-t border-white/10 text-[11px] text-slate-300">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>5-Star Multi-Course Banquet &amp; Beverage Pairings</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Networking with Energy Minister, IPPAN Board &amp; Diplomats</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Complimentary 3-Day Summit &amp; Expo Access</span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#218A59] to-[#007A5E] hover:from-[#1b734a] hover:to-[#005e47] active:scale-[0.99] text-white font-bold text-sm tracking-wide shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Processing Reservation...</span>
                      </>
                    ) : paymentMethod === "khalti" ? (
                      <>
                        <span>Pay NPR {totalPriceNPR.toLocaleString()} via Khalti</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        <span>Confirm &amp; Generate Invoice</span>
                        <FileText className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {/* Security Guarantee Note */}
                  <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-mono text-center">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>256-Bit SSL Encrypted · Official IPPAN HIGEX 2027</span>
                  </div>
                </div>
              </div>

              {/* Need assistance card */}
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 text-xs space-y-2">
                <div className="font-semibold text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-emerald-400" />
                  <span>Need VIP Assistance or Corporate Booking?</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  For bulk corporate delegations (&gt;25 seats), embassy protocols, or customized table reservations:
                </p>
                <div className="pt-1 text-[11px] font-mono text-emerald-400 space-y-1">
                  <div>Hotline: +977 1 4419924 / 9851020000</div>
                  <div>Email: gala@himalayanenergyexpo.com</div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function BookGalaDinnerPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#030B08] text-white flex items-center justify-center p-8">
          <div className="flex items-center gap-3 text-emerald-400 font-mono text-sm">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading Gala Dinner Booking...</span>
          </div>
        </div>
      }
    >
      <BookGalaDinnerForm />
    </Suspense>
  );
}
