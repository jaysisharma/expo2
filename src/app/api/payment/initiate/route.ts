import { NextResponse } from "next/server";
import { initializeKhaltiPayment } from "@/lib/khalti";
import nodemailer from "nodemailer";
import fs from "fs/promises";
import path from "path";

import { Resend } from "resend";
import {
  setFirebaseBoothOverride,
  setFirebaseSponsorshipHold,
  addFirebaseInquiry,
  getFirebaseFloorPlan,
  saveFirebaseFloorPlan,
} from "@/lib/firebaseDb";
import { attributionFields } from "@/lib/attribution";
import { resolveNewOrderId, saveStallBooking } from "@/lib/orders";
import { quoteBookingOnServer } from "@/lib/stallPricingServer";

export const dynamic = "force-dynamic";

const ROOT_ADMIN_DATA_PATH = path.join(process.cwd(), "data", "adminData.json");
const SRC_ADMIN_DATA_PATH = path.join(process.cwd(), "src", "data", "adminData.json");
const ROOT_FLOOR_PLAN_PATH = path.join(process.cwd(), "data", "savedCustomFloorPlan.json");
const SRC_FLOOR_PLAN_PATH = path.join(process.cwd(), "src", "data", "savedCustomFloorPlan.json");

async function getAdminData() {
  try {
    const raw = await fs.readFile(ROOT_ADMIN_DATA_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    try {
      const raw = await fs.readFile(SRC_ADMIN_DATA_PATH, "utf-8");
      return JSON.parse(raw);
    } catch {
      return { registrations: [], inquiries: [], boothOverrides: {}, stallBookings: [] };
    }
  }
}

function createTransporter() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || 465);
  const secure = process.env.SMTP_SECURE === "true" || port === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

function escapeHtml(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function sendBookingConfirmationEmail(params: {
  toEmail: string;
  subject: string;
  htmlContent: string;
  textContent: string;
}) {
  const { toEmail, subject, htmlContent, textContent } = params;
  const fromName = process.env.SMTP_FROM_NAME || "Himalayan Green Energy Expo 2027";
  const replyTo = "info@eventsolutionnepal.com.np";
  let sent = false;

  // 1. Try Primary SMTP (Nodemailer)
  try {
    const transporter = createTransporter();
    const smtpUser = process.env.SMTP_USER;
    if (transporter && smtpUser) {
      await transporter.sendMail({
        from: `"${fromName}" <${smtpUser}>`,
        to: toEmail,
        replyTo: `"Expo Secretariat" <${replyTo}>`,
        subject,
        text: textContent,
        html: htmlContent,
      });
      sent = true;
      console.log(`[stall-booking] Confirmation email sent via SMTP to ${toEmail}`);
    }
  } catch (err: any) {
    console.warn("[stall-booking] SMTP send failed, attempting Resend fallback:", err?.message || err);
  }

  // 2. Resend Fallback
  if (!sent && process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const rawSender = process.env.RESEND_FROM_EMAIL || "info@himalayanenergyexpo.com";
      const cleanSender = rawSender.includes("<") ? rawSender : `"${fromName}" <${rawSender}>`;
      
      const { error } = await resend.emails.send({
        from: cleanSender,
        to: [toEmail],
        replyTo,
        subject,
        text: textContent,
        html: htmlContent,
      });

      if (error) {
        console.warn("[stall-booking] Resend fallback error:", error.message);
      } else {
        sent = true;
        console.log(`[stall-booking] Confirmation email sent via Resend fallback to ${toEmail}`);
      }
    } catch (rErr: any) {
      console.warn("[stall-booking] Resend exception:", rErr?.message || rErr);
    }
  }

  return sent;
}

async function saveAdminData(data: any) {
  const content = JSON.stringify(data, null, 2);
  try {
    await fs.mkdir(path.dirname(ROOT_ADMIN_DATA_PATH), { recursive: true });
    await fs.writeFile(ROOT_ADMIN_DATA_PATH, content, "utf-8");
  } catch {}
  try {
    await fs.mkdir(path.dirname(SRC_ADMIN_DATA_PATH), { recursive: true });
    await fs.writeFile(SRC_ADMIN_DATA_PATH, content, "utf-8");
  } catch {}
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      bookingId,
      stallNumbers = [],
      contactPerson,
      email,
      phone,
      company,
      country = "Nepal",
      fasciaName,
      boothType = "Shell Scheme",
      powerOption = "Standard 15A Included",
      industryCategory = "Turbines & Electro-Mechanical",
      specialRequirements = "",
      paymentMethod = "khalti", // 'khalti' | 'bank' | 'hold_72h'
      packageName,
      packageType,
      packagePerks = [],
    } = body;

    if (!email || !phone || !stallNumbers || stallNumbers.length === 0) {
      return NextResponse.json(
        { success: false, error: "Missing required booking details" },
        { status: 400 }
      );
    }
    if (!Array.isArray(stallNumbers) || stallNumbers.length > 20 || stallNumbers.some((s: unknown) => typeof s !== "string" || s.length > 20)) {
      return NextResponse.json({ success: false, error: "Invalid stall selection" }, { status: 400 });
    }

    // The price is recalculated from the admin-configured floor plan / stall prices —
    // amounts sent by the browser are ignored so they can't be lowered.
    let quote;
    try {
      quote = await quoteBookingOnServer(stallNumbers, body.packageId);
    } catch (e: any) {
      return NextResponse.json({ success: false, error: e?.message || "Invalid package selection" }, { status: 400 });
    }
    const isHoldRequest = paymentMethod === "hold_72h" || Boolean(body.isHold72h);
    const amountNPR = isHoldRequest ? 0 : quote.totalWithVatNPR;
    const amountUSD = isHoldRequest ? 0 : quote.totalWithVatUSD;
    if (Number(body.amountNPR) !== amountNPR) {
      console.warn(`[payment/initiate] Client amount ${body.amountNPR} differs from server price ${amountNPR} for ${stallNumbers.join(",")}`);
    }

    const orderId = await resolveNewOrderId(bookingId, "HHE26-STALL");

    const stallListStr = Array.isArray(stallNumbers) ? stallNumbers.join(", ") : String(stallNumbers);
    const primaryName = contactPerson || company || "Exhibitor Applicant";

    // 1. Record booking in local admin store
    const adminData = await getAdminData();
    if (!adminData.stallBookings) {
      adminData.stallBookings = [];
    }

    const isHold72h = paymentMethod === "hold_72h" || Boolean(body.isHold72h);
    const holdExpiresAt = isHold72h
      ? new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString()
      : undefined;

    const newBookingRecord = {
      id: orderId,
      stalls: stallNumbers,
      packageName: packageName || (specialRequirements?.includes("Package:") ? specialRequirements.split("Package:")[1]?.split("|")[0]?.trim() : undefined),
      packageType: packageType || (packageName ? "sponsor" : "stall"),
      packagePerks,
      amountNPR,
      amountUSD,
      packageTariffNPR: quote.totalWithVatNPR,
      packageTariffUSD: quote.totalWithVatUSD,
      vatNPR: quote.vatNPR,
      vatUSD: quote.vatUSD,
      company: company || contactPerson,
      contactPerson,
      email,
      phone,
      country,
      fasciaName: fasciaName || company,
      boothType,
      powerOption,
      industryCategory,
      specialRequirements,
      paymentMethod,
      is72hHold: isHold72h,
      holdExpiresAt,
      paymentStatus: isHold72h ? "FREE_HOLD_72H" : paymentMethod === "bank" ? "PENDING_WIRE" : "INITIATED",
      bookingStatus: isHold72h ? "72h Free Hold" : "Reserved",
      createdAt: new Date().toISOString(),
    };

    // Prepend or update
    const existingIdx = adminData.stallBookings.findIndex((b: any) => b.id === orderId);
    if (existingIdx >= 0) {
      adminData.stallBookings[existingIdx] = newBookingRecord;
    } else {
      adminData.stallBookings.unshift(newBookingRecord);
    }
    // Firestore is the persistent store on Vercel (local files are reset on each deploy)
    await saveStallBooking({ ...newBookingRecord, ...attributionFields(req) });

    // 2. Mark package hold if applicable
    const resolvedPackageId = body.packageId || (packageName?.toLowerCase().includes("title") || (stallNumbers.includes("A1") && stallNumbers.includes("A2")) ? "title-sponsor" : undefined);
    if (!adminData.packageOverrides) adminData.packageOverrides = {};
    if (resolvedPackageId && isHold72h) {
      const pkgHoldData = {
        packageId: resolvedPackageId,
        packageName: packageName || "Title Sponsor (1)",
        status: "72h Hold",
        company: company || contactPerson,
        contactPerson,
        email,
        phone,
        bookingRef: orderId,
        is72hHold: true,
        holdExpiresAt,
        stalls: stallNumbers,
        updatedAt: new Date().toISOString(),
      };
      adminData.packageOverrides[resolvedPackageId] = pkgHoldData;
      setFirebaseSponsorshipHold(resolvedPackageId, pkgHoldData).catch(() => {});
    }

    // 3. Mark stalls as Reserved or 72h Hold in boothOverrides
    if (!adminData.boothOverrides) adminData.boothOverrides = {};
    for (const stNum of stallNumbers) {
      const overridePayload = {
        status: isHold72h ? "72h Hold" : "Reserved",
        exhibitorName: company || contactPerson,
        bookingRef: orderId,
        is72hHold: isHold72h,
        holdExpiresAt,
        updatedAt: new Date().toISOString(),
      };
      adminData.boothOverrides[stNum] = overridePayload;
      setFirebaseBoothOverride(stNum, overridePayload).catch(() => {});
    }

    // 4. Sync stall status directly into floor plan designs (local and Firebase)
    try {
      let floorData: any = null;
      try {
        floorData = JSON.parse(await fs.readFile(ROOT_FLOOR_PLAN_PATH, "utf-8"));
      } catch {
        try {
          floorData = JSON.parse(await fs.readFile(SRC_FLOOR_PLAN_PATH, "utf-8"));
        } catch {}
      }

      if (floorData && Array.isArray(floorData.elements)) {
        let changed = false;
        floorData.elements = floorData.elements.map((el: any) => {
          const matchNum = stallNumbers.find((s: string) =>
            (el.number && el.number.trim().toLowerCase() === s.trim().toLowerCase()) ||
            (el.id && el.id.trim().toLowerCase() === s.trim().toLowerCase())
          );
          if (matchNum) {
            changed = true;
            return {
              ...el,
              status: isHold72h ? "72h Hold" : "Reserved",
              exhibitorName: company || contactPerson,
            };
          }
          return el;
        });

        if (changed) {
          const content = JSON.stringify(floorData, null, 2);
          await fs.writeFile(ROOT_FLOOR_PLAN_PATH, content, "utf-8").catch(() => {});
          await fs.writeFile(SRC_FLOOR_PLAN_PATH, content, "utf-8").catch(() => {});
        }
      }

      getFirebaseFloorPlan().then((fbFloor) => {
        if (fbFloor && Array.isArray(fbFloor.elements)) {
          let fbChanged = false;
          const updatedElements = fbFloor.elements.map((el: any) => {
            const matchNum = stallNumbers.find((s: string) =>
              (el.number && el.number.trim().toLowerCase() === s.trim().toLowerCase()) ||
              (el.id && el.id.trim().toLowerCase() === s.trim().toLowerCase())
            );
            if (matchNum) {
              fbChanged = true;
              return {
                ...el,
                status: isHold72h ? "72h Hold" : "Reserved",
                exhibitorName: company || contactPerson,
              };
            }
            return el;
          });
          if (fbChanged) {
            saveFirebaseFloorPlan({ ...fbFloor, elements: updatedElements }).catch(() => {});
          }
        }
      }).catch(() => {});
    } catch (e) {
      console.warn("[payment/initiate] Failed to sync floor plan files:", e);
    }

    // 5. Log corresponding inquiry for admin leads
    if (!adminData.inquiries) adminData.inquiries = [];
    const uniqueInqSuffix = `${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const newInquiryPayload = {
      id: `INQ-STALL-${orderId.replace(/[^0-9]/g, "") || "BOOK"}-${uniqueInqSuffix}`,
      name: contactPerson,
      email,
      phone,
      company: company || contactPerson,
      subject: isHold72h
        ? `[72-HOUR FREE HOLD] Reservation [${stallListStr}]`
        : `Stall Reservation [${stallListStr}] - Method: ${paymentMethod.toUpperCase()}`,
      message: `Booking Ref: ${orderId}. Stalls: ${stallListStr}. Fascia: ${fasciaName || company}. ${
        isHold72h
          ? `72-HOUR FREE HOLD (Zero Cost). Expires at: ${holdExpiresAt}.`
          : `Total: NPR ${amountNPR?.toLocaleString()} / USD ${amountUSD?.toLocaleString()}.`
      } Power: ${powerOption}. Notes: ${specialRequirements || "None"}.`,
      stallInterest: stallListStr,
      status: isHold72h ? "72h Hold" : "New",
      submittedAt: new Date().toISOString(),
      ...attributionFields(req),
    };
    adminData.inquiries.unshift(newInquiryPayload);
    addFirebaseInquiry(newInquiryPayload).catch(() => {});

    await saveAdminData(adminData);

    // Send automated email confirmation to exhibitor / sponsor (auto-reply)
    try {
      const isBankTransfer = paymentMethod === "bank";
      const resolvedPackageName = packageName || (specialRequirements?.includes("Package:") ? specialRequirements.split("Package:")[1]?.split("|")[0]?.trim() : undefined);
      const isSponsorTier = Boolean(resolvedPackageName && (packageType === "sponsor" || resolvedPackageName.toLowerCase().includes("sponsor") || resolvedPackageName.toLowerCase().includes("partner") || resolvedPackageName.toLowerCase().includes("supporter")));
      const totalAmountNprNum = quote.totalWithVatNPR;
      const totalAmountUsdNum = quote.totalWithVatUSD;
      const formattedNPR = totalAmountNprNum.toLocaleString();
      const formattedUSD = totalAmountUsdNum.toLocaleString();

      const bookingTypeLabel = isSponsorTier
        ? `Official ${resolvedPackageName} Booking`
        : `Exhibition Stall Reservation [${stallListStr}]`;

      const subjectLine = isHold72h
        ? `[72-Hour Free Hold Confirmed] Ref: ${orderId} · ${resolvedPackageName || `Stall ${stallListStr}`} | Himalayan Green Energy Expo 2027`
        : `${isSponsorTier ? `${resolvedPackageName} Confirmed` : "Stall Reservation Confirmed"} [Ref: ${orderId}] | Himalayan Green Energy Expo 2027`;

      const perksHtml = Array.isArray(packagePerks) && packagePerks.length > 0
        ? `
        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 14px 18px; margin: 16px 0;">
          <div style="font-size: 11px; font-weight: 700; color: #15803d; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">
            Included Sponsorship Deliverables &amp; Entitlements:
          </div>
          <ul style="margin: 0; padding-left: 18px; font-size: 12.5px; color: #166534; line-height: 1.65;">
            ${packagePerks.map((p: string) => `<li>${escapeHtml(p)}</li>`).join("")}
          </ul>
        </div>
        `
        : "";

      const emailHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="padding: 30px 15px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 14px rgba(0,0,0,0.06);">
          <tr>
            <td style="background-color: #04281E; padding: 26px 32px; text-align: left; border-bottom: 3px solid #10b981;">
              <div style="font-size: 11px; font-weight: 700; color: #34d399; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 6px;">
                Himalayan Green Energy Expo 2027 &bull; Organizing Secretariat
              </div>
              <h1 style="margin: 0; font-size: 20px; font-weight: 800; color: #ffffff;">
                ${escapeHtml(bookingTypeLabel)}
              </h1>
              <p style="margin: 6px 0 0 0; font-size: 13px; color: #a7f3d0;">
                Booking Reference: <code style="background-color: rgba(255,255,255,0.12); padding: 2px 6px; border-radius: 4px; font-family: monospace; color: #ffffff;">${escapeHtml(orderId)}</code>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 26px 32px;">
              <p style="font-size: 15px; color: #0f172a; margin-top: 0; line-height: 1.6;">
                Dear <strong>${escapeHtml(primaryName)}</strong>,
              </p>
              <p style="font-size: 14px; color: #334155; line-height: 1.6;">
                Thank you for choosing to participate in the <strong>Himalayan Green Energy Expo 2027</strong>. Your reservation has been officially received and registered in our exhibition management system.
              </p>
              
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #10b981; border-radius: 8px; padding: 16px 20px; margin: 18px 0; font-size: 13px; line-height: 1.7;">
                <strong>Reservation Summary:</strong><br/>
                ${resolvedPackageName ? `&bull; <strong>Sponsorship / Package:</strong> <span style="color: #047857; font-weight: 700;">${escapeHtml(resolvedPackageName)}</span><br/>` : ""}
                &bull; <strong>Allocated Space / Stall(s):</strong> <span style="color: #047857; font-weight: 700;">${escapeHtml(stallListStr)}</span><br/>
                &bull; <strong>Company / Organization:</strong> ${escapeHtml(company || primaryName)}<br/>
                &bull; <strong>Fascia Board Name:</strong> ${escapeHtml(fasciaName || company || primaryName)}<br/>
                &bull; <strong>Booth Type:</strong> ${escapeHtml(boothType)}<br/>
                &bull; <strong>Industry Category:</strong> ${escapeHtml(industryCategory)}<br/>
                &bull; <strong>Package Tariff (incl. 13% VAT):</strong> ${
                  isHold72h
                    ? `<span style="color: #047857; font-weight: 700;">NPR 0 / USD $0 (72-Hour Free Hold)</span> &bull; Full package tariff: NPR ${formattedNPR} / USD $${formattedUSD}`
                    : `NPR ${formattedNPR} / USD $${formattedUSD}`
                }<br/>
                &bull; <strong>Payment Method:</strong> ${
                  isHold72h ? "72-HOUR FREE HOLD (NPR 0 Today)" : escapeHtml(paymentMethod.toUpperCase())
                }<br/>
                ${
                  isHold72h && holdExpiresAt
                    ? `&bull; <strong>Hold Expiration Window:</strong> <span style="color: #b45309; font-weight: 700;">72 Hours Exclusivity Lock (Expires: ${new Date(
                        holdExpiresAt
                      ).toLocaleString("en-US", { timeZone: "Asia/Kathmandu" })} NPT)</span><br/>`
                    : ""
                }
                &bull; <strong>Expo Dates:</strong> 17–19 January 2027 (10:00 AM – 6:00 PM)<br/>
                &bull; <strong>Venue:</strong> BHRIKUTIMANDAP, KATHMANDU, NEPAL
              </div>

              ${perksHtml}

              ${
                isHold72h
                  ? `
              <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 16px 20px; margin: 18px 0; font-size: 13px; line-height: 1.7;">
                <strong style="color: #065f46;">72-Hour Free Hold Active (Zero Upfront Cost):</strong><br/>
                Your reservation is held exclusively in your organization&apos;s name for the next 72 hours. No other enterprise can claim this allocation during your hold window.<br/><br/>
                <strong>Next Steps:</strong> Our exhibition secretariat will provide your official corporate contract and pro-forma invoice. When ready to confirm, your accounts team may wire remittance to the official bank account below:<br/><br/>
                &bull; <strong>Beneficiary:</strong> IPPAN - GREEN ENERGY EXPO<br/>
                &bull; <strong>Bank Name:</strong> Nepal Investment Mega Bank (NIMB)<br/>
                &bull; <strong>NPR Account Number:</strong> 001001201928471<br/>
                &bull; <strong>USD Account Number:</strong> 001001201928482<br/>
                &bull; <strong>Branch / SWIFT:</strong> Durbarmarg, Kathmandu / NIMBNPKA<br/>
                &bull; <strong>Wire Remarks:</strong> Please quote booking reference <code>${escapeHtml(orderId)}</code>
              </div>
              `
                  : isBankTransfer
                  ? `
              <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 16px 20px; margin: 18px 0; font-size: 13px; line-height: 1.7;">
                <strong style="color: #065f46;">Bank Wire Remittance Instructions:</strong><br/>
                Please wire the fee to the official IPPAN account below:<br/><br/>
                &bull; <strong>Beneficiary:</strong> IPPAN - GREEN ENERGY EXPO<br/>
                &bull; <strong>Bank Name:</strong> Nepal Investment Mega Bank (NIMB)<br/>
                &bull; <strong>NPR Account Number:</strong> 001001201928471<br/>
                &bull; <strong>USD Account Number:</strong> 001001201928482<br/>
                &bull; <strong>Branch / SWIFT:</strong> Durbarmarg, Kathmandu / NIMBNPKA<br/>
                &bull; <strong>Wire Remarks:</strong> Quote booking ID <code>${escapeHtml(orderId)}</code> and email the bank swift advice/voucher to <a href="mailto:expo@ippan.org.np" style="color: #047857; font-weight: 600;">expo@ippan.org.np</a>.
              </div>
              `
                  : `
              <p style="font-size: 13px; color: #475569; line-height: 1.6;">
                Once your online payment verification is confirmed, your stall status will automatically lock as <strong>Confirmed &amp; Booked</strong> on the interactive floor plan.
              </p>
              `
              }

              <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 20px; font-size: 13px; color: #475569; line-height: 1.6;">
                <strong>Secretariat Contact Details:</strong><br/>
                &bull; Direct Hotlines: +977-9703606348 / 9703606345<br/>
                &bull; WhatsApp Support: +977 9851004985<br/>
                &bull; Landline: 01-5268535, 4169175<br/>
                &bull; Email: <a href="mailto:info@himalayanenergyexpo.com" style="color: #007A5E; text-decoration: none;">info@himalayanenergyexpo.com</a> | <a href="mailto:himalayangreenenergyexpo@gmail.com" style="color: #007A5E; text-decoration: none;">himalayangreenenergyexpo@gmail.com</a> | <a href="mailto:info@eventsolutionnepal.com.np" style="color: #007A5E; text-decoration: none;">info@eventsolutionnepal.com.np</a><br/>
                &bull; Address: IPPAN Secretariat, Jwagal, Lalitpur, Nepal<br/>
                &bull; Website: <a href="https://www.higex.org" style="color: #007A5E; text-decoration: none;">www.higex.org</a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `;

      const textFallback = `
${bookingTypeLabel}
Himalayan Green Energy Expo 2027
--------------------------------------------------
Dear ${primaryName},

Thank you for choosing to participate in Himalayan Green Energy Expo 2027.
Your reservation has been received and registered.

Booking Reference: ${orderId}
${resolvedPackageName ? `Package: ${resolvedPackageName}\n` : ""}Allocated Space / Stalls: ${stallListStr}
Organization: ${company || primaryName}
Fascia Board Name: ${fasciaName || company || primaryName}
Tariff: ${isHold72h ? `NPR 0 Today (72-Hour Free Hold) · Full tariff: NPR ${formattedNPR} / USD $${formattedUSD}` : `NPR ${formattedNPR} / USD $${formattedUSD}`}
Payment Method: ${isHold72h ? "72-HOUR FREE HOLD" : paymentMethod.toUpperCase()}
${isHold72h && holdExpiresAt ? `Hold Expiration: ${holdExpiresAt} (72 Hours)\n` : ""}Dates: 17–19 January 2027
Venue: BHRIKUTIMANDAP, KATHMANDU, NEPAL

Bank Details for Remittance:
Beneficiary: IPPAN - GREEN ENERGY EXPO
Bank: Nepal Investment Mega Bank (NIMB)
NPR A/C: 001001201928471
USD A/C: 001001201928482
SWIFT: NIMBNPKA

Secretariat Contacts:
Hotlines: +977-9703606348 / 9703606345
WhatsApp: +977 9851004985
Emails: info@himalayanenergyexpo.com | himalayangreenenergyexpo@gmail.com | info@eventsolutionnepal.com.np
Website: https://www.higex.org
      `.trim();

      // Trigger asynchronous background sending
      sendBookingConfirmationEmail({
        toEmail: email,
        subject: subjectLine,
        htmlContent: emailHtml,
        textContent: textFallback,
      }).catch((err) => {
        console.warn("[stall-booking] Background email dispatch error:", err);
      });
    } catch (e) {
      console.warn("[stall-booking] Email setup skipped:", e);
    }

    const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
    const protocol = req.headers.get("x-forwarded-proto") || (host?.includes("localhost") ? "http" : "https");
    const origin = req.headers.get("origin");
    const baseUrl =
      origin ||
      (host ? `${protocol}://${host}` : null) ||
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://www.higex.org");

    // 2. Handle 72-Hour Free Hold Routing (Zero Cost)
    if (isHold72h) {
      return NextResponse.json({
        success: true,
        bookingId: orderId,
        paymentMethod: "hold_72h",
        isHold72h: true,
        holdExpiresAt,
        message: "72-Hour Free Hold secured successfully at zero cost.",
        redirectUrl: `/payment/success?id=${encodeURIComponent(
          orderId
        )}&gateway=hold_72h&stalls=${encodeURIComponent(
          stallListStr
        )}&amount=0&hold=72h`,
      });
    }

    const cleanCountry = (country || "").trim().toLowerCase();
    const isDomestic =
      cleanCountry === "nepal" ||
      cleanCountry === "" ||
      cleanCountry.includes("nepal") ||
      cleanCountry.includes("ktm") ||
      cleanCountry.includes("kathmandu");

    const isInternational =
      (!isDomestic && cleanCountry !== "") ||
      (specialRequirements && specialRequirements.toLowerCase().includes("[international exhibitor]")) ||
      paymentMethod === "intl_card" ||
      paymentMethod === "card";

    // International exhibitors are strictly routed to SWIFT bank transfer / USD pro-forma invoice
    // Online card checkout is currently under construction.
    const effectivePaymentMethod = isInternational ? "bank" : paymentMethod;

    // 3. Handle Payment Method Routing
    if (isInternational || effectivePaymentMethod === "bank") {
      const finalAmount = isInternational ? (amountUSD || 1350) : (amountNPR || 875000);
      const currency = isInternational ? "USD" : "NPR";
      return NextResponse.json({
        success: true,
        bookingId: orderId,
        paymentMethod: "bank",
        message: isInternational
          ? "International stall reservation registered. USD SWIFT pro-forma invoice issued."
          : "Provisional booking confirmed with Bank Transfer / Invoice.",
        redirectUrl: `/payment/success?id=${encodeURIComponent(
          orderId
        )}&gateway=bank&stalls=${encodeURIComponent(
          stallListStr
        )}&amount=${encodeURIComponent(String(finalAmount))}&currency=${currency}`,
      });
    }

    if (effectivePaymentMethod === "khalti") {
      try {
        const returnUrl = `${baseUrl}/api/payment/callback?order_id=${encodeURIComponent(
          orderId
        )}&stalls=${encodeURIComponent(stallListStr)}`;

        const khaltiResponse = await initializeKhaltiPayment({
          return_url: returnUrl,
          website_url: baseUrl,
          amount: Math.round(amountNPR * 100), // Rs to Paisa
          purchase_order_id: orderId,
          purchase_order_name: `Stall Booking (${stallListStr}) - Expo 2027`,
          customer_info: {
            name: primaryName,
            email,
            phone,
          },
        });

        return NextResponse.json({
          success: true,
          bookingId: orderId,
          paymentMethod: "khalti",
          paymentUrl: khaltiResponse.payment_url,
          pidx: khaltiResponse.pidx,
        });
      } catch (err: any) {
        console.error("Khalti initialization error:", err);
        return NextResponse.json(
          {
            success: false,
            error: err.message || "Failed to initialize Khalti payment gateway.",
          },
          { status: 500 }
        );
      }
    }

    // Default Fallback
    return NextResponse.json({
      success: true,
      bookingId: orderId,
      paymentMethod: "bank",
      message: "Provisional booking confirmed with Bank Transfer / Invoice.",
      redirectUrl: `/payment/success?id=${encodeURIComponent(
        orderId
      )}&gateway=bank&stalls=${encodeURIComponent(
        stallListStr
      )}&amount=${encodeURIComponent(String(amountNPR))}`,
    });
  } catch (error: any) {
    console.error("Payment initiate error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
