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
  MessageSquare,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Trash2,
  Info,
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
    priceNPR: 3500000,
    priceUSD: 25000,
    priceDisplayNPR: "NPR 35,00,000",
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
    priceNPR: 2700000,
    priceUSD: 20000,
    priceDisplayNPR: "NPR 27,00,000",
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
    priceNPR: 650000,
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

  // Automatically enforce SWIFT bank transfer for international exhibitors so they are never redirected to Khalti
  useEffect(() => {
    if (exhibitorOrigin === "international") {
      setPaymentMethod("bank");
    }
  }, [exhibitorOrigin]);

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
  const [showAllSelectedStalls, setShowAllSelectedStalls] = useState<boolean>(false);
  const [perksModalPackageId, setPerksModalPackageId] = useState<string | null>(null);

  const [bookingRef, setBookingRef] = useState<string>("");

  // Load custom elements configured from Admin Floor Plan Studio & overrides
  const [elements, setElements] = useState<any[]>(
    (savedFloorPlanFallback as any).elements || []
  );
  const [boothOverrides, setBoothOverrides] = useState<Record<string, any>>({});

  useEffect(() => {
    async function loadAdminFloorPlan() {
      try {
        const [res, adminRes] = await Promise.all([
          fetch(`/api/floor-plan/save?t=${Date.now()}`, { cache: "no-store" }),
          fetch(`/api/admin/data?t=${Date.now()}`, { cache: "no-store" }).catch(() => null),
        ]);
        const json = await res.json();
        if (json.success && json.data?.elements && Array.isArray(json.data.elements) && json.data.elements.length > 0) {
          setElements(json.data.elements);
        }
        if (adminRes && adminRes.ok) {
          const adminJson = await adminRes.json();
          if (adminJson?.data?.boothOverrides) {
            setBoothOverrides(adminJson.data.boothOverrides);
          }
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

    const override =
      boothOverrides[cleanNum] ||
      boothOverrides[number?.toLowerCase()] ||
      (custom?.id && boothOverrides[custom.id]);

    let priceNPR = 180000;
    if (override?.priceNPR !== undefined && override?.priceNPR !== null && !isNaN(Number(override.priceNPR))) {
      priceNPR = Number(override.priceNPR);
    } else if (custom?.priceNPR !== undefined && custom?.priceNPR !== null && !isNaN(Number(custom.priceNPR))) {
      priceNPR = Number(custom.priceNPR);
    } else if (official?.priceNPR !== undefined && !isNaN(Number(official.priceNPR))) {
      priceNPR = Number(official.priceNPR);
    } else if (fallback?.priceNPR !== undefined && !isNaN(Number(fallback.priceNPR))) {
      priceNPR = Number(fallback.priceNPR);
    }

    let priceUSD = 1350;
    if (override?.priceUSD !== undefined && override?.priceUSD !== null && !isNaN(Number(override.priceUSD))) {
      priceUSD = Number(override.priceUSD);
    } else if (custom?.priceUSD !== undefined && custom?.priceUSD !== null && !isNaN(Number(custom.priceUSD))) {
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

  // 13% Government VAT
  const vatRate = 0.13;
  const vatNPR = Math.round(finalPriceNPR * vatRate);
  const vatUSD = Math.round(finalPriceUSD * vatRate);
  const totalWithVatNPR = finalPriceNPR + vatNPR;
  const totalWithVatUSD = finalPriceUSD + vatUSD;

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
            amountNPR: totalWithVatNPR,
            amountUSD: totalWithVatUSD,
            baseAmountNPR: finalPriceNPR,
            baseAmountUSD: finalPriceUSD,
            vatNPR,
            vatUSD,
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
            paymentMethod: exhibitorOrigin === "international" ? "bank" : paymentMethod,
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Failed to initialize booking and payment.");
        }

        // For international exhibitors, always route to official invoice success page, never external gateways
        if (exhibitorOrigin === "international") {
          if (data.redirectUrl) {
            router.push(data.redirectUrl);
            return;
          }
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
          setStep(4);
          return;
        }

        // If redirect URL returned (Khalti or Fonepay gateway redirect for domestic)
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
                  ? exhibitorOrigin === "international"
                    ? "REVIEW & RESERVE"
                    : "PAYMENT & REVIEW"
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
              PARTICIPATION PACKAGE & STALL SELECTOR (COLOR ACCENTED DESIGN)
             ========================================================================= */}
          <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-b from-slate-50 via-emerald-50/20 to-slate-50/80 border border-emerald-100 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-mono font-bold text-emerald-800 uppercase tracking-wider block mb-0.5">
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
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition-colors cursor-pointer ${viewMode === "map"
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
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition-colors cursor-pointer ${viewMode === "list"
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
                    className={`px-3 py-1.5 rounded-lg text-xs transition-colors shrink-0 cursor-pointer flex items-center gap-1.5 ${isActive
                      ? "bg-white text-slate-900 border border-emerald-300 shadow-2xs font-semibold"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/70 font-medium"
                      }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive
                        ? "bg-emerald-100 text-emerald-800 font-mono font-bold"
                        : "bg-slate-200/60 text-slate-500"
                        }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* ─── 1. PRIME FLAGSHIP: TITLE SPONSOR (Amber/Gold Rich BG) ─── */}
            {(packageFilter === "all" || packageFilter === "sponsor") && (() => {
              const pkg = PARTICIPATION_PACKAGES.find((p) => p.id === "title-sponsor")!;
              const isSelected = selectedPackageId === pkg.id;
              return (
                <div
                  onClick={() => selectPackage(pkg.id)}
                  className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden ${isSelected
                    ? "bg-gradient-to-r from-amber-100 via-amber-50 to-amber-100/70 border-amber-500 ring-2 ring-amber-400/40 shadow-md"
                    : "bg-gradient-to-r from-amber-50 via-amber-50/50 to-yellow-50/40 border-amber-300 hover:border-amber-400 hover:shadow-xs"
                    }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-4 h-4 mt-0.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${isSelected ? "border-amber-700 bg-amber-500" : "border-amber-400 bg-white"
                          }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-sans font-bold text-base text-slate-900">
                            {pkg.name}
                          </h4>
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 shadow-2xs">
                            <Sparkles className="w-2.5 h-2.5" />
                            <span>PRIME FLAGSHIP</span>
                          </span>
                        </div>

                        <p className="text-xs text-amber-950/80 font-medium">
                          {pkg.spaceDescription}
                        </p>

                        {/* Perks Inclusions */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                          {pkg.perks.slice(0, 3).map((perk, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-white/80 text-amber-950 border border-amber-200/90 font-medium"
                            >
                              <Check className="w-2.5 h-2.5 text-amber-700 shrink-0" />
                              <span>{perk}</span>
                            </span>
                          ))}
                          {pkg.perks.length > 3 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPerksModalPackageId(pkg.id);
                              }}
                              className="text-[10px] font-mono font-bold text-amber-900 hover:underline cursor-pointer ml-1"
                            >
                              +{pkg.perks.length - 3} more perks &rarr;
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-left md:text-right shrink-0 pl-7 md:pl-0 pt-2 md:pt-0 border-t md:border-t-0 border-amber-200/60">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-amber-800 font-bold mb-0.5">
                        Flagship Investment
                      </div>
                      <div className="font-mono font-bold text-lg text-amber-950">
                        {pkg.priceDisplayNPR}
                      </div>
                      <div className="font-mono text-xs text-amber-800/80">
                        {pkg.priceDisplayUSD}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* ─── 2. SPONSORSHIP TIERS TABLE (With Distinct Colorful Row Backgrounds) ─── */}
            {(packageFilter === "all" || packageFilter === "sponsor") && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                    Sponsorship Partnerships
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    6 Available Tiers
                  </span>
                </div>

                <div className="rounded-xl border border-slate-200/90 overflow-hidden divide-y divide-slate-100 bg-white shadow-2xs">
                  {PARTICIPATION_PACKAGES.filter(
                    (p) => p.type === "sponsor" && p.id !== "title-sponsor"
                  ).map((pkg) => {
                    const isSelected = selectedPackageId === pkg.id;

                    // Distinct theme color per sponsorship tier
                    const tierStyles: Record<string, { bg: string; selectedBg: string; border: string; badge: string; text: string }> = {
                      "in-association-with": {
                        bg: "bg-emerald-50/40 hover:bg-emerald-50/70",
                        selectedBg: "bg-emerald-100/70",
                        border: "border-emerald-300",
                        badge: "bg-emerald-100 text-emerald-900 border-emerald-300",
                        text: "text-emerald-900",
                      },
                      "powered-by": {
                        bg: "bg-teal-50/40 hover:bg-teal-50/70",
                        selectedBg: "bg-teal-100/70",
                        border: "border-teal-300",
                        badge: "bg-teal-100 text-teal-900 border-teal-300",
                        text: "text-teal-900",
                      },
                      "sponsor": {
                        bg: "bg-sky-50/40 hover:bg-sky-50/70",
                        selectedBg: "bg-sky-100/70",
                        border: "border-sky-300",
                        badge: "bg-sky-100 text-sky-900 border-sky-300",
                        text: "text-sky-900",
                      },
                      "official-partner": {
                        bg: "bg-blue-50/40 hover:bg-blue-50/70",
                        selectedBg: "bg-blue-100/70",
                        border: "border-blue-300",
                        badge: "bg-blue-100 text-blue-900 border-blue-300",
                        text: "text-blue-900",
                      },
                      "co-sponsor": {
                        bg: "bg-indigo-50/40 hover:bg-indigo-50/70",
                        selectedBg: "bg-indigo-100/70",
                        border: "border-indigo-300",
                        badge: "bg-indigo-100 text-indigo-900 border-indigo-300",
                        text: "text-indigo-900",
                      },
                      "supporter": {
                        bg: "bg-purple-50/40 hover:bg-purple-50/70",
                        selectedBg: "bg-purple-100/70",
                        border: "border-purple-300",
                        badge: "bg-purple-100 text-purple-900 border-purple-300",
                        text: "text-purple-900",
                      },
                    };

                    const style = tierStyles[pkg.id] || {
                      bg: "hover:bg-slate-50/80",
                      selectedBg: "bg-emerald-50/70",
                      border: "border-slate-200",
                      badge: "bg-slate-100 text-slate-700 border-slate-200",
                      text: "text-slate-900",
                    };

                    return (
                      <div
                        key={pkg.id}
                        onClick={() => selectPackage(pkg.id)}
                        className={`px-4 py-3 flex items-center justify-between gap-3 cursor-pointer transition-colors ${isSelected ? style.selectedBg : style.bg
                          }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${isSelected
                              ? "border-[#218A59] bg-[#218A59]"
                              : "border-slate-300 bg-white"
                              }`}
                          >
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 text-xs sm:text-sm">
                                {pkg.name}
                              </span>
                              {pkg.badge && (
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border hidden sm:inline ${style.badge}`}>
                                  {pkg.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-600 truncate">
                              {pkg.spaceDescription}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPerksModalPackageId(pkg.id);
                            }}
                            className="text-[11px] font-semibold text-emerald-800 hover:text-emerald-950 hover:underline cursor-pointer hidden md:flex items-center gap-1"
                          >
                            <span>{pkg.perks.length} Perks</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>

                          <div className="text-right">
                            <div className="font-mono font-bold text-xs sm:text-sm text-slate-900">
                              {pkg.priceDisplayNPR}
                            </div>
                            <div className="font-mono text-[10px] text-slate-500">
                              {pkg.priceDisplayUSD}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ─── 3. EXHIBITION STALL PACKAGES (Side by Side) ─── */}
            {(packageFilter === "all" || packageFilter === "stall") && (
              <div className="space-y-1.5">
                <div className="px-1">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                    Standard Exhibition Stalls
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PARTICIPATION_PACKAGES.filter((p) => p.type === "stall").map((pkg) => {
                    const isSelected = selectedPackageId === pkg.id;
                    return (
                      <div
                        key={pkg.id}
                        onClick={() => selectPackage(pkg.id)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between gap-3 ${isSelected
                          ? "bg-white border-[#218A59] ring-2 ring-[#218A59]/20 shadow-xs"
                          : "bg-white border-slate-200/90 hover:border-slate-300"
                          }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${isSelected
                                  ? "border-[#218A59] bg-[#218A59]"
                                  : "border-slate-300 bg-white"
                                  }`}
                              >
                                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                              </div>
                              <span className="font-bold text-slate-900 text-sm">
                                {pkg.name}
                              </span>
                            </div>
                            {pkg.badge && (
                              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                                {pkg.badge}
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-500 pl-6 mb-2">
                            {pkg.spaceDescription}
                          </p>

                          <div className="pl-6 flex flex-wrap gap-1">
                            {pkg.perks.map((perk, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-slate-50 text-slate-700 border border-slate-200/70 font-medium"
                              >
                                <Check className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                                <span>{perk}</span>
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 pl-6 flex items-baseline justify-between font-mono text-xs">
                          <span className="text-[10px] text-slate-400 uppercase">Tariff Range</span>
                          <div className="text-right">
                            <span className="font-bold text-slate-900">{pkg.priceDisplayNPR}</span>
                            {pkg.priceDisplayUSD && pkg.priceNPR > 0 && (
                              <span className="text-slate-400 text-[10px] ml-1">· {pkg.priceDisplayUSD}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ─── 4. CUSTOM SELECTION ROW ─── */}
            {(packageFilter === "all" || packageFilter === "custom") && (() => {
              const pkg = PARTICIPATION_PACKAGES.find((p) => p.id === "custom-selection")!;
              const isSelected = selectedPackageId === pkg.id;
              return (
                <div
                  onClick={() => selectPackage(pkg.id)}
                  className={`px-4 py-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${isSelected
                    ? "bg-white border-[#218A59] ring-2 ring-[#218A59]/20 shadow-xs"
                    : "bg-white border-slate-200/90 hover:border-slate-300"
                    }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? "border-[#218A59] bg-[#218A59]" : "border-slate-300 bg-white"
                        }`}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 text-sm">Custom Map Selection</span>
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                          Interactive
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Choose any stall directly on the interactive floor plan below
                      </p>
                    </div>
                  </div>

                  <div className="font-mono text-xs text-slate-500 shrink-0">
                    Per Stall
                  </div>
                </div>
              );
            })()}

            {/* ─── ACTIVE PACKAGE NOTIFICATION BAR ─── */}
            {selectedPackage && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full shrink-0 ${selectedPackage.id === "title-sponsor" ? "bg-amber-500" : "bg-[#218A59]"
                      }`}
                  />
                  <span className="text-slate-700">
                    <strong className="text-slate-900">{selectedPackage.name}</strong> selected.
                    {selectedPackage.id === "custom-selection" ? (
                      <span className="text-slate-500 ml-1">
                        Pick stalls on the interactive floor plan below.
                      </span>
                    ) : (
                      <span>
                        {" "}Assigned:{" "}
                        <strong className="font-mono text-[#15803D]">
                          {selectedBoothNumbers.length > 0
                            ? `STALL ${selectedBoothNumbers.join(", ")}`
                            : "Assigning..."}
                        </strong>
                        {isCustomizedOnMap && (
                          <button
                            type="button"
                            onClick={() => selectPackage(selectedPackage.id)}
                            className="ml-2 text-slate-500 hover:text-slate-800 hover:underline font-medium cursor-pointer inline-flex items-center gap-1"
                          >
                            <RotateCcw className="w-3 h-3" />
                            Reset recommended
                          </button>
                        )}
                      </span>
                    )}
                  </span>
                </div>

                {selectedPackage.perks && selectedPackage.perks.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setPerksModalPackageId(selectedPackage.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-800 font-medium text-[11px] transition-colors cursor-pointer shrink-0"
                  >
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>View {selectedPackage.perks.length} Perks</span>
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
                          className={`p-3 rounded-xl border text-left text-xs font-mono transition-all cursor-pointer ${isSelected
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

            {/* Right: Clean, Calm & Structured Booking Summary Sidebar */}
            <div className="lg:col-span-4 xl:col-span-3 lg:sticky lg:top-24 space-y-3.5">
              <div className="rounded-2xl bg-white border border-slate-200/90 shadow-sm overflow-hidden divide-y divide-slate-100">
                {/* Header */}
                <div className="px-5 py-4 bg-slate-50/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-500 block">
                      Booking Summary
                    </span>
                    <h4 className="font-sans font-bold text-sm text-slate-900 mt-0.5">
                      Allocation &amp; Tariff
                    </h4>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[#15803D] font-mono text-xs font-semibold shrink-0">
                    {selectedBoothNumbers.length} {selectedBoothNumbers.length === 1 ? "Stall" : "Stalls"}
                  </span>
                </div>

                {/* Section 1: Selected Stalls List */}
                <div className="p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400">
                      Allocated Stalls ({selectedStallObjects.length})
                    </span>
                    {selectedStallObjects.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setSelectedBoothNumbers([])}
                        className="text-[11px] font-medium text-slate-400 hover:text-red-600 transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Clear All</span>
                      </button>
                    )}
                  </div>

                  {selectedStallObjects.length > 0 ? (
                    <div className="space-y-2">
                      {/* Show first 2 stalls by default, collapse remaining if > 2 */}
                      {(showAllSelectedStalls
                        ? selectedStallObjects
                        : selectedStallObjects.slice(0, 2)
                      ).map((s) => (
                        <div
                          key={s.number}
                          className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-all text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="font-mono font-bold text-slate-900">
                                {s.displayName}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                ({s.block})
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => toggleStallSelection(s.number)}
                              className="w-5 h-5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-500 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                              title="Remove stall"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="flex items-baseline justify-between mt-1 text-[11px] text-slate-500">
                            <span>
                              {s.dimensions} · {s.sizeSqM} m²
                            </span>
                            <span className="font-mono font-semibold text-slate-800">
                              NPR {s.priceNPR.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}

                      {/* Expand / Collapse toggle when > 2 stalls */}
                      {selectedStallObjects.length > 2 && (
                        <button
                          type="button"
                          onClick={() => setShowAllSelectedStalls(!showAllSelectedStalls)}
                          className="w-full py-1.5 px-3 rounded-lg bg-slate-100/80 hover:bg-slate-200/70 text-slate-600 font-sans text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          {showAllSelectedStalls ? (
                            <>
                              <span>Show Less</span>
                              <ChevronUp className="w-3.5 h-3.5" />
                            </>
                          ) : (
                            <>
                              <span>+ {selectedStallObjects.length - 2} More Stalls</span>
                              <ChevronDown className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="py-6 px-4 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-1">
                      <p className="text-xs font-semibold text-slate-600">No Stall Selected</p>
                      <p className="text-[11px] text-slate-400">
                        Click any booth on the floor plan to select.
                      </p>
                    </div>
                  )}
                </div>

                {/* Section 2: Technical Specs (Only shown when stalls selected) */}
                {selectedStallObjects.length > 0 && (
                  <div className="p-4 sm:p-5 space-y-2.5 bg-slate-50/40">
                    <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400 block">
                      Specifications Summary
                    </span>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 text-[10px] block font-mono">TOTAL AREA</span>
                        <span className="font-mono font-semibold text-slate-800 text-xs">
                          {totalAreaSqM} m²{" "}
                          <span className="text-[10px] text-slate-500">
                            ({(totalAreaSqM * 10.76).toFixed(0)} sq.ft)
                          </span>
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block font-mono">POWER PROVISION</span>
                        <span className="font-sans font-medium text-slate-800 text-xs">
                          {selectedStallObjects.some((s) => s.isBareSpace) ? "Direct Power" : "15A Socket"}
                        </span>
                      </div>
                      <div className="col-span-2 pt-1 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-mono text-[10px]">SPACE SCHEME:</span>
                        <span className="font-medium text-slate-700 text-[11px]">
                          {selectedStallObjects.every((s) => s.isBareSpace)
                            ? "Bare Space (Raw Area)"
                            : selectedStallObjects.some((s) => s.isBareSpace)
                              ? "Mixed (Bare & Shell)"
                              : "Shell Scheme (Octanorm)"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Section 3: Financial Tariff Breakdown */}
                <div className="p-4 sm:p-5 space-y-3.5 bg-white">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400">
                      Payment Ledger
                    </span>
                    <span className="text-[9px] font-mono font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      13% VAT INCL.
                    </span>
                  </div>

                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Base Stall Tariff</span>
                      <div className="text-right">
                        <span className="font-semibold text-slate-800">
                          NPR {finalPriceNPR.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          (${finalPriceUSD.toLocaleString()})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span>Govt. 13% VAT</span>
                      <div className="text-right">
                        <span className="font-semibold text-slate-800">
                          + NPR {vatNPR.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          (+${vatUSD.toLocaleString()})
                        </span>
                      </div>
                    </div>

                    {/* Total Grand Row */}
                    <div className="pt-3 border-t border-slate-200 flex items-baseline justify-between">
                      <div>
                        <span className="font-sans font-bold text-xs text-slate-900 block">
                          Total Payable
                        </span>
                        <span className="text-[10px] text-slate-400 font-sans block">
                          All taxes included
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold font-mono text-[#15803D]">
                          NPR {totalWithVatNPR.toLocaleString()}
                        </div>
                        <div className="text-xs font-mono text-slate-500">
                          USD ${totalWithVatUSD.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {isSponsorPackage && (
                    <p className="text-[11px] text-emerald-800 font-medium pt-1.5 border-t border-slate-100">
                      Includes {selectedPackage?.spaceDescription}
                    </p>
                  )}

                  {/* Primary Action Button */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={selectedBoothNumbers.length === 0}
                      className={`w-full py-3 px-4 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm ${selectedBoothNumbers.length === 0
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
                        : "bg-[#218A59] hover:bg-[#186a43] text-white hover:shadow-md cursor-pointer"
                        }`}
                    >
                      <span>
                        {selectedBoothNumbers.length === 0
                          ? "SELECT STALL TO CONTINUE"
                          : `CONTINUE (${selectedBoothNumbers.length} STALL${selectedBoothNumbers.length > 1 ? "S" : ""}) →`}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Section 4: Assistance Footer */}
                <div className="px-5 py-3.5 bg-slate-50/80 text-[11px] text-slate-500 space-y-1">
                  <div className="font-semibold text-slate-700">Need Assistance?</div>
                  <div className="flex items-center gap-1.5 text-slate-600 font-mono">
                    <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                    <a href="tel:+9779703606348" className="hover:text-emerald-700 hover:underline">
                      +977-9703606348 / 9703606345
                    </a>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600 font-mono">
                    <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                    <a href="mailto:info@himalayanenergyexpo.com" className="hover:text-emerald-700 hover:underline">
                      info@himalayanenergyexpo.com
                    </a>
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
                className={`p-4 rounded-xl border-2 text-left transition-all flex items-start gap-3 cursor-pointer ${exhibitorOrigin === "domestic"
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
                className={`p-4 rounded-xl border-2 text-left transition-all flex items-start gap-3 cursor-pointer ${exhibitorOrigin === "international"
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

            {/* International Exhibitor Notice & Team Contact */}
            {exhibitorOrigin === "international" && (
              <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm text-slate-900">
                        International Exhibitor Notice
                      </span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                        Card Gateway Under Construction
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-normal">
                      Online credit card payments are currently unavailable. You can reserve your stall below and pay by <strong>Bank Transfer (USD SWIFT Wire)</strong> using the official Pro-Forma Invoice we generate for you.
                    </p>
                  </div>
                </div>

                {/* Direct Team Contacts */}
                <div className="pt-2.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2.5 text-xs">
                  <span className="text-slate-600 font-medium">
                    Need help or want to speak with our team?
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <a
                      href="https://wa.me/9779703606348?text=Hello%2C%20I%20am%20an%20international%20exhibitor%20inquiring%20about%20stall%20booking."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366] text-white text-xs font-semibold hover:bg-[#20ba59] transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp (+977 9703606348)</span>
                    </a>
                    <a
                      href="mailto:info@himalayanenergyexpo.com?subject=International%20Stall%20Booking%20Inquiry"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>info@himalayanenergyexpo.com</span>
                    </a>
                    <a
                      href="tel:+9779703606348"
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                    >
                      Call: +977 9703606345
                    </a>
                  </div>
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
                className={`w-full p-3 rounded-xl bg-white border text-slate-900 text-xs focus:outline-none focus:border-[#10B981] shadow-xs ${exhibitorOrigin === "international" && (!formData.country || formData.country.toLowerCase() === "nepal")
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
              {exhibitorOrigin === "international"
                ? "Step 3: Review Details & Confirm Reservation"
                : "Step 3: Select Payment Method & Finalize Booking"}
            </h3>
            <p className="text-xs text-slate-600 font-normal mt-1">
              {exhibitorOrigin === "international"
                ? "Review your booking details below. Confirming will place your stall on hold and generate your official USD SWIFT Pro-Forma Invoice."
                : "Choose your preferred payment gateway from Nepal (Khalti, Fonepay) or request an official Bank Wire Invoice."}
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
                  {totalAreaSqM}m² {selectedStallObjects.some((s) => s.isBareSpace) ? "(Bare Space)" : ""}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">EXHIBITOR ENTITY</span>
                <div className="font-sans font-bold text-base text-slate-900 flex items-center gap-1.5">
                  <span>{formData.companyName || "Organization"}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${exhibitorOrigin === "international"
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

              <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">TOTAL INVESTMENT</span>
                  <span className="text-[9px] font-mono bg-emerald-100 text-emerald-800 border border-emerald-300 px-1.5 py-0.5 rounded font-bold">
                    + 13% VAT INCL.
                  </span>
                </div>
                <div className="font-sans font-bold text-xl text-[#15803D]">
                  {exhibitorOrigin === "international"
                    ? `USD $${totalWithVatUSD.toLocaleString()}`
                    : `NPR ${totalWithVatNPR.toLocaleString()}`}
                </div>
                <div className="pt-1 border-t border-slate-100 text-[10px] text-slate-600 font-mono space-y-0.5">
                  <div className="flex justify-between">
                    <span>Base Tariff:</span>
                    <span className="font-semibold text-slate-800">
                      {exhibitorOrigin === "international" ? `USD $${finalPriceUSD.toLocaleString()}` : `NPR ${finalPriceNPR.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-emerald-700">
                    <span>+ 13% VAT:</span>
                    <span className="font-semibold">
                      {exhibitorOrigin === "international" ? `USD $${vatUSD.toLocaleString()}` : `NPR ${vatNPR.toLocaleString()}`}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 font-mono block pt-0.5">
                  {exhibitorOrigin === "international"
                    ? `Approx. NPR ${totalWithVatNPR.toLocaleString()}`
                    : `Approx. USD $${totalWithVatUSD.toLocaleString()}`}
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

          {/* Payment Gateway Cards / Payment Method */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-mono text-slate-700 font-bold uppercase">
                {exhibitorOrigin === "international" ? "PAYMENT METHOD" : "SELECT PAYMENT GATEWAY"}
              </label>
              <div className="flex items-center gap-1.5 text-[11px] font-mono">
                <span className="text-slate-500">Exhibitor:</span>
                <button
                  type="button"
                  onClick={() => {
                    const next = exhibitorOrigin === "international" ? "domestic" : "international";
                    setExhibitorOrigin(next);
                    setPaymentMethod(next === "international" ? "bank" : "khalti");
                  }}
                  className="font-bold text-sky-600 hover:text-sky-700 underline cursor-pointer"
                >
                  {exhibitorOrigin === "international" ? "Switch to Domestic (NPR)" : "Switch to International (USD)"}
                </button>
              </div>
            </div>

            {exhibitorOrigin === "international" ? (
              /* CLEAN INTERNATIONAL PAYMENT / PRO-FORMA INVOICE CARD */
              <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-sky-100 text-sky-800">
                        SWIFT WIRE
                      </span>
                      <span className="text-sm font-bold text-slate-900 font-sans">
                        Official USD Bank Transfer &amp; Pro-Forma Invoice
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-normal max-w-xl">
                      Your stall will be held immediately upon confirmation. Our secretariat will issue an official IPPAN USD Pro-Forma Invoice with complete SWIFT banking instructions to route your remittance.
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center shrink-0">
                    <Landmark className="w-5 h-5 text-sky-600" />
                  </div>
                </div>

                {/* Direct Team Support */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <span className="text-slate-500 font-medium">
                    Questions about wire transfer or booking?
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <a
                      href="https://wa.me/9779703606348?text=Hello%2C%20I%20am%20an%20international%20exhibitor%20inquiring%20about%20my%20stall%20booking."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366] text-white text-xs font-semibold hover:bg-[#20ba59] transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp (+977 9703606348)</span>
                    </a>
                    <a
                      href="mailto:info@himalayanenergyexpo.com?subject=International%20Stall%20Booking%20Inquiry"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>info@himalayanenergyexpo.com</span>
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              /* DOMESTIC GATEWAY OPTIONS */
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
                      <div className="flex items-center gap-1.5">
                        <div className="px-2.5 py-1 rounded-lg bg-[#5D2E8E] text-white font-mono text-[10px] font-bold">
                          KHALTI
                        </div>
                      </div>
                      {paymentMethod === "khalti" && (
                        <CheckCircle2 className="w-5 h-5 text-[#5D2E8E]" />
                      )}
                    </div>
                    <h4 className="font-sans font-bold text-base text-slate-900">
                      Khalti ePayment API v2
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-normal">
                      Instant checkout via Khalti Mobile Wallet, SCT Cards, eBanking &amp; ConnectIPS.
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
                      <div className="flex items-center gap-1.5">
                        <div className="px-2.5 py-1 rounded-lg bg-[#D92525] text-white font-mono text-[10px] font-bold">
                          FONEPAY
                        </div>
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
                      <div className="flex items-center gap-1.5">
                        <div className="px-2.5 py-1 rounded-lg text-white font-mono text-[10px] font-bold bg-[#218A59]">
                          BANK WIRE
                        </div>
                      </div>
                      {paymentMethod === "bank" && (
                        <CheckCircle2 className="w-5 h-5 text-[#218A59]" />
                      )}
                    </div>
                    <h4 className="font-sans font-bold text-base text-slate-900">
                      Bank Remittance / Invoice
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-normal">
                      Lock stall provisionally and remit via SWIFT / RTGS directly to IPPAN account.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1 text-[11px] font-mono font-bold text-[#218A59]">
                    <Landmark className="w-3.5 h-3.5" />
                    <span>Official Pro-Forma Invoice</span>
                  </div>
                </div>
              </div>
            )}
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

            {step > 1 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={isSubmitting}
                className={`px-8 py-3.5 rounded-full font-mono text-xs font-bold tracking-wider shadow-md transition-all flex items-center gap-2 text-white ${isSubmitting
                  ? "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none"
                  : exhibitorOrigin === "international" && step === 3
                    ? "bg-sky-600 hover:bg-sky-700 cursor-pointer"
                    : paymentMethod === "khalti" && step === 3
                      ? "bg-[#5D2E8E] hover:bg-[#482370] cursor-pointer"
                      : paymentMethod === "fonepay" && step === 3
                        ? "bg-[#D92525] hover:bg-[#b01c1c] cursor-pointer"
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
                      {step === 3
                        ? exhibitorOrigin === "international"
                          ? `CONFIRM & HOLD STALL (USD $${totalWithVatUSD.toLocaleString()})`
                          : paymentMethod === "bank"
                            ? "CONFIRM RESERVATION & GENERATE INVOICE"
                            : `PAY WITH ${paymentMethod.toUpperCase()} (NPR ${totalWithVatNPR.toLocaleString()})`
                        : exhibitorOrigin === "international"
                          ? "CONTINUE TO REVIEW & RESERVE"
                          : "CONTINUE TO REVIEW & PAYMENT"}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            ) : null}
          </div>
        </div>
      )}

      {/* =========================================================================
          TIER PERKS DETAIL MODAL
         ========================================================================= */}
      {perksModalPackageId && (() => {
        const pkg = PARTICIPATION_PACKAGES.find((p) => p.id === perksModalPackageId);
        if (!pkg) return null;
        const isTitle = pkg.id === "title-sponsor";

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900 my-auto">
              {/* Modal Header */}
              <div className={`p-6 border-b border-slate-100 flex items-start justify-between ${isTitle ? "bg-gradient-to-r from-amber-50 to-orange-50/30" : "bg-slate-50"
                }`}>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      TIER ENTITLEMENTS &amp; BENEFITS
                    </span>
                    {isTitle && (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500 text-slate-950">
                        FLAGSHIP
                      </span>
                    )}
                  </div>
                  <h3 className="font-sans font-bold text-xl text-slate-900">
                    {pkg.name}
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {pkg.spaceDescription} · <span className="font-mono font-bold text-slate-900">{pkg.priceDisplayNPR}</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPerksModalPackageId(null)}
                  className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-800 border border-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4">
                <div className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                  Included Inclusions &amp; Privileges ({pkg.perks.length}):
                </div>

                <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                  {pkg.perks.map((perk, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3 text-xs"
                    >
                      <div className="w-5 h-5 rounded-full bg-emerald-100 text-[#15803D] flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                      <div className="font-medium text-slate-800 leading-relaxed">
                        {perk}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setPerksModalPackageId(null)}
                  className="px-5 py-2.5 rounded-full border border-slate-300 text-slate-700 font-mono text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  CLOSE
                </button>
                <button
                  type="button"
                  onClick={() => {
                    selectPackage(pkg.id);
                    setPerksModalPackageId(null);
                  }}
                  className="px-6 py-2.5 rounded-full bg-[#218A59] hover:bg-[#186a43] text-white font-mono text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  <span>SELECT {pkg.name.toUpperCase()}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
