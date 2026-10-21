import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/session";
import {
  deleteFirebaseShortLink,
  getFirebaseShortLink,
  getFirebaseShortLinks,
  saveFirebaseShortLink,
} from "@/lib/firebaseDb";

export const dynamic = "force-dynamic";

const CODE_PATTERN = /^[a-z0-9][a-z0-9-]{1,39}$/;
const clean = (v: unknown, max = 60) =>
  typeof v === "string" ? v.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9._-]/g, "").slice(0, max) : "";

// GET: list short links
export async function GET(req: Request) {
  if (!(await getAdminSession(req))) return NextResponse.json({ success: false }, { status: 401 });
  const links = await getFirebaseShortLinks();
  return NextResponse.json({ success: links !== null, links: links || [] }, { headers: { "Cache-Control": "no-store" } });
}

// POST: create { code?, path, source, medium?, campaign? }
export async function POST(req: Request) {
  const session = await getAdminSession(req);
  if (!session) return NextResponse.json({ success: false }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const source = clean(body.source) || "social";
  const campaign = clean(body.campaign);
  const rawPath = typeof body.path === "string" ? body.path.trim().replace(/\\/g, "/") : "/";
  // Only same-site paths, so short links can't be abused as open redirects
  const path = rawPath.startsWith("/") && !rawPath.startsWith("//") ? rawPath.slice(0, 200) : `/${rawPath.replace(/^\/+/, "")}`.slice(0, 200);
  const code = clean(body.code, 40) || `${source.slice(0, 6)}-${Math.random().toString(36).slice(2, 7)}`;

  if (!CODE_PATTERN.test(code)) {
    return NextResponse.json(
      { success: false, message: "Code must be 2–40 lowercase letters, numbers or dashes." },
      { status: 400 }
    );
  }
  if (await getFirebaseShortLink(code)) {
    return NextResponse.json({ success: false, message: `The code "${code}" is already used.` }, { status: 409 });
  }

  const link = {
    code,
    path,
    source,
    medium: clean(body.medium, 30) || (source === "qr" ? "print" : source === "email" ? "email" : "social"),
    campaign,
    clicks: 0,
    createdAt: new Date().toISOString(),
    createdBy: session.email,
  };
  const ok = await saveFirebaseShortLink(link);
  return NextResponse.json({ success: ok, link }, { status: ok ? 200 : 500 });
}

// DELETE: ?code=…
export async function DELETE(req: Request) {
  if (!(await getAdminSession(req))) return NextResponse.json({ success: false }, { status: 401 });
  const code = clean(new URL(req.url).searchParams.get("code"), 40);
  if (!code) return NextResponse.json({ success: false }, { status: 400 });
  return NextResponse.json({ success: await deleteFirebaseShortLink(code) });
}
