"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Building2,
  Plus,
  Minus,
  Loader2,
  AlertCircle,
  ArrowRight,
  FileText,
  Globe,
  Upload,
  X,
  Smartphone,
  Zap,
  Phone,
  Mail,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Shared styles
// ─────────────────────────────────────────────────────────────────────────────
const inputCls =
  "w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-emerald-500/70 focus:ring-1 focus:ring-emerald-500/30 transition-all";
const labelCls = "block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5";
const cardCls = "rounded-2xl bg-white/[0.03] border border-white/8 p-6 sm:p-7";

// ─────────────────────────────────────────────────────────────────────────────

function BookGalaDinnerForm() {
  const searchParams = useSearchParams();
  const initialTier =
    searchParams.get("tier") === "international" ? "international" : "national";

  const [passTier, setPassTier] = useState<"national" | "international">(initialTier);
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<"khalti" | "qr">("khalti");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    organization: "",
    country: "",
  });
  const [customCountry, setCustomCountry] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const tier = searchParams.get("tier");
    if (tier === "international" || tier === "national") setPassTier(tier);
  }, [searchParams]);

  const unitPrice = passTier === "international" ? 6750 : 6000;
  const total = unitPrice * quantity;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
    if (error) setError("");
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScreenshot(file);
    setScreenshotPreview(URL.createObjectURL(file));
  };

  const removeScreenshot = () => {
    setScreenshot(null);
    setScreenshotPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validate = () => {
    if (!formData.name.trim()) return "Full name is required.";
    if (!formData.email.includes("@")) return "Valid email is required.";
    if (formData.phone.length < 7) return "Valid phone number is required.";
    const resolvedCountry =
      formData.country === "Other" ? customCountry.trim() : formData.country;
    if (!resolvedCountry) {
      return formData.country === "Other"
        ? "Please type your country name."
        : "Please select your country.";
    }
    if (paymentMethod === "qr" && !screenshot)
      return "Please upload your Khalti payment screenshot.";
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true);

    try {
      // Upload screenshot to Cloudinary if QR method
      let screenshotUrl = "";
      if (paymentMethod === "qr" && screenshot) {
        const fd = new FormData();
        fd.append("file", screenshot);
        fd.append("folder", "gala-screenshots");
        const upRes = await fetch("/api/upload", { method: "POST", body: fd });
        const upData = await upRes.json();
        screenshotUrl = upData.url || "";
      }

      const resolvedCountry =
        formData.country === "Other" ? customCountry.trim() : formData.country;

      const res = await fetch("/api/gala-dinner/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          country: resolvedCountry,
          passType: passTier,
          quantity,
          paymentMethod,
          screenshotUrl,
          dietary: "Standard Gourmet (Chef's Selection)",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Booking failed.");

      if (paymentMethod === "khalti" && data.paymentUrl) {
        window.location.href = data.paymentUrl;
        return;
      }
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
        return;
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 sm:pt-32">

        {/* ── Breadcrumb ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-10">
          <Link href="/" className="hover:text-slate-300 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-slate-300">Gala Dinner Booking</span>
        </div>

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="mb-12">
          <p className="text-xs font-semibold text-emerald-500 uppercase tracking-widest mb-3">
            Himalayan Green Energy Expo 2027
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-5">
            Gala Dinner Pass Booking
          </h1>
          <div className="flex flex-wrap gap-5 text-sm text-slate-400">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-500" />
              Royal Tulip Kathmandu (Gwarko)
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-500" />
              Monday, 18 January 2027
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-500" />
              6:00 PM onwards
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Executive Banquet &amp; VIP Networking
            </span>
          </div>
        </div>

        {/* ── Error ──────────────────────────────────────────────────── */}
        {error && (
          <div className="mb-6 p-4 rounded-xl border border-rose-500/30 bg-rose-950/30 text-rose-300 text-sm flex items-start gap-3">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

            {/* ── LEFT (3/5) ─────────────────────────────────────────── */}
            <div className="lg:col-span-3 space-y-5">

              {/* STEP 1: Pass Tier */}
              <div className={cardCls}>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
                  01 — Pass Tier
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {/* National */}
                  <button
                    type="button"
                    onClick={() => setPassTier("national")}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      passTier === "national"
                        ? "border-emerald-500/60 bg-emerald-950/40 ring-1 ring-emerald-500/20"
                        : "border-white/8 bg-white/[0.02] hover:border-white/15"
                    }`}
                  >
                    <div className="text-lg mb-2">🇳🇵</div>
                    <div className="font-semibold text-sm text-white">National</div>
                    <div className="text-xs text-slate-500 mt-0.5">For Nepali delegates</div>
                    <div className="mt-3 font-bold text-white font-mono">NPR 6,000<span className="text-xs font-normal text-slate-500 ml-1">/seat</span></div>
                  </button>

                  {/* International */}
                  <button
                    type="button"
                    onClick={() => setPassTier("international")}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      passTier === "international"
                        ? "border-blue-500/60 bg-blue-950/30 ring-1 ring-blue-500/20"
                        : "border-white/8 bg-white/[0.02] hover:border-white/15"
                    }`}
                  >
                    <div className="text-lg mb-2">🌐</div>
                    <div className="font-semibold text-sm text-white">International</div>
                    <div className="text-xs text-slate-500 mt-0.5">Foreign delegates</div>
                    <div className="mt-3 font-bold text-white font-mono">USD 50<span className="text-xs font-normal text-slate-500 ml-1">≈ NPR 6,750</span></div>
                  </button>
                </div>

                {/* Seats counter */}
                <div className="mt-4 pt-4 border-t border-white/6 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-400">Number of Seats</p>
                    <p className="text-[11px] text-slate-600 mt-0.5">Max 25 per reservation</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity <= 1}
                      className="w-8 h-8 rounded-lg bg-white/8 hover:bg-white/15 disabled:opacity-30 flex items-center justify-center transition-colors">
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center font-mono font-bold text-white">{quantity}</span>
                    <button type="button" onClick={() => setQuantity(q => Math.min(25, q + 1))} disabled={quantity >= 25}
                      className="w-8 h-8 rounded-lg bg-white/8 hover:bg-white/15 disabled:opacity-30 flex items-center justify-center transition-colors">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* STEP 2: Your Details */}
              <div className={cardCls}>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
                  02 — Your Details
                </p>
                <div className="space-y-3">
                  <div>
                    <label className={labelCls}>Full Name *</label>
                    <input name="name" type="text" required value={formData.name} onChange={handleChange}
                      placeholder="Ramesh Adhikari" className={inputCls} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Email *</label>
                      <input name="email" type="email" required value={formData.email} onChange={handleChange}
                        placeholder="you@company.com" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Phone / WhatsApp *</label>
                      <input name="phone" type="tel" required value={formData.phone} onChange={handleChange}
                        placeholder="+977 98XXXXXXXX" className={inputCls} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Organization</label>
                      <input name="organization" type="text" value={formData.organization} onChange={handleChange}
                        placeholder="e.g. Sanima Hydro" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Country *</label>
                      <div className="relative">
                        <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                        <select name="country" required value={formData.country} onChange={handleChange}
                          className="w-full pl-9 pr-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500/70 focus:ring-1 focus:ring-emerald-500/30 transition-all cursor-pointer appearance-none">
                          <option value="" disabled>Select country</option>
                          <option value="Nepal">🇳🇵 Nepal</option>
                          <option value="India">🇮🇳 India</option>
                          <option value="China">🇨🇳 China</option>
                          <option value="Bangladesh">🇧🇩 Bangladesh</option>
                          <option value="Pakistan">🇵🇰 Pakistan</option>
                          <option value="Sri Lanka">🇱🇰 Sri Lanka</option>
                          <option value="Bhutan">🇧🇹 Bhutan</option>
                          <option value="Myanmar">🇲🇲 Myanmar</option>
                          <option value="Thailand">🇹🇭 Thailand</option>
                          <option value="Japan">🇯🇵 Japan</option>
                          <option value="South Korea">🇰🇷 South Korea</option>
                          <option value="Singapore">🇸🇬 Singapore</option>
                          <option value="Germany">🇩🇪 Germany</option>
                          <option value="United Kingdom">🇬🇧 United Kingdom</option>
                          <option value="United States">🇺🇸 United States</option>
                          <option value="Canada">🇨🇦 Canada</option>
                          <option value="Australia">🇦🇺 Australia</option>
                          <option value="France">🇫🇷 France</option>
                          <option value="Netherlands">🇳🇱 Netherlands</option>
                          <option value="Norway">🇳🇴 Norway</option>
                          <option value="UAE">🇦🇪 UAE</option>
                          <option value="Other">🌐 Other (Specify)</option>
                        </select>
                      </div>

                      {formData.country === "Other" && (
                        <div className="mt-2.5">
                          <input
                            type="text"
                            required
                            value={customCountry}
                            onChange={(e) => {
                              setCustomCountry(e.target.value);
                              if (error) setError("");
                            }}
                            placeholder="Type your country name..."
                            className={inputCls}
                            autoFocus
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* STEP 3: Payment */}
              <div className={cardCls}>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
                  03 — Payment
                </p>

                <div className="grid grid-cols-2 gap-3 mb-5">
                  {/* Khalti ePay */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("khalti")}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      paymentMethod === "khalti"
                        ? "border-purple-500/60 bg-purple-950/30 ring-1 ring-purple-500/20"
                        : "border-white/8 bg-white/[0.02] hover:border-white/15"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded bg-[#5c2d91] flex items-center justify-center text-white font-bold text-xs">K</div>
                      <span className="font-semibold text-sm text-white">Khalti Pay</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">Wallet, eBanking, SCT Card</p>
                    <div className="mt-2 flex items-center gap-1 text-[10px] text-purple-400 font-mono">
                      <Zap className="w-3 h-3" /> Instant confirmation
                    </div>
                  </button>

                  {/* Pay via QR */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("qr")}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      paymentMethod === "qr"
                        ? "border-purple-500/60 bg-purple-950/30 ring-1 ring-purple-500/20"
                        : "border-white/8 bg-white/[0.02] hover:border-white/15"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded bg-[#5c2d91] flex items-center justify-center">
                        <Smartphone className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="font-semibold text-sm text-white">Pay via QR</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">Scan Khalti QR & upload screenshot</p>
                    <div className="mt-2 flex items-center gap-1 text-[10px] text-purple-400 font-mono">
                      <Upload className="w-3 h-3" /> Upload receipt
                    </div>
                  </button>
                </div>

                {/* QR Panel */}
                {paymentMethod === "qr" && (
                  <div className="rounded-xl border border-purple-500/20 bg-purple-950/20 p-5 space-y-4">
                    {/* QR Code */}
                    <div className="flex flex-col sm:flex-row gap-5 items-start">
                      <div className="shrink-0">
                        <div className="w-40 h-40 rounded-xl overflow-hidden border border-white/10">
                          <Image
                            src="/images/khalti-qr.jpg"
                            alt="Khalti QR Code"
                            width={160}
                            height={160}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-[10px] text-slate-500 text-center mt-1.5">Scan with Khalti app</p>
                      </div>
                      <div className="space-y-2.5 text-sm">
                        <p className="text-slate-300 font-semibold">How to pay:</p>
                        <ol className="text-[12px] text-slate-400 space-y-1.5 list-decimal list-inside leading-relaxed">
                          <li>Open Khalti app on your phone</li>
                          <li>Tap <span className="text-white font-medium">Scan QR</span> and scan the code</li>
                          <li>Enter amount: <span className="text-white font-bold font-mono">NPR {total.toLocaleString()}</span></li>
                          <li>Complete the payment</li>
                          <li>Take a screenshot of the success screen</li>
                          <li>Upload it below</li>
                        </ol>
                      </div>
                    </div>

                    {/* Screenshot Upload */}
                    <div>
                      <label className={labelCls}>Payment Screenshot *</label>
                      {screenshotPreview ? (
                        <div className="relative rounded-xl overflow-hidden border border-white/10">
                          <img src={screenshotPreview} alt="Screenshot" className="w-full max-h-48 object-contain bg-black/40" />
                          <button
                            type="button"
                            onClick={removeScreenshot}
                            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 hover:bg-rose-900/80 flex items-center justify-center transition-colors"
                          >
                            <X className="w-3.5 h-3.5 text-white" />
                          </button>
                          <div className="p-2 text-[11px] text-emerald-400 text-center border-t border-white/10">
                            ✓ Screenshot uploaded — {screenshot?.name}
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full py-8 rounded-xl border border-dashed border-white/15 hover:border-purple-500/40 hover:bg-purple-950/10 transition-all flex flex-col items-center gap-2 text-slate-500 hover:text-slate-300"
                        >
                          <Upload className="w-5 h-5" />
                          <span className="text-xs">Click to upload screenshot</span>
                          <span className="text-[10px] text-slate-600">JPG, PNG, WEBP · Max 10MB</span>
                        </button>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFile}
                        className="hidden"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── RIGHT (2/5): Sticky Summary ────────────────────────── */}
            <div className="lg:col-span-2 lg:sticky lg:top-24 space-y-4 h-fit">
              <div className="rounded-2xl bg-white/[0.03] border border-white/8 p-6">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-4">
                  Booking Summary
                </p>

                <div className="space-y-3 text-sm pb-4 border-b border-white/6">
                  <div className="flex justify-between text-slate-400">
                    <span>Pass</span>
                    <span className="text-white font-medium">
                      {passTier === "national" ? "🇳🇵 National" : "🌐 International"}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Seats</span>
                    <span className="text-white font-medium">{quantity}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Unit price</span>
                    <span className="text-white font-mono">
                      {passTier === "national" ? "NPR 6,000" : "USD 50"}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Payment</span>
                    <span className="text-white font-medium">
                      {paymentMethod === "khalti" ? "Khalti ePay" : "QR Scan"}
                    </span>
                  </div>
                </div>

                <div className="py-4 border-b border-white/6 flex items-baseline justify-between">
                  <span className="text-xs text-slate-500 uppercase tracking-wider">Total</span>
                  <div className="text-right">
                    <div className="text-2xl font-bold font-mono text-white">
                      NPR {total.toLocaleString()}
                    </div>
                    {passTier === "international" && (
                      <div className="text-[11px] text-slate-500 font-mono">≈ USD {50 * quantity}</div>
                    )}
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /><span>Processing...</span></>
                    ) : paymentMethod === "khalti" ? (
                      <><span>Pay NPR {total.toLocaleString()} via Khalti</span><ArrowRight className="w-4 h-4" /></>
                    ) : (
                      <><span>Submit Booking</span><ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                </div>
              </div>

              {/* Help */}
              <div className="rounded-2xl bg-white/[0.03] border border-white/8 p-5 space-y-3">
                <p className="text-slate-200 font-semibold text-xs tracking-wide">
                  Need help?
                </p>

                {/* Mobile / Hotlines */}
                <div className="flex items-start gap-2.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                      Mobile / Hotlines
                    </div>
                    <div className="text-white font-mono text-xs pt-0.5">
                      <a href="tel:+9779703606348" className="hover:text-emerald-400 transition-colors">
                        +977-9703606348
                      </a>
                      <span className="text-slate-600 mx-1.5">|</span>
                      <a href="tel:+9779703606345" className="hover:text-emerald-400 transition-colors">
                        9703606345
                      </a>
                    </div>
                  </div>
                </div>

                {/* Expo Email */}
                <div className="flex items-start gap-2.5">
                  <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                      Expo Email
                    </div>
                    <a
                      href="mailto:info@nepalenergyexpo.com"
                      className="text-white font-mono text-xs hover:text-emerald-400 transition-colors block pt-0.5"
                    >
                      info@nepalenergyexpo.com
                    </a>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
}

export default function BookGalaDinnerPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
          <div className="flex items-center gap-3 text-slate-500 text-sm">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading...</span>
          </div>
        </div>
      }
    >
      <BookGalaDinnerForm />
    </Suspense>
  );
}
