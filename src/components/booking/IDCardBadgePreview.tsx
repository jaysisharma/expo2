"use client";

import React, { useRef, useState } from "react";
import { Download, Printer, Share2, CheckCircle2, ShieldCheck, Sparkles, Image as ImageIcon } from "lucide-react";
import { generateQRCodeMatrix } from "@/lib/qrCodeGenerator";
import { BadgeConfig } from "./AdminBadgeDesigner";

interface IDCardBadgePreviewProps {
  name: string;
  organization: string;
  jobTitle?: string;
  stallNumber?: string;
  delegateId: string;
  country?: string;
  role: "visitor" | "exhibitor";
  templateConfig?: BadgeConfig;
}

export default function IDCardBadgePreview({
  name,
  organization,
  jobTitle,
  stallNumber,
  delegateId,
  country = "Nepal",
  role = "visitor",
  templateConfig,
}: IDCardBadgePreviewProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Default fallback configs if not loaded from admin
  const config: BadgeConfig = templateConfig || {
    role: role.toUpperCase(),
    badgeTitle: role === "visitor" ? "TRADE VISITOR" : "OFFICIAL EXHIBITOR",
    themeColor: role === "visitor" ? "#087EA4" : "#19A974",
    bgGradient: role === "visitor" ? "linear-gradient(180deg, #FFFFFF 0%, #F0F9FF 100%)" : "linear-gradient(180deg, #FFFFFF 0%, #F0FDF4 100%)",
    bgImage: "",
    qrPlacement: { x: 50, y: 70, size: 96 },
    namePlacement: { x: 50, y: 38, fontSize: 20, color: "#061A2A" },
    orgPlacement: { x: 50, y: 46, fontSize: 13, color: role === "visitor" ? "#087EA4" : "#19A974" },
    designationPlacement: { x: 50, y: 53, fontSize: 11, color: "#64748B" },
    stallPlacement: { x: 50, y: 53, fontSize: 12, color: "#061A2A" },
    idPlacement: { x: 50, y: 83, fontSize: 11, color: "#061A2A" },
    roleBannerPlacement: {
      show: true,
      text: role === "visitor" ? "TRADE VISITOR" : "OFFICIAL EXHIBITOR",
      x: 50,
      y: 92,
      fontSize: 12,
      textColor: "#FFFFFF",
      bgColor: role === "visitor" ? "#087EA4" : "#19A974",
      borderRadius: 6,
      styleMode: "rounded",
      widthPct: 85,
      paddingY: 7,
    },
    customTexts: [],
  };

  // Generate clean verifiable QR target URL
  const qrTarget = typeof window !== "undefined"
    ? `${window.location.origin}/verify?id=${delegateId}&role=${role}&name=${encodeURIComponent(name || "")}&org=${encodeURIComponent(organization || "")}`
    : `https://greenenergyexpo.org.np/verify?id=${delegateId}&role=${role}`;

  const qrMatrix = generateQRCodeMatrix(qrTarget);
  const qrCellCount = qrMatrix.length;

  // 1. Clean PDF Print (Isolates only the ID card badge)
  const handlePrint = () => {
    window.print();
  };

  // 2. Direct High-Resolution Badge Export (PNG / Card File)
  const handleDownloadBadgeImage = async () => {
    setIsDownloading(true);
    try {
      const canvas = document.createElement("canvas");
      const scale = 2; // High-res 2x retina
      const width = 320 * scale;
      const height = 480 * scale;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Draw Background
      if (config.bgImage) {
        await new Promise<void>((resolve) => {
          const img = new window.Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            ctx.drawImage(img, 0, 0, width, height);
            resolve();
          };
          img.onerror = () => {
            // Fallback gradient
            ctx.fillStyle = role === "visitor" ? "#F0F9FF" : "#F0FDF4";
            ctx.fillRect(0, 0, width, height);
            resolve();
          };
          img.src = config.bgImage;
        });
      } else {
        const grad = ctx.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0, "#FFFFFF");
        grad.addColorStop(1, role === "visitor" ? "#F0F9FF" : "#F0FDF4");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      }

      // Draw Lanyard Punch Hole at top
      ctx.fillStyle = "rgba(12, 18, 28, 0.4)";
      ctx.beginPath();
      ctx.roundRect((width / 2) - (20 * scale), 8 * scale, 40 * scale, 8 * scale, 4 * scale);
      ctx.fill();

      // Text Alignment Setup
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // 1. Draw Name
      ctx.fillStyle = config.namePlacement.color || "#061A2A";
      ctx.font = `bold ${config.namePlacement.fontSize * scale}px sans-serif`;
      const nameX = (config.namePlacement.x / 100) * width;
      const nameY = (config.namePlacement.y / 100) * height;
      ctx.fillText(name || "Registered Delegate", nameX, nameY);

      // 2. Draw Organization
      ctx.fillStyle = config.orgPlacement.color || "#087EA4";
      ctx.font = `600 ${config.orgPlacement.fontSize * scale}px sans-serif`;
      const orgX = (config.orgPlacement.x / 100) * width;
      const orgY = (config.orgPlacement.y / 100) * height;
      ctx.fillText(organization || "Company / Organization", orgX, orgY);

      // 3. Draw Designation / Stall
      if (role === "visitor" && config.designationPlacement) {
        ctx.fillStyle = config.designationPlacement.color || "#64748B";
        ctx.font = `normal ${config.designationPlacement.fontSize * scale}px sans-serif`;
        const desX = (config.designationPlacement.x / 100) * width;
        const desY = (config.designationPlacement.y / 100) * height;
        const text = `${jobTitle || "Trade Delegate"}${country ? ` · ${country}` : ""}`;
        ctx.fillText(text, desX, desY);
      } else if (role === "exhibitor" && config.stallPlacement) {
        ctx.fillStyle = config.stallPlacement.color || "#061A2A";
        ctx.font = `bold ${config.stallPlacement.fontSize * scale}px sans-serif`;
        const stallX = (config.stallPlacement.x / 100) * width;
        const stallY = (config.stallPlacement.y / 100) * height;
        ctx.fillText(stallNumber ? `STALL: ${stallNumber}` : "MAIN EXHIBITION HALL", stallX, stallY);
      }

      // 4. Draw QR Code Container & Matrix
      const qrPixelSize = config.qrPlacement.size * scale;
      const qrCenterX = (config.qrPlacement.x / 100) * width;
      const qrCenterY = (config.qrPlacement.y / 100) * height;
      const qrLeft = qrCenterX - qrPixelSize / 2;
      const qrTop = qrCenterY - qrPixelSize / 2;

      // QR White Container Box with subtle border
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.roundRect(qrLeft - (4 * scale), qrTop - (4 * scale), qrPixelSize + (8 * scale), qrPixelSize + (8 * scale), 8 * scale);
      ctx.fill();
      ctx.strokeStyle = "#CBD5E1";
      ctx.lineWidth = 1 * scale;
      ctx.stroke();

      // Draw QR modules
      const cellSize = qrPixelSize / qrCellCount;
      ctx.fillStyle = "#061A2A";
      for (let r = 0; r < qrCellCount; r++) {
        for (let c = 0; c < qrCellCount; c++) {
          if (qrMatrix[r][c]) {
            ctx.fillRect(qrLeft + c * cellSize, qrTop + r * cellSize, cellSize + 0.3, cellSize + 0.3);
          }
        }
      }

      // 5. Draw Registration ID
      ctx.fillStyle = config.idPlacement.color || "#061A2A";
      ctx.font = `bold ${config.idPlacement.fontSize * scale}px monospace`;
      const idX = (config.idPlacement.x / 100) * width;
      const idY = (config.idPlacement.y / 100) * height;
      ctx.fillText(delegateId, idX, idY);

      // 6. Draw Role / Badge Banner with Background Rectangle
      if (config.roleBannerPlacement?.show !== false) {
        const bannerText = config.roleBannerPlacement?.text || (role === "visitor" ? "TRADE VISITOR" : "OFFICIAL EXHIBITOR");
        const bannerFontSize = (config.roleBannerPlacement?.fontSize || 12) * scale;
        ctx.font = `900 ${bannerFontSize}px sans-serif`;

        const bannerX = ((config.roleBannerPlacement?.x ?? 50) / 100) * width;
        const bannerY = ((config.roleBannerPlacement?.y ?? 92) / 100) * height;
        const isFullWidth = config.roleBannerPlacement?.styleMode === "full-width";
        const isPill = config.roleBannerPlacement?.styleMode === "pill";
        const isSquare = config.roleBannerPlacement?.styleMode === "square";

        const textMetrics = ctx.measureText(bannerText);
        const paddingX = 16 * scale;
        const paddingY = (config.roleBannerPlacement?.paddingY || 7) * scale;

        let boxWidth = textMetrics.width + paddingX * 2;
        if (isFullWidth) {
          boxWidth = width;
        } else if (config.roleBannerPlacement?.widthPct) {
          boxWidth = (config.roleBannerPlacement.widthPct / 100) * width;
        }

        const boxHeight = bannerFontSize + paddingY * 2;
        const boxLeft = isFullWidth ? 0 : bannerX - boxWidth / 2;
        const boxTop = bannerY - boxHeight / 2;
        const radius = isFullWidth || isSquare ? 0 : isPill ? boxHeight / 2 : (config.roleBannerPlacement?.borderRadius ?? 6) * scale;

        // Draw background box
        ctx.fillStyle = config.roleBannerPlacement?.bgColor || (role === "visitor" ? "#087EA4" : "#19A974");
        ctx.beginPath();
        ctx.roundRect(boxLeft, boxTop, boxWidth, boxHeight, radius);
        ctx.fill();

        // Draw text
        ctx.fillStyle = config.roleBannerPlacement?.textColor || "#FFFFFF";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(bannerText, bannerX, bannerY);
      }

      // 7. Draw Custom Text Elements
      if (Array.isArray(config.customTexts)) {
        for (const ct of config.customTexts) {
          if (!ct.text) continue;
          const fontSize = (ct.fontSize || 12) * scale;
          ctx.font = `bold ${fontSize}px sans-serif`;

          const ctX = (ct.x / 100) * width;
          const ctY = (ct.y / 100) * height;
          const textMetrics = ctx.measureText(ct.text);
          const paddingX = 12 * scale;
          const paddingY = 4 * scale;

          let boxWidth = textMetrics.width + paddingX * 2;
          if (ct.widthPct) {
            boxWidth = (ct.widthPct / 100) * width;
          }

          const boxHeight = fontSize + paddingY * 2;
          const boxLeft = ctX - boxWidth / 2;
          const boxTop = ctY - boxHeight / 2;
          const radius = (ct.borderRadius ?? 4) * scale;

          if (ct.bgColor && ct.bgColor !== "transparent") {
            ctx.fillStyle = ct.bgColor;
            ctx.beginPath();
            ctx.roundRect(boxLeft, boxTop, boxWidth, boxHeight, radius);
            ctx.fill();
          }

          ctx.fillStyle = ct.textColor || "#061A2A";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(ct.text, ctX, ctY);
        }
      }

      // Trigger Download
      const dataUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `HimalayanGreenEnergyExpo_Badge_${delegateId}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.error("Failed to export badge image", e);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-5">
      {/* Embedded Print Isolation Styles */}
      <style jsx global>{`
        @media print {
          /* Hide the entire website page */
          body * {
            visibility: hidden !important;
          }
          /* Make ONLY the printable ID badge visible */
          #printable-id-badge,
          #printable-id-badge * {
            visibility: visible !important;
          }
          #printable-id-badge {
            position: fixed !important;
            left: 50% !important;
            top: 50% !important;
            transform: translate(-50%, -50%) !important;
            width: 320px !important;
            height: 480px !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: 1px solid #94a3b8 !important;
            border-radius: 16px !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          @page {
            size: auto;
            margin: 0mm;
          }
        }
      `}</style>

      {/* Lanyard Top Fixture (Hidden during print) */}
      <div className="flex flex-col items-center select-none print:hidden">
        <div className="w-10 h-3.5 bg-slate-700 rounded-t-md shadow-inner" />
        <div className="w-6 h-3 bg-slate-800 rounded-b-sm border-b-2 border-slate-600 mb-1" />
      </div>

      {/* ID Card Badge Frame */}
      <div
        id="printable-id-badge"
        ref={cardRef}
        style={{
          width: 320,
          height: 480,
          background: config.bgImage ? `url(${config.bgImage}) center/cover no-repeat` : config.bgGradient,
        }}
        className="relative rounded-2xl shadow-2xl border-4 border-slate-800 overflow-hidden text-slate-900 select-none transition-all"
      >
        {/* Lanyard Punch Hole */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-2 bg-slate-900/40 rounded-full border border-slate-400/30 z-10" />

        {/* Attendee Name */}
        <div
          style={{
            top: `${config.namePlacement.y}%`,
            left: `${config.namePlacement.x}%`,
            transform: "translate(-50%, -50%)",
            fontSize: `${config.namePlacement.fontSize}px`,
            color: config.namePlacement.color,
          }}
          className="absolute w-full px-4 text-center font-bold font-sans truncate"
        >
          {name || "Registered Delegate"}
        </div>

        {/* Company / Organization */}
        <div
          style={{
            top: `${config.orgPlacement.y}%`,
            left: `${config.orgPlacement.x}%`,
            transform: "translate(-50%, -50%)",
            fontSize: `${config.orgPlacement.fontSize}px`,
            color: config.orgPlacement.color,
          }}
          className="absolute w-full px-4 text-center font-semibold font-sans truncate"
        >
          {organization || "Company / Organization"}
        </div>

        {/* Designation (for Visitor) */}
        {role === "visitor" && config.designationPlacement && (
          <div
            style={{
              top: `${config.designationPlacement.y}%`,
              left: `${config.designationPlacement.x}%`,
              transform: "translate(-50%, -50%)",
              fontSize: `${config.designationPlacement.fontSize}px`,
              color: config.designationPlacement.color,
            }}
            className="absolute w-full px-4 text-center text-slate-600 font-sans truncate"
          >
            {jobTitle || "Trade Delegate"} {country ? `· ${country}` : ""}
          </div>
        )}

        {/* Stall Number (for Exhibitor) */}
        {role === "exhibitor" && config.stallPlacement && (
          <div
            style={{
              top: `${config.stallPlacement.y}%`,
              left: `${config.stallPlacement.x}%`,
              transform: "translate(-50%, -50%)",
              fontSize: `${config.stallPlacement.fontSize}px`,
              color: config.stallPlacement.color,
            }}
            className="absolute w-full px-4 text-center font-bold text-emerald-800 font-sans truncate"
          >
            {stallNumber ? `STALL: ${stallNumber}` : "MAIN EXHIBITION HALL"}
          </div>
        )}

        {/* Dynamic Scannable QR Code */}
        <div
          style={{
            top: `${config.qrPlacement.y}%`,
            left: `${config.qrPlacement.x}%`,
            width: `${config.qrPlacement.size}px`,
            height: `${config.qrPlacement.size}px`,
            transform: "translate(-50%, -50%)",
          }}
          className="absolute bg-white p-1 rounded-xl border border-slate-300 shadow-md flex items-center justify-center overflow-hidden"
        >
          <svg viewBox={`0 0 ${qrCellCount} ${qrCellCount}`} className="w-full h-full" shapeRendering="crispEdges">
            <rect width={qrCellCount} height={qrCellCount} fill="#FFFFFF" />
            {qrMatrix.map((row, r) =>
              row.map((val, c) => (val ? <rect key={`${r}-${c}`} x={c} y={r} width={1} height={1} fill="#061A2A" /> : null))
            )}
          </svg>
        </div>

        {/* Delegate ID */}
        <div
          style={{
            top: `${config.idPlacement.y}%`,
            left: `${config.idPlacement.x}%`,
            transform: "translate(-50%, -50%)",
            fontSize: `${config.idPlacement.fontSize}px`,
            color: config.idPlacement.color,
          }}
          className="absolute w-full text-center font-mono font-semibold"
        >
          {delegateId}
        </div>

        {/* 7. Role / Badge Banner Rectangle with BG & Custom Width */}
        {config.roleBannerPlacement?.show !== false && (
          <div
            style={{
              top: `${config.roleBannerPlacement?.y ?? 92}%`,
              left: `${config.roleBannerPlacement?.x ?? 50}%`,
              transform: "translate(-50%, -50%)",
              width:
                config.roleBannerPlacement?.styleMode === "full-width"
                  ? "100%"
                  : config.roleBannerPlacement?.widthPct
                  ? `${config.roleBannerPlacement.widthPct}%`
                  : "85%",
            }}
            className="absolute text-center z-10 select-none"
          >
            <div
              style={{
                backgroundColor: config.roleBannerPlacement?.bgColor || (role === "visitor" ? "#087EA4" : "#19A974"),
                color: config.roleBannerPlacement?.textColor || "#FFFFFF",
                fontSize: `${config.roleBannerPlacement?.fontSize || 12}px`,
                paddingTop: `${config.roleBannerPlacement?.paddingY || 7}px`,
                paddingBottom: `${config.roleBannerPlacement?.paddingY || 7}px`,
                borderRadius:
                  config.roleBannerPlacement?.styleMode === "pill"
                    ? "9999px"
                    : config.roleBannerPlacement?.styleMode === "square"
                    ? "0px"
                    : config.roleBannerPlacement?.styleMode === "full-width"
                    ? "0px"
                    : `${config.roleBannerPlacement?.borderRadius ?? 6}px`,
              }}
              className={`font-black uppercase tracking-widest px-4 shadow-md flex items-center justify-center w-full ${
                config.roleBannerPlacement?.styleMode === "full-width" ? "rounded-none" : ""
              }`}
            >
              {config.roleBannerPlacement?.text || (role === "visitor" ? "TRADE VISITOR" : "OFFICIAL EXHIBITOR")}
            </div>
          </div>
        )}

        {/* 8. Custom Text Elements */}
        {(config.customTexts || []).map((ct) => (
          <div
            key={ct.id}
            style={{
              top: `${ct.y}%`,
              left: `${ct.x}%`,
              transform: "translate(-50%, -50%)",
              width: ct.widthPct ? `${ct.widthPct}%` : "auto",
            }}
            className="absolute text-center z-10 select-none"
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
          </div>
        ))}
      </div>

      {/* Action Buttons (Hidden during print) */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2 print:hidden">
        <button
          onClick={handleDownloadBadgeImage}
          disabled={isDownloading}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
        >
          <Download className="w-4 h-4" />
          <span>{isDownloading ? "Generating Pass..." : "Download Pass (PNG Image)"}</span>
        </button>

        <button
          onClick={handlePrint}
          className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-md flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save Pass (PDF)</span>
        </button>
      </div>
    </div>
  );
}
