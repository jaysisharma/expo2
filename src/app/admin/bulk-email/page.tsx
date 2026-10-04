"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Mail,
  Send,
  Users,
  CheckCircle2,
  AlertCircle,
  Search,
  Upload,
  Eye,
  History,
  Sparkles,
  RefreshCw,
  Monitor,
  Smartphone,
  Check,
  X,
  FileSpreadsheet,
  Calendar,
  Building2,
  Ticket,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  FileText,
  UserCheck,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import { RecipientData } from "@/lib/resend";

interface CampaignLog {
  id: string;
  title: string;
  subject: string;
  templateType: string;
  totalRecipients: number;
  successful: number;
  failed: number;
  sentAt: string;
  sender: string;
}

export default function AdminBulkEmailPage() {
  // Navigation: Steps 1, 2, 3 or History
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [viewHistory, setViewHistory] = useState(false);

  // Attendees from Database
  const [allAttendees, setAllAttendees] = useState<RecipientData[]>([]);
  const [isLoadingAttendees, setIsLoadingAttendees] = useState(true);

  // Recipient Source: registered attendees vs custom list
  const [recipientSource, setRecipientSource] = useState<"database" | "custom">("database");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("All");

  // Custom List (Paste or CSV)
  const [customInputText, setCustomInputText] = useState("");
  const [customRecipients, setCustomRecipients] = useState<RecipientData[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Message & Template
  const [templateType, setTemplateType] = useState<
    "announcement" | "pass_reminder" | "exhibitor_brief" | "schedule_update" | "custom"
  >("announcement");
  const [subject, setSubject] = useState("Welcome to Himalayan Green Energy Expo 2027");
  const [headline, setHeadline] = useState("Official Expo Announcement");
  const [customMessage, setCustomMessage] = useState(
    "We are delighted to welcome you to the 5th edition of the Himalayan Green Energy Expo 2027.\n\nOver 150 leading clean energy companies, government delegates, and technology developers from across South Asia will convene at BHRIKUTIMANDAP · KATHMANDU, NEPAL from 17–19 January 2027."
  );
  const [showButton, setShowButton] = useState(true);
  const [buttonText, setButtonText] = useState("View Expo Schedule");
  const [buttonUrl, setButtonUrl] = useState("https://greenenergyexpo.org.np/conference");

  // Sender Info (Simple defaults)
  const [fromName, setFromName] = useState("Himalayan Green Energy Expo");
  const [fromEmail, setFromEmail] = useState("info@himalayanenergyexpo.com");
  const [replyTo, setReplyTo] = useState("info@himalayanenergyexpo.com");

  // Test Email
  const [testEmailAddress, setTestEmailAddress] = useState("eventsolutiones@gmail.com");
  const [isSendingTest, setIsSendingTest] = useState(false);

  // Send & Modal States
  const [isSendingBulk, setIsSendingBulk] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [sendResult, setSendResult] = useState<any>(null);

  // Preview Modal
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [previewSubject, setPreviewSubject] = useState<string>("");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  // Past Campaigns
  const [campaignHistory, setCampaignHistory] = useState<CampaignLog[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Notifications
  const [toast, setToast] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);

  const showToast = (type: "success" | "error" | "info", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Load attendees & config on mount
  useEffect(() => {
    async function loadData() {
      setIsLoadingAttendees(true);
      try {
        // Fetch attendees
        const res = await fetch(`/api/admin/data?t=${Date.now()}`, {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        });

        if (res.ok) {
          const json = await res.json();
          const registrations = json.data?.registrations || [];

          const mapped: RecipientData[] = registrations.map((r: any, idx: number) => ({
            id: r.id || `reg-${idx}`,
            name: r.fullName || r.name || "Delegate",
            email: (r.email || "").trim(),
            organization: r.organization || r.company || "Attendee",
            passId: r.badgeId || r.passId || r.id || `PASS-${idx + 100}`,
            stallNumber: r.stallNumber || r.stall || "",
            role: r.role || r.passType || "Visitor",
            passType: r.passType || r.role || "Trade Visitor",
            country: r.country || "Nepal",
          }));

          const validAttendees = mapped.filter((a) => a.email && a.email.includes("@"));
          setAllAttendees(validAttendees);
          // By default, select all registered attendees
          setSelectedIds(new Set(validAttendees.map((a) => a.id)));
        }

        // Fetch past campaigns
        const cfgRes = await fetch("/api/admin/bulk-email");
        if (cfgRes.ok) {
          const cfgData = await cfgRes.json();
          if (cfgData.campaigns) {
            setCampaignHistory(cfgData.campaigns);
          }
        }
      } catch (err) {
        console.error("Error loading attendee data:", err);
        showToast("error", "Could not load registered attendees.");
      } finally {
        setIsLoadingAttendees(false);
      }
    }

    loadData();
  }, []);

  // Filter attendees by search and role
  const availableRoles = useMemo(() => {
    const roles = new Set<string>();
    allAttendees.forEach((a) => {
      if (a.role) roles.add(a.role);
    });
    return ["All", ...Array.from(roles)];
  }, [allAttendees]);

  const filteredAttendees = useMemo(() => {
    return allAttendees.filter((a) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (a.name && a.name.toLowerCase().includes(q)) ||
        (a.email && a.email.toLowerCase().includes(q)) ||
        (a.organization && a.organization.toLowerCase().includes(q)) ||
        (a.passId && a.passId.toLowerCase().includes(q));

      const matchesRole = roleFilter === "All" || a.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [allAttendees, searchQuery, roleFilter]);

  // Final list of recipients depending on source
  const finalRecipients = useMemo(() => {
    if (recipientSource === "custom") {
      return customRecipients;
    }
    return allAttendees.filter((a) => selectedIds.has(a.id));
  }, [recipientSource, customRecipients, allAttendees, selectedIds]);

  // Selection handlers
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAllFiltered = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      filteredAttendees.forEach((a) => next.add(a.id));
      return next;
    });
  };

  const handleDeselectAllFiltered = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      filteredAttendees.forEach((a) => next.delete(a.id));
      return next;
    });
  };

  // Custom text / CSV parsing
  const handleParseCustomEmails = () => {
    if (!customInputText.trim()) return;

    const lines = customInputText.split(/\r?\n/);
    const parsed: RecipientData[] = [];

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      if (trimmed.includes(",")) {
        const parts = trimmed.split(",").map((p) => p.trim());
        let name = "Attendee";
        let email = "";
        let org = "Participant";

        if (parts[0].includes("@")) {
          email = parts[0];
          name = parts[1] || name;
          org = parts[2] || org;
        } else {
          name = parts[0] || name;
          email = parts[1] || "";
          org = parts[2] || org;
        }

        if (email.includes("@")) {
          parsed.push({
            id: `custom-${index}`,
            email,
            name,
            organization: org,
            passId: `GUEST-${index + 1}`,
          });
        }
      } else if (trimmed.includes("@")) {
        parsed.push({
          id: `custom-${index}`,
          email: trimmed,
          name: "Attendee",
          organization: "Participant",
          passId: `GUEST-${index + 1}`,
        });
      }
    });

    setCustomRecipients(parsed);
    showToast("success", `Found ${parsed.length} valid email address${parsed.length === 1 ? "" : "es"}.`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setCustomInputText(content);
        showToast("info", "File loaded. Click 'Read & Add Emails' to verify.");
      }
    };
    reader.readAsText(file);
  };

  // Preset templates with simple wording
  const handleSelectTemplate = (type: any) => {
    setTemplateType(type);
    if (type === "announcement") {
      setSubject("Welcome to Himalayan Green Energy Expo 2027");
      setHeadline("Official Expo Announcement");
      setCustomMessage(
        "We are delighted to welcome you to the 5th edition of the Himalayan Green Energy Expo 2027.\n\nOver 150 leading clean energy companies, government delegates, and technology developers from across South Asia will convene at BHRIKUTIMANDAP · KATHMANDU, NEPAL from 17–19 January 2027."
      );
      setShowButton(true);
      setButtonText("View Expo Schedule");
      setButtonUrl("https://greenenergyexpo.org.np/conference");
    } else if (type === "pass_reminder") {
      setSubject("Your Entry Pass for Himalayan Green Energy Expo 2027");
      setHeadline("Important: Bring Your QR Code Pass");
      setCustomMessage(
        "Please remember to keep your entry QR code handy on your phone when arriving at BHRIKUTIMANDAP · KATHMANDU, NEPAL.\n\nPresenting your QR pass at the entrance ensures immediate fast-track check-in and complimentary access across all 3 days."
      );
      setShowButton(true);
      setButtonText("Download My Pass");
      setButtonUrl("https://greenenergyexpo.org.np/verify");
    } else if (type === "exhibitor_brief") {
      setSubject("Exhibitor Setup Guide & Move-In Schedule");
      setHeadline("Exhibitor Setup & Hall Details");
      setCustomMessage(
        "Here are important move-in guidelines, setup timings, and power connection details for your assigned booth.\n\nHall move-in begins on 16 January 2027 at 10:00 AM. Please ensure your stall setup is complete before the official opening ceremony on 17 January."
      );
      setShowButton(true);
      setButtonText("View Exhibitor Guide");
      setButtonUrl("https://greenenergyexpo.org.np/floor-plan");
    } else if (type === "schedule_update") {
      setSubject("Conference Schedule & Keynote Speakers Announced");
      setHeadline("Conference Sessions & Timetable");
      setCustomMessage(
        "We are excited to share the official schedule for the Clean Energy Summit 2027, featuring expert panels on cross-border power trading, green financing, solar innovations, and hydropower technology."
      );
      setShowButton(true);
      setButtonText("See Full Schedule");
      setButtonUrl("https://greenenergyexpo.org.np/conference");
    } else {
      setSubject("Important Update: Himalayan Green Energy Expo");
      setHeadline("Special Notification");
      setCustomMessage("Type your message here. You can click '+ Name' below to personalize each email.");
      setShowButton(false);
    }
  };

  // Insert personalization tag
  const insertTag = (tag: string) => {
    setCustomMessage((prev) => `${prev} ${tag}`);
  };

  // Live preview
  const handleOpenPreview = async () => {
    setIsLoadingPreview(true);
    setShowPreviewModal(true);
    try {
      const sample = finalRecipients[0] || {
        name: "Bikash Sharma",
        email: "bikash@example.com",
        organization: "Clean Energy Nepal",
        passId: "HHE27-1001",
        stallNumber: "A12",
        role: "Visitor",
        passType: "Trade Visitor",
      };

      const res = await fetch("/api/admin/bulk-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "preview",
          payload: {
            templateType,
            subject,
            headline: headline || subject,
            customMessage,
            ctaText: showButton ? buttonText : "",
            ctaUrl: showButton ? buttonUrl : "",
            sampleRecipient: sample,
          },
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setPreviewHtml(json.preview.html);
        setPreviewSubject(json.preview.subject);
      } else {
        showToast("error", "Could not load preview.");
      }
    } catch {
      showToast("error", "Error creating preview.");
    } finally {
      setIsLoadingPreview(false);
    }
  };

  // Send single test email
  const handleSendTestEmail = async () => {
    if (!testEmailAddress || !testEmailAddress.includes("@")) {
      showToast("error", "Please enter a valid email address for the test.");
      return;
    }

    setIsSendingTest(true);
    try {
      const res = await fetch("/api/admin/bulk-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send_test",
          payload: {
            testEmail: testEmailAddress.trim(),
            subject,
            templateType,
            headline: headline || subject,
            customMessage,
            ctaText: showButton ? buttonText : "",
            ctaUrl: showButton ? buttonUrl : "",
            fromName,
            fromEmail,
            replyTo,
            sampleRecipient: finalRecipients[0] || {
              name: "Test Recipient",
              organization: "Himalayan Green Energy Expo",
              passId: "TEST-001",
            },
          },
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        showToast("success", `Test email sent to ${testEmailAddress}! Check your inbox.`);
      } else {
        showToast("error", json.message || "Failed to send test email.");
      }
    } catch {
      showToast("error", "Network error sending test email.");
    } finally {
      setIsSendingTest(false);
    }
  };

  // Send bulk emails
  const handleSendEmails = async () => {
    setShowConfirmModal(false);
    setIsSendingBulk(true);

    try {
      const res = await fetch("/api/admin/bulk-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send_bulk",
          payload: {
            recipients: finalRecipients,
            subject,
            templateType,
            headline: headline || subject,
            customMessage,
            ctaText: showButton ? buttonText : "",
            ctaUrl: showButton ? buttonUrl : "",
            fromName,
            fromEmail,
            replyTo,
            campaignTitle: subject,
          },
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setSendResult(json.result);
        showToast("success", "Emails sent successfully!");
        loadHistory();
      } else {
        showToast("error", json.message || "Failed to send emails.");
      }
    } catch {
      showToast("error", "Network error while sending emails.");
    } finally {
      setIsSendingBulk(false);
    }
  };

  // Load past emails history
  const loadHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const res = await fetch("/api/admin/bulk-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "get_history" }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.campaigns) {
          setCampaignHistory(json.campaigns);
        }
      }
    } catch {
      console.warn("Could not load history");
    } finally {
      setIsLoadingHistory(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16 font-sans">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold animate-in fade-in slide-in-from-top-3 duration-200 ${
            toast.type === "success"
              ? "bg-emerald-900 text-emerald-100 border-emerald-700"
              : toast.type === "error"
              ? "bg-rose-900 text-rose-100 border-rose-700"
              : "bg-slate-900 text-white border-slate-700"
          }`}
        >
          {toast.type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
          {toast.type === "error" && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
          {toast.type === "info" && <HelpCircle className="w-4 h-4 text-blue-400 shrink-0" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-white shadow-xs">
                  <Mail className="w-4 h-4" />
                </div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  Email Attendees
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Send announcements, pass reminders, and updates to expo participants.
              </p>
            </div>

            {/* Past Emails Toggle */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => {
                  setViewHistory(!viewHistory);
                  if (!viewHistory) loadHistory();
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                  viewHistory
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>{viewHistory ? "Back to Email Writer" : `Past Sent Emails (${campaignHistory.length})`}</span>
              </button>
            </div>
          </div>

          {/* Simple 3-Step Wizard Navigation */}
          {!viewHistory && (
            <div className="flex items-center border-t border-slate-100 py-3 gap-2 overflow-x-auto scrollbar-none text-xs">
              {/* Step 1 */}
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  currentStep === 1
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                    currentStep === 1 ? "bg-emerald-700 text-white" : "bg-slate-200 text-slate-600"
                  }`}
                >
                  1
                </span>
                <span>1. Select People</span>
                {finalRecipients.length > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    {finalRecipients.length}
                  </span>
                )}
              </button>

              <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />

              {/* Step 2 */}
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  currentStep === 2
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                    currentStep === 2 ? "bg-emerald-700 text-white" : "bg-slate-200 text-slate-600"
                  }`}
                >
                  2
                </span>
                <span>2. Write Message</span>
              </button>

              <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />

              {/* Step 3 */}
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  currentStep === 3
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                    currentStep === 3 ? "bg-emerald-700 text-white" : "bg-slate-200 text-slate-600"
                  }`}
                >
                  3
                </span>
                <span>3. Preview & Send</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        {/* ========================================================================= */}
        {/* VIEW: PAST SENT EMAILS                                                   */}
        {/* ========================================================================= */}
        {viewHistory ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Sent Email History</h2>
                <p className="text-xs text-slate-500">Record of emails sent to attendees.</p>
              </div>
              <button
                onClick={loadHistory}
                disabled={isLoadingHistory}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingHistory ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </button>
            </div>

            {campaignHistory.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-slate-200 shadow-xs">
                <Mail className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h3 className="text-sm font-semibold text-slate-800">No sent emails yet</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  When you send an announcement or update, its record will appear here.
                </p>
                <button
                  onClick={() => setViewHistory(false)}
                  className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs cursor-pointer"
                >
                  Write New Email
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Subject</th>
                      <th className="py-3 px-4">Recipients</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Sent Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {campaignHistory.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {item.title || item.subject}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold">{item.totalRecipients}</span> people
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                            <Check className="w-3 h-3 text-emerald-600" />
                            Sent ({item.successful})
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {new Date(item.sentAt).toLocaleString([], {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          /* ========================================================================= */
          /* WIZARD FLOW                                                               */
          /* ========================================================================= */
          <div className="space-y-6">
            {/* --------------------------------------------------------------------- */}
            {/* STEP 1: CHOOSE RECIPIENTS                                             */}
            {/* --------------------------------------------------------------------- */}
            {currentStep === 1 && (
              <div className="space-y-4">
                {/* Source Switcher Card */}
                <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">1. Who should receive this email?</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Choose from your registered attendees or paste a custom list of email addresses.
                    </p>
                  </div>

                  {/* Clean Tab Pills */}
                  <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setRecipientSource("database")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                        recipientSource === "database"
                          ? "bg-white text-emerald-800 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Registered Attendees ({allAttendees.length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRecipientSource("custom")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                        recipientSource === "custom"
                          ? "bg-white text-emerald-800 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Paste or Upload File</span>
                    </button>
                  </div>
                </div>

                {/* Sub-view A: Registered Attendees */}
                {recipientSource === "database" ? (
                  <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                    {/* Filter Bar */}
                    <div className="p-3 sm:p-4 border-b border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      {/* Search & Role Filter */}
                      <div className="flex flex-wrap items-center gap-2 flex-1">
                        <div className="relative w-full sm:w-64">
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            placeholder="Search name, email, or company..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-600"
                          />
                        </div>

                        {/* Quick Role Dropdown */}
                        <select
                          value={roleFilter}
                          onChange={(e) => setRoleFilter(e.target.value)}
                          className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-hidden focus:border-emerald-600"
                        >
                          {availableRoles.map((r) => (
                            <option key={r} value={r}>
                              Role: {r}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Quick Selection Actions */}
                      <div className="flex items-center justify-between sm:justify-end gap-2 text-xs">
                        <span className="text-slate-500 font-medium">
                          <strong className="text-emerald-700">{selectedIds.size}</strong> selected
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={handleSelectAllFiltered}
                            className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-100 cursor-pointer"
                          >
                            Select All
                          </button>
                          <button
                            type="button"
                            onClick={handleDeselectAllFiltered}
                            className="px-2.5 py-1 text-xs font-medium text-slate-500 bg-white border border-slate-200 rounded-md hover:bg-slate-100 cursor-pointer"
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Attendees List Table */}
                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 text-xs">
                      {isLoadingAttendees ? (
                        <div className="py-12 text-center text-slate-400">Loading attendee directory...</div>
                      ) : filteredAttendees.length === 0 ? (
                        <div className="py-12 text-center text-slate-400">No attendees match your search.</div>
                      ) : (
                        <table className="w-full text-left">
                          <thead className="bg-slate-50 text-slate-500 font-semibold sticky top-0 border-b border-slate-200">
                            <tr>
                              <th className="py-2.5 pl-4 pr-2 w-8">
                                <input
                                  type="checkbox"
                                  checked={
                                    filteredAttendees.length > 0 &&
                                    filteredAttendees.every((a) => selectedIds.has(a.id))
                                  }
                                  onChange={(e) => {
                                    if (e.target.checked) handleSelectAllFiltered();
                                    else handleDeselectAllFiltered();
                                  }}
                                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                />
                              </th>
                              <th className="py-2.5 px-3">Name</th>
                              <th className="py-2.5 px-3">Email</th>
                              <th className="py-2.5 px-3">Company / Org</th>
                              <th className="py-2.5 px-3">Role</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {filteredAttendees.map((att) => {
                              const isSelected = selectedIds.has(att.id);
                              return (
                                <tr
                                  key={att.id}
                                  onClick={() => handleToggleSelect(att.id)}
                                  className={`cursor-pointer transition-colors ${
                                    isSelected ? "bg-emerald-50/40 hover:bg-emerald-50/70" : "hover:bg-slate-50"
                                  }`}
                                >
                                  <td className="py-2.5 pl-4 pr-2" onClick={(e) => e.stopPropagation()}>
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => handleToggleSelect(att.id)}
                                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                    />
                                  </td>
                                  <td className="py-2.5 px-3 font-semibold text-slate-900">{att.name}</td>
                                  <td className="py-2.5 px-3 text-slate-600">{att.email}</td>
                                  <td className="py-2.5 px-3 text-slate-500">{att.organization || "—"}</td>
                                  <td className="py-2.5 px-3">
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 capitalize">
                                      {att.role || "Attendee"}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Sub-view B: Custom Paste / File */
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Paste Email Addresses</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Paste one email per line, or upload a CSV file with emails.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept=".csv,.txt"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Upload CSV or TXT File</span>
                      </button>
                    </div>

                    <textarea
                      rows={5}
                      value={customInputText}
                      onChange={(e) => setCustomInputText(e.target.value)}
                      placeholder="e.g.&#10;ramesh@example.com&#10;sarah.jenkins@cleanpower.org&#10;Dr. Bikash Sharma, bikash@nepalenergy.com"
                      className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-600"
                    />

                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={handleParseCustomEmails}
                        className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer"
                      >
                        Read & Add Emails ({customRecipients.length} Ready)
                      </button>
                    </div>
                  </div>
                )}

                {/* Bottom Step 1 Actions */}
                <div className="flex items-center justify-between pt-2">
                  <div className="text-xs text-slate-500 font-medium">
                    {finalRecipients.length === 0 ? (
                      <span className="text-amber-600 font-semibold">Please select at least 1 person to continue.</span>
                    ) : (
                      <span>
                        <strong className="text-slate-900">{finalRecipients.length}</strong> recipients ready.
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    disabled={finalRecipients.length === 0}
                    onClick={() => setCurrentStep(2)}
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    <span>Next: Write Message</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* --------------------------------------------------------------------- */}
            {/* STEP 2: WRITE MESSAGE                                                 */}
            {/* --------------------------------------------------------------------- */}
            {currentStep === 2 && (
              <div className="space-y-4">
                {/* Email Type Selection */}
                <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">2. What type of email are you sending?</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Pick a starter template or start from a blank message.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      {
                        id: "announcement",
                        title: "General Announcement",
                        desc: "Welcome message, expo news, updates",
                        icon: Sparkles,
                      },
                      {
                        id: "pass_reminder",
                        title: "Pass & Entry Reminder",
                        desc: "QR code badge and entry instructions",
                        icon: Ticket,
                      },
                      {
                        id: "schedule_update",
                        title: "Schedule & Speakers",
                        desc: "Conference sessions and timing updates",
                        icon: Calendar,
                      },
                      {
                        id: "exhibitor_brief",
                        title: "Exhibitor Setup Guide",
                        desc: "Stall move-in, power, and hall details",
                        icon: Building2,
                      },
                    ].map((tpl) => {
                      const Icon = tpl.icon;
                      const active = templateType === tpl.id;
                      return (
                        <button
                          key={tpl.id}
                          type="button"
                          onClick={() => handleSelectTemplate(tpl.id)}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                            active
                              ? "border-emerald-600 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-600"
                              : "border-slate-200 bg-white hover:border-slate-300"
                          }`}
                        >
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center mb-1.5 ${
                              active ? "bg-emerald-700 text-white" : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="text-xs font-bold text-slate-900">{tpl.title}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">{tpl.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Email Form */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h3 className="text-sm font-bold text-slate-900">Email Details</h3>
                    <button
                      type="button"
                      onClick={handleOpenPreview}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg cursor-pointer transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview How It Looks</span>
                    </button>
                  </div>

                  {/* Subject Line */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Subject Line <span className="text-slate-400 font-normal">(what attendees see in their inbox)</span>
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. Welcome to Himalayan Green Energy Expo 2027"
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-600 font-medium"
                    />
                  </div>

                  {/* Message Body */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-700">
                        Message Content
                      </label>
                      {/* Personalization tag buttons */}
                      <div className="flex items-center gap-1 text-[11px]">
                        <span className="text-slate-400 mr-1">Insert:</span>
                        <button
                          type="button"
                          onClick={() => insertTag("{{name}}")}
                          className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium cursor-pointer"
                          title="Inserts attendee's full name"
                        >
                          + Name
                        </button>
                        <button
                          type="button"
                          onClick={() => insertTag("{{organization}}")}
                          className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium cursor-pointer"
                          title="Inserts attendee's company name"
                        >
                          + Company
                        </button>
                        <button
                          type="button"
                          onClick={() => insertTag("{{passId}}")}
                          className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium cursor-pointer"
                          title="Inserts attendee's badge ID"
                        >
                          + Pass ID
                        </button>
                      </div>
                    </div>
                    <textarea
                      rows={7}
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-600 leading-relaxed font-sans"
                    />
                  </div>

                  {/* Optional Button inside email */}
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={showButton}
                        onChange={(e) => setShowButton(e.target.checked)}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-xs font-semibold text-slate-700">
                        Include a button in the email (e.g. Schedule, Download Pass)
                      </span>
                    </label>

                    {showButton && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <div>
                          <label className="block text-[11px] font-medium text-slate-600 mb-1">
                            Button Text
                          </label>
                          <input
                            type="text"
                            value={buttonText}
                            onChange={(e) => setButtonText(e.target.value)}
                            placeholder="e.g. View Expo Schedule"
                            className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-600"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-slate-600 mb-1">
                            Button Link URL
                          </label>
                          <input
                            type="text"
                            value={buttonUrl}
                            onChange={(e) => setButtonUrl(e.target.value)}
                            placeholder="https://greenenergyexpo.org.np/..."
                            className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-600"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Step 2 Actions */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Recipients</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    <span>Next: Review & Send</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* --------------------------------------------------------------------- */}
            {/* STEP 3: REVIEW & SEND                                                 */}
            {/* --------------------------------------------------------------------- */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
                  <h2 className="text-base font-bold text-slate-900">3. Review and Send</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Double-check your email details, send a test email to your inbox, and send to all attendees.
                  </p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Card 1: Recipients */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-semibold text-[11px] uppercase tracking-wider text-slate-400">Recipients</span>
                      <button
                        onClick={() => setCurrentStep(1)}
                        className="text-emerald-700 font-semibold hover:underline cursor-pointer"
                      >
                        Change
                      </button>
                    </div>
                    <div className="text-2xl font-bold text-slate-900">{finalRecipients.length} people</div>
                    <div className="text-xs text-slate-500">
                      {recipientSource === "database" ? "Registered Attendees" : "Custom Email List"}
                    </div>
                  </div>

                  {/* Card 2: Subject */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-semibold text-[11px] uppercase tracking-wider text-slate-400">Subject</span>
                      <button
                        onClick={() => setCurrentStep(2)}
                        className="text-emerald-700 font-semibold hover:underline cursor-pointer"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="text-sm font-bold text-slate-900 truncate">{subject}</div>
                    <button
                      type="button"
                      onClick={handleOpenPreview}
                      className="text-xs text-emerald-700 font-semibold hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Email Preview</span>
                    </button>
                  </div>

                  {/* Card 3: Sender */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
                    <span className="font-semibold text-[11px] uppercase tracking-wider text-slate-400 block">Sender Address</span>
                    <div className="text-sm font-bold text-slate-900">{fromName}</div>
                    <div className="text-xs text-slate-500 font-mono">{fromEmail}</div>
                  </div>
                </div>

                {/* Send Test Email Card */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Send a Test Email First</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Send a sample copy to yourself to verify the layout in your own inbox before sending to all attendees.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-md">
                    <input
                      type="email"
                      value={testEmailAddress}
                      onChange={(e) => setTestEmailAddress(e.target.value)}
                      placeholder="Your email address"
                      className="text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex-1 focus:outline-hidden focus:border-emerald-600 font-mono"
                    />
                    <button
                      type="button"
                      disabled={isSendingTest}
                      onClick={handleSendTestEmail}
                      className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isSendingTest ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5 text-emerald-700" />
                      )}
                      <span>Send Test</span>
                    </button>
                  </div>
                </div>

                {/* Final Action Bar */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Edit</span>
                  </button>

                  <button
                    type="button"
                    disabled={finalRecipients.length === 0 || isSendingBulk}
                    onClick={() => setShowConfirmModal(true)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send to {finalRecipients.length} Attendees</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* MODAL: LIVE PREVIEW                                                       */}
      {/* ========================================================================= */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-700" />
                <h3 className="text-sm font-bold text-slate-900">Email Preview</h3>
              </div>

              <div className="flex items-center gap-3">
                {/* Desktop / Mobile Switch */}
                <div className="flex items-center bg-slate-200/80 p-0.5 rounded-lg text-xs">
                  <button
                    onClick={() => setPreviewDevice("desktop")}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold cursor-pointer ${
                      previewDevice === "desktop" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span>Computer</span>
                  </button>
                  <button
                    onClick={() => setPreviewDevice("mobile")}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold cursor-pointer ${
                      previewDevice === "mobile" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Phone</span>
                  </button>
                </div>

                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body iframe container */}
            <div className="flex-1 bg-slate-100 p-4 sm:p-6 flex items-center justify-center overflow-auto">
              {isLoadingPreview ? (
                <div className="flex flex-col items-center gap-2 text-xs text-slate-500">
                  <RefreshCw className="w-6 h-6 animate-spin text-emerald-700" />
                  <span>Loading preview...</span>
                </div>
              ) : (
                <div
                  className={`bg-white rounded-xl shadow-md border border-slate-200 transition-all duration-300 h-full overflow-hidden ${
                    previewDevice === "mobile" ? "w-[390px]" : "w-full max-w-2xl"
                  }`}
                >
                  <iframe
                    title="Email Preview"
                    srcDoc={previewHtml}
                    className="w-full h-full border-0"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SIMPLE CONFIRMATION                                                */}
      {/* ========================================================================= */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-5 sm:p-6 border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Send Email Now?</h3>
                <p className="text-xs text-slate-500">
                  You are about to email {finalRecipients.length} attendees.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl space-y-1.5 text-xs text-slate-700 border border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-500">Total Recipients:</span>
                <strong className="text-emerald-800 font-bold">{finalRecipients.length} people</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Subject:</span>
                <span className="font-semibold text-slate-900 truncate max-w-[200px]">{subject}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Sender:</span>
                <span className="font-mono text-[11px] text-slate-700">{fromEmail}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Go Back
              </button>
              <button
                type="button"
                disabled={isSendingBulk}
                onClick={handleSendEmails}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isSendingBulk ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Yes, Send Emails</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SUCCESS / RESULTS                                                 */}
      {/* ========================================================================= */}
      {sendResult && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">Emails Sent Successfully!</h3>
              <p className="text-xs text-slate-500 mt-1">
                Your announcement was delivered to {sendResult.successful || finalRecipients.length} attendees.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 text-center">
                <span className="text-emerald-700 block font-medium">Delivered</span>
                <span className="text-lg font-bold text-emerald-900">{sendResult.successful || 0}</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-center">
                <span className="text-slate-500 block font-medium">Failed</span>
                <span className="text-lg font-bold text-slate-700">{sendResult.failed || 0}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setSendResult(null);
                  setCurrentStep(1);
                }}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
