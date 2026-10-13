"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  ArrowRight,
  AlertCircle,
  Building2,
  CheckCircle2,
  Wallet,
  Smartphone,
  CreditCard,
  Building,
} from "lucide-react";

function KhaltiCheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const pidx = searchParams.get("pidx") || `KHALTI_CHECKOUT_${Date.now()}`;
  const orderId = searchParams.get("order_id") || "HHE27-ORDER";
  const orderName = searchParams.get("order_name") || "Himalayan Green Energy Expo 2027 Reservation";
  const amountPaisa = Number(searchParams.get("amount")) || 600000;
  const returnUrl = searchParams.get("return_url") || "";
  const customerName = searchParams.get("name") || "";
  const customerPhone = searchParams.get("phone") || "";
  const customerEmail = searchParams.get("email") || "";

  const amountNpr = Math.round(amountPaisa / 100);

  const [activeTab, setActiveTab] = useState<"wallet" | "ebanking" | "mobile" | "connectips">("wallet");
  const [mobileNumber, setMobileNumber] = useState(customerPhone || "9800000000");
  const [mpin, setMpin] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!mobileNumber || mobileNumber.trim().length < 10) {
      setErrorMessage("Please enter a valid 10-digit Khalti mobile number.");
      return;
    }

    if (!mpin || mpin.trim().length < 4) {
      setErrorMessage("Please enter your 4-digit Khalti MPIN or security PIN.");
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);

      setTimeout(() => {
        if (returnUrl) {
          try {
            const redirectUrl = new URL(returnUrl, window.location.origin);
            redirectUrl.searchParams.set("pidx", pidx);
            redirectUrl.searchParams.set("status", "Completed");
            redirectUrl.searchParams.set("transaction_id", `KHALTI_TXN_${Date.now()}`);
            redirectUrl.searchParams.set("amount", amountPaisa.toString());
            redirectUrl.searchParams.set("purchase_order_id", orderId);
            window.location.href = redirectUrl.toString();
            return;
          } catch (err) {
            console.error("Return URL error:", err);
          }
        }

        // Fallback if returnUrl is not valid
        window.location.href = `/payment/success?id=${encodeURIComponent(
          orderId
        )}&gateway=khalti&pidx=${encodeURIComponent(pidx)}&amount=${amountNpr}`;
      }, 1200);
    }, 1800);
  };

  const handleCancel = () => {
    if (confirm("Are you sure you want to cancel this payment?")) {
      window.location.href = `/payment/failed?id=${encodeURIComponent(
        orderId
      )}&gateway=khalti&reason=Payment%20cancelled%20by%20user`;
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F1F8] flex flex-col items-center justify-center p-3 sm:p-6 font-sans">
      {/* Khalti Card Container */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-purple-100 overflow-hidden">
        {/* Khalti Header */}
        <div className="bg-[#5D2E8E] text-white p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-[#5D2E8E] font-black text-xl shadow-xs">
                K
              </div>
              <div>
                <span className="font-extrabold text-base tracking-wide block leading-tight">
                  khalti
                </span>
                <span className="text-[10px] text-purple-200 tracking-wider font-semibold uppercase">
                  Digital Wallet &amp; ePayment
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-purple-100 text-[10px] font-mono font-medium border border-white/15">
              <Lock className="w-3 h-3 text-emerald-300" />
              <span>256-Bit SSL</span>
            </div>
          </div>

          {/* Amount Display */}
          <div className="bg-white/10 rounded-xl p-3.5 border border-white/15 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-purple-200 block uppercase font-semibold tracking-wider">
                Total Amount Payable
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                NPR {amountNpr.toLocaleString()}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-purple-200 block">Bill Ref</span>
              <span className="text-xs font-mono font-bold text-purple-100">
                {orderId}
              </span>
            </div>
          </div>
        </div>

        {/* Merchant & Order Info */}
        <div className="px-5 py-3 bg-purple-50/60 border-b border-purple-100 flex items-center justify-between text-xs text-purple-900">
          <div className="flex items-center gap-2 truncate pr-2">
            <Building2 className="w-3.5 h-3.5 text-[#5D2E8E] shrink-0" />
            <span className="font-semibold truncate">Himalayan Green Energy Expo 2027</span>
          </div>
          <span className="text-[11px] font-mono text-purple-700 shrink-0 font-medium">IPPAN</span>
        </div>

        {/* Order Description */}
        <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-100 text-[11px] text-slate-600 flex items-center justify-between">
          <span className="truncate pr-2">{orderName}</span>
          <span className="text-slate-400 font-mono shrink-0">13% VAT incl.</span>
        </div>

        {/* Payment Channels Navigation */}
        <div className="grid grid-cols-4 p-2 bg-slate-100/80 border-b border-slate-200 text-[11px] font-medium text-slate-600 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("wallet")}
            className={`py-2 px-1 rounded-lg flex flex-col items-center gap-1 transition-all ${
              activeTab === "wallet"
                ? "bg-white text-[#5D2E8E] shadow-2xs font-bold"
                : "hover:text-slate-900"
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Wallet</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("ebanking")}
            className={`py-2 px-1 rounded-lg flex flex-col items-center gap-1 transition-all ${
              activeTab === "ebanking"
                ? "bg-white text-[#5D2E8E] shadow-2xs font-bold"
                : "hover:text-slate-900"
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>eBanking</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("mobile")}
            className={`py-2 px-1 rounded-lg flex flex-col items-center gap-1 transition-all ${
              activeTab === "mobile"
                ? "bg-white text-[#5D2E8E] shadow-2xs font-bold"
                : "hover:text-slate-900"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("connectips")}
            className={`py-2 px-1 rounded-lg flex flex-col items-center gap-1 transition-all ${
              activeTab === "connectips"
                ? "bg-white text-[#5D2E8E] shadow-2xs font-bold"
                : "hover:text-slate-900"
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>IPS</span>
          </button>
        </div>

        {/* Payment Form */}
        <div className="p-5 sm:p-6 space-y-4">
          {isSuccess ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-50 border-2 border-emerald-500 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">
                Payment Authorized!
              </h3>
              <p className="text-xs text-slate-600">
                Transaction ID: <strong>KHALTI_TXN_{Date.now().toString().slice(-6)}</strong>
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-[#5D2E8E] font-medium pt-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Returning to Himalayan Green Energy Expo...</span>
              </div>
            </div>
          ) : (
            <form onSubmit={handlePay} className="space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {activeTab === "wallet" ? (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Khalti Mobile ID / Number *
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        placeholder="98XXXXXXXX"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value.replace(/[^0-9]/g, "").slice(0, 10))}
                        className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-slate-900 text-sm font-mono tracking-wider focus:outline-none focus:border-[#5D2E8E] focus:ring-1 focus:ring-[#5D2E8E]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Khalti MPIN / Password *
                    </label>
                    <input
                      type="password"
                      required
                      maxLength={6}
                      placeholder="Enter 4 or 6-digit PIN"
                      value={mpin}
                      onChange={(e) => setMpin(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-slate-900 text-sm font-mono tracking-widest focus:outline-none focus:border-[#5D2E8E] focus:ring-1 focus:ring-[#5D2E8E]"
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-3 py-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Select Your Bank
                  </label>
                  <select
                    className="w-full h-11 px-3 rounded-xl border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-[#5D2E8E]"
                    defaultValue="nimb"
                  >
                    <option value="nimb">Nepal Investment Mega Bank (NIMB)</option>
                    <option value="nabil">Nabil Bank Limited</option>
                    <option value="global">Global IME Bank</option>
                    <option value="siddhartha">Siddhartha Bank</option>
                    <option value="everest">Everest Bank</option>
                    <option value="prabhu">Prabhu Bank</option>
                  </select>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Registered Bank Mobile Number
                    </label>
                    <input
                      type="tel"
                      maxLength={10}
                      placeholder="98XXXXXXXX"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value.replace(/[^0-9]/g, "").slice(0, 10))}
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-slate-900 text-sm font-mono tracking-wider focus:outline-none focus:border-[#5D2E8E]"
                    />
                  </div>

                  <input
                    type="hidden"
                    value={mpin || "1234"}
                  />
                </div>
              )}

              {/* Mode Note */}
              <div className="p-3 bg-purple-50/70 border border-purple-200/80 rounded-xl text-[11px] text-purple-950 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-[#5D2E8E]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Secure Khalti v2 Checkout</span>
                </div>
                <p className="text-purple-900/80 leading-relaxed">
                  Enter your Khalti credentials or PIN to authorize this official expo transaction.
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full h-12 rounded-xl bg-[#5D2E8E] hover:bg-[#4E2477] text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Authenticating with Khalti...</span>
                  </>
                ) : (
                  <>
                    <span>PAY NPR {amountNpr.toLocaleString()}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Cancel Link */}
              <div className="pt-1 text-center">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="text-xs text-slate-500 hover:text-rose-600 font-medium transition-colors"
                >
                  Cancel Payment and Return
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Khalti ePayment Gateway</span>
          <span>Regulated by Nepal Rastra Bank</span>
        </div>
      </div>
    </div>
  );
}

export default function KhaltiCheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F4F1F8] flex items-center justify-center font-mono text-xs text-purple-900">
          Loading Khalti Gateway...
        </div>
      }
    >
      <KhaltiCheckoutContent />
    </Suspense>
  );
}
