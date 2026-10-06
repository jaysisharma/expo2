"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Crown,
  Flame,
  Star,
  Handshake,
  Users2,
  Megaphone,
  Heart,
  Box,
  LayoutGrid,
  Clock,
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
    name: "Title Sponsor (1)",
    type: "sponsor",
    badge: "Flagship",
    priceNPR: 5000000,
    priceUSD: 35000,
    priceDisplayNPR: "NRs 50,00,000/-",
    priceDisplayUSD: "USD $35,000.00",
    spaceDescription: "6M X 6M X 2 (2 Bare Space Stalls · 72m²)",
    spaceCount: 2,
    spaceType: "bare",
    preferredStalls: ["A1", "A2"],
    perks: [
      "2 Bare Space Stalls (6M X 6M X 2)",
      "5 Promotional Display Areas (6FT X 4FT X 5)",
      "50 Inauguration Invitation Passes",
      "25 Networking Dinner Passes",
      "20 Exhibitor Passes",
      "500 Normal Passes",
    ],
  },
  {
    id: "in-association-with",
    name: "In Association With (1)",
    type: "sponsor",
    badge: "Principal",
    priceNPR: 3500000,
    priceUSD: 25000,
    priceDisplayNPR: "NRs 35,00,000/-",
    priceDisplayUSD: "USD $25,000.00",
    spaceDescription: "6M X 6M X 1 (1 Bare Space Stall · 36m²)",
    spaceCount: 1,
    spaceType: "bare",
    preferredStalls: ["A1"],
    perks: [
      "1 Bare Space Stall (6M X 6M X 1)",
      "4 Promotional Display Areas (6FT X 4FT X 4)",
      "50 Inauguration Invitation Passes",
      "20 Networking Dinner Passes",
      "20 Exhibitor Passes",
      "300 Normal Passes",
    ],
  },
  {
    id: "powered-by",
    name: "Powered By (1)",
    type: "sponsor",
    badge: "Major",
    priceNPR: 2700000,
    priceUSD: 20000,
    priceDisplayNPR: "NRs 27,00,000/-",
    priceDisplayUSD: "USD $20,000.00",
    spaceDescription: "6M X 6M X 1 (1 Bare Space Stall · 36m²)",
    spaceCount: 1,
    spaceType: "bare",
    preferredStalls: ["A2"],
    perks: [
      "1 Bare Space Stall (6M X 6M X 1)",
      "3 Promotional Display Areas (6FT X 4FT X 3)",
      "40 Inauguration Invitation Passes",
      "15 Networking Dinner Passes",
      "20 Exhibitor Passes",
      "200 Normal Passes",
    ],
  },
  {
    id: "sponsor",
    name: "Sponsor",
    type: "sponsor",
    priceNPR: 1500000,
    priceUSD: 10000,
    priceDisplayNPR: "NRs 15,00,000/-",
    priceDisplayUSD: "USD $10,000.00",
    spaceDescription: "6M X 6M X 1 (1 Bare Space Stall · 36m²)",
    spaceCount: 1,
    spaceType: "bare",
    preferredStalls: ["A3"],
    perks: [
      "1 Bare Space Stall (6M X 6M X 1)",
      "3 Promotional Display Areas (6FT X 4FT X 3)",
      "20 Inauguration Invitation Passes",
      "8 Networking Dinner Passes",
      "20 Exhibitor Passes",
      "150 Normal Passes",
    ],
  },
  {
    id: "official-partner",
    name: "Official Partner",
    type: "sponsor",
    priceNPR: 1300000,
    priceUSD: 9000,
    priceDisplayNPR: "NRs 13,00,000/-",
    priceDisplayUSD: "USD $9,000.00",
    spaceDescription: "6M X 6M X 1 (1 Bare Space Stall · 36m²)",
    spaceCount: 1,
    spaceType: "bare",
    preferredStalls: ["A4"],
    perks: [
      "1 Bare Space Stall (6M X 6M X 1)",
      "2 Promotional Display Areas (6FT X 4FT X 2)",
      "20 Inauguration Invitation Passes",
      "5 Networking Dinner Passes",
      "20 Exhibitor Passes",
      "120 Normal Passes",
    ],
  },
  {
    id: "co-sponsor",
    name: "Co-Sponsor",
    type: "sponsor",
    badge: undefined,
    priceNPR: 1000000,
    priceUSD: 7000,
    priceDisplayNPR: "NRs 10,00,000/-",
    priceDisplayUSD: "USD $7,000.00",
    spaceDescription: "6M X 6M X 1 (1 Bare Space Stall · 36m²)",
    spaceCount: 1,
    spaceType: "bare",
    preferredStalls: ["A26"],
    perks: [
      "1 Bare Space Stall (6M X 6M X 1)",
      "2 Promotional Display Areas (6FT X 4FT X 2)",
      "20 Inauguration Invitation Passes",
      "5 Networking Dinner Passes",
      "20 Exhibitor Passes",
      "100 Normal Passes",
    ],
  },
  {
    id: "supporter",
    name: "Supporter",
    type: "sponsor",
    priceNPR: 650000,
    priceUSD: 5000,
    priceDisplayNPR: "NRs 6,50,000/-",
    priceDisplayUSD: "USD $5,000.00",
    spaceDescription: "6M X 6M X 1 (1 Bare Space Stall · 36m²)",
    spaceCount: 1,
    spaceType: "bare",
    preferredStalls: ["A27"],
    perks: [
      "1 Bare Space Stall (6M X 6M X 1)",
      "1 Promotional Display Area (6FT X 4FT X 1)",
      "20 Inauguration Invitation Passes",
      "20 Exhibitor Passes",
      "50 Normal Passes",
    ],
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
  const queryHold =
    searchParams.get("hold") === "true" ||
    searchParams.get("action") === "hold" ||
    searchParams.get("mode") === "hold";

  const [step, setStep] = useState(1);
  const [selectedBoothNumbers, setSelectedBoothNumbers] = useState<string[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState<string>("custom-selection");
  const [packageFilter, setPackageFilter] = useState<"all" | "sponsor" | "stall" | "custom">("all");
  const [isCustomizedOnMap, setIsCustomizedOnMap] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [boothType, setBoothType] = useState<"Shell Scheme" | "Bare Space">("Shell Scheme");
  const [powerOption, setPowerOption] = useState<string>("Standard 15A Included");
  const [paymentMethod, setPaymentMethod] = useState<"khalti" | "bank" | "hold_72h">("khalti");
  const [agreedTerms, setAgreedTerms] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>("");
  const [exhibitorOrigin, setExhibitorOrigin] = useState<"domestic" | "international">("domestic");

  // Automatically enforce SWIFT bank transfer for international exhibitors, and default to Khalti for domestic
  useEffect(() => {
    if (exhibitorOrigin === "international") {
      setPaymentMethod("bank");
    } else if (paymentMethod === "bank") {
      setPaymentMethod("khalti");
    }
  }, [exhibitorOrigin, paymentMethod]);

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
  const [primeSurchargePercent, setPrimeSurchargePercent] = useState<number>(25);

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
          if (adminJson?.data?.settings?.primeStallSurchargePercent !== undefined) {
            setPrimeSurchargePercent(Number(adminJson.data.settings.primeStallSurchargePercent) || 25);
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

    const isPrime =
      override?.isPrime !== undefined
        ? Boolean(override.isPrime)
        : custom?.isPrime !== undefined
          ? Boolean(custom.isPrime)
          : Boolean(fallback?.isPrime);

    let basePriceNPR = 180000;
    if (override?.priceNPR !== undefined && override?.priceNPR !== null && !isNaN(Number(override.priceNPR))) {
      basePriceNPR = Number(override.priceNPR);
    } else if (custom?.priceNPR !== undefined && custom?.priceNPR !== null && !isNaN(Number(custom.priceNPR))) {
      basePriceNPR = Number(custom.priceNPR);
    } else if (official?.priceNPR !== undefined && !isNaN(Number(official.priceNPR))) {
      basePriceNPR = Number(official.priceNPR);
    } else if (fallback?.priceNPR !== undefined && !isNaN(Number(fallback.priceNPR))) {
      basePriceNPR = Number(fallback.priceNPR);
    }

    let basePriceUSD = 1350;
    if (override?.priceUSD !== undefined && override?.priceUSD !== null && !isNaN(Number(override.priceUSD))) {
      basePriceUSD = Number(override.priceUSD);
    } else if (custom?.priceUSD !== undefined && custom?.priceUSD !== null && !isNaN(Number(custom.priceUSD))) {
      basePriceUSD = Number(custom.priceUSD);
    } else if (official?.priceUSD !== undefined && !isNaN(Number(official.priceUSD))) {
      basePriceUSD = Number(official.priceUSD);
    } else if (fallback?.priceUSD !== undefined && !isNaN(Number(fallback.priceUSD))) {
      basePriceUSD = Number(fallback.priceUSD);
    }

    const primeSurchargeRate = (primeSurchargePercent || 25) / 100;
    const primeSurchargeNPR = isPrime ? Math.round(basePriceNPR * primeSurchargeRate) : 0;
    const primeSurchargeUSD = isPrime ? Math.round(basePriceUSD * primeSurchargeRate) : 0;
    const priceNPR = basePriceNPR + primeSurchargeNPR;
    const priceUSD = basePriceUSD + primeSurchargeUSD;

    const block = custom?.block || official?.block || fallback?.hall || (number ? `Block ${number.charAt(0).toUpperCase()}` : "Main Pavilion");
    const status = custom?.status || official?.status || fallback?.status || "Available";

    // Rule: B1–B22 and H1–H8 are standard stalls (do not write Shell Scheme). All other stalls are Bare Space!
    const upper = (number || "").trim().toUpperCase();
    const bMatch = upper.match(/^B(\d+)$/);
    const isB = Boolean(bMatch && parseInt(bMatch[1], 10) >= 1 && parseInt(bMatch[1], 10) <= 22);
    const hMatch = upper.match(/^H(\d+)$/);
    const isH = Boolean(hMatch && parseInt(hMatch[1], 10) >= 1 && parseInt(hMatch[1], 10) <= 8);
    const isBareSpace = !isB && !isH;

    // Detect Irregular Bare Space (custom footprint charged per sq.m)
    const isIrregular = Boolean(
      custom?.isIrregular ||
      custom?.category === "Irregular Bare Space" ||
      (custom?.dimensions && custom.dimensions.toLowerCase().includes("custom")) ||
      (category && category.toLowerCase().includes("irregular")) ||
      upper.startsWith("IRR")
    );

    const ratePerSqMNPR = Number(
      custom?.ratePerSqMNPR ||
      (basePriceNPR && sizeSqM ? Math.round(basePriceNPR / sizeSqM) : 10500)
    );
    const ratePerSqMUSD = Number(
      custom?.ratePerSqMUSD ||
      (basePriceUSD && sizeSqM ? Number((basePriceUSD / sizeSqM).toFixed(2)) : 83.33)
    );

    const displayName = isIrregular
      ? `STALL ${number} (Irregular Bare Space)`
      : isBareSpace
        ? `STALL ${number} (Bare Space)`
        : `STALL ${number}`;

    return {
      number,
      displayName,
      spaceType: isIrregular ? "Irregular Bare Space" : isBareSpace ? "Bare Space" : "",
      isBareSpace,
      isIrregular,
      ratePerSqMNPR,
      ratePerSqMUSD,
      isPrime,
      block,
      dimensions,
      sizeSqM,
      sizeSqFt,
      basePriceNPR,
      basePriceUSD,
      primeSurchargeNPR,
      primeSurchargeUSD,
      priceNPR,
      priceUSD,
      category: isIrregular ? "Irregular Bare Space" : isBareSpace ? `${dimensions} Bare Space` : category,
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

  const hasFastTrackedRef = useRef(false);
  // Automatically select 72h hold if requested via query param
  useEffect(() => {
    if (queryHold && !hasFastTrackedRef.current) {
      hasFastTrackedRef.current = true;
      setPaymentMethod("hold_72h");
      setStep(2);
    }
  }, [queryHold]);

  const totalAreaSqM = selectedStallObjects.reduce((acc, curr) => acc + (curr.sizeSqM || 0), 0);
  const rawBasePriceNPR = selectedStallObjects.reduce((acc, curr) => acc + (curr.basePriceNPR || 0), 0);
  const rawBasePriceUSD = selectedStallObjects.reduce((acc, curr) => acc + (curr.basePriceUSD || 0), 0);
  const totalPrimeSurchargeNPR = selectedStallObjects.reduce((acc, curr) => acc + (curr.primeSurchargeNPR || 0), 0);
  const totalPrimeSurchargeUSD = selectedStallObjects.reduce((acc, curr) => acc + (curr.primeSurchargeUSD || 0), 0);
  const rawTotalPriceNPR = selectedStallObjects.reduce((acc, curr) => acc + (curr.priceNPR || 0), 0);
  const rawTotalPriceUSD = selectedStallObjects.reduce((acc, curr) => acc + (curr.priceUSD || 0), 0);
  const hasPrimeStalls = selectedStallObjects.some((s) => s.isPrime);

  const finalPriceNPR = isSponsorPackage && selectedPackage
    ? selectedPackage.priceNPR
    : rawTotalPriceNPR;

  const finalPriceUSD = isSponsorPackage && selectedPackage
    ? selectedPackage.priceUSD
    : rawTotalPriceUSD;

  const finalBasePriceNPR = isSponsorPackage && selectedPackage
    ? selectedPackage.priceNPR
    : rawBasePriceNPR;

  const finalBasePriceUSD = isSponsorPackage && selectedPackage
    ? selectedPackage.priceUSD
    : rawBasePriceUSD;

  // 13% Government VAT
  const vatRate = 0.13;
  const vatNPR = Math.round(finalPriceNPR * vatRate);
  const vatUSD = Math.round(finalPriceUSD * vatRate);
  const totalWithVatNPR = finalPriceNPR + vatNPR;
  const totalWithVatUSD = finalPriceUSD + vatUSD;

  // Reference & smooth auto-scroll helper to jump directly to stall selection
  const stallSelectionRef = useRef<HTMLDivElement>(null);

  const scrollToStallSelection = () => {
    const performScroll = () => {
      const el = stallSelectionRef.current || document.getElementById("select-stall-section");
      if (el) {
        // Method 1: native scrollIntoView with start block alignment
        try {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        } catch {}

        // Method 2: calculated window.scrollTo for precise pixel positioning below navbar
        const navOffset = 95;
        const rect = el.getBoundingClientRect();
        const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
        const targetTop = rect.top + scrollY - navOffset;

        try {
          window.scrollTo({
            top: Math.max(0, targetTop),
            behavior: "smooth",
          });
        } catch {}
      }
    };

    // First attempt immediately on next tick
    setTimeout(performScroll, 50);
    // Second attempt after React state re-render has completed layout shifts
    setTimeout(performScroll, 220);
  };

  // Function to handle package selection and auto-allocation
  const selectPackage = (pkgId: string, shouldScroll = true) => {
    setSelectedPackageId(pkgId);
    setIsCustomizedOnMap(false);

    if (shouldScroll) {
      scrollToStallSelection();
    }

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
  }, [elements, boothOverrides, primeSurchargePercent]);

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
            amountNPR: paymentMethod === "hold_72h" ? 0 : totalWithVatNPR,
            amountUSD: paymentMethod === "hold_72h" ? 0 : totalWithVatUSD,
            fullPackageAmountNPR: totalWithVatNPR,
            fullPackageAmountUSD: totalWithVatUSD,
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
                ? `[${exhibitorOrigin.toUpperCase()} EXHIBITOR] ${paymentMethod === "hold_72h" ? "[72-HOUR FREE HOLD] " : ""}Package: ${selectedPackage.name} | Stalls: ${selectedBoothNumbers.join(", ")}`
                : `[${exhibitorOrigin.toUpperCase()} EXHIBITOR] ${paymentMethod === "hold_72h" ? "[72-HOUR FREE HOLD] " : ""}Stalls: ${selectedBoothNumbers.join(", ")}`,
            paymentMethod: paymentMethod === "hold_72h" ? "hold_72h" : exhibitorOrigin === "international" ? "bank" : paymentMethod,
            isHold72h: paymentMethod === "hold_72h",
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Failed to initialize booking and payment.");
        }

        // For 72-Hour Free Hold, directly navigate to success page or open confirmation
        if (paymentMethod === "hold_72h") {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
          if (data.redirectUrl) {
            router.push(data.redirectUrl);
            return;
          }
          setStep(4);
          return;
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
              PARTICIPATION PACKAGE & STALL SELECTOR (PIXEL-PERFECT FROM REFERENCE)
             ========================================================================= */}
          <div className="space-y-6">
            {/* Header with Title and Mode Toggles */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[11px] font-mono font-bold text-emerald-800 uppercase tracking-widest">
                    STEP 1
                  </span>
                  <span className="w-5 h-px bg-slate-300" />
                  <span className="text-[11px] font-mono font-bold text-emerald-800 uppercase tracking-widest">
                    STALL ALLOCATION &amp; SPONSORSHIP TIER
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Choose a Package or Stall Type
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
                  Select a sponsorship or exhibition option to secure your space. You can review details and make changes anytime.
                </p>
              </div>

              {/* View Mode Toggle Pill (Black Floor Plan & White List View) */}
              <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200/80 shrink-0 self-start">
                <button
                  type="button"
                  onClick={() => setViewMode("map")}
                  className={`px-3.5 py-1.5 rounded-lg flex items-center gap-2 text-xs font-semibold transition-all cursor-pointer ${
                    viewMode === "map"
                      ? "bg-[#0b2b24] text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Floor Plan</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`px-3.5 py-1.5 rounded-lg flex items-center gap-2 text-xs font-semibold transition-all cursor-pointer ${
                    viewMode === "list"
                      ? "bg-[#0b2b24] text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <ListFilter className="w-3.5 h-3.5" />
                  <span>List View</span>
                </button>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {[
                { key: "all", label: "All Packages", count: 10 },
                { key: "sponsor", label: "Sponsorship Tiers", count: 6 },
                { key: "stall", label: "Exhibition Stalls", count: 2 },
                { key: "custom", label: "Custom Selection", count: 1 },
              ].map((tab) => {
                const isActive = packageFilter === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setPackageFilter(tab.key as any)}
                    className={`px-4 py-2 rounded-xl text-xs transition-all shrink-0 cursor-pointer flex items-center gap-2 font-medium ${
                      isActive
                        ? "bg-[#007A5E] text-white shadow-xs"
                        : "bg-white text-slate-600 border border-slate-200/90 hover:border-slate-300 hover:text-slate-900"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* ─── TITLE SPONSOR HERO CARD (Yellow-border hero container) ─── */}
            {(packageFilter === "all" || packageFilter === "sponsor") && (() => {
              const pkg = PARTICIPATION_PACKAGES.find((p) => p.id === "title-sponsor")!;
              const isSelected = selectedPackageId === pkg.id;
              return (
                <div
                  onClick={() => selectPackage(pkg.id)}
                  className={`p-5 sm:p-6 rounded-2xl border-2 transition-all cursor-pointer relative bg-gradient-to-r from-amber-50/50 via-white to-amber-50/30 ${
                    isSelected
                      ? "border-amber-400 ring-2 ring-amber-300/40 shadow-md"
                      : "border-amber-400/90 hover:border-amber-500 hover:shadow-xs"
                  }`}
                >
                  {/* Top-Right "Most Popular" Pill */}
                  <div className="absolute top-4 right-5 sm:right-6">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-bold text-[11px] border border-amber-200/80">
                      <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                      <span>Most Popular</span>
                    </span>
                  </div>

                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pr-0 lg:pr-36">
                    {/* Left: Radio Circle + Crown Icon + Title + Specs + Inclusions */}
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-3">
                        {/* Radio Selector Circle */}
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${
                            isSelected
                              ? "border-amber-600 bg-amber-500"
                              : "border-slate-300 bg-white"
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>

                        <div className="w-10 h-10 rounded-2xl bg-amber-100/90 border border-amber-200 flex items-center justify-center shrink-0 text-amber-700">
                          <Crown className="w-5 h-5 fill-amber-500 text-amber-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-extrabold text-xl sm:text-2xl text-slate-900 tracking-tight">
                              Title Sponsor
                            </h3>
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 uppercase tracking-wider">
                              <Sparkles className="w-2.5 h-2.5" />
                              <span>PRIME FLAGSHIP</span>
                            </span>
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 uppercase tracking-wider">
                              <Clock className="w-2.5 h-2.5 text-emerald-700" />
                              <span>72H FREE HOLD</span>
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium mt-0.5">
                            <Box className="w-3.5 h-3.5 text-slate-400" />
                            <span>6M × 6M × 2 (2 Bare Space Stalls · 72m²)</span>
                          </div>
                        </div>
                      </div>

                      {/* Inclusion check pills */}
                      <div className="flex flex-wrap items-center gap-2 pt-1 pl-0 sm:pl-13">
                        {pkg.perks.map((perk, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/90 text-slate-800 border border-slate-200/90 text-xs font-medium shadow-2xs"
                          >
                            <Check className="w-3 h-3 text-emerald-600 stroke-[2.5]" />
                            <span>{perk}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Right: Investment & Pricing + Select Button */}
                    <div className="flex flex-col items-start lg:items-end justify-between gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-amber-200/60 pl-0 sm:pl-13 lg:pl-0">
                      <div>
                        <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                          INVESTMENT
                        </div>
                        <div className="font-mono font-extrabold text-2xl text-slate-900 tracking-tight">
                          {pkg.priceDisplayNPR}
                        </div>
                        <div className="font-mono text-xs text-slate-500 mt-0.5">
                          {pkg.priceDisplayUSD}
                        </div>
                      </div>

                      <div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            selectPackage(pkg.id);
                          }}
                          className={`py-2 px-5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs ${
                            isSelected
                              ? "bg-[#007A5E] text-white hover:bg-[#00664e] shadow-xs ring-2 ring-emerald-500/20"
                              : "bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold"
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                              <span>Selected</span>
                            </>
                          ) : (
                            <span>Select Title Sponsor</span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* ─── SPONSORSHIP PARTNERSHIPS SECTION (6 Columns Grid) ─── */}
            {(packageFilter === "all" || packageFilter === "sponsor") && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
                    SPONSORSHIP PARTNERSHIPS
                  </h4>
                  <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                    <Users2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>6 sponsorship tiers available</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 items-stretch">
                  {PARTICIPATION_PACKAGES.filter(
                    (p) => p.type === "sponsor" && p.id !== "title-sponsor"
                  ).map((pkg) => {
                    const isSelected = selectedPackageId === pkg.id;

                    // Tier-specific icons & colors from the image
                    const tierMeta: Record<string, { icon: React.ReactNode; badgeClass?: string }> = {
                      "in-association-with": {
                        icon: <Star className="w-4 h-4 fill-emerald-600 text-emerald-600" />,
                        badgeClass: "bg-emerald-100 text-emerald-800",
                      },
                      "powered-by": {
                        icon: <Award className="w-4 h-4 text-blue-600" />,
                        badgeClass: "bg-blue-100 text-blue-800",
                      },
                      "sponsor": {
                        icon: <Handshake className="w-4 h-4 text-blue-600" />,
                      },
                      "official-partner": {
                        icon: <Users2 className="w-4 h-4 text-indigo-600" />,
                      },
                      "co-sponsor": {
                        icon: <Megaphone className="w-4 h-4 text-blue-500" />,
                      },
                      "supporter": {
                        icon: <Heart className="w-4 h-4 text-rose-500" />,
                      },
                    };

                    const meta = tierMeta[pkg.id] || {
                      icon: <Award className="w-4 h-4 text-slate-600" />,
                    };

                    return (
                      <div
                        key={pkg.id}
                        onClick={() => selectPackage(pkg.id)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between relative bg-white ${
                          isSelected
                            ? "border-[#007A5E] ring-1.5 ring-[#007A5E] shadow-sm"
                            : "border-slate-200 hover:border-slate-300 hover:shadow-2xs"
                        }`}
                      >
                        <div className="space-y-3">
                          {/* Radio Selector + Icon */}
                          <div className="flex items-center justify-between">
                            <div
                              className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                                isSelected
                                  ? "border-[#007A5E] bg-[#007A5E]"
                                  : "border-slate-300 bg-white"
                              }`}
                            >
                              {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>

                            <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center">
                              {meta.icon}
                            </div>
                          </div>

                          {/* Title & Dimension */}
                          <div>
                            <h5 className="font-bold text-sm text-slate-900 leading-snug">
                              {pkg.name}
                            </h5>
                            {pkg.badge && meta.badgeClass && (
                              <span
                                className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${meta.badgeClass}`}
                              >
                                {pkg.badge}
                              </span>
                            )}
                            <p className="text-[11px] text-slate-500 mt-1 font-mono">
                              6M × 6M × 1 (36m²)
                            </p>
                          </div>

                          {/* Bulleted Perk List with Green Checkmarks */}
                          <div className="space-y-1.5 pt-1 border-t border-slate-100">
                            {pkg.perks.map((perk, pIdx) => (
                              <div
                                key={pIdx}
                                className="flex items-start gap-1.5 text-[11px] text-slate-600 leading-tight"
                              >
                                <Check className="w-3 h-3 text-[#007A5E] shrink-0 mt-0.5 stroke-[2.5]" />
                                <span>{perk}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Bottom Pricing & Action Button */}
                        <div className="pt-3 border-t border-slate-100 mt-4 space-y-2">
                          <div>
                            <div className="font-mono font-bold text-xs sm:text-sm text-slate-900">
                              {pkg.priceDisplayNPR}
                            </div>
                            <div className="font-mono text-[10px] text-slate-400">
                              {pkg.priceDisplayUSD}
                            </div>
                          </div>

                          <div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                selectPackage(pkg.id);
                              }}
                              className={`w-full py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                                isSelected
                                  ? "bg-[#007A5E] text-white shadow-xs font-bold"
                                  : "bg-white border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                              }`}
                            >
                              {isSelected ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Selected</span>
                                </>
                              ) : (
                                <span>Select Package</span>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ─── STANDARD EXHIBITION STALLS (2 Horizontal Cards Grid) ─── */}
            {(packageFilter === "all" || packageFilter === "stall") && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
                    STANDARD EXHIBITION STALLS
                  </h4>
                  <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                    <Box className="w-3.5 h-3.5 text-slate-400" />
                    <span>2 stall types available</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Stall 1: Standard Built Stall */}
                  {(() => {
                    const pkg = PARTICIPATION_PACKAGES.find((p) => p.id === "standard-stall")!;
                    const isSelected = selectedPackageId === pkg.id;
                    return (
                      <div
                        onClick={() => selectPackage(pkg.id)}
                        className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between bg-white relative ${
                          isSelected
                            ? "border-[#007A5E] ring-1.5 ring-[#007A5E] shadow-sm"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          {/* Radio */}
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center mt-1 shrink-0 ${
                              isSelected
                                ? "border-[#007A5E] bg-[#007A5E]"
                                : "border-slate-300 bg-white"
                            }`}
                          >
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>

                          {/* Octonorm Booth Realistic Graphic */}
                          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-slate-100 border border-slate-200/80 shrink-0 flex items-center justify-center p-1.5 overflow-hidden">
                            <div className="w-full h-full rounded-lg bg-gradient-to-b from-slate-200 to-slate-300/80 flex flex-col items-center justify-between p-1.5 border border-slate-300/60 shadow-2xs">
                              <div className="w-full h-2 rounded bg-emerald-700/80 text-[6px] text-white font-bold flex items-center justify-center">
                                EXHIBITOR
                              </div>
                              <div className="w-6 h-6 rounded-full border border-slate-400/50 bg-white/60 flex items-center justify-center">
                                <Box className="w-3 h-3 text-slate-500" />
                              </div>
                              <div className="w-full h-1 bg-slate-400/40 rounded" />
                            </div>
                          </div>

                          {/* Info & Badges */}
                          <div className="flex-1 min-w-0 space-y-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h5 className="font-bold text-sm sm:text-base text-slate-900">
                                Standard Stall (3m × 3m)
                              </h5>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                                Built Stall
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 font-mono">
                              3M × 3M Built Stall (B1–B22, H1–H8)
                            </p>

                            {/* Inclusion check pills */}
                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                              {pkg.perks.map((perk, i) => (
                                <span
                                  key={i}
                                  className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-slate-50 text-slate-700 border border-slate-200/70 font-medium"
                                >
                                  <Check className="w-2.5 h-2.5 text-emerald-600 stroke-[2.5]" />
                                  <span>{perk}</span>
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Bottom Price & Button */}
                        <div className="flex items-center justify-between pt-4 mt-3 border-t border-slate-100 pl-8">
                          <div>
                            <div className="font-mono font-bold text-sm text-slate-900">
                              NPR 85,000 – 1,80,000
                            </div>
                            <div className="font-mono text-[10px] text-slate-400">
                              USD 700 – 1,350
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              selectPackage(pkg.id);
                            }}
                            className="px-4 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 cursor-pointer"
                          >
                            Select Stall
                          </button>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Stall 2: Bare Space Stall (Custom) */}
                  {(() => {
                    const pkg = PARTICIPATION_PACKAGES.find((p) => p.id === "bare-space-stall")!;
                    const isSelected = selectedPackageId === pkg.id;
                    return (
                      <div
                        onClick={() => selectPackage(pkg.id)}
                        className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between bg-white relative ${
                          isSelected
                            ? "border-[#007A5E] ring-1.5 ring-[#007A5E] shadow-sm"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          {/* Radio */}
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center mt-1 shrink-0 ${
                              isSelected
                                ? "border-[#007A5E] bg-[#007A5E]"
                                : "border-slate-300 bg-white"
                            }`}
                          >
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>

                          {/* Raw Floor Isometric Graphic */}
                          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-slate-100 border border-slate-200/80 shrink-0 flex items-center justify-center p-2 overflow-hidden">
                            <div className="w-full h-full rounded-lg bg-gradient-to-tr from-slate-300 via-slate-200 to-slate-100 border border-slate-300 shadow-2xs flex items-center justify-center relative">
                              <div className="absolute inset-2 border border-dashed border-slate-400/60 rounded" />
                              <span className="font-mono text-[9px] font-bold text-slate-500">RAW AREA</span>
                            </div>
                          </div>

                          {/* Info & Badges */}
                          <div className="flex-1 min-w-0 space-y-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h5 className="font-bold text-sm sm:text-base text-slate-900">
                                Bare Space Stall (Custom)
                              </h5>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                                Raw Space
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 font-mono">
                              6M × 6M or 10M × 7M Raw Space (Block A / Block C)
                            </p>

                            {/* Inclusion check pills */}
                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                              {pkg.perks.map((perk, i) => (
                                <span
                                  key={i}
                                  className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-slate-50 text-slate-700 border border-slate-200/70 font-medium"
                                >
                                  <Check className="w-2.5 h-2.5 text-emerald-600 stroke-[2.5]" />
                                  <span>{perk}</span>
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Bottom Price & Button */}
                        <div className="flex items-center justify-between pt-4 mt-3 border-t border-slate-100 pl-8">
                          <div>
                            <div className="font-mono font-bold text-sm text-slate-900">
                              From NPR 3,78,000
                            </div>
                            <div className="font-mono text-[10px] text-slate-400">
                              From USD 3,000
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              selectPackage(pkg.id);
                            }}
                            className="px-4 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 cursor-pointer"
                          >
                            Select Stall
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* ─── CUSTOM MAP SELECTION BAR ─── */}
            {(packageFilter === "all" || packageFilter === "custom") && (() => {
              const pkg = PARTICIPATION_PACKAGES.find((p) => p.id === "custom-selection")!;
              const isSelected = selectedPackageId === pkg.id;
              return (
                <div
                  onClick={() => selectPackage(pkg.id)}
                  className={`p-3.5 sm:p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? "bg-white border-[#007A5E] ring-1.5 ring-[#007A5E] shadow-2xs"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected ? "border-[#007A5E] bg-[#007A5E]" : "border-slate-300 bg-white"
                      }`}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          Custom Map Selection
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                          Interactive
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Choose any stall directly on the interactive floor plan below
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 font-mono text-xs text-slate-500">
                    Per Stall
                  </div>
                </div>
              );
            })()}

            {/* ─── STALL ALLOCATION & FLOOR PLAN SCROLL ANCHOR ─── */}
            <div id="select-stall-section" ref={stallSelectionRef} className="scroll-mt-24 pt-1">
              {/* Active notification indicator */}
              {selectedPackage && (
                <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs shadow-2xs">
                  <div className="flex items-center gap-2 text-slate-700">
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${selectedPackage.id === "title-sponsor" ? "bg-amber-500 animate-pulse" : "bg-[#007A5E]"}`} />
                    <span>
                      <strong className="text-slate-900">{selectedPackage.name}</strong> selected.
                      {selectedPackage.id === "custom-selection" ? (
                        <span className="text-slate-500 ml-1">Pick stalls on the interactive floor plan below.</span>
                      ) : (
                        <span className="ml-1">
                          Assigned: <strong className="font-mono text-[#007A5E]">{selectedBoothNumbers.length > 0 ? `STALL ${selectedBoothNumbers.join(", ")}` : "None"}</strong>.
                        </span>
                      )}
                    </span>
                  </div>

                  {isCustomizedOnMap && selectedPackage.preferredStalls.length > 0 && (
                    <button
                      type="button"
                      onClick={() => selectPackage(selectedPackage.id, false)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset Stalls</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 2-Column Grid: Big Floor Plan (Left) & Sleek Compact Sidebar (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left: Floor Plan or List View (Big side: 9 cols on xl, 8 on lg) */}
            <div className="lg:col-span-8 xl:col-span-9">
              {viewMode === "map" ? (
                <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 p-1.5 sm:p-4">
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
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-sans font-bold text-sm">Stall {s.number}</span>
                              {s.isIrregular && (
                                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded font-bold bg-teal-100 text-teal-800 border border-teal-300">
                                  IRREGULAR BARE SPACE
                                </span>
                              )}
                              {s.isPrime && (
                                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                  ★ PRIME (+{primeSurchargePercent}%)
                                </span>
                              )}
                            </div>
                            {s.isIrregular ? (
                              <div className="text-right">
                                <span className="text-[11px] text-teal-700 font-bold font-mono block">
                                  NPR {s.ratePerSqMNPR?.toLocaleString() || "10,500"} / m²
                                </span>
                                <span className="text-[9px] text-teal-600 block font-mono">
                                  (${((s.ratePerSqMUSD || 83.33)).toFixed(2)}/m²)
                                </span>
                              </div>
                            ) : (
                              <span className="text-[10px] text-emerald-700 font-bold">
                                NPR {s.priceNPR.toLocaleString()}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-1">
                            {s.sizeSqM}m² ({s.dimensions})
                            {s.isIrregular
                              ? " · Irregular Bare Space"
                              : s.isBareSpace
                                ? " · Bare Space"
                                : ""} · {s.block}
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
                <div className="px-5 py-4 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
                  <div>
                    <h4 className="font-sans font-bold text-base text-slate-900 leading-tight">
                      Booking Summary
                    </h4>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Allocation &amp; Tariff
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-[#15803D] font-mono text-xs font-bold shrink-0">
                    {selectedBoothNumbers.length} {selectedBoothNumbers.length === 1 ? "Stall" : "Stalls"}
                  </span>
                </div>

                {/* Section 1: Selected Stalls List */}
                <div className="p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
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
                    <div className="space-y-2.5">
                      {/* Show first 2 stalls by default, collapse remaining if > 2 */}
                      {(showAllSelectedStalls
                        ? selectedStallObjects
                        : selectedStallObjects.slice(0, 2)
                      ).map((s) => (
                        <div
                          key={s.number}
                          className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200 hover:border-slate-300 transition-all text-xs space-y-2"
                        >
                          {/* Stall Number Header + Remove Button */}
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono font-bold text-slate-900 text-sm tracking-tight">
                              STALL {s.number}
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleStallSelection(s.number)}
                              className="w-5 h-5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-500 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                              title="Remove stall"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Stall Badges Row */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200/80 text-slate-700 font-semibold">
                              {s.block}
                            </span>
                            {s.isIrregular ? (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-teal-50 text-teal-800 border border-teal-200">
                                Irregular Bare
                              </span>
                            ) : s.isBareSpace ? (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                Bare Space
                              </span>
                            ) : (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                Shell Scheme
                              </span>
                            )}
                            {s.isPrime && (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-amber-50 text-amber-900 border border-amber-200">
                                ★ Prime (+{primeSurchargePercent}%)
                              </span>
                            )}
                          </div>

                          {/* Dimensions & Price */}
                          <div className="flex items-end justify-between text-xs pt-2 border-t border-slate-200/60">
                            <span className="text-[11px] text-slate-500 font-medium">
                              {s.isIrregular || s.dimensions?.toLowerCase().includes("custom")
                                ? `${s.sizeSqM} m² (Custom Area)`
                                : `${s.dimensions} · ${s.sizeSqM} m²`}
                            </span>
                            <div className="text-right font-mono">
                              {s.isIrregular ? (
                                <div>
                                  <span className="font-bold text-slate-900 text-xs block">
                                    NPR {s.priceNPR.toLocaleString()}
                                  </span>
                                  <span className="text-[10px] text-teal-700 block font-medium">
                                    NPR {s.ratePerSqMNPR?.toLocaleString() || "10,500"}/m²
                                  </span>
                                </div>
                              ) : (
                                <span className="font-bold text-slate-900 text-xs">
                                  NPR {s.priceNPR.toLocaleString()}
                                </span>
                              )}
                            </div>
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

                {/* Section 2: Specifications Summary */}
                {selectedStallObjects.length > 0 && (
                  <div className="px-5 py-3.5 bg-slate-50/80 border-t border-slate-100 space-y-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                      Specifications
                    </span>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Total Area</span>
                        <span className="font-mono font-bold text-slate-900">
                          {totalAreaSqM} m²{" "}
                          <span className="text-[11px] font-normal text-slate-400">
                            ({(totalAreaSqM * 10.76).toFixed(0)} sq.ft)
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/50">
                        <span className="text-slate-500 font-medium">Space Scheme</span>
                        <span className="font-semibold text-slate-800 text-right text-[11px]">
                          {selectedStallObjects.every((s) => s.isIrregular)
                            ? "Irregular Bare Space (Per m²)"
                            : selectedStallObjects.some((s) => s.isIrregular)
                              ? "Mixed (Irregular & Standard)"
                              : selectedStallObjects.every((s) => s.isBareSpace)
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
                <div className="p-4 sm:p-5 space-y-3.5 bg-white border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                      Payment Ledger
                    </span>
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      13% VAT INCLUDED
                    </span>
                  </div>

                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="font-sans font-medium text-slate-700">Base Stall Tariff</span>
                      <div className="text-right">
                        <span className="font-bold text-slate-900">
                          NPR {finalBasePriceNPR.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-normal">
                          (${finalBasePriceUSD.toLocaleString()})
                        </span>
                      </div>
                    </div>

                    {hasPrimeStalls && !isSponsorPackage && (
                      <div className="flex items-center justify-between text-amber-900 bg-amber-50/80 px-2 py-1 rounded-lg border border-amber-200">
                        <div className="flex items-center gap-1 font-sans text-[11px] font-semibold">
                          <Sparkles className="w-3 h-3 text-amber-600 shrink-0" />
                          <span>Prime Surcharge (+{primeSurchargePercent}%)</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-amber-900">
                            + NPR {totalPrimeSurchargeNPR.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-amber-700/80 block font-normal">
                            (+${totalPrimeSurchargeUSD.toLocaleString()})
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-slate-600">
                      <span className="font-sans font-medium text-slate-700">Govt. 13% VAT</span>
                      <div className="text-right">
                        <span className="font-bold text-slate-900">
                          + NPR {vatNPR.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-normal">
                          (+${vatUSD.toLocaleString()})
                        </span>
                      </div>
                    </div>

                    {/* Total Grand Row */}
                    <div className="pt-3 border-t border-slate-200 flex items-baseline justify-between">
                      <div>
                        <span className="font-sans font-bold text-xs text-slate-900 block">
                          {paymentMethod === "hold_72h" && isSponsorPackage ? "Amount Due Today" : "Total Payable"}
                        </span>
                        <span className="text-[10px] text-slate-400 font-sans block">
                          {paymentMethod === "hold_72h" && isSponsorPackage ? "72-Hour Free Hold" : "All taxes included"}
                        </span>
                      </div>
                      <div className="text-right">
                        {paymentMethod === "hold_72h" && isSponsorPackage ? (
                          <>
                            <div className="text-xl font-bold font-mono text-[#007A5E]">
                              FREE · NPR 0
                            </div>
                            <div className="text-xs font-mono text-slate-400">
                              USD $0 Today
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="text-xl font-bold font-mono text-[#15803D]">
                              NPR {totalWithVatNPR.toLocaleString()}
                            </div>
                            <div className="text-xs font-mono text-slate-500">
                              USD ${totalWithVatUSD.toLocaleString()}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {isSponsorPackage && (
                    <div className="p-2 rounded-lg bg-emerald-50 text-[11px] text-emerald-900 font-medium border border-emerald-200/60">
                      Includes {selectedPackage?.spaceDescription}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="pt-1 space-y-2">
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentMethod(exhibitorOrigin === "international" ? "bank" : "khalti");
                        handleNext();
                      }}
                      disabled={selectedBoothNumbers.length === 0}
                      className={`w-full py-3 px-4 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm ${selectedBoothNumbers.length === 0
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
                        : "bg-[#218A59] hover:bg-[#186a43] text-white hover:shadow-md cursor-pointer"
                        }`}
                    >
                      <span>
                        {selectedBoothNumbers.length === 0
                          ? "SELECT STALL TO CONTINUE"
                          : isSponsorPackage
                          ? `BOOK SPONSORSHIP DIRECTLY →`
                          : `CONTINUE (${selectedBoothNumbers.length} STALL${selectedBoothNumbers.length > 1 ? "S" : ""}) →`}
                      </span>
                    </button>

                    {/* FREE 72-HOUR HOLD BUTTON IN BOOKING SUMMARY */}
                    {selectedBoothNumbers.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setPaymentMethod("hold_72h");
                          handleNext();
                        }}
                        className="w-full py-2.5 px-4 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all border-2 border-[#007A5E] bg-emerald-50 text-[#007A5E] hover:bg-emerald-100 hover:shadow-xs cursor-pointer"
                      >
                        <Clock className="w-4 h-4 text-[#007A5E]" />
                        <span>FREE 72-HOUR HOLD (NPR 0 TODAY)</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Section 4: Assistance Footer */}
                <div className="px-5 py-3.5 bg-slate-50/80 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
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
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="font-sans font-bold text-2xl text-slate-900">
                Step 2: Exhibitor Organization Details
              </h3>
              {paymentMethod === "hold_72h" && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-mono font-bold border border-emerald-300">
                  72-HOUR FREE HOLD (NPR 0 TODAY)
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 font-normal mt-1">
              {paymentMethod === "hold_72h"
                ? `Enter organization contact details to place a 72-hour hold on ${selectedPackage && selectedPackage.id !== "custom-selection" ? selectedPackage.name : `Stalls (${selectedBoothNumbers.join(", ")})`}. Zero upfront payment.`
                : "Provide company details for official directory listing, badges, and invoice generation."}
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
              Step 3: Review &amp; Payment
            </h3>
            <p className="text-xs text-slate-600 font-normal mt-1">
              Verify your booking details and select your preferred payment option below.
            </p>
          </div>

          {/* Booking Summary Box - Clean & Minimal */}
          <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-slate-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">ALLOCATED STALLS</span>
                <div className="font-sans font-bold text-base text-[#218A59] mt-0.5">
                  STALL {selectedBoothNumbers.join(", ")}
                </div>
                <span className="text-[11px] text-slate-500">
                  {totalAreaSqM}m² · {selectedStallObjects.some((s) => s.isBareSpace) ? "Bare Space" : "Shell Scheme"}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">EXHIBITOR</span>
                <div className="font-sans font-bold text-base text-slate-900 mt-0.5">
                  {formData.companyName || "Organization"}
                </div>
                <span className="text-[11px] text-slate-500">
                  {formData.contactPerson} ({formData.country})
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <span className="text-[10px] font-mono text-slate-400 font-bold uppercase block">
                  {paymentMethod === "hold_72h" ? "AMOUNT DUE TODAY" : "TOTAL PAYABLE"}
                </span>
                <div className="font-sans font-bold text-lg text-[#15803D] mt-0.5">
                  {paymentMethod === "hold_72h" && isSponsorPackage
                    ? "FREE · NPR 0"
                    : exhibitorOrigin === "international"
                    ? `USD $${totalWithVatUSD.toLocaleString()}`
                    : `NPR ${totalWithVatNPR.toLocaleString()}`}
                </div>
                <span className="text-[10.5px] font-mono text-slate-500 block">
                  {paymentMethod === "hold_72h"
                    ? `Tariff: NPR ${totalWithVatNPR.toLocaleString()}`
                    : "13% VAT Included"}
                </span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-200/60 text-xs text-slate-600 flex flex-wrap items-center justify-between gap-2">
              {selectedPackage && selectedPackage.id !== "custom-selection" && (
                <div>
                  <span className="font-semibold text-slate-800">Package:</span> {selectedPackage.name}
                </div>
              )}
              <div>
                <span className="font-semibold text-slate-800">Email:</span> {formData.email}
              </div>
              <div>
                <span className="font-semibold text-slate-800">Phone:</span> {formData.phone}
              </div>
            </div>
          </div>

          {/* Payment Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-mono text-slate-700 font-bold uppercase">
                PAYMENT METHOD
              </label>
              <div className="flex items-center gap-1.5 text-[11px] font-mono">
                <span className="text-slate-500">Currency:</span>
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

            {/* 72-Hour Free Hold Card */}
            <div
              onClick={() => setPaymentMethod("hold_72h")}
              className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between gap-4 ${
                paymentMethod === "hold_72h"
                  ? "border-[#007A5E] bg-[#007A5E]/5 ring-2 ring-[#007A5E]/20"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-[#007A5E] text-white font-mono text-[10px] font-bold">
                    72-HOUR FREE HOLD
                  </span>
                  <h4 className="font-bold text-sm text-slate-900">
                    72-Hour Free Hold (NPR 0 Today)
                  </h4>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Hold your reservation for 72 hours with zero commitment. Automatically releases if not confirmed.
                </p>
              </div>
              {paymentMethod === "hold_72h" && (
                <CheckCircle2 className="w-5 h-5 text-[#007A5E] shrink-0" />
              )}
            </div>

            {exhibitorOrigin === "international" ? (
              /* International: USD SWIFT Wire */
              <div className="p-4 rounded-xl border-2 border-sky-400 bg-sky-50/40 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-sky-600 text-white font-mono text-[10px] font-bold">
                      SWIFT WIRE
                    </span>
                    <h4 className="font-bold text-sm text-slate-900">
                      USD Bank Wire (Pro-Forma Invoice)
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Provisional hold. Official USD Pro-Forma Invoice with SWIFT banking details issued upon confirmation.
                  </p>
                </div>
                <Landmark className="w-5 h-5 text-sky-600 shrink-0" />
              </div>
            ) : (
              /* Domestic: Khalti Only */
              <div
                onClick={() => setPaymentMethod("khalti")}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between gap-4 ${
                  paymentMethod === "khalti"
                    ? "border-[#5D2E8E] bg-[#5D2E8E]/5 ring-2 ring-[#5D2E8E]/20"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-[#5D2E8E] text-white font-mono text-[10px] font-bold">
                      KHALTI
                    </span>
                    <h4 className="font-bold text-sm text-slate-900">
                      Khalti Online Payment Gateway
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Instant checkout via Khalti Mobile Wallet, SCT Cards, Mobile Banking &amp; ConnectIPS.
                  </p>
                </div>
                {paymentMethod === "khalti" && (
                  <CheckCircle2 className="w-5 h-5 text-[#5D2E8E] shrink-0" />
                )}
              </div>
            )}
          </div>

          {/* Terms Agreement */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
            <input
              type="checkbox"
              id="terms-check"
              checked={agreedTerms}
              onChange={(e) => setAgreedTerms(e.target.checked)}
              className="w-4 h-4 text-[#218A59] rounded border-slate-300 focus:ring-[#218A59] cursor-pointer"
            />
            <label htmlFor="terms-check" className="text-xs text-slate-700 cursor-pointer select-none">
              I agree to the HIGEX 2027 Exhibition Regulations and booking terms.
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
            {paymentMethod === "hold_72h" ? (
              <Clock className="w-9 h-9 text-emerald-600" />
            ) : (
              <CheckCircle2 className="w-10 h-10" />
            )}
          </div>

          <div>
            <span className="font-mono text-xs text-[#059669] tracking-widest uppercase font-bold">
              {paymentMethod === "hold_72h"
                ? "72-HOUR FREE HOLD CONFIRMED"
                : "STALL RESERVATION SUBMITTED"}
            </span>
            <h3 className="font-sans font-bold text-3xl text-slate-900 mt-1">
              Thank You, {formData.companyName || "Partner"}!
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 font-normal mt-2 max-w-md mx-auto leading-relaxed">
              {paymentMethod === "hold_72h" ? (
                <>
                  Your <strong>72-Hour Free Hold</strong> for{" "}
                  <strong>
                    {selectedPackage && selectedPackage.id !== "custom-selection"
                      ? selectedPackage.name
                      : `STALL ${selectedBoothNumbers.join(", ")}`}
                  </strong>{" "}
                  is locked in at zero cost today.
                  Our exhibition team will contact you within 24 hours with details and wire invoice.
                </>
              ) : (
                <>
                  Your provisional booking for <strong>STALL {selectedBoothNumbers.join(", ")}</strong> has been received. Our exhibition team will issue your formal pro-forma invoice and exhibitor kit within 24 hours.
                </>
              )}
            </p>
          </div>

          <div className="inline-block p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 font-bold">
            REFERENCE ID: {bookingRef}
          </div>

          {paymentMethod === "hold_72h" && (
            <div className="max-w-md mx-auto p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1 font-mono text-center">
              <div className="font-bold flex items-center justify-center gap-1.5 text-amber-950">
                <Clock className="w-4 h-4 text-amber-700" />
                <span>Exclusivity Window: 72 Hours Active</span>
              </div>
              <p className="text-[11px] text-amber-800 font-sans">
                Zero payment due today. Complete your board formalities and wire remittance within 72 hours to finalize confirmation.
              </p>
            </div>
          )}

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
                  : paymentMethod === "hold_72h"
                    ? "bg-[#007A5E] hover:bg-[#005f49] cursor-pointer"
                    : exhibitorOrigin === "international" && step === 3
                      ? "bg-sky-600 hover:bg-sky-700 cursor-pointer"
                      : step === 3
                        ? "bg-[#5D2E8E] hover:bg-[#482370] cursor-pointer"
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
                        ? paymentMethod === "hold_72h"
                          ? "CONFIRM 72-HOUR FREE HOLD (NPR 0)"
                          : exhibitorOrigin === "international"
                            ? `CONFIRM & HOLD STALL (USD $${totalWithVatUSD.toLocaleString()})`
                            : `PAY WITH KHALTI (NPR ${totalWithVatNPR.toLocaleString()})`
                        : paymentMethod === "hold_72h"
                          ? "CONTINUE TO 72-HR HOLD REVIEW (NPR 0 DUE)"
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
