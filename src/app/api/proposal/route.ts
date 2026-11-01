import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  const filePath = path.join(process.cwd(), "public", "files", "Proposal.pdf");

  try {
    const fileBuffer = await fs.readFile(filePath);
    return new Response(fileBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="Himalayan-Green-Energy-Expo-Proposal.pdf"',
        "Content-Length": fileBuffer.length.toString(),
      },
    });
  } catch {
    // fall through to 404
  }

  return NextResponse.json({ error: "Proposal PDF not found" }, { status: 404 });
}
