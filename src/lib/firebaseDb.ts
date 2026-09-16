import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "./firebase";

// Collection Names
export const COLLECTIONS = {
  REGISTRATIONS: "registrations",
  BOOTHS: "booth_overrides",
  INQUIRIES: "inquiries",
  SETTINGS: "settings",
  BADGE_TEMPLATES: "badge_templates",
};

// ----------------- REGISTRATIONS -----------------
export async function getFirebaseRegistrations() {
  try {
    const q = query(
      collection(db, COLLECTIONS.REGISTRATIONS),
      orderBy("registeredAt", "desc"),
      limit(200)
    );
    const snap = await getDocs(q);
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.warn("Firestore getRegistrations error, fallback to local:", error);
    return null;
  }
}

export async function addFirebaseRegistration(regData: any) {
  try {
    const id = regData.id || `HHE26-${Math.floor(100000 + Math.random() * 900000)}`;
    const ref = doc(db, COLLECTIONS.REGISTRATIONS, id);
    const payload = {
      ...regData,
      id,
      checkedIn: false,
      registeredAt: new Date().toISOString(),
    };
    await setDoc(ref, payload);
    return payload;
  } catch (error) {
    console.warn("Firestore addRegistration error:", error);
    return null;
  }
}

export async function toggleFirebaseCheckin(regId: string, checkedIn: boolean) {
  try {
    const ref = doc(db, COLLECTIONS.REGISTRATIONS, regId);
    await updateDoc(ref, { checkedIn, updatedAt: new Date().toISOString() });
    return true;
  } catch (error) {
    console.warn("Firestore toggleCheckin error:", error);
    return false;
  }
}

export async function deleteFirebaseRegistration(regId: string) {
  try {
    const ref = doc(db, COLLECTIONS.REGISTRATIONS, regId);
    await deleteDoc(ref);
    return true;
  } catch (error) {
    console.warn("Firestore deleteRegistration error:", error);
    return false;
  }
}

// ----------------- BOOTH OVERRIDES -----------------
export async function getFirebaseBoothOverrides() {
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.BOOTHS));
    const overrides: Record<string, any> = {};
    snap.docs.forEach((doc) => {
      overrides[doc.id] = doc.data();
    });
    return overrides;
  } catch (error) {
    console.warn("Firestore getBoothOverrides error:", error);
    return null;
  }
}

export async function setFirebaseBoothOverride(
  boothNumber: string,
  data: { status: string; exhibitorName?: string }
) {
  try {
    const ref = doc(db, COLLECTIONS.BOOTHS, boothNumber);
    const payload = {
      ...data,
      boothNumber,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(ref, payload, { merge: true });
    return payload;
  } catch (error) {
    console.warn("Firestore setBoothOverride error:", error);
    return null;
  }
}

// ----------------- INQUIRIES -----------------
export async function getFirebaseInquiries() {
  try {
    const q = query(
      collection(db, COLLECTIONS.INQUIRIES),
      orderBy("submittedAt", "desc"),
      limit(100)
    );
    const snap = await getDocs(q);
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.warn("Firestore getInquiries error:", error);
    return null;
  }
}

export async function addFirebaseInquiry(inquiryData: any) {
  try {
    const id = inquiryData.id || `INQ-${Date.now().toString().slice(-6)}`;
    const ref = doc(db, COLLECTIONS.INQUIRIES, id);
    const payload = {
      ...inquiryData,
      id,
      status: inquiryData.status || "New",
      submittedAt: new Date().toISOString(),
    };
    await setDoc(ref, payload);
    return payload;
  } catch (error) {
    console.warn("Firestore addInquiry error:", error);
    return null;
  }
}

export async function updateFirebaseInquiryStatus(inquiryId: string, status: string) {
  try {
    const ref = doc(db, COLLECTIONS.INQUIRIES, inquiryId);
    await updateDoc(ref, { status, updatedAt: new Date().toISOString() });
    return true;
  } catch (error) {
    console.warn("Firestore updateInquiryStatus error:", error);
    return false;
  }
}

export async function deleteFirebaseInquiry(inquiryId: string) {
  try {
    const ref = doc(db, COLLECTIONS.INQUIRIES, inquiryId);
    await deleteDoc(ref);
    return true;
  } catch (error) {
    console.warn("Firestore deleteInquiry error:", error);
    return false;
  }
}

// ----------------- SETTINGS -----------------
export async function getFirebaseSettings() {
  try {
    const ref = doc(db, COLLECTIONS.SETTINGS, "expo_config");
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (error) {
    console.warn("Firestore getSettings error:", error);
    return null;
  }
}

export async function updateFirebaseSettings(settingsData: any) {
  try {
    const ref = doc(db, COLLECTIONS.SETTINGS, "expo_config");
    const payload = {
      ...settingsData,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(ref, payload, { merge: true });
    return payload;
  } catch (error) {
    console.warn("Firestore updateSettings error:", error);
    return null;
  }
}
