// Signed session tokens for admin and staff logins.
// Uses Web Crypto (HMAC-SHA256) so it works in both middleware and API routes.
// Token format: base64url(JSON payload) + "." + base64url(signature)

export const ADMIN_COOKIE = "hhe_admin_token";
export const STAFF_COOKIE = "hhe_staff_token";
export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

export type SessionKind = "admin" | "staff";

export interface SessionPayload {
  kind: SessionKind;
  email: string;
  name: string;
  role: string;
  gate?: string;
  org?: string;
  exp: number;
}

const encoder = new TextEncoder();

function getSecret(): string | null {
  const secret = process.env.AUTH_SECRET;
  if (secret && secret.length >= 16) return secret;
  // Never fall back to a built-in secret in production — tokens would be forgeable
  if (process.env.NODE_ENV !== "production") return "dev-only-insecure-auth-secret";
  return null;
}

export function isAuthConfigured() {
  return getSecret() !== null;
}

function toBase64Url(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string) {
  const b64 = value.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((value.length + 3) % 4);
  const binary = atob(b64);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

async function hmac(secret: string, data: string) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(data)));
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

export async function signSession(payload: Omit<SessionPayload, "exp">): Promise<string> {
  const secret = getSecret();
  if (!secret) throw new Error("AUTH_SECRET is not configured");
  const body = toBase64Url(
    encoder.encode(JSON.stringify({ ...payload, exp: Date.now() + SESSION_MAX_AGE_SECONDS * 1000 }))
  );
  return `${body}.${toBase64Url(await hmac(secret, body))}`;
}

export async function verifySession(token: string | null | undefined, kind: SessionKind): Promise<SessionPayload | null> {
  const secret = getSecret();
  if (!token || !secret) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  try {
    if (!constantTimeEqual(await hmac(secret, body), fromBase64Url(sig))) return null;
    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(body))) as SessionPayload;
    if (payload.kind !== kind || !payload.email || !(payload.exp > Date.now())) return null;
    return payload;
  } catch {
    return null;
  }
}

/** Read a cookie from any Request (works for both Request and NextRequest). */
export function readCookie(req: Request, name: string) {
  const header = req.headers.get("cookie") || "";
  const match = header.split(/;\s*/).find((c) => c.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : undefined;
}

export function getAdminSession(req: Request) {
  return verifySession(readCookie(req, ADMIN_COOKIE), "admin");
}

/** Staff session, or an admin session (admins can do everything staff can). */
export async function getStaffOrAdminSession(req: Request) {
  return (await verifySession(readCookie(req, STAFF_COOKIE), "staff")) || (await getAdminSession(req));
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_MAX_AGE_SECONDS,
};

// Simple in-memory login throttle (per server instance): 10 attempts / 15 min per IP
const attempts = new Map<string, { count: number; start: number }>();
export function tooManyLoginAttempts(req: Request) {
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "unknown";
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now - entry.start > 15 * 60 * 1000) {
    attempts.set(ip, { count: 1, start: now });
    return false;
  }
  entry.count += 1;
  return entry.count > 10;
}
