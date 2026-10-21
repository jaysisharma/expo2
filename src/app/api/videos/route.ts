import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/session";
import { videosData as staticVideosData } from "@/data/videos";
import { getFirebaseVideos, saveFirebaseVideos } from "@/lib/firebaseDb";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  // ?raw=1 returns exactly what is stored (null when nothing saved yet) — used by the admin editor
  if (new URL(req.url).searchParams.get("raw") === "1") {
    const stored = await getFirebaseVideos();
    return NextResponse.json({ success: true, videos: stored }, { headers: { "Cache-Control": "no-store" } });
  }

  try {
    const fbVideos = await getFirebaseVideos();
    if (fbVideos && fbVideos.length > 0) {
      return NextResponse.json(
        { success: true, videos: fbVideos, source: "firebase" },
        { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
      );
    }
  } catch (e) {
    console.warn("[api/videos] Firebase fetch failed, using static data:", e);
  }

  return NextResponse.json(
    { success: true, videos: staticVideosData, source: "static" },
    { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
  );
}

// POST: admin-only save of the full videos list
export async function POST(req: Request) {
  if (!(await getAdminSession(req))) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  if (!Array.isArray(body?.videos)) {
    return NextResponse.json({ success: false, message: "Expected an array of videos" }, { status: 400 });
  }
  const ok = await saveFirebaseVideos(body.videos);
  return NextResponse.json({ success: ok }, { status: ok ? 200 : 500 });
}
