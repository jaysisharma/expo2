"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Download,
  Calendar,
  Copy,
  Check,
  AlertCircle,
  ArrowLeft,
  UserPlus,
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
            id: idParam || "HHE27-255298",
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
            id: idParam || "HHE27-255298",
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
      color: { dark: "#061A2A", light: "#FFFFFF" },
    }).then(setQrDataUrl).catch(() => {});
  }, [attendee, tokenParam]);

  // Save Contact to Phone (vCard .vcf)
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
      `NOTE:Himalayan Green Energy Expo 2027 [Pass ID: ${attendee.id}]`,
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
    const isGala = attendee?.role === "gala" || attendee?.passType?.toLowerCase().includes("gala") || attendee?.passType?.toLowerCase().includes("networking");
    const summary = isGala
      ? "Himalayan Green Energy Expo - Networking Dinner"
      : "Himalayan Green Energy Expo 2027";
    const location = isGala
      ? "Royal Tulip, Kathmandu, Nepal"
      : "BHRIKUTIMANDAP, KATHMANDU, NEPAL";
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
      `DESCRIPTION:Official Entry Pass for ${attendee?.name || "Delegate"} (Pass ID: ${attendee?.id || "HHE27"}). Venue: ${location}.`,
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
    const width = 360 * scale;
    const height = 560 * scale;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Card background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, width, height);

    // Top brand accent
    ctx.fillStyle = "#007A5E";
    ctx.fillRect(0, 0, width, 8 * scale);

    // Brand Header
    ctx.fillStyle = "#007A5E";
    ctx.font = `bold ${10 * scale}px sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("HIMALAYAN GREEN ENERGY EXPO 2027", width / 2, 40 * scale);

    ctx.fillStyle = "#64748B";
    ctx.font = `normal ${8 * scale}px sans-serif`;
    ctx.fillText("17–19 January 2027 · Bhrikutimandap, Kathmandu", width / 2, 56 * scale);

    // Pass Type Pill
    const isExhibitor = attendee.role === "exhibitor" || Boolean(attendee.stallNumber);
    const isGala = attendee.role === "gala" || attendee.passType?.toLowerCase().includes("gala") || attendee.passType?.toLowerCase().includes("networking");
    const rolePill = isExhibitor ? "EXHIBITOR PASS" : isGala ? "NETWORKING DINNER PASS" : "ENTRY PASS";

    ctx.fillStyle = "#ECFDF5";
    ctx.beginPath();
    ctx.roundRect(width / 2 - 70 * scale, 75 * scale, 140 * scale, 22 * scale, 11 * scale);
    ctx.fill();

    ctx.fillStyle = "#007A5E";
    ctx.font = `bold ${8 * scale}px sans-serif`;
    ctx.fillText(rolePill, width / 2, 89 * scale);

    // Attendee Name
    ctx.fillStyle = "#0F172A";
    ctx.font = `bold ${20 * scale}px sans-serif`;
    ctx.fillText(attendee.name || "Attendee", width / 2, 136 * scale);

    // Organization
    ctx.fillStyle = "#334155";
    ctx.font = `bold ${12 * scale}px sans-serif`;
    ctx.fillText(attendee.organization || "Himalayan Green Energy Expo", width / 2, 160 * scale);

    // Role / Tier
    ctx.fillStyle = "#64748B";
    ctx.font = `normal ${10 * scale}px sans-serif`;
    const tierText = isExhibitor
      ? (attendee.stallNumber ? `Exhibitor · Stall ${attendee.stallNumber}` : "Official Exhibitor")
      : isGala
      ? "Networking Dinner VIP Guest"
      : "Trade Visitor";
    ctx.fillText(tierText, width / 2, 180 * scale);

    // QR Code Frame
    if (qrDataUrl) {
      const img = new Image();
      img.onload = () => {
        const qrSize = 160 * scale;
        const qrX = width / 2 - qrSize / 2;
        const qrY = 210 * scale;

        ctx.fillStyle = "#F8FAFC";
        ctx.beginPath();
        ctx.roundRect(qrX - 10 * scale, qrY - 10 * scale, qrSize + 20 * scale, qrSize + 20 * scale, 14 * scale);
        ctx.fill();

        ctx.drawImage(img, qrX, qrY, qrSize, qrSize);

        // Pass ID
        ctx.fillStyle = "#94A3B8";
        ctx.font = `bold ${8 * scale}px sans-serif`;
        ctx.fillText("PASS ID", width / 2, 420 * scale);

        ctx.fillStyle = "#0F172A";
        ctx.font = `bold ${12 * scale}px monospace`;
        ctx.fillText(attendee.id, width / 2, 438 * scale);

        // Status & Dates
        ctx.fillStyle = "#007A5E";
        ctx.font = `bold ${9 * scale}px sans-serif`;
        ctx.fillText("STATUS: VALID", width / 2, 465 * scale);

        ctx.fillStyle = "#64748B";
        ctx.font = `normal ${8 * scale}px sans-serif`;
        ctx.fillText("Present at entrance for gate admission", width / 2, 490 * scale);

        ctx.fillStyle = "#94A3B8";
        ctx.font = `normal ${7 * scale}px sans-serif`;
        ctx.fillText("IPPAN & Event Solution Nepal", width / 2, 530 * scale);

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
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-9 h-9 border-2 border-[#007A5E] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Loading Entry Pass...
          </p>
        </div>
      </div>
    );
  }

  if (tamperedError) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-white border border-slate-200/90 rounded-3xl p-7 text-center text-slate-800 space-y-4 shadow-lg">
          <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900">Verification Failed</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              This pass token could not be verified by the official IPPAN registry. Please present your original registration email at the venue desk.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-colors"
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
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-white border border-slate-200/90 rounded-3xl p-7 text-center text-slate-800 space-y-4 shadow-lg">
          <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900">Pass Not Found</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              We could not locate an active entry pass for the provided verification link.
            </p>
          </div>
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-[#007A5E] hover:bg-[#00664e] text-white font-semibold text-xs transition-colors"
          >
            <span>Register</span>
          </Link>
        </div>
      </div>
    );
  }

  const isExhibitor = attendee.role === "exhibitor" || Boolean(attendee.stallNumber);
  const isGala = attendee.role === "gala" || attendee.passType?.toLowerCase().includes("gala") || attendee.passType?.toLowerCase().includes("networking");

  let displayRole = "Trade Visitor";
  if (isExhibitor) {
    displayRole = attendee.stallNumber
      ? `Official Exhibitor · Stall ${attendee.stallNumber}`
      : "Official Exhibitor Delegate";
  } else if (isGala) {
    displayRole = "Networking Dinner Pass (Royal Tulip)";
  } else if (attendee.passType) {
    if (attendee.passType.toLowerCase().includes("visitor")) {
      displayRole = "Trade Visitor";
    } else {
      displayRole = attendee.passType.replace(/\s*·?\s*\(?Free\)?/i, "").trim();
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 py-10 sm:py-14 px-4 sm:px-6 flex flex-col items-center justify-center font-sans">
      <div className="w-full max-w-[420px] flex flex-col items-center">
        
        {/* ── TOP EVENT HEADER ────────────────────────────────────────── */}
        <div className="text-center space-y-1 mb-6 w-full">
          <h1 className="text-base sm:text-lg font-extrabold tracking-wide text-slate-900 uppercase">
            HIMALAYAN GREEN ENERGY EXPO 2027
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-600">
            17–19 January 2027 · Magh 3–5, 2083
          </p>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            BHRIKUTIMANDAP, KATHMANDU, NEPAL
          </p>
        </div>

        {/* ── ENTRY PASS CARD ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="w-full bg-white rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-slate-200/90 p-7 sm:p-8 text-center"
        >
          {/* Badge Tag */}
          <div className="mb-3.5">
            <span className="inline-block px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] font-bold tracking-[0.16em] uppercase text-[#007A5E]">
              {isExhibitor ? "EXHIBITOR PASS" : isGala ? "NETWORKING DINNER PASS" : "ENTRY PASS"}
            </span>
          </div>

          {/* Attendee Name */}
          <h2 className="text-2xl sm:text-[26px] font-extrabold text-slate-900 tracking-tight leading-tight">
            {attendee.name}
          </h2>

          {/* Organization */}
          <p className="text-base font-semibold text-slate-800 mt-2">
            {attendee.organization || "Himalayan Green Energy Expo"}
          </p>

          {/* Role / Tier */}
          <p className="text-sm font-medium text-slate-500 mt-0.5 mb-6">
            {displayRole}
          </p>

          {/* Scannable QR Code */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 inline-block shadow-sm">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Gate Check-in QR"
                className="w-48 h-48 sm:w-52 sm:h-52 block mx-auto rounded-lg"
              />
            ) : (
              <div className="w-48 h-48 sm:w-52 sm:h-52 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-[#007A5E] border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Pass Details List */}
          <div className="border-t border-b border-slate-100 py-4 my-6 space-y-4 text-center">
            {/* PASS ID */}
            <div>
              <div className="text-[10px] font-bold tracking-widest uppercase text-slate-400">
                PASS ID
              </div>
              <div className="mt-0.5 inline-flex items-center justify-center gap-1.5">
                <span className="font-mono font-bold text-base text-slate-900">
                  {attendee.id}
                </span>
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  title="Copy Pass ID"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* PASS STATUS */}
            <div>
              <div className="text-[10px] font-bold tracking-widest uppercase text-slate-400">
                PASS STATUS
              </div>
              <div className="mt-0.5 inline-flex items-center justify-center gap-1.5 font-semibold text-sm text-emerald-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{attendee.checkedIn ? "Admitted" : "Valid"}</span>
              </div>
            </div>

            {/* EVENT DATE */}
            <div>
              <div className="text-[10px] font-bold tracking-widest uppercase text-slate-400">
                EVENT DATE
              </div>
              <div className="mt-0.5 font-semibold text-sm text-slate-800">
                17–19 January 2027
              </div>
            </div>
          </div>

          {/* Instruction */}
          <p className="text-xs text-slate-500 font-medium mb-6">
            Present this QR code at the entrance for check-in.
          </p>

          {/* Action Buttons */}
          <div className="space-y-2.5">
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleDownloadBadge}
                className="py-3 px-3 rounded-xl bg-[#007A5E] hover:bg-[#00664e] text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-[0.98] cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>SAVE PASS</span>
              </button>

              <button
                type="button"
                onClick={handleSaveCalendar}
                className="py-3 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 border border-slate-200/80 transition-all active:scale-[0.98] cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>ADD TO CALENDAR</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleSaveContact}
              className="w-full py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 text-[#007A5E] font-semibold text-xs flex items-center justify-center gap-1.5 border border-emerald-200/80 transition-all active:scale-[0.98] cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>SAVE CONTACT TO PHONE</span>
            </button>
          </div>
        </motion.div>

        {/* ── FOOTER ─────────────────────────────────────────────────── */}
        <div className="text-center mt-7 space-y-1 w-full text-slate-500">
          <p className="text-xs font-semibold text-slate-700">
            Himalayan Green Energy Expo 2027
          </p>
          <p className="text-xs italic text-slate-500">
            Resilient Energy, Prosperous Nepal
          </p>
          <p className="text-[11px] text-slate-400 pt-1">
            Organised by IPPAN &amp; Event Solution Nepal
          </p>
          <div className="pt-3">
            <Link
              href="/"
              className="text-xs text-slate-400 hover:text-slate-700 transition-colors inline-flex items-center gap-1 font-medium"
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
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
          <div className="w-8 h-8 border-2 border-[#007A5E] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
