"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { boothsData } from "@/data/booths";
import { formatCurrencyUSD, formatCurrencyNPR } from "@/lib/utils";
import confetti from "canvas-confetti";
import { CheckCircle2, ArrowRight, ArrowLeft, Download, Sparkles, Building2, Zap, ShieldCheck } from "lucide-react";

export default function StallBookingWizard() {
  const searchParams = useSearchParams();
  const initialBoothNum = searchParams.get("booth");

  const [step, setStep] = useState(1);
  const [selectedBoothNumber, setSelectedBoothNumber] = useState<string>(initialBoothNum || "A-102");
  const [boothType, setBoothType] = useState<"Shell Scheme" | "Bare Space">("Shell Scheme");
  const [powerOption, setPowerOption] = useState<string>("Standard 15A Included");
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

  const currentBooth = boothsData.find((b) => b.number === selectedBoothNumber) || boothsData[1];

  const handleNext = async () => {
    if (step === 4) {
      const ref = `HYD26-EXP-${Math.floor(100000 + Math.random() * 900000)}`;
      setBookingRef(ref);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      // Synchronize stall reservation and lead inquiry to admin data API
      try {
        await Promise.all([
          fetch("/api/admin/data", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "update_booth",
              payload: {
                boothNumber: selectedBoothNumber,
                status: "Reserved",
                exhibitorName: formData.companyName || formData.contactPerson || "Exhibitor Applicant",
              },
            }),
          }),
          fetch("/api/admin/data", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "add_inquiry",
              payload: {
                name: formData.contactPerson || formData.companyName,
                email: formData.email,
                phone: formData.phone,
                company: formData.companyName,
                subject: `Stall Reservation Booking - ${selectedBoothNumber} (${boothType})`,
                message: `Ref: ${ref}. Stall: ${selectedBoothNumber}. Fascia: ${formData.fasciaName || formData.companyName}. Power: ${powerOption}. Industry: ${formData.industryCategory}. Notes: ${formData.specialRequirements || "None"}.`,
                stallInterest: selectedBoothNumber,
              },
            }),
          }),
        ]);
      } catch (err) {
        console.warn("Could not sync stall booking to server", err);
      }
    }
    setStep((prev) => Math.min(prev + 1, 5));
  };

  const handlePrev = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  return (
    <div className="w-full p-6 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-md">
      {/* Step Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3 text-xs font-mono text-slate-500 font-semibold">
          <span className="text-[#087EA4] font-bold">
            STEP 0{step} OF 05: {step === 1 ? "SELECT STALL" : step === 2 ? "COMPANY DETAILS" : step === 3 ? "SPECS & POWER" : step === 4 ? "REVIEW & CONFIRM" : "SUBMITTED"}
          </span>
          <span>{Math.round((step / 5) * 100)}% COMPLETED</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
          <div
            style={{ width: `${(step / 5) * 100}%` }}
            className="h-full bg-gradient-to-r from-[#087EA4] to-[#10B981] transition-all duration-300"
          />
        </div>
      </div>

      {/* STEP 1: Select Stall */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <h3 className="font-sans font-bold text-2xl text-slate-900">
              Step 1: Choose Your Exhibition Stall
            </h3>
            <p className="text-xs text-slate-600 font-normal mt-1">
              Select an available stall from the dropdown or choose directly on the Interactive Floor Plan.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-700 mb-2 font-bold uppercase">
                SELECT STALL NUMBER
              </label>
              <select
                value={selectedBoothNumber}
                onChange={(e) => setSelectedBoothNumber(e.target.value)}
                className="w-full p-3.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-medium focus:outline-none focus:border-[#10B981] shadow-xs"
              >
                {boothsData
                  .filter((b) => b.status === "Available" || b.number === selectedBoothNumber)
                  .map((b) => (
                    <option key={b.id} value={b.number}>
                      Booth {b.number} — {b.sizeSqM}m² ({b.type}) · {formatCurrencyUSD(b.priceUSD)}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-700 mb-2 font-bold uppercase">
                BOOTH STAND TYPE
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setBoothType("Shell Scheme")}
                  className={`p-3 rounded-xl text-xs font-mono border transition-all ${
                    boothType === "Shell Scheme"
                      ? "bg-emerald-50 border-[#10B981] text-[#044E3B] font-bold shadow-xs"
                      : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                  }`}
                >
                  Shell Scheme (Built)
                </button>
                <button
                  type="button"
                  onClick={() => setBoothType("Bare Space")}
                  className={`p-3 rounded-xl text-xs font-mono border transition-all ${
                    boothType === "Bare Space"
                      ? "bg-emerald-50 border-[#10B981] text-[#044E3B] font-bold shadow-xs"
                      : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                  }`}
                >
                  Bare Space (Custom)
                </button>
              </div>
            </div>
          </div>

          {/* Current Stall Specs Display */}
          <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">LOCATION</span>
              <div className="font-sans font-bold text-sm text-slate-900 mt-0.5">
                {currentBooth.hall.split("-")[0]}
              </div>
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">SIZE & AREA</span>
              <div className="font-sans font-bold text-sm text-[#087EA4] mt-0.5">
                {currentBooth.sizeSqM} m² ({currentBooth.dimensions})
              </div>
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">ESTIMATED RATE</span>
              <div className="font-sans font-bold text-sm text-[#059669] mt-0.5">
                {formatCurrencyUSD(currentBooth.priceUSD)}
              </div>
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">NPR EQUIVALENT</span>
              <div className="font-sans font-bold text-sm text-slate-900 mt-0.5">
                {formatCurrencyNPR(currentBooth.priceNPR)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Company Details */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <h3 className="font-sans font-bold text-2xl text-slate-900">
              Step 2: Exhibitor Organization Details
            </h3>
            <p className="text-xs text-slate-600 font-normal mt-1">
              Provide corporate details for listing in the official Expo Directory and badge generation.
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
                placeholder="e.g. Voith Hydro International"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full p-3 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-[#10B981] shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-700 mb-1 font-bold uppercase">
                CONTACT PERSON NAME & TITLE *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Dr. Markus Weber, VP Exports"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                className="w-full p-3 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-[#10B981] shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-700 mb-1 font-bold uppercase">
                CORPORATE EMAIL ADDRESS *
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
                placeholder="+49 7321 370 / +977 9801234567"
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
                placeholder="e.g. Germany / Nepal / India / Austria"
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

      {/* STEP 3: Specs & Power */}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <h3 className="font-sans font-bold text-2xl text-slate-900">
              Step 3: Fascia Board & Technical Specs
            </h3>
            <p className="text-xs text-slate-600 font-normal mt-1">
              Configure your stall name board lettering and power requirements.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-700 mb-1 font-bold uppercase">
                FASCIA BOARD NAME (EXACT NAME DISPLAYED ON BOOTH) *
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
                {["Standard 15A Included", "3-Phase 32A Industrial (+$300)", "3-Phase 63A Heavy Demo (+$600)"].map(
                  (opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setPowerOption(opt)}
                      className={`p-3 rounded-xl text-xs font-mono border transition-all text-left ${
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
                SPECIAL HANDLING OR CRANE UNLOADING REQUIREMENTS
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Bringing a 2-tonne physical runner model; forklift unloading required prior to expo."
                value={formData.specialRequirements}
                onChange={(e) => setFormData({ ...formData, specialRequirements: e.target.value })}
                className="w-full p-3 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-[#10B981] shadow-xs"
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: Review */}
      {step === 4 && (
        <div className="space-y-6">
          <div>
            <h3 className="font-sans font-bold text-2xl text-slate-900">
              Step 4: Review Your Reservation Request
            </h3>
            <p className="text-xs text-slate-600 font-normal mt-1">
              Please review all stall allocations and company metadata prior to provisional submission.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-slate-200 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">RESERVED STALL</span>
                <div className="font-sans font-bold text-lg text-[#087EA4]">
                  BOOTH {currentBooth.number}
                </div>
                <span className="text-[11px] text-slate-600">{currentBooth.sizeSqM}m² ({boothType})</span>
              </div>

              <div>
                <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">COMPANY NAME</span>
                <div className="font-sans font-bold text-base text-slate-900">
                  {formData.companyName || "Organization Name"}
                </div>
                <span className="text-[11px] text-slate-600">{formData.country}</span>
              </div>

              <div>
                <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">TOTAL ESTIMATE</span>
                <div className="font-sans font-bold text-lg text-[#059669]">
                  {formatCurrencyUSD(currentBooth.priceUSD)}
                </div>
                <span className="text-[11px] text-slate-600">{formatCurrencyNPR(currentBooth.priceNPR)}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 text-xs text-slate-700 space-y-1">
              <div><strong>Fascia Board:</strong> {formData.fasciaName || formData.companyName}</div>
              <div><strong>Contact:</strong> {formData.contactPerson} ({formData.email}, {formData.phone})</div>
              <div><strong>Power Spec:</strong> {powerOption}</div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: Success Confirmation */}
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
              Your provisional booking for <strong>Booth {currentBooth.number}</strong> has been received. Our exhibition secretariat will issue your formal pro-forma invoice and exhibitor kit within 24 hours.
            </p>
          </div>

          <div className="inline-block p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 font-bold">
            REFERENCE ID: {bookingRef}
          </div>

          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => window.print()}
              className="px-6 py-3.5 rounded-full bg-white text-slate-900 font-mono text-xs font-bold border border-slate-300 hover:border-[#087EA4] transition-all flex items-center gap-2 shadow-xs"
            >
              <Download className="w-4 h-4 text-[#087EA4]" />
              <span>DOWNLOAD BOOKING CONFIRMATION</span>
            </button>
          </div>
        </div>
      )}

      {/* Wizard Footer Navigation */}
      {step < 5 && (
        <div className="mt-8 pt-6 border-t border-slate-200 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="px-6 py-3 rounded-full bg-white text-slate-700 font-mono text-xs font-bold hover:text-slate-900 border border-slate-300 transition-colors flex items-center gap-2 shadow-xs"
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
            className="px-7 py-3.5 rounded-full font-mono text-xs font-bold tracking-wider shadow-sm transition-all flex items-center gap-2 text-slate-950 bg-[#10B981] hover:bg-[#059669] hover:text-white"
          >
            <span>{step === 4 ? "SUBMIT RESERVATION" : "CONTINUE NEXT"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
