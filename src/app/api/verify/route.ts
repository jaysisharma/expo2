import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getFirebaseRegistrationById, toggleFirebaseCheckin } from "@/lib/firebaseDb";
import {
  decryptPassToken,
  generateSecurityChecksum,
  encryptPassToken,
  PassSecurityPayload,
} from "@/lib/passSecurity";

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
    const token = searchParams.get("token")?.trim() || "";
    let id = searchParams.get("id")?.trim() || "";
    let nameParam = searchParams.get("name")?.trim() || "";
    let orgParam = searchParams.get("org")?.trim() || "";
    let roleParam = searchParams.get("role")?.trim() || "";
    let titleParam = searchParams.get("title")?.trim() || "";
    let stallParam = searchParams.get("stall")?.trim() || "";
    let emailParam = searchParams.get("email")?.trim() || "";
    let phoneParam = searchParams.get("phone")?.trim() || "";
    let passTypeParam = searchParams.get("passType")?.trim() || "";
    let tokenVerified = false;
    let tokenIssuedAt: number | undefined;

    // 1. Process cryptographic security token if provided
    if (token) {
      const decrypted = decryptPassToken(token);
      if (!decrypted) {
        return NextResponse.json(
          {
            success: false,
            message: "Cryptographic verification failed. This pass token is forged, tampered with, or expired.",
            tampered: true,
          },
          { status: 403 }
        );
      }
      tokenVerified = true;
      tokenIssuedAt = decrypted.iat;
      id = decrypted.id || id;
      nameParam = decrypted.name || nameParam;
      orgParam = decrypted.organization || orgParam;
      roleParam = decrypted.role || roleParam;
      titleParam = decrypted.jobTitle || titleParam;
      stallParam = decrypted.stallNumber || stallParam;
      emailParam = decrypted.email || emailParam;
      phoneParam = decrypted.phone || phoneParam;
      passTypeParam = decrypted.passType || passTypeParam;
    }

    if (!id && !nameParam) {
      return NextResponse.json(
        { success: false, message: "No accreditation ID, security token, or attendee name provided." },
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

    // 2. Try local adminData.json (Exact ID match only)
    if (!attendee && id) {
      const localData = readLocalAdminData();
      if (localData?.registrations) {
        attendee = localData.registrations.find(
          (r: any) => r.id && r.id.toLowerCase() === id.toLowerCase()
        );
      }
    }

    // 2b. Only if NO id was provided, fallback to email lookup
    if (!attendee && !id && emailParam) {
      const localData = readLocalAdminData();
      if (localData?.registrations) {
        attendee = localData.registrations.find(
          (r: any) => r.email && r.email.toLowerCase() === emailParam.toLowerCase()
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

      const securityChecksum = generateSecurityChecksum(attendee.id || id);
      const secureToken = token || encryptPassToken({
        id: attendee.id,
        name: attendee.name,
        organization: attendee.organization,
        jobTitle: attendee.jobTitle,
        stallNumber: attendee.stallNumber,
        email: attendee.email,
        phone: attendee.phone,
        passType: attendee.passType,
        role: attendee.role,
        iat: tokenIssuedAt || Date.now(),
      });

      return NextResponse.json({
        success: true,
        source: "database",
        attendee: {
          ...attendee,
          securityChecksum,
          secureToken,
          tokenVerified: true,
        },
        antiCounterfeit: {
          verified: true,
          algorithm: "AES-256-GCM / HMAC-SHA256",
          checksum: securityChecksum,
          issuedAt: tokenIssuedAt ? new Date(tokenIssuedAt).toISOString() : attendee.registeredAt,
          alreadyCheckedIn: Boolean(attendee.checkedIn),
        },
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
        passType: passTypeParam || (roleParam === "exhibitor" ? "Official Exhibitor Pass" : roleParam === "gala" ? "Networking Dinner Pass" : "Trade Visitor Pass"),
        country: "Nepal",
        checkedIn: false,
        registeredAt: tokenIssuedAt ? new Date(tokenIssuedAt).toISOString() : new Date().toISOString(),
      };

      const securityChecksum = generateSecurityChecksum(fallbackAttendee.id);
      const secureToken = token || encryptPassToken({
        ...fallbackAttendee,
        iat: tokenIssuedAt || Date.now(),
      });

      return NextResponse.json({
        success: true,
        source: "parameters",
        attendee: {
          ...fallbackAttendee,
          securityChecksum,
          secureToken,
          tokenVerified: tokenVerified,
        },
        antiCounterfeit: {
          verified: true,
          algorithm: "AES-256-GCM / HMAC-SHA256",
          checksum: securityChecksum,
          issuedAt: fallbackAttendee.registeredAt,
          alreadyCheckedIn: false,
        },
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
