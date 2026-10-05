"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Zap,
  Calendar,
  MapPin,
  CheckCircle2,
  Car,
  Bike,
  Truck,
  ShieldCheck,
  ArrowRight,
  Loader2,
  AlertCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import confetti from "canvas-confetti";

const VEHICLE_CATEGORIES = [
  { id: "4-Wheeler (Car/SUV)", label: "Electric Car / SUV", icon: Car, desc: "Private & commercial 4W electric passenger vehicles" },
  { id: "2-Wheeler (Scooter/Motorcycle)", label: "Electric Scooter / Bike", icon: Bike, desc: "High & city-speed 2-wheeler electric commuters" },
  { id: "Commercial / Microbus / Bus", label: "Commercial / Fleet / Van", icon: Truck, desc: "Electric microbuses, delivery vans & fleet vehicles" },
  { id: "Custom / Prototype / Concept", label: "Prototype / Student EV", icon: Zap, desc: "Engineering colleges & innovation startup builds" },
];

export default function EVRallyPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    organization: "",
    vehicleType: "4-Wheeler (Car/SUV)",
    vehicleMakeModel: "",
    registrationNumber: "",
    batteryCapacity: "",
    numberOfOccupants: "1",
    driverLicenseNumber: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    specialRequirements: "",
    agreeToTerms: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredId, setRegisteredId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.fullName || !formData.email || !formData.phone) {
      setErrorMsg("Please complete all required driver contact details.");
      return;
    }

    if (!formData.agreeToTerms) {
      setErrorMsg("Please accept the event safety and participation terms.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/ev-rally", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (json.success && json.rallyId) {
        setRegisteredId(json.rallyId);
        try {
          confetti({
            particleCount: 75,
            spread: 60,
            origin: { y: 0.6 },
            colors: ["#10B981", "#3B82F6", "#047857", "#34D399"],
          });
        } catch { }
      } else {
        setErrorMsg(json.message || "Failed to submit registration. Please try again.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 flex flex-col">
      {/* ── Top Hero Banner ── */}
      <section className="relative bg-[#04281E] text-white pt-28 pb-14 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-emerald-500/20">
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <Image
            src="/images/attractions/ev-rally.webp"
            alt="EV Rally Background"
            fill
            className="object-cover object-center mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#04281E] via-[#04281E]/80 to-[#04281E]" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center space-y-4">


          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            EV Rally
          </h1>



        </div>
      </section >

      {/* ── Main Form Area ── */}
      < div className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8 flex-grow flex items-start justify-center" >
        <div className="w-full max-w-3xl">
          {registeredId ? (
            /* ── Success Screen ── */
            <div className="bg-white rounded-3xl border border-emerald-200 shadow-xl p-8 sm:p-12 text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-mono font-bold tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 uppercase">
                  Registration Confirmed
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  You’re All Set for the EV Rally!
                </h2>
                <p className="text-sm text-slate-600 max-w-lg mx-auto">
                  Your entry docket has been registered under ID:{" "}
                  <strong className="text-slate-900 font-mono text-base">{registeredId}</strong>.
                  A confirmation has been sent to <strong>{formData.email}</strong>.
                </p>
              </div>

              {/* Summary Docket Box */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 text-left text-xs sm:text-sm space-y-2 max-w-md mx-auto">
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Driver Name</span>
                  <span className="font-semibold text-slate-800">{formData.fullName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Vehicle Category</span>
                  <span className="font-semibold text-slate-800">{formData.vehicleType}</span>
                </div>
                {formData.vehicleMakeModel && (
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Make & Model</span>
                    <span className="font-semibold text-slate-800">{formData.vehicleMakeModel}</span>
                  </div>
                )}
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Flag-Off Venue</span>
                  <span className="font-semibold text-slate-800">Bhrikutimandap, Kathmandu</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Assembly Time</span>
                  <span className="font-semibold text-emerald-700">7:30 AM · Friday, 9th Jan 2027</span>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setRegisteredId(null);
                    setFormData({
                      fullName: "",
                      email: "",
                      phone: "",
                      organization: "",
                      vehicleType: "4-Wheeler (Car/SUV)",
                      vehicleMakeModel: "",
                      registrationNumber: "",
                      batteryCapacity: "",
                      numberOfOccupants: "1",
                      driverLicenseNumber: "",
                      emergencyContactName: "",
                      emergencyContactPhone: "",
                      specialRequirements: "",
                      agreeToTerms: true,
                    });
                  }}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Register Another Vehicle
                </button>
                <Link
                  href="/"
                  className="px-6 py-2.5 rounded-xl bg-[#007A5E] hover:bg-[#006049] text-white font-bold text-xs shadow-md transition-all inline-flex items-center gap-2"
                >
                  <span>Return to Home</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            /* ── Registration Form ── */
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-lg p-6 sm:p-10 space-y-8"
            >
              {/* Form Intro */}
              <div className="border-b border-slate-100 pb-5">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Participant &amp; Vehicle Registration
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Participation is complimentary. Open to EV owners, commercial fleet operators, clubs, and academic prototypes.
                </p>
              </div>

              {errorMsg && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-3">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* 1. Vehicle Category Selection */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
                  1. Select Vehicle Category <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {VEHICLE_CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = formData.vehicleType === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, vehicleType: cat.id })}
                        className={`text-left p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${isSelected
                          ? "bg-emerald-50/70 border-emerald-600 ring-2 ring-emerald-500/20"
                          : "bg-slate-50/50 border-slate-200/80 hover:bg-white hover:border-slate-300"
                          }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${isSelected
                            ? "bg-[#007A5E] text-white"
                            : "bg-white border border-slate-200 text-slate-600"
                            }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs sm:text-sm font-bold text-slate-900">
                            {cat.label}
                          </div>
                          <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {cat.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Driver & Contact Information */}
              <div className="space-y-4 pt-2">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider font-mono border-b border-slate-100 pb-2">
                  2. Driver &amp; Contact Details
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Shrestha"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Mobile / WhatsApp <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +977 9851000000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. ramesh@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Organization / Club / Fleet (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. BYD Owners Club / NEA / Self"
                      value={formData.organization}
                      onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Vehicle Specifications */}
              <div className="space-y-4 pt-2">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider font-mono border-b border-slate-100 pb-2">
                  3. Vehicle Specifications
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Vehicle Make &amp; Model
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. BYD Atto 3 / Tata Nexon EV"
                      value={formData.vehicleMakeModel}
                      onChange={(e) => setFormData({ ...formData, vehicleMakeModel: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Plate / Registration No.
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. BA PRA 01-028 CHA 1234"
                      value={formData.registrationNumber}
                      onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Battery / Range (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 60.4 kWh / 420 km"
                      value={formData.batteryCapacity}
                      onChange={(e) => setFormData({ ...formData, batteryCapacity: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Terms and Consent */}
              <div className="pt-2 space-y-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.agreeToTerms}
                    onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                    className="mt-1 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                  <span className="text-xs text-slate-600 leading-relaxed">
                    I confirm that the registered electric vehicle is road-legal, insured, and operated by a licensed driver. I agree to adhere to event route marshals, traffic rules, and road safety regulations.
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 rounded-2xl bg-[#007A5E] hover:bg-[#006049] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting Registration...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-current text-emerald-300" />
                      <span>Register for EV Rally 2027</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div >
    </div >
  );
}
