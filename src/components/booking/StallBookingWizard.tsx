"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { boothsData } from "@/data/booths";
import { officialStalls, OfficialStall } from "@/data/officialFloorPlanData";
import savedFloorPlanFallback from "@/data/savedCustomFloorPlan.json";
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
  Phone,
  Mail,
  MapPin,
  Award,
  Check,
  RotateCcw,
  Layers,
  AlertCircle,
  Globe,
} from "lucide-react";

export interface StallPackage {
  id: string;
  name: string;
  type: "sponsor" | "stall" | "custom";
  badge?: string;
  priceNPR: number;
  priceUSD: number;
  priceDisplayNPR: string;
  priceDisplayUSD: string;
  spaceDescription: string;
  spaceCount: number;
  spaceType: "bare" | "standard" | "any";
  preferredStalls: string[];
  perks: string[];
}

export const PARTICIPATION_PACKAGES: StallPackage[] = [
  {
    id: "title-sponsor",
    name: "Title Sponsor",
    type: "sponsor",
    badge: "Flagship",
    priceNPR: 5000000,
    priceUSD: 35000,
    priceDisplayNPR: "NPR 50,00,000",
    priceDisplayUSD: "USD $35,000",
    spaceDescription: "6M × 6M × 2 (2 Bare Space Stalls · 72m²)",
    spaceCount: 2,
    spaceType: "bare",
    preferredStalls: ["A1", "A2"],
    perks: ["2 Bare Space Stalls (72m²)", "25 Networking Dinner Passes", "50 Inauguration Passes", "500 Entry Passes", "5 Promotional Displays"],
  },
  {
    id: "in-association-with",
    name: "In Association With",
    type: "sponsor",
    badge: "Principal",
    priceNPR: 4000000,
    priceUSD: 25000,
    priceDisplayNPR: "NPR 40,00,000",
    priceDisplayUSD: "USD $25,000",
    spaceDescription: "6M × 6M × 1 (1 Bare Space Stall · 36m²)",
    spaceCount: 1,
    spaceType: "bare",
    preferredStalls: ["A1"],
    perks: ["1 Bare Space Stall (36m²)", "20 Networking Dinner Passes", "50 Inauguration Passes", "300 Entry Passes"],
  },
  {
    id: "powered-by",
    name: "Powered By",
    type: "sponsor",
    badge: "Major",
    priceNPR: 3000000,
    priceUSD: 20000,
    priceDisplayNPR: "NPR 30,00,000",
    priceDisplayUSD: "USD $20,000",
    spaceDescription: "6M × 6M × 1 (1 Bare Space Stall · 36m²)",
    spaceCount: 1,
    spaceType: "bare",
    preferredStalls: ["A2"],
    perks: ["1 Bare Space Stall (36m²)", "15 Networking Dinner Passes", "40 Inauguration Passes", "200 Entry Passes"],
  },
  {
    id: "sponsor",
    name: "Sponsor",
    type: "sponsor",
    priceNPR: 1500000,
    priceUSD: 10000,
    priceDisplayNPR: "NPR 15,00,000",
    priceDisplayUSD: "USD $10,000",
    spaceDescription: "6M × 6M × 1 (1 Bare Space Stall · 36m²)",
    spaceCount: 1,
    spaceType: "bare",
    preferredStalls: ["A3"],
    perks: ["1 Bare Space Stall (36m²)", "8 Networking Dinner Passes", "20 Inauguration Passes", "150 Entry Passes"],
  },
  {
    id: "official-partner",
    name: "Official Partner",
    type: "sponsor",
    priceNPR: 1300000,
    priceUSD: 9000,
    priceDisplayNPR: "NPR 13,00,000",
    priceDisplayUSD: "USD $9,000",
    spaceDescription: "6M × 6M × 1 (1 Bare Space Stall · 36m²)",
    spaceCount: 1,
    spaceType: "bare",
    preferredStalls: ["A4"],
    perks: ["1 Bare Space Stall (36m²)", "5 Networking Dinner Passes", "20 Inauguration Passes", "120 Entry Passes"],
  },
  {
    id: "co-sponsor",
    name: "Co-Sponsor",
    type: "sponsor",
    badge: undefined,
    priceNPR: 1000000,
    priceUSD: 7000,
    priceDisplayNPR: "NPR 10,00,000",
    priceDisplayUSD: "USD $7,000",
    spaceDescription: "6M × 6M × 1 (1 Bare Space Stall · 36m²)",
    spaceCount: 1,
    spaceType: "bare",
    preferredStalls: ["A26"],
    perks: ["1 Bare Space Stall (36m²)", "5 Networking Dinner Passes", "20 Inauguration Passes", "100 Entry Passes"],
  },
  {
    id: "supporter",
    name: "Supporter",
    type: "sponsor",
    priceNPR: 500000,
    priceUSD: 5000,
    priceDisplayNPR: "NPR 5,00,000",
    priceDisplayUSD: "USD $5,000",
    spaceDescription: "6M × 6M × 1 (1 Bare Space Stall · 36m²)",
    spaceCount: 1,
    spaceType: "bare",
    preferredStalls: ["A27"],
    perks: ["1 Bare Space Stall (36m²)", "3 Networking Dinner Passes", "20 Inauguration Passes", "50 Entry Passes"],
  },
  {
    id: "standard-stall",
    name: "Standard Stall (3m × 3m)",
    type: "stall",
    badge: "Built Stall",
    priceNPR: 180000,
    priceUSD: 1350,
    priceDisplayNPR: "NPR 85,000 – 1,80,000",
    priceDisplayUSD: "USD $700 – $1,350",
    spaceDescription: "3M × 3M Built Stall (B1–B22, H1–H8)",
    spaceCount: 1,
    spaceType: "standard",
    preferredStalls: ["B1"],
    perks: ["Pre-built partition walls", "1 Table, 2 Chairs", "15A Power socket", "Spotlights"],
  },
  {
    id: "bare-space-stall",
    name: "Bare Space Stall (Custom)",
    type: "stall",
    badge: "Raw Space",
    priceNPR: 450000,
    priceUSD: 3500,
    priceDisplayNPR: "From NPR 3,78,000",
    priceDisplayUSD: "From USD $3,000",
    spaceDescription: "6M × 6M or 10M × 7M Raw Space (Block A / Block C)",
    spaceCount: 1,
    spaceType: "bare",
    preferredStalls: ["A1"],
    perks: ["Marked floor space for custom fabrication", "Direct 3-Phase power available", "Ideal for machinery & heavy demos"],
  },
  {
    id: "custom-selection",
    name: "Custom Map Selection",
    type: "custom",
    badge: "Flexible",
    priceNPR: 0,
    priceUSD: 0,
    priceDisplayNPR: "Per Selected Stall(s)",
    priceDisplayUSD: "Per Selected Stall(s)",
    spaceDescription: "Select any stalls directly on the interactive floor plan",
    spaceCount: 0,
    spaceType: "any",
    preferredStalls: [],
    perks: ["Complete flexibility", "Multi-stall combinations", "Direct real-time floor plan picking"],
  },
];

export default function StallBookingWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryStall =
    searchParams.get("stalls") ||
    searchParams.get("booth") ||
    searchParams.get("stall");
  const queryTier =
    searchParams.get("tier") ||
    searchParams.get("package") ||
    searchParams.get("type");

  const [step, setStep] = useState(1);
  const [selectedBoothNumbers, setSelectedBoothNumbers] = useState<string[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState<string>("custom-selection");
  const [packageFilter, setPackageFilter] = useState<"all" | "sponsor" | "stall" | "custom">("all");
  const [isCustomizedOnMap, setIsCustomizedOnMap] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [boothType, setBoothType] = useState<"Shell Scheme" | "Bare Space">("Shell Scheme");
  const [powerOption, setPowerOption] = useState<string>("Standard 15A Included");
  const [paymentMethod, setPaymentMethod] = useState<"khalti" | "fonepay" | "bank">("khalti");
  const [agreedTerms, setAgreedTerms] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>("");
  const [exhibitorOrigin, setExhibitorOrigin] = useState<"domestic" | "international">("domestic");

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
  const [customIndustry, setCustomIndustry] = useState<string>("");

  const [bookingRef, setBookingRef] = useState<string>("");

  // Load custom elements configured from Admin Floor Plan Studio
  const [elements, setElements] = useState<any[]>(
    (savedFloorPlanFallback as any).elements || []
  );

  useEffect(() => {
    async function loadAdminFloorPlan() {
      try {
        const res = await fetch("/api/floor-plan/save");
        const json = await res.json();
        if (json.success && json.data?.elements && Array.isArray(json.data.elements) && json.data.elements.length > 0) {
          setElements(json.data.elements);
        }
      } catch (err) {
        console.warn("Using fallback floor plan elements in StallBookingWizard", err);
      }
    }
    loadAdminFloorPlan();
  }, []);

  // Helper to filter valid exhibition stalls
  const isActualStall = (el: any) => {
    if (el.type === "text" || el.type === "line" || el.type === "arc" || el.type === "pencil") return false;
    if (el.category === "Hollow Wall / Boundary" || el.category === "Boundary Wall" || el.category === "Curved Wall") return false;
    if (el.category === "Zone / Functional Area" || el.type === "zone") return false;
    if (el.number === "WALL" || el.number === "CURVE" || el.number === "OUTLINE" || !el.number) return false;
    return true;
  };

  // Helper to resolve exact stall metadata (prioritizing Admin Studio configuration)
  const findStall = (num: string) => {
    const cleanNum = (num || "").trim().toLowerCase();
    const custom = elements.find(
      (el: any) =>
        isActualStall(el) &&
        ((el.number && el.number.toLowerCase() === cleanNum) ||
          (el.id && el.id.toLowerCase() === cleanNum))
    ) || elements.find(
      (el: any) =>
        (el.number && el.number.toLowerCase() === cleanNum) ||
        (el.id && el.id.toLowerCase() === cleanNum)
    );
    const official = officialStalls.find(
      (s) => s.id.toLowerCase() === cleanNum || s.number.toLowerCase() === cleanNum
    );
    const fallback = boothsData.find((b) => b.number.toLowerCase() === cleanNum);

    const number = custom?.number || official?.number || fallback?.number || num;
    const category = custom?.category || official?.category || fallback?.type || "Standard Exhibition Stall";
    const dimensions = custom?.dimensions || official?.dimensions || fallback?.dimensions || "3m × 3m";
    const sizeSqM = Number(custom?.sizeSqM ?? official?.sizeSqM ?? fallback?.sizeSqM ?? 9);
    const sizeSqFt = Number(custom?.sizeSqFt ?? official?.sizeSqFt ?? Math.round(sizeSqM * 10.76));

    let priceNPR = 180000;
    if (custom?.priceNPR !== undefined && custom?.priceNPR !== null && !isNaN(Number(custom.priceNPR))) {
      priceNPR = Number(custom.priceNPR);
    } else if (official?.priceNPR !== undefined && !isNaN(Number(official.priceNPR))) {
      priceNPR = Number(official.priceNPR);
    } else if (fallback?.priceNPR !== undefined && !isNaN(Number(fallback.priceNPR))) {
      priceNPR = Number(fallback.priceNPR);
    }

    let priceUSD = 1350;
    if (custom?.priceUSD !== undefined && custom?.priceUSD !== null && !isNaN(Number(custom.priceUSD))) {
      priceUSD = Number(custom.priceUSD);
    } else if (official?.priceUSD !== undefined && !isNaN(Number(official.priceUSD))) {
      priceUSD = Number(official.priceUSD);
    } else if (fallback?.priceUSD !== undefined && !isNaN(Number(fallback.priceUSD))) {
      priceUSD = Number(fallback.priceUSD);
    }

    const block = custom?.block || official?.block || fallback?.hall || (number ? `Block ${number.charAt(0).toUpperCase()}` : "Main Pavilion");
    const status = custom?.status || official?.status || fallback?.status || "Available";

    // Rule: B1–B22 and H1–H8 are standard stalls (do not write Shell Scheme). All other stalls are Bare Space!
    const upper = (number || "").trim().toUpperCase();
    const bMatch = upper.match(/^B(\d+)$/);
    const isB = Boolean(bMatch && parseInt(bMatch[1], 10) >= 1 && parseInt(bMatch[1], 10) <= 22);
    const hMatch = upper.match(/^H(\d+)$/);
    const isH = Boolean(hMatch && parseInt(hMatch[1], 10) >= 1 && parseInt(hMatch[1], 10) <= 8);
    const isBareSpace = !isB && !isH;
    const displayName = isBareSpace ? `STALL ${number} (Bare Space)` : `STALL ${number}`;

    return {
      number,
      displayName,
      spaceType: isBareSpace ? "Bare Space" : "",
      isBareSpace,
      block,
      dimensions,
      sizeSqM,
      sizeSqFt,
      priceNPR,
      priceUSD,
      category: isBareSpace ? `${dimensions} Bare Space` : category,
      status,
      powerIncluded: custom?.powerIncluded || official?.powerIncluded || (isBareSpace ? "Direct Power Provision" : "Standard 15A Included"),
    };
  };

  // Aggregate selected stalls metadata using Admin-configured details
  const selectedStallObjects = selectedBoothNumbers.map(findStall);

  // Automatically sync boothType (Bare Space vs Shell Scheme) based on selected stalls
  useEffect(() => {
    if (selectedStallObjects.length > 0) {
      const allBare = selectedStallObjects.every((s) => s.isBareSpace);
      const allShell = selectedStallObjects.every((s) => !s.isBareSpace);
      if (allBare) setBoothType("Bare Space");
      else if (allShell) setBoothType("Shell Scheme");
    }
  }, [selectedBoothNumbers]);

  const selectedPackage = PARTICIPATION_PACKAGES.find((p) => p.id === selectedPackageId);
  const isSponsorPackage = Boolean(selectedPackage && selectedPackage.type === "sponsor");

  const totalAreaSqM = selectedStallObjects.reduce((acc, curr) => acc + (curr.sizeSqM || 0), 0);
  const rawTotalPriceNPR = selectedStallObjects.reduce((acc, curr) => acc + (curr.priceNPR || 0), 0);
  const rawTotalPriceUSD = selectedStallObjects.reduce((acc, curr) => acc + (curr.priceUSD || 0), 0);

  const finalPriceNPR = isSponsorPackage && selectedPackage
    ? selectedPackage.priceNPR
    : rawTotalPriceNPR;

  const finalPriceUSD = isSponsorPackage && selectedPackage
    ? selectedPackage.priceUSD
    : rawTotalPriceUSD;

  // Function to handle package selection and auto-allocation
  const selectPackage = (pkgId: string) => {
    setSelectedPackageId(pkgId);
    setIsCustomizedOnMap(false);

    const pkg = PARTICIPATION_PACKAGES.find((p) => p.id === pkgId);
    if (!pkg || pkg.id === "custom-selection") {
      return;
    }

    const available = elements
      .filter(isActualStall)
      .filter((el: any) => el.status !== "Booked");

    const allocated: string[] = [];

    // 1. Try preferred stalls first
    for (const pref of pkg.preferredStalls) {
      const isAvail = available.some(
        (el: any) =>
          (el.number && el.number.toLowerCase() === pref.toLowerCase()) ||
          (el.id && el.id.toLowerCase() === pref.toLowerCase())
      );
      if (isAvail && !allocated.includes(pref)) {
        allocated.push(pref);
      }
    }

    // 2. If needed, select remaining stalls matching space requirements
    if (allocated.length < pkg.spaceCount) {
      for (const el of available) {
        const sNum = el.number || el.id;
        if (allocated.includes(sNum)) continue;
        const cleanNum = sNum.toLowerCase();
        const isB = /^b\d+$/i.test(cleanNum) || /^b\s*\d+$/i.test(cleanNum);
        const isH = /^h\d+$/i.test(cleanNum) || /^h\s*\d+$/i.test(cleanNum);
        const isBare = !isB && !isH;

        if (pkg.spaceType === "bare" && isBare) {
          allocated.push(sNum);
        } else if (pkg.spaceType === "standard" && (isB || isH)) {
          allocated.push(sNum);
        } else if (pkg.spaceType === "any") {
          allocated.push(sNum);
        }

        if (allocated.length >= pkg.spaceCount) break;
      }
    }

    if (allocated.length > 0) {
      setSelectedBoothNumbers(allocated);
    }
  };

  // Initialize selected package or stalls from query params
  useEffect(() => {
    if (queryTier) {
      const clean = queryTier.trim().toLowerCase();
      const match = PARTICIPATION_PACKAGES.find(
        (p) =>
          p.id.toLowerCase() === clean ||
          p.name.toLowerCase() === clean ||
          p.name.toLowerCase().includes(clean)
      );
      if (match) {
        selectPackage(match.id);
        return;
      }
    }

    if (queryStall) {
      const parsed = queryStall
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (parsed.length > 0) {
        setSelectedBoothNumbers(parsed);
      }
    }
  }, [queryStall, queryTier]);

  // Available stalls list for List View (derived from Admin elements)
  const availableStallsList = React.useMemo(() => {
    const customStalls = elements.filter(isActualStall);

    if (customStalls.length > 0) {
      const seen = new Set<string>();
      return customStalls
        .filter((el: any) => {
          const num = (el.number || el.id).toLowerCase();
          if (seen.has(num)) return false;
          seen.add(num);
          return el.status !== "Booked";
        })
        .map((el: any) => findStall(el.number || el.id));
    }

    return officialStalls
      .filter((s) => s.status !== "Booked")
      .map((s) => findStall(s.number || s.id));
  }, [elements]);

  const toggleStallSelection = (stallNum: string) => {
    setIsCustomizedOnMap(true);
    setSelectedBoothNumbers((prev) => {
      if (prev.includes(stallNum)) {
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
      if (
        exhibitorOrigin === "international" &&
        (!formData.country.trim() || formData.country.trim().toLowerCase() === "nepal")
      ) {
        setFormError("Please enter your International Country of Origin (e.g. India, Germany, China, USA).");
        return;
      }
      const emailRegex = /^[a-zA-Z0-9._%+-]{2,}@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(formData.email.trim())) {
        setFormError("Please enter a valid email address (e.g. name@company.com).");
        return;
      }
      const phoneDigits = formData.phone.trim().replace(/\D/g, "");
      if (phoneDigits.length < 8 || phoneDigits.length > 15) {
        setFormError("Please enter a valid phone or mobile number (8–15 digits, e.g. +977 9851000000).");
        return;
      }
      if (formData.industryCategory === "Other" && !customIndustry.trim()) {
        setFormError("Please specify your Industry Sector.");
        return;
      }
    }

    if (step === 3) {
      if (!agreedTerms) {
        setFormError("Please agree to the Expo Exhibitor Terms & Stall Allocation Conditions.");
        return;
      }

      setIsSubmitting(true);
      const ref = `HHE26-STALL-${Math.floor(100000 + Math.random() * 900000)}`;
      setBookingRef(ref);

      const resolvedIndustry =
        formData.industryCategory === "Other"
          ? customIndustry.trim()
          : formData.industryCategory;

      const resolvedBoothType = selectedStallObjects.every((s) => s.isBareSpace)
        ? "Bare Space"
        : "Standard";

      try {
        const response = await fetch("/api/payment/initiate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bookingId: ref,
            stallNumbers: selectedBoothNumbers,
            amountNPR: finalPriceNPR,
            amountUSD: finalPriceUSD,
            customerName: formData.contactPerson || formData.companyName,
            contactPerson: formData.contactPerson,
            email: formData.email,
            phone: formData.phone,
            company: formData.companyName,
            country: formData.country,
            fasciaName: formData.fasciaName || formData.companyName,
            boothType: resolvedBoothType,
            powerOption: "Standard 15A Included",
            industryCategory: resolvedIndustry,
            specialRequirements:
              selectedPackage && selectedPackage.id !== "custom-selection"
                ? `[${exhibitorOrigin.toUpperCase()} EXHIBITOR] Package: ${selectedPackage.name} | Stalls: ${selectedBoothNumbers.join(", ")}`
                : `[${exhibitorOrigin.toUpperCase()} EXHIBITOR] Stalls: ${selectedBoothNumbers.join(", ")}`,
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

        // Fallback to step 4 confirmation
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        setStep(4);
      } catch (err: any) {
        console.error("Booking error:", err);
        setFormError(err.message || "An error occurred while initiating payment. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    setStep((prev) => Math.min(prev + 1, 4));
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
            STEP 0{step} OF 04:{" "}
            {step === 1
              ? "SELECT STALL(S)"
              : step === 2
              ? "ORGANIZATION DETAILS"
              : step === 3
              ? "PAYMENT & REVIEW"
              : "CONFIRMED"}
          </span>
          <span>{Math.round((step / 4) * 100)}% COMPLETED</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
          <div
            style={{ width: `${(step / 4) * 100}%` }}
            className="h-full bg-gradient-to-r from-[#218A59] to-[#10B981] transition-all duration-300"
          />
        </div>
      </div>

      {/* =========================================================================
          STEP 1: SELECT STALL(S)
         ========================================================================= */}
      {step === 1 && (
        <div className="space-y-6">
          {/* =========================================================================
              PARTICIPATION PACKAGE & STALL SELECTOR (EDITORIAL DESIGN)
             ========================================================================= */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-mono font-semibold text-slate-500 uppercase tracking-wider block mb-0.5">
                  Step 1 · Stall Allocation & Sponsorship Tier
                </span>
                <h3 className="font-sans font-bold text-lg sm:text-xl text-slate-900 tracking-tight">
                  Choose a Package or Stall Type
                </h3>
                <p className="text-xs text-slate-600 mt-0.5 max-w-xl leading-relaxed">
                  Select an option below to assign your space automatically. Stalls can be reviewed or changed directly on the interactive floor plan anytime.
                </p>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-white border border-slate-200 shadow-2xs text-xs shrink-0 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setViewMode("map")}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition-colors cursor-pointer ${
                    viewMode === "map"
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Map className="w-3.5 h-3.5" />
                  <span>Floor Plan</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition-colors cursor-pointer ${
                    viewMode === "list"
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <ListFilter className="w-3.5 h-3.5" />
                  <span>List View</span>
                </button>
              </div>
            </div>

            {/* Category Segmented Tabs */}
            <div className="flex items-center gap-1.5 border-b border-slate-200/80 pb-2.5 overflow-x-auto scrollbar-none">
              {[
                { key: "all", label: "All Packages", count: 10 },
                { key: "sponsor", label: "Sponsorship Tiers", count: 7 },
                { key: "stall", label: "Exhibition Stalls", count: 2 },
                { key: "custom", label: "Custom Selection", count: 1 },
              ].map((tab) => {
                const isActive = packageFilter === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setPackageFilter(tab.key as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs transition-colors shrink-0 cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? "bg-white text-slate-900 border border-slate-300 shadow-2xs font-semibold"
                        : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/70 font-medium"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        isActive
                          ? "bg-slate-100 text-slate-700 font-mono font-bold"
                          : "bg-slate-200/60 text-slate-500"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Compact, Clean Package Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {PARTICIPATION_PACKAGES.filter((pkg) => {
                if (packageFilter === "sponsor") return pkg.type === "sponsor";
                if (packageFilter === "stall") return pkg.type === "stall";
                if (packageFilter === "custom") return pkg.type === "custom";
                return true;
              }).map((pkg) => {
                const isSelected = selectedPackageId === pkg.id;
                return (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => selectPackage(pkg.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2.5 relative group ${
                      isSelected
                        ? "bg-white border-[#218A59] ring-2 ring-[#218A59]/20 shadow-xs"
                        : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/70"
                    }`}
                  >
                    {/* Top Row: Radio circle, Title, Badge */}
                    <div className="flex items-start justify-between gap-2 w-full">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div
                          className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                            isSelected
                              ? "border-[#218A59] bg-[#218A59]"
                              : "border-slate-300 bg-white group-hover:border-slate-400"
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold text-slate-900 text-sm leading-snug">
                              {pkg.name}
                            </span>
                            {pkg.badge && (
                              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                                {pkg.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                            {pkg.spaceDescription}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Row: Tier Type & Pricing */}
                    <div className="flex items-baseline justify-between pt-2 border-t border-slate-100 w-full text-xs pl-6.5">
                      <span className="text-slate-400 text-[11px]">
                        {pkg.type === "sponsor"
                          ? "Sponsorship"
                          : pkg.type === "custom"
                          ? "Map Pick"
                          : "Booth Allocation"}
                      </span>
                      <div className="text-right">
                        <span className="font-semibold text-slate-900">
                          {pkg.priceDisplayNPR}
                        </span>
                        {pkg.priceDisplayUSD && pkg.priceNPR > 0 && (
                          <span className="text-slate-400 text-[11px] ml-1.5">
                            · {pkg.priceDisplayUSD}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Clear Status & Modification Reassurance */}
            {selectedPackage && (
              <div className="pt-2 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#218A59] shrink-0" />
                  <span className="text-slate-700">
                    <strong className="text-slate-900 font-semibold">{selectedPackage.name}</strong> active.{" "}
                    {selectedPackage.id === "custom-selection" ? (
                      <span>Click any stall on the interactive floor plan below to select or deselect.</span>
                    ) : (
                      <span>
                        Assigned:{" "}
                        <strong className="font-mono text-slate-900">
                          STALL {selectedBoothNumbers.length > 0 ? selectedBoothNumbers.join(", ") : "None"}
                        </strong>{" "}
                        <span className="text-slate-500">({selectedPackage.spaceDescription})</span>.
                        {isCustomizedOnMap ? (
                          <span className="text-emerald-700 font-medium ml-1">· Modified on map</span>
                        ) : (
                          <span className="text-slate-500 ml-1">· Click any stall on the floor plan below to modify.</span>
                        )}
                      </span>
                    )}
                  </span>
                </div>

                {isCustomizedOnMap && selectedPackage.preferredStalls.length > 0 && (
                  <button
                    type="button"
                    onClick={() => selectPackage(selectedPackage.id)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-[11px] transition-colors cursor-pointer shrink-0 shadow-2xs"
                  >
                    <RotateCcw className="w-3 h-3 text-slate-500" />
                    <span>Reset to recommended stalls</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* 2-Column Grid: Big Floor Plan (Left) & Sleek Compact Sidebar (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left: Floor Plan or List View (Big side: 9 cols on xl, 8 on lg) */}
            <div className="lg:col-span-8 xl:col-span-9">
              {viewMode === "map" ? (
                <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 p-2 sm:p-4">
                  <InteractiveFloorPlan
                    selectedStalls={selectedBoothNumbers}
                    showSearch={false}
                    showBuilderLink={false}
                    onSelectStall={(stall) => {
                      const sNum = stall.number || stall.id;
                      if (stall) {
                        setElements((prev) => {
                          const idx = prev.findIndex(
                            (e) =>
                              (e.number && e.number.toLowerCase() === sNum.toLowerCase()) ||
                              e.id === stall.id
                          );
                          if (idx >= 0) {
                            const next = [...prev];
                            next[idx] = { ...next[idx], ...stall };
                            return next;
                          }
                          return [...prev, stall];
                        });
                      }
                      toggleStallSelection(sNum);
                    }}
                    showCheckoutBar={false}
                  />
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <label className="block text-xs font-mono text-slate-700 font-bold uppercase">
                    AVAILABLE EXHIBITION STALLS ({availableStallsList.length})
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[600px] overflow-y-auto pr-1">
                    {availableStallsList.map((s) => {
                      const isSelected = selectedBoothNumbers.some(
                        (num) => num.toLowerCase() === s.number.toLowerCase()
                      );
                      return (
                        <button
                          key={s.number}
                          type="button"
                          onClick={() => toggleStallSelection(s.number)}
                          className={`p-3 rounded-xl border text-left text-xs font-mono transition-all cursor-pointer ${
                            isSelected
                              ? "bg-[#F0FDF4] border-[#10B981] text-[#044E3B] font-bold shadow-xs"
                              : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-sans font-bold text-sm">Stall {s.number}</span>
                            <span className="text-[10px] text-emerald-700 font-bold">
                              NPR {s.priceNPR.toLocaleString()}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-1">
                            {s.sizeSqM}m² ({s.dimensions}){s.isBareSpace ? " · Bare Space" : ""} · {s.block}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Sleek Compact Stall Summary & Price Sidebar (Small side: 3 cols on xl, 4 on lg) */}
            <div className="lg:col-span-4 xl:col-span-3 lg:sticky lg:top-24 space-y-4">
              <div className="p-4 sm:p-5 rounded-2xl bg-[#F0FDF4] border border-emerald-300 shadow-sm space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-emerald-200">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 block">
                      STALL ALLOCATION
                    </span>
                    <h4 className="font-sans font-bold text-sm text-slate-900 mt-0.5">
                      Price &amp; Summary
                    </h4>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 font-mono text-[11px] font-bold shrink-0">
                    {selectedBoothNumbers.length} {selectedBoothNumbers.length === 1 ? "Stall" : "Stalls"}
                  </span>
                </div>

                {/* Stalls List */}
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {selectedStallObjects.length > 0 ? (
                    selectedStallObjects.map((s) => (
                      <div
                        key={s.number}
                        className="p-2.5 rounded-xl bg-white border border-emerald-200 shadow-xs flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-mono font-bold text-slate-900 text-xs">
                              {s.displayName}
                            </span>
                          </div>
                          <div className="text-[11px] font-semibold text-emerald-800 mt-0.5">
                            {s.isBareSpace ? `(${s.dimensions}) · Bare Space` : `(${s.dimensions})`}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {s.sizeSqM} m² · {s.block}
                          </div>
                          <div className="text-xs font-mono font-bold text-[#15803D] mt-1">
                            NPR {s.priceNPR.toLocaleString()}
                            <span className="text-[10px] font-normal text-slate-500 ml-1">
                              (${s.priceUSD.toLocaleString()})
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleStallSelection(s.number)}
                          className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-500 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                          title="Remove stall"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 rounded-xl bg-white/80 border border-dashed border-emerald-300 text-center space-y-1.5">
                      <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                        <MapPin className="w-3.5 h-3.5" />
                      </div>
                      <p className="text-xs font-semibold text-slate-700">No Stall Selected</p>
                      <p className="text-[10px] text-slate-500 leading-relaxed">
                        Click on any stall on the map to view its price &amp; select it.
                      </p>
                    </div>
                  )}
                </div>

                {/* Subtotal & Area Metrics */}
                {selectedStallObjects.length > 0 && (
                  <div className="pt-2.5 border-t border-emerald-200 space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Total Area:</span>
                      <span className="font-mono font-bold text-slate-900">
                        {totalAreaSqM} m² ({(totalAreaSqM * 10.76).toFixed(0)} sq.ft)
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Power:</span>
                      <span className="font-mono font-medium text-slate-900">
                        {selectedStallObjects.some((s) => s.isBareSpace) ? "Direct Power Provision" : "15A Included"}
                      </span>
                    </div>
                    {selectedStallObjects.some((s) => s.isBareSpace) && (
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Space Type:</span>
                        <span className="font-semibold text-slate-900">
                          {selectedStallObjects.every((s) => s.isBareSpace)
                            ? "Bare Space (Raw Area)"
                            : "Includes Bare Space"}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Total Tariff Box */}
                <div className="p-3.5 rounded-xl bg-white border-2 border-emerald-400 shadow-xs space-y-1">
                  <div className="text-[10px] font-mono text-emerald-800 uppercase font-bold tracking-wider">
                    {isSponsorPackage ? "TOTAL SPONSORSHIP INVESTMENT" : "TOTAL INVESTMENT TARIFF"}
                  </div>
                  <div className="flex items-baseline justify-between flex-wrap gap-1">
                    <div className="text-xl font-bold font-mono text-[#15803D]">
                      NPR {finalPriceNPR.toLocaleString()}
                    </div>
                    <div className="text-xs font-mono font-bold text-slate-600">
                      USD ${finalPriceUSD.toLocaleString()}
                    </div>
                  </div>
                  {isSponsorPackage && (
                    <p className="text-[10px] text-emerald-800 font-medium pt-0.5 leading-tight">
                      Includes {selectedPackage?.spaceDescription}
                    </p>
                  )}
                </div>

                {/* Primary Action Button */}
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={selectedBoothNumbers.length === 0}
                  className={`w-full py-3 px-4 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md ${
                    selectedBoothNumbers.length === 0
                      ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                      : "bg-[#218A59] hover:bg-[#186a43] text-white hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                  }`}
                >
                  <span>
                    {selectedBoothNumbers.length === 0
                      ? "SELECT STALL TO CONTINUE"
                      : `CONTINUE (${selectedBoothNumbers.length} STALL${selectedBoothNumbers.length > 1 ? "S" : ""}) →`}
                  </span>
                </button>

                {/* Assistance Note */}
                <div className="pt-2 border-t border-emerald-200 text-[10px] text-slate-600 space-y-1">
                  <div className="font-bold text-slate-800">Need Assistance?</div>
                  <div className="flex items-center gap-1 text-emerald-800 font-mono">
                    <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>+977-9703606348 | 9703606345</span>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-800 font-mono">
                    <Mail className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>info@nepalenergyexpo.com</span>
                  </div>
                </div>
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
              Provide company metadata for listing in the official 2027 Expo Directory, exhibitor badges, and pro-forma invoice.
            </p>
          </div>

          {/* Exhibitor Classification: Domestic vs International */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-mono text-slate-700 font-bold uppercase tracking-wider">
                ARE YOU A DOMESTIC OR INTERNATIONAL EXHIBITOR? *
              </label>
              <span className="text-[11px] font-mono text-slate-500 font-medium">
                Select your company origin
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Domestic */}
              <button
                type="button"
                onClick={() => {
                  setExhibitorOrigin("domestic");
                  setFormData((prev) => ({
                    ...prev,
                    country: prev.country === "" || prev.country.toLowerCase() !== "nepal" ? "Nepal" : prev.country,
                  }));
                }}
                className={`p-4 rounded-xl border-2 text-left transition-all flex items-start gap-3 cursor-pointer ${
                  exhibitorOrigin === "domestic"
                    ? "border-[#10B981] bg-emerald-50/50 shadow-xs ring-2 ring-[#10B981]/20"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="text-2xl shrink-0">🇳🇵</div>
                <div className="space-y-1">
                  <div className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-2">
                    <span>Domestic Exhibitor</span>
                    <span className="text-[10px] font-mono font-bold text-[#047857] bg-emerald-100 px-2 py-0.5 rounded-md">
                      Nepal
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-normal leading-relaxed">
                    Companies registered in Nepal. Payments settled in NPR via Khalti, Fonepay QR, or Local Bank Wire.
                  </p>
                </div>
              </button>

              {/* International */}
              <button
                type="button"
                onClick={() => {
                  setExhibitorOrigin("international");
                  setPaymentMethod("bank");
                  setFormData((prev) => ({
                    ...prev,
                    country: prev.country === "Nepal" ? "" : prev.country,
                  }));
                }}
                className={`p-4 rounded-xl border-2 text-left transition-all flex items-start gap-3 cursor-pointer ${
                  exhibitorOrigin === "international"
                    ? "border-sky-500 bg-sky-50/50 shadow-xs ring-2 ring-sky-500/20"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="text-2xl shrink-0">🌐</div>
                <div className="space-y-1">
                  <div className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-2">
                    <span>International Exhibitor</span>
                    <span className="text-[10px] font-mono font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-md">
                      Overseas / Global
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-normal leading-relaxed">
                    Overseas enterprises, foreign OEMs & delegations. Invoiced in USD with SWIFT bank wire remittance.
                  </p>
                </div>
              </button>
            </div>

            {/* International Gateway Notice */}
            {exhibitorOrigin === "international" && (
              <div className="mt-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <span className="font-bold text-amber-950 block text-xs">
                    Notice: International Online Payment Gateway Under Construction
                  </span>
                  <p className="text-[11px] text-amber-800 leading-relaxed font-normal">
                    Our direct international online credit card payment gateway (Visa / Mastercard) is currently under scheduled development. International exhibitors will be issued an <strong>Official Pro-Forma Invoice</strong> with <strong>SWIFT wire transfer</strong> details upon booking to provisionally lock stalls immediately.
                  </p>
                </div>
              </div>
            )}
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
                COUNTRY OF ORIGIN {exhibitorOrigin === "international" ? "*" : ""}
              </label>
              <input
                type="text"
                required={exhibitorOrigin === "international"}
                placeholder={
                  exhibitorOrigin === "international"
                    ? "e.g. India / Germany / Austria / China / USA"
                    : "e.g. Nepal"
                }
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className={`w-full p-3 rounded-xl bg-white border text-slate-900 text-xs focus:outline-none focus:border-[#10B981] shadow-xs ${
                  exhibitorOrigin === "international" && (!formData.country || formData.country.toLowerCase() === "nepal")
                    ? "border-amber-300 bg-amber-50/20"
                    : "border-slate-300"
                }`}
              />
              {exhibitorOrigin === "international" && (!formData.country || formData.country.toLowerCase() === "nepal") && (
                <span className="text-[10px] font-mono text-amber-700 mt-1 block">
                  Please specify your foreign country (e.g. India, Germany, China, Austria).
                </span>
              )}
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
                <option value="Other">Other</option>
              </select>
              {formData.industryCategory === "Other" && (
                <div className="mt-2">
                  <input
                    type="text"
                    placeholder="Specify your industry sector..."
                    value={customIndustry}
                    onChange={(e) => setCustomIndustry(e.target.value)}
                    className="w-full p-3 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-[#10B981] shadow-xs"
                    required
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 3: PAYMENT GATEWAY SELECTION & REVIEW
         ========================================================================= */}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <h3 className="font-sans font-bold text-2xl text-slate-900">
              Step 3: Select Payment Method & Finalize Booking
            </h3>
            <p className="text-xs text-slate-600 font-normal mt-1">
              {exhibitorOrigin === "international"
                ? "Finalize your international stall reservation with an official SWIFT pro-forma invoice in USD."
                : "Choose your preferred payment gateway from Nepal (Khalti, Fonepay) or request an official Bank Wire Invoice."}
            </p>
          </div>

          {/* International Gateway Notice */}
          {exhibitorOrigin === "international" && (
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex items-start gap-3.5 shadow-xs">
              <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800 shrink-0 mt-0.5">
                <Globe className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-bold text-sm text-amber-950 font-sans">
                    International Online Payment Gateway Under Construction
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-bold uppercase tracking-wider">
                    Under Integration
                  </span>
                </div>
                <p className="text-xs text-amber-900/90 leading-relaxed font-normal">
                  Our automated international credit/debit card payment gateway (Visa / Mastercard) is currently under scheduled development.
                  International bookings are confirmed with an <strong>Official Pro-Forma Invoice & SWIFT Wire Transfer</strong>.
                  Selecting <strong>Bank Wire / SWIFT</strong> below will immediately lock your booth reservation in USD, and our secretariat will issue your stamp-sealed pro-forma invoice with banking coordinates.
                </p>
              </div>
            </div>
          )}

          {/* Booking Summary Box */}
          <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-slate-200 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">ALLOCATED STALLS</span>
                <div className="font-sans font-bold text-lg text-[#218A59]">
                  STALL {selectedBoothNumbers.join(", ")}
                </div>
                <span className="text-[11px] text-slate-600">
                  {totalAreaSqM}m² {selectedStallObjects.some((s) => s.isBareSpace) ? "(Bare Space)" : ""}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">EXHIBITOR ENTITY</span>
                <div className="font-sans font-bold text-base text-slate-900 flex items-center gap-1.5">
                  <span>{formData.companyName || "Organization"}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                    exhibitorOrigin === "international"
                      ? "bg-sky-100 text-sky-800"
                      : "bg-emerald-100 text-emerald-800"
                  }`}>
                    {exhibitorOrigin === "international" ? "International" : "Domestic"}
                  </span>
                </div>
                <span className="text-[11px] text-slate-600">
                  {formData.contactPerson} ({formData.country})
                </span>
              </div>

              <div>
                <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">TOTAL INVESTMENT</span>
                <div className="font-sans font-bold text-xl text-[#15803D]">
                  {exhibitorOrigin === "international"
                    ? `USD $${finalPriceUSD.toLocaleString()}`
                    : `NPR ${finalPriceNPR.toLocaleString()}`}
                </div>
                <span className="text-[11px] text-slate-600 font-mono">
                  {exhibitorOrigin === "international"
                    ? `(~ NPR ${finalPriceNPR.toLocaleString()})`
                    : `USD $${finalPriceUSD.toLocaleString()}`}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 text-xs text-slate-700 flex flex-wrap items-center justify-between gap-2">
              {selectedPackage && selectedPackage.id !== "custom-selection" && (
                <div>
                  <strong>Package Tier:</strong> {selectedPackage.name} ({selectedPackage.spaceDescription})
                </div>
              )}
              <div>
                <strong>Industry Sector:</strong>{" "}
                {formData.industryCategory === "Other"
                  ? customIndustry || "Other"
                  : formData.industryCategory}
              </div>
              <div>
                <strong>Official Email:</strong> {formData.email}
              </div>
              <div>
                <strong>Contact:</strong> {formData.phone}
              </div>
            </div>
          </div>

          {/* Payment Gateway Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-mono text-slate-700 font-bold uppercase">
                SELECT PAYMENT GATEWAY
              </label>
              <div className="flex items-center gap-1.5 text-[11px] font-mono">
                <span className="text-slate-500">Exhibitor:</span>
                <button
                  type="button"
                  onClick={() => {
                    const next = exhibitorOrigin === "international" ? "domestic" : "international";
                    setExhibitorOrigin(next);
                    if (next === "international") setPaymentMethod("bank");
                  }}
                  className="font-bold text-sky-600 hover:text-sky-700 underline cursor-pointer"
                >
                  {exhibitorOrigin === "international" ? "Switch to Domestic (NPR)" : "Switch to International (USD)"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Option 1: Khalti */}
              <div
                onClick={() => setPaymentMethod("khalti")}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                  paymentMethod === "khalti"
                    ? "border-[#5D2E8E] bg-[#5D2E8E]/5 shadow-md ring-2 ring-[#5D2E8E]/20"
                    : "border-slate-200 bg-white hover:border-slate-300"
                } ${exhibitorOrigin === "international" ? "opacity-75" : ""}`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="px-2.5 py-1 rounded-lg bg-[#5D2E8E] text-white font-mono text-[10px] font-bold">
                        KHALTI
                      </div>
                      {exhibitorOrigin === "international" && (
                        <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          Nepal Only
                        </span>
                      )}
                    </div>
                    {paymentMethod === "khalti" && (
                      <CheckCircle2 className="w-5 h-5 text-[#5D2E8E]" />
                    )}
                  </div>
                  <h4 className="font-sans font-bold text-base text-slate-900">
                    Khalti ePayment API v2
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {exhibitorOrigin === "international"
                      ? "For Nepalese domestic entities. Requires Khalti Wallet, SCT cards, or Nepal eBanking (not foreign cards)."
                      : "Instant checkout via Khalti Mobile Wallet, SCT Cards, eBanking & ConnectIPS."}
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
                } ${exhibitorOrigin === "international" ? "opacity-75" : ""}`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="px-2.5 py-1 rounded-lg bg-[#D92525] text-white font-mono text-[10px] font-bold">
                        FONEPAY
                      </div>
                      {exhibitorOrigin === "international" && (
                        <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          Nepal Only
                        </span>
                      )}
                    </div>
                    {paymentMethod === "fonepay" && (
                      <CheckCircle2 className="w-5 h-5 text-[#D92525]" />
                    )}
                  </div>
                  <h4 className="font-sans font-bold text-base text-slate-900">
                    Fonepay Direct QR
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {exhibitorOrigin === "international"
                      ? "For Nepalese entities. Requires Nepalese commercial bank mobile banking QR (not foreign apps)."
                      : "Scan dynamic QR or pay directly from 50+ Nepalese commercial bank mobile apps."}
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
                    ? exhibitorOrigin === "international"
                      ? "border-sky-600 bg-sky-50/40 shadow-md ring-2 ring-sky-500/20"
                      : "border-[#218A59] bg-[#218A59]/5 shadow-md ring-2 ring-[#218A59]/20"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className={`px-2.5 py-1 rounded-lg text-white font-mono text-[10px] font-bold ${
                        exhibitorOrigin === "international" ? "bg-sky-600" : "bg-[#218A59]"
                      }`}>
                        {exhibitorOrigin === "international" ? "SWIFT WIRE" : "BANK WIRE"}
                      </div>
                      {exhibitorOrigin === "international" && (
                        <span className="text-[10px] font-mono text-sky-800 bg-sky-100 font-bold px-1.5 py-0.5 rounded">
                          Recommended
                        </span>
                      )}
                    </div>
                    {paymentMethod === "bank" && (
                      <CheckCircle2 className={`w-5 h-5 ${
                        exhibitorOrigin === "international" ? "text-sky-600" : "text-[#218A59]"
                      }`} />
                    )}
                  </div>
                  <h4 className="font-sans font-bold text-base text-slate-900">
                    {exhibitorOrigin === "international"
                      ? "International SWIFT Remittance"
                      : "Bank Remittance / Invoice"}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {exhibitorOrigin === "international"
                      ? "Lock stall allocation instantly. Pay in USD via SWIFT wire remittance directly to IPPAN official foreign currency account."
                      : "Lock stall provisionally and remit via SWIFT / RTGS directly to IPPAN account."}
                  </p>
                </div>
                <div className={`mt-4 pt-3 border-t border-slate-100 flex items-center gap-1 text-[11px] font-mono font-bold ${
                  exhibitorOrigin === "international" ? "text-sky-700" : "text-[#218A59]"
                }`}>
                  <Landmark className="w-3.5 h-3.5" />
                  <span>{exhibitorOrigin === "international" ? "Official USD Pro-Forma Invoice" : "Official Pro-Forma Invoice"}</span>
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
              I agree to the <strong>HIGEX 2027 Exhibition Regulations and stall allocation terms</strong>, and acknowledge that stall confirmation is subject to successful payment receipt verification.
            </label>
          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 4: SUCCESS CONFIRMATION
         ========================================================================= */}
      {step === 4 && (
        <div className="text-center py-8 space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-300 text-[#059669] flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="font-mono text-xs text-[#059669] tracking-widest uppercase font-bold">
              STALL RESERVATION SUBMITTED
            </span>
            <h3 className="font-sans font-bold text-3xl text-slate-900 mt-1">
              Thank You, {formData.companyName || "Exhibitor"}!
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 font-normal mt-2 max-w-md mx-auto leading-relaxed">
              Your provisional booking for <strong>STALL {selectedBoothNumbers.join(", ")}</strong> has been received. Our exhibition team will issue your formal pro-forma invoice and exhibitor kit within 24 hours.
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
              disabled={isSubmitting || (step === 1 && selectedBoothNumbers.length === 0)}
              className={`px-8 py-3.5 rounded-full font-mono text-xs font-bold tracking-wider shadow-md transition-all flex items-center gap-2 text-white ${
                isSubmitting || (step === 1 && selectedBoothNumbers.length === 0)
                  ? "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none"
                  : paymentMethod === "khalti" && step === 3
                  ? "bg-[#5D2E8E] hover:bg-[#482370] cursor-pointer"
                  : paymentMethod === "fonepay" && step === 3
                  ? "bg-[#D92525] hover:bg-[#b01c1c] cursor-pointer"
                  : exhibitorOrigin === "international" && step === 3
                  ? "bg-sky-600 hover:bg-sky-700 cursor-pointer"
                  : "bg-[#218A59] hover:bg-[#186a43] cursor-pointer"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>PROCESSING RESERVATION...</span>
                </>
              ) : (
                <>
                  <span>
                    {step === 1 && selectedBoothNumbers.length === 0
                      ? "SELECT A STALL TO CONTINUE"
                      : step === 3
                      ? paymentMethod === "bank"
                        ? exhibitorOrigin === "international"
                          ? `LOCK STALL & GENERATE SWIFT INVOICE (USD $${finalPriceUSD.toLocaleString()})`
                          : "CONFIRM RESERVATION & GENERATE INVOICE"
                        : `PAY WITH ${paymentMethod.toUpperCase()} (NPR ${finalPriceNPR.toLocaleString()})`
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
