import { NextResponse } from "next/server";
import { initializeKhaltiPayment } from "@/lib/khalti";
import { generateFonepayUrl } from "@/lib/fonepay";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

const ROOT_ADMIN_DATA_PATH = path.join(process.cwd(), "data", "adminData.json");
const SRC_ADMIN_DATA_PATH = path.join(process.cwd(), "src", "data", "adminData.json");

async function getAdminData() {
  try {
    const raw = await fs.readFile(ROOT_ADMIN_DATA_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    try {
      const raw = await fs.readFile(SRC_ADMIN_DATA_PATH, "utf-8");
      return JSON.parse(raw);
    } catch {
      return { registrations: [], inquiries: [], boothOverrides: {}, stallBookings: [] };
    }
  }
}

async function saveAdminData(data: any) {
  const content = JSON.stringify(data, null, 2);
  try {
    await fs.mkdir(path.dirname(ROOT_ADMIN_DATA_PATH), { recursive: true });
    await fs.writeFile(ROOT_ADMIN_DATA_PATH, content, "utf-8");
  } catch {}
  try {
    await fs.mkdir(path.dirname(SRC_ADMIN_DATA_PATH), { recursive: true });
    await fs.writeFile(SRC_ADMIN_DATA_PATH, content, "utf-8");
  } catch {}
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      bookingId,
      stallNumbers = [],
      amountNPR,
      amountUSD,
      contactPerson,
      email,
      phone,
      company,
      country = "Nepal",
      fasciaName,
      boothType = "Shell Scheme",
      powerOption = "Standard 15A Included",
      industryCategory = "Turbines & Electro-Mechanical",
      specialRequirements = "",
      paymentMethod = "khalti", // 'khalti' | 'fonepay' | 'bank'
    } = body;

    if (!email || !phone || !stallNumbers || stallNumbers.length === 0) {
      return NextResponse.json(
        { success: false, error: "Missing required booking details" },
        { status: 400 }
      );
    }

    const orderId =
      bookingId ||
      `HHE26-STALL-${Math.floor(100000 + Math.random() * 900000)}`;

    const stallListStr = Array.isArray(stallNumbers) ? stallNumbers.join(", ") : String(stallNumbers);
    const primaryName = contactPerson || company || "Exhibitor Applicant";

    // 1. Record booking in local admin store
    const adminData = await getAdminData();
    if (!adminData.stallBookings) {
      adminData.stallBookings = [];
    }

    const newBookingRecord = {
      id: orderId,
      stalls: stallNumbers,
      amountNPR: Number(amountNPR) || 875000,
      amountUSD: Number(amountUSD) || 6500,
      company: company || contactPerson,
      contactPerson,
      email,
      phone,
      country,
      fasciaName: fasciaName || company,
      boothType,
      powerOption,
      industryCategory,
      specialRequirements,
      paymentMethod,
      paymentStatus: paymentMethod === "bank" ? "PENDING_WIRE" : "INITIATED",
      bookingStatus: "Reserved",
      createdAt: new Date().toISOString(),
    };

    // Prepend or update
    const existingIdx = adminData.stallBookings.findIndex((b: any) => b.id === orderId);
    if (existingIdx >= 0) {
      adminData.stallBookings[existingIdx] = newBookingRecord;
    } else {
      adminData.stallBookings.unshift(newBookingRecord);
    }

    // Mark stalls as Reserved in boothOverrides
    if (!adminData.boothOverrides) adminData.boothOverrides = {};
    for (const stNum of stallNumbers) {
      adminData.boothOverrides[stNum] = {
        status: "Reserved",
        exhibitorName: company || contactPerson,
        bookingRef: orderId,
        updatedAt: new Date().toISOString(),
      };
    }

    // Log corresponding inquiry for admin leads
    if (!adminData.inquiries) adminData.inquiries = [];
    const uniqueInqSuffix = `${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    adminData.inquiries.unshift({
      id: `INQ-STALL-${orderId.replace(/[^0-9]/g, "") || "BOOK"}-${uniqueInqSuffix}`,
      name: contactPerson,
      email,
      phone,
      company: company || contactPerson,
      subject: `Stall Reservation [${stallListStr}] - Method: ${paymentMethod.toUpperCase()}`,
      message: `Booking Ref: ${orderId}. Stalls: ${stallListStr}. Fascia: ${fasciaName || company}. Total: NPR ${amountNPR?.toLocaleString()} / USD ${amountUSD?.toLocaleString()}. Power: ${powerOption}. Notes: ${specialRequirements || "None"}.`,
      stallInterest: stallListStr,
      status: "New",
      submittedAt: new Date().toISOString(),
    });

    await saveAdminData(adminData);

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : "https://himalayanenergyexpo.com");

    // 2. Handle Payment Method Routing
    if (paymentMethod === "khalti") {
      try {
        const returnUrl = `${baseUrl}/api/payment/callback?order_id=${encodeURIComponent(
          orderId
        )}&stalls=${encodeURIComponent(stallListStr)}`;

        const khaltiResponse = await initializeKhaltiPayment({
          return_url: returnUrl,
          website_url: baseUrl,
          amount: Math.round((Number(amountNPR) || 875000) * 100), // Rs to Paisa
          purchase_order_id: orderId,
          purchase_order_name: `Stall Booking (${stallListStr}) - Expo 2027`,
          customer_info: {
            name: primaryName,
            email,
            phone,
          },
        });

        return NextResponse.json({
          success: true,
          bookingId: orderId,
          paymentMethod: "khalti",
          paymentUrl: khaltiResponse.payment_url,
          pidx: khaltiResponse.pidx,
        });
      } catch (err: any) {
        console.error("Khalti initialization error:", err);
        return NextResponse.json(
          {
            success: false,
            error: err.message || "Failed to initialize Khalti payment gateway.",
          },
          { status: 500 }
        );
      }
    }

    if (paymentMethod === "fonepay") {
      try {
        const returnUrl = `${baseUrl}/api/payment/fonepay-callback?order_id=${encodeURIComponent(
          orderId
        )}&stalls=${encodeURIComponent(stallListStr)}`;

        const fonepayUrl = generateFonepayUrl({
          amount: Number(amountNPR) || 875000,
          purchase_order_id: orderId,
          purchase_order_name: `Expo Stall ${stallListStr}`,
          return_url: returnUrl,
        });

        return NextResponse.json({
          success: true,
          bookingId: orderId,
          paymentMethod: "fonepay",
          paymentUrl: fonepayUrl,
        });
      } catch (err: any) {
        console.error("Fonepay generation error:", err);
        return NextResponse.json(
          {
            success: false,
            error: err.message || "Failed to generate Fonepay payment URL.",
          },
          { status: 500 }
        );
      }
    }

    // Bank Transfer / Pro-Forma Invoice option
    return NextResponse.json({
      success: true,
      bookingId: orderId,
      paymentMethod: "bank",
      message: "Provisional booking confirmed with Bank Transfer / Invoice.",
      redirectUrl: `/payment/success?id=${encodeURIComponent(
        orderId
      )}&gateway=bank&stalls=${encodeURIComponent(
        stallListStr
      )}&amount=${encodeURIComponent(String(amountNPR))}`,
    });
  } catch (error: any) {
    console.error("Payment initiate error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
