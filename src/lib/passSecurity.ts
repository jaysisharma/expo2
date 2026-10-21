import crypto from "crypto";

// These strings were published in the (public) source code, so anyone could forge passes with them.
// They are only used in local development, never in production.
const PUBLIC_LEGACY_SECRETS = [
  "ippan-green-energy-expo-2027-aes256gcm-secure-token-vault-key",
  "himalayan-green-energy-expo-2027-secret-key-32bytes-salt",
];
const IS_PRODUCTION = process.env.NODE_ENV === "production";

function deriveKey(secret: string) {
  return crypto.createHash("sha256").update(secret).digest();
}

function isUsableSecret(secret: string | undefined): secret is string {
  return !!secret && secret.length >= 16 && !(IS_PRODUCTION && PUBLIC_LEGACY_SECRETS.includes(secret));
}

/** Key used to issue new passes: PASS_SECRET_KEY (required in production). */
function currentKey(): Buffer {
  const secret = process.env.PASS_SECRET_KEY;
  if (isUsableSecret(secret)) return deriveKey(secret);
  if (!IS_PRODUCTION) return deriveKey(PUBLIC_LEGACY_SECRETS[0]);
  throw new Error("PASS_SECRET_KEY is missing or is a publicly known value — set a new random secret");
}

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
  const cipher = crypto.createCipheriv("aes-256-gcm", currentKey(), iv);

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
 * Keys accepted when verifying a pass: the current key, plus any comma-separated
 * PASS_SECRET_KEY_PREVIOUS values so passes issued before a key change keep working.
 */
function candidateKeys(): Buffer[] {
  const secrets = [
    process.env.PASS_SECRET_KEY,
    ...(process.env.PASS_SECRET_KEY_PREVIOUS || "").split(",").map((s) => s.trim()),
  ].filter((s): s is string => !!s && s.length >= 16);
  if (!IS_PRODUCTION) secrets.push(...PUBLIC_LEGACY_SECRETS);
  return Array.from(new Set(secrets)).map(deriveKey);
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

    for (const key of candidateKeys()) {
      try {
        const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
        decipher.setAuthTag(tag);

        const decrypted = Buffer.concat([
          decipher.update(encrypted),
          decipher.final(),
        ]);

        const parsed = JSON.parse(decrypted.toString("utf8")) as PassSecurityPayload;
        if (parsed && parsed.id) {
          return parsed;
        }
      } catch {
        // Try next key
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Generates an 8-character cryptographic security verification code (checksum)
 * from the pass ID and secret salt. Useful for printed security holograms and gate staff visual checks.
 */
export function generateSecurityChecksum(passId: string): string {
  const hash = crypto
    .createHmac("sha256", currentKey())
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
