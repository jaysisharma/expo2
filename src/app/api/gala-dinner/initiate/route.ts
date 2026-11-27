import { NextResponse } from 'next/server';
import { initializeKhaltiPayment } from '@/lib/khalti';
import nodemailer from 'nodemailer';
import fs from 'fs/promises';
import path from 'path';
import { attributionFields } from '@/lib/attribution';
import { addFirebaseInquiry, addFirebaseRegistration, updateFirebaseRegistration } from '@/lib/firebaseDb';
import { resolveNewOrderId } from '@/lib/orders';
import { PAYMENT_BANK, PAYMENT_PROOF_EMAIL } from '@/lib/paymentDetails';

export const dynamic = 'force-dynamic';

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

const ROOT_ADMIN_DATA_PATH = path.join(process.cwd(), 'data', 'adminData.json');
const SRC_ADMIN_DATA_PATH = path.join(process.cwd(), 'src', 'data', 'adminData.json');

async function getAdminData() {
  try {
    const raw = await fs.readFile(ROOT_ADMIN_DATA_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    try {
      const raw = await fs.readFile(SRC_ADMIN_DATA_PATH, 'utf-8');
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
    await fs.writeFile(ROOT_ADMIN_DATA_PATH, content, 'utf-8');
  } catch {}
  try {
    await fs.mkdir(path.dirname(SRC_ADMIN_DATA_PATH), { recursive: true });
    await fs.writeFile(SRC_ADMIN_DATA_PATH, content, 'utf-8');
  } catch {}
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      phone,
      organization = '',
      jobTitle = '',
      country = 'Nepal',
      passType = 'national', // 'national' (NPR 6,000) | 'international' (USD 50 -> NPR 6,750)
      quantity = 1,
      dietary = 'Standard',
      specialRequests = '',
      paymentMethod = 'khalti', // 'khalti' | 'qr'
    } = body;

    if (!name || !email || !phone) {
      return NextResponse.json(
        { success: false, error: 'Please provide full name, email, and phone number.' },
        { status: 400 }
      );
    }

    // Decide the payment route once, so the saved status, the email and the redirect agree.
    // International delegates pay in USD by SWIFT wire to Standard Chartered (lib/paymentDetails).
    const cleanCountry = String(country || '').trim().toLowerCase();
    const isDomestic =
      cleanCountry === '' ||
      cleanCountry.includes('nepal') ||
      cleanCountry.includes('ktm') ||
      cleanCountry.includes('kathmandu');
    const isIntlDelegate = passType === 'international' || !isDomestic || paymentMethod === 'intl_card';
    const effectivePaymentMethod: 'bank' | 'khalti' | 'qr' =
      isIntlDelegate || paymentMethod === 'bank' ? 'bank' : paymentMethod === 'khalti' ? 'khalti' : 'qr';

    const qty = Math.max(1, parseInt(String(quantity), 10) || 1);
    const unitPriceNPR = passType === 'international' ? 6750 : 6000;
    const unitPriceUSD = passType === 'international' ? 50 : 45;
    const vatRate = 0.13;

    const subtotalNPR = unitPriceNPR * qty;
    const vatNPR = Math.round(subtotalNPR * vatRate);
    const totalAmountNPR = subtotalNPR + vatNPR;

    const subtotalUSD = unitPriceUSD * qty;
    const vatUSD = Math.round(subtotalUSD * vatRate);
    const totalAmountUSD = subtotalUSD + vatUSD;

    const orderId = await resolveNewOrderId(null, 'GALA-2027');

    const adminData = await getAdminData();
    if (!adminData.registrations) adminData.registrations = [];

    const resolvedPassTitle =
      passType === 'international'
        ? `Networking Dinner Pass (Royal Tulip) - International [${qty} Pax]`
        : `Networking Dinner Pass (Royal Tulip) - National [${qty} Pax]`;

    const newRegistration = {
      id: orderId,
      name,
      email,
      phone,
      organization: organization || 'Independent Delegate',
      jobTitle: jobTitle || 'Delegate',
      stallNumber: '',
      country,
      passType: resolvedPassTitle,
      ticketDetails: {
        category: 'Networking Dinner',
        venue: 'Royal Tulip Kathmandu (Gwarko)',
        date: 'Monday, 18 January 2027',
        time: '6:00 PM onwards',
        passTier: passType,
        quantity: qty,
        unitPriceNPR,
        subtotalNPR,
        vatNPR,
        totalAmountNPR,
        unitPriceUSD,
        subtotalUSD,
        vatUSD,
        totalAmountUSD,
        vatRate: '13%',
        dietary,
        specialRequests,
      },
      paymentMethod: effectivePaymentMethod,
      // Never PAID here: only a verified Khalti payment or an admin check of the QR / wire confirms it
      paymentStatus:
        effectivePaymentMethod === 'bank'
          ? 'PENDING_WIRE'
          : effectivePaymentMethod === 'qr'
            ? 'PENDING_QR_VERIFICATION'
            : 'UNPAID',
      status: 'Pending Payment',
      screenshotUrl: body.screenshotUrl || '',
      checkedIn: false,
      registeredAt: new Date().toISOString(),
      ...attributionFields(req),
    };

    adminData.registrations.unshift(newRegistration);
    // Firestore is the persistent store on Vercel (local files are reset on each deploy)
    await addFirebaseRegistration(newRegistration).catch(() => null);

    // Also record lead in inquiries
    if (!adminData.inquiries) adminData.inquiries = [];
    const dinnerInquiry = {
      id: `INQ-GALA-${orderId}`,
      name,
      email,
      phone,
      company: organization || name,
      subject: `Networking Dinner Reservation [${qty}x ${passType.toUpperCase()}] - ${effectivePaymentMethod === 'bank' ? 'SWIFT WIRE' : effectivePaymentMethod.toUpperCase()}`,
      message: `Order: ${orderId}. Pass: ${resolvedPassTitle}. Quantity: ${qty}. Total: NPR ${totalAmountNPR.toLocaleString()} (USD ${totalAmountUSD}). Dietary: ${dietary}. Payment: ${effectivePaymentMethod.toUpperCase()} (not yet verified).`,
      stallInterest: 'Networking Dinner (Royal Tulip)',
      status: 'New',
      submittedAt: new Date().toISOString(),
      ...attributionFields(req),
    };
    adminData.inquiries.unshift(dinnerInquiry);
    await addFirebaseInquiry(dinnerInquiry).catch(() => null);

    await saveAdminData(adminData);

    // Acknowledgement email (NOT a confirmation): payment is still pending for every method.
    // Khalti guests get nothing yet: they are on their way to pay, and the confirmation with
    // their entry pass is sent once Khalti verifies the payment (lib/orders markOrderPaymentStatus).
    try {
      const transporter = createTransporter();
      if (transporter && effectivePaymentMethod !== 'khalti') {
        const fromName = process.env.SMTP_FROM_NAME || "Himalayan Green Energy Expo 2027";
        const smtpUser = process.env.SMTP_USER;

        const emailHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="padding: 30px 15px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 14px rgba(0,0,0,0.06);">
          <tr>
            <td style="background-color: #04281E; padding: 26px 32px; text-align: left; border-bottom: 3px solid #10b981;">
              <div style="font-size: 11px; font-weight: 700; color: #34d399; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 6px;">
                Himalayan Green Energy Expo 2027
              </div>
              <h1 style="margin: 0; font-size: 20px; font-weight: 800; color: #ffffff;">
                Networking Dinner Reservation Acknowledgment
              </h1>
              <p style="margin: 6px 0 0 0; font-size: 13px; color: #a7f3d0;">
                Order Reference: <code style="background-color: rgba(255,255,255,0.12); padding: 2px 6px; border-radius: 4px; font-family: monospace; color: #ffffff;">${orderId}</code>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 26px 32px;">
              <p style="font-size: 15px; color: #0f172a; margin-top: 0; line-height: 1.6;">
                Dear <strong>${name}</strong>,
              </p>
              <p style="font-size: 14px; color: #334155; line-height: 1.6;">
                Thank you for reserving your seats for the official <strong>VIP Networking Dinner &amp; Banquet</strong> of the Himalayan Green Energy Expo 2027.
              </p>
              
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #10b981; border-radius: 8px; padding: 16px 20px; margin: 18px 0; font-size: 13px; line-height: 1.7;">
                <strong>Reservation Summary:</strong><br/>
                &bull; <strong>Pass Category:</strong> ${resolvedPassTitle}<br/>
                &bull; <strong>Quantity:</strong> ${qty} Delegate Pass(es)<br/>
                &bull; <strong>Total Amount:</strong> ${
                  isIntlDelegate
                    ? `USD $${totalAmountUSD.toLocaleString()} (Includes 13% VAT: USD $${vatUSD.toLocaleString()})`
                    : `NPR ${totalAmountNPR.toLocaleString()} (Includes 13% VAT: NPR ${vatNPR.toLocaleString()})`
                }<br/>
                &bull; <strong>Payment Method:</strong> ${effectivePaymentMethod === 'bank' ? 'SWIFT BANK WIRE (USD)' : 'QR PAYMENT'}<br/>
                &bull; <strong>Payment Status:</strong> Pending verification<br/>
                &bull; <strong>Date &amp; Time:</strong> Monday, 18 January 2027 &bull; 6:00 PM onwards<br/>
                &bull; <strong>Venue:</strong> Royal Tulip Kathmandu (Gwarko)<br/>
                &bull; <strong>Inclusions:</strong> 5-Star Gourmet Banquet, diplomatic plenary reflections, and complimentary 3-day access badge to the main exhibition at Bhrikuti Mandap.
              </div>

              ${
                effectivePaymentMethod === 'qr'
                  ? `
              <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 16px 20px; margin: 18px 0; font-size: 13px; line-height: 1.7;">
                <strong style="color: #92400e;">Not confirmed yet &ndash; payment being verified</strong><br/>
                We have received your payment screenshot. Our team will check it against our account; once the payment is verified
                you will receive a confirmation email with your official entry pass and QR code. Please don't treat this email as your ticket.
              </div>`
                  : ''
              }

              ${
                effectivePaymentMethod === 'bank'
                  ? `
              <div style="background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 16px 20px; margin: 18px 0; font-size: 13px; line-height: 1.7;">
                <strong style="color: #075985;">Pay by SWIFT Bank Wire (USD):</strong><br/>
                &bull; <strong>Beneficiary:</strong> ${PAYMENT_BANK.beneficiary}<br/>
                &bull; <strong>Account Number:</strong> ${PAYMENT_BANK.accountNumber}<br/>
                &bull; <strong>Bank:</strong> ${PAYMENT_BANK.bankName}<br/>
                &bull; <strong>Branch:</strong> ${PAYMENT_BANK.branch}<br/>
                &bull; <strong>SWIFT / BIC:</strong> ${PAYMENT_BANK.swift}<br/>
                &bull; <strong>Amount:</strong> USD $${totalAmountUSD.toLocaleString()}<br/>
                &bull; <strong>Payment Remarks:</strong> ${orderId}<br/><br/>
                Please email the SWIFT advice / bank receipt quoting <strong>${orderId}</strong> to
                <a href="mailto:${PAYMENT_PROOF_EMAIL}" style="color: #0369a1; font-weight: 600;">${PAYMENT_PROOF_EMAIL}</a>. Your pass is issued once the payment is received.
              </div>`
                  : ''
              }

              <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 16px; font-size: 13px; color: #475569; line-height: 1.6;">
                <strong>Secretariat Inquiries:</strong><br/>
                &bull; Hotlines: +977-9703606348 | +977-9703606345<br/>
                &bull; WhatsApp: +977 9851004985<br/>
                &bull; Email: <a href="mailto:info@himalayanenergyexpo.com" style="color: #007A5E; text-decoration: none;">info@himalayanenergyexpo.com</a> | <a href="mailto:himalayangreenenergyexpo@gmail.com" style="color: #007A5E; text-decoration: none;">himalayangreenenergyexpo@gmail.com</a> | <a href="mailto:info@ippan.org.np" style="color: #007A5E; text-decoration: none;">info@ippan.org.np</a><br/>
                &bull; Website: <a href="https://www.higex.org" style="color: #007A5E; text-decoration: none;">www.higex.org</a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
        `;

        transporter.sendMail({
          from: `"${fromName}" <${smtpUser}>`,
          to: email,
          replyTo: `"Expo Secretariat" <info@eventsolutionnepal.com.np>`,
          subject: `Networking Dinner Reservation Received - Payment Pending [Ref: ${orderId}] | Himalayan Green Energy Expo 2027`,
          html: emailHtml,
        }).catch((err) => {
          console.warn("[gala-dinner] Auto-reply send error:", err?.message || err);
        });
      }
    } catch (e) {
      console.warn("[gala-dinner] Email setup skipped:", e);
    }

    const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
    const protocol = req.headers.get("x-forwarded-proto") || (host?.includes("localhost") ? "http" : "https");
    const origin = req.headers.get("origin");
    const baseUrl =
      origin ||
      (host ? `${protocol}://${host}` : null) ||
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://www.higex.org");

    const isInternational = isIntlDelegate;

    // International delegates are routed to SWIFT bank wire (USD)
    if (effectivePaymentMethod === 'bank') {
      return NextResponse.json({
        success: true,
        orderId,
        paymentMethod: 'bank',
        totalAmountNPR,
        totalAmountUSD,
        message: 'Networking Dinner reservation received. Pay by SWIFT wire to complete it.',
        redirectUrl: `/payment/success?id=${encodeURIComponent(
          orderId
        )}&gateway=bank&type=gala&amount=${isInternational ? totalAmountUSD : totalAmountNPR}&currency=${isInternational ? 'USD' : 'NPR'}&qty=${qty}&pass=${passType}`,
      });
    }

    // 2. If Khalti payment method
    if (effectivePaymentMethod === 'khalti') {
      try {
        const returnUrl = `${baseUrl}/api/payment/callback?order_id=${encodeURIComponent(
          orderId
        )}&type=gala&pass=${encodeURIComponent(passType)}&qty=${qty}&amount=${totalAmountNPR * 100}`;

        const khaltiResponse = await initializeKhaltiPayment({
          return_url: returnUrl,
          website_url: baseUrl,
          amount: Math.round(totalAmountNPR * 100), // Rs to Paisa
          purchase_order_id: orderId,
          purchase_order_name: `Networking Dinner Ticket (${qty}x ${passType.toUpperCase()}) - Royal Tulip`,
          customer_info: {
            name,
            email,
            phone,
          },
          product_details: [
            {
              identity: orderId,
              name: `Networking Dinner Pass (${passType.toUpperCase()} incl. 13% VAT)`,
              total_price: Math.round(totalAmountNPR * 100),
              quantity: qty,
              unit_price: Math.round((totalAmountNPR / qty) * 100),
            },
          ],
        });

        // Remember which Khalti checkout belongs to this order (checked in the callback)
        await updateFirebaseRegistration(orderId, { khaltiPidx: khaltiResponse.pidx });
        return NextResponse.json({
          success: true,
          orderId,
          paymentMethod: 'khalti',
          paymentUrl: khaltiResponse.payment_url,
          pidx: khaltiResponse.pidx,
          totalAmountNPR,
        });
      } catch (err: any) {
        console.error('Khalti Gala initiation error:', err);
        return NextResponse.json(
          {
            success: false,
            error: err.message || 'Failed to initialize Khalti payment gateway.',
          },
          { status: 500 }
        );
      }
    }

    // QR payment — reservation saved, pending screenshot verification
    return NextResponse.json({
      success: true,
      orderId,
      paymentMethod: 'qr',
      totalAmountNPR,
      redirectUrl: `/payment/success?id=${encodeURIComponent(
        orderId
      )}&gateway=qr&type=gala&amount=${totalAmountNPR}&qty=${qty}`,
    });
  } catch (error: any) {
    console.error('Gala payment initiate error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
