// Server-side Firestore access with the same function names as the "firebase/firestore"
// client SDK, so lib/firebaseDb.ts works unchanged on either backend:
//
// - FIREBASE_SERVICE_ACCOUNT set → Firebase Admin SDK (bypasses security rules, so the
//   public rules can deny all access and the database is no longer world-readable).
// - Not set → the public client SDK (previous behaviour; requires open rules).
//
// FIREBASE_SERVICE_ACCOUNT is the service-account JSON (raw or base64-encoded) from
// Firebase console → Project settings → Service accounts → Generate new private key.
import "server-only";
import * as client from "firebase/firestore";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { db as clientDb } from "./firebase";

type Constraint =
  | { kind: "where"; field: string; op: FirebaseFirestore.WhereFilterOp; value: unknown }
  | { kind: "orderBy"; field: string; dir?: "asc" | "desc" }
  | { kind: "limit"; n: number };

let adminDb: FirebaseFirestore.Firestore | null | undefined;

function getAdminDb(): FirebaseFirestore.Firestore | null {
  if (adminDb !== undefined) return adminDb;
  adminDb = null;
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw || typeof window !== "undefined") return adminDb;
  try {
    const json = raw.trim().startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf-8");
    const app = getApps().find((a) => a.name === "server") || initializeApp({ credential: cert(JSON.parse(json)) }, "server");
    adminDb = getFirestore(app);
  } catch (error) {
    console.error("[firestoreServer] Invalid FIREBASE_SERVICE_ACCOUNT, falling back to client SDK:", error);
  }
  return adminDb;
}

export function usingAdminSdk() {
  return getAdminDb() !== null;
}

// Marker passed in place of the client `db`; the functions below pick the backend.
export const db = clientDb;

export function collection(_db: unknown, name: string): any {
  const admin = getAdminDb();
  return admin ? admin.collection(name) : client.collection(clientDb, name);
}

export function doc(_db: unknown, collectionName: string, id: string): any {
  const admin = getAdminDb();
  return admin ? admin.collection(collectionName).doc(id) : client.doc(clientDb, collectionName, id);
}

export function where(field: string, op: FirebaseFirestore.WhereFilterOp, value: unknown): any {
  return getAdminDb() ? { kind: "where", field, op, value } : client.where(field, op as client.WhereFilterOp, value);
}

export function orderBy(field: string, dir?: "asc" | "desc"): any {
  return getAdminDb() ? { kind: "orderBy", field, dir } : client.orderBy(field, dir);
}

export function limit(n: number): any {
  return getAdminDb() ? { kind: "limit", n } : client.limit(n);
}

export function query(ref: any, ...constraints: any[]): any {
  if (!getAdminDb()) return client.query(ref, ...constraints);
  let q: FirebaseFirestore.Query = ref;
  for (const c of constraints as Constraint[]) {
    if (c.kind === "where") q = q.where(c.field, c.op, c.value);
    else if (c.kind === "orderBy") q = q.orderBy(c.field, c.dir);
    else q = q.limit(c.n);
  }
  return q;
}

export async function getDocs(q: any): Promise<{ docs: { id: string; data: () => any }[] }> {
  if (!getAdminDb()) return client.getDocs(q);
  const snap = await (q as FirebaseFirestore.Query).get();
  return { docs: snap.docs.map((d) => ({ id: d.id, data: () => d.data() })) };
}

export async function getDoc(ref: any): Promise<{ id: string; exists: () => boolean; data: () => any }> {
  if (!getAdminDb()) return client.getDoc(ref);
  const snap = await (ref as FirebaseFirestore.DocumentReference).get();
  return { id: snap.id, exists: () => snap.exists, data: () => snap.data() };
}

export async function setDoc(ref: any, data: any, options?: { merge?: boolean }): Promise<void> {
  if (!getAdminDb()) return client.setDoc(ref, data, options || {});
  await (ref as FirebaseFirestore.DocumentReference).set(data, options || {});
}

export async function updateDoc(ref: any, data: any): Promise<void> {
  if (!getAdminDb()) return client.updateDoc(ref, data);
  await (ref as FirebaseFirestore.DocumentReference).update(data);
}

export async function deleteDoc(ref: any): Promise<void> {
  if (!getAdminDb()) return client.deleteDoc(ref);
  await (ref as FirebaseFirestore.DocumentReference).delete();
}

export async function addDoc(ref: any, data: any): Promise<{ id: string }> {
  if (!getAdminDb()) return client.addDoc(ref, data);
  return (ref as FirebaseFirestore.CollectionReference).add(data);
}
