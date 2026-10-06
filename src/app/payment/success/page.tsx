"use client";

import React, { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import confetti from "canvas-confetti";
import {
  CheckCircle2,
  Download,
  Calendar,
  MapPin,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  Mail,
  Phone,
  FileText,
  CreditCard,
  QrCode,
  Landmark,
  Clock,
  Copy,
  Check,
  MessageSquare,
  Share2,
} from "lucide-react";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || "HHE26-STALL-CONFIRMED";
  const gateway = searchParams.get("gateway") || "khalti";
  const stalls = searchParams.get("stalls") || "Confirmed Allocation";
  const amount = searchParams.get("amount");
  const txn = searchParams.get("txn") || searchParams.get("pidx");

  const isGala = searchParams.get("type") === "gala" || id.startsWith("GALA-");
  const passTier = searchParams.get("pass") || "national";
  const qty = searchParams.get("qty") || "1";
  const currency = searchParams.get("currency") || (passTier === "international" ? "USD" : "NPR");

  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(
        `Himalayan Green Energy Expo 2027 72-Hour Free Hold - Reference ID: ${id}. Space provisionally locked at zero cost.`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(
    `Hello, I have placed an official 72-Hour Free Hold at Himalayan Green Energy Expo 2027 (Ref: ${id}). Zero upfront cost. Please review the reservation details.`
  )}`;

  useEffect(() => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.5 },
      colors: ["#10B981", "#34D399", "#059669", "#38BDF8", "#F59E0B"],
    });
  }, []);

  const isBank = gateway.toLowerCase() === "bank";
  const isKhalti = gateway.toLowerCase() === "khalti";
  const isFonepay = gateway.toLowerCase() === "fonepay";
  const isHold72h =
    gateway.toLowerCase() === "hold_72h" ||
    searchParams.get("hold") === "72h" ||
    searchParams.get("hold") === "true";

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 flex flex-col">
      {/* Top Emerald Header */}
      <div className="bg-[#04281E] text-white pt-28 sm:pt-32 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 border-b border-emerald-500/20">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-xs font-mono font-bold text-[#34D399] uppercase shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span>
              {isHold72h
                ? "OFFICIAL 72-HOUR FREE HOLD CONFIRMATION"
                : isGala
                ? "OFFICIAL NETWORKING DINNER VIP PASS CONFIRMATION"
                : "OFFICIAL STALL ALLOCATION CONFIRMATION"}
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            {isHold72h
              ? "72-Hour Free Hold Confirmed (Zero Cost)!"
              : isGala
              ? isBank
                ? "Networking Dinner VIP Pass Reservation Received!"
                : "Payment & Networking Dinner VIP Pass Confirmed!"
              : isBank
                ? "Stall Reservation Received!"
                : "Payment & Stall Booking Confirmed!"}
          </h1>
          <p className="text-sm sm:text-base text-emerald-100/80 max-w-xl mx-auto leading-relaxed">
            {isHold72h
              ? "Your exclusive 72-hour free hold is officially active! Your reservation has been locked in at zero upfront cost while your organization finalizes internal approvals."
              : isGala
              ? isBank
                ? "Your Networking Dinner seats at Royal Tulip Kathmandu (Gwarko) have been provisionally held. Please complete the bank wire remittance within 48 hours to finalize guest seating."
                : "Your Khalti payment has been successfully verified. Your VIP delegate credential for the Royal Tulip Kathmandu (Gwarko) Networking Dinner is officially locked in."
              : isBank
                ? "Your booth allocation has been provisionally reserved. Please complete the bank wire remittance within 48 hours to finalize badge and pro-forma issuance."
                : "Your payment has been successfully verified. Your exhibition booth is now officially locked in for the Himalayan Green Energy Expo 2027."}
          </p>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8 flex-grow">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="p-6 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-6">
            {/* Status Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#10B981] flex items-center justify-center shrink-0 shadow-xs">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-[11px] font-mono text-slate-500 font-bold uppercase tracking-wider">
                    BOOKING REFERENCE NUMBER
                  </span>
                  <div className="font-mono font-bold text-xl text-slate-900 mt-0.5">
                    {id}
                  </div>
                </div>
              </div>

              {/* Gateway Badge */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-mono font-bold text-slate-700 self-start sm:self-auto">
                {isHold72h && (
                  <div className="flex items-center gap-1.5 text-emerald-900 font-bold">
                    <Clock className="w-4 h-4 text-emerald-700" />
                    <span>72-Hour Free Hold</span>
                  </div>
                )}
                {isKhalti && !isHold72h && (
                  <>
                    <CreditCard className="w-4 h-4 text-[#5D2E8E]" />
                    <span>Paid via Khalti ePayment</span>
                  </>
                )}
                {isFonepay && !isHold72h && (
                  <>
                    <QrCode className="w-4 h-4 text-[#D92525]" />
                    <span>Paid via Fonepay Direct</span>
                  </>
                )}
                {isBank && !isHold72h && (
                  <>
                    <Landmark className="w-4 h-4 text-[#218A59]" />
                    <span>{currency === "USD" ? "USD SWIFT Wire Invoice" : "Bank Wire / Invoice"}</span>
                  </>
                )}
              </div>
            </div>

            {/* Receipt Summary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-mono">
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold">
                  {isGala ? "PASS CATEGORY & QUANTITY" : "ALLOCATED STALL(S)"}
                </span>
                <div className="font-sans font-bold text-lg text-[#218A59] mt-0.5">
                  {isGala
                    ? `${qty}x Networking Dinner VIP Pass (${passTier === "international" ? "International" : "National"})`
                    : `STALL ${stalls}`}
                </div>
              </div>

              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold">
                  {isHold72h ? "AMOUNT DUE TODAY" : "TOTAL AMOUNT"}
                </span>
                <div className="font-sans font-bold text-lg text-slate-900 mt-0.5">
                  {isHold72h ? (
                    <span className="text-emerald-700">FREE · NPR 0 / USD $0</span>
                  ) : amount ? (
                    currency === "USD" ? (
                      `USD $${Number(amount).toLocaleString()}`
                    ) : (
                      `NPR ${Number(amount).toLocaleString()}`
                    )
                  ) : isGala ? (
                    passTier === "international" ? (
                      `USD $${50 * Number(qty)} (≈ NPR ${(6750 * Number(qty)).toLocaleString()})`
                    ) : (
                      `NPR ${(6000 * Number(qty)).toLocaleString()}`
                    )
                  ) : (
                    "NPR 875,000"
                  )}
                </div>
              </div>

              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold">VENUE & LOCATION</span>
                <div className="font-sans font-bold text-slate-800 mt-0.5">
                  {isGala ? "Royal Tulip Kathmandu (Gwarko)" : "BHRIKUTIMANDAP, KATHMANDU, NEPAL"}
                </div>
              </div>

              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold">
                  {isGala ? "NETWORKING DINNER DATE & TIME" : "EXPO DATES"}
                </span>
                <div className="font-sans font-bold text-slate-800 mt-0.5">
                  {isGala ? "Monday, 18 Jan 2027 · 6:00 PM onwards" : "Magh 3–5, 2083 · Jan 17–19, 2027"}
                </div>
              </div>

              {txn && (
                <div className="sm:col-span-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-600">
                  <span>TRANSACTION ID / PIDX:</span>
                  <span className="font-mono font-bold text-slate-800">{txn}</span>
                </div>
              )}
            </div>

            {/* 72-Hour Free Hold Details Box */}
            {isHold72h && (
              <div className="p-5 sm:p-6 rounded-2xl bg-emerald-50/90 border border-emerald-300 text-xs space-y-4 font-sans">
                <div className="flex items-center gap-2 font-bold text-emerald-950 font-mono text-sm">
                  <Clock className="w-5 h-5 text-emerald-700" />
                  <span>72-Hour Free Hold Guarantee (Zero Upfront Cost)</span>
                </div>
                <p className="text-emerald-900 leading-relaxed font-normal">
                  Your reservation is held exclusively for your organization for the next 72 hours. No other enterprise can claim this placement during your hold period. Our exhibition secretariat will contact your team to deliver formal confirmation and assist with invoice processing.
                </p>

                {/* Quick Share to Accounts & Decision Makers */}
                <div className="p-3.5 rounded-xl bg-white border border-emerald-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="font-bold text-slate-900 font-mono text-[11px] uppercase">
                      Forward to Finance / Accounts Department
                    </div>
                    <div className="text-[11px] text-slate-500 font-normal mt-0.5">
                      Share official reservation details with your executive decision-makers
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>COPIED REF!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>COPY REF</span>
                        </>
                      )}
                    </button>
                    <a
                      href={whatsappShareUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-white font-mono text-[11px] font-bold transition-colors shadow-2xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>SHARE ON WHATSAPP</span>
                    </a>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-emerald-100/60 border border-emerald-200/80 text-[11px] text-emerald-950 font-normal leading-relaxed">
                  <strong>Zero-Liability Expiration:</strong> If your executive board chooses not to proceed, this reservation automatically releases after 72 hours with no cancellation penalty, no hidden fees, and zero financial obligation.
                </div>

                <div className="pt-2 border-t border-emerald-200/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                  <div className="text-emerald-800">
                    <strong>Need direct secretariat assistance or an official invoice?</strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href="tel:+9779703606348"
                      className="text-emerald-900 font-bold hover:underline"
                    >
                      +977 9703606348 / 9703606345
                    </a>
                    <span>&bull;</span>
                    <a
                      href="mailto:info@himalayanenergyexpo.com"
                      className="text-emerald-900 font-bold hover:underline"
                    >
                      info@himalayanenergyexpo.com
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Bank Wire Details Box (if bank transfer chosen) */}
            {isBank && (
              <div className="p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs space-y-3 font-mono">
                <div className="flex items-center gap-2 font-bold text-[#15803D]">
                  <Landmark className="w-4 h-4" />
                  <span>IPPAN OFFICIAL BANK ACCOUNT DETAILS FOR REMITTANCE</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-800 pt-1">
                  <div><strong>Beneficiary:</strong> IPPAN - GREEN ENERGY EXPO</div>
                  <div><strong>Bank Name:</strong> Nepal Investment Mega Bank (NIMB)</div>
                  <div><strong>NPR Account No:</strong> 001001201928471</div>
                  <div><strong>USD Account No:</strong> 001001201928482</div>
                  <div><strong>Branch / Location:</strong> Durbarmarg, Kathmandu, Nepal</div>
                  <div><strong>SWIFT Code:</strong> NIMBNPKA</div>
                </div>
                <p className="text-[11px] text-slate-600 font-sans font-normal pt-1">
                  Please mention Reference ID <strong>{id}</strong> in your wire remarks and email the bank swift advice/voucher to <strong>expo@ippan.org.np</strong>.
                </p>
              </div>
            )}

            {/* Next Steps */}
            <div className="space-y-3 pt-2">
              <h3 className="font-sans font-bold text-sm text-slate-900 uppercase tracking-wide">
                {isHold72h
                  ? "72-Hour Free Hold - Next Steps"
                  : isGala
                  ? "Networking Dinner Delegate Entry Protocol"
                  : "Exhibitor Onboarding & Next Steps"}
              </h3>
              <ul className="text-xs text-slate-600 space-y-2 pl-1 font-normal">
                {isHold72h ? (
                  <>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-[#15803D] font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        1
                      </span>
                      <span>
                        Our executive secretariat will deliver your official Pro-Forma Invoice and sponsorship benefits dossier directly to your registered email address within 2 business hours.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-[#15803D] font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        2
                      </span>
                      <span>
                        An IPPAN Senior Concierge Manager will contact your team to assist with custom branding placements, VIP inauguration passes, and networking dinner table arrangements.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-[#15803D] font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        3
                      </span>
                      <span>
                        Settle wire remittance anytime within 72 hours to permanently seal your sponsorship contract. If your organization decides not to proceed, the hold expires automatically with zero penalty.
                      </span>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-[#15803D] font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        1
                      </span>
                      <span>
                        {isGala
                          ? "Your digital VIP Networking Dinner e-ticket with registered QR code is issued under your reference ID."
                          : "Our organizing team will issue your formal tax receipt and exhibitor manual via email within 24 hours."}
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-[#15803D] font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        2
                      </span>
                      <span>
                        {isGala
                          ? "Dress code: Formal Evening / Business Suit / Traditional National Attire. Arrival and welcome cocktail starts at 6:00 PM."
                          : "Submit fascia branding typography, exhibitor badges, and electrical load requirements by Poush 15, 2083."}
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-[#15803D] font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        3
                      </span>
                      <span>
                        {isGala
                          ? "Your Networking Dinner Pass includes complimentary 3-day full access badge to the main exhibition at Bhrikuti Mandap."
                          : "Stall setup and shell-scheme decoration begins on Magh 1, 2083 (Jan 15, 2027) at Bhrikutimandap."}
                      </span>
                    </li>
                  </>
                )}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-3 rounded-full bg-white border border-slate-300 hover:border-[#218A59] text-slate-800 font-mono text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <Download className="w-4 h-4 text-[#218A59]" />
                <span>PRINT / SAVE CONFIRMATION</span>
              </button>

              <div className="flex items-center gap-2">
                <Link
                  href="/book-stall"
                  className="px-5 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-xs font-bold transition-colors"
                >
                  Floor Plan Map
                </Link>
                <Link
                  href="/"
                  className="px-6 py-3 rounded-full bg-[#218A59] hover:bg-[#186a43] text-white font-mono text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                >
                  <span>RETURN HOME</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Organizer Contact Card */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-700">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-[#10B981] shrink-0" />
              <div>
                <div className="font-bold text-slate-900">Expo Support &amp; Assistance</div>
                <div className="text-slate-500 text-[11px] font-normal">
                  Questions regarding stall setup, electricity or invoices?
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <span className="flex items-center gap-1 text-slate-800">
                <Phone className="w-3.5 h-3.5 text-[#218A59]" />
                <span>+977 1 4169175</span>
              </span>
              <span className="flex items-center gap-1 text-slate-800">
                <Mail className="w-3.5 h-3.5 text-[#10B981]" />
                <span>expo@ippan.org.np</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center font-mono text-xs text-slate-500">
          LOADING CONFIRMATION DETAILS...
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
