import { NextResponse } from 'next/server';

const PAYPAL_API_BASE = process.env.PAYPAL_MODE === 'live' 
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

async function getAccessToken() {
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString('base64');

  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const data = await response.json();
  return data.access_token;
}

export async function POST(request) {
  try {
    const { orderId } = await request.json();

    const accessToken = await getAccessToken();

    // Capture the payment
    const captureResponse = await fetch(
      `${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const captureData = await captureResponse.json();

    if (captureData.error) {
      throw new Error(captureData.error.message || 'Failed to capture payment');
    }

    return NextResponse.json(captureData);
  } catch (error) {
    console.error('PayPal capture payment error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to capture payment' },
      { status: 500 }
    );
  }
}
