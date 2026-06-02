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
    const { items } = await request.json();

    // Calculate total
    const total = items.reduce((sum, item) => {
      return sum + (parseFloat(item.variant.retail_price) * item.quantity);
    }, 0);

    const accessToken = await getAccessToken();

    // Create PayPal order
    const orderResponse = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'USD',
              value: total.toFixed(2),
              breakdown: {
                item_total: {
                  currency_code: 'USD',
                  value: total.toFixed(2),
                },
              },
            },
            items: items.map(item => ({
              name: item.product.name,
              description: item.variant.name,
              unit_amount: {
                currency_code: 'USD',
                value: parseFloat(item.variant.retail_price).toFixed(2),
              },
              quantity: item.quantity.toString(),
            })),
          },
        ],
        application_context: {
          brand_name: 'ROCKWORLD',
          landing_page: 'NO_PREFERENCE',
          user_action: 'PAY_NOW',
          return_url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/success`,
          cancel_url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/?canceled=true`,
        },
      }),
    });

    const orderData = await orderResponse.json();

    if (orderData.error) {
      throw new Error(orderData.error.message || 'Failed to create PayPal order');
    }

    return NextResponse.json({ orderId: orderData.id });
  } catch (error) {
    console.error('PayPal create order error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create PayPal order' },
      { status: 500 }
    );
  }
}
