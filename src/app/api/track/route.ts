import { NextRequest, NextResponse } from "next/server";
import {
  addFirebaseTrafficVisit,
  getFirebaseTrafficVisits,
  getFirebaseCrawlerStats,
  addFirebaseFunnelEvent,
  getFirebaseFunnelEvents,
} from "@/lib/firebaseDb";
import { detectCrawler } from "@/lib/crawlers";
import { getAdminSession, getStaffOrAdminSession } from "@/lib/session";

export const dynamic = "force-dynamic";

const FUNNEL_FLOWS = ["registration", "stall_booking", "dinner", "ev_rally", "contact", "payment"];
const FUNNEL_STEPS = ["start", "submit", "success", "failed"];

function str(value: unknown, max = 200) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function deviceFromUA(ua: string) {
  if (/ipad|tablet/i.test(ua)) return "tablet";
  if (/mobi|android|iphone/i.test(ua)) return "mobile";
  return "desktop";
}

// POST: record one visit (sent once per browser session by TrafficSourceTracker)
export async function POST(req: NextRequest) {
  try {
    const ua = req.headers.get("user-agent") || "";
    if (detectCrawler(ua)) return NextResponse.json({ success: true, skipped: "bot" });
    // Logged-in admins and staff browsing or testing the site aren't real visitors
    if (await getStaffOrAdminSession(req)) return NextResponse.json({ success: true, skipped: "team" });

    const body = await req.json().catch(() => ({}));

    // Funnel step (form started / submitted, payment succeeded / failed)
    if (body.type === "funnel") {
      if (!FUNNEL_FLOWS.includes(body.flow) || !FUNNEL_STEPS.includes(body.step)) {
        return NextResponse.json({ success: false }, { status: 400 });
      }
      await addFirebaseFunnelEvent({
        flow: body.flow,
        step: body.step,
        source: str(body.source, 100).toLowerCase() || "direct",
        page: str(body.page, 200) || "/",
        device: deviceFromUA(ua),
        ts: new Date().toISOString(),
      });
      return NextResponse.json({ success: true });
    }

    const source = str(body.source, 100).toLowerCase();
    if (!source) return NextResponse.json({ success: false }, { status: 400 });

    await addFirebaseTrafficVisit({
      source,
      medium: str(body.medium, 50).toLowerCase() || "direct",
      campaign: str(body.campaign, 100).toLowerCase(),
      referrer: str(body.referrer, 200).toLowerCase(),
      landingPage: str(body.landingPage, 300) || "/",
      device: deviceFromUA(ua),
      country: req.headers.get("x-vercel-ip-country") || req.headers.get("cf-ipcountry") || "",
      ts: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

// GET: admin-only list of visits for the last N days
export async function GET(req: NextRequest) {
  if (!(await getAdminSession(req))) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const days = Math.min(Math.max(Number(req.nextUrl.searchParams.get("days")) || 30, 1), 365);
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const [visits, crawlers, funnel] = await Promise.all([
    getFirebaseTrafficVisits(since),
    getFirebaseCrawlerStats(since.slice(0, 10)),
    getFirebaseFunnelEvents(since),
  ]);

  return NextResponse.json(
    { success: visits !== null, visits: visits || [], crawlers: crawlers || [], funnel: funnel || [] },
    { headers: { "Cache-Control": "no-store" } }
  );
}
