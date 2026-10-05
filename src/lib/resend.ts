import { Resend } from "resend";

export interface RecipientData {
  email: string;
  name?: string;
  organization?: string;
  passId?: string;
  stallNumber?: string;
  role?: string;
  passType?: string;
  country?: string;
  phone?: string;
  [key: string]: any;
}

export interface BulkEmailPayload {
  recipients: RecipientData[];
  subject: string;
  templateType: "pass_reminder" | "announcement" | "exhibitor_brief" | "schedule_update" | "custom";
  customMessage?: string;
  headline?: string;
  ctaText?: string;
  ctaUrl?: string;
  fromName?: string;
  fromEmail?: string;
  replyTo?: string;
  testEmailOnly?: string;
}

export function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new Resend(apiKey);
}

export function escapeHtml(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function replaceVariables(text: string, data: RecipientData): string {
  if (!text) return "";
  return text
    .replace(/\{\{name\}\}/gi, data.name || "Valued Delegate")
    .replace(/\{\{organization\}\}/gi, data.organization || "Himalayan Green Energy Expo")
    .replace(/\{\{passId\}\}/gi, data.passId || "N/A")
    .replace(/\{\{stallNumber\}\}/gi, data.stallNumber || "Main Exhibition Hall")
    .replace(/\{\{passType\}\}/gi, data.passType || data.role || "Official Pass")
    .replace(/\{\{role\}\}/gi, data.role || "Visitor")
    .replace(/\{\{country\}\}/gi, data.country || "Nepal")
    .replace(/\{\{email\}\}/gi, data.email || "")
    .replace(/\{\{phone\}\}/gi, data.phone || "");
}

/**
 * Standard Email Shell with Brand Aesthetics
 */
function wrapEmailShell(opts: {
  preheader: string;
  headerCategory: string;
  headerTitle: string;
  headerSubtitle: string;
  contentHtml: string;
}): string {
  const { preheader, headerCategory, headerTitle, headerSubtitle, contentHtml } = opts;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
  <title>${escapeHtml(headerTitle)}</title>
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    @media screen and (max-width: 600px) {
      .container-table { width: 100% !important; border-radius: 0 !important; }
      .mobile-padding { padding-left: 20px !important; padding-right: 20px !important; }
      .mobile-stack { display: block !important; width: 100% !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;color:#1e293b;">
  <!-- Preheader preview text -->
  <div style="display:none;font-size:1px;color:#f1f5f9;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${escapeHtml(preheader)} &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f1f5f9;padding:32px 12px;">
    <tr>
      <td align="center">
        <table class="container-table" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 6px 24px rgba(0,0,0,0.05);">
          
          <!-- Top Emerald Brand Bar -->
          <tr>
            <td style="background: linear-gradient(90deg, #5B9F35 0%, #218A59 50%, #234679 100%); height: 4px; font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>

          <!-- Header Section -->
          <tr>
            <td style="background-color:#04281E;padding:32px 36px 28px;text-align:left;" class="mobile-padding">
              <div style="font-size:11px;font-weight:700;color:#10b981;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:8px;">
                ${escapeHtml(headerCategory)}
              </div>
              <h1 style="margin:0;font-size:23px;font-weight:800;color:#ffffff;line-height:1.3;letter-spacing:-0.4px;">
                ${escapeHtml(headerTitle)}
              </h1>
              <div style="margin-top:8px;font-size:13px;color:#94a3b8;line-height:1.5;">
                ${escapeHtml(headerSubtitle)}
              </div>
            </td>
          </tr>

          <!-- Main Content Area -->
          <tr>
            <td style="padding:32px 36px;" class="mobile-padding">
              ${contentHtml}
            </td>
          </tr>

          <!-- Quick Event Details Strip -->
          <tr>
            <td style="padding:0 36px 28px;" class="mobile-padding">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px 20px;">
                <tr>
                  <td>
                    <div style="font-size:11px;font-weight:700;color:#047857;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;">
                      Expo Key Logistics
                    </div>
                    <div style="font-size:13px;font-weight:700;color:#0f172a;margin-bottom:2px;">
                      17–19 January 2027 (Magh 3–5, 2083) &bull; 10:00 AM – 6:00 PM
                    </div>
                    <div style="font-size:12px;color:#64748b;">
                      BHRIKUTIMANDAP &bull; KATHMANDU, NEPAL
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Executive Footer -->
          <tr>
            <td style="background-color:#f8fafc;border-top:1px solid #e2e8f0;padding:24px 36px;text-align:center;" class="mobile-padding">
              <div style="font-size:12px;font-weight:700;color:#1e293b;">
                Himalayan Green Energy Expo 2027
              </div>
              <div style="margin-top:4px;font-size:11px;color:#64748b;line-height:1.6;">
                Organizing Secretariat: IPPAN &amp; Event Solution Pvt. Ltd.<br/>
                Email: <a href="mailto:info@eventsolutionnepal.com.np" style="color:#007A5E;text-decoration:none;font-weight:600;">info@eventsolutionnepal.com.np</a> &bull; Hotlines: +977-9703606348 / +977-9703606345
              </div>
              <div style="margin-top:10px;font-size:10px;color:#94a3b8;line-height:1.4;">
                You are receiving this official correspondence as a registered attendee, exhibitor, or partner of the Himalayan Green Energy Expo.
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

/**
 * Template 1: Pass & Entry Accreditation Reminder
 */
export function generatePassReminderTemplate(recipient: RecipientData, payload: BulkEmailPayload): { subject: string; html: string; text: string } {
  const name = recipient.name || "Valued Delegate";
  const org = recipient.organization || "Himalayan Green Energy Expo";
  const passId = recipient.passId || "HHE-PENDING";
  const passType = recipient.passType || recipient.role || "Official Entry Pass";
  const stall = recipient.stallNumber;

  const subject = replaceVariables(payload.subject || "Official Entry Pass Reminder — Himalayan Green Energy Expo 2027", recipient);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://greenenergyexpo.org.np";
  const passVerificationUrl = `${appUrl}/verify?id=${encodeURIComponent(passId)}`;

  const contentHtml = `
    <p style="margin:0 0 16px;font-size:15px;color:#0f172a;line-height:1.6;">
      Dear <strong>${escapeHtml(name)}</strong>,
    </p>
    <p style="margin:0 0 20px;font-size:14px;color:#334155;line-height:1.6;">
      This is a quick reminder regarding your accreditation for the upcoming <strong>Himalayan Green Energy Expo 2027</strong> in Kathmandu. Your digital credential is active and verified in our organizer database.
    </p>

    <!-- Pass Ticket Box -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f0fdf4;border:1px solid #bbf7d0;border-radius:14px;padding:22px 20px;margin-bottom:24px;text-align:center;">
      <tr>
        <td align="center">
          <div style="display:inline-block;padding:4px 14px;background-color:#dcfce7;color:#166534;border:1px solid #86efac;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;margin-bottom:12px;">
            ${escapeHtml(passType)}
          </div>
          <div style="font-size:20px;font-weight:800;color:#0f172a;margin-bottom:4px;">
            ${escapeHtml(name)}
          </div>
          <div style="font-size:13px;font-weight:600;color:#475569;margin-bottom:14px;">
            ${escapeHtml(org)}
          </div>
          <div style="display:inline-block;background-color:#ffffff;border:1px solid #cbd5e1;border-radius:10px;padding:8px 18px;font-family:monospace;font-size:14px;font-weight:700;color:#0f172a;letter-spacing:1px;margin-bottom:16px;">
            PASS ID: ${escapeHtml(passId)}
          </div>
          ${stall ? `<div style="font-size:12px;font-weight:700;color:#047857;margin-bottom:16px;">STALL NUMBER: ${escapeHtml(stall)}</div>` : ""}
          <div>
            <a href="${passVerificationUrl}" target="_blank" style="display:inline-block;background-color:#04281E;color:#ffffff;text-decoration:none;font-size:13px;font-weight:700;padding:12px 28px;border-radius:8px;box-shadow:0 3px 8px rgba(4,40,30,0.25);">
              Access Your Digital Pass Online &rarr;
            </a>
          </div>
        </td>
      </tr>
    </table>

    ${payload.customMessage ? `
      <div style="background-color:#f8fafc;border-left:4px solid #007A5E;padding:14px 16px;border-radius:6px;margin-bottom:20px;font-size:13px;line-height:1.6;color:#334155;">
        ${escapeHtml(replaceVariables(payload.customMessage, recipient)).replace(/\n/g, "<br/>")}
      </div>
    ` : ""}

    <div style="font-size:12px;font-weight:700;color:#0f172a;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px;">
      Fast-Track Gate Entry Notes
    </div>
    <ul style="margin:0 0 20px;padding-left:18px;font-size:13px;color:#475569;line-height:1.7;">
      <li>Please present this email or your pass barcode on your mobile device at Entrance Gate 1 or 2.</li>
      <li>Carrying a government photo identification card or business visiting card is recommended.</li>
      <li>Badge printing counters will be open starting 9:00 AM on 17 January 2027.</li>
    </ul>
  `;

  const html = wrapEmailShell({
    preheader: `Your digital entry pass reminder for Himalayan Green Energy Expo 2027: ${passId}`,
    headerCategory: "Official Entry Accreditation",
    headerTitle: "Your Expo Pass & Admission Details",
    headerSubtitle: "17–19 January 2027 &bull; BHRIKUTIMANDAP &bull; KATHMANDU, NEPAL",
    contentHtml,
  });

  const text = `
Himalayan Green Energy Expo 2027 — Official Pass Reminder
Dear ${name},

This is a reminder regarding your registration for the Himalayan Green Energy Expo 2027.
Attendee: ${name}
Organization: ${org}
Pass Type: ${passType}
Badge ID: ${passId}
${stall ? `Stall: ${stall}\n` : ""}
Verify or view your pass: ${passVerificationUrl}

Dates: 17–19 January 2027 (10:00 AM – 6:00 PM)
Venue: BHRIKUTIMANDAP, KATHMANDU, NEPAL

Organizing Secretariat
IPPAN & Event Solution Pvt. Ltd.
info@eventsolutionnepal.com.np
  `.trim();

  return { subject, html, text };
}

/**
 * Template 2: General Announcement / Broadcast
 */
export function generateAnnouncementTemplate(recipient: RecipientData, payload: BulkEmailPayload): { subject: string; html: string; text: string } {
  const name = recipient.name || "Valued Delegate";
  const subject = replaceVariables(payload.subject || "Important Announcement: Himalayan Green Energy Expo 2027", recipient);
  const headline = replaceVariables(payload.headline || "Official Expo Announcement & Highlights", recipient);
  const messageBody = replaceVariables(payload.customMessage || "We are pleased to share the latest updates for the upcoming Himalayan Green Energy Expo 2027.", recipient);

  const ctaButtonHtml = payload.ctaText && payload.ctaUrl ? `
    <div style="margin:26px 0;text-align:center;">
      <a href="${escapeHtml(payload.ctaUrl)}" target="_blank" style="display:inline-block;background-color:#218A59;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:12px 32px;border-radius:10px;box-shadow:0 3px 10px rgba(33,138,89,0.25);">
        ${escapeHtml(payload.ctaText)} &rarr;
      </a>
    </div>
  ` : "";

  const contentHtml = `
    <p style="margin:0 0 16px;font-size:15px;color:#0f172a;line-height:1.6;">
      Dear <strong>${escapeHtml(name)}</strong>,
    </p>
    
    <div style="font-size:17px;font-weight:800;color:#0f172a;margin-bottom:12px;letter-spacing:-0.2px;">
      ${escapeHtml(headline)}
    </div>

    <div style="font-size:14px;color:#334155;line-height:1.7;margin-bottom:20px;white-space:pre-wrap;">
${escapeHtml(messageBody)}
    </div>

    ${ctaButtonHtml}

    <div style="margin-top:24px;padding-top:18px;border-top:1px solid #f1f5f9;font-size:13px;color:#64748b;line-height:1.6;">
      For any inquiries, feel free to reply directly to this email or contact our support team.
    </div>
  `;

  const html = wrapEmailShell({
    preheader: headline.slice(0, 100),
    headerCategory: "Official Announcement",
    headerTitle: headline,
    headerSubtitle: "Himalayan Green Energy Expo 2027 &bull; Kathmandu",
    contentHtml,
  });

  const text = `
${headline}
Himalayan Green Energy Expo 2027

Dear ${name},

${messageBody}

${payload.ctaText && payload.ctaUrl ? `${payload.ctaText}: ${payload.ctaUrl}\n` : ""}
Organizing Secretariat
IPPAN & Event Solution Pvt. Ltd.
info@eventsolutionnepal.com.np
  `.trim();

  return { subject, html, text };
}

/**
 * Template 3: Exhibitor Stall & Logistics Brief
 */
export function generateExhibitorBriefTemplate(recipient: RecipientData, payload: BulkEmailPayload): { subject: string; html: string; text: string } {
  const name = recipient.name || "Exhibitor Representative";
  const org = recipient.organization || "Exhibitor Partner";
  const stall = recipient.stallNumber || "Main Hall";
  const passId = recipient.passId || "EXH-PASS";

  const subject = replaceVariables(payload.subject || "Exhibitor Logistics & Booth Setup Guidelines — Himalayan Green Energy Expo", recipient);

  const contentHtml = `
    <p style="margin:0 0 16px;font-size:15px;color:#0f172a;line-height:1.6;">
      Dear <strong>${escapeHtml(name)}</strong> (${escapeHtml(org)}),
    </p>
    <p style="margin:0 0 20px;font-size:14px;color:#334155;line-height:1.6;">
      We look forward to welcoming you to the <strong>Himalayan Green Energy Expo 2027</strong>. Please review the mandatory stall setup timeline and logistical checklist below:
    </p>

    <!-- Stall Overview Card -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;margin-bottom:24px;overflow:hidden;">
      <tr style="background-color:#f1f5f9;">
        <td colspan="2" style="padding:10px 16px;font-size:11px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:0.5px;">
          Exhibitor Space Allocation
        </td>
      </tr>
      <tr>
        <td style="padding:10px 16px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#64748b;width:40%;">Assigned Stall</td>
        <td style="padding:10px 16px;border-bottom:1px solid #f1f5f9;font-size:14px;font-weight:800;color:#047857;">${escapeHtml(stall)}</td>
      </tr>
      <tr>
        <td style="padding:10px 16px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#64748b;">Exhibitor Company</td>
        <td style="padding:10px 16px;border-bottom:1px solid #f1f5f9;font-size:13px;font-weight:700;color:#0f172a;">${escapeHtml(org)}</td>
      </tr>
      <tr>
        <td style="padding:10px 16px;font-size:13px;color:#64748b;">Accreditation Ref</td>
        <td style="padding:10px 16px;font-size:13px;font-family:monospace;color:#0f172a;">${escapeHtml(passId)}</td>
      </tr>
    </table>

    <div style="font-size:13px;font-weight:700;color:#0f172a;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px;">
      Booth Setup & Move-In Schedule
    </div>
    <ul style="margin:0 0 20px;padding-left:18px;font-size:13px;color:#475569;line-height:1.7;">
      <li><strong>Custom Bare Space Setup:</strong> 15 January 2027 (from 9:00 AM onwards).</li>
      <li><strong>Standard Shell Scheme Possession:</strong> 16 January 2027 (from 12:00 PM to 8:00 PM).</li>
      <li><strong>Exhibition Public Days:</strong> 17–19 January 2027 (10:00 AM – 6:00 PM daily).</li>
      <li><strong>Dismantling & Move-Out:</strong> 19 January 2027 (after 6:30 PM).</li>
    </ul>

    ${payload.customMessage ? `
      <div style="background-color:#ecfdf5;border-left:4px solid #10b981;padding:14px 16px;border-radius:6px;margin-bottom:20px;font-size:13px;line-height:1.6;color:#064e3b;">
        <strong>Special Organizer Notice:</strong><br/>
        ${escapeHtml(replaceVariables(payload.customMessage, recipient)).replace(/\n/g, "<br/>")}
      </div>
    ` : ""}

    <div style="font-size:12px;color:#64748b;line-height:1.6;">
      Need electrical, rigging, or freight handling assistance? Contact the exhibitor liaison directly at <strong>+977-9703606348</strong>.
    </div>
  `;

  const html = wrapEmailShell({
    preheader: `Exhibitor stall setup details for ${org} (Stall: ${stall})`,
    headerCategory: "Exhibitor Logistics",
    headerTitle: "Booth Setup & Exhibitor Guidelines",
    headerSubtitle: `Assigned Stall: ${stall} &bull; BHRIKUTIMANDAP &bull; KATHMANDU, NEPAL`,
    contentHtml,
  });

  const text = `
Exhibitor Logistics & Setup — Himalayan Green Energy Expo 2027
Dear ${name} (${org}),

Assigned Stall: ${stall}
Pass ID: ${passId}

Setup Timeline:
- Custom Bare Space Setup: 15 January 2027 (from 9:00 AM)
- Shell Scheme Move-in: 16 January 2027 (12:00 PM - 8:00 PM)
- Expo Opening: 17–19 January 2027 (10:00 AM - 6:00 PM)

${payload.customMessage || ""}

Organizing Secretariat
info@eventsolutionnepal.com.np | +977-9703606348
  `.trim();

  return { subject, html, text };
}

/**
 * Template 4: Conference & Schedule Update
 */
export function generateScheduleUpdateTemplate(recipient: RecipientData, payload: BulkEmailPayload): { subject: string; html: string; text: string } {
  const name = recipient.name || "Delegate";
  const subject = replaceVariables(payload.subject || "Conference Schedule & Keynote Sessions — Himalayan Green Energy Expo 2027", recipient);

  const contentHtml = `
    <p style="margin:0 0 16px;font-size:15px;color:#0f172a;line-height:1.6;">
      Dear <strong>${escapeHtml(name)}</strong>,
    </p>
    <p style="margin:0 0 20px;font-size:14px;color:#334155;line-height:1.6;">
      We are excited to share the official schedule for the <strong>Clean Energy Summit 2027</strong> running alongside the exhibition at Bhrikutimandap, Kathmandu:
    </p>

    <!-- Schedule Highlights Table -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e2e8f0;border-radius:12px;margin-bottom:24px;font-size:13px;overflow:hidden;">
      <tr style="background-color:#f8fafc;">
        <td style="padding:10px 14px;font-weight:700;color:#0f172a;border-bottom:1px solid #e2e8f0;">Day 1 &bull; 17 Jan</td>
        <td style="padding:10px 14px;color:#334155;border-bottom:1px solid #e2e8f0;"><strong>Inauguration &amp; Cross-Border Power Trade</strong><br/><span style="color:#64748b;font-size:12px;">11:00 AM – 4:00 PM &bull; Main Stage Hall</span></td>
      </tr>
      <tr>
        <td style="padding:10px 14px;font-weight:700;color:#0f172a;border-bottom:1px solid #e2e8f0;">Day 2 &bull; 18 Jan</td>
        <td style="padding:10px 14px;color:#334155;border-bottom:1px solid #e2e8f0;"><strong>Solar, Wind &amp; Hydrogen Storage Innovations</strong><br/><span style="color:#64748b;font-size:12px;">10:30 AM – 3:30 PM &bull; Technical Hall</span></td>
      </tr>
      <tr style="background-color:#f8fafc;">
        <td style="padding:10px 14px;font-weight:700;color:#0f172a;">Day 3 &bull; 19 Jan</td>
        <td style="padding:10px 14px;color:#334155;"><strong>Green Financing, ESG &amp; Closing Ceremony</strong><br/><span style="color:#64748b;font-size:12px;">10:30 AM – 2:00 PM &bull; Main Stage Hall</span></td>
      </tr>
    </table>

    ${payload.customMessage ? `
      <div style="background-color:#f8fafc;border-left:4px solid #007A5E;padding:14px 16px;border-radius:6px;margin-bottom:20px;font-size:13px;line-height:1.6;color:#334155;">
        ${escapeHtml(replaceVariables(payload.customMessage, recipient)).replace(/\n/g, "<br/>")}
      </div>
    ` : ""}

    <div style="text-align:center;margin:24px 0 10px;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://greenenergyexpo.org.np"}/conference" target="_blank" style="display:inline-block;background-color:#04281E;color:#ffffff;text-decoration:none;font-size:13px;font-weight:700;padding:12px 28px;border-radius:8px;">
        View Full Speaker Lineup &rarr;
      </a>
    </div>
  `;

  const html = wrapEmailShell({
    preheader: "Official Conference Schedule & Keynote Sessions for Himalayan Green Energy Expo",
    headerCategory: "Conference Programme",
    headerTitle: "Summit Schedule & Sessions",
    headerSubtitle: "17–19 January 2027 &bull; BHRIKUTIMANDAP &bull; KATHMANDU, NEPAL",
    contentHtml,
  });

  const text = `
Conference Schedule — Himalayan Green Energy Expo 2027
Dear ${name},

Official session schedule:
- 17 Jan: Inauguration & Cross-Border Power Trade (11 AM - 4 PM)
- 18 Jan: Solar, Wind & Hydrogen Innovations (10:30 AM - 3:30 PM)
- 19 Jan: Green Financing, ESG & Closing (10:30 AM - 2:00 PM)

${payload.customMessage || ""}

More details: ${process.env.NEXT_PUBLIC_APP_URL || "https://greenenergyexpo.org.np"}/conference
Organizing Secretariat
  `.trim();

  return { subject, html, text };
}

/**
 * Template 5: Custom Composed Email
 */
export function generateCustomTemplate(recipient: RecipientData, payload: BulkEmailPayload): { subject: string; html: string; text: string } {
  const name = recipient.name || "Delegate";
  const subject = replaceVariables(payload.subject || "Message from Himalayan Green Energy Expo 2027", recipient);
  const headline = replaceVariables(payload.headline || "Official Communication", recipient);
  const rawBody = replaceVariables(payload.customMessage || "Greetings from Himalayan Green Energy Expo 2027.", recipient);

  const ctaButtonHtml = payload.ctaText && payload.ctaUrl ? `
    <div style="margin:24px 0;text-align:center;">
      <a href="${escapeHtml(payload.ctaUrl)}" target="_blank" style="display:inline-block;background-color:#218A59;color:#ffffff;text-decoration:none;font-size:13px;font-weight:700;padding:12px 28px;border-radius:8px;">
        ${escapeHtml(payload.ctaText)} &rarr;
      </a>
    </div>
  ` : "";

  const contentHtml = `
    <p style="margin:0 0 16px;font-size:15px;color:#0f172a;line-height:1.6;">
      Dear <strong>${escapeHtml(name)}</strong>,
    </p>
    <div style="font-size:14px;color:#334155;line-height:1.7;white-space:pre-wrap;margin-bottom:20px;">
${escapeHtml(rawBody)}
    </div>
    ${ctaButtonHtml}
  `;

  const html = wrapEmailShell({
    preheader: headline.slice(0, 100),
    headerCategory: "Official Update",
    headerTitle: headline,
    headerSubtitle: "Himalayan Green Energy Expo 2027 &bull; Kathmandu",
    contentHtml,
  });

  const text = `
${headline}
Himalayan Green Energy Expo 2027

Dear ${name},

${rawBody}

${payload.ctaText && payload.ctaUrl ? `${payload.ctaText}: ${payload.ctaUrl}\n` : ""}
Organizing Secretariat
IPPAN & Event Solution Pvt. Ltd.
  `.trim();

  return { subject, html, text };
}

/**
 * Main dispatcher to render an email for a specific recipient based on templateType
 */
export function renderEmailForRecipient(
  recipient: RecipientData,
  payload: BulkEmailPayload
): { subject: string; html: string; text: string } {
  switch (payload.templateType) {
    case "pass_reminder":
      return generatePassReminderTemplate(recipient, payload);
    case "announcement":
      return generateAnnouncementTemplate(recipient, payload);
    case "exhibitor_brief":
      return generateExhibitorBriefTemplate(recipient, payload);
    case "schedule_update":
      return generateScheduleUpdateTemplate(recipient, payload);
    case "custom":
    default:
      return generateCustomTemplate(recipient, payload);
  }
}

/**
 * Send bulk emails exclusively via Resend API in batches of up to 100
 */
export async function sendBulkEmailsWithResend(payload: BulkEmailPayload) {
  const resend = getResendClient();
  if (!resend) {
    throw new Error("Resend API key is not configured. Please add RESEND_API_KEY to your environment variables.");
  }

  const { recipients, fromName, fromEmail, replyTo, testEmailOnly } = payload;
  const senderName = fromName || "Himalayan Green Energy Expo 2027";
  
  // Cleanly parse sender email if formatted as "Name <email@domain.com>" or just "email@domain.com"
  const rawSender = fromEmail || process.env.RESEND_FROM_EMAIL || "info@himalayanenergyexpo.com";
  const emailMatch = rawSender.match(/<([^>]+)>/);
  const cleanSenderEmail = emailMatch ? emailMatch[1].trim() : rawSender.trim();
  const formattedFrom = `"${senderName}" <${cleanSenderEmail}>`;
  const resolvedReplyTo = replyTo || process.env.RESEND_REPLY_TO || "info@himalayanenergyexpo.com";

  const isProhibitedDomain = (email: string) => {
    const lower = (email || "").toLowerCase().trim();
    return (
      lower.endsWith("@example.com") ||
      lower.endsWith("@example.org") ||
      lower.endsWith("@example.net") ||
      lower.endsWith("@test.com")
    );
  };

  // 1. Single Test Email Delivery via Resend
  if (testEmailOnly) {
    if (isProhibitedDomain(testEmailOnly)) {
      throw new Error(
        `Resend rejects '@example.com' test domains. Please enter a real email address (e.g. your Gmail or company email) to receive the test email.`
      );
    }

    const sampleRecipient: RecipientData = recipients[0] || {
      name: "Test Delegate",
      email: testEmailOnly,
      organization: "IPPAN Clean Energy Council",
      passId: "TEST-789012",
      stallNumber: "STALL-A12",
      passType: "VIP Delegate Pass",
      role: "delegate",
      country: "Nepal",
    };

    const rendered = renderEmailForRecipient(sampleRecipient, payload);

    const { data, error } = await resend.emails.send({
      from: formattedFrom,
      to: [testEmailOnly.trim()],
      replyTo: resolvedReplyTo,
      subject: `[TEST EMAIL] ${rendered.subject}`,
      html: rendered.html,
      text: rendered.text,
    });

    if (error) {
      throw new Error(`Resend test email failed: ${error.message}`);
    }

    return {
      success: true,
      mode: "test",
      engineUsed: "resend",
      totalRecipients: 1,
      successful: 1,
      failed: 0,
      results: [{ email: testEmailOnly, status: "sent", id: data?.id, engine: "resend" }],
    };
  }

  // 2. Bulk Recipients Validation
  if (!recipients || recipients.length === 0) {
    throw new Error("No recipients provided for bulk email.");
  }

  const deliveryResults: Array<{
    email: string;
    name?: string;
    status: "sent" | "failed";
    engine: "resend";
    error?: string;
    id?: string;
  }> = [];

  // Filter out invalid emails and flag prohibited RFC test domains (example.com)
  const validRecipients: RecipientData[] = [];
  let totalSuccessful = 0;
  let totalFailed = 0;

  for (const r of recipients) {
    if (!r.email || !r.email.includes("@")) {
      deliveryResults.push({
        email: r.email || "unknown",
        name: r.name,
        status: "failed",
        engine: "resend",
        error: "Missing or invalid email format",
      });
      totalFailed++;
    } else if (isProhibitedDomain(r.email)) {
      deliveryResults.push({
        email: r.email,
        name: r.name,
        status: "failed",
        engine: "resend",
        error: "Skipped: RFC mock domain '@example.com' prohibited by Resend.",
      });
      totalFailed++;
    } else {
      validRecipients.push(r);
    }
  }

  if (validRecipients.length === 0) {
    return {
      success: false,
      engineUsed: "resend",
      totalRecipients: recipients.length,
      successful: 0,
      failed: totalFailed,
      batchCount: 0,
      results: deliveryResults,
    };
  }

  const BATCH_SIZE = 100;
  const batches: RecipientData[][] = [];
  for (let i = 0; i < validRecipients.length; i += BATCH_SIZE) {
    batches.push(validRecipients.slice(i, i + BATCH_SIZE));
  }


  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const currentBatch = batches[batchIndex];

    const emailBatchPayload = currentBatch.map((recipient) => {
      const rendered = renderEmailForRecipient(recipient, payload);
      return {
        from: formattedFrom,
        to: [recipient.email.trim()],
        replyTo: resolvedReplyTo,
        subject: rendered.subject,
        html: rendered.html,
        text: rendered.text,
      };
    });

    try {
      const { data, error } = await resend.batch.send(emailBatchPayload);

      if (error) {
        currentBatch.forEach((r) => {
          deliveryResults.push({
            email: r.email,
            name: r.name,
            status: "failed",
            engine: "resend",
            error: error.message,
          });
        });
        totalFailed += currentBatch.length;
      } else if (data?.data) {
        data.data.forEach((item: any, idx: number) => {
          const r = currentBatch[idx];
          if (item?.id) {
            deliveryResults.push({
              email: r.email,
              name: r.name,
              status: "sent",
              engine: "resend",
              id: item.id,
            });
            totalSuccessful++;
          } else {
            deliveryResults.push({
              email: r.email,
              name: r.name,
              status: "failed",
              engine: "resend",
              error: item?.error?.message || "Delivery rejected by Resend",
            });
            totalFailed++;
          }
        });
      }
    } catch (batchErr: any) {
      currentBatch.forEach((r) => {
        deliveryResults.push({
          email: r.email,
          name: r.name,
          status: "failed",
          engine: "resend",
          error: batchErr?.message || "Resend connection error",
        });
      });
      totalFailed += currentBatch.length;
    }

    if (batchIndex < batches.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 600));
    }
  }

  return {
    success: totalSuccessful > 0,
    engineUsed: "resend",
    totalRecipients: validRecipients.length,
    successful: totalSuccessful,
    failed: totalFailed,
    batchCount: batches.length,
    results: deliveryResults,
  };
}

