import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import QRCode from "qrcode";
import sharp from "sharp";
import fs from "fs";
import path from "path";
import * as opentype from "opentype.js";
import { encryptPassToken, generateSecurityChecksum } from "@/lib/passSecurity";
import { getEmbeddedFont, NOTO_SANS_BASE64 } from "@/lib/badgeFont";

export const dynamic = "force-dynamic";

function getFont(): opentype.Font | null {
  return getEmbeddedFont();
}

function renderTextToPath(opts: {
  text: string;
  cx: number;
  cy: number;
  fontSize: number;
  fill: string;
  isBold?: boolean;
  maxWidth?: number;
  fallbackSvg: string;
}): string {
  const { text, cx, cy, fill, isBold = false, maxWidth = 540, fallbackSvg } = opts;
  const font = getFont();
  if (!font || !text) {
    return fallbackSvg;
  }

  // Replace non-ASCII / special bullet characters to guarantee valid vector paths
  const clean = text.replace(/[·•]/g, "|").replace(/[^\x20-\x7E]/g, "").trim();
  if (!clean) return fallbackSvg;

  try {
    let currentFontSize = opts.fontSize;
    let textWidth = font.getAdvanceWidth(clean, currentFontSize);
    if (textWidth > maxWidth && maxWidth > 0) {
      currentFontSize = Math.floor((maxWidth / textWidth) * currentFontSize);
      textWidth = font.getAdvanceWidth(clean, currentFontSize);
    }

    const x = cx - textWidth / 2;
    // Optical baseline center: baseline sits approx 0.35 * fontSize below center
    const y = cy + currentFontSize * 0.35;
    const p = font.getPath(clean, x, y, currentFontSize);
    const d = p.toPathData(2);
    const strokeAttr = isBold
      ? `stroke="${fill}" stroke-width="${Math.max(0.6, currentFontSize * 0.045).toFixed(1)}" stroke-linejoin="round"`
      : "";

    return `<path d="${d}" fill="${fill}" ${strokeAttr} />`;
  } catch (err) {
    console.warn("[send-pass] Failed to generate path for text:", text, err);
    return fallbackSvg;
  }
}

function escapeXml(unsafe: string): string {
  if (!unsafe) return "";
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "&": return "&amp;";
      case "'": return "&apos;";
      case '"': return "&quot;";
      default: return c;
    }
  });
}

function createTransporter() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || 465);
  const secure = process.env.SMTP_SECURE === "true" || port === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

function loadBadgeTemplate(role: string) {
  try {
    const rootPath = path.join(process.cwd(), "data", "badgeTemplates.json");
    const srcPath = path.join(process.cwd(), "src", "data", "badgeTemplates.json");
    let jsonStr = "";
    if (fs.existsSync(rootPath)) {
      jsonStr = fs.readFileSync(rootPath, "utf-8");
    } else if (fs.existsSync(srcPath)) {
      jsonStr = fs.readFileSync(srcPath, "utf-8");
    }

    if (jsonStr) {
      const data = JSON.parse(jsonStr);
      if (role === "exhibitor" && data.exhibitor) return data.exhibitor;
      if (data.visitor) return data.visitor;
    }
  } catch (e) {
    console.warn("[send-pass] Could not read badgeTemplates.json:", e);
  }
  return null;
}

async function generateBadgePng(opts: {
  name: string;
  organization: string;
  jobTitle?: string;
  stallNumber?: string;
  country?: string;
  passId: string;
  securityChecksum?: string;
  role: string;
  qrPngBuffer: Buffer;
}): Promise<Buffer> {
  const { name, organization, jobTitle, stallNumber, country, passId, securityChecksum, role, qrPngBuffer } = opts;
  const template = loadBadgeTemplate(role);

  const width = 640;
  const height = 960;
  const scale = 2;

  const qrBase64 = qrPngBuffer.toString("base64");

  const safeName = escapeXml(name || "Registered Delegate");
  const safeOrg = escapeXml(organization || "Himalayan Green Energy Expo");
  const safeDes = escapeXml(
    role === "exhibitor"
      ? (stallNumber ? `STALL: ${stallNumber}` : "MAIN EXHIBITION HALL")
      : `${jobTitle || "Trade Delegate"}${country ? ` | ${country}` : " | Nepal"}`
  );
  const safeId = escapeXml(passId);
  const safeChecksum = escapeXml(securityChecksum || "");

  // Background handling
  let bgElement = "";
  if (template?.bgImage && template.bgImage.startsWith("data:image")) {
    bgElement = `<image width="${width}" height="${height}" preserveAspectRatio="none" href="${template.bgImage}"/>`;
  } else {
    const themeGradStart = "#FFFFFF";
    const themeGradEnd = role === "exhibitor" ? "#F0FDF4" : role === "gala" ? "#FAF5FF" : "#F0F9FF";
    const headerTitle1 = renderTextToPath({
      text: "HIMALAYAN GREEN ENERGY EXPO 2027",
      cx: width / 2,
      cy: 70,
      fontSize: 20,
      fill: "#007A5E",
      isBold: true,
      maxWidth: 580,
      fallbackSvg: `<text x="${width / 2}" y="70" text-anchor="middle" font-family="'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="800" fill="#007A5E" letter-spacing="2">HIMALAYAN GREEN ENERGY EXPO 2027</text>`
    });
    const headerTitle2 = renderTextToPath({
      text: "17-19 JANUARY 2027 | BHRIKUTIMANDAP, KATHMANDU",
      cx: width / 2,
      cy: 100,
      fontSize: 14,
      fill: "#64748B",
      isBold: false,
      maxWidth: 580,
      fallbackSvg: `<text x="${width / 2}" y="100" text-anchor="middle" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="600" fill="#64748B" letter-spacing="1">17–19 JANUARY 2027 · BHRIKUTIMANDAP, KATHMANDU</text>`
    });
    bgElement = `
      <defs>
        <linearGradient id="cardBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${themeGradStart}"/>
          <stop offset="100%" stop-color="${themeGradEnd}"/>
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#cardBg)"/>
      <rect x="0" y="0" width="${width}" height="140" fill="${role === "exhibitor" ? "#19A974" : role === "gala" ? "#4F46E5" : "#007A5E"}" opacity="0.08"/>
      ${headerTitle1}
      ${headerTitle2}
    `;
  }

  // Positioning
  const nameX = ((template?.namePlacement?.x ?? 50) / 100) * width;
  const nameY = ((template?.namePlacement?.y ?? 50) / 100) * height;
  const nameColor = template?.namePlacement?.color || "#061A2A";
  const nameFontSize = (template?.namePlacement?.fontSize || 18) * scale;

  const orgX = ((template?.orgPlacement?.x ?? 50) / 100) * width;
  const orgY = 742;
  const orgColor = template?.orgPlacement?.color || (role === "exhibitor" ? "#19A974" : "#007A5E");
  const orgFontSize = (template?.orgPlacement?.fontSize || 12) * scale;

  const desPlacement = template?.designationPlacement || template?.stallPlacement;
  const desX = ((desPlacement?.x ?? 50) / 100) * width;
  const desY = 774;
  const desColor = desPlacement?.color || "#334155";
  const desFontSize = (desPlacement?.fontSize || 9) * scale;

  const qrPixelSize = (template?.qrPlacement?.size || 96) * scale;
  const qrX = ((template?.qrPlacement?.x ?? 50) / 100) * width - qrPixelSize / 2;
  const qrY = ((template?.qrPlacement?.y ?? 65) / 100) * height - qrPixelSize / 2;

  const idX = ((template?.idPlacement?.x ?? 50) / 100) * width;
  const idY = 805;
  const idColor = "#475569";
  const idFontSize = (template?.idPlacement?.fontSize || 7) * scale;

  // Role Banner
  const banner = template?.roleBannerPlacement || {};
  let defaultBannerText = role === "exhibitor" ? "OFFICIAL EXHIBITOR" : role === "gala" ? "GALA DINNER PASS" : role === "delegate" ? "OFFICIAL DELEGATE" : "TRADE VISITOR";
  let bannerText = banner.text || defaultBannerText;
  if (bannerText.toLowerCase() === "visitor") {
    bannerText = "TRADE VISITOR";
  }
  const bannerBg = banner.bgColor || (role === "exhibitor" ? "#19A974" : role === "gala" ? "#4F46E5" : "#007A5E");
  const bannerColor = banner.textColor || "#FFFFFF";
  const bannerY = 882;
  const bannerHeight = 80;
  const bannerTop = 842;

  // Render text elements into vector paths to avoid missing fonts (tofu □ boxes) on Linux/Vercel
  const rawName = name || "Registered Delegate";
  const rawOrg = organization || "Himalayan Green Energy Expo";
  const rawDes = role === "exhibitor"
    ? (stallNumber ? `STALL: ${stallNumber}` : "MAIN EXHIBITION HALL")
    : `${jobTitle || "Trade Delegate"}${country ? ` | ${country}` : " | Nepal"}`;
  const rawIdText = `ID: ${passId}${securityChecksum ? ` | SEC: ${securityChecksum}` : ""}`;

  const nameSvg = renderTextToPath({
    text: rawName,
    cx: nameX,
    cy: nameY,
    fontSize: nameFontSize,
    fill: nameColor,
    isBold: true,
    maxWidth: 520,
    fallbackSvg: `<text x="${nameX}" y="${nameY}" text-anchor="middle" dominant-baseline="middle" font-family="'NotoSansEmbedded', 'Segoe UI', -apple-system, sans-serif" font-size="${nameFontSize}" font-weight="bold" fill="${nameColor}">${safeName}</text>`,
  });

  const orgSvg = renderTextToPath({
    text: rawOrg,
    cx: orgX,
    cy: orgY,
    fontSize: orgFontSize,
    fill: orgColor,
    isBold: true,
    maxWidth: 520,
    fallbackSvg: `<text x="${orgX}" y="${orgY}" text-anchor="middle" dominant-baseline="middle" font-family="'NotoSansEmbedded', 'Segoe UI', -apple-system, sans-serif" font-size="${orgFontSize}" font-weight="bold" fill="${orgColor}">${safeOrg}</text>`,
  });

  const desSvg = renderTextToPath({
    text: rawDes,
    cx: desX,
    cy: desY,
    fontSize: desFontSize,
    fill: desColor,
    isBold: false,
    maxWidth: 520,
    fallbackSvg: `<text x="${desX}" y="${desY}" text-anchor="middle" dominant-baseline="middle" font-family="'NotoSansEmbedded', 'Segoe UI', -apple-system, sans-serif" font-size="${desFontSize}" font-weight="500" fill="${desColor}">${safeDes}</text>`,
  });

  const idSvg = renderTextToPath({
    text: rawIdText,
    cx: idX,
    cy: idY,
    fontSize: idFontSize,
    fill: idColor,
    isBold: true,
    maxWidth: 500,
    fallbackSvg: `<text x="${idX}" y="${idY}" text-anchor="middle" dominant-baseline="middle" font-family="'NotoSansEmbedded', 'Segoe UI', monospace" font-size="${idFontSize}" font-weight="bold" fill="${idColor}">${escapeXml(rawIdText)}</text>`,
  });

  const bannerSvg = renderTextToPath({
    text: bannerText.toUpperCase(),
    cx: width / 2,
    cy: bannerY,
    fontSize: 22,
    fill: bannerColor,
    isBold: true,
    maxWidth: 520,
    fallbackSvg: `<text x="${width / 2}" y="${bannerY}" text-anchor="middle" dominant-baseline="middle" font-family="'NotoSansEmbedded', 'Segoe UI', -apple-system, sans-serif" font-size="22" font-weight="900" fill="${bannerColor}" letter-spacing="3">${escapeXml(bannerText.toUpperCase())}</text>`,
  });

  const svg = `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <style>
        @font-face {
          font-family: 'NotoSansEmbedded';
          src: url('data:font/truetype;charset=utf-8;base64,${NOTO_SANS_BASE64}') format('truetype');
          font-weight: normal;
          font-style: normal;
        }
        text {
          font-family: 'NotoSansEmbedded', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
      </style>
      <clipPath id="badgeClip">
        <rect width="${width}" height="${height}" rx="28" />
      </clipPath>
    </defs>
    <g clip-path="url(#badgeClip)">
      ${bgElement}

      <!-- Top Lanyard Slot Punch Hole -->
      <rect x="${width / 2 - 50}" y="14" width="100" height="14" rx="7" fill="#0F172A" opacity="0.35"/>

      <!-- Attendee Name -->
      ${nameSvg}

      <!-- QR Code Container Box -->
      <rect x="${qrX - 10}" y="${qrY - 10}" width="${qrPixelSize + 20}" height="${qrPixelSize + 20}" rx="16" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="2"/>
      <!-- QR Image -->
      <image x="${qrX}" y="${qrY}" width="${qrPixelSize}" height="${qrPixelSize}" href="data:image/png;base64,${qrBase64}"/>

      <!-- Organization -->
      ${orgSvg}

      <!-- Designation or Stall -->
      ${desSvg}

      <!-- Pass ID & Security Fingerprint -->
      ${idSvg}

      <!-- Role Bottom Banner -->
      <rect x="0" y="${bannerTop}" width="${width}" height="${bannerHeight}" fill="${bannerBg}"/>
      ${bannerSvg}
    </g>
    <!-- Outer Card Border -->
    <rect width="${width}" height="${height}" rx="28" fill="none" stroke="#CBD5E1" stroke-width="3"/>
  </svg>
  `;

  return await sharp(Buffer.from(svg)).png().toBuffer();
}

function buildEmailHtml(opts: {
  name: string;
  organization: string;
  jobTitle?: string;
  stallNumber?: string;
  phone?: string;
  passId: string;
  securityChecksum: string;
  passType: string;
  role: string;
  qrTargetUrl: string;
}) {
  const { name, organization, jobTitle, stallNumber, passId, securityChecksum, passType, role, qrTargetUrl } = opts;
  const isExhibitor = role === "exhibitor";
  const badgeColor = isExhibitor ? "#065f46" : "#0f172a";
  const badgeBg = isExhibitor ? "#ecfdf5" : "#f1f5f9";
  const badgeBorder = isExhibitor ? "#a7f3d0" : "#e2e8f0";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Your Official Entry Pass — Himalayan Green Energy Expo 2027</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;color:#1e293b;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8;padding:36px 12px;">
    <tr>
      <td align="center">
        <table width="580" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 4px 20px rgba(0,0,0,0.04);">
          
          <!-- Minimal Brand Header -->
          <tr>
            <td style="background-color:#04281E;padding:28px 32px;text-align:center;">
              <div style="font-size:11px;font-weight:700;color:#10b981;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:6px;">
                Himalayan Green Energy Expo 2027
              </div>
              <h1 style="margin:0;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.3px;">
                Official Entry Accreditation
              </h1>
              <div style="margin-top:6px;font-size:13px;color:#94a3b8;">
                17–19 January 2027 &bull; Bhrikutimandap Exhibition Hall, Kathmandu
              </div>
            </td>
          </tr>

          <!-- Greeting Body -->
          <tr>
            <td style="padding:28px 32px 16px;">
              <p style="margin:0 0 12px;font-size:15px;color:#0f172a;line-height:1.6;">
                Dear <strong>${escapeXml(name)}</strong>,
              </p>
              <p style="margin:0;font-size:14px;color:#475569;line-height:1.6;">
                Your registration for the <strong>Himalayan Green Energy Expo 2027</strong> is confirmed. Below is your official digital entry pass and rapid gate admission QR code.
              </p>
            </td>
          </tr>

          <!-- Primary Scannable Pass Ticket -->
          <tr>
            <td style="padding:0 32px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:24px 20px;text-align:center;">
                <tr>
                  <td align="center">
                    
                    <!-- Role Pill Badge -->
                    <div style="display:inline-block;padding:4px 14px;background-color:${badgeBg};color:${badgeColor};border:1px solid ${badgeBorder};border-radius:20px;font-size:11px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;margin-bottom:12px;">
                      ${escapeXml(passType)}
                    </div>

                    <!-- Attendee Name & Org -->
                    <div style="font-size:20px;font-weight:800;color:#0f172a;letter-spacing:-0.3px;margin-bottom:4px;">
                      ${escapeXml(name)}
                    </div>
                    <div style="font-size:13px;color:#475569;font-weight:600;margin-bottom:16px;">
                      ${escapeXml(organization)}${jobTitle ? ` &bull; ${escapeXml(jobTitle)}` : ""}
                    </div>

                    <!-- Scannable QR Code -->
                    <div style="display:inline-block;background-color:#ffffff;padding:12px;border-radius:12px;border:1px solid #e2e8f0;box-shadow:0 2px 8px rgba(0,0,0,0.04);">
                      <a href="${qrTargetUrl}" target="_blank" style="display:block;text-decoration:none;">
                        <img src="cid:pass_qr_code" width="160" height="160" alt="Gate Admission QR" style="display:block;width:160px;height:160px;margin:0 auto;border:0;" />
                      </a>
                    </div>

                    <!-- Pass ID & Security Code -->
                    <div style="margin-top:12px;font-family:monospace;font-size:12px;color:#475569;font-weight:600;">
                      <span>ID: <strong>${escapeXml(passId)}</strong></span>
                      <span style="color:#cbd5e1;margin:0 6px;">&bull;</span>
                      <span>SEC: <strong style="color:#047857;">${escapeXml(securityChecksum)}</strong></span>
                    </div>

                    <!-- Action Button -->
                    <div style="margin-top:16px;">
                      <a href="${qrTargetUrl}" target="_blank" style="display:inline-block;background-color:#04281E;color:#ffffff;text-decoration:none;font-size:13px;font-weight:700;padding:11px 26px;border-radius:8px;box-shadow:0 2px 6px rgba(4,40,30,0.25);">
                        View Digital Pass &rarr;
                      </a>
                    </div>

                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Structured Details Table -->
          <tr>
            <td style="padding:0 32px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;font-size:13px;">
                <tr style="background-color:#f8fafc;">
                  <td colspan="2" style="padding:10px 16px;border-bottom:1px solid #e2e8f0;font-size:11px;font-weight:700;color:#64748b;letter-spacing:0.5px;text-transform:uppercase;">
                    Credential Summary
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 16px;border-bottom:1px solid #f1f5f9;color:#64748b;width:38%;">Attendee</td>
                  <td style="padding:10px 16px;border-bottom:1px solid #f1f5f9;color:#0f172a;font-weight:600;">${escapeXml(name)}</td>
                </tr>
                <tr>
                  <td style="padding:10px 16px;border-bottom:1px solid #f1f5f9;color:#64748b;">Organization</td>
                  <td style="padding:10px 16px;border-bottom:1px solid #f1f5f9;color:#0f172a;">${escapeXml(organization)}</td>
                </tr>
                ${stallNumber ? `
                <tr>
                  <td style="padding:10px 16px;border-bottom:1px solid #f1f5f9;color:#64748b;">Stall / Booth</td>
                  <td style="padding:10px 16px;border-bottom:1px solid #f1f5f9;color:#047857;font-weight:700;">${escapeXml(stallNumber)}</td>
                </tr>` : ""}
                <tr>
                  <td style="padding:10px 16px;border-bottom:1px solid #f1f5f9;color:#64748b;">Dates</td>
                  <td style="padding:10px 16px;border-bottom:1px solid #f1f5f9;color:#0f172a;">17–19 January 2027 (10:00 AM – 6:00 PM)</td>
                </tr>
                <tr>
                  <td style="padding:10px 16px;color:#64748b;">Venue</td>
                  <td style="padding:10px 16px;color:#0f172a;">Bhrikutimandap Exhibition Hall, Kathmandu</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Quick Gate Guidelines (Clean, Minimal, No Clutter) -->
          <tr>
            <td style="padding:0 32px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;border-radius:12px;padding:16px 20px;border:1px solid #e2e8f0;">
                <tr>
                  <td>
                    <div style="font-size:12px;font-weight:700;color:#0f172a;margin-bottom:8px;">
                      Important Gate Instructions
                    </div>
                    <ul style="margin:0;padding-left:18px;font-size:12px;color:#475569;line-height:1.7;">
                      <li>Present the QR code above on your mobile phone at any designated entrance.</li>
                      <li>Your official pass badge (<code>Official-Pass-Badge.png</code>) is attached to this email for offline saving or printing.</li>
                      <li>Please carry a valid government-issued photo ID or business card.</li>
                    </ul>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Executive Footer -->
          <tr>
            <td style="background-color:#f8fafc;border-top:1px solid #e2e8f0;padding:22px 32px;text-align:center;">
              <div style="font-size:12px;font-weight:700;color:#334155;">
                Organizing Secretariat &bull; Himalayan Green Energy Expo 2027
              </div>
              <div style="margin-top:4px;font-size:12px;color:#64748b;">
                Inquiries: <a href="mailto:info@eventsolutionnepal.com.np" style="color:#047857;text-decoration:none;font-weight:600;">info@eventsolutionnepal.com.np</a> &bull; +977-9703606348
              </div>
              <div style="margin-top:8px;font-size:11px;color:#94a3b8;">
                This is an automated credential delivery. Please do not reply directly to this message.
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, organization, jobTitle, stallNumber, country, phone, passId, passType, role } = body;

    if (!email || !name || !passId) {
      return NextResponse.json(
        { success: false, message: "Missing required fields: email, name, or passId." },
        { status: 400 }
      );
    }

    const resolvedRole = role || "visitor";

    // Determine public or request URL dynamically
    const reqHost = req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
    const reqProto = req.headers.get("x-forwarded-proto") || (reqHost.includes("localhost") ? "http" : "https");
    let appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
    if (!appUrl || (appUrl.includes("localhost") && reqHost && !reqHost.includes("localhost"))) {
      appUrl = `${reqProto}://${reqHost}`;
    }
    if (!appUrl) {
      appUrl = reqHost ? `${reqProto}://${reqHost}` : "https://greenenergyexpo.org.np";
    }

    const securityChecksum = generateSecurityChecksum(passId);

    // Cryptographically encrypt pass data using AES-256-GCM
    // Prevents ID enumeration, ticket forging, tampering, or duplication
    const secureToken = encryptPassToken({
      id: passId,
      name,
      organization: organization || "Himalayan Green Energy Expo",
      jobTitle,
      stallNumber,
      phone,
      email,
      country: country || "Nepal",
      passType: passType || (resolvedRole === "exhibitor" ? "Official Exhibitor Pass" : "Trade Visitor Pass"),
      role: resolvedRole,
      iat: Date.now(),
    });

    const qrTargetUrl = `${appUrl}/verify?token=${secureToken}`;

    // 1. Generate standalone high-res QR PNG Buffer
    const qrDataUrl = await QRCode.toDataURL(qrTargetUrl, {
      width: 320,
      margin: 1,
      errorCorrectionLevel: "H",
      color: { dark: "#061A2A", light: "#FFFFFF" },
    });
    const qrPngBuffer = Buffer.from(qrDataUrl.replace(/^data:image\/png;base64,/, ""), "base64");

    // 2. Generate the EXACT full physical ID Card Badge as a PNG Buffer
    let badgePngBuffer: Buffer;
    try {
      badgePngBuffer = await generateBadgePng({
        name,
        organization: organization || "Himalayan Green Energy Expo",
        jobTitle,
        stallNumber,
        country: country || "Nepal",
        passId,
        securityChecksum,
        role: resolvedRole,
        qrPngBuffer,
      });
    } catch (badgeErr) {
      console.error("[send-pass] Error generating badge PNG, falling back to QR image:", badgeErr);
      badgePngBuffer = qrPngBuffer;
    }

    // 3. Build Email HTML
    const html = buildEmailHtml({
      name,
      organization: organization || "Himalayan Green Energy Expo",
      jobTitle,
      stallNumber,
      phone,
      passId,
      securityChecksum,
      passType: passType || "Trade Visitor Pass",
      role: resolvedRole,
      qrTargetUrl,
    });

    // 4. Send Email with both inline CID embeddings & user-accessible attachments
    const transporter = createTransporter();
    const fromName = process.env.SMTP_FROM_NAME || "Himalayan Green Energy Expo 2027";
    const fromEmail = process.env.SMTP_USER;

    const textFallback = `
Official Entry Pass — Himalayan Green Energy Expo 2027
17–19 January 2027 · Bhrikutimandap Exhibition Hall, Kathmandu, Nepal

Dear ${name},

Your registration has been confirmed. Below are your accreditation details:

• Attendee: ${name}
• Organization: ${organization || "Himalayan Green Energy Expo"}
• Pass Category: ${passType || "Trade Visitor Pass"}
• Pass ID: ${passId}
• Security Code: ${securityChecksum}
${stallNumber ? `• Stall / Booth: ${stallNumber}\n` : ""}• Venue: Bhrikutimandap Exhibition Hall, Kathmandu
• Dates: 17–19 January 2027 (10:00 AM – 6:00 PM)

Digital Pass Link: ${qrTargetUrl}

Please present your QR code or the attached official pass badge at the entrance gate for fast-track entry.

Organizing Secretariat · Himalayan Green Energy Expo 2027
Inquiries: info@eventsolutionnepal.com.np
    `.trim();

    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: email,
      subject: "Your Official Entry Pass | Himalayan Green Energy Expo 2027",
      text: textFallback,
      html,
      attachments: [
        {
          filename: "Official-Pass-Badge.png",
          content: badgePngBuffer,
          cid: "pass_badge_image",
          contentType: "image/png",
        },
        {
          filename: "Official-Entry-QR.png",
          content: qrPngBuffer,
          cid: "pass_qr_code",
          contentType: "image/png",
        },
      ],
    });

    return NextResponse.json({
      success: true,
      message: "Pass badge and QR sent successfully to email.",
    });
  } catch (err: any) {
    console.error("[send-pass] Email error:", err?.message || err);
    return NextResponse.json(
      {
        success: false,
        message: err?.message || "Failed to send pass email. Please verify SMTP settings.",
      },
      { status: 500 }
    );
  }
}
