"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import confetti from "canvas-confetti";
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Download,
  QrCode,
  User,
  Building,
  Sparkles,
  Eye,
} from "lucide-react";
import IDCardBadgePreview from "./IDCardBadgePreview";
import type { BadgeConfig } from "./AdminBadgeDesigner";

export default function DelegateRegistration() {
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role");
  const initialPass = searchParams.get("pass");

  const [step, setStep] = useState(1);
  const [registrationRole, setRegistrationRole] = useState<"visitor" | "exhibitor">(
    initialRole === "exhibitor" ? "exhibitor" : "visitor"
  );
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    organization: "",
    jobTitle: "",
    stallNumber: "STALL C-14",
    country: "Nepal",
    passType:
      initialRole === "exhibitor"
        ? "Exhibitor Pass (All Access)"
        : initialPass === "gala-dinner"
          ? "Gala Dinner Delegate"
          : "Trade Visitor (Free)",
    interests: ["Hydropower & Turbines", "Cross-Border Energy Trade"],
  });
  const [delegateId, setDelegateId] = useState<string>("");
  const [formError, setFormError] = useState<string>("");
  const [badgeTemplates, setBadgeTemplates] = useState<{
    visitor?: BadgeConfig;
    exhibitor?: BadgeConfig;
  }>({});

  // Fetch admin badge configurations on mount & listen to real-time updates
  useEffect(() => {
    // 1. Immediately read from localStorage
    try {
      const local = localStorage.getItem("hhe_badge_templates");
      if (local) {
        const parsed = JSON.parse(local);
        if (parsed && (parsed.visitor || parsed.exhibitor)) {
          setBadgeTemplates(parsed);
        }
      }
    } catch (e) { }

    // 2. Fetch latest from API
    async function fetchTemplates() {
      try {
        const res = await fetch(`/api/badge-template?t=${Date.now()}`, { cache: "no-store" });
        const json = await res.json();
        if (json.success && json.data) {
          setBadgeTemplates(json.data);
          try {
            localStorage.setItem("hhe_badge_templates", JSON.stringify(json.data));
          } catch (e) { }
        }
      } catch (err) {
        console.warn("Could not fetch custom badge template", err);
      }
    }
    fetchTemplates();

    // 3. Listen to live updates from Admin Designer
    const handleTemplatesUpdated = (e: any) => {
      if (e.detail) {
        setBadgeTemplates(e.detail);
      }
    };

    window.addEventListener("hhe_badge_templates_updated", handleTemplatesUpdated);
    return () => {
      window.removeEventListener("hhe_badge_templates_updated", handleTemplatesUpdated);
    };
  }, []);

  const availableInterests = [
    "Hydropower & Turbines",
    "Generators & Electro-Mechanical",
    "Transmission & 400kV Substations",
    "Tunneling & TBM Infrastructure",
    "Project Finance & Green Bonds",
    "Green Hydrogen & Storage",
    "SCADA & AI Dispatch",
    "Solar-Hydro Hybrids",
  ];

  const handleInterestToggle = (interest: string) => {
    setFormData((prev) => {
      const exists = prev.interests.includes(interest);
      return {
        ...prev,
        interests: exists
          ? prev.interests.filter((i) => i !== interest)
          : [...prev.interests, interest],
      };
    });
  };

  const handleNext = async () => {
    setFormError("");

    if (step === 1) {
      if (!formData.name.trim() || !formData.organization.trim()) {
        setFormError("Please enter your Full Name and Organization before proceeding.");
        return;
      }
      if (registrationRole === "exhibitor" && !formData.stallNumber.trim()) {
        setFormError("Please enter your Stall Number / Booth name.");
        return;
      }
    }

    if (step === 2) {
      const emailTrimmed = formData.email.trim();
      if (!emailTrimmed) {
        setFormError("Please enter your email address to receive your confirmation.");
        return;
      }
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(emailTrimmed)) {
        setFormError("Please enter a valid email address (e.g. name@company.com).");
        return;
      }
      const phoneDigits = formData.phone.replace(/\D/g, "");
      if (phoneDigits.length < 7) {
        setFormError("Please enter a valid phone or mobile number (at least 7 digits).");
        return;
      }
    }

    if (step === 3) {
      const prefix = registrationRole === "visitor" ? "HHE26" : "HHE26-EX";
      const generatedId = `${prefix}-${Math.floor(100000 + Math.random() * 900000)}`;
      setDelegateId(generatedId);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      // Sync registration to server so organizer dashboard and Firebase record it
      try {
        await fetch("/api/admin/data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "add_registration",
            payload: {
              id: generatedId,
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              organization: formData.organization,
              jobTitle: formData.jobTitle,
              stallNumber: registrationRole === "exhibitor" ? formData.stallNumber : "",
              country: formData.country,
              passType: registrationRole === "visitor" ? formData.passType : "Exhibitor Delegate",
              interests: formData.interests,
            },
          }),
        });
      } catch (err) {
        console.warn("Could not sync registration to server", err);
      }
    }
    setStep((prev) => Math.min(prev + 1, 4));
  };

  const handlePrev = () => {
    setFormError("");
    setStep((prev) => Math.max(prev - 1, 1));
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Main Registration Box */}
      <div className="w-full p-6 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-xl font-sans">
        {/* Step Indicator & Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3 text-xs font-semibold text-slate-500">
            <span className="text-hydro-primary font-bold">
              STEP 0{step} OF 04:{" "}
              {step === 1
                ? "BADGE CATEGORY & DETAILS"
                : step === 2
                  ? "ORGANIZATION & CONTACT"
                  : step === 3
                    ? "INTERESTS & SECTORS"
                    : "OFFICIAL DIGITAL ID BADGE"}
            </span>
            <span>{Math.round((step / 4) * 100)}% COMPLETED</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div
              style={{ width: `${(step / 4) * 100}%` }}
              className="h-full bg-[#087EA4] transition-all duration-300"
            />
          </div>
        </div>

        {/* STEP 1: Role & Personal Details */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h3 className="font-display font-bold text-2xl text-slate-900">
                Step 1: Choose Badge Category & Personal Info
              </h3>
              <p className="text-xs text-slate-600 font-normal mt-1">
                Select your badge type and enter your identity as it will appear on your official entry badge.
              </p>
            </div>

            {/* Badge Category Picker */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => {
                  setRegistrationRole("visitor");
                  setFormData({ ...formData, passType: "Trade Visitor (Free)" });
                }}
                className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${registrationRole === "visitor"
                  ? "bg-sky-50/80 border-sky-500 ring-2 ring-sky-500/20"
                  : "bg-slate-50/60 border-slate-200 hover:border-slate-300"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-sm text-slate-900 block">Trade Visitor / Delegate</span>
                    <span className="text-xs text-slate-500">Free admission for trade professionals & engineers</span>
                  </div>
                </div>
                {registrationRole === "visitor" && (
                  <CheckCircle2 className="w-5 h-5 text-sky-600 shrink-0" />
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setRegistrationRole("exhibitor");
                  setFormData({ ...formData, passType: "Exhibitor Pass (All Access)" });
                }}
                className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${registrationRole === "exhibitor"
                  ? "bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20"
                  : "bg-slate-50/60 border-slate-200 hover:border-slate-300"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-sm text-slate-900 block">Official Exhibitor</span>
                    <span className="text-xs text-slate-500">Booth representative pass with hall stall access</span>
                  </div>
                </div>
                {registrationRole === "exhibitor" && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                )}
              </button>
            </div>

            {/* Form Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  FULL NAME ON BADGE *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Er. Aarav Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-hydro-primary shadow-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ORGANIZATION / COMPANY *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sanima Hydro / NEA / Voith"
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  className="w-full p-3 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-hydro-primary shadow-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  DESIGNATION / TITLE
                </label>
                <input
                  type="text"
                  placeholder="e.g. Project Director / Hydro Engineer"
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                  className="w-full p-3 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-hydro-primary shadow-sm"
                />
              </div>

              {registrationRole === "exhibitor" ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    STALL NUMBER / BOOTH *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. STALL C-14 / MAIN PAVILION"
                    value={formData.stallNumber}
                    onChange={(e) => setFormData({ ...formData, stallNumber: e.target.value })}
                    className="w-full p-3 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-hydro-primary shadow-sm font-semibold"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    COUNTRY / CITY
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Nepal, Kathmandu"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full p-3 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-hydro-primary shadow-sm"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: Contact & Confirmation */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h3 className="font-display font-bold text-2xl text-slate-900">
                Step 2: Contact Credentials & Pass Verification
              </h3>
              <p className="text-xs text-slate-600 font-normal mt-1">
                Your digital pass and verification token will be delivered to this email and phone number.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  OFFICIAL EMAIL ADDRESS *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. engineer@sanima.com.np"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-3 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-hydro-primary shadow-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  MOBILE / WHATSAPP NUMBER *
                </label>
                <input
                  type="tel"
                  required
                  maxLength={15}
                  placeholder="e.g. +977 9851000000"
                  value={formData.phone}
                  onChange={(e) => {
                    // Allow only digits, +, space, or hyphen, capped strictly at 15 characters
                    const cleaned = e.target.value.replace(/[^0-9+ -]/g, "").slice(0, 15);
                    setFormData({ ...formData, phone: cleaned });
                  }}
                  className="w-full p-3 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-hydro-primary shadow-sm font-medium"
                />
              </div>
            </div>

            {/* Badge Preview Summary Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Configured Pass Type
                </span>
                <span className="font-bold text-sm text-slate-900">
                  {registrationRole === "visitor" ? "Trade Visitor / Delegate Pass" : "Exhibitor Staff Pass"}
                </span>
                <span className="text-xs text-slate-600 block mt-0.5">
                  {formData.name || "Attendee"} · {formData.organization || "Company"}
                </span>
              </div>
              <div className="text-right">
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
                  CONFIRMED FREE PASS
                </span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Industry Interests */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h3 className="font-display font-bold text-2xl text-slate-900">
                Step 3: Matchmaking & Sector Interests
              </h3>
              <p className="text-xs text-slate-600 font-normal mt-1">
                Select sectors you wish to explore for tailored matchmaking and B2B conference recommendations.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {availableInterests.map((interest) => {
                const selected = formData.interests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => handleInterestToggle(interest)}
                    className={`p-3.5 rounded-xl text-xs text-left border transition-all flex items-center justify-between ${selected
                      ? "bg-sky-50 border-sky-500 text-sky-950 font-bold"
                      : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 shadow-sm"
                      }`}
                  >
                    <span>{interest}</span>
                    {selected && <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4: Official Digital ID Card */}
        {step === 4 && (
          <div className="text-center py-4 space-y-6">
            <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div>
              <span className="text-xs text-emerald-700 tracking-widest uppercase font-bold">
                REGISTRATION CONFIRMED · OFFICIAL {registrationRole.toUpperCase()} BADGE
              </span>
              <h3 className="font-display font-black text-2xl sm:text-3xl text-slate-900 mt-1">
                Welcome to Himalayan Green Energy Expo 2026!
              </h3>
              <p className="text-xs text-slate-600 font-normal mt-1">
                Your entry badge has been generated with your scannable QR code. Present this pass at the gate.
              </p>
            </div>

            {/* Rendered Live ID Card with Admin Placements */}
            <IDCardBadgePreview
              name={formData.name || "Trade Delegate"}
              organization={formData.organization || "Company"}
              jobTitle={formData.jobTitle}
              stallNumber={formData.stallNumber}
              delegateId={delegateId || "HHE26-100293"}
              country={formData.country}
              role={registrationRole}
              templateConfig={badgeTemplates[registrationRole]}
            />
          </div>
        )}

        {/* Navigation Footer */}
        {step < 4 && (
          <div className="mt-8 pt-6 border-t border-slate-200">
            {formError && (
              <div className="mb-4 p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                <span>{formError}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-5 py-3 rounded-xl bg-white text-slate-700 text-xs font-bold hover:text-slate-900 border border-slate-300 transition-colors flex items-center gap-2 shadow-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>BACK</span>
                </button>
              ) : (
                <div />
              )}

              <button
                type="button"
                onClick={handleNext}
                className={`px-7 py-3.5 rounded-xl text-xs font-bold tracking-wider shadow-md transition-all flex items-center gap-2 text-black cursor-pointer ${step === 3
                  ? "bg-[#19A974] hover:bg-[#158f62] shadow-emerald-700/20"
                  : "bg-[#218A59] hover:bg-[#186a43] shadow-emerald-900/20"
                  }`}
              >
                <span>
                  {step === 3 ? "COMPLETE & GENERATE ID CARD" : "CONTINUE NEXT"}
                </span>

                <ArrowRight className="w-4 h-4 text-black" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
