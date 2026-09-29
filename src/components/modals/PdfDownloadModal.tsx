"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Download,
  User,
  Building2,
  Phone,
  Mail,
  CheckCircle2,
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
  const [pdfUrl, setPdfUrl] = useState<string>("/Proposal.pdf");
  const [documentTitle, setDocumentTitle] = useState<string>(
    "Himalayan Green Energy Expo Proposal (PDF)"
  );

  const [formData, setFormData] = useState({
    name: "",
    company: "",
    phone: "",
    email: "",
  });

  const [submittedName, setSubmittedName] = useState<string>("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const handleOpenModal = (event: Event) => {
      const customEvent = event as CustomEvent<PdfModalEventDetail>;
      if (customEvent.detail) {
        setPdfUrl(customEvent.detail.pdfUrl || "/Proposal.pdf");
        setDocumentTitle(
          customEvent.detail.title || "Himalayan Green Energy Expo Proposal (PDF)"
        );
      }
      setIsSuccess(false);
      setErrors({});
      setFormData({
        name: "",
        company: "",
        phone: "",
        email: "",
      });
      setIsOpen(true);
    };

    window.addEventListener("open-pdf-download-modal", handleOpenModal);

    // Global interceptor for all .pdf links on the page (excluding links inside the modal or marked no-intercept)
    const handleDocumentClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;
      if (target.closest("[data-pdf-modal]")) return;
      if (target.getAttribute("data-no-intercept") === "true") return;

      const href = target.getAttribute("href");
      if (href && href.toLowerCase().endsWith(".pdf")) {
        const linkText = target.innerText?.trim() || "Official Event Document (PDF)";
        e.preventDefault();
        e.stopPropagation();
        triggerPdfDownloadModal(href, linkText);
      }
    };

    document.addEventListener("click", handleDocumentClick, true);

    return () => {
      window.removeEventListener("open-pdf-download-modal", handleOpenModal);
      document.removeEventListener("click", handleDocumentClick, true);
    };
  }, []);

  const getDownloadMetadata = (url: string) => {
    const lower = url.toLowerCase();
    if (lower.includes("booking") || lower.includes("form")) {
      return {
        downloadUrl: "/files/booking-form.pdf",
        filename: "Himalayan-Expo-Stall-Booking-Form.pdf",
      };
    }
    if (lower.includes("sponsor")) {
      return {
        downloadUrl: "/files/sponsors-sheet.pdf",
        filename: "Himalayan-Expo-Sponsorship-Rates-Sheet.pdf",
      };
    }
    return {
      downloadUrl: "/files/Proposal.pdf",
      filename: "Himalayan-Green-Energy-Expo-Proposal.pdf",
    };
  };

  const downloadPdfFile = (url: string) => {
    const { downloadUrl, filename } = getDownloadMetadata(url);

    // 1. Direct anchor download with HTML5 download attribute
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename;
    link.setAttribute("data-no-intercept", "true");
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();

    // 2. Hidden iframe fallback to guarantee download trigger across all browsers
    try {
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = downloadUrl;
      document.body.appendChild(iframe);
      setTimeout(() => {
        if (document.body.contains(iframe)) document.body.removeChild(iframe);
      }, 5000);
    } catch {
      // ignore
    }

    setTimeout(() => {
      if (document.body.contains(link)) document.body.removeChild(link);
    }, 1500);
  };

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

    // 1. Trigger the download immediately within the trusted user event!
    downloadPdfFile(pdfUrl);

    // 2. Save lead locally
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

    // 3. Retain name for confirmation and clear text fields
    setSubmittedName(formData.name.trim());
    setFormData({
      name: "",
      company: "",
      phone: "",
      email: "",
    });
    setErrors({});

    // 4. Immediately transition to success confirmation
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  const handleClose = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setIsOpen(false);
    setIsSuccess(false);
    setIsSubmitting(false);
    setErrors({});
    setFormData({
      name: "",
      company: "",
      phone: "",
      email: "",
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.1 }}
            data-pdf-modal="true"
            className="relative w-full max-w-lg bg-[#061A2A] border border-white/20 rounded-3xl p-6 sm:p-8 text-white shadow-2xl overflow-hidden font-sans z-10"
          >
            {/* Close Button - elevated z-index (z-50) so it is always above all content */}
            <button
              type="button"
              onClick={handleClose}
              className="absolute top-5 right-5 z-50 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all cursor-pointer shadow-md active:scale-95"
              aria-label="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Content */}
            {!isSuccess ? (
              <div className="space-y-6 relative z-10">
                {/* Header */}
                <div className="space-y-1.5">
                  <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    Download PDF
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
                    Enter your details below to download the official expo document.
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
                      className="w-full py-3.5 px-6 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg active:scale-98 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <span>Downloading...</span>
                      ) : (
                        <>
                          <Download className="w-4 h-4 text-slate-900" />
                          <span>Download PDF</span>
                          <ArrowRight className="w-4 h-4 text-slate-900" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* Success State */
              <div className="py-6 text-center space-y-4 relative z-10" data-pdf-modal="true">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-[#10B981] text-[#34D399] flex items-center justify-center mx-auto shadow-lg">
                  <CheckCircle2 className="w-9 h-9" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl sm:text-2xl font-bold text-white">
                    Thank you{submittedName ? `, ${submittedName}` : ""}!
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 font-normal max-w-sm mx-auto">
                    Your PDF is downloading. If it didn&apos;t start, click below.
                  </p>
                </div>

                <div className="pt-2 flex flex-col items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => downloadPdfFile(pdfUrl)}
                    className="w-full py-3 px-6 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-98 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-slate-900" />
                    <span>Download Again</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleClose}
                    className="w-full py-2.5 px-6 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white font-semibold text-xs uppercase tracking-wider transition-all cursor-pointer border border-white/10"
                  >
                    Close Window
                  </button>

                  <a
                    href={getDownloadMetadata(pdfUrl).downloadUrl}
                    download={getDownloadMetadata(pdfUrl).filename}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-no-intercept="true"
                    className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 font-mono underline cursor-pointer pt-1"
                  >
                    <span>Open in new tab ↗</span>
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
