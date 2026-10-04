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

    // 2. Prepare & Send Email to info@himalayanenergyexpo.com
    const receiverEmail = process.env.CONTACT_RECEIVER_EMAIL || CONTACT_DETAILS.emails.expo || "info@himalayanenergyexpo.com";
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

      const userTextFallback = `
Thank you for contacting Himalayan Green Energy Expo 2027
---------------------------------------------------------
Dear ${trimmedName},

Thank you for reaching out to the organizing secretariat of the Himalayan Green Energy Expo 2027.
This is an automated confirmation that we have received your inquiry. An expo representative will review your message and get in touch with you shortly.

INQUIRY DETAILS:
• Reference ID: ${inquiryId}
• Date: ${formattedDate}
• Subject / Topic: ${resolvedSubject}
• Phone: ${trimmedPhone || "Not provided"}

YOUR MESSAGE:
${trimmedMessage}

EVENT DETAILS:
• Dates: 17–19 January 2027 (Magh 3–5, 2083)
• Venue: BHRIKUTIMANDAP · KATHMANDU, NEPAL
• Direct Hotlines: +977-9703606348 / 9703606345
• Landline: 01-5268535, 4169175
• Official Expo Email: info@himalayanenergyexpo.com | info@eventsolutionnepal.com.np
• Secretariat Location: IPPAN Secretariat, Jwagal, Lalitpur, Nepal
• Website: https://www.higex.org

Warm regards,
Organizing Secretariat
Himalayan Green Energy Expo 2027
Independent Power Producers' Association, Nepal (IPPAN) & Event Solution Pvt. Ltd.
      `.trim();

      const userAckHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Inquiry Received — Himalayan Green Energy Expo 2027</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 14px rgba(0,0,0,0.06);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #04281E; padding: 28px 32px; text-align: left; border-bottom: 3px solid #10b981;">
              <div style="font-size: 11px; font-weight: 700; color: #34d399; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 6px;">
                Himalayan Green Energy Expo 2027 &bull; 5th Edition
              </div>
              <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #ffffff;">
                We Have Received Your Inquiry
              </h1>
              <p style="margin: 6px 0 0 0; font-size: 13px; color: #a7f3d0;">
                Reference ID: <code style="background-color: rgba(255,255,255,0.12); padding: 2px 6px; border-radius: 4px; font-family: monospace; color: #ffffff;">${escapeHtml(inquiryId)}</code>
              </p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 28px 32px 20px 32px;">
              <p style="font-size: 15px; color: #0f172a; margin-top: 0; line-height: 1.6;">
                Dear <strong>${escapeHtml(trimmedName)}</strong>,
              </p>
              <p style="font-size: 14px; color: #334155; line-height: 1.6;">
                Thank you for reaching out to the organizing secretariat of the <strong>Himalayan Green Energy Expo 2027</strong>.
              </p>
              <p style="font-size: 14px; color: #334155; line-height: 1.6;">
                This is an automated confirmation to let you know that our team has successfully logged your message. An official expo representative will review your inquiry and get back to you shortly.
              </p>

              <!-- Summary of Submitted Message -->
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #10b981; border-radius: 8px; padding: 18px 20px; margin: 22px 0;">
                <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 12px;">
                  Summary of Your Message
                </div>
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 13px; line-height: 1.6;">
                  <tr>
                    <td width="30%" style="color: #64748b; padding: 4px 0; font-weight: 600;">Subject:</td>
                    <td width="70%" style="color: #0f172a; padding: 4px 0; font-weight: 700;">${escapeHtml(resolvedSubject)}</td>
                  </tr>
                  ${trimmedPhone ? `
                  <tr>
                    <td style="color: #64748b; padding: 4px 0; font-weight: 600;">Contact Phone:</td>
                    <td style="color: #0f172a; padding: 4px 0;">${escapeHtml(trimmedPhone)}</td>
                  </tr>
                  ` : ''}
                  <tr>
                    <td style="color: #64748b; padding: 4px 0; font-weight: 600;">Submitted On:</td>
                    <td style="color: #0f172a; padding: 4px 0;">${escapeHtml(formattedDate)}</td>
                  </tr>
                  <tr>
                    <td colspan="2" style="padding-top: 10px;">
                      <div style="font-weight: 600; color: #64748b; margin-bottom: 4px;">Your Message:</div>
                      <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px 12px; color: #334155; white-space: pre-wrap; font-size: 13px;">${escapeHtml(trimmedMessage)}</div>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Event Overview Box -->
              <div style="background-color: #04281E; border-radius: 10px; padding: 18px 20px; color: #ffffff; margin: 20px 0; font-size: 13px; line-height: 1.6;">
                <div style="font-size: 11px; font-weight: 700; color: #34d399; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">
                  Expo Fast Facts
                </div>
                <div style="color: #ffffff; font-size: 14px; font-weight: 700; margin-bottom: 4px;">
                  17–19 January 2027 (Magh 3–5, 2083)
                </div>
                <div style="color: #cbd5e1; font-size: 13px;">
                  BHRIKUTIMANDAP · KATHMANDU, NEPAL
                </div>
                <div style="color: #94a3b8; font-size: 12px; margin-top: 6px;">
                  150+ Global Exhibitors &bull; Clean Energy Summit &bull; VIP Networking Dinner (Royal Tulip Gwarko)
                </div>
              </div>

              <!-- Secretariat Contacts Box -->
              <div style="border-top: 1px solid #e2e8f0; padding-top: 18px; margin-top: 18px; font-size: 13px; color: #475569; line-height: 1.6;">
                <p style="margin: 0 0 8px 0; font-weight: 700; color: #0f172a;">
                  Need urgent assistance? Contact us directly:
                </p>
                <p style="margin: 0 0 4px 0;">
                  &bull; <strong>Hotlines:</strong> <a href="tel:+9779703606348" style="color: #007A5E; text-decoration: none;">+977-9703606348</a> | <a href="tel:+9779703606345" style="color: #007A5E; text-decoration: none;">9703606345</a>
                </p>
                <p style="margin: 0 0 4px 0;">
                  &bull; <strong>Landline:</strong> 01-5268535, 4169175
                </p>
                <p style="margin: 0 0 4px 0;">
                  &bull; <strong>Official Emails:</strong> <a href="mailto:info@himalayanenergyexpo.com" style="color: #007A5E; text-decoration: none;">info@himalayanenergyexpo.com</a> | <a href="mailto:info@eventsolutionnepal.com.np" style="color: #007A5E; text-decoration: none;">info@eventsolutionnepal.com.np</a>
                </p>
                <p style="margin: 0;">
                  &bull; <strong>Secretariat:</strong> IPPAN Office, Jwagal, Lalitpur, Nepal
                </p>
              </div>

              <div style="margin-top: 24px; padding-top: 18px; border-top: 1px solid #e2e8f0; font-size: 13px; color: #334155;">
                Warm regards,<br/>
                <strong>Organizing Secretariat</strong><br/>
                <span style="font-size: 12px; color: #64748b;">Himalayan Green Energy Expo 2027</span><br/>
                <a href="https://www.higex.org" style="color: #007A5E; font-size: 12px; text-decoration: none;">www.higex.org</a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px 32px; text-align: center; font-size: 11px; color: #94a3b8; line-height: 1.5;">
              <p style="margin: 0;">
                Jointly Organized by <strong>Independent Power Producers&apos; Association, Nepal (IPPAN)</strong> &amp; <strong>Event Solution Pvt. Ltd.</strong>
              </p>
              <p style="margin: 4px 0 0 0;">
                &copy; 2027 Himalayan Green Energy Expo. This is an automated email confirmation.
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

      // Dispatch admin copy and user auto-reply concurrently
      const sendPromises: Promise<any>[] = [];

      // 1. Admin Notification
      sendPromises.push(
        transporter.sendMail({
          from: `"${fromName} (Website Contact)" <${smtpUser}>`,
          to: receiverEmail,
          replyTo: `"${trimmedName}" <${trimmedEmail}>`,
          subject: `[Website Inquiry] ${resolvedSubject} - ${trimmedName}`,
          text: textFallback,
          html: adminEmailHtml,
        }).catch((err) => {
          console.warn("[contact-api] Admin notification delivery issue:", err?.message || err);
        })
      );

      // 2. User Auto-Reply Acknowledgment
      sendPromises.push(
        transporter.sendMail({
          from: `"${fromName}" <${smtpUser}>`,
          to: trimmedEmail,
          replyTo: `"Expo Secretariat" <info@eventsolutionnepal.com.np>`,
          subject: `Inquiry Received: ${resolvedSubject} [Ref: ${inquiryId}] | Himalayan Green Energy Expo 2027`,
          text: userTextFallback,
          html: userAckHtml,
        }).catch((err) => {
          console.warn("[contact-api] User auto-reply delivery issue:", err?.message || err);
        })
      );

      await Promise.allSettled(sendPromises);
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
