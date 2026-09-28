import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import fs from "fs/promises";
import path from "path";
import { addFirebaseInquiry } from "@/lib/firebaseDb";
import { CONTACT_DETAILS } from "@/data/contactInfo";

export const dynamic = "force-dynamic";

const ROOT_ADMIN_DATA_PATH = path.join(process.cwd(), "data", "adminData.json");
const SRC_ADMIN_DATA_PATH = path.join(process.cwd(), "src", "data", "adminData.json");

function createTransporter() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || 465);
  const secure = process.env.SMTP_SECURE === "true" || port === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    return null;
  }

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

async function recordInquiryLocally(inquiry: any) {
  try {
    let raw = "";
    try {
      raw = await fs.readFile(ROOT_ADMIN_DATA_PATH, "utf-8");
    } catch {
      try {
        raw = await fs.readFile(SRC_ADMIN_DATA_PATH, "utf-8");
      } catch {}
    }

    if (raw) {
      const data = JSON.parse(raw);
      if (!Array.isArray(data.inquiries)) data.inquiries = [];
      data.inquiries.unshift(inquiry);
      const updated = JSON.stringify(data, null, 2);

      await fs.writeFile(ROOT_ADMIN_DATA_PATH, updated, "utf-8").catch(() => {});
      await fs.writeFile(SRC_ADMIN_DATA_PATH, updated, "utf-8").catch(() => {});
    }
  } catch (err) {
    console.warn("[contact-api] Local JSON inquiry save error:", err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, subject, message } = body;

    // Validation
    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: "Please provide your full name." },
        { status: 400 }
      );
    }

    if (!email || !email.trim() || !email.includes("@")) {
      return NextResponse.json(
        { success: false, message: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    if (!message || !message.trim()) {
      return NextResponse.json(
        { success: false, message: "Please enter your message." },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPhone = (phone || "").trim();
    const resolvedSubject = (subject || "General Inquiry").trim();
    const trimmedMessage = message.trim();

    const timestamp = new Date().toISOString();
    const inquiryId = `INQ-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // 1. Record inquiry in admin data and Firebase
    const newInquiry = {
      id: inquiryId,
      name: trimmedName,
      email: trimmedEmail,
      phone: trimmedPhone,
      company: "",
      subject: resolvedSubject,
      message: trimmedMessage,
      stallInterest: "",
      status: "New",
      submittedAt: timestamp,
    };

    await Promise.all([
      recordInquiryLocally(newInquiry),
      addFirebaseInquiry(newInquiry).catch(() => {}),
    ]);

    // 2. Prepare & Send Email to info@nepalenergyexpo.com
    const receiverEmail = process.env.CONTACT_RECEIVER_EMAIL || CONTACT_DETAILS.emails.expo || "info@nepalenergyexpo.com";
    const fromName = process.env.SMTP_FROM_NAME || "Himalayan Green Energy Expo";
    const smtpUser = process.env.SMTP_USER;

    const transporter = createTransporter();

    if (transporter && smtpUser) {
      const formattedDate = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Kathmandu",
        dateStyle: "full",
        timeStyle: "medium",
      });

      // HTML Email for Expo Organizers
      const adminEmailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Website Contact Inquiry</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #04281E; padding: 28px 32px; text-align: left; border-bottom: 3px solid #10b981;">
              <div style="font-size: 11px; font-weight: 700; color: #34d399; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 6px;">
                Himalayan Green Energy Expo 2027
              </div>
              <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                New Website Contact Inquiry
              </h1>
              <p style="margin: 6px 0 0 0; font-size: 13px; color: #a7f3d0;">
                Received on ${escapeHtml(formattedDate)} (Nepal Time)
              </p>
            </td>
          </tr>

          <!-- Contact Details Table -->
          <tr>
            <td style="padding: 28px 32px 16px 32px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
                <tr>
                  <td width="35%" style="padding: 10px 0; font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #f1f5f9;">
                    Sender Name
                  </td>
                  <td width="65%" style="padding: 10px 0; font-size: 14px; font-weight: 700; color: #0f172a; border-bottom: 1px solid #f1f5f9;">
                    ${escapeHtml(trimmedName)}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #f1f5f9;">
                    Email Address
                  </td>
                  <td style="padding: 10px 0; font-size: 14px; font-weight: 600; color: #0284c7; border-bottom: 1px solid #f1f5f9;">
                    <a href="mailto:${escapeHtml(trimmedEmail)}" style="color: #0284c7; text-decoration: none;">
                      ${escapeHtml(trimmedEmail)}
                    </a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #f1f5f9;">
                    Phone Number
                  </td>
                  <td style="padding: 10px 0; font-size: 14px; font-weight: 600; color: #0f172a; border-bottom: 1px solid #f1f5f9;">
                    ${trimmedPhone ? `<a href="tel:${escapeHtml(trimmedPhone)}" style="color: #0f172a; text-decoration: none;">${escapeHtml(trimmedPhone)}</a>` : '<span style="color: #94a3b8; font-style: italic;">Not provided</span>'}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #f1f5f9;">
                    Subject / Topic
                  </td>
                  <td style="padding: 10px 0; font-size: 14px; font-weight: 700; color: #047857; border-bottom: 1px solid #f1f5f9;">
                    ${escapeHtml(resolvedSubject)}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">
                    Inquiry ID
                  </td>
                  <td style="padding: 10px 0; font-size: 13px; font-family: monospace; color: #64748b;">
                    ${escapeHtml(inquiryId)}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Message Body -->
          <tr>
            <td style="padding: 0 32px 24px 32px;">
              <div style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
                Message Content:
              </div>
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #10b981; border-radius: 8px; padding: 16px 20px; font-size: 14px; line-height: 1.65; color: #1e293b; white-space: pre-wrap;">
${escapeHtml(trimmedMessage)}
              </div>
            </td>
          </tr>

          <!-- Action Button: Direct Reply -->
          <tr>
            <td style="padding: 0 32px 32px 32px; text-align: center;">
              <a href="mailto:${escapeHtml(trimmedEmail)}?subject=${encodeURIComponent(`Re: ${resolvedSubject} - Himalayan Green Energy Expo`)}" style="display: inline-block; background-color: #10b981; color: #ffffff; font-size: 14px; font-weight: 700; padding: 12px 28px; border-radius: 8px; text-decoration: none; box-shadow: 0 2px 6px rgba(16, 185, 129, 0.3);">
                Reply to ${escapeHtml(trimmedName)} &rarr;
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 32px; text-align: center; font-size: 12px; color: #64748b; line-height: 1.5;">
              <p style="margin: 0;">
                This message was submitted via the contact form on <strong>Himalayan Green Energy Expo 2027</strong>.
              </p>
              <p style="margin: 4px 0 0 0; color: #94a3b8;">
                Exhibition: 17–19 January 2027 &bull; Bhrikuti Mandap, Kathmandu, Nepal
              </p>
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
New Contact Inquiry - Himalayan Green Energy Expo 2027
------------------------------------------------------
Sender: ${trimmedName}
Email: ${trimmedEmail}
Phone: ${trimmedPhone || "Not provided"}
Subject: ${resolvedSubject}
Inquiry ID: ${inquiryId}
Date: ${formattedDate}

Message:
${trimmedMessage}
------------------------------------------------------
Direct reply: mailto:${trimmedEmail}
      `.trim();

      // Dispatch mail to info@nepalenergyexpo.com
      await transporter.sendMail({
        from: `"${fromName} (Website Contact)" <${smtpUser}>`,
        to: receiverEmail,
        replyTo: `"${trimmedName}" <${trimmedEmail}>`,
        subject: `[Website Inquiry] ${resolvedSubject} - ${trimmedName}`,
        text: textFallback,
        html: adminEmailHtml,
      });

      // Also send an automated acknowledgment confirmation to the user
      try {
        const userAckHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Thank you for contacting Himalayan Green Energy Expo 2027</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
          <tr>
            <td style="background-color: #04281E; padding: 28px 32px; text-align: left; border-bottom: 3px solid #10b981;">
              <div style="font-size: 11px; font-weight: 700; color: #34d399; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 6px;">
                Himalayan Green Energy Expo 2027
              </div>
              <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #ffffff;">
                We Have Received Your Inquiry
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 28px 32px;">
              <p style="font-size: 15px; color: #0f172a; margin-top: 0; line-height: 1.6;">
                Dear <strong>${escapeHtml(trimmedName)}</strong>,
              </p>
              <p style="font-size: 14px; color: #334155; line-height: 1.6;">
                Thank you for reaching out to the organizing secretariat of the <strong>Himalayan Green Energy Expo 2027</strong>.
              </p>
              <p style="font-size: 14px; color: #334155; line-height: 1.6;">
                Our team has received your message regarding <strong>${escapeHtml(resolvedSubject)}</strong> (Reference ID: <code style="background-color: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${escapeHtml(inquiryId)}</code>). An expo representative will review your inquiry and get in touch with you shortly.
              </p>

              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0; font-size: 13px; line-height: 1.6;">
                <strong>Event Highlights:</strong><br/>
                &bull; <strong>Dates:</strong> 17–19 January 2027 (Magh 3–5, 2083)<br/>
                &bull; <strong>Venue:</strong> Bhrikutimandap Exhibition Hall, Kathmandu, Nepal<br/>
                &bull; <strong>Direct Hotline:</strong> +977-9703606340 / 9703606355
              </div>

              <p style="font-size: 14px; color: #334155; line-height: 1.6; margin-bottom: 0;">
                Warm regards,<br/>
                <strong>Secretariat &bull; Himalayan Green Energy Expo 2027</strong><br/>
                <a href="mailto:${receiverEmail}" style="color: #10b981; text-decoration: none;">${receiverEmail}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
        `;

        await transporter.sendMail({
          from: `"${fromName}" <${smtpUser}>`,
          to: trimmedEmail,
          subject: `Inquiry Received: ${resolvedSubject} | Himalayan Green Energy Expo 2027`,
          html: userAckHtml,
        });
      } catch (ackErr) {
        console.warn("[contact-api] User acknowledgment email skipped:", ackErr);
      }
    } else {
      console.warn("[contact-api] SMTP credentials not fully configured; inquiry logged to database only.");
    }

    return NextResponse.json({
      success: true,
      message: `Your inquiry has been received and forwarded to ${receiverEmail}.`,
      inquiryId,
    });
  } catch (err: any) {
    console.error("[contact-api] Error handling contact form:", err);
    return NextResponse.json(
      { success: false, message: err?.message || "Failed to process contact inquiry." },
      { status: 500 }
    );
  }
}
