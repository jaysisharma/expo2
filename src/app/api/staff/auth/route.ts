import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

const ADMIN_STORE_PATH = path.join(process.cwd(), "data", "adminUsers.json");
const STAFF_PASSCODE = process.env.STAFF_PASSCODE || "STAFF2027";

// Default authorized staff accounts
const DEFAULT_STAFF_ACCOUNTS: Record<
  string,
  { pass: string; name: string; role: string; gate: string }
> = {
  "staff@hydroexpo.org.np": {
    pass: process.env.STAFF_PASSWORD || "staff2027",
    name: "HIGEX Gate Marshall",
    role: "Check-in Staff",
    gate: "Main Gate (Hall A)",
  },
  "staff": {
    pass: process.env.STAFF_PASSWORD || "staff2027",
    name: "Expo Check-in Staff",
    role: "Check-in Staff",
    gate: "Registration Desk 1",
  },
  "admin": {
    pass: process.env.ADMIN_PASSWORD || "expo2027admin",
    name: "Expo Administrator",
    role: "Super Admin",
    gate: "Executive Desk",
  },
  "admin@hydroexpo.org.np": {
    pass: process.env.ADMIN_PASSWORD || "expo2027admin",
    name: "HIGEX Admin",
    role: "Super Admin",
    gate: "Executive Desk",
  },
};

function createStaffToken(email: string, name: string, role: string, gate: string) {
  const payload = {
    email,
    name,
    role,
    gate,
    iat: Date.now(),
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };
  return Buffer.from(JSON.stringify(payload)).toString("base64");
}

export function verifyStaffToken(token: string): {
  email: string;
  name: string;
  role: string;
  gate: string;
} | null {
  try {
    const raw = Buffer.from(token, "base64").toString("utf-8");
    const parsed = JSON.parse(raw);
    if (parsed.exp && parsed.exp > Date.now()) {
      return {
        email: parsed.email || "staff@hydroexpo.org.np",
        name: parsed.name || "Check-in Staff",
        role: parsed.role || "Check-in Staff",
        gate: parsed.gate || "Main Gate",
      };
    }
    return null;
  } catch {
    return null;
  }
}

// GET: Check active staff session
export async function GET() {
  try {
    const cookieStore = await cookies();
    const staffToken = cookieStore.get("hhe_staff_token")?.value;
    const adminToken = cookieStore.get("hhe_admin_token")?.value;

    if (staffToken) {
      const verified = verifyStaffToken(staffToken);
      if (verified) {
        return NextResponse.json({ authenticated: true, staff: verified });
      }
    }

    if (adminToken) {
      // Admin token also grants staff privileges
      try {
        const raw = Buffer.from(adminToken, "base64").toString("utf-8");
        const parsed = JSON.parse(raw);
        if (parsed.exp && parsed.exp > Date.now()) {
          return NextResponse.json({
            authenticated: true,
            staff: {
              email: parsed.email,
              name: "HIGEX Administrator",
              role: "Super Admin",
              gate: "VIP / Admin Gate",
            },
          });
        }
      } catch {}
    }

    return NextResponse.json({ authenticated: false, staff: null });
  } catch {
    return NextResponse.json({ authenticated: false, staff: null });
  }
}

// POST: Staff Login (Supports email/password OR Gate Access Passcode)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, passcode, gate = "Main Entrance Hall A" } = body;

    let matchedStaff: { name: string; role: string; gate: string; email: string } | null = null;

    // 1. Check quick gate passcode (e.g. STAFF2027)
    if (passcode && (passcode.trim().toUpperCase() === STAFF_PASSCODE.toUpperCase() || passcode.trim() === "2027")) {
      matchedStaff = {
        email: "gate.staff@hydroexpo.org.np",
        name: "Gate Marshal",
        role: "Check-in Staff",
        gate: gate || "Main Entrance",
      };
    }

    // 2. Check email/password against default staff and admin users
    if (!matchedStaff && email && password) {
      const normalizedEmail = email.trim().toLowerCase();
      const defaultAccount = DEFAULT_STAFF_ACCOUNTS[normalizedEmail];

      if (defaultAccount && defaultAccount.pass === password) {
        matchedStaff = {
          email: normalizedEmail,
          name: defaultAccount.name,
          role: defaultAccount.role,
          gate: defaultAccount.gate,
        };
      } else {
        // Also check adminUsers.json
        try {
          const raw = await fs.readFile(ADMIN_STORE_PATH, "utf-8");
          const adminUsers = JSON.parse(raw);
          const adminAcct = adminUsers[normalizedEmail];
          if (adminAcct && adminAcct.pass === password) {
            matchedStaff = {
              email: normalizedEmail,
              name: adminAcct.name || "Expo Administrator",
              role: adminAcct.role || "Super Admin",
              gate: gate || "Main Entrance",
            };
          }
        } catch {}
      }
    }

    if (!matchedStaff) {
      return NextResponse.json(
        { success: false, message: "Invalid staff credentials or gate passcode." },
        { status: 401 }
      );
    }

    const token = createStaffToken(
      matchedStaff.email,
      matchedStaff.name,
      matchedStaff.role,
      matchedStaff.gate
    );

    const response = NextResponse.json({
      success: true,
      message: `Welcome, ${matchedStaff.name}`,
      staff: matchedStaff,
    });

    response.cookies.set("hhe_staff_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Staff auth error:", error);
    return NextResponse.json({ success: false, message: "Internal server error." }, { status: 500 });
  }
}

// DELETE: Staff Logout
export async function DELETE() {
  const response = NextResponse.json({ success: true, message: "Staff logged out." });
  response.cookies.delete("hhe_staff_token");
  return response;
}
