import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  const candidatePaths = [
    path.join(process.cwd(), "public", "files", "Proposal.pdf"),
    path.join(process.cwd(), "public", "Proposal.pdf"),
  ];

  for (const filePath of candidatePaths) {
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
      // continue to next candidate path
    }
  }

  return NextResponse.json({ error: "Proposal PDF not found" }, { status: 404 });
}
