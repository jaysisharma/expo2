import { NextResponse } from "next/server";
import { initializeKhaltiPayment } from "@/lib/khalti";
import { generateFonepayUrl } from "@/lib/fonepay";
import nodemailer from "nodemailer";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

const ROOT_ADMIN_DATA_PATH = path.join(process.cwd(), "data", "adminData.json");
const SRC_ADMIN_DATA_PATH = path.join(process.cwd(), "src", "data", "adminData.json");

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
      amountNPR,
      amountUSD,
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
      paymentMethod = "khalti", // 'khalti' | 'fonepay' | 'bank'
    } = body;

    if (!email || !phone || !stallNumbers || stallNumbers.length === 0) {
      return NextResponse.json(
        { success: false, error: "Missing required booking details" },
        { status: 400 }
      );
    }

    const orderId =
      bookingId ||
      `HHE26-STALL-${Math.floor(100000 + Math.random() * 900000)}`;

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
      amountNPR: isHold72h ? 0 : Number(amountNPR) || 875000,
      amountUSD: isHold72h ? 0 : Number(amountUSD) || 6500,
      packageTariffNPR: Number(body.fullPackageAmountNPR) || Number(amountNPR) || 0,
      packageTariffUSD: Number(body.fullPackageAmountUSD) || Number(amountUSD) || 0,
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
      paymentStatus: isHold72h ? "COURTESY_HOLD_72H" : paymentMethod === "bank" ? "PENDING_WIRE" : "INITIATED",
      bookingStatus: isHold72h ? "72h Courtesy Hold" : "Reserved",
      createdAt: new Date().toISOString(),
    };

    // Prepend or update
    const existingIdx = adminData.stallBookings.findIndex((b: any) => b.id === orderId);
    if (existingIdx >= 0) {
      adminData.stallBookings[existingIdx] = newBookingRecord;
    } else {
      adminData.stallBookings.unshift(newBookingRecord);
    }

    // Mark stalls as Reserved or 72h Hold in boothOverrides
    if (!adminData.boothOverrides) adminData.boothOverrides = {};
    for (const stNum of stallNumbers) {
      adminData.boothOverrides[stNum] = {
        status: isHold72h ? "72h Hold" : "Reserved",
        exhibitorName: company || contactPerson,
        bookingRef: orderId,
        is72hHold: isHold72h,
        holdExpiresAt,
        updatedAt: new Date().toISOString(),
      };
    }

    // Log corresponding inquiry for admin leads
    if (!adminData.inquiries) adminData.inquiries = [];
    const uniqueInqSuffix = `${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    adminData.inquiries.unshift({
      id: `INQ-STALL-${orderId.replace(/[^0-9]/g, "") || "BOOK"}-${uniqueInqSuffix}`,
      name: contactPerson,
      email,
      phone,
      company: company || contactPerson,
      subject: isHold72h
        ? `[72-HOUR FREE COURTESY HOLD] Sponsorship & Stalls [${stallListStr}]`
        : `Stall Reservation [${stallListStr}] - Method: ${paymentMethod.toUpperCase()}`,
      message: `Booking Ref: ${orderId}. Stalls: ${stallListStr}. Fascia: ${fasciaName || company}. ${
        isHold72h
          ? `72-HOUR FREE COURTESY HOLD (Zero Cost). Expires at: ${holdExpiresAt}.`
          : `Total: NPR ${amountNPR?.toLocaleString()} / USD ${amountUSD?.toLocaleString()}.`
      } Power: ${powerOption}. Notes: ${specialRequirements || "None"}.`,
      stallInterest: stallListStr,
      status: isHold72h ? "72h Hold" : "New",
      submittedAt: new Date().toISOString(),
    });

    await saveAdminData(adminData);

    // Send automated email confirmation to exhibitor (auto-reply)
    try {
      const transporter = createTransporter();
      if (transporter) {
        const fromName = process.env.SMTP_FROM_NAME || "Himalayan Green Energy Expo 2027";
        const smtpUser = process.env.SMTP_USER;

        const isBankTransfer = paymentMethod === "bank";
        const formattedNPR = Number(amountNPR || 0).toLocaleString();
        const formattedUSD = Number(amountUSD || 0).toLocaleString();

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
                Himalayan Green Energy Expo 2027 &bull; Exhibition Secretariat
              </div>
              <h1 style="margin: 0; font-size: 20px; font-weight: 800; color: #ffffff;">
                Exhibition Stall Reservation Acknowledgment
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
                Thank you for reserving your exhibition space at the <strong>Himalayan Green Energy Expo 2027</strong>. Your provisional booth allocation has been received and registered.
              </p>
              
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #10b981; border-radius: 8px; padding: 16px 20px; margin: 18px 0; font-size: 13px; line-height: 1.7;">
                <strong>Reservation Summary:</strong><br/>
                &bull; <strong>Allocated Stall(s):</strong> <span style="color: #047857; font-weight: 700;">${escapeHtml(stallListStr)}</span><br/>
                &bull; <strong>Company / Exhibitor:</strong> ${escapeHtml(company || primaryName)}<br/>
                &bull; <strong>Fascia Board Name:</strong> ${escapeHtml(fasciaName || company || primaryName)}<br/>
                &bull; <strong>Booth Type:</strong> ${escapeHtml(boothType)}<br/>
                &bull; <strong>Industry Category:</strong> ${escapeHtml(industryCategory)}<br/>
                &bull; <strong>Total Fee (incl. 13% VAT):</strong> ${
                  isHold72h
                    ? `<span style="color: #047857; font-weight: 700;">NPR 0 / USD $0 (Free 72-Hour Courtesy Hold)</span> &bull; Full package tariff (NPR ${formattedNPR} / USD ${formattedUSD}) due within 72 hrs`
                    : `NPR ${formattedNPR} / USD ${formattedUSD}`
                }<br/>
                &bull; <strong>Payment Method:</strong> ${
                  isHold72h ? "72-HOUR FREE COURTESY HOLD" : escapeHtml(paymentMethod.toUpperCase())
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

              ${
                isHold72h
                  ? `
              <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 16px 20px; margin: 18px 0; font-size: 13px; line-height: 1.7;">
                <strong style="color: #065f46;">72-Hour Exclusivity Lock Active:</strong><br/>
                Your selected sponsorship package and allocated stalls are reserved exclusively in your company&apos;s name for the next 72 hours at zero cost. No other organization can claim this allocation during your courtesy hold.<br/><br/>
                <strong>Next Steps:</strong> Our exhibition secretariat will provide your official corporate sponsorship contract. When ready to confirm, your finance department may wire remittance to the account below:<br/><br/>
                &bull; <strong>Account Name:</strong> IPPAN - GREEN ENERGY EXPO<br/>
                &bull; <strong>Bank Name:</strong> Nepal Investment Mega Bank (NIMB)<br/>
                &bull; <strong>Account Number:</strong> 001001201928471<br/>
                &bull; <strong>Branch / SWIFT:</strong> Durbarmarg, Kathmandu / NIMBNPKA<br/>
                &bull; <strong>Reference:</strong> Quote booking ID <code>${escapeHtml(orderId)}</code>
              </div>
              `
                  : isBankTransfer
                  ? `
              <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 16px 20px; margin: 18px 0; font-size: 13px; line-height: 1.7;">
                <strong style="color: #065f46;">Bank Wire Remittance Instructions:</strong><br/>
                Please deposit / wire the stall fees to the official IPPAN account below:<br/><br/>
                &bull; <strong>Account Name:</strong> IPPAN - GREEN ENERGY EXPO<br/>
                &bull; <strong>Bank Name:</strong> Nepal Investment Mega Bank (NIMB)<br/>
                &bull; <strong>Account Number:</strong> 001001201928471<br/>
                &bull; <strong>Branch / SWIFT:</strong> Durbarmarg, Kathmandu / NIMBNPKA<br/>
                &bull; <strong>Wire Remarks:</strong> Please quote booking ID <code>${escapeHtml(orderId)}</code> and email the bank swift advice/voucher to <a href="mailto:expo@ippan.org.np" style="color: #047857; font-weight: 600;">expo@ippan.org.np</a>.
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
                &bull; Landline: 01-5268535, 4169175<br/>
                &bull; Email: <a href="mailto:info@himalayanenergyexpo.com" style="color: #007A5E; text-decoration: none;">info@himalayanenergyexpo.com</a> | <a href="mailto:info@eventsolutionnepal.com.np" style="color: #007A5E; text-decoration: none;">info@eventsolutionnepal.com.np</a><br/>
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

        transporter.sendMail({
          from: `"${fromName}" <${smtpUser}>`,
          to: email,
          replyTo: `"Expo Secretariat" <info@eventsolutionnepal.com.np>`,
          subject: isHold72h
            ? `[72-Hour Free Courtesy Hold Confirmed] Ref: ${orderId} | Himalayan Green Energy Expo 2027`
            : `Stall Reservation Confirmed [Ref: ${orderId}] | Himalayan Green Energy Expo 2027`,
          html: emailHtml,
        }).catch((err) => {
          console.warn("[stall-booking] Auto-reply send error:", err?.message || err);
        });
      }
    } catch (e) {
      console.warn("[stall-booking] Email setup skipped:", e);
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : "https://himalayanenergyexpo.com");

    // 2. Handle 72-Hour Free Courtesy Hold Routing (Exclusively for Sponsors, Zero Cost)
    if (isHold72h) {
      return NextResponse.json({
        success: true,
        bookingId: orderId,
        paymentMethod: "hold_72h",
        isHold72h: true,
        holdExpiresAt,
        message: "72-Hour Free Courtesy Hold secured successfully at zero cost.",
        redirectUrl: `/payment/success?id=${encodeURIComponent(
          orderId
        )}&gateway=hold_72h&stalls=${encodeURIComponent(
          stallListStr
        )}&amount=0&hold=72h`,
      });
    }

    const isInternational =
      (country && country.trim().toLowerCase() !== "nepal") ||
      (specialRequirements && specialRequirements.toLowerCase().includes("international")) ||
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
          amount: Math.round((Number(amountNPR) || 875000) * 100), // Rs to Paisa
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

    if (effectivePaymentMethod === "fonepay") {
      try {
        const returnUrl = `${baseUrl}/api/payment/fonepay-callback?order_id=${encodeURIComponent(
          orderId
        )}&stalls=${encodeURIComponent(stallListStr)}`;

        const fonepayUrl = generateFonepayUrl({
          amount: Number(amountNPR) || 875000,
          purchase_order_id: orderId,
          purchase_order_name: `Expo Stall ${stallListStr}`,
          return_url: returnUrl,
        });

        return NextResponse.json({
          success: true,
          bookingId: orderId,
          paymentMethod: "fonepay",
          paymentUrl: fonepayUrl,
        });
      } catch (err: any) {
        console.error("Fonepay generation error:", err);
        return NextResponse.json(
          {
            success: false,
            error: err.message || "Failed to generate Fonepay payment URL.",
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
