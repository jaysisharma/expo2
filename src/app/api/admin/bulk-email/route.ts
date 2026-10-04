import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import {
  sendBulkEmailsWithResend,
  renderEmailForRecipient,
  getResendClient,
  BulkEmailPayload,
  RecipientData,
} from "@/lib/resend";
import {
  getFirebaseEmailCampaigns,
  addFirebaseEmailCampaign,
} from "@/lib/firebaseDb";

export const dynamic = "force-dynamic";

const ROOT_CAMPAIGNS_PATH = path.join(process.cwd(), "data", "emailCampaigns.json");
const SRC_CAMPAIGNS_PATH = path.join(process.cwd(), "src", "data", "emailCampaigns.json");

async function getLocalCampaigns(): Promise<any[]> {
  try {
    const raw = await fs.readFile(ROOT_CAMPAIGNS_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    try {
      const raw = await fs.readFile(SRC_CAMPAIGNS_PATH, "utf-8");
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }
}

async function saveCampaignLocally(campaign: any) {
  try {
    const list = await getLocalCampaigns();
    list.unshift(campaign);
    // Keep last 100
    const trimmed = list.slice(0, 100);
    const jsonStr = JSON.stringify(trimmed, null, 2);

    await fs.mkdir(path.dirname(ROOT_CAMPAIGNS_PATH), { recursive: true }).catch(() => {});
    await fs.mkdir(path.dirname(SRC_CAMPAIGNS_PATH), { recursive: true }).catch(() => {});
    await fs.writeFile(ROOT_CAMPAIGNS_PATH, jsonStr, "utf-8").catch(() => {});
    await fs.writeFile(SRC_CAMPAIGNS_PATH, jsonStr, "utf-8").catch(() => {});
  } catch (err) {
    console.warn("[bulk-email-api] Local campaign save error:", err);
  }
}

export async function GET() {
  try {
    const isConfigured = !!process.env.RESEND_API_KEY;
    const defaultSender = process.env.RESEND_FROM_EMAIL || "Himalayan Green Energy Expo <info@himalayanenergyexpo.com>";

    // Fetch campaigns history
    let campaigns = await getFirebaseEmailCampaigns();
    if (!campaigns || campaigns.length === 0) {
      campaigns = await getLocalCampaigns();
    }

    return NextResponse.json({
      success: true,
      configured: isConfigured,
      defaultSender,
      campaigns: campaigns || [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to fetch email settings" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, payload } = body;

    const resend = getResendClient();
    if (!resend && action !== "preview") {
      return NextResponse.json(
        {
          success: false,
          message: "RESEND_API_KEY is not configured in your environment variables.",
        },
        { status: 400 }
      );
    }

    // 1. Live Preview of Template
    if (action === "preview") {
      const { templateType, subject, headline, customMessage, ctaText, ctaUrl, sampleRecipient } = payload || {};
      const sample: RecipientData = sampleRecipient || {
        name: "Er. Bikash Sharma",
        email: "bikash@example.com",
        organization: "Nepal Hydropower Development Corp",
        passId: "HHE26-849201",
        stallNumber: "STALL-B04",
        passType: "Official Exhibitor Pass",
        role: "exhibitor",
        country: "Nepal",
      };

      const rendered = renderEmailForRecipient(sample, {
        recipients: [sample],
        subject: subject || "Himalayan Green Energy Expo 2027",
        templateType: templateType || "announcement",
        headline,
        customMessage,
        ctaText,
        ctaUrl,
      });

      return NextResponse.json({
        success: true,
        preview: rendered,
      });
    }

    // 2. Test Email (Single Recipient)
    if (action === "send_test") {
      const { testEmail, subject, templateType, headline, customMessage, ctaText, ctaUrl, fromName, fromEmail, replyTo, sampleRecipient } = payload || {};

      if (!testEmail || !testEmail.includes("@")) {
        return NextResponse.json(
          { success: false, message: "Please provide a valid test recipient email." },
          { status: 400 }
        );
      }

      const emailPayload: BulkEmailPayload = {
        recipients: sampleRecipient ? [sampleRecipient] : [],
        testEmailOnly: testEmail.trim(),
        subject,
        templateType,
        headline,
        customMessage,
        ctaText,
        ctaUrl,
        fromName,
        fromEmail,
        replyTo,
      };

      const result = await sendBulkEmailsWithResend(emailPayload);

      return NextResponse.json({
        success: true,
        message: `Test email successfully sent to ${testEmail}!`,
        result,
      });
    }

    // 3. Send Bulk Campaign
    if (action === "send_bulk") {
      const { recipients, subject, templateType, headline, customMessage, ctaText, ctaUrl, fromName, fromEmail, replyTo, campaignTitle } = payload || {};

      if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
        return NextResponse.json(
          { success: false, message: "Recipient list is empty. Please select or add recipients." },
          { status: 400 }
        );
      }

      const emailPayload: BulkEmailPayload = {
        recipients,
        subject,
        templateType,
        headline,
        customMessage,
        ctaText,
        ctaUrl,
        fromName,
        fromEmail,
        replyTo,
      };

      const result = await sendBulkEmailsWithResend(emailPayload);

      // Record campaign log
      const campaignRecord = {
        id: `CMP-${Date.now()}`,
        title: campaignTitle || subject || "Bulk Announcement",
        subject,
        templateType,
        totalRecipients: result.totalRecipients,
        successful: result.successful,
        failed: result.failed,
        engine: "resend",
        sentAt: new Date().toISOString(),
        sender: fromEmail || process.env.RESEND_FROM_EMAIL || "info@himalayanenergyexpo.com",
      };

      await Promise.all([
        saveCampaignLocally(campaignRecord),
        addFirebaseEmailCampaign(campaignRecord).catch(() => {}),
      ]);

      return NextResponse.json({
        success: true,
        message: `Campaign complete! Sent ${result.successful} of ${result.totalRecipients} emails via Resend.`,
        result,
      });
    }

    // 4. Fetch Campaign History
    if (action === "get_history") {
      let campaigns = await getFirebaseEmailCampaigns();
      if (!campaigns || campaigns.length === 0) {
        campaigns = await getLocalCampaigns();
      }
      return NextResponse.json({
        success: true,
        campaigns: campaigns || [],
      });
    }

    return NextResponse.json(
      { success: false, message: `Unknown action: ${action}` },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("[bulk-email-api] Error processing request:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to process bulk email request." },
      { status: 500 }
    );
  }
}
