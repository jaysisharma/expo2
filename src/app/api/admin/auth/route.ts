import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import fs from "fs/promises";
import path from "path";
import {
  ADMIN_COOKIE,
  getAdminSession,
  isAuthConfigured,
  sessionCookieOptions,
  signSession,
  tooManyLoginAttempts,
} from "@/lib/session";
import { hashPassword, verifyPassword } from "@/lib/passwords";

export const dynamic = "force-dynamic";

const ADMIN_STORE_PATH = path.join(process.cwd(), "data", "adminUsers.json");

type AdminRole = "Super Admin" | "Event Organizer" | "Operations Officer";
type AdminAccount = { pass: string; name: string; role: AdminRole; org: string };

// Built-in accounts. They only work when ADMIN_PASSWORD is set in the environment —
// there is deliberately no default password.
const BUILT_IN_ACCOUNTS: Record<string, Omit<AdminAccount, "pass">> = {
  "admin@hydroexpo.org.np": { name: "HIGEX Admin", role: "Super Admin", org: "Himalayan Green Energy Expo (HIGEX)" },
  "admin@ippan.org.np": { name: "IPPAN Executive Secretary", role: "Super Admin", org: "IPPAN Clean Energy Association" },
  "admin@eventsolution.com.np": { name: "Event Solution Manager", role: "Event Organizer", org: "Event Solution Pvt. Ltd." },
  admin: { name: "Super Administrator", role: "Super Admin", org: "Himalayan Green Energy Expo Team" },
};

function masterPassword() {
  const pass = process.env.ADMIN_PASSWORD || "";
  return pass.length >= 8 ? pass : null;
}

async function loadStoredUsers(): Promise<Record<string, AdminAccount>> {
  try {
    return JSON.parse(await fs.readFile(ADMIN_STORE_PATH, "utf-8"));
  } catch {
    return {};
  }
}

async function saveStoredUsers(users: Record<string, AdminAccount>) {
  try {
    await fs.mkdir(path.dirname(ADMIN_STORE_PATH), { recursive: true });
    await fs.writeFile(ADMIN_STORE_PATH, JSON.stringify(users, null, 2), "utf-8");
  } catch {}
}

function publicUser(email: string, account: Omit<AdminAccount, "pass">) {
  return {
    email,
    name: account.name,
    role: account.role,
    organization: account.org,
    avatar: "/images/logo.webp",
  };
}

// GET: check authenticated session
export async function GET(req: Request) {
  const session = await getAdminSession(req);
  if (!session) {
    return NextResponse.json({ authenticated: false, user: null });
  }
  return NextResponse.json({
    authenticated: true,
    user: publicUser(session.email, { name: session.name, role: session.role as AdminRole, org: session.org || "" }),
  });
}

// POST: login, register (Super Admin only), or logout
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, email, password, name, organization, role } = body;

    // LOGOUT
    if (action === "logout") {
      const cookieStore = await cookies();
      cookieStore.delete(ADMIN_COOKIE);
      return NextResponse.json({ success: true, message: "Logged out" });
    }

    if (!isAuthConfigured()) {
      return NextResponse.json(
        { success: false, message: "Admin login is not configured on the server (AUTH_SECRET missing)." },
        { status: 503 }
      );
    }

    // CREATE ADMIN ACCOUNT — only an existing Super Admin can do this
    if (action === "register") {
      const session = await getAdminSession(req);
      if (!session || session.role !== "Super Admin") {
        return NextResponse.json(
          { success: false, message: "Only a Super Admin can create admin accounts." },
          { status: 403 }
        );
      }

      const cleanEmail = (email || "").toLowerCase().trim();
      const cleanPass = (password || "").trim();
      const cleanName = (name || "").trim();
      const cleanOrg = (organization || "Himalayan Green Energy Expo Team").trim();

      if (!cleanEmail || !cleanPass || !cleanName) {
        return NextResponse.json({ success: false, message: "Name, email, and password are required." }, { status: 400 });
      }
      if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(cleanEmail)) {
        return NextResponse.json({ success: false, message: "Please provide a valid email address." }, { status: 400 });
      }
      if (cleanPass.length < 8) {
        return NextResponse.json({ success: false, message: "Password must be at least 8 characters." }, { status: 400 });
      }

      const users = await loadStoredUsers();
      if (users[cleanEmail] || BUILT_IN_ACCOUNTS[cleanEmail]) {
        return NextResponse.json({ success: false, message: "An admin account with this email already exists." }, { status: 409 });
      }

      const allowedRoles: AdminRole[] = ["Super Admin", "Event Organizer", "Operations Officer"];
      users[cleanEmail] = {
        pass: hashPassword(cleanPass),
        name: cleanName,
        role: allowedRoles.includes(role) ? role : "Operations Officer",
        org: cleanOrg,
      };
      await saveStoredUsers(users);

      // The Super Admin stays signed in as themselves
      return NextResponse.json({
        success: true,
        message: "Account created successfully",
        created: publicUser(cleanEmail, users[cleanEmail]),
      });
    }

    // LOGIN
    if (action === "login") {
      if (tooManyLoginAttempts(req)) {
        return NextResponse.json(
          { success: false, message: "Too many login attempts. Please wait 15 minutes and try again." },
          { status: 429 }
        );
      }

      const cleanEmail = (email || "").toLowerCase().trim();
      const cleanPass = (password || "").trim();

      let account: Omit<AdminAccount, "pass"> | null = null;
      const users = await loadStoredUsers();
      const stored = users[cleanEmail];

      if (stored) {
        const { valid, needsRehash } = verifyPassword(stored.pass, cleanPass);
        if (valid) {
          account = stored;
          if (needsRehash) {
            users[cleanEmail] = { ...stored, pass: hashPassword(cleanPass) };
            await saveStoredUsers(users);
          }
        }
      } else if (BUILT_IN_ACCOUNTS[cleanEmail]) {
        const master = masterPassword();
        if (master && verifyPassword(master, cleanPass).valid) account = BUILT_IN_ACCOUNTS[cleanEmail];
      }

      if (!account) {
        return NextResponse.json({ success: false, message: "Invalid email or password." }, { status: 401 });
      }

      const token = await signSession({
        kind: "admin",
        email: cleanEmail,
        name: account.name,
        role: account.role,
        org: account.org,
      });
      const cookieStore = await cookies();
      cookieStore.set(ADMIN_COOKIE, token, sessionCookieOptions);

      return NextResponse.json({
        success: true,
        message: "Authentication successful",
        user: publicUser(cleanEmail, account),
      });
    }

    return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Admin auth error:", error);
    return NextResponse.json({ success: false, message: "Authentication failed" }, { status: 500 });
  }
}
