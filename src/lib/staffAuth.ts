export interface StaffPayload {
  email: string;
  name: string;
  role: string;
  gate: string;
}

export function createStaffToken(email: string, name: string, role: string, gate: string): string {
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

export function verifyStaffToken(token: string): StaffPayload | null {
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
