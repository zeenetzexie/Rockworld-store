export async function POST(request) {
  try {
    const { amount, currency, description, email, orderId } = await request.json();

    if (!amount || amount <= 0) {
      return Response.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    const mode = process.env.PAYPAL_MODE || 'sandbox';

    if (!clientId || !clientSecret) {
      return Response.json({ error: 'PayPal not configured' }, { status: 500 });
    }

    // PayPal API endpoint
    const apiBase = mode === 'production' 
      ? 'https://api.paypal.com' 
      : 'https://api.sandbox.paypal.com';

    // Get access token
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    
    const tokenResponse = await fetch(`${apiBase}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.json();
      throw new Error(`Token error: ${error.error_description}`);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Get origin for return URLs
    const origin = request.headers.get('origin') || 'https://rockworld-store.vercel.app';

    // Create order with return URLs
    const orderResponse = await fetch(`${apiBase}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: orderId || `order-${Date.now()}`,
            amount: {
              currency_code: currency || 'USD',
              value: amount.toFixed(2)
            },
            description: description || 'ROCKWORLD Purchase'
          }
        ],
        payer: {
          email_address: email
        },
        payment_source: {
          card: {
            attributes: {
              vault: {
                store_in_vault: 'OFF_SESSION'
              }
            }
          }
        },
        return_url: `${origin}/success?payment=paypal`,
        cancel_url: `${origin}/`
      })
    });

    if (!orderResponse.ok) {
      const error = await orderResponse.json();
      throw new Error(`Order creation failed: ${error.message}`);
    }

    const orderData = await orderResponse.json();

    // Find the approve link in the links array
    const approveLink = orderData.links.find(link => link.rel === 'approve');
    
    if (!approveLink) {
      throw new Error('No approve link found in PayPal response');
    }

    return Response.json({
      orderId: orderData.id,
      status: orderData.status,
      checkoutUrl: approveLink.href,
      success: true
    });

  } catch (error) {
    console.error('PayPal error:', error.message);
    
    return Response.json({
      error: error.message || 'PayPal payment failed',
      success: false
    }, { status: 500 });
  }
}
