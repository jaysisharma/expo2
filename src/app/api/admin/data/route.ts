import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { boothsData } from "@/data/booths";
import { exhibitorsData } from "@/data/exhibitors";
import { speakersData } from "@/data/speakers";
import { newsArticles } from "@/data/news";

export const dynamic = "force-dynamic";

const ROOT_ADMIN_DATA_PATH = path.join(process.cwd(), "data", "adminData.json");
const SRC_ADMIN_DATA_PATH = path.join(process.cwd(), "src", "data", "adminData.json");

import {
  getFirebaseRegistrations,
  addFirebaseRegistration,
  toggleFirebaseCheckin,
  deleteFirebaseRegistration,
  getFirebaseBoothOverrides,
  setFirebaseBoothOverride,
  getFirebaseInquiries,
  addFirebaseInquiry,
  updateFirebaseInquiryStatus,
  deleteFirebaseInquiry,
  getFirebaseSettings,
  updateFirebaseSettings,
} from "@/lib/firebaseDb";

// In-memory store for serverless environments (Vercel)
let memoryAdminData: any = null;

async function getAdminData() {
  // Try loading from Firebase Firestore first
  try {
    const [fbRegs, fbBooths, fbInqs, fbSettings] = await Promise.all([
      getFirebaseRegistrations(),
      getFirebaseBoothOverrides(),
      getFirebaseInquiries(),
      getFirebaseSettings(),
    ]);

    const hasFirebaseData =
      (fbRegs && fbRegs.length > 0) ||
      (fbBooths && Object.keys(fbBooths).length > 0) ||
      (fbInqs && fbInqs.length > 0);

    if (hasFirebaseData) {
      const defaultSettings = {
        eventName: "Himalayan Green Energy Expo Nepal 2027",
        eventDates: "Magh 2 - 4 · 16–18 Jan 2027",
        venue: "Bhrikutimandap Exhibition Complex, Kathmandu",
        registrationsOpen: true,
        stallBookingsOpen: true,
      };

      memoryAdminData = {
        registrations: fbRegs || [],
        inquiries: fbInqs || [],
        boothOverrides: fbBooths || {},
        settings: fbSettings || defaultSettings,
      };
      return memoryAdminData;
    }
  } catch (e) {
    console.warn("Firebase fetch error, using local fallback", e);
  }

  // Fallback 1: Root data/adminData.json
  try {
    const raw = await fs.readFile(ROOT_ADMIN_DATA_PATH, "utf-8");
    memoryAdminData = JSON.parse(raw);
    return memoryAdminData;
  } catch (err) {}

  // Fallback 2: src/data/adminData.json
  try {
    const raw = await fs.readFile(SRC_ADMIN_DATA_PATH, "utf-8");
    memoryAdminData = JSON.parse(raw);
    return memoryAdminData;
  } catch (err) {}

  memoryAdminData = {
    registrations: [],
    inquiries: [],
    boothOverrides: {},
    settings: {
      eventName: "Himalayan Green Energy Expo Nepal 2027",
      eventDates: "Magh 2 - 4 · 16–18 Jan 2027",
      venue: "Bhrikutimandap Exhibition Complex, Kathmandu",
      registrationsOpen: true,
      stallBookingsOpen: true,
    },
  };
  return memoryAdminData;
}

let saveQueue: Promise<void> = Promise.resolve();

async function saveAdminData(data: any) {
  memoryAdminData = data;
  const content = JSON.stringify(data, null, 2);

  saveQueue = saveQueue
    .then(async () => {
      try {
        await fs.mkdir(path.dirname(ROOT_ADMIN_DATA_PATH), { recursive: true });
        await fs.writeFile(ROOT_ADMIN_DATA_PATH, content, "utf-8");
      } catch (err) {}

      try {
        await fs.mkdir(path.dirname(SRC_ADMIN_DATA_PATH), { recursive: true });
        await fs.writeFile(SRC_ADMIN_DATA_PATH, content, "utf-8");
      } catch (err) {}
    })
    .catch(() => {});

  return saveQueue;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const scope = url.searchParams.get("scope");
    const data = await getAdminData();

    if (scope === "stats") {
      const mergedBooths = boothsData.map((b) => {
        const override = data.boothOverrides?.[b.number];
        return override ? { ...b, ...override } : b;
      });

      const bookedCount = mergedBooths.filter((b) => b.status === "Booked").length;
      const reservedCount = mergedBooths.filter((b) => b.status === "Reserved").length;
      const availableCount = mergedBooths.filter((b) => b.status === "Available").length;
      const totalStalls = mergedBooths.length || 1;

      // Hall breakdowns
      const hallABooths = mergedBooths.filter((b) => b.hall?.includes("Hall A") || b.number.startsWith("A"));
      const hallBBooths = mergedBooths.filter((b) => b.hall?.includes("Hall B") || b.number.startsWith("B"));
      const outdoorBooths = mergedBooths.filter((b) => b.hall?.includes("Outdoor") || b.number.startsWith("OUT"));

      const bookedRevenueUSD = mergedBooths
        .filter((b) => b.status === "Booked")
        .reduce((sum, b) => sum + (b.priceUSD || 2500), 0);

      const reservedRevenueUSD = mergedBooths
        .filter((b) => b.status === "Reserved")
        .reduce((sum, b) => sum + (b.priceUSD || 2500), 0);

      const totalPossibleRevenueUSD = mergedBooths
        .reduce((sum, b) => sum + (b.priceUSD || 2500), 0);

      const exchangeRate = data.settings?.currencyRateUSD_NPR || 134.5;
      const bookedRevenueNPR = bookedRevenueUSD * exchangeRate;

      const totalAllocatedSqM = mergedBooths
        .filter((b) => b.status === "Booked" || b.status === "Reserved")
        .reduce((sum, b) => sum + (b.sizeSqM || 9), 0);

      const totalFloorSqM = mergedBooths.reduce((sum, b) => sum + (b.sizeSqM || 9), 0);

      // Pass type breakdown
      const passTypeCounts: Record<string, number> = {};
      (data.registrations || []).forEach((r: any) => {
        const type = r.passType || "Trade Visitor (Free)";
        passTypeCounts[type] = (passTypeCounts[type] || 0) + 1;
      });

      const stats = {
        totalStalls,
        bookedStalls: bookedCount,
        reservedStalls: reservedCount,
        availableStalls: availableCount,
        occupancyRate: Math.round(((bookedCount + reservedCount) / totalStalls) * 100),
        bookedPct: Math.round((bookedCount / totalStalls) * 100),
        reservedPct: Math.round((reservedCount / totalStalls) * 100),
        totalAllocatedSqM,
        totalFloorSqM,
        halls: {
          hallA: {
            total: hallABooths.length,
            booked: hallABooths.filter((b) => b.status === "Booked").length,
            reserved: hallABooths.filter((b) => b.status === "Reserved").length,
            available: hallABooths.filter((b) => b.status === "Available").length,
          },
          hallB: {
            total: hallBBooths.length,
            booked: hallBBooths.filter((b) => b.status === "Booked").length,
            reserved: hallBBooths.filter((b) => b.status === "Reserved").length,
            available: hallBBooths.filter((b) => b.status === "Available").length,
          },
          outdoor: {
            total: outdoorBooths.length,
            booked: outdoorBooths.filter((b) => b.status === "Booked").length,
            reserved: outdoorBooths.filter((b) => b.status === "Reserved").length,
            available: outdoorBooths.filter((b) => b.status === "Available").length,
          },
        },
        totalRegistrations: data.registrations?.length || 0,
        checkedInAttendees: data.registrations?.filter((r: any) => r.checkedIn).length || 0,
        passTypeCounts,
        totalExhibitors: exhibitorsData.length,
        totalSpeakers: speakersData.length,
        totalNews: newsArticles.length,
        totalInquiries: data.inquiries?.length || 0,
        newInquiriesCount: data.inquiries?.filter((i: any) => i.status === "New").length || 0,
        inProgressInquiriesCount: data.inquiries?.filter((i: any) => i.status === "In Progress").length || 0,
        resolvedInquiriesCount: data.inquiries?.filter((i: any) => i.status === "Resolved").length || 0,
        estimatedRevenueUSD: bookedRevenueUSD,
        reservedRevenueUSD,
        totalPossibleRevenueUSD,
        estimatedRevenueNPR: bookedRevenueNPR,
        currencyRateUSD_NPR: exchangeRate,
      };

      return NextResponse.json(
        { success: true, stats },
        { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
      );
    }

    // Default: return full data with enriched metrics
    const mergedBooths = boothsData.map((b) => {
      const override = data.boothOverrides?.[b.number];
      return override ? { ...b, ...override } : b;
    });

    const bookedCount = mergedBooths.filter((b) => b.status === "Booked").length;
    const reservedCount = mergedBooths.filter((b) => b.status === "Reserved").length;
    const availableCount = mergedBooths.filter((b) => b.status === "Available").length;
    const totalStalls = mergedBooths.length || 1;
    const exchangeRate = data.settings?.currencyRateUSD_NPR || 134.5;
    const bookedRevenueUSD = mergedBooths
      .filter((b) => b.status === "Booked")
      .reduce((sum, b) => sum + (b.priceUSD || 2500), 0);

    const hallABooths = mergedBooths.filter((b) => b.hall?.includes("Hall A") || b.number.startsWith("A"));
    const hallBBooths = mergedBooths.filter((b) => b.hall?.includes("Hall B") || b.number.startsWith("B"));
    const outdoorBooths = mergedBooths.filter((b) => b.hall?.includes("Outdoor") || b.number.startsWith("OUT"));

    return NextResponse.json(
      {
        success: true,
        data,
        metrics: {
          totalStalls,
          bookedCount,
          reservedCount,
          availableCount,
          bookedPct: Math.round((bookedCount / totalStalls) * 100),
          reservedPct: Math.round((reservedCount / totalStalls) * 100),
          occupancyRate: Math.round(((bookedCount + reservedCount) / totalStalls) * 100),
          bookedRevenueUSD,
          bookedRevenueNPR: bookedRevenueUSD * exchangeRate,
          exchangeRate,
          halls: {
            hallA: {
              total: hallABooths.length,
              booked: hallABooths.filter((b) => b.status === "Booked").length,
              reserved: hallABooths.filter((b) => b.status === "Reserved").length,
              available: hallABooths.filter((b) => b.status === "Available").length,
            },
            hallB: {
              total: hallBBooths.length,
              booked: hallBBooths.filter((b) => b.status === "Booked").length,
              reserved: hallBBooths.filter((b) => b.status === "Reserved").length,
              available: hallBBooths.filter((b) => b.status === "Available").length,
            },
            outdoor: {
              total: outdoorBooths.length,
              booked: outdoorBooths.filter((b) => b.status === "Booked").length,
              reserved: outdoorBooths.filter((b) => b.status === "Reserved").length,
              available: outdoorBooths.filter((b) => b.status === "Available").length,
            },
          },
          exhibitorsCount: exhibitorsData.length,
          speakersCount: speakersData.length,
          newsCount: newsArticles.length,
          boothsCount: boothsData.length,
        },
      },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch admin data" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, payload } = body;
    const data = await getAdminData();

    switch (action) {
      case "add_registration": {
        const newReg = {
          id: payload.id || `HHE26-${Math.floor(100000 + Math.random() * 900000)}`,
          name: payload.name,
          email: payload.email,
          phone: payload.phone,
          organization: payload.organization,
          jobTitle: payload.jobTitle || "",
          stallNumber: payload.stallNumber || "",
          country: payload.country || "Nepal",
          passType: payload.passType || "Trade Visitor (Free)",
          interests: payload.interests || [],
          checkedIn: false,
          registeredAt: new Date().toISOString(),
        };
        data.registrations.unshift(newReg);
        await Promise.all([
          saveAdminData(data),
          addFirebaseRegistration(newReg).catch(() => {}),
        ]);
        return NextResponse.json({ success: true, message: "Registration created", data: newReg });
      }

      case "toggle_checkin": {
        const { regId, checkedIn } = payload;
        const reg = data.registrations.find((r: any) => r.id === regId);
        if (reg) {
          reg.checkedIn = checkedIn !== undefined ? checkedIn : !reg.checkedIn;
          await Promise.all([
            saveAdminData(data),
            toggleFirebaseCheckin(regId, reg.checkedIn).catch(() => {}),
          ]);
          return NextResponse.json({ success: true, message: "Check-in updated", data: reg });
        }
        return NextResponse.json({ success: false, message: "Registration not found" }, { status: 404 });
      }

      case "delete_registration": {
        const { regId } = payload;
        data.registrations = data.registrations.filter((r: any) => r.id !== regId);
        await Promise.all([
          saveAdminData(data),
          deleteFirebaseRegistration(regId).catch(() => {}),
        ]);
        return NextResponse.json({ success: true, message: "Registration deleted" });
      }

      case "update_booth": {
        const { boothNumber, status, exhibitorName } = payload;
        data.boothOverrides[boothNumber] = {
          ...(data.boothOverrides[boothNumber] || {}),
          status,
          exhibitorName: exhibitorName || "",
          updatedAt: new Date().toISOString(),
        };
        await Promise.all([
          saveAdminData(data),
          setFirebaseBoothOverride(boothNumber, { status, exhibitorName }).catch(() => {}),
        ]);
        return NextResponse.json({ success: true, message: `Booth ${boothNumber} updated`, data: data.boothOverrides[boothNumber] });
      }

      case "update_inquiry_status": {
        const { inquiryId, status } = payload;
        const inq = data.inquiries.find((i: any) => i.id === inquiryId);
        if (inq) {
          inq.status = status;
          await Promise.all([
            saveAdminData(data),
            updateFirebaseInquiryStatus(inquiryId, status).catch(() => {}),
          ]);
          return NextResponse.json({ success: true, message: "Inquiry status updated", data: inq });
        }
        return NextResponse.json({ success: false, message: "Inquiry not found" }, { status: 404 });
      }

      case "delete_inquiry": {
        const { inquiryId } = payload;
        data.inquiries = data.inquiries.filter((i: any) => i.id !== inquiryId);
        await Promise.all([
          saveAdminData(data),
          deleteFirebaseInquiry(inquiryId).catch(() => {}),
        ]);
        return NextResponse.json({ success: true, message: "Inquiry deleted" });
      }

      case "clear_inquiries": {
        const oldInqs = [...(data.inquiries || [])];
        data.inquiries = [];
        await Promise.all([
          saveAdminData(data),
          ...oldInqs.map((i: any) => deleteFirebaseInquiry(i.id).catch(() => {})),
        ]);
        return NextResponse.json({ success: true, message: "All inquiries cleared" });
      }

      case "add_inquiry": {
        const newInq = {
          id: `INQ-2026-${String(data.inquiries.length + 1).padStart(3, "0")}`,
          name: payload.name,
          email: payload.email,
          phone: payload.phone || "",
          company: payload.company || "",
          subject: payload.subject || "General Inquiry",
          message: payload.message,
          stallInterest: payload.stallInterest || "",
          status: "New",
          submittedAt: new Date().toISOString(),
        };
        data.inquiries.unshift(newInq);
        await Promise.all([
          saveAdminData(data),
          addFirebaseInquiry(newInq).catch(() => {}),
        ]);
        return NextResponse.json({ success: true, message: "Inquiry logged", data: newInq });
      }

      case "update_settings": {
        data.settings = {
          ...data.settings,
          ...payload,
          updatedAt: new Date().toISOString(),
        };
        await Promise.all([
          saveAdminData(data),
          updateFirebaseSettings(data.settings).catch(() => {}),
        ]);
        return NextResponse.json({ success: true, message: "Settings saved", data: data.settings });
      }

      default:
        return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process admin request" },
      { status: 500 }
    );
  }
}
