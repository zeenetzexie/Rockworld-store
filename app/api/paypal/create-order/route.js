import { NextResponse } from 'next/server';

const PAYPAL_API_BASE = process.env.PAYPAL_MODE === 'live' 
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

async function getAccessToken() {
  try {
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
  } catch (error) {
    console.error('Get access token error:', error);
    throw error;
  }
}

export async function POST(request) {
  try {
    const { items } = await request.json();
    
    console.log('Received items:', items);

    // Simple total calculation
    let total = 0;
    const paypalItems = [];

    for (const item of items) {
      // Get price - try multiple places
      let price = 0;
      if (item.price) {
        price = parseFloat(item.price);
      } else if (item.variant && item.variant.retail_price) {
        price = parseFloat(item.variant.retail_price);
      }

      // Get name
      let name = 'Product';
      if (item.product && item.product.name) {
        name = item.product.name;
      } else if (item.name) {
        name = item.name;
      }

      const quantity = parseInt(item.quantity) || 1;
      const itemTotal = price * quantity;
      total += itemTotal;

      paypalItems.push({
        name: name.substring(0, 100),
        unit_amount: {
          currency_code: 'USD',
          value: price.toFixed(2),
        },
        quantity: quantity.toString(),
      });
    }

    console.log('Calculated total:', total);
    console.log('PayPal items:', paypalItems);

    const accessToken = await getAccessToken();

    // Create order
    const orderResponse = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
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
              item_total: {
                currency_code: 'USD',
                value: total.toFixed(2),
              },
            },
          },
          items: paypalItems,
        }],
        application_context: {
          brand_name: 'ROCKWORLD',
          landing_page: 'NO_PREFERENCE',
          user_action: 'PAY_NOW',
          return_url: `${request.headers.get('origin')}/success`,
          cancel_url: `${request.headers.get('origin')}/?canceled=true`,
        },
      }),
    });

    const orderData = await orderResponse.json();
    
    console.log('PayPal response:', orderData);

    if (orderData.error || !orderData.id) {
      throw new Error(orderData.message || 'PayPal API error');
    }

    return NextResponse.json({ orderId: orderData.id });
    
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}
```

**Save and commit:** "Simplified PayPal create-order with better error handling"

---

## **After uploading:**

1. **Wait for Vercel to rebuild** (2-3 mins)
2. **Test PayPal checkout**
3. **Check browser console** (F12) for the `console.log` messages
4. **Send me screenshot** of what you see in console

The console.log statements will help us see:
- What items are being sent
- What total is calculated
- What PayPal returns

---

## **If still fails, let's check:**

**Are the environment variables set correctly in Vercel?**

Go to Vercel → Settings → Environment Variables

Make sure you have:
```
PAYPAL_CLIENT_ID (NOT NEXT_PUBLIC_)
PAYPAL_CLIENT_SECRET
PAYPAL_MODE=sandbox
```

**NOT:**
```
NEXT_PUBLIC_PAYPAL_CLIENT_ID  ← Wrong one!
