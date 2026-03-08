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

    if (!items || items.length === 0) {
      throw new Error('No items in cart');
    }

    // Calculate total from cart items
    const total = items.reduce((sum, item) => {
      const price = parseFloat(item.price || item.variant?.retail_price || 0);
      const quantity = parseInt(item.quantity || 1);
      return sum + (price * quantity);
    }, 0);

    if (total === 0) {
      throw new Error('Invalid cart total');
    }

    const accessToken = await getAccessToken();

    // Format items for PayPal
    const paypalItems = items.map(item => {
      const productName = item.product?.name || item.name || 'Product';
      const variantName = item.variant?.name || '';
      const displayName = variantName ? `${productName} - ${variantName}` : productName;
      const price = parseFloat(item.price || item.variant?.retail_price || 0);
      const quantity = parseInt(item.quantity || 1);

      return {
        name: displayName.substring(0, 127), // PayPal limit
        description: variantName.substring(0, 127) || 'Product',
        unit_amount: {
          currency_code: 'USD',
          value: price.toFixed(2),
        },
        quantity: quantity.toString(),
      };
    });

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
            items: paypalItems,
          },
        ],
        application_context: {
          brand_name: 'ROCKWORLD',
          landing_page: 'NO_PREFERENCE',
          user_action: 'PAY_NOW',
          return_url: `${process.env.NEXT_PUBLIC_URL || 'https://rockworld-store.vercel.app'}/success`,
          cancel_url: `${process.env.NEXT_PUBLIC_URL || 'https://rockworld-store.vercel.app'}/?canceled=true`,
        },
      }),
    });

    const orderData = await orderResponse.json();

    if (orderData.error || !orderData.id) {
      console.error('PayPal API Error:', orderData);
      throw new Error(orderData.error?.message || orderData.message || 'Failed to create PayPal order');
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
