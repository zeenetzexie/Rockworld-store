import { NextResponse } from 'next/server';

const PAYPAL_API_BASE = process.env.PAYPAL_MODE === 'live' 
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

async function getAccessToken() {
  try {
    const clientId = process.env.PAYPAL_CLIENT_ID;
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
      console.error('PayPal auth error:', error);
      throw new Error('Failed to authenticate with PayPal');
    }

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
    
    console.log('=== PayPal Create Order ===');
    console.log('Items received:', JSON.stringify(items, null, 2));

    if (!items || items.length === 0) {
      throw new Error('Cart is empty');
    }

    // Calculate total and build PayPal items
    let total = 0;
    const paypalItems = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      // Extract price
      let price = 0;
      if (item.price) {
        price = parseFloat(item.price);
      } else if (item.variant?.retail_price) {
        price = parseFloat(item.variant.retail_price);
      } else if (item.retail_price) {
        price = parseFloat(item.retail_price);
      }

      // Validate price
      if (isNaN(price) || price <= 0) {
        console.error(`Invalid price for item ${i}:`, item);
        throw new Error(`Invalid price for item: ${item.name || 'Unknown'}`);
      }

      // Extract name
      let name = 'Product';
      if (item.product?.name) {
        name = item.product.name;
      } else if (item.name) {
        name = item.name;
      }

      // Add variant info to name if available
      if (item.variant?.name) {
        name = `${name} - ${item.variant.name}`;
      } else if (item.variantName) {
        name = `${name} - ${item.variantName}`;
      }

      // Get quantity
      const quantity = parseInt(item.quantity) || 1;
      
      // Validate quantity
      if (quantity <= 0) {
        throw new Error('Invalid quantity');
      }

      const itemTotal = price * quantity;
      total += itemTotal;

      // Truncate name to PayPal's limit
      const truncatedName = name.substring(0, 127);

      paypalItems.push({
        name: truncatedName,
        description: truncatedName.substring(0, 127),
        unit_amount: {
          currency_code: 'USD',
          value: price.toFixed(2),
        },
        quantity: quantity.toString(),
      });

      console.log(`Item ${i}:`, {
        name: truncatedName,
        price: price.toFixed(2),
        quantity,
        subtotal: itemTotal.toFixed(2)
      });
    }

    // Validate total
    if (total <= 0 || isNaN(total)) {
      throw new Error('Invalid cart total');
    }

    console.log('Total amount:', total.toFixed(2));
    console.log('PayPal items:', JSON.stringify(paypalItems, null, 2));

    // Get access token
    const accessToken = await getAccessToken();

    // Create PayPal order
    const orderPayload = {
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
    };

    console.log('Creating PayPal order with payload:', JSON.stringify(orderPayload, null, 2));

    const orderResponse = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(orderPayload),
    });

    const orderData = await orderResponse.json();
    
    console.log('PayPal API response:', JSON.stringify(orderData, null, 2));

    if (!orderResponse.ok || orderData.error || !orderData.id) {
      console.error('PayPal order creation failed:', orderData);
      const errorMessage = orderData.message || orderData.error?.message || 'Failed to create PayPal order';
      const errorDetails = orderData.details ? JSON.stringify(orderData.details) : '';
      throw new Error(`${errorMessage} ${errorDetails}`);
    }

    console.log('PayPal order created successfully:', orderData.id);
    return NextResponse.json({ orderId: orderData.id });
    
  } catch (error) {
    console.error('=== PayPal Create Order Error ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    return NextResponse.json(
      { error: error.message || 'Failed to create PayPal order' },
      { status: 500 }
    );
  }
}
