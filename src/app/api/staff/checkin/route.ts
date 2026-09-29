import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import fs from "fs/promises";
import path from "path";
import {
  getFirebaseRegistrations,
  toggleFirebaseCheckin,
} from "@/lib/firebaseDb";
import { verifyStaffToken } from "../auth/route";

export const dynamic = "force-dynamic";

const ROOT_ADMIN_DATA_PATH = path.join(process.cwd(), "data", "adminData.json");
const SRC_ADMIN_DATA_PATH = path.join(process.cwd(), "src", "data", "adminData.json");

async function getAdminData() {
  try {
    const fbRegs = await getFirebaseRegistrations();
    if (fbRegs && fbRegs.length > 0) {
      return { registrations: fbRegs };
    }
  } catch {}

  try {
    const raw = await fs.readFile(ROOT_ADMIN_DATA_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {}

  try {
    const raw = await fs.readFile(SRC_ADMIN_DATA_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {}

  return { registrations: [] };
}

async function saveAdminData(data: any) {
  try {
    await fs.writeFile(ROOT_ADMIN_DATA_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch {}
  try {
    await fs.writeFile(SRC_ADMIN_DATA_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch {}
}

async function getAuthorizedStaff() {
  const cookieStore = await cookies();
  const staffToken = cookieStore.get("hhe_staff_token")?.value;
  const adminToken = cookieStore.get("hhe_admin_token")?.value;

  if (staffToken) {
    const staff = verifyStaffToken(staffToken);
    if (staff) return staff;
  }

  if (adminToken) {
    try {
      const raw = Buffer.from(adminToken, "base64").toString("utf-8");
      const parsed = JSON.parse(raw);
      if (parsed.exp && parsed.exp > Date.now()) {
        return {
          name: "Admin Officer",
          role: "Super Admin",
          gate: "VIP / Admin Gate",
          email: parsed.email,
        };
      }
    } catch {}
  }

  return null;
}

function extractPassId(input: string): string {
  if (!input) return "";
  const trimmed = input.trim();

  // If it's a URL like https://.../verify?id=HHE27-236435...
  if (trimmed.includes("verify") && trimmed.includes("id=")) {
    try {
      // Handles both full URL and query string
      const url = new URL(trimmed.startsWith("http") ? trimmed : `https://dummy.com/${trimmed}`);
      const idParam = url.searchParams.get("id");
      if (idParam) return idParam.trim();
    } catch {
      const match = trimmed.match(/[?&]id=([^&]+)/i);
      if (match && match[1]) return decodeURIComponent(match[1]).trim();
    }
  }

  // Handle JSON payload if QR contains JSON
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed.id || parsed.passId) return (parsed.id || parsed.passId).trim();
    } catch {}
  }

  // Raw pass ID (e.g. HHE27-236435 or GALA-2027-817220)
  return trimmed;
}

// GET: Summary statistics and registrations list
export async function GET(req: NextRequest) {
  const staff = await getAuthorizedStaff();
  if (!staff) {
    return NextResponse.json({ success: false, message: "Unauthorized. Staff login required." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.toLowerCase().trim() || "";
  const filter = searchParams.get("filter") || "all"; // all, checkedin, pending

  const data = await getAdminData();
  const registrations: any[] = data.registrations || [];

  const total = registrations.length;
  const checkedIn = registrations.filter((r) => r.checkedIn).length;
  const pending = total - checkedIn;
  const rate = total > 0 ? Math.round((checkedIn / total) * 100) : 0;

  // Filter list
  let list = registrations;
  if (filter === "checkedin") {
    list = list.filter((r) => r.checkedIn);
  } else if (filter === "pending") {
    list = list.filter((r) => !r.checkedIn);
  }

  if (q) {
    list = list.filter(
      (r) =>
        r.id?.toLowerCase().includes(q) ||
        r.name?.toLowerCase().includes(q) ||
        r.organization?.toLowerCase().includes(q) ||
        r.email?.toLowerCase().includes(q) ||
        r.phone?.toLowerCase().includes(q) ||
        r.passType?.toLowerCase().includes(q)
    );
  }

  // Recent 10 checkins
  const recentCheckins = registrations
    .filter((r) => r.checkedIn && r.checkedInAt)
    .sort((a, b) => new Date(b.checkedInAt).getTime() - new Date(a.checkedInAt).getTime())
    .slice(0, 10);

  return NextResponse.json({
    success: true,
    staff,
    stats: {
      total,
      checkedIn,
      pending,
      rate,
    },
    recentCheckins,
    registrations: list.slice(0, 50),
    totalCount: list.length,
  });
}

// POST: Verify and Check In Attendee
export async function POST(req: NextRequest) {
  const staff = await getAuthorizedStaff();
  if (!staff) {
    return NextResponse.json({ success: false, message: "Unauthorized. Staff login required." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const rawQr = body.qrData || body.passId || body.id || "";
    const passId = extractPassId(rawQr);

    if (!passId) {
      return NextResponse.json(
        { success: false, message: "No Pass ID or QR code data provided." },
        { status: 400 }
      );
    }

    const data = await getAdminData();
    const registrations: any[] = data.registrations || [];

    // Find registration by ID (case-insensitive) or phone or email
    const reg = registrations.find(
      (r) =>
        r.id?.toLowerCase() === passId.toLowerCase() ||
        r.email?.toLowerCase() === passId.toLowerCase() ||
        r.phone?.trim() === passId.trim() ||
        (r.transactionId && r.transactionId.toLowerCase() === passId.toLowerCase())
    );

    if (!reg) {
      return NextResponse.json(
        {
          success: false,
          notFound: true,
          searchedId: passId,
          message: `Pass ID "${passId}" not found in registration database.`,
        },
        { status: 404 }
      );
    }

    // Check if already checked in
    if (reg.checkedIn) {
      return NextResponse.json({
        success: true,
        alreadyCheckedIn: true,
        registration: reg,
        checkedInAt: reg.checkedInAt || "Earlier today",
        checkedInBy: reg.checkedInBy || "Gate Staff",
        message: `⚠️ ATTENTION: Already checked in at ${
          reg.checkedInAt ? new Date(reg.checkedInAt).toLocaleTimeString() : "earlier"
        } by ${reg.checkedInBy || "Staff"}.`,
      });
    }

    // Perform Check-in
    const nowIso = new Date().toISOString();
    reg.checkedIn = true;
    reg.checkedInAt = nowIso;
    reg.checkedInBy = `${staff.name} (${staff.gate || "Main Gate"})`;

    await Promise.all([
      saveAdminData(data),
      toggleFirebaseCheckin(reg.id, true).catch(() => {}),
    ]);

    return NextResponse.json({
      success: true,
      newlyCheckedIn: true,
      registration: reg,
      checkedInAt: nowIso,
      checkedInBy: reg.checkedInBy,
      message: `✅ ADMITTED: ${reg.name} checked in successfully.`,
    });
  } catch (error) {
    console.error("Staff check-in error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error during check-in." },
      { status: 500 }
    );
  }
}

// PUT: Undo / Toggle Check-in status
export async function PUT(req: NextRequest) {
  const staff = await getAuthorizedStaff();
  if (!staff) {
    return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  }

  try {
    const { regId, checkedIn } = await req.json();
    const data = await getAdminData();
    const reg = (data.registrations || []).find((r: any) => r.id === regId);

    if (!reg) {
      return NextResponse.json({ success: false, message: "Registration not found" }, { status: 404 });
    }

    reg.checkedIn = checkedIn;
    if (checkedIn) {
      reg.checkedInAt = new Date().toISOString();
      reg.checkedInBy = staff.name;
    } else {
      delete reg.checkedInAt;
      delete reg.checkedInBy;
    }

    await Promise.all([
      saveAdminData(data),
      toggleFirebaseCheckin(regId, checkedIn).catch(() => {}),
    ]);

    return NextResponse.json({
      success: true,
      registration: reg,
      message: checkedIn ? "Marked as Checked In" : "Check-in Undone / Reverted",
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Update failed" }, { status: 500 });
  }
}
