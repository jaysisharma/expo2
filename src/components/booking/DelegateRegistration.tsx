"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import confetti from "canvas-confetti";
import {
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import IDCardBadgePreview from "./IDCardBadgePreview";
import type { BadgeConfig } from "./AdminBadgeDesigner";
import { SPONSORSHIP_DETAILS } from "@/data/officialTariffsData";

export default function DelegateRegistration() {
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role");
  const initialPass = searchParams.get("pass");

  const [registrationRole, setRegistrationRole] = useState<"visitor" | "exhibitor" | "gala">(
    initialRole === "exhibitor"
      ? "exhibitor"
      : initialPass === "gala-dinner"
        ? "gala"
        : "visitor"
  );
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    organization: "",
    jobTitle: "",
    stallNumber: "Title Sponsor",
    country: "Nepal",
    delegateTier: "national" as "national" | "international",
    passType:
      initialRole === "exhibitor"
        ? "Exhibitor Pass (All Access)"
        : initialPass === "gala-dinner"
          ? "Gala Dinner Pass (Royal Tulip)"
          : "Trade Visitor (Free)",
    interests: ["Hydropower & Turbines", "Cross-Border Energy Trade"],
  });
  const [delegateId, setDelegateId] = useState<string>("");
  const [formError, setFormError] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; phone?: string }>({});
  const [badgeTemplates, setBadgeTemplates] = useState<{
    visitor?: BadgeConfig;
    exhibitor?: BadgeConfig;
  }>({});

  const selectedSponsorTier = SPONSORSHIP_DETAILS.find((s) => s.tier === formData.stallNumber);

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

    // 3. Listen to live updates from Admin Designer (same window & other tabs)
    const handleTemplatesUpdated = (e: any) => {
      if (e.detail) {
        setBadgeTemplates(e.detail);
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "hhe_badge_templates" && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed && (parsed.visitor || parsed.exhibitor)) {
            setBadgeTemplates(parsed);
          }
        } catch (err) {}
      }
    };

    window.addEventListener("hhe_badge_templates_updated", handleTemplatesUpdated);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("hhe_badge_templates_updated", handleTemplatesUpdated);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);


  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [emailError, setEmailError] = useState("");

  // Trigger celebratory confetti once registration is confirmed (not while generating)
  useEffect(() => {
    if (isSubmitted) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [isSubmitted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formData.name.trim() || !formData.organization.trim()) {
      setFormError("Please enter your Full Name and Organization.");
      return;
    }

    if (registrationRole === "exhibitor" && !formData.stallNumber.trim()) {
      setFormError("Please select a Category.");
      return;
    }

    const emailTrimmed = formData.email.trim();
    const phoneTrimmed = formData.phone.trim();
    const newErrors: { email?: string; phone?: string } = {};

    if (!emailTrimmed) {
      newErrors.email = "Please enter your email address.";
    } else {
      const emailRegex = /^[a-zA-Z0-9._%+-]{2,}@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(emailTrimmed)) {
        newErrors.email = "Please enter a valid email address.";
      }
    }

    if (!phoneTrimmed) {
      newErrors.phone = "Please enter your mobile or WhatsApp number.";
    } else {
      const phoneDigits = phoneTrimmed.replace(/\D/g, "");
      if (phoneDigits.length < 8 || phoneDigits.length > 15) {
        newErrors.phone = "Please enter a valid phone number (8–15 digits).";
      }
    }

    if (newErrors.email || newErrors.phone) {
      setFieldErrors(newErrors);
      setFormError(newErrors.email || newErrors.phone || "Please check highlighted fields.");
      return;
    }
    setFieldErrors({});

    setIsSubmitting(true);
    const prefix =
      registrationRole === "gala"
        ? "HHE27-GALA"
        : registrationRole === "visitor"
          ? "HHE27"
          : "HHE27-EX";
    const generatedId = `${prefix}-${Math.floor(100000 + Math.random() * 900000)}`;
    setDelegateId(generatedId);

    try {
      if (registrationRole === "gala") {
        const galaRes = await fetch("/api/gala-dinner/initiate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            organization: formData.organization,
            jobTitle: formData.jobTitle,
            country: formData.country,
            passType: formData.delegateTier,
            quantity: 1,
            paymentMethod: "khalti",
          }),
        });
        const galaData = await galaRes.json();
        if (galaData.success && galaData.paymentUrl) {
          window.location.href = galaData.paymentUrl;
          return;
        }
      }

      const resolvedPassType =
        registrationRole === "gala"
          ? `Gala Pass - Royal Tulip (${formData.delegateTier === "international" ? "USD 50" : "NPR 6,000"})`
          : registrationRole === "visitor"
            ? formData.passType
            : `Exhibitor Delegate (${formData.stallNumber})`;

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
            passType: resolvedPassType,
            interests: formData.interests,
          },
        }),
      });
      // ── Send pass by email ────────────────────────────────────────
      setEmailSending(true);
      const resolvedRole =
        registrationRole === "gala" ? "gala"
        : registrationRole === "exhibitor" ? "exhibitor"
        : "visitor";

      try {
        await fetch("/api/send-pass", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            organization: formData.organization,
            jobTitle: formData.jobTitle,
            stallNumber: registrationRole === "exhibitor" ? formData.stallNumber : "",
            country: formData.country,
            passId: generatedId,
            passType: resolvedPassType,
            role: resolvedRole,
          }),
        });
      } catch (emailErr) {
        console.warn("Pass email failed", emailErr);
        setEmailError("We could not send your pass by email. Please contact us.");
      } finally {
        setEmailSending(false);
      }
    } catch (err) {
      console.warn("Could not sync registration to server", err);
    } finally {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }
  };

  if (isSubmitted) {
    return (
      <div className="w-full">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 shadow-xs text-center space-y-6">
          {/* Success icon */}
          <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>

          {/* Headline */}
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Registration Confirmed!
            </h2>
            <p className="text-sm font-medium text-slate-600 max-w-sm mx-auto">
              Thank you for registering for HIGEX 2027.
            </p>
            <div className="pt-2">
              <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">
                Your entry pass has been sent to:
              </p>
              <p className="text-base font-bold text-[#007A5E] break-all">
                {formData.email}
              </p>
            </div>
          </div>

          {/* Email status */}
          {emailSending ? (
            <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
              <svg className="animate-spin w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              Sending your pass…
            </div>
          ) : emailError ? (
            <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-4 py-2">{emailError}</p>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Pass sent to your inbox
            </div>
          )}

          {/* Instruction note */}
          <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
            Please check your inbox or spam folder for your official pass and entry QR code. Present the QR code on your phone at Bhrikutimandap Exhibition Hall for fast-track entry.
          </p>

          {/* Register another */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                setIsSubmitted(false);
                setEmailError("");
                setFormData({
                  name: "",
                  email: "",
                  phone: "",
                  organization: "",
                  jobTitle: "",
                  stallNumber: "Title Sponsor",
                  country: "Nepal",
                  delegateTier: "national",
                  passType: "Trade Visitor (Free)",
                  interests: [],
                });
              }}
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
            >
              REGISTER ANOTHER ATTENDEE
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Pass Type Switcher */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Pass Type
          </label>
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setRegistrationRole("visitor");
                setFormData({ ...formData, passType: "Trade Visitor (Free)" });
              }}
              className={`py-2 px-2.5 rounded-lg text-xs font-semibold transition-all ${
                registrationRole === "visitor"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Trade Visitor
            </button>
            <button
              type="button"
              onClick={() => {
                setRegistrationRole("exhibitor");
                setFormData((prev) => ({
                  ...prev,
                  passType: "Exhibitor Pass (All Access)",
                  stallNumber: prev.stallNumber || "Title Sponsor",
                }));
              }}
              className={`py-2 px-2.5 rounded-lg text-xs font-semibold transition-all ${
                registrationRole === "exhibitor"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Exhibitor / Partner
            </button>
            <button
              type="button"
              onClick={() => {
                setRegistrationRole("gala");
                setFormData({ ...formData, passType: "Gala Dinner Pass" });
              }}
              className={`py-2 px-2.5 rounded-lg text-xs font-semibold transition-all ${
                registrationRole === "gala"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Gala Dinner
            </button>
          </div>
        </div>

        {/* Gala Dinner Pricing Toggle */}
        {registrationRole === "gala" && (
          <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-[11px] text-amber-900">
              <span className="font-semibold">Royal Tulip Kathmandu (Gwarko) · Monday, 18 Jan 2027</span>
              <span>6:00 PM onwards</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, delegateTier: "national" })}
                className={`py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all ${
                  formData.delegateTier === "national"
                    ? "bg-white border-amber-500 text-amber-950 shadow-2xs"
                    : "bg-white/60 border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                National · NPR 6,000
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, delegateTier: "international" })}
                className={`py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all ${
                  formData.delegateTier === "international"
                    ? "bg-white border-amber-500 text-amber-950 shadow-2xs"
                    : "bg-white/60 border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                International · USD 50
              </button>
            </div>
          </div>
        )}

        {/* Exhibitor Category Selector */}
        {registrationRole === "exhibitor" && (
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              Sponsorship &amp; Exhibitor Category *
            </label>
            <select
              value={formData.stallNumber}
              onChange={(e) => setFormData({ ...formData, stallNumber: e.target.value })}
              className="w-full h-10 px-3 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 cursor-pointer font-medium"
            >
              <option value="Title Sponsor">Title Sponsor (NRs 50,00,000/- · Flagship)</option>
              <option value="In Association With">In Association With (NRs 40,00,000/-)</option>
              <option value="Powered By">Powered By (NRs 30,00,000/-)</option>
              <option value="Sponsor">Sponsor (NRs 15,00,000/-)</option>
              <option value="Official Partner">Official Partner (NRs 13,00,000/-)</option>
              <option value="Co-Sponsor">Co-Sponsor (NRs 10,00,000/-)</option>
              <option value="Supporter">Supporter (NRs 5,00,000/-)</option>
              <option value="Standard Exhibitor">Standard Exhibitor (Custom Booth / Stall)</option>
            </select>

            {selectedSponsorTier && (
              <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200 leading-relaxed">
                <span className="font-semibold text-slate-800">{selectedSponsorTier.tier}: </span>
                {selectedSponsorTier.bareSpace} Space · {selectedSponsorTier.inaugurationPass} Inauguration · {selectedSponsorTier.galaDinnerPass} Gala Dinner · {selectedSponsorTier.exhibitorPass} Exhibitor passes
              </p>
            )}
          </div>
        )}

        {/* Core Form Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Aarav Sharma"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full h-10 px-3 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Organization / Company *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Sanima Hydro / NEA"
              value={formData.organization}
              onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
              className="w-full h-10 px-3 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Designation / Title
            </label>
            <input
              type="text"
              placeholder="e.g. Project Director / Engineer"
              value={formData.jobTitle}
              onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
              className="w-full h-10 px-3 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Country / City
            </label>
            <input
              type="text"
              placeholder="e.g. Nepal, Kathmandu"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              className="w-full h-10 px-3 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Work email *
            </label>
            <input
              type="email"
              required
              placeholder="e.g. aarav@company.com"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: undefined }));
              }}
              className={`w-full h-10 px-3 rounded-lg bg-white border text-slate-900 text-xs focus:outline-none ${
                fieldErrors.email
                  ? "border-rose-400 focus:border-rose-500"
                  : "border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              }`}
            />
            {fieldErrors.email && (
              <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mobile / WhatsApp *
            </label>
            <input
              type="tel"
              required
              maxLength={17}
              placeholder="e.g. +977 9851000000"
              value={formData.phone}
              onChange={(e) => {
                const cleaned = e.target.value.replace(/[^0-9+ -]/g, "").slice(0, 17);
                setFormData({ ...formData, phone: cleaned });
                if (fieldErrors.phone) setFieldErrors((p) => ({ ...p, phone: undefined }));
              }}
              className={`w-full h-10 px-3 rounded-lg bg-white border text-slate-900 text-xs focus:outline-none ${
                fieldErrors.phone
                  ? "border-rose-400 focus:border-rose-500"
                  : "border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              }`}
            />
            {fieldErrors.phone && (
              <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.phone}</p>
            )}
          </div>
        </div>

        {formError && (
          <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            {formError}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full h-11 rounded-lg text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer pt-0.5 ${
            registrationRole === "gala"
              ? "bg-[#5D2E8E] hover:bg-[#4E2477] shadow-purple-950/20"
              : "bg-[#218A59] hover:bg-[#197047]"
          }`}
        >
          <span>
            {isSubmitting
              ? registrationRole === "gala"
                ? "Connecting to Khalti..."
                : "Generating Badge..."
              : registrationRole === "gala"
                ? `Pay with Khalti (${formData.delegateTier === "international" ? "USD 50" : "NPR 6,000"})`
                : "Generate Entry Badge"}
          </span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <p className="text-[11px] text-slate-400 text-center">
          {registrationRole === "gala"
            ? "Secure 256-bit SSL encrypted Khalti ePayment gateway for Royal Tulip Gala Banquet"
            : "Instant digital QR pass · Complimentary access to Bhrikutimandap Exhibition Hall"}
        </p>
      </form>
    </div>
  );
}
