import { NextResponse } from "next/server";
import { CONTACT_DETAILS } from "@/data/contactInfo";
import {
  getFirebaseCrawlerStats,
  getFirebaseFunnelEvents,
  getFirebaseInquiries,
  getFirebaseRegistrations,
  getFirebaseTrafficVisits,
} from "@/lib/firebaseDb";
import { getAdminSession } from "@/lib/session";
import { buildTrafficSummary, withinDays } from "@/lib/trafficSummary";
import { ruleBasedInsights } from "@/lib/trafficInsights";
import { gatewayToken, generateAiInsights } from "@/lib/aiInsights";
import { renderWeeklyReport } from "@/lib/weeklyReport";
import { sendMail } from "@/lib/mailer";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const DAYS = 7;

// GET: run by the Vercel cron every Monday (see vercel.json), authorised with CRON_SECRET.
// Admins can also call it: ?preview=1 shows the email in the browser, ?send=1 sends it now.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const cronSecret = process.env.CRON_SECRET;
  const isCron = !!cronSecret && req.headers.get("authorization") === `Bearer ${cronSecret}`;
  const isAdmin = !isCron && !!(await getAdminSession(req));
  if (!isCron && !isAdmin) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const since = new Date(Date.now() - DAYS * 24 * 60 * 60 * 1000).toISOString();
  const [visits, crawlers, funnelEvents, registrations, inquiries] = await Promise.all([
    getFirebaseTrafficVisits(since),
    getFirebaseCrawlerStats(since.slice(0, 10)),
    getFirebaseFunnelEvents(since),
    getFirebaseRegistrations(),
    getFirebaseInquiries(),
  ]);

  const summary = buildTrafficSummary({
    days: DAYS,
    visits: visits || [],
    crawlers: crawlers || [],
    funnelEvents: funnelEvents || [],
    registrations: withinDays(registrations || [], DAYS, (r: any) => r.registeredAt),
    inquiries: withinDays(inquiries || [], DAYS, (i: any) => i.submittedAt),
  });

  let insights = ruleBasedInsights(summary);
  let aiUsed = false;
  const token = gatewayToken(req);
  if (token && summary.totalVisits > 0) {
    try {
      insights = (await generateAiInsights(summary, token)).insights;
      aiUsed = true;
    } catch (e) {
      console.warn("[weekly-report] AI suggestions unavailable, using built-in ones:", e);
    }
  }

  const { subject, html } = renderWeeklyReport(summary, insights, aiUsed);

  if (isAdmin && url.searchParams.get("send") !== "1") {
    return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  }

  const recipients = (process.env.REPORT_EMAILS || CONTACT_DETAILS.emails.expo)
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);

  try {
    const via = await sendMail({ to: recipients, subject, html });
    return NextResponse.json({ success: true, sentTo: recipients, via });
  } catch (e: any) {
    console.error("[weekly-report] send failed:", e);
    return NextResponse.json({ success: false, message: e?.message || "Failed to send report" }, { status: 500 });
  }
}
