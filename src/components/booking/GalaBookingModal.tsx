'use client';

import React, { useState, useEffect } from 'react';
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
  Lock,
  Mail,
  Phone,
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
  const [paymentMethod, setPaymentMethod] = useState<'khalti' | 'bank'>(initialTier === 'international' ? 'bank' : 'khalti');

  useEffect(() => {
    if (passTier === 'international') {
      setPaymentMethod('bank');
    }
  }, [passTier]);

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
  // National: NPR 6,000 / pax (+ 13% VAT)
  // International: USD 50 / pax (+ 13% VAT)
  const unitPriceNPR = passTier === 'international' ? 6750 : 6000;
  const unitPriceUSD = passTier === 'international' ? 50 : 45;
  const vatRate = 0.13;

  const subtotalNPR = unitPriceNPR * quantity;
  const vatNPR = Math.round(subtotalNPR * vatRate);
  const totalAmountNPR = subtotalNPR + vatNPR;

  const subtotalUSD = unitPriceUSD * quantity;
  const vatUSD = Math.round(subtotalUSD * vatRate);
  const totalAmountUSD = subtotalUSD + vatUSD;

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

    if (passTier === 'international') {
      setErrorMessage(
        'Online booking for international passes is currently unavailable as the payment gateway is under construction. Please contact info@himalayanenergyexpo.com or +977-9703606348.'
      );
      return;
    }

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
      const resolvedPaymentMethod = paymentMethod;
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
          paymentMethod: resolvedPaymentMethod,
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
              <span>Royal Tulip Kathmandu (Gwarko)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
              <span>Networking Dinner Pass Booking</span>
              <Wine className="w-6 h-6 text-amber-300 hidden sm:inline" />
            </h2>
            <p className="text-xs text-emerald-100/70 font-normal">
              Monday, 18 January 2027 · 6:00 PM onwards
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
                  <span className="text-[10px] text-emerald-300 font-sans ml-1">(+ 13% VAT)</span>
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
                  <span className="text-[10px] text-sky-300 font-sans ml-1">(+ 13% VAT)</span>
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
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 block">
                3. Payment Method
              </label>
              <span className="text-[10px] font-mono text-slate-400">
                {passTier === 'international' ? 'International Foreign Delegate' : 'Nepal Domestic NPR Checkout'}
              </span>
            </div>

            {passTier === 'international' ? (
              /* INTERNATIONAL GATEWAY NOTICE */
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 shrink-0 mt-0.5">
                    <Lock className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="space-y-1">
                    <div className="font-bold text-sm flex flex-wrap items-center gap-2">
                      <span className="text-white">Online Payment Gateway Unavailable</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 uppercase font-bold tracking-wider border border-amber-400/30">
                        🚧 Under Construction · Coming Soon
                      </span>
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed font-normal">
                      Online payment for international cards is currently under construction and not active yet. Direct online booking for foreign delegates ($50/seat) cannot be processed on the website at this time.
                    </p>
                  </div>
                </div>

                <div className="rounded-xl bg-slate-900/80 border border-white/10 p-3.5 space-y-3 text-xs">
                  <p className="font-semibold text-white">How to reserve passes as an international delegate:</p>
                  <p className="text-slate-300 leading-relaxed font-normal text-[11px]">
                    Please contact the Expo Secretariat directly. Our registration team will assist you with pass reservation and invoice:
                  </p>
                  <div className="pt-1 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                    <div className="space-y-1.5">
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-sans font-semibold">
                        Email
                      </span>
                      <div className="flex flex-col gap-1.5">
                        <a
                          href="mailto:info@himalayanenergyexpo.com?subject=International%20Pass%20Reservation"
                          className="text-emerald-400 hover:text-emerald-300 underline flex items-center gap-1.5"
                        >
                          <Mail className="w-3.5 h-3.5 shrink-0" />
                          <span>info@himalayanenergyexpo.com</span>
                        </a>
                        <a
                          href="mailto:info@ippan.org.np?subject=International%20Pass%20Reservation"
                          className="text-emerald-400 hover:text-emerald-300 underline flex items-center gap-1.5"
                        >
                          <Mail className="w-3.5 h-3.5 shrink-0" />
                          <span>info@ippan.org.np</span>
                        </a>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-sans font-semibold">
                        Mobile / Hotlines
                      </span>
                      <div className="flex flex-col gap-1.5">
                        <a
                          href="tel:+9779703606348"
                          className="text-emerald-400 hover:text-emerald-300 underline flex items-center gap-1.5"
                        >
                          <Phone className="w-3.5 h-3.5 shrink-0" />
                          <span>+977-9703606348</span>
                        </a>
                        <a
                          href="tel:+9779703606345"
                          className="text-emerald-400 hover:text-emerald-300 underline flex items-center gap-1.5"
                        >
                          <Phone className="w-3.5 h-3.5 shrink-0" />
                          <span>+977-9703606345</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* NATIONAL GATEWAYS */
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
            )}
          </div>

          {/* Pricing Summary Box */}
          <div className="p-4 rounded-2xl bg-white/[0.05] border border-white/10 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-300 font-mono">
              <span>
                {passTier === 'international' ? 'International VIP Pass' : 'National Networking Pass'} × {quantity}
              </span>
              <span className="text-white font-bold">
                {passTier === 'international'
                  ? `USD $${subtotalUSD} (≈ NPR ${subtotalNPR.toLocaleString()})`
                  : `NPR ${subtotalNPR.toLocaleString()}`}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-300 font-mono">
              <span>Government 13% VAT:</span>
              <span className="text-emerald-400 font-bold">
                {passTier === 'international'
                  ? `+ USD $${vatUSD} (≈ NPR ${vatNPR.toLocaleString()})`
                  : `+ NPR ${vatNPR.toLocaleString()}`}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-white/10 pt-2">
              <span>Venue &amp; Entry:</span>
              <span className="text-emerald-300">Royal Tulip Kathmandu (Gwarko) + 3-Day Expo Pass</span>
            </div>
            <div className="flex items-center justify-between font-mono font-bold text-sm text-white pt-1 border-t border-white/10">
              <span>Grand Total (incl. 13% VAT):</span>
              <span className="text-emerald-400 text-base">
                {passTier === 'international' ? `USD $${totalAmountUSD}` : `NPR ${totalAmountNPR.toLocaleString()}`}
              </span>
            </div>
          </div>

          {/* Submit CTA Button */}
          <div className="pt-2">
            {passTier === 'international' ? (
              <div className="space-y-2.5">
                <button
                  type="button"
                  disabled
                  className="w-full py-3.5 rounded-2xl bg-slate-800 text-slate-400 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-not-allowed border border-white/10 shadow-none"
                >
                  <Lock className="w-4 h-4 text-slate-500" />
                  <span>Online Booking Coming Soon (Under Construction)</span>
                </button>

                <a
                  href={`mailto:info@himalayanenergyexpo.com,info@ippan.org.np?subject=International%20Pass%20Reservation%20(${quantity}%20Seats)&body=Dear%20Expo%20Team,%0A%0AI%20would%20like%20to%20reserve%20${quantity}%20International%20Pass(es)%20for%20the%20Himalayan%20Green%20Energy%20Expo%202027.%0A%0AName:%20${encodeURIComponent(formData.name)}%0AOrganization:%20${encodeURIComponent(formData.organization)}%0AEmail:%20${encodeURIComponent(formData.email)}%0APhone:%20${encodeURIComponent(formData.phone)}%0A%0APlease%20let%20me%20know%20how%20to%20confirm%20the%20reservation.%0A%0AThank%20you.`}
                  className="w-full py-3 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all text-center cursor-pointer shadow-lg shadow-sky-950/40"
                >
                  <Mail className="w-4 h-4" />
                  <span>Contact Secretariat to Book ({quantity} {quantity === 1 ? 'Seat' : 'Seats'})</span>
                </a>
              </div>
            ) : paymentMethod === 'khalti' ? (
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
                    <span>Pay with Khalti (NPR {totalAmountNPR.toLocaleString()})</span>
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
                    <span>Confirm Bank Transfer (NPR {totalAmountNPR.toLocaleString()})</span>
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
