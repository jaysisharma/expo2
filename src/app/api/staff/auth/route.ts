import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import {
  STAFF_COOKIE,
  getStaffOrAdminSession,
  isAuthConfigured,
  sessionCookieOptions,
  signSession,
  tooManyLoginAttempts,
} from "@/lib/session";
import { verifyPassword } from "@/lib/passwords";

export const dynamic = "force-dynamic";

const ADMIN_STORE_PATH = path.join(process.cwd(), "data", "adminUsers.json");

// Gate passcode and staff passwords come only from the environment — no defaults.
function envSecret(name: string) {
  const value = (process.env[name] || "").trim();
  return value.length >= 6 ? value : null;
}

const DEFAULT_STAFF_ACCOUNTS: Record<string, { passEnv: string; name: string; role: string; gate: string }> = {
  "staff@hydroexpo.org.np": { passEnv: "STAFF_PASSWORD", name: "HIGEX Gate Marshall", role: "Check-in Staff", gate: "Main Gate (Hall A)" },
  staff: { passEnv: "STAFF_PASSWORD", name: "Expo Check-in Staff", role: "Check-in Staff", gate: "Registration Desk 1" },
  admin: { passEnv: "ADMIN_PASSWORD", name: "Expo Administrator", role: "Super Admin", gate: "Executive Desk" },
  "admin@hydroexpo.org.np": { passEnv: "ADMIN_PASSWORD", name: "HIGEX Admin", role: "Super Admin", gate: "Executive Desk" },
};

// GET: Check active staff session (an admin session also grants staff access)
export async function GET(req: NextRequest) {
  const session = await getStaffOrAdminSession(req);
  if (!session) return NextResponse.json({ authenticated: false, staff: null });
  return NextResponse.json({
    authenticated: true,
    staff: {
      email: session.email,
      name: session.name,
      role: session.role,
      gate: session.gate || "VIP / Admin Gate",
    },
  });
}

// POST: Staff Login (Supports email/password OR Gate Access Passcode)
export async function POST(req: NextRequest) {
  try {
    if (!isAuthConfigured()) {
      return NextResponse.json(
        { success: false, message: "Staff login is not configured on the server (AUTH_SECRET missing)." },
        { status: 503 }
      );
    }
    if (tooManyLoginAttempts(req)) {
      return NextResponse.json(
        { success: false, message: "Too many login attempts. Please wait 15 minutes and try again." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { email, password, passcode, gate = "Main Entrance Hall A" } = body;

    let matchedStaff: { name: string; role: string; gate: string; email: string } | null = null;

    // 1. Check quick gate passcode (STAFF_PASSCODE env)
    const gatePasscode = envSecret("STAFF_PASSCODE");
    if (passcode && gatePasscode && verifyPassword(gatePasscode.toUpperCase(), passcode.trim().toUpperCase()).valid) {
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

      const defaultPass = defaultAccount ? envSecret(defaultAccount.passEnv) : null;
      if (defaultAccount && defaultPass && verifyPassword(defaultPass, password).valid) {
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
          if (adminAcct && verifyPassword(adminAcct.pass, password).valid) {
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

    const token = await signSession({ kind: "staff", ...matchedStaff });

    const response = NextResponse.json({
      success: true,
      message: `Welcome, ${matchedStaff.name}`,
      staff: matchedStaff,
    });

    response.cookies.set(STAFF_COOKIE, token, sessionCookieOptions);

    return response;
  } catch (error) {
    console.error("Staff auth error:", error);
    return NextResponse.json({ success: false, message: "Internal server error." }, { status: 500 });
  }
}

// DELETE: Staff Logout
export async function DELETE() {
  const response = NextResponse.json({ success: true, message: "Staff logged out." });
  response.cookies.delete(STAFF_COOKIE);
  return response;
}
