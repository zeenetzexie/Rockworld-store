import { NextResponse } from 'next/server';

const PAYPAL_API_BASE = 'https://api-m.sandbox.paypal.com';

export async function POST(request) {
  try {
    console.log('=== PAYPAL TEST START ===');
    
    // Get credentials
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    
    console.log('Client ID exists:', !!clientId);
    console.log('Client Secret exists:', !!clientSecret);
    console.log('Client ID starts with:', clientId?.substring(0, 5));
    
    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: 'PayPal credentials missing' },
        { status: 500 }
      );
    }
    
    // Get access token
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    
    console.log('Requesting access token...');
    const tokenResponse = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });
    
    const tokenData = await tokenResponse.json();
    console.log('Token response status:', tokenResponse.status);
    console.log('Token data:', tokenData);
    
    if (!tokenResponse.ok) {
      return NextResponse.json(
        { error: 'Auth failed', details: tokenData },
        { status: 500 }
      );
    }
    
    const accessToken = tokenData.access_token;
    console.log('Access token obtained:', !!accessToken);
    
    // Create simple test order (fixed $10.00)
    const orderPayload = {
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: '10.00',
        },
      }],
      application_context: {
        brand_name: 'ROCKWORLD',
        return_url: `${request.headers.get('origin')}/success`,
        cancel_url: `${request.headers.get('origin')}/?canceled=true`,
      },
    };
    
    console.log('Creating order...');
    const orderResponse = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(orderPayload),
    });
    
    const orderData = await orderResponse.json();
    console.log('Order response status:', orderResponse.status);
    console.log('Order data:', orderData);
    
    if (!orderResponse.ok || !orderData.id) {
      return NextResponse.json(
        { error: 'Order creation failed', details: orderData },
        { status: 500 }
      );
    }
    
    console.log('=== PAYPAL TEST SUCCESS ===');
    console.log('Order ID:', orderData.id);
    
    return NextResponse.json({ 
      orderId: orderData.id,
      testMode: true,
      amount: '10.00'
    });
    
  } catch (error) {
    console.error('=== PAYPAL TEST ERROR ===');
    console.error(error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
