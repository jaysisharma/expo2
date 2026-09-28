import React, { Suspense } from "react";
import type { Metadata } from "next";
import DelegateRegistration from "@/components/booking/DelegateRegistration";
import Link from "next/link";
import { Calendar, MapPin, CheckCircle2, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Visitor & Delegate Registration | Himalayan Green Energy Expo 2027",
  description:
    "Register for complimentary trade visitor admission or full-access conference delegate credentials at Bhrikutimandap, Kathmandu.",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 flex flex-col">
      {/* Header */}
      <div className="bg-[#04281E] text-white pt-28 pb-8 px-4 sm:px-6 border-b border-emerald-500/20">
        <div className="max-w-xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 text-xs text-emerald-300/70 font-mono mb-2">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#34D399]">Register</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Visitor &amp; Delegate Registration
          </h1>
          <p className="mt-1 text-xs text-emerald-100/70">
            17–19 Jan 2027 · Bhrikutimandap Exhibition Hall, Kathmandu
          </p>
        </div>
      </div>

      {/* Form Content */}
      <div className="py-8 sm:py-10 px-4 sm:px-6 flex-grow flex items-start justify-center">
        <div className="w-full max-w-xl">
          <Suspense
            fallback={
              <div className="p-8 rounded-xl bg-white border border-slate-200 text-center text-xs text-slate-500">
                Loading registration form...
              </div>
            }
          >
            <DelegateRegistration />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
