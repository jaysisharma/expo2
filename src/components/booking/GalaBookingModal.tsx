'use client';

import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Building2,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  Plus,
  Minus,
  AlertCircle,
  Wine,
} from 'lucide-react';

interface GalaBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTier?: 'national' | 'international';
}

export function GalaBookingModal({
  isOpen,
  onClose,
  initialTier = 'national',
}: GalaBookingModalProps) {
  const [passTier, setPassTier] = useState<'national' | 'international'>(initialTier);
  const [quantity, setQuantity] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<'khalti' | 'bank'>('khalti');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
    jobTitle: '',
    dietary: 'Standard Gourmet',
    specialRequests: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  // Prices:
  // National: NPR 6,000 / pax
  // International: USD 50 / pax (converted to NPR 6,750 for Khalti)
  const unitPriceNPR = passTier === 'international' ? 6750 : 6000;
  const unitPriceUSD = passTier === 'international' ? 50 : 45;
  const totalPriceNPR = unitPriceNPR * quantity;
  const totalPriceUSD = unitPriceUSD * quantity;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errorMessage) setErrorMessage('');
  };

  const handleQuantity = (delta: number) => {
    setQuantity((prev) => Math.max(1, Math.min(25, prev + delta)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }
    if (!formData.phone.trim() || formData.phone.length < 8) {
      setErrorMessage('Please enter a valid contact phone or WhatsApp number.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/gala-dinner/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          organization: formData.organization.trim(),
          jobTitle: formData.jobTitle.trim(),
          passType: passTier,
          quantity,
          dietary: formData.dietary,
          specialRequests: formData.specialRequests.trim(),
          paymentMethod,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to initiate booking.');
      }

      if (paymentMethod === 'khalti' && data.paymentUrl) {
        // Redirect to Khalti checkout
        window.location.href = data.paymentUrl;
      } else if (data.redirectUrl) {
        // Bank transfer redirect
        window.location.href = data.redirectUrl;
      } else {
        window.location.href = `/payment/success?id=${encodeURIComponent(data.orderId)}&type=gala&gateway=${paymentMethod}`;
      }
    } catch (err: any) {
      console.error('Booking submission error:', err);
      setErrorMessage(err.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#071322] border border-emerald-500/30 rounded-3xl shadow-2xl overflow-hidden text-white my-auto">
        {/* Modal Header */}
        <div className="relative px-6 py-6 sm:px-8 sm:py-7 bg-gradient-to-r from-[#04281E] via-[#071F18] to-[#041A14] border-b border-white/10 flex items-start justify-between">
          <div className="space-y-1.5 pr-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-mono font-bold text-emerald-400 uppercase">
              <Sparkles className="w-3 h-3 text-[#00E599]" />
              <span>Royal Tulip Luxury Hotel, Kathmandu</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
              <span>Gala Dinner Pass Booking</span>
              <Wine className="w-6 h-6 text-amber-300 hidden sm:inline" />
            </h2>
            <p className="text-xs text-emerald-100/70 font-normal">
              Saturday, 17 January 2027 · 6:00 PM onwards · Executive Banquet &amp; VIP Networking
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 max-h-[78vh] overflow-y-auto">
          {/* Error Alert */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. Select Tier & Quantity */}
          <div className="space-y-3">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
              1. Select Pass Tier
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* National Tier Card */}
              <button
                type="button"
                onClick={() => setPassTier('national')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  passTier === 'national'
                    ? 'bg-emerald-950/60 border-[#00E599] shadow-lg shadow-emerald-950/40 ring-1 ring-[#00E599]'
                    : 'bg-white/[0.03] border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg">🇳🇵</span>
                  <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                    National
                  </span>
                </div>
                <div className="font-bold text-sm text-white mt-2">National Delegate Pass</div>
                <div className="flex items-baseline gap-1 mt-1 font-mono">
                  <span className="text-xl font-extrabold text-emerald-400">NPR 6,000</span>
                  <span className="text-[10px] text-slate-400">/ person</span>
                </div>
              </button>

              {/* International Tier Card */}
              <button
                type="button"
                onClick={() => setPassTier('international')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  passTier === 'international'
                    ? 'bg-sky-950/60 border-sky-400 shadow-lg shadow-sky-950/40 ring-1 ring-sky-400'
                    : 'bg-white/[0.03] border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg">🌐</span>
                  <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300">
                    International
                  </span>
                </div>
                <div className="font-bold text-sm text-white mt-2">International VIP Pass</div>
                <div className="flex items-baseline gap-1 mt-1 font-mono">
                  <span className="text-xl font-extrabold text-sky-400">USD 50</span>
                  <span className="text-[10px] text-slate-400">≈ NPR 6,750</span>
                </div>
              </button>
            </div>
          </div>

          {/* Quantity Stepper */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.04] border border-white/10">
            <div>
              <span className="text-xs font-bold text-white block">Number of Delegates / Seats</span>
              <span className="text-[11px] text-slate-400">Max 25 per single reservation</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleQuantity(-1)}
                disabled={quantity <= 1}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-white transition-colors"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-lg font-bold text-emerald-400 w-8 text-center">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => handleQuantity(1)}
                disabled={quantity >= 25}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-white transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 2. Delegate Contact Information */}
          <div className="space-y-4">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 block">
              2. Delegate Details
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Ramesh K. Adhikari"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-emerald-400 focus:outline-none text-white text-xs placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="delegate@company.com"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-emerald-400 focus:outline-none text-white text-xs placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">
                  Mobile / WhatsApp <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+977 98XXXXXXXX"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-emerald-400 focus:outline-none text-white text-xs placeholder:text-slate-500 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">
                  Organization / Company
                </label>
                <input
                  type="text"
                  name="organization"
                  value={formData.organization}
                  onChange={handleChange}
                  placeholder="e.g. Sanima Hydro / ABB"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-emerald-400 focus:outline-none text-white text-xs placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">
                  Job Designation
                </label>
                <input
                  type="text"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleChange}
                  placeholder="e.g. Managing Director / Chief Engineer"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-emerald-400 focus:outline-none text-white text-xs placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">
                  Dietary Preference
                </label>
                <select
                  name="dietary"
                  value={formData.dietary}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-emerald-400 focus:outline-none text-white text-xs"
                >
                  <option value="Standard Gourmet">Standard Gourmet (Chef’s Selection)</option>
                  <option value="Vegetarian">Pure Vegetarian</option>
                  <option value="Vegan">Vegan</option>
                  <option value="Jain">Jain Friendly</option>
                </select>
              </div>
            </div>
          </div>

          {/* 3. Payment Method */}
          <div className="space-y-3 pt-2">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 block">
              3. Payment Method
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Khalti Gateway Option */}
              <button
                type="button"
                onClick={() => setPaymentMethod('khalti')}
                className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                  paymentMethod === 'khalti'
                    ? 'bg-[#5D2E8E]/20 border-[#5D2E8E] ring-1 ring-[#5D2E8E] shadow-md shadow-purple-950/30'
                    : 'bg-white/[0.03] border-white/10 hover:border-white/20'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-[#5D2E8E] text-white flex items-center justify-center shrink-0 font-extrabold text-xs">
                  K
                </div>
                <div className="space-y-0.5">
                  <div className="font-bold text-xs text-white flex items-center gap-1.5">
                    <span className="text-[#A855F7] font-extrabold">Khalti</span>
                    <span>ePayment</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    Instant checkout via Khalti Wallet, eBanking, Mobile Banking &amp; SCT Cards.
                  </p>
                </div>
              </button>

              {/* Bank Wire / Corporate Transfer */}
              <button
                type="button"
                onClick={() => setPaymentMethod('bank')}
                className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                  paymentMethod === 'bank'
                    ? 'bg-emerald-950/60 border-emerald-400 ring-1 ring-emerald-400'
                    : 'bg-white/[0.03] border-white/10 hover:border-white/20'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-800 text-white flex items-center justify-center shrink-0">
                  <Building2 className="w-4 h-4 text-emerald-300" />
                </div>
                <div className="space-y-0.5">
                  <div className="font-bold text-xs text-white">Bank Wire / Invoice</div>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    Receive official pro-forma invoice for corporate wire remittance.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Pricing Summary Box */}
          <div className="p-4 rounded-2xl bg-white/[0.05] border border-white/10 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-300 font-mono">
              <span>
                {passTier === 'international' ? 'International VIP Pass' : 'National Gala Pass'} × {quantity}
              </span>
              <span className="text-white font-bold">
                NPR {totalPriceNPR.toLocaleString()}
                {passTier === 'international' && ` (USD ${totalPriceUSD})`}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-white/10 pt-2">
              <span>Venue &amp; Entry:</span>
              <span className="text-emerald-300">Royal Tulip, Kathmandu + 3-Day Expo Pass</span>
            </div>
            <div className="flex items-center justify-between font-mono font-bold text-sm text-white pt-1">
              <span>Grand Total:</span>
              <span className="text-emerald-400 text-base">
                NPR {totalPriceNPR.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Submit CTA Button */}
          <div className="pt-2">
            {paymentMethod === 'khalti' ? (
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-[#5D2E8E] hover:bg-[#4E2477] active:scale-[0.99] text-white font-bold text-sm uppercase tracking-wider transition-all shadow-lg shadow-purple-950/40 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Connecting to Khalti Gateway...</span>
                  </>
                ) : (
                  <>
                    <span>Pay with Khalti (NPR {totalPriceNPR.toLocaleString()})</span>
                    <CreditCard className="w-4 h-4" />
                  </>
                )}
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-[#007A5E] hover:bg-[#005C42] active:scale-[0.99] text-white font-bold text-sm uppercase tracking-wider transition-all shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Processing Order...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm Bank Transfer (NPR {totalPriceNPR.toLocaleString()})</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>
            )}

            <div className="mt-3 flex items-center justify-center gap-2 text-[10px] text-slate-400 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>256-Bit SSL Encrypted &amp; Official IPPAN Verified Transaction</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default GalaBookingModal;
