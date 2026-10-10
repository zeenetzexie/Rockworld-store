import { NextResponse } from 'next/server';

const PAYPAL_API_BASE = process.env.PAYPAL_MODE === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

async function getAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials not configured');
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`PayPal auth failed: ${error}`);
  }

  const data = await response.json();
  return data.access_token;
}

export async function POST(request) {
  try {
    const { cart } = await request.json();

    if (!cart || cart.length === 0) {
      throw new Error('Cart is empty');
    }

    let total = 0;
    const items = cart.map(item => {
      const price = parseFloat(item.price);
      const quantity = parseInt(item.quantity) || 1;
      total += price * quantity;
      return {
        name: item.name.substring(0, 127),
        unit_amount: { currency_code: 'USD', value: price.toFixed(2) },
        quantity: quantity.toString(),
      };
    });

    const accessToken = await getAccessToken();
    const origin = request.headers.get('origin') || 'https://rockworld-store.vercel.app';

    const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: 'USD',
            value: total.toFixed(2),
            breakdown: {
              item_total: { currency_code: 'USD', value: total.toFixed(2) }
            }
          },
          items,
        }],
        application_context: {
          brand_name: 'ROCKWORLD',
          landing_page: 'NO_PREFERENCE',
          user_action: 'PAY_NOW',
          return_url: `${origin}/success`,
          cancel_url: `${origin}/`,
        }
      }),
    });

    const orderData = await response.json();

    if (!response.ok || !orderData.id) {
      throw new Error(orderData.message || 'Failed to create PayPal order');
    }

    return NextResponse.json({ id: orderData.id });

  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
