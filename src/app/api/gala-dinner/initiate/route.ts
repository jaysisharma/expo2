import { NextResponse } from 'next/server';
import { initializeKhaltiPayment } from '@/lib/khalti';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

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

    const qty = Math.max(1, parseInt(String(quantity), 10) || 1);
    const unitPriceNPR = passType === 'international' ? 6750 : 6000;
    const unitPriceUSD = passType === 'international' ? 50 : 45;
    const totalAmountNPR = unitPriceNPR * qty;
    const totalAmountUSD = unitPriceUSD * qty;

    const orderId = `GALA-2027-${Math.floor(100000 + Math.random() * 900000)}`;

    const adminData = await getAdminData();
    if (!adminData.registrations) adminData.registrations = [];

    const resolvedPassTitle =
      passType === 'international'
        ? `Gala Dinner Pass (Royal Tulip) - International [${qty} Pax]`
        : `Gala Dinner Pass (Royal Tulip) - National [${qty} Pax]`;

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
        category: 'Gala Dinner',
        venue: 'Royal Tulip Kathmandu (Gwarko)',
        date: 'Monday, 18 January 2027',
        time: '6:00 PM onwards',
        passTier: passType,
        quantity: qty,
        unitPriceNPR,
        totalAmountNPR,
        unitPriceUSD,
        totalAmountUSD,
        dietary,
        specialRequests,
      },
      paymentMethod,
      paymentStatus: paymentMethod === 'qr' ? 'PENDING_QR_VERIFICATION' : 'UNPAID',
      screenshotUrl: body.screenshotUrl || '',
      checkedIn: false,
      registeredAt: new Date().toISOString(),
    };

    adminData.registrations.unshift(newRegistration);

    // Also record lead in inquiries
    if (!adminData.inquiries) adminData.inquiries = [];
    adminData.inquiries.unshift({
      id: `INQ-GALA-${orderId}`,
      name,
      email,
      phone,
      company: organization || name,
      subject: `Gala Dinner Reservation [${qty}x ${passType.toUpperCase()}] - ${paymentMethod.toUpperCase()}`,
      message: `Order: ${orderId}. Pass: ${resolvedPassTitle}. Quantity: ${qty}. Total: NPR ${totalAmountNPR.toLocaleString()} (USD ${totalAmountUSD}). Dietary: ${dietary}. Payment: ${paymentMethod.toUpperCase()}.`,
      stallInterest: 'Gala Dinner (Royal Tulip)',
      status: 'New',
      submittedAt: new Date().toISOString(),
    });

    await saveAdminData(adminData);

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.NODE_ENV === 'development'
        ? 'http://localhost:3000'
        : 'https://himalayanenergyexpo.com');

    // 2. If Khalti payment method
    if (paymentMethod === 'khalti') {
      try {
        const returnUrl = `${baseUrl}/api/payment/callback?order_id=${encodeURIComponent(
          orderId
        )}&type=gala&pass=${encodeURIComponent(passType)}&qty=${qty}&amount=${totalAmountNPR * 100}`;

        const khaltiResponse = await initializeKhaltiPayment({
          return_url: returnUrl,
          website_url: baseUrl,
          amount: Math.round(totalAmountNPR * 100), // Rs to Paisa
          purchase_order_id: orderId,
          purchase_order_name: `Gala Dinner Ticket (${qty}x ${passType.toUpperCase()}) - Royal Tulip`,
          customer_info: {
            name,
            email,
            phone,
          },
          product_details: [
            {
              identity: orderId,
              name: `Gala Dinner VIP Pass (${passType.toUpperCase()})`,
              total_price: Math.round(totalAmountNPR * 100),
              quantity: qty,
              unit_price: Math.round(unitPriceNPR * 100),
            },
          ],
        });

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
