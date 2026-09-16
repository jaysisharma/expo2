"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Upload,
  Save,
  CheckCircle2,
  QrCode,
  Sliders,
  Move,
  Type,
  Image as ImageIcon,
  RotateCcw,
  Eye,
  Layers,
  X,
  Building,
  User,
  Hash,
  Palette,
  Sparkles,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { generateQRCodeMatrix } from "@/lib/qrCodeGenerator";

export interface CustomTextElement {
  id: string;
  text: string;
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  fontSize: number; // px
  textColor: string; // hex
  bgColor?: string; // hex or transparent
  borderRadius?: number; // px (0, 6, 9999)
  widthPct?: number; // 0 for auto, or 20-100
}

export interface RoleBannerConfig {
  show: boolean;
  text: string; // e.g. "TRADE VISITOR" or "VISITOR" or "OFFICIAL EXHIBITOR"
  x: number; // percentage (0-100), default 50%
  y: number; // percentage (0-100), default 92% (at the bottom)
  fontSize: number; // e.g. 12px
  textColor: string; // e.g. "#FFFFFF"
  bgColor: string; // e.g. "#087EA4"
  borderRadius: number; // 6 for rounded, 9999 for pill, 0 for rectangle
  styleMode?: "rounded" | "pill" | "square" | "full-width";
  widthPct?: number; // percentage width (20-100%), default 85%
  paddingY?: number; // vertical padding (4-16px)
  letterSpacing?: number;
}

export interface BadgeConfig {
  role: string;
  badgeTitle: string;
  themeColor: string;
  bgGradient: string;
  bgImage: string;
  qrPlacement: {
    x: number; // percentage (0-100)
    y: number; // percentage (0-100)
    size: number; // px
  };
  namePlacement: {
    x: number;
    y: number;
    fontSize: number;
    color: string;
  };
  orgPlacement: {
    x: number;
    y: number;
    fontSize: number;
    color: string;
  };
  designationPlacement?: {
    x: number;
    y: number;
    fontSize: number;
    color: string;
  };
  stallPlacement?: {
    x: number;
    y: number;
    fontSize: number;
    color: string;
  };
  idPlacement: {
    x: number;
    y: number;
    fontSize: number;
    color: string;
  };
  roleBannerPlacement?: RoleBannerConfig;
  customTexts?: CustomTextElement[];
}

interface AdminBadgeDesignerProps {
  onClose?: () => void;
  onSaved?: (templates: { visitor: BadgeConfig; exhibitor: BadgeConfig }) => void;
}

type DraggableBadgeElement = "qr" | "name" | "org" | "designation" | "stall" | "id" | "banner" | string;

export default function AdminBadgeDesigner({ onClose, onSaved }: AdminBadgeDesignerProps) {
  const [activeRole, setActiveRole] = useState<"visitor" | "exhibitor">("visitor");
  const [selectedElement, setSelectedElement] = useState<DraggableBadgeElement>("banner");
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const [templates, setTemplates] = useState<{ visitor: BadgeConfig; exhibitor: BadgeConfig }>({
    visitor: {
      role: "VISITOR",
      badgeTitle: "TRADE VISITOR",
      themeColor: "#087EA4",
      bgGradient: "linear-gradient(180deg, #FFFFFF 0%, #F0F9FF 100%)",
      bgImage: "",
      qrPlacement: { x: 50, y: 70, size: 96 },
      namePlacement: { x: 50, y: 38, fontSize: 20, color: "#061A2A" },
      orgPlacement: { x: 50, y: 46, fontSize: 13, color: "#087EA4" },
      designationPlacement: { x: 50, y: 53, fontSize: 11, color: "#64748B" },
      idPlacement: { x: 50, y: 83, fontSize: 11, color: "#061A2A" },
      roleBannerPlacement: {
        show: true,
        text: "TRADE VISITOR",
        x: 50,
        y: 92,
        fontSize: 12,
        textColor: "#FFFFFF",
        bgColor: "#087EA4",
        borderRadius: 6,
        styleMode: "rounded",
        widthPct: 85,
        paddingY: 7,
      },
      customTexts: [],
    },
    exhibitor: {
      role: "EXHIBITOR",
      badgeTitle: "OFFICIAL EXHIBITOR",
      themeColor: "#19A974",
      bgGradient: "linear-gradient(180deg, #FFFFFF 0%, #F0FDF4 100%)",
      bgImage: "",
      qrPlacement: { x: 50, y: 70, size: 96 },
      namePlacement: { x: 50, y: 38, fontSize: 20, color: "#061A2A" },
      orgPlacement: { x: 50, y: 46, fontSize: 14, color: "#19A974" },
      stallPlacement: { x: 50, y: 53, fontSize: 12, color: "#061A2A" },
      idPlacement: { x: 50, y: 83, fontSize: 11, color: "#061A2A" },
      roleBannerPlacement: {
        show: true,
        text: "OFFICIAL EXHIBITOR",
        x: 50,
        y: 92,
        fontSize: 12,
        textColor: "#FFFFFF",
        bgColor: "#19A974",
        borderRadius: 6,
        styleMode: "rounded",
        widthPct: 85,
        paddingY: 7,
      },
      customTexts: [],
    },
  });

  const [isSaving, setIsSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);

  // Load from LocalStorage & API on mount
  useEffect(() => {
    try {
      const local = localStorage.getItem("hhe_badge_templates");
      if (local) {
        const parsed = JSON.parse(local);
        if (parsed.visitor && parsed.exhibitor) {
          setTemplates(parsed);
        }
      }
    } catch (e) {}

    async function loadTemplates() {
      try {
        const res = await fetch(`/api/badge-template?t=${Date.now()}`, { cache: "no-store" });
        const json = await res.json();
        if (json.success && json.data) {
          setTemplates(json.data);
          try {
            localStorage.setItem("hhe_badge_templates", JSON.stringify(json.data));
          } catch (e) {}
        }
      } catch (err) {
        console.warn("Using default badge templates", err);
      }
    }
    loadTemplates();
  }, []);

  const notify = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const currentConfig = templates[activeRole];

  const updateCurrentConfig = (
    updates: Partial<BadgeConfig> | ((prevConfig: BadgeConfig) => Partial<BadgeConfig>)
  ) => {
    setTemplates((prev) => {
      const currentRoleConfig = prev[activeRole];
      const newValues = typeof updates === "function" ? updates(currentRoleConfig) : updates;
      const updatedRoleConfig = {
        ...currentRoleConfig,
        ...newValues,
      };
      const updated = {
        ...prev,
        [activeRole]: updatedRoleConfig,
      };
      try {
        localStorage.setItem("hhe_badge_templates", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  // --------------------------------------------------------------------------
  // PRECISION 1px / 1% NUDGE FUNCTION & KEYBOARD ARROW CONTROLS
  // --------------------------------------------------------------------------
  const nudgeSelectedElement = useCallback((dx: number, dy: number) => {
    if (!selectedElement) return;

    updateCurrentConfig((cfg) => {
      if (selectedElement === "qr") {
        return {
          qrPlacement: {
            ...cfg.qrPlacement,
            x: Math.max(5, Math.min(95, cfg.qrPlacement.x + dx)),
            y: Math.max(5, Math.min(95, cfg.qrPlacement.y + dy)),
          },
        };
      }
      if (selectedElement === "name") {
        return {
          namePlacement: {
            ...cfg.namePlacement,
            x: Math.max(5, Math.min(95, cfg.namePlacement.x + dx)),
            y: Math.max(5, Math.min(95, cfg.namePlacement.y + dy)),
          },
        };
      }
      if (selectedElement === "org") {
        return {
          orgPlacement: {
            ...cfg.orgPlacement,
            x: Math.max(5, Math.min(95, cfg.orgPlacement.x + dx)),
            y: Math.max(5, Math.min(95, cfg.orgPlacement.y + dy)),
          },
        };
      }
      if (selectedElement === "designation" && cfg.designationPlacement) {
        return {
          designationPlacement: {
            ...cfg.designationPlacement,
            x: Math.max(5, Math.min(95, cfg.designationPlacement.x + dx)),
            y: Math.max(5, Math.min(95, cfg.designationPlacement.y + dy)),
          },
        };
      }
      if (selectedElement === "stall" && cfg.stallPlacement) {
        return {
          stallPlacement: {
            ...cfg.stallPlacement,
            x: Math.max(5, Math.min(95, cfg.stallPlacement.x + dx)),
            y: Math.max(5, Math.min(95, cfg.stallPlacement.y + dy)),
          },
        };
      }
      if (selectedElement === "id") {
        return {
          idPlacement: {
            ...cfg.idPlacement,
            x: Math.max(5, Math.min(95, cfg.idPlacement.x + dx)),
            y: Math.max(5, Math.min(95, cfg.idPlacement.y + dy)),
          },
        };
      }
      if (selectedElement === "banner") {
        const cur = cfg.roleBannerPlacement || {
          show: true,
          text: activeRole === "visitor" ? "TRADE VISITOR" : "OFFICIAL EXHIBITOR",
          x: 50,
          y: 92,
          fontSize: 12,
          textColor: "#FFFFFF",
          bgColor: activeRole === "visitor" ? "#087EA4" : "#19A974",
          borderRadius: 6,
          styleMode: "rounded",
          widthPct: 85,
          paddingY: 7,
        };
        return {
          roleBannerPlacement: {
            ...cur,
            x: Math.max(5, Math.min(95, cur.x + dx)),
            y: Math.max(5, Math.min(95, cur.y + dy)),
          },
        };
      }
      if (selectedElement.startsWith("custom_")) {
        const list = (cfg.customTexts || []).map((ct) => {
          if (ct.id === selectedElement) {
            return {
              ...ct,
              x: Math.max(5, Math.min(95, ct.x + dx)),
              y: Math.max(5, Math.min(95, ct.y + dy)),
            };
          }
          return ct;
        });
        return { customTexts: list };
      }
      return {};
    });
  }, [selectedElement, activeRole]);

  // Keyboard Arrow Listeners (1px / 1% step, or 5px with Shift)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (!selectedElement) return;

      const step = e.shiftKey ? 5 : 1;
      let dx = 0;
      let dy = 0;

      if (e.key === "ArrowUp") dy = -step;
      else if (e.key === "ArrowDown") dy = step;
      else if (e.key === "ArrowLeft") dx = -step;
      else if (e.key === "ArrowRight") dx = step;
      else return;

      e.preventDefault();
      nudgeSelectedElement(dx, dy);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedElement, nudgeSelectedElement]);

  // --------------------------------------------------------------------------
  // DIRECT MOUSE DRAGGING ON CARD PREVIEW (Smooth percentage tracking)
  // --------------------------------------------------------------------------
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDragging || !cardRef.current || !selectedElement) return;

      const rect = cardRef.current.getBoundingClientRect();
      let pctX = Math.round(((e.clientX - rect.left) / rect.width) * 100);
      let pctY = Math.round(((e.clientY - rect.top) / rect.height) * 100);

      pctX = Math.max(5, Math.min(95, pctX));
      pctY = Math.max(5, Math.min(95, pctY));

      if (selectedElement === "qr") {
        updateCurrentConfig((cfg) => ({
          qrPlacement: { ...cfg.qrPlacement, x: pctX, y: pctY },
        }));
      } else if (selectedElement === "name") {
        updateCurrentConfig((cfg) => ({
          namePlacement: { ...cfg.namePlacement, x: pctX, y: pctY },
        }));
      } else if (selectedElement === "org") {
        updateCurrentConfig((cfg) => ({
          orgPlacement: { ...cfg.orgPlacement, x: pctX, y: pctY },
        }));
      } else if (selectedElement === "designation") {
        updateCurrentConfig((cfg) => ({
          designationPlacement: cfg.designationPlacement
            ? { ...cfg.designationPlacement, x: pctX, y: pctY }
            : { x: pctX, y: pctY, fontSize: 11, color: "#64748B" },
        }));
      } else if (selectedElement === "stall") {
        updateCurrentConfig((cfg) => ({
          stallPlacement: cfg.stallPlacement
            ? { ...cfg.stallPlacement, x: pctX, y: pctY }
            : { x: pctX, y: pctY, fontSize: 12, color: "#061A2A" },
        }));
      } else if (selectedElement === "id") {
        updateCurrentConfig((cfg) => ({
          idPlacement: { ...cfg.idPlacement, x: pctX, y: pctY },
        }));
      } else if (selectedElement === "banner") {
        updateCurrentConfig((cfg) => ({
          roleBannerPlacement: cfg.roleBannerPlacement
            ? { ...cfg.roleBannerPlacement, x: pctX, y: pctY }
            : {
                show: true,
                text: activeRole === "visitor" ? "TRADE VISITOR" : "OFFICIAL EXHIBITOR",
                x: pctX,
                y: pctY,
                fontSize: 12,
                textColor: "#FFFFFF",
                bgColor: activeRole === "visitor" ? "#087EA4" : "#19A974",
                borderRadius: 6,
                styleMode: "rounded",
                widthPct: 85,
                paddingY: 7,
              },
        }));
      } else if (selectedElement.startsWith("custom_")) {
        updateCurrentConfig((cfg) => ({
          customTexts: (cfg.customTexts || []).map((ct) =>
            ct.id === selectedElement ? { ...ct, x: pctX, y: pctY } : ct
          ),
        }));
      }
    };

    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleGlobalMouseMove);
      window.addEventListener("mouseup", handleGlobalMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [isDragging, selectedElement, activeRole]);

  // Upload Custom Badge Image
  const handleUploadBgImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === "string") {
        updateCurrentConfig({ bgImage: event.target.result });
        notify(`Uploaded custom ${activeRole} badge artwork`);
      }
    };
    reader.readAsDataURL(file);
  };

  // Add Custom Text Field
  const handleAddCustomText = () => {
    const newId = `custom_${Date.now()}`;
    const newTextElement: CustomTextElement = {
      id: newId,
      text: "CUSTOM TEXT",
      x: 50,
      y: 60,
      fontSize: 12,
      textColor: "#061A2A",
      bgColor: "#FFFFFF",
      borderRadius: 4,
      widthPct: 0, // Auto
    };

    updateCurrentConfig((cfg) => ({
      customTexts: [...(cfg.customTexts || []), newTextElement],
    }));
    setSelectedElement(newId);
    notify("Added new custom text field");
  };

  // Delete Custom Text Field
  const handleDeleteCustomText = (id: string) => {
    updateCurrentConfig((cfg) => ({
      customTexts: (cfg.customTexts || []).filter((ct) => ct.id !== id),
    }));
    setSelectedElement("banner");
    notify("Deleted custom text field");
  };

  // Save Badge Templates
  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      try {
        localStorage.setItem("hhe_badge_templates", JSON.stringify(templates));
      } catch (e) {}

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("hhe_badge_templates_updated", { detail: templates }));
      }

      const res = await fetch("/api/badge-template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(templates),
      });
      const data = await res.json();

      if (data.success) {
        notify("Badge template & placements saved successfully");
        if (onSaved) onSaved(templates);
      } else {
        notify("Saved to local browser storage");
        if (onSaved) onSaved(templates);
      }
    } catch (err) {
      notify("Saved to local browser storage");
      if (onSaved) onSaved(templates);
    } finally {
      setIsSaving(false);
    }
  };

  // Sample attendee preview data
  const sampleAttendee = {
    name: activeRole === "visitor" ? "Er. Aarav Sharma" : "Rajesh Khadka",
    org: activeRole === "visitor" ? "Sanima Hydropower Ltd." : "Voith Hydro International",
    designation: activeRole === "visitor" ? "Senior Project Engineer" : "Head of Hydro Turbines",
    stall: "STALL C-14",
    id: activeRole === "visitor" ? "HHE26-849201" : "HHE26-EX-104",
    country: "Nepal",
  };

  const qrMatrix = generateQRCodeMatrix(`https://greenenergyexpo.org.np/verify?id=${sampleAttendee.id}`);
  const qrCellCount = qrMatrix.length;

  const activeCustomText = currentConfig.customTexts?.find((ct) => ct.id === selectedElement);

  return (
    <div className="w-full bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 text-slate-900 shadow-xs space-y-6 select-none font-sans">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 px-4 py-2 rounded-xl bg-white border border-emerald-200 text-emerald-800 text-xs font-semibold shadow-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#234679] border border-blue-200 text-[10px] font-mono font-bold tracking-wider uppercase">
              Admin Studio
            </span>
            <h3 className="font-bold text-lg text-slate-900 font-display">ID Card Drag & Drop Layout Studio</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Drag any item on the badge, or use <strong className="text-[#218A59]">Arrow Keys (↑ ↓ ← →)</strong> for exact 1px precision movement.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleAddCustomText}
            className="px-3.5 py-2 rounded-xl bg-[#234679] hover:bg-[#1a3459] text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Text Field</span>
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 rounded-xl bg-[#218A59] hover:bg-[#1b734a] text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Save className={`w-3.5 h-3.5 ${isSaving ? "animate-spin" : ""}`} />
            <span>{isSaving ? "Saving..." : "Save Template"}</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Role Switcher */}
      <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-100 border border-slate-200 w-fit">
        <button
          onClick={() => {
            setActiveRole("visitor");
            setSelectedElement("banner");
          }}
          className={`px-4 py-2 rounded-lg font-semibold text-xs transition-all flex items-center gap-2 cursor-pointer ${
            activeRole === "visitor"
              ? "bg-white text-slate-900 shadow-xs border border-slate-200"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          🎟️ Trade Visitor Badge
        </button>
        <button
          onClick={() => {
            setActiveRole("exhibitor");
            setSelectedElement("banner");
          }}
          className={`px-4 py-2 rounded-lg font-semibold text-xs transition-all flex items-center gap-2 cursor-pointer ${
            activeRole === "exhibitor"
              ? "bg-white text-slate-900 shadow-xs border border-slate-200"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          🏢 Exhibitor Badge
        </button>
      </div>

      {/* Main Designer Grid: Layers & Property Controls Left + Interactive ID Card Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT CONTROLS & ITEM SELECTOR */}
        <div className="lg:col-span-5 space-y-5 bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs">
          {/* Item Layers Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#234679]" />
                <span>Select Item to Customize & Drag</span>
              </label>
              <button
                onClick={handleAddCustomText}
                className="text-[10px] text-[#234679] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add Text</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: "banner", label: "Role Banner Box", icon: Palette },
                { id: "qr", label: "QR Code Box", icon: QrCode },
                { id: "name", label: "Attendee Name", icon: User },
                { id: "org", label: "Organization", icon: Building },
                ...(activeRole === "visitor"
                  ? [{ id: "designation", label: "Designation", icon: Type }]
                  : [{ id: "stall", label: "Stall Number", icon: Hash }]),
                { id: "id", label: "Registration ID", icon: Sliders },
                ...(currentConfig.customTexts || []).map((ct, idx) => ({
                  id: ct.id,
                  label: ct.text || `Custom Text #${idx + 1}`,
                  icon: Type,
                })),
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = selectedElement === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedElement(item.id as DraggableBadgeElement)}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? "bg-blue-50 border-[#234679] text-[#234679] font-bold shadow-xs"
                        : "bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:border-slate-300"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate text-[11px]">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Item Properties */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Move className="w-3.5 h-3.5 text-[#218A59]" />
                <span>Selected: {selectedElement.toUpperCase()}</span>
              </span>

              {/* 1px Precision Nudge Buttons */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                <span className="text-[9px] text-slate-500 font-mono px-1">1px Nudge:</span>
                <button
                  onClick={() => nudgeSelectedElement(0, -1)}
                  title="Move Up 1px (ArrowUp)"
                  className="p-1 rounded bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 cursor-pointer"
                >
                  <ArrowUp className="w-3 h-3" />
                </button>
                <button
                  onClick={() => nudgeSelectedElement(0, 1)}
                  title="Move Down 1px (ArrowDown)"
                  className="p-1 rounded bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 cursor-pointer"
                >
                  <ArrowDown className="w-3 h-3" />
                </button>
                <button
                  onClick={() => nudgeSelectedElement(-1, 0)}
                  title="Move Left 1px (ArrowLeft)"
                  className="p-1 rounded bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 cursor-pointer"
                >
                  <ArrowLeft className="w-3 h-3" />
                </button>
                <button
                  onClick={() => nudgeSelectedElement(1, 0)}
                  title="Move Right 1px (ArrowRight)"
                  className="p-1 rounded bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 cursor-pointer"
                >
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* QR Code Specific Controls */}
            {selectedElement === "qr" && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                      <span>Horizontal (X)</span>
                      <span className="font-mono font-bold text-slate-900">{currentConfig.qrPlacement.x}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="90"
                      value={currentConfig.qrPlacement.x}
                      onChange={(e) =>
                        updateCurrentConfig({
                          qrPlacement: { ...currentConfig.qrPlacement, x: Number(e.target.value) },
                        })
                      }
                      className="w-full accent-[#218A59] h-1.5 bg-slate-200 rounded"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                      <span>Vertical (Y)</span>
                      <span className="font-mono font-bold text-slate-900">{currentConfig.qrPlacement.y}%</span>
                    </div>
                    <input
                      type="range"
                      min="15"
                      max="90"
                      value={currentConfig.qrPlacement.y}
                      onChange={(e) =>
                        updateCurrentConfig({
                          qrPlacement: { ...currentConfig.qrPlacement, y: Number(e.target.value) },
                        })
                      }
                      className="w-full accent-[#218A59] h-1.5 bg-slate-200 rounded"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                    <span>QR Code Size</span>
                    <span className="font-mono font-bold text-slate-900">{currentConfig.qrPlacement.size}px</span>
                  </div>
                  <input
                    type="range"
                    min="64"
                    max="140"
                    value={currentConfig.qrPlacement.size}
                    onChange={(e) =>
                      updateCurrentConfig({
                        qrPlacement: { ...currentConfig.qrPlacement, size: Number(e.target.value) },
                      })
                    }
                    className="w-full accent-[#218A59] h-1.5 bg-slate-200 rounded"
                  />
                </div>
              </div>
            )}

            {/* Attendee Name Specific Controls */}
            {selectedElement === "name" && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>Vertical (Y)</span>
                      <span className="font-mono text-slate-200">{currentConfig.namePlacement.y}%</span>
                    </div>
                    <input
                      type="range"
                      min="15"
                      max="85"
                      value={currentConfig.namePlacement.y}
                      onChange={(e) =>
                        updateCurrentConfig({
                          namePlacement: { ...currentConfig.namePlacement, y: Number(e.target.value) },
                        })
                      }
                      className="w-full accent-sky-400 h-1 bg-slate-800 rounded"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>Font Size</span>
                      <span className="font-mono text-slate-200">{currentConfig.namePlacement.fontSize}px</span>
                    </div>
                    <input
                      type="range"
                      min="14"
                      max="28"
                      value={currentConfig.namePlacement.fontSize}
                      onChange={(e) =>
                        updateCurrentConfig({
                          namePlacement: { ...currentConfig.namePlacement, fontSize: Number(e.target.value) },
                        })
                      }
                      className="w-full accent-sky-400 h-1 bg-slate-800 rounded"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">Color:</span>
                  {["#061A2A", "#087EA4", "#19A974", "#FFFFFF", "#DC2626"].map((c) => (
                    <button
                      key={c}
                      onClick={() =>
                        updateCurrentConfig({
                          namePlacement: { ...currentConfig.namePlacement, color: c },
                        })
                      }
                      style={{ backgroundColor: c }}
                      className={`w-5 h-5 rounded-full border border-slate-600 ${
                        currentConfig.namePlacement.color === c ? "ring-2 ring-white scale-110" : ""
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Organization Specific Controls */}
            {selectedElement === "org" && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>Vertical (Y)</span>
                      <span className="font-mono text-slate-200">{currentConfig.orgPlacement.y}%</span>
                    </div>
                    <input
                      type="range"
                      min="15"
                      max="90"
                      value={currentConfig.orgPlacement.y}
                      onChange={(e) =>
                        updateCurrentConfig({
                          orgPlacement: { ...currentConfig.orgPlacement, y: Number(e.target.value) },
                        })
                      }
                      className="w-full accent-sky-400 h-1 bg-slate-800 rounded"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>Font Size</span>
                      <span className="font-mono text-slate-200">{currentConfig.orgPlacement.fontSize}px</span>
                    </div>
                    <input
                      type="range"
                      min="11"
                      max="20"
                      value={currentConfig.orgPlacement.fontSize}
                      onChange={(e) =>
                        updateCurrentConfig({
                          orgPlacement: { ...currentConfig.orgPlacement, fontSize: Number(e.target.value) },
                        })
                      }
                      className="w-full accent-sky-400 h-1 bg-slate-800 rounded"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Designation Controls */}
            {selectedElement === "designation" && currentConfig.designationPlacement && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>Vertical (Y)</span>
                      <span className="font-mono text-slate-200">{currentConfig.designationPlacement.y}%</span>
                    </div>
                    <input
                      type="range"
                      min="15"
                      max="90"
                      value={currentConfig.designationPlacement.y}
                      onChange={(e) =>
                        updateCurrentConfig({
                          designationPlacement: { ...currentConfig.designationPlacement!, y: Number(e.target.value) },
                        })
                      }
                      className="w-full accent-sky-400 h-1 bg-slate-800 rounded"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>Font Size</span>
                      <span className="font-mono text-slate-200">{currentConfig.designationPlacement.fontSize}px</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="18"
                      value={currentConfig.designationPlacement.fontSize}
                      onChange={(e) =>
                        updateCurrentConfig({
                          designationPlacement: { ...currentConfig.designationPlacement!, fontSize: Number(e.target.value) },
                        })
                      }
                      className="w-full accent-sky-400 h-1 bg-slate-800 rounded"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Stall Number Controls */}
            {selectedElement === "stall" && currentConfig.stallPlacement && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>Vertical (Y)</span>
                      <span className="font-mono text-slate-200">{currentConfig.stallPlacement.y}%</span>
                    </div>
                    <input
                      type="range"
                      min="15"
                      max="90"
                      value={currentConfig.stallPlacement.y}
                      onChange={(e) =>
                        updateCurrentConfig({
                          stallPlacement: { ...currentConfig.stallPlacement!, y: Number(e.target.value) },
                        })
                      }
                      className="w-full accent-emerald-400 h-1 bg-slate-800 rounded"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>Font Size</span>
                      <span className="font-mono text-slate-200">{currentConfig.stallPlacement.fontSize}px</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="18"
                      value={currentConfig.stallPlacement.fontSize}
                      onChange={(e) =>
                        updateCurrentConfig({
                          stallPlacement: { ...currentConfig.stallPlacement!, fontSize: Number(e.target.value) },
                        })
                      }
                      className="w-full accent-emerald-400 h-1 bg-slate-800 rounded"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ID Controls */}
            {selectedElement === "id" && (
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Vertical (Y)</span>
                    <span className="font-mono text-slate-200">{currentConfig.idPlacement.y}%</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="95"
                    value={currentConfig.idPlacement.y}
                    onChange={(e) =>
                      updateCurrentConfig({
                        idPlacement: { ...currentConfig.idPlacement, y: Number(e.target.value) },
                      })
                    }
                    className="w-full accent-sky-400 h-1 bg-slate-800 rounded"
                  />
                </div>
              </div>
            )}

            {/* Role / Badge Banner Specific Controls */}
            {selectedElement === "banner" && (
              <div className="space-y-4">
                {/* Enable/Disable Toggle */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Show Role Banner Box</span>
                  <input
                    type="checkbox"
                    checked={currentConfig.roleBannerPlacement?.show !== false}
                    onChange={(e) =>
                      updateCurrentConfig((cfg) => ({
                        roleBannerPlacement: {
                          ...(cfg.roleBannerPlacement || {
                            text: activeRole === "visitor" ? "TRADE VISITOR" : "OFFICIAL EXHIBITOR",
                            x: 50,
                            y: 92,
                            fontSize: 12,
                            textColor: "#FFFFFF",
                            bgColor: activeRole === "visitor" ? "#087EA4" : "#19A974",
                            borderRadius: 6,
                            styleMode: "rounded",
                            widthPct: 85,
                            paddingY: 7,
                          }),
                          show: e.target.checked,
                        },
                      }))
                    }
                    className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                  />
                </div>

                {/* Custom Text Field */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Banner Text (e.g. VISITOR, TRADE VISITOR, VIP, EXHIBITOR)
                  </label>
                  <input
                    type="text"
                    value={currentConfig.roleBannerPlacement?.text ?? (activeRole === "visitor" ? "TRADE VISITOR" : "OFFICIAL EXHIBITOR")}
                    onChange={(e) =>
                      updateCurrentConfig((cfg) => ({
                        roleBannerPlacement: {
                          ...(cfg.roleBannerPlacement || {
                            show: true,
                            x: 50,
                            y: 92,
                            fontSize: 12,
                            textColor: "#FFFFFF",
                            bgColor: activeRole === "visitor" ? "#087EA4" : "#19A974",
                            borderRadius: 6,
                            styleMode: "rounded",
                            widthPct: 85,
                            paddingY: 7,
                          }),
                          text: e.target.value,
                        },
                      }))
                    }
                    placeholder="e.g. VISITOR"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold uppercase tracking-wider focus:outline-none focus:border-emerald-400"
                  />
                </div>

                {/* Banner Width Slider & Presets */}
                <div>
                  <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400 mb-1">
                    <span>Banner Width</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      {currentConfig.roleBannerPlacement?.styleMode === "full-width" ? "100% (Full)" : `${currentConfig.roleBannerPlacement?.widthPct || 85}%`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="100"
                    value={currentConfig.roleBannerPlacement?.widthPct || 85}
                    onChange={(e) =>
                      updateCurrentConfig((cfg) => ({
                        roleBannerPlacement: {
                          ...(cfg.roleBannerPlacement || {
                            show: true,
                            text: activeRole === "visitor" ? "TRADE VISITOR" : "OFFICIAL EXHIBITOR",
                            x: 50,
                            y: 92,
                            fontSize: 12,
                            textColor: "#FFFFFF",
                            bgColor: activeRole === "visitor" ? "#087EA4" : "#19A974",
                            borderRadius: 6,
                            styleMode: "rounded",
                            paddingY: 7,
                          }),
                          widthPct: Number(e.target.value),
                        },
                      }))
                    }
                    className="w-full accent-emerald-400 h-1.5 bg-slate-200 dark:bg-slate-800 rounded mb-2"
                  />

                  <div className="grid grid-cols-4 gap-1">
                    {[50, 70, 85, 100].map((w) => (
                      <button
                        key={w}
                        type="button"
                        onClick={() =>
                          updateCurrentConfig((cfg) => ({
                            roleBannerPlacement: {
                              ...(cfg.roleBannerPlacement || {
                                show: true,
                                text: activeRole === "visitor" ? "TRADE VISITOR" : "OFFICIAL EXHIBITOR",
                                x: 50,
                                y: 92,
                                fontSize: 12,
                                textColor: "#FFFFFF",
                                bgColor: activeRole === "visitor" ? "#087EA4" : "#19A974",
                                borderRadius: 6,
                                styleMode: "rounded",
                                paddingY: 7,
                              }),
                              widthPct: w,
                              styleMode: w === 100 ? "full-width" : "rounded",
                            },
                          }))
                        }
                        className="py-1 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-[10px] font-mono text-slate-700 dark:text-slate-300"
                      >
                        {w}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* Shape Style Selector */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    Box Shape / Style
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "rounded", label: "Rounded Box (6px)" },
                      { id: "pill", label: "Pill Shape (Oval)" },
                      { id: "square", label: "Square Box (0px)" },
                      { id: "full-width", label: "Full Bottom Strip" },
                    ].map((shape) => (
                      <button
                        key={shape.id}
                        type="button"
                        onClick={() =>
                          updateCurrentConfig((cfg) => ({
                            roleBannerPlacement: {
                              ...(cfg.roleBannerPlacement || {
                                show: true,
                                text: activeRole === "visitor" ? "TRADE VISITOR" : "OFFICIAL EXHIBITOR",
                                x: 50,
                                y: 92,
                                fontSize: 12,
                                textColor: "#FFFFFF",
                                bgColor: activeRole === "visitor" ? "#087EA4" : "#19A974",
                                borderRadius: 6,
                                widthPct: 85,
                                paddingY: 7,
                              }),
                              styleMode: shape.id as any,
                            },
                          }))
                        }
                        className={`p-2 rounded-lg text-xs font-medium border transition-all ${
                          (currentConfig.roleBannerPlacement?.styleMode || "rounded") === shape.id
                            ? "bg-emerald-500/20 border-emerald-400 text-emerald-700 dark:text-emerald-300 font-bold shadow-xs"
                            : "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                        }`}
                      >
                        {shape.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Background & Text Colors */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">Background Color:</span>
                    <input
                      type="color"
                      value={currentConfig.roleBannerPlacement?.bgColor || (activeRole === "visitor" ? "#087EA4" : "#19A974")}
                      onChange={(e) =>
                        updateCurrentConfig((cfg) => ({
                          roleBannerPlacement: {
                            ...(cfg.roleBannerPlacement || {
                              show: true,
                              text: activeRole === "visitor" ? "TRADE VISITOR" : "OFFICIAL EXHIBITOR",
                              x: 50,
                              y: 92,
                              fontSize: 12,
                              textColor: "#FFFFFF",
                              borderRadius: 6,
                              styleMode: "rounded",
                              widthPct: 85,
                              paddingY: 7,
                            }),
                            bgColor: e.target.value,
                          },
                        }))
                      }
                      className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                    />
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {["#087EA4", "#19A974", "#061A2A", "#DC2626", "#D97706", "#7C3AED", "#0284C7", "#0F172A"].map((c) => (
                      <button
                        key={c}
                        onClick={() =>
                          updateCurrentConfig((cfg) => ({
                            roleBannerPlacement: {
                              ...(cfg.roleBannerPlacement || {
                                show: true,
                                text: activeRole === "visitor" ? "TRADE VISITOR" : "OFFICIAL EXHIBITOR",
                                x: 50,
                                y: 92,
                                fontSize: 12,
                                textColor: "#FFFFFF",
                                borderRadius: 6,
                                styleMode: "rounded",
                                widthPct: 85,
                                paddingY: 7,
                              }),
                              bgColor: c,
                            },
                          }))
                        }
                        style={{ backgroundColor: c }}
                        className={`w-6 h-6 rounded-md border border-slate-700 ${
                          (currentConfig.roleBannerPlacement?.bgColor || (activeRole === "visitor" ? "#087EA4" : "#19A974")) === c
                            ? "ring-2 ring-emerald-400 scale-110"
                            : ""
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Text Color */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-400">Text Color:</span>
                  <div className="flex items-center gap-2">
                    {["#FFFFFF", "#000000", "#FEF08A", "#67E8F9"].map((c) => (
                      <button
                        key={c}
                        onClick={() =>
                          updateCurrentConfig((cfg) => ({
                            roleBannerPlacement: {
                              ...(cfg.roleBannerPlacement || {
                                show: true,
                                text: activeRole === "visitor" ? "TRADE VISITOR" : "OFFICIAL EXHIBITOR",
                                x: 50,
                                y: 92,
                                fontSize: 12,
                                bgColor: activeRole === "visitor" ? "#087EA4" : "#19A974",
                                borderRadius: 6,
                                styleMode: "rounded",
                                widthPct: 85,
                                paddingY: 7,
                              }),
                              textColor: c,
                            },
                          }))
                        }
                        style={{ backgroundColor: c }}
                        className={`w-5 h-5 rounded-full border border-slate-600 ${
                          (currentConfig.roleBannerPlacement?.textColor || "#FFFFFF") === c ? "ring-2 ring-white scale-110" : ""
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Font Size & Position */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800">
                  <div>
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                      <span>Font Size</span>
                      <span className="font-mono">{currentConfig.roleBannerPlacement?.fontSize || 12}px</span>
                    </div>
                    <input
                      type="range"
                      min="9"
                      max="24"
                      value={currentConfig.roleBannerPlacement?.fontSize || 12}
                      onChange={(e) =>
                        updateCurrentConfig((cfg) => ({
                          roleBannerPlacement: {
                            ...(cfg.roleBannerPlacement || {
                              show: true,
                              text: activeRole === "visitor" ? "TRADE VISITOR" : "OFFICIAL EXHIBITOR",
                              x: 50,
                              y: 92,
                              textColor: "#FFFFFF",
                              bgColor: activeRole === "visitor" ? "#087EA4" : "#19A974",
                              borderRadius: 6,
                              styleMode: "rounded",
                              widthPct: 85,
                              paddingY: 7,
                            }),
                            fontSize: Number(e.target.value),
                          },
                        }))
                      }
                      className="w-full accent-emerald-400 h-1 bg-slate-800 rounded"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                      <span>Horiz (X)</span>
                      <span className="font-mono">{currentConfig.roleBannerPlacement?.x ?? 50}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="90"
                      value={currentConfig.roleBannerPlacement?.x ?? 50}
                      onChange={(e) =>
                        updateCurrentConfig((cfg) => ({
                          roleBannerPlacement: {
                            ...(cfg.roleBannerPlacement || {
                              show: true,
                              text: activeRole === "visitor" ? "TRADE VISITOR" : "OFFICIAL EXHIBITOR",
                              y: 92,
                              fontSize: 12,
                              textColor: "#FFFFFF",
                              bgColor: activeRole === "visitor" ? "#087EA4" : "#19A974",
                              borderRadius: 6,
                              styleMode: "rounded",
                              widthPct: 85,
                              paddingY: 7,
                            }),
                            x: Number(e.target.value),
                          },
                        }))
                      }
                      className="w-full accent-emerald-400 h-1 bg-slate-800 rounded"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                      <span>Vert (Y)</span>
                      <span className="font-mono">{currentConfig.roleBannerPlacement?.y ?? 92}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="95"
                      value={currentConfig.roleBannerPlacement?.y ?? 92}
                      onChange={(e) =>
                        updateCurrentConfig((cfg) => ({
                          roleBannerPlacement: {
                            ...(cfg.roleBannerPlacement || {
                              show: true,
                              text: activeRole === "visitor" ? "TRADE VISITOR" : "OFFICIAL EXHIBITOR",
                              x: 50,
                              fontSize: 12,
                              textColor: "#FFFFFF",
                              bgColor: activeRole === "visitor" ? "#087EA4" : "#19A974",
                              borderRadius: 6,
                              styleMode: "rounded",
                              widthPct: 85,
                              paddingY: 7,
                            }),
                            y: Number(e.target.value),
                          },
                        }))
                      }
                      className="w-full accent-emerald-400 h-1 bg-slate-800 rounded"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Custom Text Field Specific Controls */}
            {activeCustomText && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-300">Edit Custom Text Box</span>
                  <button
                    onClick={() => handleDeleteCustomText(activeCustomText.id)}
                    className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[10px] flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete</span>
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Text Content
                  </label>
                  <input
                    type="text"
                    value={activeCustomText.text}
                    onChange={(e) =>
                      updateCurrentConfig((cfg) => ({
                        customTexts: (cfg.customTexts || []).map((ct) =>
                          ct.id === activeCustomText.id ? { ...ct, text: e.target.value } : ct
                        ),
                      }))
                    }
                    placeholder="Enter text..."
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-sky-400"
                  />
                </div>

                {/* Width Slider */}
                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Box Width</span>
                    <span className="font-mono text-sky-400 font-bold">
                      {activeCustomText.widthPct ? `${activeCustomText.widthPct}%` : "Auto (Fit Text)"}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={activeCustomText.widthPct || 0}
                    onChange={(e) =>
                      updateCurrentConfig((cfg) => ({
                        customTexts: (cfg.customTexts || []).map((ct) =>
                          ct.id === activeCustomText.id ? { ...ct, widthPct: Number(e.target.value) } : ct
                        ),
                      }))
                    }
                    className="w-full accent-sky-400 h-1.5 bg-slate-800 rounded"
                  />
                </div>

                {/* Colors */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1">Text Color:</span>
                    <input
                      type="color"
                      value={activeCustomText.textColor}
                      onChange={(e) =>
                        updateCurrentConfig((cfg) => ({
                          customTexts: (cfg.customTexts || []).map((ct) =>
                            ct.id === activeCustomText.id ? { ...ct, textColor: e.target.value } : ct
                          ),
                        }))
                      }
                      className="w-full h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1">Background:</span>
                    <input
                      type="color"
                      value={activeCustomText.bgColor || "#FFFFFF"}
                      onChange={(e) =>
                        updateCurrentConfig((cfg) => ({
                          customTexts: (cfg.customTexts || []).map((ct) =>
                            ct.id === activeCustomText.id ? { ...ct, bgColor: e.target.value } : ct
                          ),
                        }))
                      }
                      className="w-full h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                    />
                  </div>
                </div>

                {/* Font Size & Position */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800">
                  <div>
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                      <span>Font Size</span>
                      <span className="font-mono">{activeCustomText.fontSize}px</span>
                    </div>
                    <input
                      type="range"
                      min="9"
                      max="24"
                      value={activeCustomText.fontSize}
                      onChange={(e) =>
                        updateCurrentConfig((cfg) => ({
                          customTexts: (cfg.customTexts || []).map((ct) =>
                            ct.id === activeCustomText.id ? { ...ct, fontSize: Number(e.target.value) } : ct
                          ),
                        }))
                      }
                      className="w-full accent-sky-400 h-1 bg-slate-800 rounded"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                      <span>Horiz (X)</span>
                      <span className="font-mono">{activeCustomText.x}%</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="95"
                      value={activeCustomText.x}
                      onChange={(e) =>
                        updateCurrentConfig((cfg) => ({
                          customTexts: (cfg.customTexts || []).map((ct) =>
                            ct.id === activeCustomText.id ? { ...ct, x: Number(e.target.value) } : ct
                          ),
                        }))
                      }
                      className="w-full accent-sky-400 h-1 bg-slate-800 rounded"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                      <span>Vert (Y)</span>
                      <span className="font-mono">{activeCustomText.y}%</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="95"
                      value={activeCustomText.y}
                      onChange={(e) =>
                        updateCurrentConfig((cfg) => ({
                          customTexts: (cfg.customTexts || []).map((ct) =>
                            ct.id === activeCustomText.id ? { ...ct, y: Number(e.target.value) } : ct
                          ),
                        }))
                      }
                      className="w-full accent-sky-400 h-1 bg-slate-800 rounded"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Background Artwork Uploader */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <label className="font-semibold text-slate-300 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
              <span>Background Artwork</span>
            </label>
            <div className="flex items-center gap-3">
              <label className="flex-1 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-center font-medium text-slate-200 cursor-pointer transition-colors flex items-center justify-center gap-2">
                <Upload className="w-4 h-4" />
                <span>Upload Artwork (.PNG/.JPG)</span>
                <input type="file" accept="image/*" onChange={handleUploadBgImage} className="hidden" />
              </label>

              {currentConfig.bgImage && (
                <button
                  onClick={() => updateCurrentConfig({ bgImage: "" })}
                  className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 transition-colors"
                  title="Remove custom background image"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT INTERACTIVE ID CARD PREVIEW (DRAG & DROP CANVAS) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 space-y-4 shadow-inner">
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <Move className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            <span>Interactive Drag Canvas (or select & use Arrow Keys to move 1px)</span>
          </div>

          {/* Lanyard Top Fixture */}
          <div className="flex flex-col items-center">
            <div className="w-10 h-3 bg-slate-700 rounded-t-md shadow-inner" />
            <div className="w-6 h-3 bg-slate-800 rounded-b-sm border-b-2 border-slate-600 mb-1" />
          </div>

          {/* Draggable ID Card Frame (320px x 480px) */}
          <div
            ref={cardRef}
            style={{
              width: 320,
              height: 480,
              background: currentConfig.bgImage
                ? `url(${currentConfig.bgImage}) center/cover no-repeat`
                : currentConfig.bgGradient,
            }}
            className="relative rounded-2xl shadow-2xl border-4 border-slate-700/80 overflow-hidden text-slate-900 select-none transition-all"
          >
            {/* Lanyard Punch Hole */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-2 bg-slate-900/40 rounded-full border border-slate-400/30 z-10" />

            {/* 1. DRAGGABLE ATTENDEE NAME */}
            <div
              style={{
                top: `${currentConfig.namePlacement.y}%`,
                left: `${currentConfig.namePlacement.x}%`,
                transform: "translate(-50%, -50%)",
                fontSize: `${currentConfig.namePlacement.fontSize}px`,
                color: currentConfig.namePlacement.color,
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                setSelectedElement("name");
                setIsDragging(true);
              }}
              className={`absolute w-full px-4 text-center font-bold font-sans cursor-grab active:cursor-grabbing transition-shadow ${
                selectedElement === "name"
                  ? "ring-2 ring-sky-400 ring-offset-2 rounded-lg bg-sky-500/10"
                  : "hover:ring-1 hover:ring-slate-400 rounded-lg"
              }`}
            >
              <span>{sampleAttendee.name}</span>
            </div>

            {/* 2. DRAGGABLE ORGANIZATION */}
            <div
              style={{
                top: `${currentConfig.orgPlacement.y}%`,
                left: `${currentConfig.orgPlacement.x}%`,
                transform: "translate(-50%, -50%)",
                fontSize: `${currentConfig.orgPlacement.fontSize}px`,
                color: currentConfig.orgPlacement.color,
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                setSelectedElement("org");
                setIsDragging(true);
              }}
              className={`absolute w-full px-4 text-center font-semibold cursor-grab active:cursor-grabbing transition-shadow ${
                selectedElement === "org"
                  ? "ring-2 ring-sky-400 ring-offset-2 rounded-lg bg-sky-500/10"
                  : "hover:ring-1 hover:ring-slate-400 rounded-lg"
              }`}
            >
              <span>{sampleAttendee.org}</span>
            </div>

            {/* 3. DRAGGABLE DESIGNATION (Visitor) */}
            {activeRole === "visitor" && currentConfig.designationPlacement && (
              <div
                style={{
                  top: `${currentConfig.designationPlacement.y}%`,
                  left: `${currentConfig.designationPlacement.x}%`,
                  transform: "translate(-50%, -50%)",
                  fontSize: `${currentConfig.designationPlacement.fontSize}px`,
                  color: currentConfig.designationPlacement.color,
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setSelectedElement("designation");
                  setIsDragging(true);
                }}
                className={`absolute w-full px-4 text-center text-slate-600 cursor-grab active:cursor-grabbing transition-shadow ${
                  selectedElement === "designation"
                    ? "ring-2 ring-sky-400 ring-offset-2 rounded-lg bg-sky-500/10"
                    : "hover:ring-1 hover:ring-slate-400 rounded-lg"
                }`}
              >
                <span>{sampleAttendee.designation} · {sampleAttendee.country}</span>
              </div>
            )}

            {/* 4. DRAGGABLE STALL NUMBER (Exhibitor) */}
            {activeRole === "exhibitor" && currentConfig.stallPlacement && (
              <div
                style={{
                  top: `${currentConfig.stallPlacement.y}%`,
                  left: `${currentConfig.stallPlacement.x}%`,
                  transform: "translate(-50%, -50%)",
                  fontSize: `${currentConfig.stallPlacement.fontSize}px`,
                  color: currentConfig.stallPlacement.color,
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setSelectedElement("stall");
                  setIsDragging(true);
                }}
                className={`absolute w-full px-4 text-center font-bold text-emerald-800 cursor-grab active:cursor-grabbing transition-shadow ${
                  selectedElement === "stall"
                    ? "ring-2 ring-emerald-400 ring-offset-2 rounded-lg bg-emerald-500/10"
                    : "hover:ring-1 hover:ring-slate-400 rounded-lg"
                }`}
              >
                <span>{sampleAttendee.stall}</span>
              </div>
            )}

            {/* 5. DRAGGABLE SCANNABLE QR CODE */}
            <div
              style={{
                top: `${currentConfig.qrPlacement.y}%`,
                left: `${currentConfig.qrPlacement.x}%`,
                width: `${currentConfig.qrPlacement.size}px`,
                height: `${currentConfig.qrPlacement.size}px`,
                transform: "translate(-50%, -50%)",
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                setSelectedElement("qr");
                setIsDragging(true);
              }}
              className={`absolute bg-white p-1.5 rounded-xl border cursor-grab active:cursor-grabbing shadow-md flex items-center justify-center transition-shadow ${
                selectedElement === "qr"
                  ? "ring-4 ring-emerald-400 ring-offset-2 border-emerald-500 scale-105"
                  : "border-slate-300 hover:ring-2 hover:ring-slate-400"
              }`}
            >
              <svg viewBox={`0 0 ${qrCellCount} ${qrCellCount}`} className="w-full h-full pointer-events-none" shapeRendering="crispEdges">
                <rect width={qrCellCount} height={qrCellCount} fill="#FFFFFF" />
                {qrMatrix.map((row, r) =>
                  row.map((val, c) => (val ? <rect key={`${r}-${c}`} x={c} y={r} width={1} height={1} fill="#061A2A" /> : null))
                )}
              </svg>

              {/* Coordinates Pill while Dragging */}
              {isDragging && selectedElement === "qr" && (
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-slate-900 text-white text-[9px] font-mono whitespace-nowrap shadow-lg">
                  X:{currentConfig.qrPlacement.x}% Y:{currentConfig.qrPlacement.y}%
                </div>
              )}
            </div>

            {/* 6. DRAGGABLE REGISTRATION ID */}
            <div
              style={{
                top: `${currentConfig.idPlacement.y}%`,
                left: `${currentConfig.idPlacement.x}%`,
                transform: "translate(-50%, -50%)",
                fontSize: `${currentConfig.idPlacement.fontSize}px`,
                color: currentConfig.idPlacement.color,
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                setSelectedElement("id");
                setIsDragging(true);
              }}
              className={`absolute w-full text-center font-mono font-semibold cursor-grab active:cursor-grabbing transition-shadow ${
                selectedElement === "id"
                  ? "ring-2 ring-sky-400 ring-offset-2 rounded-lg bg-sky-500/10"
                  : "hover:ring-1 hover:ring-slate-400 rounded-lg"
              }`}
            >
              <span>ID: {sampleAttendee.id}</span>
            </div>

            {/* 7. DRAGGABLE ROLE / BADGE BANNER RECTANGLE WITH BG & ADJUSTABLE WIDTH */}
            {currentConfig.roleBannerPlacement?.show !== false && (
              <div
                style={{
                  top: `${currentConfig.roleBannerPlacement?.y ?? 92}%`,
                  left: `${currentConfig.roleBannerPlacement?.x ?? 50}%`,
                  transform: "translate(-50%, -50%)",
                  width:
                    currentConfig.roleBannerPlacement?.styleMode === "full-width"
                      ? "100%"
                      : currentConfig.roleBannerPlacement?.widthPct
                      ? `${currentConfig.roleBannerPlacement.widthPct}%`
                      : "85%",
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setSelectedElement("banner");
                  setIsDragging(true);
                }}
                className={`absolute cursor-grab active:cursor-grabbing text-center z-10 select-none transition-shadow ${
                  selectedElement === "banner"
                    ? "ring-4 ring-emerald-400 ring-offset-2 scale-105"
                    : "hover:ring-2 hover:ring-slate-400"
                }`}
              >
                <div
                  style={{
                    backgroundColor: currentConfig.roleBannerPlacement?.bgColor || (activeRole === "visitor" ? "#087EA4" : "#19A974"),
                    color: currentConfig.roleBannerPlacement?.textColor || "#FFFFFF",
                    fontSize: `${currentConfig.roleBannerPlacement?.fontSize || 12}px`,
                    paddingTop: `${currentConfig.roleBannerPlacement?.paddingY || 7}px`,
                    paddingBottom: `${currentConfig.roleBannerPlacement?.paddingY || 7}px`,
                    borderRadius:
                      currentConfig.roleBannerPlacement?.styleMode === "pill"
                        ? "9999px"
                        : currentConfig.roleBannerPlacement?.styleMode === "square"
                        ? "0px"
                        : currentConfig.roleBannerPlacement?.styleMode === "full-width"
                        ? "0px"
                        : `${currentConfig.roleBannerPlacement?.borderRadius ?? 6}px`,
                  }}
                  className={`font-black uppercase tracking-widest px-4 shadow-md flex items-center justify-center w-full ${
                    currentConfig.roleBannerPlacement?.styleMode === "full-width" ? "rounded-none" : ""
                  }`}
                >
                  {currentConfig.roleBannerPlacement?.text || (activeRole === "visitor" ? "TRADE VISITOR" : "OFFICIAL EXHIBITOR")}
                </div>

                {/* Coordinates Pill while Dragging */}
                {isDragging && selectedElement === "banner" && (
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-slate-900 text-white text-[9px] font-mono whitespace-nowrap shadow-lg">
                    X:{currentConfig.roleBannerPlacement?.x ?? 50}% Y:{currentConfig.roleBannerPlacement?.y ?? 92}%
                  </div>
                )}
              </div>
            )}

            {/* 8. DRAGGABLE CUSTOM TEXT FIELDS */}
            {(currentConfig.customTexts || []).map((ct) => {
              const isSelected = selectedElement === ct.id;
              return (
                <div
                  key={ct.id}
                  style={{
                    top: `${ct.y}%`,
                    left: `${ct.x}%`,
                    transform: "translate(-50%, -50%)",
                    width: ct.widthPct ? `${ct.widthPct}%` : "auto",
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setSelectedElement(ct.id);
                    setIsDragging(true);
                  }}
                  className={`absolute cursor-grab active:cursor-grabbing text-center z-10 select-none transition-shadow ${
                    isSelected ? "ring-4 ring-sky-400 ring-offset-2 scale-105" : "hover:ring-2 hover:ring-slate-400"
                  }`}
                >
                  <div
                    style={{
                      backgroundColor: ct.bgColor || "transparent",
                      color: ct.textColor || "#061A2A",
                      fontSize: `${ct.fontSize || 12}px`,
                      borderRadius: `${ct.borderRadius ?? 4}px`,
                    }}
                    className="font-bold px-3 py-1 shadow-sm whitespace-nowrap inline-block"
                  >
                    {ct.text}
                  </div>

                  {/* Coordinates Pill while Dragging */}
                  {isDragging && isSelected && (
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-slate-900 text-white text-[9px] font-mono whitespace-nowrap shadow-lg">
                      X:{ct.x}% Y:{ct.y}%
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
