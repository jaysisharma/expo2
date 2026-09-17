/**
 * Khalti ePayment API v2 Integration
 * Supports both Live and Sandbox/Dev modes for Expo Stall Booking
 */

const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY;
const KHALTI_BASE_URL = process.env.KHALTI_BASE_URL || 'https://khalti.com/api/v2';

export interface KhaltiCustomerInfo {
  name: string;
  email: string;
  phone: string;
}

export interface InitializeKhaltiPaymentParams {
  return_url: string;
  website_url?: string;
  amount: number; // in Paisa (NPR * 100)
  purchase_order_id: string;
  purchase_order_name: string;
  customer_info: KhaltiCustomerInfo;
  product_details?: Array<{
    identity: string;
    name: string;
    total_price: number;
    quantity: number;
    unit_price: number;
  }>;
}

export interface KhaltiInitResponse {
  pidx: string;
  payment_url: string;
  expires_at?: string;
  expires_in?: number;
}

export interface KhaltiVerifyResponse {
  pidx: string;
  total_amount: number;
  status: 'Completed' | 'Pending' | 'Initiated' | 'Refunded' | 'Expired' | 'User canceled';
  transaction_id?: string;
  fee?: number;
  refunded?: boolean;
}

export async function initializeKhaltiPayment(
  params: InitializeKhaltiPaymentParams
): Promise<KhaltiInitResponse> {
  const {
    return_url,
    website_url,
    amount,
    purchase_order_id,
    purchase_order_name,
    customer_info,
  } = params;

  if (!amount || !purchase_order_id || !purchase_order_name || !return_url) {
    throw new Error('Missing required payment parameters');
  }

  const appUrl =
    website_url ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'http://localhost:3000';

  // If Khalti secret key is provided, make real API call
  if (KHALTI_SECRET_KEY && KHALTI_SECRET_KEY.trim() !== '') {
    const payload = {
      return_url,
      website_url: appUrl,
      amount: Math.round(amount), // in paisa
      purchase_order_id,
      purchase_order_name,
      customer_info,
      product_details: params.product_details || [
        {
          identity: purchase_order_id.toString(),
          name: purchase_order_name,
          total_price: Math.round(amount),
          quantity: 1,
          unit_price: Math.round(amount),
        },
      ],
    };

    const response = await fetch(`${KHALTI_BASE_URL}/epayment/initiate/`, {
      method: 'POST',
      headers: {
        Authorization: `key ${KHALTI_SECRET_KEY.replace(/^key\s+/i, '')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('Khalti Init Error response:', data);
      throw new Error(data.detail || data.message || 'Failed to initiate Khalti payment');
    }

    return data as KhaltiInitResponse;
  }

  // Sandbox / Dev Simulated Fallback (if no real key configured yet)
  console.log('Khalti Dev Mode: Generating test simulated checkout redirect for order:', purchase_order_id);
  const simulatedPidx = `KHALTI_DEV_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  
  // Directly point return_url with completed query params to simulate seamless sandbox checkout
  const callbackUrl = new URL(return_url);
  callbackUrl.searchParams.set('pidx', simulatedPidx);
  callbackUrl.searchParams.set('status', 'Completed');
  callbackUrl.searchParams.set('transaction_id', `TXN_${Date.now()}`);
  callbackUrl.searchParams.set('amount', amount.toString());
  callbackUrl.searchParams.set('purchase_order_id', purchase_order_id);

  return {
    pidx: simulatedPidx,
    payment_url: callbackUrl.toString(),
  };
}

export async function verifyKhaltiPayment(pidx: string): Promise<KhaltiVerifyResponse> {
  if (!pidx) throw new Error('Missing pidx');

  // If simulated sandbox pidx
  if (pidx.startsWith('KHALTI_DEV_')) {
    return {
      pidx,
      total_amount: 0,
      status: 'Completed',
      transaction_id: `SIMULATED_${Date.now()}`,
    };
  }

  if (!KHALTI_SECRET_KEY) {
    return {
      pidx,
      total_amount: 0,
      status: 'Completed',
      transaction_id: `DEV_PASS_${Date.now()}`,
    };
  }

  const response = await fetch(`${KHALTI_BASE_URL}/epayment/lookup/`, {
    method: 'POST',
    headers: {
      Authorization: `key ${KHALTI_SECRET_KEY.replace(/^key\s+/i, '')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ pidx }),
  });

  const data = await response.json();
  if (!response.ok) {
    console.error('Khalti Verify Error response:', data);
    throw new Error(data.detail || data.message || 'Failed to verify Khalti payment');
  }

  return data as KhaltiVerifyResponse;
}
