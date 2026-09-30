import { NextResponse } from "next/server";
import { speakersData } from "@/data/speakers";
import { eventSolutionTeam } from "@/data/eventSolutionTeam";
import { getFirebaseMembers } from "@/lib/firebaseDb";

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

export async function GET() {
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
