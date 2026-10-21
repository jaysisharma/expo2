import { NextRequest, NextResponse } from "next/server";
import type { TrafficSummary } from "@/lib/trafficInsights";
import { getAdminSession } from "@/lib/session";
import { gatewayToken, generateAiInsights } from "@/lib/aiInsights";

export const dynamic = "force-dynamic";

// Simple per-instance limit so the AI button can't be used to run up costs
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60 * 60 * 1000;
let windowStart = Date.now();
let requestCount = 0;

// POST: { summary: TrafficSummary } → { insights: Insight[] }
export async function POST(req: NextRequest) {
  if (!(await getAdminSession(req))) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const token = gatewayToken(req);
  if (!token) {
    return NextResponse.json(
      { success: false, message: "AI is not configured. Deploy on Vercel or set AI_GATEWAY_API_KEY." },
      { status: 503 }
    );
  }

  if (Date.now() - windowStart > RATE_WINDOW_MS) {
    windowStart = Date.now();
    requestCount = 0;
  }
  if (++requestCount > RATE_LIMIT) {
    return NextResponse.json({ success: false, message: "Too many AI requests. Try again later." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const summary = body?.summary as TrafficSummary | undefined;
  if (!summary || !Array.isArray(summary.sources)) {
    return NextResponse.json({ success: false, message: "Missing summary" }, { status: 400 });
  }

  try {
    const { insights, model } = await generateAiInsights(summary, token);
    return NextResponse.json({ success: true, insights, model });
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e?.message || "AI request failed" }, { status: 502 });
  }
}
