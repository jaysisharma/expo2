import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import nodemailer from "nodemailer";
import { addFirebaseRegistration } from "@/lib/firebaseDb";
import { CONTACT_DETAILS } from "@/data/contactInfo";

export const dynamic = "force-dynamic";

const ROOT_ADMIN_DATA_PATH = path.join(process.cwd(), "data", "adminData.json");
const SRC_ADMIN_DATA_PATH = path.join(process.cwd(), "src", "data", "adminData.json");

function createTransporter() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || 465);
  const secure = process.env.SMTP_SECURE === "true" || port === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      fullName,
      email,
      phone,
      organization,
      vehicleType,
      vehicleMakeModel,
      registrationNumber,
      batteryCapacity,
      numberOfOccupants,
      driverLicenseNumber,
      emergencyContactName,
      emergencyContactPhone,
      specialRequirements,
    } = body;

    if (!fullName || !email || !phone || !vehicleType) {
      return NextResponse.json(
        { success: false, message: "Please fill in all required fields (Name, Email, Phone, Vehicle Type)." },
        { status: 400 }
      );
    }

    const rallyId = `EVR-${Math.floor(100000 + Math.random() * 900000)}`;

    const rallyRegistration = {
      id: rallyId,
      name: fullName,
      email,
      phone,
      organization: organization || "Individual Driver / Enthusiast",
      jobTitle: `EV Driver (${vehicleType})`,
      passType: `EV Rally Participant · ${vehicleType}`,
      stallNumber: registrationNumber || "EV-RALLY",
      country: "Nepal",
      interests: ["EV Rally Roadshow", vehicleType, vehicleMakeModel || ""].filter(Boolean),
      checkedIn: false,
      registeredAt: new Date().toISOString(),
      metadata: {
        category: "ev_rally",
        vehicleType,
        vehicleMakeModel: vehicleMakeModel || "",
        registrationNumber: registrationNumber || "",
        batteryCapacity: batteryCapacity || "",
        numberOfOccupants: numberOfOccupants || 1,
        driverLicenseNumber: driverLicenseNumber || "",
        emergencyContactName: emergencyContactName || "",
        emergencyContactPhone: emergencyContactPhone || "",
        specialRequirements: specialRequirements || "",
      },
    };

    // 1. Try persisting locally to adminData.json
    try {
      let raw = "";
      try {
        raw = await fs.readFile(ROOT_ADMIN_DATA_PATH, "utf-8");
      } catch {
        try {
          raw = await fs.readFile(SRC_ADMIN_DATA_PATH, "utf-8");
        } catch {}
      }

      if (raw) {
        const data = JSON.parse(raw);
        if (!Array.isArray(data.registrations)) data.registrations = [];
        data.registrations.unshift(rallyRegistration);
        const updated = JSON.stringify(data, null, 2);
        await fs.writeFile(ROOT_ADMIN_DATA_PATH, updated, "utf-8").catch(() => {});
        await fs.writeFile(SRC_ADMIN_DATA_PATH, updated, "utf-8").catch(() => {});
      }
    } catch (fsErr) {
      console.warn("[ev-rally route] Local file write warning:", fsErr);
    }

    // 2. Try Firestore persistence
    try {
      await addFirebaseRegistration(rallyRegistration);
    } catch (fbErr) {
      console.warn("[ev-rally route] Firestore write warning:", fbErr);
    }

    // 3. Send Confirmation Email if SMTP configured
    const transporter = createTransporter();
    if (transporter) {
      const mailOptions = {
        from: `"Himalayan Green Energy Expo 2027" <${process.env.SMTP_USER || CONTACT_DETAILS.emails.expo}>`,
        to: email,
        bcc: [CONTACT_DETAILS.emails.expo, CONTACT_DETAILS.emails.eventSolution].filter(Boolean),
        subject: `Confirmed: EV Rally Registration #${rallyId} — Himalayan Green Energy Expo 2027`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <div style="background: #04281E; padding: 24px; text-align: center; color: #ffffff;">
              <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #34D399;">⚡ EV RALLY 2027 REGISTRATION CONFIRMED</h1>
              <p style="margin: 6px 0 0; font-size: 13px; color: #cbd5e1;">Himalayan Green Energy Expo 2027 · Bhrikutimandap, Kathmandu</p>
            </div>
            <div style="padding: 24px; color: #1e293b; font-size: 14px; line-height: 1.6;">
              <p>Dear <strong>${fullName}</strong>,</p>
              <p>Thank you for registering for the <strong>Official Clean Energy EV Rally</strong>! Your registration is recorded under ID: <strong style="color: #007A5E; font-size: 16px;">#${rallyId}</strong>.</p>
              
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
                <h3 style="margin: 0 0 10px; font-size: 14px; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">Rally &amp; Vehicle Docket:</h3>
                <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
                  <tr><td style="padding: 4px 0; color: #64748b;">Participant Name:</td><td style="font-weight: 600; color: #0f172a;">${fullName}</td></tr>
                  <tr><td style="padding: 4px 0; color: #64748b;">Vehicle Category:</td><td style="font-weight: 600; color: #0f172a;">${vehicleType}</td></tr>
                  ${vehicleMakeModel ? `<tr><td style="padding: 4px 0; color: #64748b;">Make & Model:</td><td style="font-weight: 600; color: #0f172a;">${vehicleMakeModel}</td></tr>` : ''}
                  ${registrationNumber ? `<tr><td style="padding: 4px 0; color: #64748b;">Vehicle Plate:</td><td style="font-weight: 600; color: #0f172a;">${registrationNumber}</td></tr>` : ''}
                  <tr><td style="padding: 4px 0; color: #64748b;">Reporting Location:</td><td style="font-weight: 600; color: #0f172a;">Bhrikutimandap Exhibition Grounds, Kathmandu</td></tr>
                  <tr><td style="padding: 4px 0; color: #64748b;">Rally Date:</td><td style="font-weight: 600; color: #0f172a;">Friday, 9th January 2027 (Assembly 7:30 AM · Flag-Off 8:30 AM)</td></tr>
                </table>
              </div>

              <p><strong>Next Steps:</strong></p>
              <ul style="padding-left: 20px; color: #475569;">
                <li>The secretariat will share the detailed rally flag-off schedule, charging point map, and route corridor 1 week prior to the event.</li>
                <li>Please bring your valid driving license and vehicle registration document at the assembly gate.</li>
              </ul>

              <p style="margin-top: 24px; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 14px;">
                Organizing Secretariat: IPPAN &amp; Event Solution Nepal<br/>
                Hotline: +977-9703606348 | Email: info@himalayanenergyexpo.com
              </p>
            </div>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions).catch((mailErr) => {
        console.warn("[ev-rally route] Email send failed:", mailErr);
      });
    }

    return NextResponse.json({
      success: true,
      rallyId,
      message: "EV Rally registration successfully received!",
    });
  } catch (error: any) {
    console.error("[ev-rally route] Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to process EV Rally registration." },
      { status: 500 }
    );
  }
}
