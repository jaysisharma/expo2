import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

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

async function readAdminData(): Promise<any> {
  try {
    const raw = await fs.readFile(ROOT_ADMIN_DATA_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    try {
      const raw = await fs.readFile(SRC_ADMIN_DATA_PATH, "utf-8");
      return JSON.parse(raw);
    } catch {
      return { currentPartners: [] };
    }
  }
}

async function writeAdminData(data: any): Promise<void> {
  const content = JSON.stringify(data, null, 2);
  try {
    await fs.mkdir(path.dirname(ROOT_ADMIN_DATA_PATH), { recursive: true });
    await fs.writeFile(ROOT_ADMIN_DATA_PATH, content, "utf-8");
  } catch {}
  try {
    await fs.mkdir(path.dirname(SRC_ADMIN_DATA_PATH), { recursive: true });
    await fs.writeFile(SRC_ADMIN_DATA_PATH, content, "utf-8");
  } catch {}
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const includeInactive = url.searchParams.get("all") === "true";
    const data = await readAdminData();
    const allPartners: CurrentPartner[] = Array.isArray(data.currentPartners) ? data.currentPartners : [];
    
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
    const data = await readAdminData();
    data.currentPartners = Array.isArray(data.currentPartners) ? data.currentPartners : [];

    switch (action) {
      case "save_all": {
        data.currentPartners = Array.isArray(payload?.partners) ? payload.partners : [];
        await writeAdminData(data);
        return NextResponse.json({
          success: true,
          message: "All 2027 partners saved successfully",
          partners: data.currentPartners,
        });
      }

      case "add": {
        const newPartner: CurrentPartner = {
          id: payload.id || `partner-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: payload.name?.trim(),
          category: payload.category?.trim() || "Official Partner",
          logo: payload.logo || "/images/logo.webp",
          url: payload.url?.trim() || "",
          order: typeof payload.order === "number" ? payload.order : data.currentPartners.length + 1,
          active: payload.active !== undefined ? Boolean(payload.active) : true,
          addedAt: new Date().toISOString(),
        };

        data.currentPartners.push(newPartner);
        await writeAdminData(data);
        return NextResponse.json({
          success: true,
          message: `Added partner "${newPartner.name}"`,
          partner: newPartner,
          partners: data.currentPartners,
        });
      }

      case "update": {
        const { id, ...updates } = payload;
        let found = false;
        data.currentPartners = data.currentPartners.map((p: CurrentPartner) => {
          if (p.id === id) {
            found = true;
            return { ...p, ...updates };
          }
          return p;
        });

        if (!found) {
          return NextResponse.json({ success: false, message: "Partner not found" }, { status: 404 });
        }

        await writeAdminData(data);
        return NextResponse.json({
          success: true,
          message: "Partner updated",
          partners: data.currentPartners,
        });
      }

      case "delete": {
        const { id } = payload;
        const initialLen = data.currentPartners.length;
        data.currentPartners = data.currentPartners.filter((p: CurrentPartner) => p.id !== id);

        if (data.currentPartners.length === initialLen) {
          return NextResponse.json({ success: false, message: "Partner not found" }, { status: 404 });
        }

        await writeAdminData(data);
        return NextResponse.json({
          success: true,
          message: "Partner removed successfully",
          partners: data.currentPartners,
        });
      }

      case "toggle_active": {
        const { id } = payload;
        let updatedState = true;
        data.currentPartners = data.currentPartners.map((p: CurrentPartner) => {
          if (p.id === id) {
            updatedState = !p.active;
            return { ...p, active: updatedState };
          }
          return p;
        });

        await writeAdminData(data);
        return NextResponse.json({
          success: true,
          message: `Partner is now ${updatedState ? "visible" : "hidden"} on the landing page`,
          active: updatedState,
          partners: data.currentPartners,
        });
      }

      default:
        return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update partners" },
      { status: 500 }
    );
  }
}
