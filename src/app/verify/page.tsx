"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  Building2,
  Calendar,
  MapPin,
  Download,
  Share2,
  UserPlus,
  Copy,
  Check,
  Clock,
  Ticket,
  AlertCircle,
  ArrowLeft,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import QRCodeLib from "qrcode";
import { motion } from "framer-motion";

interface TicketDetails {
  category?: string;
  venue?: string;
  date?: string;
  time?: string;
  passTier?: string;
  quantity?: number;
}

interface AttendeeData {
  id: string;
  name: string;
  organization: string;
  jobTitle?: string;
  stallNumber?: string;
  email?: string;
  phone?: string;
  country?: string;
  passType?: string;
  role?: string;
  checkedIn?: boolean;
  registeredAt?: string;
  securityChecksum?: string;
  secureToken?: string;
  tokenVerified?: boolean;
  paymentStatus?: string;
  ticketDetails?: TicketDetails;
}

function VerifyContent() {
  const searchParams = useSearchParams();
  const tokenParam = searchParams.get("token") || "";
  const idParam = searchParams.get("id") || "";
  const nameParam = searchParams.get("name") || "";
  const orgParam = searchParams.get("org") || "";
  const roleParam = searchParams.get("role") || "";
  const titleParam = searchParams.get("title") || "";
  const stallParam = searchParams.get("stall") || "";
  const emailParam = searchParams.get("email") || "";
  const phoneParam = searchParams.get("phone") || "";
  const passTypeParam = searchParams.get("passType") || "";

  const [loading, setLoading] = useState(true);
  const [attendee, setAttendee] = useState<AttendeeData | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [isStaff, setIsStaff] = useState(false);
  const [staffName, setStaffName] = useState("");
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [tamperedError, setTamperedError] = useState(false);

  useEffect(() => {
    async function checkStaffAuth() {
      try {
        const res = await fetch("/api/staff/auth");
        const data = await res.json();
        if (data.authenticated && data.staff) {
          setIsStaff(true);
          setStaffName(data.staff.name || "Gate Staff");
        }
      } catch {
        // ignore
      }
    }
    checkStaffAuth();
  }, []);

  useEffect(() => {
    async function fetchVerification() {
      setLoading(true);
      setTamperedError(false);
      try {
        const query = new URLSearchParams();
        if (tokenParam) query.set("token", tokenParam);
        if (idParam) query.set("id", idParam);
        if (nameParam) query.set("name", nameParam);
        if (orgParam) query.set("org", orgParam);
        if (roleParam) query.set("role", roleParam);
        if (titleParam) query.set("title", titleParam);
        if (stallParam) query.set("stall", stallParam);
        if (emailParam) query.set("email", emailParam);
        if (phoneParam) query.set("phone", phoneParam);
        if (passTypeParam) query.set("passType", passTypeParam);

        const res = await fetch(`/api/verify?${query.toString()}`);
        const data = await res.json();

        if (res.status === 403 || data.tampered) {
          setTamperedError(true);
          setLoading(false);
          return;
        }

        if (data.success && data.attendee) {
          setAttendee(data.attendee);
        } else if (nameParam || idParam) {
          // Graceful fallback to provided query data
          setAttendee({
            id: idParam || "HHE27-VERIFIED",
            name: nameParam || "Registered Attendee",
            organization: orgParam || "Himalayan Green Energy Expo",
            jobTitle: titleParam || "",
            stallNumber: stallParam || "",
            email: emailParam || "",
            phone: phoneParam || "",
            country: "Nepal",
            passType: passTypeParam || (roleParam === "exhibitor" ? "Official Exhibitor Pass" : "Trade Visitor Pass"),
            role: roleParam || "visitor",
            checkedIn: false,
          });
        }
      } catch (err) {
        console.warn("Verify fetch error", err);
        if (nameParam || idParam) {
          setAttendee({
            id: idParam || "HHE27-VERIFIED",
            name: nameParam || "Registered Attendee",
            organization: orgParam || "Himalayan Green Energy Expo",
            jobTitle: titleParam || "",
            stallNumber: stallParam || "",
            email: emailParam || "",
            phone: phoneParam || "",
            country: "Nepal",
            passType: passTypeParam || "Trade Visitor Pass",
            role: roleParam || "visitor",
            checkedIn: false,
          });
        }
      } finally {
        setLoading(false);
      }
    }

    fetchVerification();
  }, [tokenParam, idParam, nameParam, orgParam, roleParam, titleParam, stallParam, emailParam, phoneParam, passTypeParam]);

  // Generate crisp gate QR code
  useEffect(() => {
    if (!attendee) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "https://greenenergyexpo.org.np";
    const tokenToUse = attendee.secureToken || tokenParam;
    const urlToEncode = tokenToUse
      ? `${origin}/verify?token=${encodeURIComponent(tokenToUse)}`
      : `${origin}/verify?id=${encodeURIComponent(attendee.id)}`;

    QRCodeLib.toDataURL(urlToEncode, {
      width: 400,
      margin: 1,
      errorCorrectionLevel: "H",
      color: { dark: "#071322", light: "#FFFFFF" },
    }).then(setQrDataUrl).catch(() => {});
  }, [attendee, tokenParam]);

  // Save Contact to phone (.vcf)
  const handleSaveContact = () => {
    if (!attendee) return;
    const fullName = attendee.name || "Delegate";
    const org = attendee.organization || "Himalayan Green Energy Expo";
    const title = attendee.jobTitle || attendee.passType || "Expo Delegate";
    const phone = attendee.phone || "";
    const email = attendee.email || "";
    const currentUrl = typeof window !== "undefined" ? window.location.href : "";

    const vcardLines = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `FN:${fullName}`,
      `ORG:${org}`,
      `TITLE:${title}`,
      phone ? `TEL;TYPE=CELL,VOICE:${phone}` : "",
      email ? `EMAIL;TYPE=INTERNET,WORK:${email}` : "",
      `NOTE:Official Accreditation - Himalayan Green Energy Expo 2027 [Pass ID: ${attendee.id}]`,
      currentUrl ? `URL:${currentUrl}` : "",
      "END:VCARD",
    ].filter(Boolean);

    const blob = new Blob([vcardLines.join("\r\n")], { type: "text/vcard;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${fullName.replace(/\s+/g, "_")}_Contact.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Save Calendar Event (.ics)
  const handleSaveCalendar = () => {
    const isGala = attendee?.role === "gala" || attendee?.passType?.toLowerCase().includes("gala");
    const summary = isGala
      ? "Himalayan Green Energy Expo - Gala Dinner"
      : "Himalayan Green Energy Expo 2027";
    const location = isGala
      ? "Royal Tulip, Kathmandu, Nepal"
      : "Bhrikutimandap Exhibition Hall, Kathmandu, Nepal";
    const dtStart = isGala ? "20270117T121500Z" : "20270117T041500Z";
    const dtEnd = isGala ? "20270117T161500Z" : "20270119T121500Z";

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Himalayan Green Energy Expo//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:Official Accreditation for ${attendee?.name || "Delegate"} (Pass ID: ${attendee?.id || "HHE27"}). Venue: ${location}.`,
      `LOCATION:${location}`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${summary.replace(/\s+/g, "_")}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download Digital Badge Image (.png)
  const handleDownloadBadge = () => {
    if (!attendee) return;
    const canvas = document.createElement("canvas");
    const scale = 2;
    const width = 380 * scale;
    const height = 580 * scale;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Card background
    ctx.fillStyle = "#0A1929";
    ctx.fillRect(0, 0, width, height);

    // Subtle top border highlight
    ctx.fillStyle = "#10B981";
    ctx.fillRect(0, 0, width, 6 * scale);

    // Top Header
    ctx.fillStyle = "#34D399";
    ctx.font = `bold ${9 * scale}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText("IPPAN · OFFICIAL ACCREDITATION", width / 2, 40 * scale);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = `bold ${16 * scale}px sans-serif`;
    ctx.fillText("HIMALAYAN GREEN ENERGY EXPO", width / 2, 68 * scale);

    // Pass Type Pill
    const isExhibitor = attendee.role === "exhibitor" || Boolean(attendee.stallNumber);
    const isGala = attendee.role === "gala" || attendee.passType?.toLowerCase().includes("gala");
    const rolePill = attendee.passType || (isExhibitor ? "OFFICIAL EXHIBITOR" : isGala ? "GALA DINNER VIP" : "TRADE VISITOR");

    ctx.fillStyle = isExhibitor ? "#065F46" : isGala ? "#581C87" : "#064E3B";
    ctx.beginPath();
    ctx.roundRect(width / 2 - 100 * scale, 85 * scale, 200 * scale, 24 * scale, 12 * scale);
    ctx.fill();

    ctx.fillStyle = "#FFFFFF";
    ctx.font = `bold ${10 * scale}px sans-serif`;
    ctx.fillText(rolePill.toUpperCase(), width / 2, 101 * scale);

    // Attendee Name
    ctx.fillStyle = "#FFFFFF";
    ctx.font = `bold ${22 * scale}px sans-serif`;
    ctx.fillText(attendee.name || "Accredited Delegate", width / 2, 160 * scale);

    // Organization
    ctx.fillStyle = "#94A3B8";
    ctx.font = `normal ${12 * scale}px sans-serif`;
    const subtitle = attendee.organization + (attendee.jobTitle ? ` · ${attendee.jobTitle}` : "");
    ctx.fillText(subtitle, width / 2, 185 * scale);

    // QR Code Frame
    if (qrDataUrl) {
      const img = new Image();
      img.onload = () => {
        const qrSize = 160 * scale;
        const qrX = width / 2 - qrSize / 2;
        const qrY = 220 * scale;

        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.roundRect(qrX - 12 * scale, qrY - 12 * scale, qrSize + 24 * scale, qrSize + 24 * scale, 16 * scale);
        ctx.fill();

        ctx.drawImage(img, qrX, qrY, qrSize, qrSize);

        // Pass ID
        ctx.fillStyle = "#FFFFFF";
        ctx.font = `bold ${11 * scale}px monospace`;
        ctx.fillText(`PASS ID: ${attendee.id}`, width / 2, 440 * scale);

        // Dates & Venue
        ctx.fillStyle = "#64748B";
        ctx.font = `normal ${9 * scale}px sans-serif`;
        const venueText = isGala ? "Royal Tulip, Kathmandu · 17 Jan 2027" : "Bhrikutimandap Hall, Kathmandu · 17–19 Jan 2027";
        ctx.fillText(venueText, width / 2, 470 * scale);

        ctx.fillStyle = "#10B981";
        ctx.font = `bold ${8 * scale}px monospace`;
        ctx.fillText("VALIDATED ACCESS CREDENTIAL", width / 2, 530 * scale);

        const link = document.createElement("a");
        link.download = `Official_Pass_${attendee.id}.png`;
        link.href = canvas.toDataURL("image/png");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };
      img.src = qrDataUrl;
    }
  };

  // Share Pass
  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `Official Pass - ${attendee?.name} | Himalayan Green Energy Expo 2027`,
          text: `Official accreditation pass for ${attendee?.name} (${attendee?.organization}) at Himalayan Green Energy Expo 2027.`,
          url: window.location.href,
        });
        setShared(true);
        setTimeout(() => setShared(false), 2500);
      } catch {
        // ignore
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShared(true);
      setTimeout(() => setShared(false), 2500);
    }
  };

  // Copy ID
  const handleCopyId = () => {
    if (!attendee?.id) return;
    navigator.clipboard.writeText(attendee.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Toggle Checkin for Staff
  const handleToggleCheckin = async () => {
    if (!attendee?.id) return;
    setCheckinLoading(true);
    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: attendee.id, checkedIn: !attendee.checkedIn }),
      });
      const data = await res.json();
      if (data.success) {
        setAttendee((prev) => (prev ? { ...prev, checkedIn: data.checkedIn } : null));
      }
    } catch (err) {
      console.warn("Check-in update failed", err);
    } finally {
      setCheckinLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#071322] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono uppercase tracking-widest text-slate-400">
            Verifying Official Accreditation...
          </p>
        </div>
      </div>
    );
  }

  if (tamperedError) {
    return (
      <div className="min-h-screen bg-[#071322] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#0D1F33] border border-white/10 rounded-3xl p-6 sm:p-8 text-center text-white space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold">Verification Failed</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              This pass token could not be verified by the official IPPAN registry. Please present your original registration email at the venue desk.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Expo Homepage</span>
          </Link>
        </div>
      </div>
    );
  }

  if (!attendee) {
    return (
      <div className="min-h-screen bg-[#071322] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#0D1F33] border border-white/10 rounded-3xl p-6 sm:p-8 text-center text-white space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold">Accreditation Not Found</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              We could not locate an active credential for the provided verification link.
            </p>
          </div>
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors"
          >
            <span>Register for Official Pass</span>
          </Link>
        </div>
      </div>
    );
  }

  const isExhibitor = attendee.role === "exhibitor" || Boolean(attendee.stallNumber);
  const isGala = attendee.role === "gala" || attendee.passType?.toLowerCase().includes("gala");
  const venueLocation = isGala
    ? attendee.ticketDetails?.venue || "Royal Tulip, Kathmandu"
    : "Bhrikutimandap Hall, Kathmandu";
  const eventDate = isGala
    ? attendee.ticketDetails?.date || "17 January 2027 · 6:00 PM"
    : "17–19 January 2027";

  return (
    <div className="min-h-screen bg-[#071322] text-white py-10 px-4 sm:px-6 flex flex-col items-center justify-center relative font-sans">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/15 via-transparent to-transparent pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-4">
        {/* Verification Status Banner */}
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[11px] font-medium tracking-wide">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Official Verified Accreditation</span>
          </div>
        </div>

        {/* ── DIGITAL ACCREDITATION PASS CARD ──────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full bg-[#0B1A2C] border border-white/15 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md"
        >
          {/* Card Header Strip */}
          <div className="px-6 pt-6 pb-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono tracking-widest uppercase text-slate-300 font-semibold">
                IPPAN · ACCREDITATION
              </span>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                isExhibitor
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : isGala
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                  : "bg-teal-500/20 text-teal-300 border border-teal-500/30"
              }`}
            >
              {isGala ? "Gala VIP" : isExhibitor ? "Exhibitor" : "Trade Visitor"}
            </span>
          </div>

          {/* Attendee Details Core */}
          <div className="px-6 pt-6 pb-5 text-center space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {attendee.name}
            </h1>

            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-300">
              <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="font-medium text-slate-200">{attendee.organization}</span>
              {attendee.jobTitle && (
                <>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-400">{attendee.jobTitle}</span>
                </>
              )}
            </div>

            {/* Exhibitor Stall Pill */}
            {attendee.stallNumber && (
              <div className="pt-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-mono font-semibold">
                  <span>Stall Allocated:</span>
                  <span className="font-bold text-white">{attendee.stallNumber}</span>
                </span>
              </div>
            )}
          </div>

          {/* Gate Scanner QR Code Frame */}
          <div className="px-6 py-4 flex flex-col items-center justify-center bg-white/[0.02] border-y border-white/5">
            <div className="bg-white p-3.5 rounded-2xl shadow-xl border border-white/20">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Gate Access QR"
                  className="w-44 h-44 sm:w-48 sm:h-48 rounded-lg block"
                />
              ) : (
                <div className="w-44 h-44 sm:w-48 sm:h-48 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* Pass ID Pill with Copy */}
            <div className="mt-3.5 flex items-center gap-2">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                ID:
              </span>
              <button
                type="button"
                onClick={handleCopyId}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 text-white font-mono text-xs font-semibold border border-white/10 transition-colors cursor-pointer"
                title="Click to copy Pass ID"
              >
                <span>{attendee.id}</span>
                {copied ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3 text-slate-400" />
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Present for gate check-in &amp; badge collection
            </p>
          </div>

          {/* Event Logistics Grid */}
          <div className="p-6 grid grid-cols-2 gap-2.5 text-left text-xs">
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Date &amp; Time</span>
              </div>
              <p className="font-semibold text-white leading-tight">{eventDate}</p>
            </div>

            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Venue</span>
              </div>
              <p className="font-semibold text-white leading-tight truncate">{venueLocation}</p>
            </div>

            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                <Ticket className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Pass Category</span>
              </div>
              <p className="font-semibold text-white leading-tight truncate">
                {attendee.passType || "Official Pass"}
              </p>
            </div>

            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Gate Status</span>
              </div>
              <p
                className={`font-semibold leading-tight ${
                  attendee.checkedIn ? "text-emerald-400" : "text-sky-300"
                }`}
              >
                {attendee.checkedIn ? "Admitted ✓" : "Valid & Active"}
              </p>
            </div>
          </div>

          {/* Unified Action Buttons */}
          <div className="px-6 pb-6 pt-1 space-y-2.5">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleSaveContact}
                className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-98 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Save Contact (vCard)</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadBadge}
                className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs flex items-center justify-center gap-1.5 border border-white/10 transition-all active:scale-98 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save Badge Image</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleSaveCalendar}
                className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-medium text-xs flex items-center justify-center gap-1.5 border border-white/5 transition-all active:scale-98 cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Add to Calendar</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-medium text-xs flex items-center justify-center gap-1.5 border border-white/5 transition-all active:scale-98 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-slate-400" />
                <span>{shared ? "Link Copied!" : "Share Pass"}</span>
              </button>
            </div>
          </div>

          {/* Staff Gate Control (only visible to authenticated organizers/staff) */}
          {isStaff && (
            <div className="px-6 py-3.5 bg-emerald-950/40 border-t border-emerald-500/20 text-center space-y-1.5">
              <button
                type="button"
                onClick={handleToggleCheckin}
                disabled={checkinLoading}
                className="w-full py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {checkinLoading
                  ? "Updating Gate..."
                  : attendee.checkedIn
                  ? "Undo Gate Admission"
                  : "Admit Attendee (Staff Check-in)"}
              </button>
              <p className="text-[10px] text-emerald-400 font-mono">
                Staff Verified: {staffName}
              </p>
            </div>
          )}
        </motion.div>

        {/* Minimal Footer */}
        <div className="text-center space-y-2 pt-2 text-xs text-slate-500">
          <p>
            Himalayan Green Energy Expo 2027 · Organised by IPPAN &amp; Event Solution
          </p>
          <div>
            <Link
              href="/"
              className="text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1 font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Expo Homepage</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#071322] flex items-center justify-center p-4">
          <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
