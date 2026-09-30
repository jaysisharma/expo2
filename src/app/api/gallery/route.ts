import { NextResponse } from "next/server";
import { galleryData as staticGalleryData } from "@/data/gallery";
import { getFirebaseGallery } from "@/lib/firebaseDb";

export const dynamic = "force-dynamic";

export async function GET() {
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
