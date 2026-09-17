"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { boothsData } from "@/data/booths";
import { officialStalls, OfficialStall } from "@/data/officialFloorPlanData";
import InteractiveFloorPlan from "@/components/floor-plan/InteractiveFloorPlan";
import confetti from "canvas-confetti";
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Download,
  Sparkles,
  Building2,
  Zap,
  ShieldCheck,
  Map,
  ListFilter,
  CreditCard,
  QrCode,
  Landmark,
  Loader2,
  X,
  Lock,
} from "lucide-react";

export default function StallBookingWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryStall =
    searchParams.get("stalls") ||
    searchParams.get("booth") ||
    searchParams.get("stall");

  const [step, setStep] = useState(1);
  const [selectedBoothNumbers, setSelectedBoothNumbers] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [boothType, setBoothType] = useState<"Shell Scheme" | "Bare Space">("Shell Scheme");
  const [powerOption, setPowerOption] = useState<string>("Standard 15A Included");
  const [paymentMethod, setPaymentMethod] = useState<"khalti" | "fonepay" | "bank">("khalti");
  const [agreedTerms, setAgreedTerms] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>("");

  const [formData, setFormData] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    country: "Nepal",
    website: "",
    industryCategory: "Turbines & Electro-Mechanical",
    fasciaName: "",
    specialRequirements: "",
  });

  const [bookingRef, setBookingRef] = useState<string>("");

  // Initialize selected stalls from query params
  useEffect(() => {
    if (queryStall) {
      const parsed = queryStall
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (parsed.length > 0) {
        setSelectedBoothNumbers(parsed);
      }
    } else if (selectedBoothNumbers.length === 0) {
      setSelectedBoothNumbers(["C1"]);
    }
  }, [queryStall]);

  // Aggregate selected stalls metadata
  const selectedStallObjects = selectedBoothNumbers.map((num) => {
    const official = officialStalls.find(
      (s) => s.id.toLowerCase() === num.toLowerCase() || s.number.toLowerCase() === num.toLowerCase()
    );
    const fallback = boothsData.find((b) => b.number.toLowerCase() === num.toLowerCase()) || {
      number: num,
      dimensions: "10m × 7m",
      sizeSqM: 70,
      sizeSqFt: 753,
      priceUSD: 6500,
      priceNPR: 875000,
      hall: "Bhrikutimandap Main Pavilion",
      type: "Standard Exhibition Stall",
    };

    return {
      number: official ? official.number : fallback.number,
      displayName: official ? `STALL ${official.number}` : `BOOTH ${fallback.number}`,
      block: official ? official.block : fallback.hall,
      dimensions: official ? official.dimensions : fallback.dimensions,
      sizeSqM: official ? official.sizeSqM : fallback.sizeSqM,
      priceUSD: official ? official.priceUSD : fallback.priceUSD,
      priceNPR: official ? official.priceNPR : fallback.priceNPR,
      category: official ? official.category : fallback.type,
    };
  });

  const totalAreaSqM = selectedStallObjects.reduce((acc, curr) => acc + (curr.sizeSqM || 70), 0);
  const totalPriceNPR = selectedStallObjects.reduce((acc, curr) => acc + (curr.priceNPR || 875000), 0);
  const totalPriceUSD = selectedStallObjects.reduce((acc, curr) => acc + (curr.priceUSD || 6500), 0);

  const toggleStallSelection = (stallNum: string) => {
    setSelectedBoothNumbers((prev) => {
      if (prev.includes(stallNum)) {
        if (prev.length === 1) return prev; // keep at least 1
        return prev.filter((id) => id !== stallNum);
      } else {
        return [...prev, stallNum];
      }
    });
  };

  const handleNext = async () => {
    setFormError("");

    if (step === 1) {
      if (selectedBoothNumbers.length === 0) {
        setFormError("Please select at least one exhibition stall to continue.");
        return;
      }
    }

    if (step === 2) {
      if (
        !formData.companyName.trim() ||
        !formData.contactPerson.trim() ||
        !formData.email.trim() ||
        !formData.phone.trim()
      ) {
        setFormError("Please fill in Company Name, Contact Person, Email, and Phone number.");
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        setFormError("Please enter a valid email address.");
        return;
      }
    }

    if (step === 4) {
      if (!agreedTerms) {
        setFormError("Please agree to the Expo Exhibitor Terms & Stall Allocation Conditions.");
        return;
      }

      setIsSubmitting(true);
      const ref = `HHE26-STALL-${Math.floor(100000 + Math.random() * 900000)}`;
      setBookingRef(ref);

      try {
        const response = await fetch("/api/payment/initiate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bookingId: ref,
            stallNumbers: selectedBoothNumbers,
            amountNPR: totalPriceNPR,
            amountUSD: totalPriceUSD,
            customerName: formData.contactPerson || formData.companyName,
            contactPerson: formData.contactPerson,
            email: formData.email,
            phone: formData.phone,
            company: formData.companyName,
            country: formData.country,
            fasciaName: formData.fasciaName || formData.companyName,
            boothType,
            powerOption,
            industryCategory: formData.industryCategory,
            specialRequirements: formData.specialRequirements,
            paymentMethod,
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Failed to initialize booking and payment.");
        }

        // If redirect URL returned (Khalti or Fonepay gateway redirect)
        if (data.paymentUrl) {
          window.location.href = data.paymentUrl;
          return;
        }

        // If Bank transfer or direct confirmation
        if (data.redirectUrl) {
          router.push(data.redirectUrl);
          return;
        }

        // Fallback to step 5 confirmation
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        setStep(5);
      } catch (err: any) {
        console.error("Booking error:", err);
        setFormError(err.message || "An error occurred while initiating payment. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    setStep((prev) => Math.min(prev + 1, 5));
  };

  const handlePrev = () => {
    setFormError("");
    setStep((prev) => Math.max(prev - 1, 1));
  };

  return (
    <div className="w-full p-6 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-md">
      {/* Step Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3 text-xs font-mono text-slate-500 font-semibold">
          <span className="text-[#218A59] font-bold">
            STEP 0{step} OF 05:{" "}
            {step === 1
              ? "SELECT STALL(S)"
              : step === 2
              ? "COMPANY METADATA"
              : step === 3
              ? "SPECS & POWER"
              : step === 4
              ? "PAYMENT & REVIEW"
              : "CONFIRMED"}
          </span>
          <span>{Math.round((step / 5) * 100)}% COMPLETED</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
          <div
            style={{ width: `${(step / 5) * 100}%` }}
            className="h-full bg-gradient-to-r from-[#218A59] to-[#10B981] transition-all duration-300"
          />
        </div>
      </div>

      {/* =========================================================================
          STEP 1: SELECT STALL(S)
         ========================================================================= */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-sans font-bold text-2xl text-slate-900">
                Step 1: Choose Your Exhibition Stall(s)
              </h3>
              <p className="text-xs text-slate-600 font-normal mt-1">
                Click any stall on the interactive floor plan to select or multi-select your preferred locations.
              </p>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-mono shrink-0">
              <button
                type="button"
                onClick={() => setViewMode("map")}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold transition-all cursor-pointer ${
                  viewMode === "map"
                    ? "bg-white text-[#218A59] shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Map className="w-3.5 h-3.5" />
                <span>Interactive Map</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold transition-all cursor-pointer ${
                  viewMode === "list"
                    ? "bg-white text-[#218A59] shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <ListFilter className="w-3.5 h-3.5" />
                <span>List View</span>
              </button>
            </div>
          </div>

          {/* Interactive Map View */}
          {viewMode === "map" ? (
            <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 p-2 sm:p-4">
              <InteractiveFloorPlan
                selectedStalls={selectedBoothNumbers}
                onSelectStall={(stall) => {
                  const sNum = stall.number || stall.id;
                  toggleStallSelection(sNum);
                }}
                showCheckoutBar={false}
              />
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <label className="block text-xs font-mono text-slate-700 font-bold uppercase">
                AVAILABLE EXHIBITION STALLS
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-80 overflow-y-auto pr-1">
                {officialStalls
                  .filter((s) => s.status !== "Booked")
                  .map((s) => {
                    const isSelected = selectedBoothNumbers.includes(s.id);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => toggleStallSelection(s.id)}
                        className={`p-3 rounded-xl border text-left text-xs font-mono transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#F0FDF4] border-[#10B981] text-[#044E3B] font-bold shadow-xs"
                            : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-sans font-black text-sm">Stall {s.number}</span>
                          <span className="text-[10px] text-emerald-700 font-bold">
                            NPR {s.priceNPR.toLocaleString()}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">
                          {s.sizeSqM}m² · {s.block} ({s.category})
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Selected Stalls Overview Box */}
          <div className="p-5 rounded-2xl bg-[#F0FDF4] border border-emerald-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase tracking-wider">
                SELECTED STALL ALLOCATION ({selectedBoothNumbers.length})
              </span>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {selectedStallObjects.map((s) => (
                  <span
                    key={s.number}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-emerald-300 font-mono text-xs font-bold text-[#15803D] shadow-xs"
                  >
                    <span>{s.displayName}</span>
                    <span className="text-[10px] text-slate-500">({s.dimensions})</span>
                    {selectedBoothNumbers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => toggleStallSelection(s.number)}
                        className="text-slate-400 hover:text-red-500 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 border-t lg:border-t-0 lg:border-l border-emerald-200 pt-3 lg:pt-0 lg:pl-6">
              <div>
                <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase">TOTAL AREA</span>
                <div className="font-sans font-bold text-sm text-slate-900 mt-0.5">
                  {totalAreaSqM} m² ({totalAreaSqM * 10.76} sq.ft)
                </div>
              </div>
              <div>
                <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase">TOTAL TARIFF</span>
                <div className="font-sans font-black text-base text-[#15803D] mt-0.5">
                  NPR {totalPriceNPR.toLocaleString()}
                </div>
                <span className="text-[10px] text-slate-500 font-mono">USD ${totalPriceUSD.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 2: COMPANY METADATA
         ========================================================================= */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <h3 className="font-sans font-bold text-2xl text-slate-900">
              Step 2: Exhibitor Organization Details
            </h3>
            <p className="text-xs text-slate-600 font-normal mt-1">
              Provide company metadata for listing in the official 2027 Expo Directory, exhibitor badge badges, and pro-forma invoice.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-700 mb-1 font-bold uppercase">
                ORGANIZATION / COMPANY NAME *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Voith Hydro International / Himal Power"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full p-3 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-[#10B981] shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-700 mb-1 font-bold uppercase">
                CONTACT PERSON NAME & DESIGNATION *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Dr. Markus Weber, VP Energy"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                className="w-full p-3 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-[#10B981] shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-700 mb-1 font-bold uppercase">
                OFFICIAL EMAIL ADDRESS *
              </label>
              <input
                type="email"
                required
                placeholder="markus.weber@voith.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-3 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-[#10B981] shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-700 mb-1 font-bold uppercase">
                PHONE / WHATSAPP NUMBER *
              </label>
              <input
                type="tel"
                required
                placeholder="+977 9801234567 / +49 7321 370"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-3 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-[#10B981] shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-700 mb-1 font-bold uppercase">
                COUNTRY OF ORIGIN
              </label>
              <input
                type="text"
                placeholder="e.g. Nepal / India / Germany / Austria / China"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full p-3 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-[#10B981] shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-700 mb-1 font-bold uppercase">
                PRIMARY INDUSTRY SECTOR
              </label>
              <select
                value={formData.industryCategory}
                onChange={(e) => setFormData({ ...formData, industryCategory: e.target.value })}
                className="w-full p-3 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-[#10B981] shadow-xs"
              >
                <option>Turbines & Electro-Mechanical</option>
                <option>Transmission & GIS Substations</option>
                <option>Tunneling & TBM Technology</option>
                <option>Civil Works & Dam Hydraulics</option>
                <option>SCADA, Automation & AI</option>
                <option>Solar & Pumped Storage</option>
                <option>Finance & Investment</option>
                <option>Engineering & Consulting</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 3: SPECS & POWER
         ========================================================================= */}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <h3 className="font-sans font-bold text-2xl text-slate-900">
              Step 3: Fascia Board & Technical Specs
            </h3>
            <p className="text-xs text-slate-600 font-normal mt-1">
              Configure your stall lettering, build type, and electrical power load.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-700 mb-1 font-bold uppercase">
                BOOTH BUILD TYPE
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setBoothType("Shell Scheme")}
                  className={`p-4 rounded-xl text-left border transition-all cursor-pointer ${
                    boothType === "Shell Scheme"
                      ? "bg-emerald-50 border-[#10B981] text-[#044E3B] font-bold shadow-xs"
                      : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <div className="font-sans font-bold text-sm">Shell Scheme (Fully Built)</div>
                  <div className="text-[11px] text-slate-500 font-normal mt-1">
                    Octanorm partition walls, carpet, fascia name board, spotlights, 1 table, 2 chairs, 15A power.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setBoothType("Bare Space")}
                  className={`p-4 rounded-xl text-left border transition-all cursor-pointer ${
                    boothType === "Bare Space"
                      ? "bg-emerald-50 border-[#10B981] text-[#044E3B] font-bold shadow-xs"
                      : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <div className="font-sans font-bold text-sm">Bare Space (Custom Fabrication)</div>
                  <div className="text-[11px] text-slate-500 font-normal mt-1">
                    Marked floor space for custom double-deck / bespoke wooden pavilion fabrication.
                  </div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-700 mb-1 font-bold uppercase">
                FASCIA BOARD NAME (EXACT DISPLAY NAME ON BOOTH) *
              </label>
              <input
                type="text"
                placeholder="e.g. VOITH HYDRO GERMANY"
                value={formData.fasciaName || formData.companyName}
                onChange={(e) => setFormData({ ...formData, fasciaName: e.target.value })}
                className="w-full p-3.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono text-sm uppercase focus:outline-none focus:border-[#10B981] shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-700 mb-1 font-bold uppercase">
                ADDITIONAL POWER LOAD REQUIREMENT
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {["Standard 15A Included", "3-Phase 32A Industrial", "3-Phase 63A Heavy Demo"].map(
                  (opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setPowerOption(opt)}
                      className={`p-3 rounded-xl text-xs font-mono border transition-all text-left cursor-pointer ${
                        powerOption === opt
                          ? "bg-emerald-50 border-[#10B981] text-[#044E3B] font-bold shadow-xs"
                          : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      {opt}
                    </button>
                  )
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-700 mb-1 font-bold uppercase">
                SPECIAL HANDLING / CRANE REQUIREMENTS
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Bringing physical runner models; forklift required prior to expo."
                value={formData.specialRequirements}
                onChange={(e) => setFormData({ ...formData, specialRequirements: e.target.value })}
                className="w-full p-3 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-[#10B981] shadow-xs"
              />
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 4: PAYMENT GATEWAY SELECTION & REVIEW
         ========================================================================= */}
      {step === 4 && (
        <div className="space-y-6">
          <div>
            <h3 className="font-sans font-bold text-2xl text-slate-900">
              Step 4: Select Payment Method & Finalize Booking
            </h3>
            <p className="text-xs text-slate-600 font-normal mt-1">
              Choose your preferred payment gateway from Nepal (Khalti, Fonepay) or request an official Secretariat Bank Wire Invoice.
            </p>
          </div>

          {/* Booking Summary Box */}
          <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-slate-200 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">ALLOCATED STALLS</span>
                <div className="font-sans font-bold text-lg text-[#218A59]">
                  STALL {selectedBoothNumbers.join(", ")}
                </div>
                <span className="text-[11px] text-slate-600">
                  {totalAreaSqM}m² ({boothType})
                </span>
              </div>

              <div>
                <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">EXHIBITOR ENTITY</span>
                <div className="font-sans font-bold text-base text-slate-900">
                  {formData.companyName || "Organization"}
                </div>
                <span className="text-[11px] text-slate-600">
                  {formData.contactPerson} ({formData.country})
                </span>
              </div>

              <div>
                <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">TOTAL INVESTMENT</span>
                <div className="font-sans font-black text-xl text-[#15803D]">
                  NPR {totalPriceNPR.toLocaleString()}
                </div>
                <span className="text-[11px] text-slate-600 font-mono">USD ${totalPriceUSD.toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 text-xs text-slate-700 flex flex-wrap items-center justify-between gap-2">
              <div><strong>Fascia Board Name:</strong> {formData.fasciaName || formData.companyName}</div>
              <div><strong>Power Spec:</strong> {powerOption}</div>
              <div><strong>Official Email:</strong> {formData.email}</div>
            </div>
          </div>

          {/* Payment Gateway Cards */}
          <div className="space-y-3">
            <label className="block text-xs font-mono text-slate-700 font-bold uppercase">
              SELECT PAYMENT GATEWAY
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Option 1: Khalti */}
              <div
                onClick={() => setPaymentMethod("khalti")}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                  paymentMethod === "khalti"
                    ? "border-[#5D2E8E] bg-[#5D2E8E]/5 shadow-md ring-2 ring-[#5D2E8E]/20"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="px-2.5 py-1 rounded-lg bg-[#5D2E8E] text-white font-mono text-[10px] font-bold">
                      KHALTI
                    </div>
                    {paymentMethod === "khalti" && (
                      <CheckCircle2 className="w-5 h-5 text-[#5D2E8E]" />
                    )}
                  </div>
                  <h4 className="font-sans font-bold text-base text-slate-900">
                    Khalti ePayment API v2
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    Instant checkout via Khalti Mobile Wallet, SCT Cards, eBanking & ConnectIPS.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1 text-[11px] font-mono text-[#5D2E8E] font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Instant Confirmation</span>
                </div>
              </div>

              {/* Option 2: Fonepay */}
              <div
                onClick={() => setPaymentMethod("fonepay")}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                  paymentMethod === "fonepay"
                    ? "border-[#D92525] bg-[#D92525]/5 shadow-md ring-2 ring-[#D92525]/20"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="px-2.5 py-1 rounded-lg bg-[#D92525] text-white font-mono text-[10px] font-bold">
                      FONEPAY
                    </div>
                    {paymentMethod === "fonepay" && (
                      <CheckCircle2 className="w-5 h-5 text-[#D92525]" />
                    )}
                  </div>
                  <h4 className="font-sans font-bold text-base text-slate-900">
                    Fonepay Direct QR
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    Scan dynamic QR or pay directly from 50+ Nepalese commercial bank mobile apps.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1 text-[11px] font-mono text-[#D92525] font-bold">
                  <QrCode className="w-3.5 h-3.5" />
                  <span>50+ Partner Banks</span>
                </div>
              </div>

              {/* Option 3: Bank Transfer / Pro-Forma Invoice */}
              <div
                onClick={() => setPaymentMethod("bank")}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                  paymentMethod === "bank"
                    ? "border-[#218A59] bg-[#218A59]/5 shadow-md ring-2 ring-[#218A59]/20"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="px-2.5 py-1 rounded-lg bg-[#218A59] text-white font-mono text-[10px] font-bold">
                      BANK WIRE
                    </div>
                    {paymentMethod === "bank" && (
                      <CheckCircle2 className="w-5 h-5 text-[#218A59]" />
                    )}
                  </div>
                  <h4 className="font-sans font-bold text-base text-slate-900">
                    Bank Remittance / Invoice
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    Lock stall provisionally and remit via SWIFT / RTGS directly to IPPAN Secretariat account.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1 text-[11px] font-mono text-[#218A59] font-bold">
                  <Landmark className="w-3.5 h-3.5" />
                  <span>Official Pro-Forma Invoice</span>
                </div>
              </div>
            </div>
          </div>

          {/* Terms Agreement */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            <input
              type="checkbox"
              id="terms-check"
              checked={agreedTerms}
              onChange={(e) => setAgreedTerms(e.target.checked)}
              className="mt-1 w-4 h-4 text-[#218A59] rounded border-slate-300 focus:ring-[#218A59] cursor-pointer"
            />
            <label htmlFor="terms-check" className="text-xs text-slate-700 leading-relaxed cursor-pointer select-none">
              I agree to the <strong>IPPAN Expo 2027 Exhibition Regulations</strong>, stall allocation rules, and acknowledge that stall confirmation is subject to secretariat receipt validation.
            </label>
          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 5: SUCCESS CONFIRMATION
         ========================================================================= */}
      {step === 5 && (
        <div className="text-center py-8 space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-300 text-[#059669] flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="font-mono text-xs text-[#059669] tracking-widest uppercase font-bold">
              STALL RESERVATION SUBMITTED
            </span>
            <h3 className="font-sans font-black text-3xl text-slate-900 mt-1">
              Thank You, {formData.companyName || "Exhibitor"}!
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 font-normal mt-2 max-w-md mx-auto leading-relaxed">
              Your provisional booking for <strong>STALL {selectedBoothNumbers.join(", ")}</strong> has been received. Our exhibition secretariat will issue your formal pro-forma invoice and exhibitor kit within 24 hours.
            </p>
          </div>

          <div className="inline-block p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 font-bold">
            REFERENCE ID: {bookingRef}
          </div>

          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => window.print()}
              className="px-6 py-3.5 rounded-full bg-white text-slate-900 font-mono text-xs font-bold border border-slate-300 hover:border-[#218A59] transition-all flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#218A59]" />
              <span>DOWNLOAD BOOKING CONFIRMATION</span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          WIZARD FOOTER NAVIGATION
         ========================================================================= */}
      {step < 5 && (
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
                disabled={isSubmitting}
                className="px-6 py-3 rounded-full bg-white text-slate-700 font-mono text-xs font-bold hover:text-slate-900 border border-slate-300 transition-colors flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
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
              disabled={isSubmitting}
              className={`px-8 py-3.5 rounded-full font-mono text-xs font-bold tracking-wider shadow-md transition-all flex items-center gap-2 text-white cursor-pointer ${
                isSubmitting
                  ? "bg-slate-400 cursor-not-allowed"
                  : paymentMethod === "khalti" && step === 4
                  ? "bg-[#5D2E8E] hover:bg-[#482370]"
                  : paymentMethod === "fonepay" && step === 4
                  ? "bg-[#D92525] hover:bg-[#b01c1c]"
                  : "bg-[#218A59] hover:bg-[#186a43]"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>PROCESSING PAYMENT GATEWAY...</span>
                </>
              ) : (
                <>
                  <span>
                    {step === 4
                      ? paymentMethod === "bank"
                        ? "CONFIRM RESERVATION"
                        : `PAY WITH ${paymentMethod.toUpperCase()} (NPR ${totalPriceNPR.toLocaleString()})`
                      : "CONTINUE NEXT"}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
