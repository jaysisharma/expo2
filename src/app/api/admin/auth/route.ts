import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

const ADMIN_STORE_PATH = path.join(process.cwd(), "data", "adminUsers.json");

// In-memory + persisted admin accounts store
let memoryAdminUsers: Record<
  string,
  { pass: string; name: string; role: "Super Admin" | "Event Organizer" | "Secretariat Officer"; org: string }
> = {
  "admin@hydroexpo.org.np": {
    pass: process.env.ADMIN_PASSWORD || "expo2027admin",
    name: "IPPAN Secretariat Admin",
    role: "Super Admin",
    org: "Independent Power Producers' Association, Nepal (IPPAN)",
  },
  "admin@ippan.org.np": {
    pass: process.env.ADMIN_PASSWORD || "expo2027admin",
    name: "IPPAN Executive Secretary",
    role: "Super Admin",
    org: "IPPAN Clean Energy Secretariat",
  },
  "admin@eventsolution.com.np": {
    pass: process.env.ADMIN_PASSWORD || "expo2027admin",
    name: "Event Solution Manager",
    role: "Event Organizer",
    org: "Event Solution Pvt. Ltd.",
  },
  "admin": {
    pass: process.env.ADMIN_PASSWORD || "expo2027admin",
    name: "Super Administrator",
    role: "Super Admin",
    org: "Himalayan Green Energy Expo Secretariat",
  },
};

async function loadAdminUsers() {
  try {
    const raw = await fs.readFile(ADMIN_STORE_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    memoryAdminUsers = { ...memoryAdminUsers, ...parsed };
  } catch {}
  return memoryAdminUsers;
}

async function saveAdminUsers(users: typeof memoryAdminUsers) {
  memoryAdminUsers = users;
  try {
    await fs.mkdir(path.dirname(ADMIN_STORE_PATH), { recursive: true });
    await fs.writeFile(ADMIN_STORE_PATH, JSON.stringify(users, null, 2), "utf-8");
  } catch {}
}

function createServerToken(email: string) {
  const payload = {
    email,
    iat: Date.now(),
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };
  return Buffer.from(JSON.stringify(payload)).toString("base64");
}

function verifyServerToken(token: string): { email: string } | null {
  try {
    const raw = Buffer.from(token, "base64").toString("utf-8");
    const parsed = JSON.parse(raw);
    if (parsed.exp && parsed.exp > Date.now() && parsed.email) {
      return { email: parsed.email };
    }
    return null;
  } catch {
    return null;
  }
}

// GET: check authenticated session
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("hhe_admin_token")?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const verified = verifyServerToken(token);
    if (!verified) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const users = await loadAdminUsers();
    const account = users[verified.email.toLowerCase()] || {
      name: "Secretariat Administrator",
      role: "Super Admin" as const,
      org: "Himalayan Green Energy Expo Secretariat",
    };

    return NextResponse.json({
      authenticated: true,
      user: {
        email: verified.email,
        name: account.name,
        role: account.role,
        organization: account.org,
        avatar: "/images/logo.png",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { authenticated: false, error: error.message || "Auth check failed" },
      { status: 500 }
    );
  }
}

// POST: login, register, or logout
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, email, password, name, organization, role } = body;
    const users = await loadAdminUsers();

    // LOGOUT
    if (action === "logout") {
      const cookieStore = await cookies();
      cookieStore.delete("hhe_admin_token");
      return NextResponse.json({ success: true, message: "Logged out" });
    }

    // REGISTER NEW ADMIN
    if (action === "register") {
      const cleanEmail = (email || "").toLowerCase().trim();
      const cleanPass = (password || "").trim();
      const cleanName = (name || "").trim();
      const cleanOrg = (organization || "Himalayan Green Energy Expo Secretariat").trim();

      if (!cleanEmail || !cleanPass || !cleanName) {
        return NextResponse.json(
          { success: false, message: "Name, email, and password are required." },
          { status: 400 }
        );
      }

      if (cleanPass.length < 6) {
        return NextResponse.json(
          { success: false, message: "Password must be at least 6 characters." },
          { status: 400 }
        );
      }

      if (users[cleanEmail]) {
        return NextResponse.json(
          { success: false, message: "An admin account with this email already exists." },
          { status: 409 }
        );
      }

      const newUser = {
        pass: cleanPass,
        name: cleanName,
        role: (role as any) || "Secretariat Officer",
        org: cleanOrg,
      };

      users[cleanEmail] = newUser;
      await saveAdminUsers(users);

      const token = createServerToken(cleanEmail);
      const cookieStore = await cookies();
      cookieStore.set("hhe_admin_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
      });

      return NextResponse.json({
        success: true,
        message: "Account created successfully",
        user: {
          email: cleanEmail,
          name: newUser.name,
          role: newUser.role,
          organization: newUser.org,
          avatar: "/images/logo.png",
        },
      });
    }

    // LOGIN
    if (action === "login") {
      const cleanEmail = (email || "").toLowerCase().trim();
      const cleanPass = (password || "").trim();

      const matchedAccount = users[cleanEmail];
      const masterPass = process.env.ADMIN_PASSWORD || "expo2027admin";

      const isValid = (matchedAccount && matchedAccount.pass === cleanPass) || cleanPass === masterPass;

      if (!isValid) {
        return NextResponse.json(
          { success: false, message: "Invalid email or password." },
          { status: 401 }
        );
      }

      const account = matchedAccount || {
        name: "Secretariat Administrator",
        role: "Super Admin" as const,
        org: "Himalayan Green Energy Expo Secretariat",
      };

      const user = {
        email: cleanEmail,
        name: account.name,
        role: account.role,
        organization: account.org,
        avatar: "/images/logo.png",
      };

      const token = createServerToken(cleanEmail);
      const cookieStore = await cookies();
      cookieStore.set("hhe_admin_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
      });

      return NextResponse.json({
        success: true,
        message: "Authentication successful",
        user,
      });
    }

    return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Authentication failed" },
      { status: 500 }
    );
  }
}
