"use client";

import React, { useRef, useState } from "react";
import { CheckCircle2, FileUp, Loader2, Upload } from "lucide-react";

type Props = {
  bookingRef: string;
  /** Email used for the booking; asked for when not known (e.g. on the success page) */
  email?: string;
  /** Called after a successful upload; stallsLost lists stalls no longer held for this booking */
  onUploaded?: (result: { stallsLost: string[] }) => void;
};

const MAX_MB = 10;

/** Upload a payment receipt (photo or PDF) against a booking. */
export default function ReceiptUpload({ bookingRef, email: knownEmail, onUploaded }: Props) {
  const [email, setEmail] = useState(knownEmail || "");
  const [amount, setAmount] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const [stallsLost, setStallsLost] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setStatus("error");
      setMessage("Please choose your receipt file.");
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setStatus("error");
      setMessage(`The file is larger than ${MAX_MB}MB. Please upload a smaller photo or PDF.`);
      return;
    }
    setStatus("uploading");
    setMessage("");
    try {
      const body = new FormData();
      body.append("bookingId", bookingRef);
      body.append("email", email.trim());
      body.append("amount", amount.trim());
      body.append("file", file);
      const res = await fetch("/api/payment/receipt", { method: "POST", body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.error || "Upload failed. Please try again.");
      const lost: string[] = Array.isArray(data.stallsLost) ? data.stallsLost : [];
      setStallsLost(lost);
      setStatus("done");
      onUploaded?.({ stallsLost: lost });
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message || "Upload failed. Please try again.");
    }
  };

  if (status === "done") {
    return (
      <div className="p-4 rounded-xl bg-white border border-emerald-300 flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="text-[12.5px] text-slate-700 leading-relaxed">
          <strong className="text-slate-900">Receipt received.</strong> We&apos;ve emailed a confirmation to{" "}
          <strong>{email}</strong>.{" "}
          {stallsLost.length > 0 ? (
            <>
              Your reservation time had run out and stall <strong>{stallsLost.join(", ")}</strong> is no longer held for you.
              Our team will check your payment and contact you about your stall.
            </>
          ) : (
            <>Your stall stays reserved while our team verifies the payment (usually 1–2 working days). Your booking is confirmed once it is verified.</>
          )}
          <button
            type="button"
            onClick={() => setStatus("idle")}
            className="block mt-1.5 text-[#007A5E] font-semibold hover:underline cursor-pointer"
          >
            Upload another receipt
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
      <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
        <FileUp className="w-4 h-4 text-[#007A5E]" />
        <span>Already paid? Upload your receipt</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {!knownEmail && (
          <label className="block sm:col-span-2">
            <span className="block text-[11px] font-mono font-bold text-slate-600 uppercase mb-1">Email used for booking *</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </label>
        )}
        <label className="block">
          <span className="block text-[11px] font-mono font-bold text-slate-600 uppercase mb-1">Receipt (photo or PDF) *</span>
          <input
            ref={inputRef}
            type="file"
            required
            accept="image/png,image/jpeg,image/webp,image/heic,image/heif,application/pdf"
            onChange={(e) => {
              setFile(e.target.files?.[0] || null);
              if (status === "error") setStatus("idle");
            }}
            className="block w-full text-xs text-slate-600 file:mr-3 file:px-3 file:py-2 file:rounded-lg file:border-0 file:bg-emerald-50 file:text-emerald-800 file:font-semibold hover:file:bg-emerald-100 file:cursor-pointer"
          />
        </label>
        <label className="block">
          <span className="block text-[11px] font-mono font-bold text-slate-600 uppercase mb-1">Amount paid (optional)</span>
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. NPR 150,000"
            maxLength={40}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          />
        </label>
      </div>

      {status === "error" && message && (
        <p role="alert" className="text-[12px] text-rose-700 font-medium">
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "uploading"}
        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#007A5E] hover:bg-[#00664e] disabled:bg-slate-300 text-white font-mono text-xs font-bold transition-all shadow-xs cursor-pointer disabled:cursor-not-allowed"
      >
        {status === "uploading" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
        <span>{status === "uploading" ? "UPLOADING..." : "UPLOAD RECEIPT"}</span>
      </button>
    </form>
  );
}
