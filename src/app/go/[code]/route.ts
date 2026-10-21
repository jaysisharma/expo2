import { NextRequest, NextResponse } from "next/server";
import { getFirebaseShortLink, recordFirebaseShortLinkClick } from "@/lib/firebaseDb";
import { detectCrawler } from "@/lib/crawlers";

export const dynamic = "force-dynamic";

// /go/:code → the target page with UTM tags, so posters, QR codes and posts are attributed.
export async function GET(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const link = await getFirebaseShortLink(code.toLowerCase());
  if (!link) return NextResponse.redirect(new URL("/", req.url));

  const target = new URL(link.path || "/", req.url);
  if (target.origin !== req.nextUrl.origin) return NextResponse.redirect(new URL("/", req.url));
  target.searchParams.set("utm_source", link.source);
  target.searchParams.set("utm_medium", link.medium || "referral");
  if (link.campaign) target.searchParams.set("utm_campaign", link.campaign);

  // Link-preview bots (WhatsApp, Facebook…) fetch the URL when a link is shared — don't count those
  if (!detectCrawler(req.headers.get("user-agent"))) {
    await recordFirebaseShortLinkClick(link);
  }

  return NextResponse.redirect(target, 302);
}
