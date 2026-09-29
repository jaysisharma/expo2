import crypto from "crypto";

const PASS_SECRET =
  process.env.PASS_SECRET_KEY ||
  "himalayan-green-energy-expo-2027-secret-key-32bytes-salt";

// Derive a fixed 32-byte key using SHA-256
const ENCRYPTION_KEY = crypto.createHash("sha256").update(PASS_SECRET).digest();

export interface PassSecurityPayload {
  id: string;
  name?: string;
  email?: string;
  organization?: string;
  role?: string;
  jobTitle?: string;
  stallNumber?: string;
  phone?: string;
  country?: string;
  passType?: string;
  iat?: number; // Issued-at epoch ms
}

/**
 * Encrypts pass data into an anti-counterfeit, tamper-proof, URL-safe AES-256-GCM token.
 * Prevents unauthorized ID enumeration, ticket duplication, or forgery.
 */
export function encryptPassToken(payload: PassSecurityPayload): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", ENCRYPTION_KEY, iv);

  const dataToEncrypt = JSON.stringify({
    ...payload,
    iat: payload.iat || Date.now(),
  });

  const encrypted = Buffer.concat([
    cipher.update(dataToEncrypt, "utf8"),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  // Combine IV (12 bytes) + Tag (16 bytes) + Encrypted Data
  const combined = Buffer.concat([iv, tag, encrypted]);

  // Return base64url encoded string
  return combined
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Decrypts and cryptographically verifies an anti-counterfeit pass token.
 * Returns null if token was tampered with, forged, or malformed.
 */
export function decryptPassToken(token: string): PassSecurityPayload | null {
  try {
    if (!token) return null;

    // Convert from base64url to standard base64
    let base64 = token.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
      base64 += "=";
    }

    const buffer = Buffer.from(base64, "base64");
    if (buffer.length < 28) return null; // 12 bytes IV + 16 bytes tag minimum

    const iv = buffer.subarray(0, 12);
    const tag = buffer.subarray(12, 28);
    const encrypted = buffer.subarray(28);

    const decipher = crypto.createDecipheriv("aes-256-gcm", ENCRYPTION_KEY, iv);
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);

    return JSON.parse(decrypted.toString("utf8")) as PassSecurityPayload;
  } catch (error) {
    // Authentication failed (tampered token) or JSON parse failed
    return null;
  }
}

/**
 * Generates an 8-character cryptographic security verification code (checksum)
 * from the pass ID and secret salt. Useful for printed security holograms and gate staff visual checks.
 */
export function generateSecurityChecksum(passId: string): string {
  const hash = crypto
    .createHmac("sha256", ENCRYPTION_KEY)
    .update(passId.trim().toUpperCase())
    .digest("hex");
  return `${hash.substring(0, 4).toUpperCase()}-${hash.substring(4, 8).toUpperCase()}`;
}

/**
 * Masks a sensitive pass ID for public preview (e.g., "HHE27-236435" -> "HHE27-•••435")
 */
export function maskPassId(passId: string): string {
  if (!passId) return "••••••••";
  const parts = passId.split("-");
  if (parts.length === 2) {
    const prefix = parts[0];
    const num = parts[1];
    if (num.length >= 4) {
      const masked = "•".repeat(Math.max(1, num.length - 3)) + num.slice(-3);
      return `${prefix}-${masked}`;
    }
  }
  if (passId.length > 6) {
    return `${passId.slice(0, 4)}••••${passId.slice(-3)}`;
  }
  return passId;
}
