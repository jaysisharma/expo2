"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, Building, Send, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_inquiry",
          payload: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            company: "",
            subject: formData.subject || "Secretariat General Inquiry",
            message: formData.message,
            stallInterest: "",
          },
        }),
      });
    } catch (err) {
      console.warn("Could not sync inquiry to server", err);
    } finally {
      setIsSubmitting(false);
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 flex flex-col">
      {/* =========================================================================
          01: SIMPLE HEADER WITH BACKGROUND COLOR (GREEN THEME)
         ========================================================================= */}
      <div className="bg-[#04281E] text-white pt-32 sm:pt-36 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 border-b border-emerald-500/20">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-emerald-300/70 font-mono mb-3">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#34D399]">Contact</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Contact Us
          </h1>
          <p className="mt-3 text-sm sm:text-base text-emerald-100/75 max-w-xl">
            Have questions about exhibition stalls, sponsorship, delegate registration, or the conference? Get in touch with our team.
          </p>
        </div>
      </div>

      {/* =========================================================================
          02: MAIN CONTACT SECTION (INFO & FORM)
         ========================================================================= */}
      <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 flex-grow">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Left Column: Direct Contact Info */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Secretariat Contact
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Reach out directly to the Himalayan Green Energy Expo coordination committee.
                </p>
              </div>

              <div className="space-y-3.5">
                {/* Email */}
                <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
                  <div className="w-10 h-10 rounded-lg bg-sky-50 text-[#087EA4] flex items-center justify-center shrink-0 mt-0.5">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                      Email
                    </span>
                    <a
                      href="mailto:expo@ippan.org.np"
                      className="text-sm font-medium text-slate-900 hover:text-[#087EA4] transition-colors block mt-0.5"
                    >
                      expo@ippan.org.np
                    </a>
                    <a
                      href="mailto:info@eventsolution.com.np"
                      className="text-sm text-slate-600 hover:text-[#087EA4] transition-colors block"
                    >
                      info@eventsolution.com.np
                    </a>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-[#19A974] flex items-center justify-center shrink-0 mt-0.5">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                      Phone
                    </span>
                    <a
                      href="tel:+97714412345"
                      className="text-sm font-medium text-slate-900 hover:text-[#087EA4] transition-colors block mt-0.5"
                    >
                      +977-1-4412345, +977-1-4435678
                    </a>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Sunday – Friday, 9:00 AM – 6:00 PM NPT
                    </p>
                  </div>
                </div>

                {/* Venue Location */}
                <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                      Exhibition Venue
                    </span>
                    <p className="text-sm font-medium text-slate-900 mt-0.5">
                      Bhrikutimandap Exhibition Complex
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Exhibition Road, Kathmandu, Nepal
                    </p>
                  </div>
                </div>

                {/* Organizers */}
                <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                      Organized By
                    </span>
                    <p className="text-sm font-medium text-slate-900 mt-0.5">
                      IPPAN × Event Solution Pvt. Ltd.
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Heritage Plaza, Kamaladi, Kathmandu
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Contact Form */}
            <div className="lg:col-span-7">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
                {submitted ? (
                  <div className="text-center py-10 space-y-4">
                    <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900">
                      Message Sent!
                    </h3>
                    <p className="text-sm text-slate-600 max-w-md mx-auto">
                      Thank you for contacting us. We have received your message and will respond to your email shortly.
                    </p>
                    <div className="pt-2">
                      <button
                        onClick={() => {
                          setSubmitted(false);
                          setFormData({
                            name: "",
                            email: "",
                            phone: "",
                            subject: "",
                            message: "",
                          });
                        }}
                        className="px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
                      >
                        Send Another Message
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">
                        Send a Message
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-600 mt-1">
                        Fill in your details below and our team will get back to you promptly.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Your Name"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#087EA4] focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="you@example.com"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#087EA4] focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          placeholder="+977 98XXXXXXXX"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#087EA4] focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Subject / Inquiry Type
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Stall Reservation"
                          value={formData.subject}
                          onChange={(e) =>
                            setFormData({ ...formData, subject: e.target.value })
                          }
                          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#087EA4] focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Message *
                      </label>
                      <textarea
                        rows={4}
                        required
                        placeholder="Write your message or inquiry here..."
                        value={formData.message}
                        onChange={(e) =>
                          setFormData({ ...formData, message: e.target.value })
                        }
                        className="w-full p-3.5 rounded-lg border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#087EA4] focus:border-transparent"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 rounded-lg bg-[#087EA4] hover:bg-[#061A2A] text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                    >
                      {isSubmitting ? (
                        <span>Sending...</span>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Send Message</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
