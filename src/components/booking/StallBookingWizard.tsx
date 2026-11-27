"use client";

import React, { useState, useEffect, useRef } from "react";
import { trackFunnel } from "@/lib/funnel";
import { useSearchParams, useRouter } from "next/navigation";
import { officialStalls } from "@/data/officialFloorPlanData";
import savedFloorPlanFallback from "@/data/savedCustomFloorPlan.json";
import InteractiveFloorPlan from "@/components/floor-plan/InteractiveFloorPlan";
import confetti from "canvas-confetti";
import PaymentInstructions from "./PaymentInstructions";
import { effectiveStallStatus, findOverride, isStatusTaken, BOOKING_PAYMENT_MINUTES } from "@/lib/stallAvailability";
import PaymentCountdown from "./PaymentCountdown";
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

import { PARTICIPATION_PACKAGES, type StallPackage } from "@/data/participationPackages";
import { quoteBooking, resolveStall, isActualStall } from "@/lib/stallPricing";
export { PARTICIPATION_PACKAGES, type StallPackage };


export default function StallBookingWizard() {
  const router = useRouter();
  // Scroll back to the top of the wizard whenever the step changes, so a shorter
  // next step doesn't leave the viewport sitting on the page footer.
  const wizardTopRef = useRef<HTMLDivElement>(null);
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
  // Funnel: moving past stall selection counts as starting a booking
  useEffect(() => {
    if (step >= 2) trackFunnel("stall_booking", "start");
  }, [step]);
  const isFirstStepRenderRef = useRef(true);
  useEffect(() => {
    if (isFirstStepRenderRef.current) {
      isFirstStepRenderRef.current = false;
      return;
    }
    wizardTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);
  const [selectedBoothNumbers, setSelectedBoothNumbers] = useState<string[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState<string>("custom-selection");
  const [packageFilter, setPackageFilter] = useState<"all" | "sponsor" | "custom">("all");
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
  // "hold" = free 72-hour hold on the stalls, "book" = stall held BOOKING_PAYMENT_MINUTES while they pay
  // and upload a receipt; not confirmed until the team verifies the payment
  const [reservationType, setReservationType] = useState<"book" | "hold">("book");
  // "Book" payment window: ends at paymentDueBy unless a receipt is uploaded first
  const [paymentDueBy, setPaymentDueBy] = useState<string>("");
  const [paymentWindowExpired, setPaymentWindowExpired] = useState(false);
  const [receiptResult, setReceiptResult] = useState<{ stallsLost: string[] } | null>(null);

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

  // Stall details & price — shared with the server so the charged amount matches what's shown
  const pricingInputs = { elements, boothOverrides, primeSurchargePercent };
  const findStall = (num: string) => resolveStall(num, pricingInputs);
  // A stall is free unless the admin override or floor plan marks it booked/reserved/held
  const isStallFree = (el: { number?: string; id?: string; status?: string }) =>
    !isStatusTaken(effectiveStallStatus(findOverride(boothOverrides, el.number, el.id), el.status));

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
      setReservationType("hold");
      setStep(2);
    }
  }, [queryHold]);

  const {
    totalAreaSqM,
    totalPrimeSurchargeNPR,
    totalPrimeSurchargeUSD,
    hasPrimeStalls,
    finalPriceNPR,
    finalPriceUSD,
    finalBasePriceNPR,
    finalBasePriceUSD,
    vatNPR,
    vatUSD,
    totalWithVatNPR,
    totalWithVatUSD,
  } = quoteBooking(selectedBoothNumbers, isSponsorPackage ? selectedPackageId : null, pricingInputs);

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
      .filter((el: any) => isStallFree(el));

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
          return isStallFree(el);
        })
        .map((el: any) => findStall(el.number || el.id));
    }

    return officialStalls
      .filter((s) => isStallFree(s))
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

      // Form is valid: record the hold / booking in the admin panel
      const isHold = reservationType === "hold";
      const ref = `HHE26-STALL-${Math.floor(100000 + Math.random() * 900000)}`;
      const resolvedIndustry =
        formData.industryCategory === "Other" ? customIndustry.trim() : formData.industryCategory;
      const tag = `[${exhibitorOrigin.toUpperCase()} EXHIBITOR] ${isHold ? "[72-HOUR FREE HOLD] " : "[ONLINE BOOKING] "}`;

      setIsSubmitting(true);
      try {
        const response = await fetch("/api/payment/initiate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bookingId: ref,
            stallNumbers: selectedBoothNumbers,
            packageId: selectedPackageId,
            amountNPR: isHold ? 0 : totalWithVatNPR,
            amountUSD: isHold ? 0 : totalWithVatUSD,
            customerName: formData.contactPerson || formData.companyName,
            contactPerson: formData.contactPerson.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            company: formData.companyName.trim(),
            country: formData.country.trim(),
            website: formData.website.trim(),
            fasciaName: (formData.fasciaName || formData.companyName).trim(),
            boothType: selectedStallObjects.every((s) => s.isBareSpace) ? "Bare Space" : "Standard",
            powerOption: "Standard 15A Included",
            industryCategory: resolvedIndustry,
            packageName: selectedPackage && selectedPackage.id !== "custom-selection" ? selectedPackage.name : undefined,
            packageType: selectedPackage ? selectedPackage.type : "stall",
            packagePerks: selectedPackage && selectedPackage.perks ? selectedPackage.perks : [],
            specialRequirements:
              (selectedPackage && selectedPackage.id !== "custom-selection"
                ? `${tag}Package: ${selectedPackage.name} | Stalls: ${selectedBoothNumbers.join(", ")}`
                : `${tag}Stalls: ${selectedBoothNumbers.join(", ")}`) +
              (formData.specialRequirements.trim() ? ` | Notes: ${formData.specialRequirements.trim()}` : ""),
            paymentMethod: isHold ? "hold_72h" : "book",
            isHold72h: isHold,
          }),
        });
        const data = await response.json();
        if (response.status === 409 && Array.isArray(data.takenStalls)) {
          // Someone else got there first: drop those stalls, mark them taken and go back to the map
          const takenLower = new Set<string>(data.takenStalls.map((s: string) => s.toLowerCase()));
          setSelectedBoothNumbers((prev) => prev.filter((s) => !takenLower.has(s.toLowerCase())));
          setBoothOverrides((prev) => {
            const next = { ...prev };
            for (const s of data.takenStalls as string[]) next[s] = { ...(next[s] || {}), status: "Reserved" };
            return next;
          });
          setStep(1);
          setFormError(data.error);
          return;
        }
        if (!response.ok || !data.success) {
          throw new Error(data.error || "Failed to submit your reservation. Please try again.");
        }
        trackFunnel("stall_booking", "submit");
        const finalRef: string = data.bookingId || ref;
        setBookingRef(finalRef);

        if (isHold) {
          // Stalls are now on a 72-hour hold in the exhibitor's name
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
          if (data.redirectUrl) {
            router.push(data.redirectUrl);
            return;
          }
          setPaymentMethod("hold_72h");
          setStep(4);
          return;
        }

        // Booking: stall held for the payment window; show the timer and payment details
        setPaymentDueBy(
          typeof data.paymentDueBy === "string"
            ? data.paymentDueBy
            : new Date(Date.now() + BOOKING_PAYMENT_MINUTES * 60 * 1000).toISOString()
        );
        setPaymentWindowExpired(false);
        setReceiptResult(null);
        setStep(4);
      } catch (err: any) {
        console.error("Reservation error:", err);
        setFormError(err.message || "An error occurred while submitting your reservation. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
      return;
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
            packageId: selectedPackageId,
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
            packageName: selectedPackage && selectedPackage.id !== "custom-selection" ? selectedPackage.name : undefined,
            packageType: selectedPackage ? selectedPackage.type : "stall",
            packagePerks: selectedPackage && selectedPackage.perks ? selectedPackage.perks : [],
            specialRequirements:
              selectedPackage && selectedPackage.id !== "custom-selection"
                ? `[${exhibitorOrigin.toUpperCase()} EXHIBITOR] ${paymentMethod === "hold_72h" ? "[72-HOUR FREE HOLD] " : ""}Package: ${selectedPackage.name} | Stalls: ${selectedBoothNumbers.join(", ")}`
                : `[${exhibitorOrigin.toUpperCase()} EXHIBITOR] ${paymentMethod === "hold_72h" ? "[72-HOUR FREE HOLD] " : ""}Stalls: ${selectedBoothNumbers.join(", ")}`,
            paymentMethod: paymentMethod === "hold_72h" ? "hold_72h" : exhibitorOrigin === "international" ? "bank" : paymentMethod,
            isHold72h: paymentMethod === "hold_72h",
          }),
        });

        const data = await response.json();

        if (response.ok && data.success) trackFunnel("stall_booking", "submit");
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

        // If redirect URL returned (Khalti gateway redirect for domestic)
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

  // Step 3 (online payment) is bypassed: the details form submits by composing an email
  const displayStep = step === 4 ? 3 : step;

  const handlePrev = () => {
    setFormError("");
    setStep((prev) => Math.max(prev - 1, 1));
  };

  return (
    <div ref={wizardTopRef} className="w-full p-6 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-md scroll-mt-24">
      {/* Step Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3 text-xs font-mono text-slate-500 font-semibold">
          <span className="text-[#218A59] font-bold">
            STEP 0{displayStep} OF 03:{" "}
            {step === 1
              ? "SELECT STALL(S)"
              : step === 2
                ? "ORGANIZATION DETAILS"
                : reservationType === "hold"
                    ? "HOLD CONFIRMED"
                    : "PAYMENT"}
          </span>
          <span>{Math.round((displayStep / 3) * 100)}% COMPLETED</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
          <div
            style={{ width: `${(displayStep / 3) * 100}%` }}
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
                { key: "all", label: "All Packages", count: 8 },
                { key: "sponsor", label: "Sponsorship Tiers", count: 7 },
                { key: "custom", label: "Select Stall", count: 1 },
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

            {/* ─── SELECT STALL BAR (pick stalls on the floor plan) ─── */}
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
                          Select Stall
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                          Floor plan
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Pick one or more available stalls on the floor plan below
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

                  {/* Action Button: Continue to organization details form */}
                  <div className="pt-1">
                    {selectedBoothNumbers.length > 0 ? (
                      <button
                        type="button"
                        onClick={handleNext}
                        className="w-full py-3.5 px-4 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm bg-[#007A5E] hover:bg-[#00664e] text-white hover:shadow-md cursor-pointer text-center"
                      >
                        <span>CONTINUE TO DETAILS ({selectedBoothNumbers.length} STALL{selectedBoothNumbers.length > 1 ? "S" : ""})</span>
                        <ArrowRight className="w-4 h-4 shrink-0" />
                      </button>
                    ) : (
                      <div className="w-full py-3 px-4 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 bg-slate-100 text-slate-400 text-center">
                        <span>SELECT STALL ON FLOOR PLAN</span>
                      </div>
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
                  <div className="flex flex-wrap items-center gap-1.5 text-slate-600 font-mono">
                    <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                    <a href="mailto:Shrestha.anup101@gmail.com" className="hover:text-emerald-700 hover:underline">
                      Shrestha.anup101@gmail.com
                    </a>
                    <span className="text-slate-400">|</span>
                    <a href="mailto:info@himalayanenergyexpo.com" className="hover:text-emerald-700 hover:underline">
                      info@himalayanenergyexpo.com
                    </a>
                    <span className="text-slate-400">|</span>
                    <a href="mailto:himalayangreenenergyexpo@gmail.com" className="hover:text-emerald-700 hover:underline">
                      himalayangreenenergyexpo@gmail.com
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
              {reservationType === "hold" && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-mono font-bold border border-emerald-300">
                  72-HOUR FREE HOLD (NPR 0 TODAY)
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 font-normal mt-1">
              {reservationType === "hold"
                ? `Enter organization contact details to place a 72-hour hold on ${selectedPackage && selectedPackage.id !== "custom-selection" ? selectedPackage.name : `Stalls (${selectedBoothNumbers.join(", ")})`}. Zero upfront payment.`
                : "Provide company details for official directory listing, badges, and invoice generation."}
            </p>
          </div>

          {/* Reservation Type: Hold vs Book */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <label className="block text-xs font-mono text-slate-700 font-bold uppercase tracking-wider">
              WHAT WOULD YOU LIKE TO DO? *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {([
                {
                  value: "book" as const,
                  title: "Book Stall",
                  desc: `We hold the stall for ${BOOKING_PAYMENT_MINUTES} minutes while you pay by QR or bank transfer and upload the receipt. Confirmed once payment is verified.`,
                  Icon: Mail,
                },
                {
                  value: "hold" as const,
                  title: "Hold for 72 Hours",
                  desc: "Hold the stall free in your name for 72 hours while you decide. No payment today.",
                  Icon: Clock,
                },
              ]).map(({ value, title, desc, Icon }) => {
                const active = reservationType === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setReservationType(value);
                      // Keep the summary/confirmation copy in sync with the chosen option
                      if (value === "book" && paymentMethod === "hold_72h") {
                        setPaymentMethod(exhibitorOrigin === "international" ? "bank" : "khalti");
                      }
                    }}
                    aria-pressed={active}
                    className={`text-left p-4 rounded-xl border-2 transition-all cursor-pointer ${active
                      ? "border-[#007A5E] bg-emerald-50/70"
                      : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 shrink-0 ${active ? "text-[#007A5E]" : "text-slate-400"}`} />
                      <span className="font-sans font-bold text-sm text-slate-900">{title}</span>
                    </div>
                    <p className="text-[11.5px] text-slate-600 leading-relaxed mt-1.5">{desc}</p>
                  </button>
                );
              })}
            </div>
            {exhibitorOrigin === "international" && reservationType === "book" && (
              <p className="text-[11.5px] text-sky-800 bg-sky-50 border border-sky-200 rounded-lg px-3 py-2 leading-relaxed">
                Paying by international bank wire? A SWIFT transfer usually can&apos;t be completed in {BOOKING_PAYMENT_MINUTES} minutes,
                so choose <strong>Hold for 72 Hours</strong> instead.
              </p>
            )}
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
                    Companies registered in Nepal. Payments settled in NPR via Khalti or Local Bank Wire.
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
                      href="https://wa.me/9779851004985?text=Hello%2C%20I%20am%20an%20international%20exhibitor%20inquiring%20about%20stall%20booking."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366] text-white text-xs font-semibold hover:bg-[#20ba59] transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp (+977 9851004985)</span>
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
          {paymentMethod === "hold_72h" ? (
            <>
              <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-300 text-[#059669] flex items-center justify-center mx-auto shadow-xs">
                <Clock className="w-9 h-9 text-emerald-600" />
              </div>
              <div>
                <span className="font-mono text-xs text-[#059669] tracking-widest uppercase font-bold">
                  72-HOUR FREE HOLD CONFIRMED
                </span>
                <h3 className="font-sans font-bold text-3xl text-slate-900 mt-1">
                  Thank You, {formData.companyName || "Partner"}!
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 font-normal mt-2 max-w-md mx-auto leading-relaxed">
                  Your <strong>72-Hour Free Hold</strong> for{" "}
                  <strong>
                    {selectedPackage && selectedPackage.id !== "custom-selection"
                      ? selectedPackage.name
                      : `STALL ${selectedBoothNumbers.join(", ")}`}
                  </strong>{" "}
                  is locked in at zero cost today.
                  Our exhibition team will contact you within 24 hours with details and wire invoice.
                </p>
              </div>
            </>
          ) : receiptResult ? (
            <div>
              <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-300 text-[#059669] flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <span className="block mt-3 font-mono text-xs text-[#059669] tracking-widest uppercase font-bold">
                RECEIPT RECEIVED – AWAITING VERIFICATION
              </span>
              <h3 className="font-sans font-bold text-3xl text-slate-900 mt-1">
                Thank You, {formData.companyName || "Partner"}!
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 font-normal mt-2 max-w-md mx-auto leading-relaxed">
                {receiptResult.stallsLost.length > 0 ? (
                  <>
                    Your reservation time had run out and stall <strong>{receiptResult.stallsLost.join(", ")}</strong> is no longer held for you.
                    Our team will check your payment and contact you about your stall.
                  </>
                ) : (
                  <>
                    <strong>STALL {selectedBoothNumbers.join(", ")}</strong> stays reserved for you while our team verifies the payment
                    and confirms your booking within 24 hours; we&apos;ve emailed you at{" "}
                    <strong>{formData.email}</strong>.
                  </>
                )}
              </p>
            </div>
          ) : paymentWindowExpired ? (
            <div className="max-w-md mx-auto space-y-3">
              <span className="block font-mono text-xs text-rose-700 tracking-widest uppercase font-bold">
                RESERVATION TIME EXPIRED
              </span>
              <h3 className="font-sans font-bold text-2xl text-slate-900">Your stall hold has ended</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                <strong>STALL {selectedBoothNumbers.join(", ")}</strong> was not paid for within {BOOKING_PAYMENT_MINUTES} minutes and has been
                released. If you have already paid, upload the receipt below and our team will contact you. Otherwise you can start again.
              </p>
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setBookingRef("");
                  setPaymentDueBy("");
                  setPaymentWindowExpired(false);
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#007A5E] hover:bg-[#00664e] text-white font-mono text-xs font-bold cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>START AGAIN</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <span className="block font-mono text-xs text-amber-700 tracking-widest uppercase font-bold">
                NOT CONFIRMED YET – PAYMENT PENDING
              </span>
              <h3 className="font-sans font-bold text-2xl sm:text-3xl text-slate-900">
                Complete your payment within {BOOKING_PAYMENT_MINUTES} minutes
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 font-normal max-w-lg mx-auto leading-relaxed">
                We&apos;re holding <strong>STALL {selectedBoothNumbers.join(", ")}</strong> for you. Pay by QR or bank transfer and
                upload your receipt before the timer runs out. If no receipt arrives in time, the stall is released for other exhibitors.
              </p>
              {paymentDueBy && (
                <PaymentCountdown dueBy={paymentDueBy} onExpire={() => setPaymentWindowExpired(true)} />
              )}
            </div>
          )}

          <div className="inline-block p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 font-bold">
            REFERENCE ID: {bookingRef}
          </div>

          {bookingRef && (
            <div className="max-w-3xl mx-auto">
              <PaymentInstructions
                bookingRef={bookingRef}
                stalls={selectedBoothNumbers.join(", ")}
                amountNPR={totalWithVatNPR}
                amountUSD={totalWithVatUSD}
                international={exhibitorOrigin === "international"}
                email={formData.email.trim()}
                title={paymentMethod === "hold_72h" ? "Ready to Confirm? Pay Within 72 Hours" : "Pay Now and Upload Your Receipt"}
                onReceiptUploaded={(result) => {
                  setReceiptResult(result);
                  if (result.stallsLost.length === 0) {
                    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
                  }
                }}
              />
            </div>
          )}

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

          {(paymentMethod === "hold_72h" || receiptResult) && (
          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => window.print()}
              className="px-6 py-3.5 rounded-full bg-white text-slate-900 font-mono text-xs font-bold border border-slate-300 hover:border-[#218A59] transition-all flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#218A59]" />
              <span>{paymentMethod === "hold_72h" ? "DOWNLOAD HOLD CONFIRMATION" : "DOWNLOAD RECEIPT ACKNOWLEDGEMENT"}</span>
            </button>
          </div>
          )}
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
                    {step === 2 && (reservationType === "hold" ? <Clock className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />)}
                    <span>
                      {step === 2
                        ? reservationType === "hold"
                          ? "HOLD STALL FOR 72 HOURS (NPR 0)"
                          : `BOOK & PAY NOW (${BOOKING_PAYMENT_MINUTES} MIN)`
                        : step === 3
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
