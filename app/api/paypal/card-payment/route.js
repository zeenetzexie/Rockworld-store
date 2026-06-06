import axios from 'axios';

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
    const authResponse = await axios.post(
      `${apiBase}/v1/oauth2/token`,
      'grant_type=client_credentials',
      {
        auth: {
          username: clientId,
          password: clientSecret
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const accessToken = authResponse.data.access_token;

    // Create order
    const orderResponse = await axios.post(
      `${apiBase}/v2/checkout/orders`,
      {
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
        }
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return Response.json({
      orderId: orderResponse.data.id,
      status: orderResponse.data.status,
      success: true
    });

  } catch (error) {
    console.error('PayPal error:', error.response?.data || error.message);
    
    return Response.json({
      error: error.response?.data?.message || 'PayPal payment failed',
      success: false
    }, { status: 500 });
  }
}
