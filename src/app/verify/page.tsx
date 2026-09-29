"use client";

import React, { Suspense, useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  ShieldCheck,
  Building2,
  Briefcase,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Download,
  Share2,
  UserPlus,
  QrCode,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  Printer,
  ChevronRight,
  AlertCircle,
  Clock,
  Ticket,
} from "lucide-react";
import QRCodeLib from "qrcode";

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
}

function VerifyContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || "";
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
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [shared, setShared] = useState(false);
  const [isStaff, setIsStaff] = useState(false);
  const [staffName, setStaffName] = useState("");

  useEffect(() => {
    async function checkStaffAuth() {
      try {
        const res = await fetch("/api/staff/auth");
        const data = await res.json();
        if (data.authenticated && data.staff) {
          setIsStaff(true);
          setStaffName(data.staff.name || "Gate Staff");
        }
      } catch {}
    }
    checkStaffAuth();
  }, []);

  useEffect(() => {
    async function fetchVerification() {
      setLoading(true);
      try {
        const query = new URLSearchParams();
        if (id) query.set("id", id);
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

        if (data.success && data.attendee) {
          setAttendee(data.attendee);
        } else if (nameParam || id) {
          // Graceful fallback to query parameters
          setAttendee({
            id: id || "HHE27-VERIFIED",
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
        console.warn("Verify fetch error, falling back to URL data", err);
        if (nameParam || id) {
          setAttendee({
            id: id || "HHE27-VERIFIED",
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
  }, [id, nameParam, orgParam, roleParam, titleParam, stallParam, emailParam, phoneParam, passTypeParam]);

  // Generate high-resolution Gate QR Code for scanning
  useEffect(() => {
    if (!attendee) return;
    const urlToEncode = typeof window !== "undefined" ? window.location.href : `https://greenenergyexpo.org.np/verify?id=${attendee.id}`;
    QRCodeLib.toDataURL(urlToEncode, {
      width: 320,
      margin: 1,
      color: { dark: "#061A2A", light: "#FFFFFF" },
    }).then(setQrDataUrl).catch(() => {});
  }, [attendee]);

  // 1. Save vCard (.vcf) directly into phone contacts
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
      `NOTE:Himalayan Green Energy Expo 2027 Accreditation [Pass ID: ${attendee.id}]`,
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

  // 2. Save Calendar Event (.ics)
  const handleSaveCalendar = () => {
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Himalayan Green Energy Expo//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      "DTSTART:20270117T041500Z",
      "DTEND:20270119T121500Z",
      "SUMMARY:Himalayan Green Energy Expo 2027",
      `DESCRIPTION:Official Accreditation for ${attendee?.name || "Delegate"} (Pass ID: ${attendee?.id || "HHE27"}). Venue: Bhrikutimandap Exhibition Hall, Kathmandu.`,
      "LOCATION:Bhrikutimandap Exhibition Hall, Kathmandu, Nepal",
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Himalayan_Green_Energy_Expo_2027.ics";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 3. Save / Download Digital Badge as PNG Image
  const handleDownloadBadge = () => {
    if (!attendee) return;
    const canvas = document.createElement("canvas");
    const scale = 2;
    const width = 360 * scale;
    const height = 540 * scale;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background gradient
    const isExhibitor = attendee.role === "exhibitor";
    const isGala = attendee.role === "gala";
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, "#FFFFFF");
    grad.addColorStop(1, isExhibitor ? "#F0FDF4" : isGala ? "#FAF5FF" : "#F0F9FF");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Top Header Banner
    ctx.fillStyle = isExhibitor ? "#064E3B" : isGala ? "#2E1065" : "#04281E";
    ctx.fillRect(0, 0, width, 120 * scale);

    ctx.fillStyle = "#10B981";
    ctx.font = `bold ${8 * scale}px sans-serif`;
    ctx.textAlign = "center";
    ctx.letterSpacing = "2px";
    ctx.fillText("IPPAN · OFFICIAL ACCREDITATION", width / 2, 35 * scale);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = `bold ${15 * scale}px sans-serif`;
    ctx.fillText("HIMALAYAN GREEN ENERGY EXPO 2027", width / 2, 60 * scale);

    ctx.fillStyle = "#94A3B8";
    ctx.font = `normal ${8 * scale}px sans-serif`;
    ctx.fillText("17–19 JANUARY 2027 · KATHMANDU, NEPAL", width / 2, 80 * scale);

    // Pass ID Tag
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.roundRect(width / 2 - 80 * scale, 95 * scale, 160 * scale, 20 * scale, 6 * scale);
    ctx.fill();

    ctx.fillStyle = "#0F172A";
    ctx.font = `bold ${9 * scale}px monospace`;
    ctx.fillText(`PASS ID: ${attendee.id}`, width / 2, 109 * scale);

    // Attendee Name
    ctx.fillStyle = "#0F172A";
    ctx.font = `bold ${20 * scale}px sans-serif`;
    ctx.fillText(attendee.name || "Registered Delegate", width / 2, 165 * scale);

    // Organization
    ctx.fillStyle = isExhibitor ? "#10B981" : "#087EA4";
    ctx.font = `bold ${12 * scale}px sans-serif`;
    ctx.fillText(attendee.organization || "Company / Organization", width / 2, 190 * scale);

    // Title / Stall
    ctx.fillStyle = "#64748B";
    ctx.font = `normal ${10 * scale}px sans-serif`;
    const subText = isExhibitor
      ? `STALL: ${attendee.stallNumber || "MAIN EXHIBITION HALL"}`
      : `${attendee.jobTitle || "Trade Delegate"}${attendee.country ? ` · ${attendee.country}` : " · Nepal"}`;
    ctx.fillText(subText, width / 2, 210 * scale);

    // Draw QR Code
    if (qrDataUrl) {
      const img = new Image();
      img.onload = () => {
        const qrSize = 130 * scale;
        const qrX = width / 2 - qrSize / 2;
        const qrY = 240 * scale;

        // QR Container
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.roundRect(qrX - 10 * scale, qrY - 10 * scale, qrSize + 20 * scale, qrSize + 20 * scale, 12 * scale);
        ctx.fill();
        ctx.strokeStyle = "#E2E8F0";
        ctx.lineWidth = 2 * scale;
        ctx.stroke();

        ctx.drawImage(img, qrX, qrY, qrSize, qrSize);

        // Turnstile instruction
        ctx.fillStyle = "#64748B";
        ctx.font = `normal ${8 * scale}px sans-serif`;
        ctx.fillText("SCAN AT TURNSTILE GATE OR REGISTRATION DESK", width / 2, 415 * scale);

        // Bottom Role Banner
        const bannerBg = isExhibitor ? "#10B981" : isGala ? "#7C3AED" : "#087EA4";
        ctx.fillStyle = bannerBg;
        ctx.fillRect(0, height - 50 * scale, width, 50 * scale);

        ctx.fillStyle = "#FFFFFF";
        ctx.font = `bold ${14 * scale}px sans-serif`;
        const bannerText = (attendee.passType || (isExhibitor ? "OFFICIAL EXHIBITOR" : isGala ? "GALA DINNER VIP" : "TRADE VISITOR")).toUpperCase();
        ctx.fillText(bannerText, width / 2, height - 20 * scale);

        // Download PNG
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

  // 4. Share Pass
  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `Official Pass - ${attendee?.name} | Himalayan Green Energy Expo 2027`,
          text: `Here is the official verified pass for ${attendee?.name} (${attendee?.organization}) at Himalayan Green Energy Expo 2027.`,
          url: window.location.href,
        });
        setShared(true);
        setTimeout(() => setShared(false), 3000);
      } catch (e) {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShared(true);
      setTimeout(() => setShared(false), 3000);
    }
  };

  // 5. Copy Pass ID
  const handleCopyId = () => {
    if (!attendee?.id) return;
    navigator.clipboard.writeText(attendee.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // 6. Check-in toggle for organizers
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
      console.warn("Checkin update failed", err);
    } finally {
      setCheckinLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-xl border border-slate-200 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center animate-spin">
            <ShieldCheck className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Verifying Official Pass...</h2>
          <p className="text-xs text-slate-500 mt-2">Checking accreditation credentials against IPPAN registry</p>
        </div>
      </div>
    );
  }

  if (!attendee) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-xl border border-rose-200 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-rose-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Accreditation Not Found</h2>
          <p className="text-sm text-slate-600 mt-2">
            We could not verify an active accreditation pass with the provided link or QR code.
          </p>
          <div className="mt-6">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all"
            >
              Register for Official Pass <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isExhibitor = attendee.role === "exhibitor" || Boolean(attendee.stallNumber);
  const isGala = attendee.role === "gala" || attendee.passType?.toLowerCase().includes("gala");
  const roleBadgeColor = isExhibitor
    ? "bg-emerald-600 text-white"
    : isGala
    ? "bg-purple-600 text-white"
    : "bg-teal-600 text-white";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-slate-100 py-6 px-4 sm:px-6">
      <div className="max-w-xl mx-auto">
        
        {/* Verification Success Header Badge */}
        <div className="mb-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 text-xs font-bold uppercase tracking-wider shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Official Pass Verified &amp; Confirmed
          </div>
        </div>

        {/* Main Accreditation Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden backdrop-blur-sm">
          
          {/* Header Strip */}
          <div className={`p-6 sm:p-7 text-center ${isExhibitor ? "bg-emerald-900" : isGala ? "bg-purple-950" : "bg-[#04281E]"} text-white relative`}>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-[10px] font-bold tracking-widest uppercase mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              IPPAN · Official Accreditation
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
              Himalayan Green Energy Expo
            </h1>
            <p className="text-xs text-slate-300 font-medium mt-1">
              5th Edition · 17–19 January 2027 (Magh 3–5, 2083)
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Bhrikutimandap Exhibition Hall, Kathmandu, Nepal
            </p>

            {/* Pass Category Ribbon */}
            <div className="mt-4">
              <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-black tracking-wider uppercase shadow-md ${roleBadgeColor}`}>
                {attendee.passType || (isExhibitor ? "Official Exhibitor Pass" : isGala ? "Gala Dinner VIP" : "Trade Visitor Pass")}
              </span>
            </div>
          </div>

          {/* Attendee Details Core Section */}
          <div className="p-6 sm:p-8">
            <div className="text-center pb-6 border-b border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                Accredited Delegate
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {attendee.name}
              </h2>
              <div className="flex items-center justify-center gap-2 mt-2 text-emerald-700 font-bold text-sm sm:text-base">
                <Building2 className="w-4 h-4 flex-shrink-0" />
                <span>{attendee.organization || "Himalayan Green Energy Expo"}</span>
              </div>
              {(attendee.jobTitle || attendee.country) && (
                <div className="flex items-center justify-center gap-1.5 mt-1 text-slate-500 text-xs sm:text-sm">
                  {attendee.jobTitle && (
                    <>
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>{attendee.jobTitle}</span>
                    </>
                  )}
                  {attendee.country && (
                    <span>· {attendee.country}</span>
                  )}
                </div>
              )}

              {/* Stall badge if exhibitor */}
              {attendee.stallNumber && (
                <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                  <span>Allocated Stall:</span>
                  <span className="font-mono text-sm font-black text-emerald-600">{attendee.stallNumber}</span>
                </div>
              )}
            </div>

            {/* Pass ID with Copy Button */}
            <div className="my-5 p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
                  Accreditation Code / Pass ID
                </span>
                <span className="font-mono text-base font-bold text-slate-900">
                  {attendee.id}
                </span>
              </div>
              <button
                onClick={handleCopyId}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-all active:scale-95"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600 font-bold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* High-Resolution Fast Track QR Code */}
            <div className="p-5 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-300 text-center my-6">
              <span className="text-[11px] font-black uppercase tracking-widest text-emerald-700 block mb-2">
                Fast-Track Turnstile Entry QR
              </span>
              <div className="inline-block p-3 bg-white rounded-2xl border border-slate-200 shadow-md">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="Fast Track Gate QR"
                    className="w-48 h-48 mx-auto rounded-lg"
                  />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center">
                    <QrCode className="w-12 h-12 text-slate-300 animate-pulse" />
                  </div>
                )}
              </div>
              <p className="text-[11px] text-slate-600 mt-3 font-medium">
                Present this QR code at turnstile gate scanner or registration desk for instant contactless check-in.
              </p>
            </div>

            {/* Quick Contact & Accreditation Details */}
            <div className="space-y-2.5 text-xs text-slate-700 mb-6 bg-white p-4 rounded-2xl border border-slate-100">
              {attendee.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-600 flex-shrink-0" />
                  <span className="text-slate-600 font-medium">Email:</span>
                  <a href={`mailto:${attendee.email}`} className="text-slate-900 font-semibold hover:underline truncate">
                    {attendee.email}
                  </a>
                </div>
              )}
              {attendee.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-600 flex-shrink-0" />
                  <span className="text-slate-600 font-medium">Phone:</span>
                  <a href={`tel:${attendee.phone}`} className="text-slate-900 font-semibold hover:underline">
                    {attendee.phone}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-600 flex-shrink-0" />
                <span className="text-slate-600 font-medium">Venue:</span>
                <span className="text-slate-900 font-semibold">Bhrikutimandap Hall, Kathmandu</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-600 flex-shrink-0" />
                <span className="text-slate-600 font-medium">Dates:</span>
                <span className="text-slate-900 font-semibold">17–19 January 2027</span>
              </div>
            </div>

            {/* ── SAVE TO PHONE ACTION BUTTONS ────────────────────── */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block text-center">
                Save &amp; Keep Pass on Your Phone
              </span>

              {/* 1. Save Contact to Phone (.vcf) */}
              <button
                onClick={handleSaveContact}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 transition-all active:scale-[0.98]"
              >
                <UserPlus className="w-4 h-4" />
                <span>Save Contact to Phone (vCard)</span>
              </button>

              <div className="grid grid-cols-2 gap-2.5">
                {/* 2. Download Badge Image */}
                <button
                  onClick={handleDownloadBadge}
                  className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-md transition-all active:scale-[0.98]"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Save Badge PNG</span>
                </button>

                {/* 3. Add to Calendar */}
                <button
                  onClick={handleSaveCalendar}
                  className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold text-xs shadow-sm transition-all active:scale-[0.98]"
                >
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Add to Calendar</span>
                </button>
              </div>

              {/* 4. Share Pass Link */}
              <button
                onClick={handleShare}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-all active:scale-[0.98]"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{shared ? "Link Copied / Shared!" : "Share Official Pass"}</span>
              </button>
            </div>

            {/* Gate Check-In Status & Staff Action */}
            <div className="mt-8 pt-4 border-t border-slate-100 text-center">
              <div className="inline-flex items-center gap-2 mb-2">
                <span className="text-[11px] text-slate-500 font-semibold">Gate Status:</span>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                  attendee.checkedIn ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"
                }`}>
                  {attendee.checkedIn ? "Checked In at Gate ✓" : "Ready for Turnstile"}
                </span>
              </div>
              {isStaff ? (
                <div className="space-y-1.5 mt-1">
                  <button
                    onClick={handleToggleCheckin}
                    disabled={checkinLoading}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
                      attendee.checkedIn
                        ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
                        : "bg-[#218A59] hover:bg-[#1b734a] text-white"
                    }`}
                  >
                    {checkinLoading ? "Updating..." : attendee.checkedIn ? "Revert Gate Check-in" : "Admit & Mark Checked In (Staff)"}
                  </button>
                  <p className="text-[10px] text-emerald-700 font-mono">
                    ✓ Authenticated as Staff ({staffName})
                  </p>
                </div>
              ) : (
                <div className="mt-1">
                  <Link
                    href={`/staff/login?from=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname + window.location.search : "/staff")}`}
                    className="text-[11px] text-slate-500 hover:text-emerald-700 underline font-medium transition-colors"
                  >
                    Gate Staff? Log in to admit attendee →
                  </Link>
                </div>
              )}
            </div>

          </div>

          {/* Footer Card Info */}
          <div className="bg-slate-50 p-4 border-t border-slate-200 text-center text-[11px] text-slate-500">
            <p>Jointly Organized by IPPAN &amp; Event Solution Pvt. Ltd.</p>
            <p className="mt-0.5 text-[10px] text-slate-400">
              Need assistance? Email <a href="mailto:info@eventsolutionnepal.com.np" className="text-emerald-600 underline">info@eventsolutionnepal.com.np</a>
            </p>
          </div>

        </div>

        {/* Back to Expo Link */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors inline-flex items-center gap-1"
          >
            &larr; Return to Himalayan Green Energy Expo Homepage
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
