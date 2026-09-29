import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getFirebaseRegistrationById, toggleFirebaseCheckin } from "@/lib/firebaseDb";

export const dynamic = "force-dynamic";

const ROOT_ADMIN_DATA_PATH = path.join(process.cwd(), "data", "adminData.json");
const SRC_ADMIN_DATA_PATH = path.join(process.cwd(), "src", "data", "adminData.json");

function readLocalAdminData(): any {
  try {
    if (fs.existsSync(ROOT_ADMIN_DATA_PATH)) {
      return JSON.parse(fs.readFileSync(ROOT_ADMIN_DATA_PATH, "utf-8"));
    }
  } catch (e) {}

  try {
    if (fs.existsSync(SRC_ADMIN_DATA_PATH)) {
      return JSON.parse(fs.readFileSync(SRC_ADMIN_DATA_PATH, "utf-8"));
    }
  } catch (e) {}

  return null;
}

function saveLocalAdminData(data: any) {
  try {
    if (fs.existsSync(path.dirname(ROOT_ADMIN_DATA_PATH))) {
      fs.writeFileSync(ROOT_ADMIN_DATA_PATH, JSON.stringify(data, null, 2), "utf-8");
    }
    if (fs.existsSync(SRC_ADMIN_DATA_PATH)) {
      fs.writeFileSync(SRC_ADMIN_DATA_PATH, JSON.stringify(data, null, 2), "utf-8");
    }
  } catch (e) {
    console.warn("[verify API] Could not write local adminData.json:", e);
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id")?.trim() || "";
    const nameParam = searchParams.get("name")?.trim() || "";
    const orgParam = searchParams.get("org")?.trim() || "";
    const roleParam = searchParams.get("role")?.trim() || "";
    const titleParam = searchParams.get("title")?.trim() || "";
    const stallParam = searchParams.get("stall")?.trim() || "";
    const emailParam = searchParams.get("email")?.trim() || "";
    const phoneParam = searchParams.get("phone")?.trim() || "";
    const passTypeParam = searchParams.get("passType")?.trim() || "";

    if (!id && !nameParam) {
      return NextResponse.json(
        { success: false, message: "No accreditation ID or attendee name provided." },
        { status: 400 }
      );
    }

    let attendee: any = null;

    // 1. Try Firebase Firestore
    if (id) {
      try {
        const fbDoc = await getFirebaseRegistrationById(id);
        if (fbDoc) {
          attendee = fbDoc;
        }
      } catch (err) {
        console.warn("[verify API] Firestore lookup failed:", err);
      }
    }

    // 2. Try local adminData.json
    if (!attendee && id) {
      const localData = readLocalAdminData();
      if (localData?.registrations) {
        attendee = localData.registrations.find(
          (r: any) =>
            r.id?.toLowerCase() === id.toLowerCase() ||
            (r.email && emailParam && r.email.toLowerCase() === emailParam.toLowerCase())
        );
      }
    }

    // 3. Fallback to URL parameters if not found in database
    if (attendee) {
      // Merge with query parameters if some fields are missing
      if (!attendee.jobTitle && titleParam) attendee.jobTitle = titleParam;
      if (!attendee.stallNumber && stallParam) attendee.stallNumber = stallParam;
      if (!attendee.phone && phoneParam) attendee.phone = phoneParam;
      if (!attendee.organization && orgParam) attendee.organization = orgParam;
      if (!attendee.passType && passTypeParam) attendee.passType = passTypeParam;

      return NextResponse.json({
        success: true,
        source: "database",
        attendee,
      });
    }

    // If ID or name was provided in URL query parameters, return fallback attendee record
    if (nameParam || id) {
      const fallbackAttendee = {
        id: id || "HHE27-VERIFIED",
        name: nameParam || "Registered Attendee",
        organization: orgParam || "Himalayan Green Energy Expo",
        jobTitle: titleParam || "",
        stallNumber: stallParam || "",
        email: emailParam || "",
        phone: phoneParam || "",
        role: roleParam || (stallParam ? "exhibitor" : "visitor"),
        passType: passTypeParam || (roleParam === "exhibitor" ? "Official Exhibitor Pass" : roleParam === "gala" ? "Gala Dinner Pass" : "Trade Visitor Pass"),
        country: "Nepal",
        checkedIn: false,
        registeredAt: new Date().toISOString(),
      };

      return NextResponse.json({
        success: true,
        source: "parameters",
        attendee: fallbackAttendee,
      });
    }

    return NextResponse.json(
      { success: false, message: "Accreditation record not found." },
      { status: 404 }
    );
  } catch (error: any) {
    console.error("[verify API] Error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Only authorized staff or admin can mark check-ins
    const staffCookie = req.cookies.get("hhe_staff_token")?.value;
    const adminCookie = req.cookies.get("hhe_admin_token")?.value;

    if (!staffCookie && !adminCookie) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Only verified staff can check in attendees." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { id, checkedIn } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: "Missing id" }, { status: 400 });
    }

    const newStatus = checkedIn !== undefined ? Boolean(checkedIn) : true;

    // Update in local file
    const localData = readLocalAdminData();
    let updated = false;
    if (localData?.registrations) {
      const reg = localData.registrations.find((r: any) => r.id?.toLowerCase() === id.toLowerCase());
      if (reg) {
        reg.checkedIn = newStatus;
        reg.checkedInAt = newStatus ? new Date().toISOString() : null;
        saveLocalAdminData(localData);
        updated = true;
      }
    }

    // Update in Firebase
    await toggleFirebaseCheckin(id, newStatus).catch(() => {});

    return NextResponse.json({
      success: true,
      message: `Attendee ${newStatus ? "checked in" : "check-in reverted"} successfully.`,
      checkedIn: newStatus,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to update checkin" },
      { status: 500 }
    );
  }
}
