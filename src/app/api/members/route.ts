import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/session";
import { speakersData } from "@/data/speakers";
import { eventSolutionTeam } from "@/data/eventSolutionTeam";
import { getFirebaseMembers, saveFirebaseMembers } from "@/lib/firebaseDb";

export const dynamic = "force-dynamic";

// Build static defaults (same shape as admin page uses)
const staticMembers = [
  ...speakersData.map((s) => ({
    id: s.id,
    name: s.name,
    title: s.title,
    organization: "Independent Power Producers' Association, Nepal (IPPAN)",
    orgType: "IPPAN",
    photo: s.photo || "/images/committee/mohan-kumar-dangi.webp",
    category: s.category || "IPPAN Leadership",
    bio: s.bio,
    featured: s.featured ?? false,
  })),
  ...eventSolutionTeam.map((e) => ({
    id: e.id,
    name: e.name,
    title: e.position,
    organization: "Event Solution Pvt. Ltd.",
    orgType: "Event Solution",
    photo: e.photo || "/images/committee/mohan-kumar-dangi.webp",
    category: e.category || "Executive",
    bio: `${e.position} at Event Solution Pvt. Ltd., organizing the Himalayan Green Energy Expo.`,
    featured: e.category === "Executive",
  })),
];

export async function GET(req: Request) {
  // ?raw=1 returns exactly what is stored (null when nothing saved yet) — used by the admin editor
  if (new URL(req.url).searchParams.get("raw") === "1") {
    const stored = await getFirebaseMembers();
    return NextResponse.json({ success: true, members: stored }, { headers: { "Cache-Control": "no-store" } });
  }

  try {
    const fbMembers = await getFirebaseMembers();
    if (fbMembers && fbMembers.length > 0) {
      return NextResponse.json(
        { success: true, members: fbMembers, source: "firebase" },
        { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
      );
    }
  } catch (e) {
    console.warn("[api/members] Firebase fetch failed, using static data:", e);
  }

  return NextResponse.json(
    { success: true, members: staticMembers, source: "static" },
    { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
  );
}

// POST: admin-only save of the full members list
export async function POST(req: Request) {
  if (!(await getAdminSession(req))) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  if (!Array.isArray(body?.members)) {
    return NextResponse.json({ success: false, message: "Expected an array of members" }, { status: 400 });
  }
  const ok = await saveFirebaseMembers(body.members);
  return NextResponse.json({ success: ok }, { status: ok ? 200 : 500 });
}
