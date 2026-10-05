import { NextResponse } from "next/server";
import { videosData as staticVideosData } from "@/data/videos";
import { getFirebaseVideos } from "@/lib/firebaseDb";

export const dynamic = "force-dynamic";

export async function GET() {
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
