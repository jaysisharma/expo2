import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import {
  getFirebaseCurrentPartners,
  saveFirebaseCurrentPartners,
} from "@/lib/firebaseDb";

export const dynamic = "force-dynamic";

export interface CurrentPartner {
  id: string;
  name: string;
  category: string; // e.g., "Title Sponsor", "Platinum Partner", "Gold Sponsor", "Official Bank", "Media Partner", "Associate Partner", "Supporting Partner"
  logo: string;
  url?: string;
  order: number;
  active: boolean;
  addedAt: string;
}

const ROOT_ADMIN_DATA_PATH = path.join(process.cwd(), "data", "adminData.json");
const SRC_ADMIN_DATA_PATH = path.join(process.cwd(), "src", "data", "adminData.json");

async function readAdminDataFallback(): Promise<CurrentPartner[]> {
  try {
    const raw = await fs.readFile(ROOT_ADMIN_DATA_PATH, "utf-8");
    const json = JSON.parse(raw);
    return Array.isArray(json.currentPartners) ? json.currentPartners : [];
  } catch {
    try {
      const raw = await fs.readFile(SRC_ADMIN_DATA_PATH, "utf-8");
      const json = JSON.parse(raw);
      return Array.isArray(json.currentPartners) ? json.currentPartners : [];
    } catch {
      return [];
    }
  }
}

async function writeAdminDataFallback(partners: CurrentPartner[]): Promise<void> {
  const syncFile = async (filePath: string) => {
    try {
      const raw = await fs.readFile(filePath, "utf-8");
      const json = JSON.parse(raw);
      json.currentPartners = partners;
      await fs.writeFile(filePath, JSON.stringify(json, null, 2), "utf-8");
    } catch {}
  };
  await Promise.all([syncFile(ROOT_ADMIN_DATA_PATH), syncFile(SRC_ADMIN_DATA_PATH)]);
}

async function getPartnersList(): Promise<CurrentPartner[]> {
  try {
    const fb = await getFirebaseCurrentPartners();
    if (fb !== null) {
      return fb;
    }
  } catch (err) {
    console.warn("Firestore getPartnersList error:", err);
  }
  return await readAdminDataFallback();
}

async function persistPartners(partners: CurrentPartner[]): Promise<void> {
  await Promise.all([
    saveFirebaseCurrentPartners(partners).catch((e) =>
      console.warn("Firestore saveFirebaseCurrentPartners error:", e)
    ),
    writeAdminDataFallback(partners),
  ]);
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const includeInactive = url.searchParams.get("all") === "true";
    const allPartners = await getPartnersList();

    // For admin (?all=true), return all partners. For public, only return active partners.
    const partners = includeInactive
      ? allPartners.sort((a, b) => (a.order || 0) - (b.order || 0))
      : allPartners
          .filter((p) => p.active !== false)
          .sort((a, b) => (a.order || 0) - (b.order || 0));

    return NextResponse.json(
      {
        success: true,
        partners,
        totalActive: allPartners.filter((p) => p.active !== false).length,
        totalAll: allPartners.length,
        source: "firestore",
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch current partners", partners: [] },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, payload } = body;
    let partners = await getPartnersList();

    switch (action) {
      case "save_all": {
        partners = Array.isArray(payload?.partners) ? payload.partners : [];
        await persistPartners(partners);
        return NextResponse.json({
          success: true,
          message: "All 2027 partners saved successfully to database",
          partners,
        });
      }

      case "add": {
        const newPartner: CurrentPartner = {
          id: payload.id || `partner-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: payload.name?.trim(),
          category: payload.category?.trim() || "Official Partner",
          logo: payload.logo || "/images/logo.webp",
          url: payload.url?.trim() || "",
          order: typeof payload.order === "number" ? payload.order : partners.length + 1,
          active: payload.active !== undefined ? Boolean(payload.active) : true,
          addedAt: new Date().toISOString(),
        };

        partners.push(newPartner);
        await persistPartners(partners);
        return NextResponse.json({
          success: true,
          message: `Added partner "${newPartner.name}" to database`,
          partner: newPartner,
          partners,
        });
      }

      case "update": {
        const { id, ...updates } = payload;
        let found = false;
        partners = partners.map((p: CurrentPartner) => {
          if (p.id === id) {
            found = true;
            return { ...p, ...updates };
          }
          return p;
        });

        if (!found) {
          return NextResponse.json({ success: false, message: "Partner not found" }, { status: 404 });
        }

        await persistPartners(partners);
        return NextResponse.json({
          success: true,
          message: "Partner updated in database",
          partners,
        });
      }

      case "delete": {
        const { id } = payload;
        const initialLen = partners.length;
        partners = partners.filter((p: CurrentPartner) => p.id !== id);

        if (partners.length === initialLen) {
          return NextResponse.json({ success: false, message: "Partner not found" }, { status: 404 });
        }

        await persistPartners(partners);
        return NextResponse.json({
          success: true,
          message: "Partner removed successfully from database",
          partners,
        });
      }

      case "toggle_active": {
        const { id } = payload;
        let updatedState = true;
        partners = partners.map((p: CurrentPartner) => {
          if (p.id === id) {
            updatedState = !p.active;
            return { ...p, active: updatedState };
          }
          return p;
        });

        await persistPartners(partners);
        return NextResponse.json({
          success: true,
          message: `Partner is now ${updatedState ? "visible" : "hidden"} on the landing page`,
          active: updatedState,
          partners,
        });
      }

      default:
        return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update partners in database" },
      { status: 500 }
    );
  }
}
