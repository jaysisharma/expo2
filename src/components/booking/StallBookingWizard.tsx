"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { boothsData } from "@/data/booths";
import { officialStalls, OfficialStall } from "@/data/officialFloorPlanData";
import InteractiveFloorPlan from "@/components/floor-plan/InteractiveFloorPlan";
import { formatCurrencyUSD, formatCurrencyNPR } from "@/lib/utils";
import confetti from "canvas-confetti";
import { CheckCircle2, ArrowRight, ArrowLeft, Download, Sparkles, Building2, Zap, ShieldCheck, Map, ListFilter } from "lucide-react";

export default function StallBookingWizard() {
  const searchParams = useSearchParams();
  const queryStall = searchParams.get("stalls") || searchParams.get("booth") || searchParams.get("stall");
  const initialBoothNum = queryStall ? queryStall.split(",")[0] : "C1";

  const [step, setStep] = useState(1);
  const [selectedBoothNumber, setSelectedBoothNumber] = useState<string>(initialBoothNum);
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [boothType, setBoothType] = useState<"Shell Scheme" | "Bare Space">("Shell Scheme");
  const [powerOption, setPowerOption] = useState<string>("Standard 15A Included");
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

  const currentOfficialStall = officialStalls.find(
    (s) => s.id.toLowerCase() === selectedBoothNumber.toLowerCase() || s.number.toLowerCase() === selectedBoothNumber.toLowerCase()
  );
  const currentFallbackBooth = boothsData.find((b) => b.number === selectedBoothNumber) || boothsData[0];

  const stallDisplayName = currentOfficialStall ? `STALL ${currentOfficialStall.number}` : `BOOTH ${currentFallbackBooth.number}`;
  const stallLocation = currentOfficialStall ? `${currentOfficialStall.block} · Bhrikutimandap` : currentFallbackBooth.hall;
  const stallDimensions = currentOfficialStall ? currentOfficialStall.dimensions : currentFallbackBooth.dimensions;
  const stallSizeSqM = currentOfficialStall ? currentOfficialStall.sizeSqM : currentFallbackBooth.sizeSqM;
  const stallPriceUSD = currentOfficialStall ? currentOfficialStall.priceUSD : currentFallbackBooth.priceUSD;
  const stallPriceNPR = currentOfficialStall ? currentOfficialStall.priceNPR : currentFallbackBooth.priceNPR;
  const stallCategory = currentOfficialStall ? currentOfficialStall.category : currentFallbackBooth.type;

  const handleNext = async () => {
    setFormError("");
    if (step === 2) {
      if (!formData.companyName.trim() || !formData.contactPerson.trim() || !formData.email.trim() || !formData.phone.trim()) {
        setFormError("Please fill in Company Name, Contact Person, Email, and Phone number.");
        return;
      }
    }

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
    setFormError("");
    setStep((prev) => Math.max(prev - 1, 1));
  };

  return (
    <div className="w-full p-6 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-md">
      {/* Step Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3 text-xs font-mono text-slate-500 font-semibold">
          <span className="text-[#218A59] font-bold">
            STEP 0{step} OF 05: {step === 1 ? "SELECT STALL" : step === 2 ? "COMPANY DETAILS" : step === 3 ? "SPECS & POWER" : step === 4 ? "REVIEW & CONFIRM" : "SUBMITTED"}
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

      {/* STEP 1: Select Stall via Interactive Floor Plan or List */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-sans font-bold text-2xl text-slate-900">
                Step 1: Choose Your Exhibition Stall
              </h3>
              <p className="text-xs text-slate-600 font-normal mt-1">
                Click directly on any stall on the interactive floor plan below to select and reserve it.
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
                <span>List / Dropdown</span>
              </button>
            </div>
          </div>

          {/* Interactive Floor Plan Canvas */}
          {viewMode === "map" ? (
            <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 p-2 sm:p-4">
              <InteractiveFloorPlan
                selectedStalls={[selectedBoothNumber]}
                onSelectStall={(stall) => {
                  setSelectedBoothNumber(stall.id);
                }}
                showCheckoutBar={false}
              />
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <label className="block text-xs font-mono text-slate-700 mb-2 font-bold uppercase">
                SELECT STALL NUMBER
              </label>
              <select
                value={selectedBoothNumber}
                onChange={(e) => setSelectedBoothNumber(e.target.value)}
                className="w-full p-3.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-medium focus:outline-none focus:border-[#218A59] shadow-xs"
              >
                {officialStalls
                  .filter((s) => s.status !== "Booked")
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      Stall {s.number} — {s.block} ({s.category}) · {s.sizeSqM}m² · USD ${s.priceUSD.toLocaleString()} / NPR {s.priceNPR.toLocaleString()}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {/* Selected Stall Details Box */}
          <div className="p-5 rounded-2xl bg-[#F0FDF4] border border-emerald-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase">SELECTED STALL</span>
              <div className="font-sans font-extrabold text-base text-[#15803D] mt-0.5">
                {stallDisplayName}
              </div>
              <span className="text-[11px] text-emerald-800/80">{stallCategory}</span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase">LOCATION & AREA</span>
              <div className="font-sans font-bold text-sm text-slate-900 mt-0.5">
                {stallSizeSqM} m² ({stallDimensions})
              </div>
              <span className="text-[11px] text-slate-600">{stallLocation}</span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase">INVESTMENT TARIFF</span>
              <div className="font-sans font-bold text-sm text-[#15803D] mt-0.5">
                USD ${stallPriceUSD.toLocaleString()}
              </div>
              <span className="text-[11px] text-slate-600">NPR {stallPriceNPR.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase">BOOTH BUILD TYPE</span>
              <div className="grid grid-cols-2 gap-1.5 mt-1">
                <button
                  type="button"
                  onClick={() => setBoothType("Shell Scheme")}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-mono border transition-all cursor-pointer ${
                    boothType === "Shell Scheme"
                      ? "bg-[#218A59] border-[#218A59] text-white font-bold"
                      : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                  }`}
                >
                  Shell (Built)
                </button>
                <button
                  type="button"
                  onClick={() => setBoothType("Bare Space")}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-mono border transition-all cursor-pointer ${
                    boothType === "Bare Space"
                      ? "bg-[#218A59] border-[#218A59] text-white font-bold"
                      : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                  }`}
                >
                  Bare Space
                </button>
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
                <div className="font-sans font-bold text-lg text-[#218A59]">
                  {stallDisplayName}
                </div>
                <span className="text-[11px] text-slate-600">{stallSizeSqM}m² ({boothType})</span>
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
                <div className="font-sans font-bold text-lg text-[#15803D]">
                  USD ${stallPriceUSD.toLocaleString()}
                </div>
                <span className="text-[11px] text-slate-600">NPR {stallPriceNPR.toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 text-xs text-slate-700 space-y-1">
              <div><strong>Fascia Board:</strong> {formData.fasciaName || formData.companyName}</div>
              <div><strong>Contact:</strong> {formData.contactPerson} ({formData.email}, {formData.phone})</div>
              <div><strong>Location:</strong> {stallLocation}</div>
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
              Your provisional booking for <strong>{stallDisplayName}</strong> ({stallLocation}) has been received. Our exhibition secretariat will issue your formal pro-forma invoice and exhibitor kit within 24 hours.
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

      {/* Wizard Footer Navigation */}
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
                className="px-6 py-3 rounded-full bg-white text-slate-700 font-mono text-xs font-bold hover:text-slate-900 border border-slate-300 transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
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
              className="px-7 py-3.5 rounded-full font-mono text-xs font-bold tracking-wider shadow-md transition-all flex items-center gap-2 text-white bg-[#218A59] hover:bg-[#186a43] cursor-pointer"
            >
              <span>{step === 4 ? "SUBMIT RESERVATION" : "CONTINUE NEXT"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
