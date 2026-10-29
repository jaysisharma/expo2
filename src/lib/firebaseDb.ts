// Server-only data layer. Uses the Firebase Admin SDK when FIREBASE_SERVICE_ACCOUNT is set
// (see lib/firestoreServer.ts); never import this file from a "use client" component.
import "server-only";
import {
  db,
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
  where,
  addDoc,
} from "./firestoreServer";

// Collection Names
export const COLLECTIONS = {
  REGISTRATIONS: "registrations",
  BOOTHS: "booth_overrides",
  INQUIRIES: "inquiries",
  SETTINGS: "settings",
  BADGE_TEMPLATES: "badge_templates",
  EMAIL_CAMPAIGNS: "email_campaigns",
  NEWS: "news",
  PARTNERS: "current_partners",
  TRAFFIC_VISITS: "traffic_visits",
  CRAWLER_STATS: "crawler_stats",
  FUNNEL_EVENTS: "funnel_events",
  SHORT_LINKS: "short_links",
  STALL_BOOKINGS: "stall_bookings",
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
  } catch (error: any) {
    // Graceful fallback to local data when Firestore permissions are restricted
    return null;
  }
}

export async function getFirebaseRegistrationById(regId: string) {
  try {
    const ref = doc(db, COLLECTIONS.REGISTRATIONS, regId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() };
    }
    return null;
  } catch (error) {
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

export async function updateFirebaseRegistration(regId: string, patch: Record<string, any>): Promise<boolean> {
  try {
    await setDoc(doc(db, COLLECTIONS.REGISTRATIONS, regId), { ...patch, updatedAt: new Date().toISOString() }, { merge: true });
    return true;
  } catch (error) {
    console.warn("Firestore updateRegistration error:", error);
    return false;
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
  } catch {
    return null;
  }
}

export async function setFirebaseBoothOverride(
  boothNumber: string,
  data: {
    status?: string;
    exhibitorName?: string;
    priceUSD?: number;
    priceNPR?: number;
    isPrime?: boolean;
    primeChargeNPR?: number;
    primeChargeUSD?: number;
    sizeSqM?: number;
    dimensions?: string;
    is72hHold?: boolean;
    holdExpiresAt?: string;
    bookingRef?: string;
  }
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
  } catch {
    return null;
  }
}

export async function deleteFirebaseBoothOverride(boothNumber: string): Promise<boolean> {
  try {
    const ref = doc(db, COLLECTIONS.BOOTHS, boothNumber);
    await deleteDoc(ref);
    return true;
  } catch (error) {
    console.warn("Firestore deleteBoothOverride error:", error);
    return false;
  }
}

export async function clearAllFirebaseBoothOverrides(): Promise<boolean> {
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.BOOTHS));
    if (snap && snap.docs && snap.docs.length > 0) {
      await Promise.all(
        snap.docs.map(async (d) => {
          try {
            await deleteDoc(doc(db, COLLECTIONS.BOOTHS, d.id));
          } catch {
            try {
              await setDoc(
                doc(db, COLLECTIONS.BOOTHS, d.id),
                {
                  boothNumber: d.id,
                  status: "Available",
                  exhibitorName: "",
                  updatedAt: new Date().toISOString(),
                },
                { merge: true }
              );
            } catch {}
          }
        })
      );
    }
    return true;
  } catch (error) {
    console.warn("Firestore clearAllFirebaseBoothOverrides error:", error);
    return false;
  }
}

// ----------------- SPONSORSHIP HOLDS & OVERRIDES -----------------
export async function getFirebaseSponsorshipHolds(): Promise<Record<string, any> | null> {
  try {
    const ref = doc(db, COLLECTIONS.SETTINGS, "sponsorship_holds");
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data();
    }
    return {};
  } catch {
    return null;
  }
}

export async function setFirebaseSponsorshipHold(packageId: string, holdData: any): Promise<boolean> {
  try {
    const ref = doc(db, COLLECTIONS.SETTINGS, "sponsorship_holds");
    await setDoc(
      ref,
      {
        [packageId]: {
          ...holdData,
          packageId,
          updatedAt: new Date().toISOString(),
        },
      },
      { merge: true }
    );
    return true;
  } catch (error) {
    console.warn("Firestore setFirebaseSponsorshipHold error:", error);
    return false;
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
  } catch {
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
  } catch {
    return null;
  }
}

export async function updateFirebaseInquiryStatus(inquiryId: string, status: string) {
  try {
    const ref = doc(db, COLLECTIONS.INQUIRIES, inquiryId);
    await updateDoc(ref, { status, updatedAt: new Date().toISOString() });
    return true;
  } catch {
    return false;
  }
}

export async function deleteFirebaseInquiry(inquiryId: string) {
  try {
    const ref = doc(db, COLLECTIONS.INQUIRIES, inquiryId);
    await deleteDoc(ref);
    return true;
  } catch {
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
  } catch {
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
  } catch {
    return null;
  }
}

// ----------------- ADMIN ACCOUNTS -----------------
export async function getFirebaseAdminAccounts(): Promise<Record<string, any> | null> {
  try {
    const ref = doc(db, COLLECTIONS.SETTINGS, "admin_accounts");
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return (snap.data()?.accounts as Record<string, any>) || {};
    }
    return null;
  } catch {
    return null;
  }
}

export async function saveFirebaseAdminAccounts(accounts: Record<string, any>): Promise<boolean> {
  try {
    const ref = doc(db, COLLECTIONS.SETTINGS, "admin_accounts");
    await setDoc(
      ref,
      {
        accounts,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return true;
  } catch {
    return false;
  }
}

// ----------------- BADGE TEMPLATES -----------------
export async function getFirebaseBadgeTemplates() {
  try {
    const ref = doc(db, COLLECTIONS.BADGE_TEMPLATES, "templates_config");
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (error) {
    console.warn("Firestore getBadgeTemplates error:", error);
    return null;
  }
}

export async function saveFirebaseBadgeTemplates(templatesData: any) {
  try {
    const ref = doc(db, COLLECTIONS.BADGE_TEMPLATES, "templates_config");
    const payload = {
      ...templatesData,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(ref, payload, { merge: true });
    return payload;
  } catch (error) {
    console.warn("Firestore saveBadgeTemplates error:", error);
    return null;
  }
}

// ----------------- GALLERY -----------------
export async function getFirebaseGallery(): Promise<any[] | null> {
  try {
    const ref = doc(db, "gallery", "items_config");
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      return data.items || null;
    }
    return null;
  } catch (error) {
    console.warn("Firestore getGallery error:", error);
    return null;
  }
}

export async function saveFirebaseGallery(items: any[]): Promise<boolean> {
  try {
    const ref = doc(db, "gallery", "items_config");
    await setDoc(ref, {
      items,
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.warn("Firestore saveGallery error:", error);
    return false;
  }
}

// ----------------- MEMBERS (Speakers / Committee) -----------------
export async function getFirebaseMembers(): Promise<any[] | null> {
  try {
    const ref = doc(db, "members", "members_config");
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      return data.members || null;
    }
    return null;
  } catch (error) {
    console.warn("Firestore getMembers error:", error);
    return null;
  }
}

export async function saveFirebaseMembers(members: any[]): Promise<boolean> {
  try {
    const ref = doc(db, "members", "members_config");
    await setDoc(ref, {
      members,
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.warn("Firestore saveMembers error:", error);
    return false;
  }
}

// ----------------- EMAIL CAMPAIGNS -----------------
export async function getFirebaseEmailCampaigns(): Promise<any[] | null> {
  try {
    const q = query(
      collection(db, COLLECTIONS.EMAIL_CAMPAIGNS),
      orderBy("sentAt", "desc"),
      limit(50)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.warn("Firestore getFirebaseEmailCampaigns error:", error);
    return null;
  }
}

export async function addFirebaseEmailCampaign(campaign: any): Promise<boolean> {
  try {
    const id = campaign.id || `CMP-${Date.now()}`;
    const ref = doc(db, COLLECTIONS.EMAIL_CAMPAIGNS, id);
    await setDoc(ref, {
      ...campaign,
      id,
      sentAt: campaign.sentAt || new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.warn("Firestore addFirebaseEmailCampaign error:", error);
    return false;
  }
}

// ----------------- NEWS -----------------
export async function getFirebaseNews(): Promise<any[] | null> {
  try {
    const ref = doc(db, COLLECTIONS.NEWS, "articles_config");
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      return Array.isArray(data.articles) ? data.articles : [];
    }
    return null;
  } catch (error) {
    console.warn("Firestore getFirebaseNews error:", error);
    return null;
  }
}

export async function saveFirebaseNews(articles: any[]): Promise<boolean> {
  try {
    const ref = doc(db, COLLECTIONS.NEWS, "articles_config");
    await setDoc(ref, {
      articles,
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.warn("Firestore saveFirebaseNews error:", error);
    return false;
  }
}

// ----------------- CURRENT PARTNERS (2027 Edition) -----------------
export async function getFirebaseCurrentPartners(): Promise<any[] | null> {
  try {
    const ref = doc(db, COLLECTIONS.PARTNERS, "current_config");
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      return Array.isArray(data.partners) ? data.partners : [];
    }
    return null;
  } catch (error) {
    console.warn("Firestore getFirebaseCurrentPartners error:", error);
    return null;
  }
}

export async function saveFirebaseCurrentPartners(partners: any[]): Promise<boolean> {
  try {
    const ref = doc(db, COLLECTIONS.PARTNERS, "current_config");
    await setDoc(ref, {
      partners,
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.warn("Firestore saveFirebaseCurrentPartners error:", error);
    return false;
  }
}

// ----------------- VIDEOS (Drone Film & Past Editions Glimpse) -----------------
export async function getFirebaseVideos(): Promise<any[] | null> {
  try {
    const ref = doc(db, "videos", "videos_config");
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      return Array.isArray(data.videos) ? data.videos : null;
    }
    return null;
  } catch (error) {
    console.warn("Firestore getVideos error:", error);
    return null;
  }
}

export async function saveFirebaseVideos(videos: any[]): Promise<boolean> {
  try {
    const ref = doc(db, "videos", "videos_config");
    await setDoc(ref, {
      videos,
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.warn("Firestore saveVideos error:", error);
    return false;
  }
}

// ----------------- FLOOR PLAN PERSISTENCE -----------------
export async function getFirebaseFloorPlan(): Promise<any | null> {
  try {
    const ref = doc(db, COLLECTIONS.SETTINGS, "floor_plan_design");
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (error) {
    console.warn("Firestore getFloorPlan error:", error);
    return null;
  }
}

export async function saveFirebaseFloorPlan(data: any): Promise<boolean> {
  try {
    const ref = doc(db, COLLECTIONS.SETTINGS, "floor_plan_design");
    await setDoc(
      ref,
      {
        ...data,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return true;
  } catch (error) {
    console.warn("Firestore saveFloorPlan error:", error);
    return false;
  }
}



// ----------------- TRAFFIC SOURCES -----------------
export async function addFirebaseTrafficVisit(visit: Record<string, any>): Promise<boolean> {
  try {
    await addDoc(collection(db, COLLECTIONS.TRAFFIC_VISITS), visit);
    return true;
  } catch (error) {
    console.warn("Firestore addTrafficVisit error:", error);
    return false;
  }
}

export async function getFirebaseTrafficVisits(sinceISO: string, max = 10000): Promise<any[] | null> {
  try {
    const q = query(
      collection(db, COLLECTIONS.TRAFFIC_VISITS),
      where("ts", ">=", sinceISO),
      orderBy("ts", "desc"),
      limit(max)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.warn("Firestore getTrafficVisits error:", error);
    return null;
  }
}

// Daily per-crawler counters written by middleware (see lib/crawlerLog.ts)
export async function getFirebaseCrawlerStats(sinceDate: string): Promise<any[] | null> {
  try {
    const q = query(collection(db, COLLECTIONS.CRAWLER_STATS), where("date", ">=", sinceDate), limit(5000));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.warn("Firestore getCrawlerStats error:", error);
    return null;
  }
}

// Funnel events (form start / submit, payment result) written by /api/track
export async function addFirebaseFunnelEvent(event: Record<string, any>): Promise<boolean> {
  try {
    await addDoc(collection(db, COLLECTIONS.FUNNEL_EVENTS), event);
    return true;
  } catch (error) {
    console.warn("Firestore addFunnelEvent error:", error);
    return false;
  }
}

export async function getFirebaseFunnelEvents(sinceISO: string, max = 20000): Promise<any[] | null> {
  try {
    const q = query(
      collection(db, COLLECTIONS.FUNNEL_EVENTS),
      where("ts", ">=", sinceISO),
      orderBy("ts", "desc"),
      limit(max)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.warn("Firestore getFunnelEvents error:", error);
    return null;
  }
}

// ----------------- SHORT LINKS (/go/:code) -----------------
export interface ShortLink {
  code: string;
  path: string;
  source: string;
  medium: string;
  campaign: string;
  clicks: number;
  createdAt: string;
  createdBy?: string;
}

export async function getFirebaseShortLinks(): Promise<ShortLink[] | null> {
  try {
    const snap = await getDocs(query(collection(db, COLLECTIONS.SHORT_LINKS), orderBy("createdAt", "desc"), limit(500)));
    return snap.docs.map((d) => d.data() as ShortLink);
  } catch (error) {
    console.warn("Firestore getShortLinks error:", error);
    return null;
  }
}

export async function getFirebaseShortLink(code: string): Promise<ShortLink | null> {
  try {
    const snap = await getDoc(doc(db, COLLECTIONS.SHORT_LINKS, code));
    return snap.exists() ? (snap.data() as ShortLink) : null;
  } catch {
    return null;
  }
}

export async function saveFirebaseShortLink(link: ShortLink): Promise<boolean> {
  try {
    await setDoc(doc(db, COLLECTIONS.SHORT_LINKS, link.code), link);
    return true;
  } catch (error) {
    console.warn("Firestore saveShortLink error:", error);
    return false;
  }
}

export async function deleteFirebaseShortLink(code: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, COLLECTIONS.SHORT_LINKS, code));
    return true;
  } catch {
    return false;
  }
}

export async function recordFirebaseShortLinkClick(link: ShortLink): Promise<void> {
  try {
    // Read-modify-write is fine here: an occasional lost count under heavy concurrency doesn't matter
    await setDoc(doc(db, COLLECTIONS.SHORT_LINKS, link.code), { clicks: (link.clicks || 0) + 1, lastClickAt: new Date().toISOString() }, { merge: true });
  } catch {}
}

// ----------------- STALL / SPONSOR BOOKINGS -----------------
export async function saveFirebaseStallBooking(booking: Record<string, any>): Promise<boolean> {
  try {
    await setDoc(doc(db, COLLECTIONS.STALL_BOOKINGS, booking.id), { ...booking, updatedAt: new Date().toISOString() }, { merge: true });
    return true;
  } catch (error) {
    console.warn("Firestore saveStallBooking error:", error);
    return false;
  }
}

export async function getFirebaseStallBooking(id: string): Promise<any | null> {
  try {
    const snap = await getDoc(doc(db, COLLECTIONS.STALL_BOOKINGS, id));
    return snap.exists() ? snap.data() : null;
  } catch {
    return null;
  }
}

export async function getFirebaseStallBookings(): Promise<any[] | null> {
  try {
    const snap = await getDocs(query(collection(db, COLLECTIONS.STALL_BOOKINGS), orderBy("createdAt", "desc"), limit(500)));
    return snap.docs.map((d) => d.data());
  } catch (error) {
    console.warn("Firestore getStallBookings error:", error);
    return null;
  }
}
