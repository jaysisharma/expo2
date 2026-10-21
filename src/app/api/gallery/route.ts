import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/session";
import { galleryData as staticGalleryData } from "@/data/gallery";
import { getFirebaseGallery, saveFirebaseGallery } from "@/lib/firebaseDb";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  // ?raw=1 returns exactly what is stored (null when nothing saved yet) — used by the admin editor
  if (new URL(req.url).searchParams.get("raw") === "1") {
    const stored = await getFirebaseGallery();
    return NextResponse.json({ success: true, items: stored }, { headers: { "Cache-Control": "no-store" } });
  }

  try {
    // Try Firebase first — contains admin-published photos
    const fbItems = await getFirebaseGallery();
    if (fbItems && fbItems.length > 0) {
      return NextResponse.json(
        { success: true, items: fbItems, source: "firebase" },
        { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
      );
    }
  } catch (e) {
    console.warn("[api/gallery] Firebase fetch failed, using static data:", e);
  }

  // Fallback: static gallery data file
  return NextResponse.json(
    { success: true, items: staticGalleryData, source: "static" },
    { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
  );
}

// POST: admin-only save of the full items list
export async function POST(req: Request) {
  if (!(await getAdminSession(req))) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  if (!Array.isArray(body?.items)) {
    return NextResponse.json({ success: false, message: "Expected an array of items" }, { status: 400 });
  }
  const ok = await saveFirebaseGallery(body.items);
  return NextResponse.json({ success: ok }, { status: ok ? 200 : 500 });
}
