import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import QRCode from "qrcode";
import sharp from "sharp";
import fs from "fs";
import path from "path";
import { encryptPassToken, generateSecurityChecksum } from "@/lib/passSecurity";

export const dynamic = "force-dynamic";

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
      : `${jobTitle || "Trade Delegate"}${country ? ` · ${country}` : " · Nepal"}`
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
    bgElement = `
      <defs>
        <linearGradient id="cardBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${themeGradStart}"/>
          <stop offset="100%" stop-color="${themeGradEnd}"/>
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#cardBg)"/>
      <rect x="0" y="0" width="${width}" height="140" fill="${role === "exhibitor" ? "#19A974" : role === "gala" ? "#4F46E5" : "#007A5E"}" opacity="0.08"/>
      <text x="${width / 2}" y="70" text-anchor="middle" font-family="'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="800" fill="#007A5E" letter-spacing="2">HIMALAYAN GREEN ENERGY EXPO 2027</text>
      <text x="${width / 2}" y="100" text-anchor="middle" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="600" fill="#64748B" letter-spacing="1">17–19 JANUARY 2027 · BHRIKUTIMANDAP, KATHMANDU</text>
    `;
  }

  // Positioning
  const nameX = ((template?.namePlacement?.x ?? 50) / 100) * width;
  const nameY = ((template?.namePlacement?.y ?? 38) / 100) * height;
  const nameColor = template?.namePlacement?.color || "#061A2A";
  const nameFontSize = (template?.namePlacement?.fontSize || 20) * scale;

  const orgX = ((template?.orgPlacement?.x ?? 50) / 100) * width;
  const orgY = ((template?.orgPlacement?.y ?? 46) / 100) * height;
  const orgColor = template?.orgPlacement?.color || (role === "exhibitor" ? "#19A974" : "#087EA4");
  const orgFontSize = (template?.orgPlacement?.fontSize || 13) * scale;

  const desX = ((template?.designationPlacement?.x ?? 50) / 100) * width;
  const desY = ((template?.designationPlacement?.y ?? 53) / 100) * height;
  const desColor = template?.designationPlacement?.color || "#64748B";
  const desFontSize = (template?.designationPlacement?.fontSize || 11) * scale;

  const qrPixelSize = (template?.qrPlacement?.size || 96) * scale;
  const qrX = ((template?.qrPlacement?.x ?? 50) / 100) * width - qrPixelSize / 2;
  const qrY = ((template?.qrPlacement?.y ?? 70) / 100) * height - qrPixelSize / 2;

  const idX = ((template?.idPlacement?.x ?? 50) / 100) * width;
  const idY = ((template?.idPlacement?.y ?? 83) / 100) * height;
  const idColor = template?.idPlacement?.color || "#061A2A";
  const idFontSize = (template?.idPlacement?.fontSize || 11) * scale;

  // Role Banner
  const banner = template?.roleBannerPlacement || {};
  const defaultBannerText = role === "exhibitor" ? "OFFICIAL EXHIBITOR" : role === "gala" ? "GALA DINNER PASS" : "TRADE VISITOR";
  const bannerText = banner.text || defaultBannerText;
  const bannerBg = banner.bgColor || (role === "exhibitor" ? "#19A974" : role === "gala" ? "#4F46E5" : "#087EA4");
  const bannerColor = banner.textColor || "#FFFFFF";
  const bannerY = ((banner.y ?? 92) / 100) * height;

  const svg = `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <clipPath id="badgeClip">
      <rect width="${width}" height="${height}" rx="28" />
    </clipPath>
    <g clip-path="url(#badgeClip)">
      ${bgElement}

      <!-- Top Lanyard Slot Punch Hole -->
      <rect x="${width / 2 - 50}" y="14" width="100" height="14" rx="7" fill="#0F172A" opacity="0.35"/>

      <!-- Attendee Name -->
      <text x="${nameX}" y="${nameY}" text-anchor="middle" dominant-baseline="middle" font-family="'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif" font-size="${nameFontSize}" font-weight="bold" fill="${nameColor}">${safeName}</text>

      <!-- Organization -->
      <text x="${orgX}" y="${orgY}" text-anchor="middle" dominant-baseline="middle" font-family="'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif" font-size="${orgFontSize}" font-weight="bold" fill="${orgColor}">${safeOrg}</text>

      <!-- Designation or Stall -->
      <text x="${desX}" y="${desY}" text-anchor="middle" dominant-baseline="middle" font-family="'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif" font-size="${desFontSize}" font-weight="500" fill="${desColor}">${safeDes}</text>

      <!-- QR Code Container Box -->
      <rect x="${qrX - 10}" y="${qrY - 10}" width="${qrPixelSize + 20}" height="${qrPixelSize + 20}" rx="16" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="2"/>
      <!-- QR Image -->
      <image x="${qrX}" y="${qrY}" width="${qrPixelSize}" height="${qrPixelSize}" href="data:image/png;base64,${qrBase64}"/>

      <!-- Pass ID & Security Fingerprint -->
      <text x="${idX}" y="${idY}" text-anchor="middle" dominant-baseline="middle" font-family="'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, monospace" font-size="${idFontSize}" font-weight="bold" fill="${idColor}">ID: ${safeId}${safeChecksum ? ` · SEC: ${safeChecksum}` : ""}</text>

      <!-- Role Bottom Banner -->
      <rect x="0" y="${bannerY - 26}" width="${width}" height="${52}" fill="${bannerBg}"/>
      <text x="${width / 2}" y="${bannerY}" text-anchor="middle" dominant-baseline="middle" font-family="'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif" font-size="22" font-weight="900" fill="${bannerColor}" letter-spacing="3">${escapeXml(bannerText.toUpperCase())}</text>
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
  const { name, organization, jobTitle, stallNumber, phone, passId, securityChecksum, passType, role, qrTargetUrl } = opts;
  const isExhibitor = role === "exhibitor";
  const isGala = role === "gala";
  const headerBg = isExhibitor ? "#064e3b" : isGala ? "#2e1065" : "#04281E";
  const accent = isExhibitor ? "#10b981" : isGala ? "#a78bfa" : "#12B981";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Your Official Entry Pass — Himalayan Green Energy Expo 2027</title>
</head>
<body style="margin:0;padding:0;background:#eef2f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#eef2f6;padding:36px 12px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.08);border:1px solid #e2e8f0;">
          
          <!-- Event Header -->
          <tr>
            <td style="background:${headerBg};padding:32px 36px 26px;text-align:center;">
              <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.2em;color:${accent};font-weight:800;text-transform:uppercase;">IPPAN · OFFICIAL ACCREDITATION</p>
              <h1 style="margin:0;font-size:24px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;line-height:1.2;">Himalayan Green Energy Expo</h1>
              <p style="margin:4px 0 0;font-size:14px;color:#94a3b8;font-weight:500;">5th Edition · 17–19 January 2027 (Magh 3–5, 2083)</p>
              <p style="margin:4px 0 0;font-size:12px;color:#cbd5e1;">Bhrikutimandap Exhibition Hall, Kathmandu, Nepal</p>
            </td>
          </tr>

          <!-- Success Banner -->
          <tr>
            <td style="background:#f0fdf4;border-bottom:1px solid #bbf7d0;padding:16px 24px;text-align:center;">
              <p style="margin:0;font-size:14px;font-weight:700;color:#15803d;">
                ✓ Registration Confirmed &amp; Official Pass Issued
              </p>
              <p style="margin:4px 0 0;font-size:12px;color:#166534;">
                Dear <strong>${escapeXml(name)}</strong>, your digital badge and entrance QR code are ready below.
              </p>
            </td>
          </tr>

          <!-- Primary Badge Showcase -->
          <tr>
            <td style="padding:32px 24px 20px;text-align:center;background:#ffffff;">
              <p style="margin:0 0 16px;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#64748b;">
                Official Digital Badge &amp; Gate Pass
              </p>
              
              <!-- Badge Image (embedded via CID) -->
              <div style="display:inline-block;border-radius:16px;box-shadow:0 12px 35px rgba(0,0,0,0.15);overflow:hidden;border:1px solid #cbd5e1;background:#ffffff;">
                <img src="cid:pass_badge_image" width="320" alt="Official Pass Badge" style="display:block;width:320px;max-width:100%;height:auto;margin:0 auto;border:0;outline:none;" />
              </div>

              <p style="margin:16px auto 0;max-width:420px;font-size:12px;color:#64748b;line-height:1.5;">
                📎 <strong>Badge attached:</strong> The high-resolution pass is also attached to this email as <code>Official-Pass-Badge.png</code> so you can save it to your phone photos or print it.
              </p>
            </td>
          </tr>

          <!-- Standalone High-Speed Entry QR Code Section -->
          <tr>
            <td style="padding:0 24px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:2px dashed #cbd5e1;border-radius:14px;padding:22px;text-align:center;">
                <tr>
                  <td align="center">
                    <p style="margin:0 0 8px;font-size:11px;font-weight:800;letter-spacing:0.15em;text-transform:uppercase;color:#007A5E;">
                      Fast-Track Gate Scan QR
                    </p>

                    <!-- Attendee Name & Role Banner -->
                    <p style="margin:0 0 2px;font-size:17px;font-weight:800;color:#0f172a;">
                      ${escapeXml(name)}
                    </p>
                    <p style="margin:0 0 2px;font-size:13px;font-weight:600;color:#087EA4;">
                      ${escapeXml(organization)}
                    </p>
                    <p style="margin:0 0 4px;font-size:12px;font-family:monospace;font-weight:700;color:#64748b;">
                      ID: <span style="color:#007A5E;">${escapeXml(passId)}</span> · ${escapeXml(passType)}
                    </p>
                    <p style="margin:0 0 12px;font-size:11px;font-family:monospace;font-weight:600;color:#15803d;">
                      🔒 SEC CODE: <span style="background:#dcfce7;color:#166534;padding:2px 8px;border-radius:4px;border:1px solid #86efac;">${escapeXml(securityChecksum)}</span> (Anti-Counterfeit)
                    </p>

                    <!-- QR Image Box -->
                    <div style="display:inline-block;background:#ffffff;padding:12px;border-radius:14px;border:1px solid #e2e8f0;box-shadow:0 4px 12px rgba(0,0,0,0.06);">
                      <a href="${qrTargetUrl}" target="_blank" style="display:block;text-decoration:none;">
                        <img src="cid:pass_qr_code" width="160" height="160" alt="Entry QR" style="display:block;width:160px;height:160px;margin:0 auto;border:0;" />
                      </a>
                    </div>

                    <!-- Direct Open Pass & Save to Phone Button -->
                    <div style="margin-top:14px;">
                      <a href="${qrTargetUrl}" target="_blank" style="display:inline-block;background:#007A5E;color:#ffffff;text-decoration:none;font-size:13px;font-weight:700;padding:11px 22px;border-radius:10px;box-shadow:0 3px 8px rgba(0,122,94,0.3);">
                        📱 Open Digital Pass &amp; Save to Phone &rarr;
                      </a>
                    </div>

                    <p style="margin:10px 0 0;font-size:11px;color:#64748b;max-width:380px;line-height:1.4;">
                      Scan this encrypted QR code with your phone camera or tap the button above to view your verified credentials and save the contact / pass badge to your phone.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Attendee Information Card -->
          <tr>
            <td style="padding:0 24px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
                <tr style="background:#f8fafc;">
                  <td colspan="2" style="padding:12px 18px;border-bottom:1px solid #e2e8f0;">
                    <p style="margin:0;font-size:12px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:#334155;">Accreditation Details</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 18px;border-bottom:1px solid #f1f5f9;width:38%;font-size:12px;color:#64748b;font-weight:600;">Attendee Name</td>
                  <td style="padding:12px 18px;border-bottom:1px solid #f1f5f9;font-size:14px;color:#0f172a;font-weight:700;">${escapeXml(name)}</td>
                </tr>
                <tr>
                  <td style="padding:12px 18px;border-bottom:1px solid #f1f5f9;font-size:12px;color:#64748b;font-weight:600;">Pass ID</td>
                  <td style="padding:12px 18px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#007A5E;font-family:monospace;font-weight:700;">${escapeXml(passId)}</td>
                </tr>
                <tr>
                  <td style="padding:12px 18px;border-bottom:1px solid #f1f5f9;font-size:12px;color:#64748b;font-weight:600;">Security Code</td>
                  <td style="padding:12px 18px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#15803d;font-family:monospace;font-weight:700;">${escapeXml(securityChecksum)}</td>
                </tr>
                <tr>
                  <td style="padding:12px 18px;border-bottom:1px solid #f1f5f9;font-size:12px;color:#64748b;font-weight:600;">Organization</td>
                  <td style="padding:12px 18px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#1e293b;font-weight:600;">${escapeXml(organization)}</td>
                </tr>
                ${jobTitle ? `
                <tr>
                  <td style="padding:12px 18px;border-bottom:1px solid #f1f5f9;font-size:12px;color:#64748b;font-weight:600;">Designation</td>
                  <td style="padding:12px 18px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#1e293b;">${escapeXml(jobTitle)}</td>
                </tr>` : ""}
                ${phone ? `
                <tr>
                  <td style="padding:12px 18px;border-bottom:1px solid #f1f5f9;font-size:12px;color:#64748b;font-weight:600;">Phone</td>
                  <td style="padding:12px 18px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#1e293b;">${escapeXml(phone)}</td>
                </tr>` : ""}
                ${stallNumber ? `
                <tr>
                  <td style="padding:12px 18px;border-bottom:1px solid #f1f5f9;font-size:12px;color:#64748b;font-weight:600;">Stall / Booth</td>
                  <td style="padding:12px 18px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#19A974;font-weight:700;">${escapeXml(stallNumber)}</td>
                </tr>` : ""}
                <tr>
                  <td style="padding:12px 18px;font-size:12px;color:#64748b;font-weight:600;">Pass Category</td>
                  <td style="padding:12px 18px;font-size:13px;color:#1e293b;font-weight:600;">${escapeXml(passType)}</td>
                </tr>
              </table>
            </td>
          </tr>
                  <td style="padding:12px 18px;font-size:13px;color:#1e293b;font-weight:600;">${escapeXml(passType)}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Entry Instructions -->
          <tr>
            <td style="padding:0 24px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:18px 20px;">
                <tr>
                  <td>
                    <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#15803d;">📋 Important Instructions for Expo Entry</p>
                    <ul style="margin:0;padding-left:18px;font-size:12px;color:#166534;line-height:1.8;">
                      <li>Present either this email, the attached badge PNG, or printout at the main entrance gate.</li>
                      <li>Gate personnel will scan your QR code for rapid contactless accreditation.</li>
                      <li>Please carry a valid government-issued photo ID or company business card.</li>
                      <li>For questions or assistance, contact <a href="mailto:info@eventsolutionnepal.com.np" style="color:#007A5E;font-weight:700;text-decoration:none;">info@eventsolutionnepal.com.np</a>.</li>
                    </ul>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Event Footer -->
          <tr>
            <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:22px 28px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#64748b;font-weight:600;">
                Himalayan Green Energy Expo 2027
              </p>
              <p style="margin:4px 0 0;font-size:11px;color:#94a3b8;">
                Jointly organized by Independent Power Producers&apos; Association, Nepal (IPPAN) &amp; Event Solution Pvt. Ltd.
              </p>
              <p style="margin:8px 0 0;font-size:10px;color:#cbd5e1;">
                This is an automated credential delivery. Please do not reply directly to this email.
              </p>
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

    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: email,
      subject: "Your Official Entry Pass | Himalayan Green Energy Expo 2027",
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
