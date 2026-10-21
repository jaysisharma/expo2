// Password hashing for admin accounts (Node runtime only).
import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

/**
 * Checks a password against a stored value. Older accounts were saved in plain
 * text; those still verify, and `needsRehash` tells the caller to upgrade them.
 */
export function verifyPassword(stored: string | undefined, password: string) {
  if (!stored || !password) return { valid: false, needsRehash: false };
  if (stored.startsWith("scrypt$")) {
    const [, salt, hash] = stored.split("$");
    const candidate = scryptSync(password, salt, 64).toString("hex");
    return { valid: safeEqual(candidate, hash), needsRehash: false };
  }
  const valid = safeEqual(stored, password);
  return { valid, needsRehash: valid };
}
