"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Download,
  FileText,
  User,
  Building2,
  Phone,
  Mail,
  CheckCircle2,
  Lock,
  ArrowRight,
} from "lucide-react";

export interface PdfModalEventDetail {
  pdfUrl: string;
  title?: string;
}

export function triggerPdfDownloadModal(pdfUrl: string, title?: string) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent<PdfModalEventDetail>("open-pdf-download-modal", {
        detail: { pdfUrl, title },
      })
    );
  }
}

export default function PdfDownloadModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string>("/files/hydroproposal-13-2-2024.pdf");
  const [documentTitle, setDocumentTitle] = useState<string>(
    "Himalayan Green Energy Expo Proposal (PDF)"
  );

  const [formData, setFormData] = useState({
    name: "",
    company: "",
    phone: "",
    email: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const handleOpenModal = (event: Event) => {
      const customEvent = event as CustomEvent<PdfModalEventDetail>;
      if (customEvent.detail) {
        setPdfUrl(customEvent.detail.pdfUrl || "/files/hydroproposal-13-2-2024.pdf");
        setDocumentTitle(
          customEvent.detail.title || "Himalayan Green Energy Expo Proposal (PDF)"
        );
      }
      setIsSuccess(false);
      setErrors({});
      setIsOpen(true);
    };

    window.addEventListener("open-pdf-download-modal", handleOpenModal);

    // Global interceptor for all .pdf links on the page
    const handleDocumentClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (target && target.getAttribute("href")?.endsWith(".pdf")) {
        const href = target.getAttribute("href")!;
        const linkText = target.innerText || "Official Event Document (PDF)";
        e.preventDefault();
        triggerPdfDownloadModal(href, linkText);
      }
    };

    document.addEventListener("click", handleDocumentClick, true);

    return () => {
      window.removeEventListener("open-pdf-download-modal", handleOpenModal);
      document.removeEventListener("click", handleDocumentClick, true);
    };
  }, []);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) newErrors.name = "Full name is required";
    if (!formData.company.trim()) newErrors.company = "Company name is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    // Save lead locally
    try {
      const existingLeads = JSON.parse(localStorage.getItem("expo_pdf_leads") || "[]");
      const newLead = {
        ...formData,
        pdfUrl,
        documentTitle,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem("expo_pdf_leads", JSON.stringify([...existingLeads, newLead]));
    } catch {
      // LocalStorage fallback
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);

      // Trigger the PDF download / open in new window
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.download = pdfUrl.split("/").pop() || "event-document.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Automatically close modal after short delay
      setTimeout(() => {
        setIsOpen(false);
      }, 2500);
    }, 600);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.1 }}
            className="relative w-full max-w-lg bg-[#061A2A] border border-white/20 rounded-3xl p-6 sm:p-8 text-white shadow-2xl overflow-hidden font-sans z-10"
          >
            {/* Ambient Lighting Orbs */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#10B981]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#087EA4]/25 rounded-full blur-3xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
              aria-label="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Content */}
            {!isSuccess ? (
              <div className="space-y-6 relative z-10">
                {/* Header */}
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#10B981]/20 border border-[#10B981]/40 text-xs font-mono font-bold text-[#34D399] uppercase">
                    <FileText className="w-3.5 h-3.5" />
                    <span>OFFICIAL DOCUMENT ACCESS</span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Download Event Document
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
                    Please provide your details below to receive instant access and download the document.
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-3.5">
                  {/* Name */}
                  <div className="space-y-1">
                    <label className="block text-xs font-mono font-semibold text-slate-300 uppercase">
                      Full Name <span className="text-[#10B981]">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="e.g. Ramesh Shrestha"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/10 border text-sm text-white placeholder:text-slate-500 focus:outline-none transition-all ${
                          errors.name
                            ? "border-red-400 focus:border-red-400"
                            : "border-white/15 focus:border-[#10B981] focus:bg-white/15"
                        }`}
                      />
                    </div>
                    {errors.name && (
                      <p className="text-[11px] font-mono text-red-400">{errors.name}</p>
                    )}
                  </div>

                  {/* Company Name */}
                  <div className="space-y-1">
                    <label className="block text-xs font-mono font-semibold text-slate-300 uppercase">
                      Company / Organization Name <span className="text-[#10B981]">*</span>
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="e.g. Himalaya Hydropower Ltd."
                        value={formData.company}
                        onChange={(e) =>
                          setFormData({ ...formData, company: e.target.value })
                        }
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/10 border text-sm text-white placeholder:text-slate-500 focus:outline-none transition-all ${
                          errors.company
                            ? "border-red-400 focus:border-red-400"
                            : "border-white/15 focus:border-[#10B981] focus:bg-white/15"
                        }`}
                      />
                    </div>
                    {errors.company && (
                      <p className="text-[11px] font-mono text-red-400">
                        {errors.company}
                      </p>
                    )}
                  </div>

                  {/* Phone & Email Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Phone Number */}
                    <div className="space-y-1">
                      <label className="block text-xs font-mono font-semibold text-slate-300 uppercase">
                        Phone Number <span className="text-[#10B981]">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          placeholder="+977 98XXXXXXXX"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/10 border text-sm text-white placeholder:text-slate-500 focus:outline-none transition-all ${
                            errors.phone
                              ? "border-red-400 focus:border-red-400"
                              : "border-white/15 focus:border-[#10B981] focus:bg-white/15"
                          }`}
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-[11px] font-mono text-red-400">
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="space-y-1">
                      <label className="block text-xs font-mono font-semibold text-slate-300 uppercase">
                        Email Address <span className="text-[#10B981]">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          placeholder="name@company.com"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/10 border text-sm text-white placeholder:text-slate-500 focus:outline-none transition-all ${
                            errors.email
                              ? "border-red-400 focus:border-red-400"
                              : "border-white/15 focus:border-[#10B981] focus:bg-white/15"
                          }`}
                        />
                      </div>
                      {errors.email && (
                        <p className="text-[11px] font-mono text-red-400">
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-slate-950 font-mono text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg hover:scale-101 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <span>PROCESSING DOWNLOAD...</span>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          <span>DOWNLOAD PDF DOCUMENT</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-center gap-2 pt-1 text-[11px] font-mono text-slate-400 text-center">
                    <Lock className="w-3 h-3 text-[#10B981]" />
                    <span>Your privacy is protected. Official IPPAN secretariat records.</span>
                  </div>
                </form>
              </div>
            ) : (
              /* Success State */
              <div className="py-8 text-center space-y-4 relative z-10">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-[#10B981] text-[#34D399] flex items-center justify-center mx-auto shadow-lg">
                  <CheckCircle2 className="w-9 h-9 animate-bounce" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-2xl font-bold text-white">
                    Thank You, {formData.name}!
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 font-normal max-w-sm mx-auto">
                    Your details have been verified. Your PDF document download is starting now.
                  </p>
                </div>

                <div className="pt-2">
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#38BDF8] hover:underline"
                  >
                    <span>Click here if download doesn&apos;t start automatically ↗</span>
                  </a>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
