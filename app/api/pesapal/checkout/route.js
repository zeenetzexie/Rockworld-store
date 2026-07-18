export async function POST(request) {
  try {
    const { amount, currency, email, firstName, lastName, orderId, cartItems, shippingAddress } = await request.json();

    if (!amount || amount <= 0) {
      return Response.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const consumerKey = process.env.PESAPAL_CONSUMER_KEY;
    const consumerSecret = process.env.PESAPAL_CONSUMER_SECRET;
    const ipnId = process.env.PESAPAL_IPN_ID;

    if (!consumerKey || !consumerSecret) {
      return Response.json({ error: 'Pesapal credentials missing' }, { status: 500 });
    }

    const origin = request.headers.get('origin') || 'https://rockworld-store.vercel.app';
    const paymentId = orderId || `ROCKWORLD-${Date.now()}`;
    const orderPayload = encodeURIComponent(JSON.stringify({ cartItems, shippingAddress, email, firstName, lastName }));
    const apiBase = 'https://pay.pesapal.com/v3/api';

    const tokenRes = await fetch(`${apiBase}/Auth/RequestToken`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ consumer_key: consumerKey, consumer_secret: consumerSecret })
    });

    if (!tokenRes.ok) {
      throw new Error(`Token fetch failed: ${await tokenRes.text()}`);
    }

    const tokenData = await tokenRes.json();
    const token = tokenData.token;

    const orderRes = await fetch(`${apiBase}/Transactions/SubmitOrderRequest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        id: paymentId,
        currency: currency || 'USD',
        amount: parseFloat(amount.toFixed(2)),
        description: 'ROCKWORLD Purchase',
        callback_url: `${origin}/success?payment=pesapal&ref=${paymentId}&order=${orderPayload}`,
        cancellation_url: `${origin}/`,
        notification_id: ipnId,
        billing_address: {
          email_address: email,
          first_name: firstName || 'Customer',
          last_name: lastName || 'User'
        }
      })
    });

    const orderData = await orderRes.json();
    console.log('Pesapal order response:', JSON.stringify(orderData));

    if (!orderRes.ok) {
      throw new Error(`Order submission failed: ${JSON.stringify(orderData)}`);
    }

    if (!orderData.redirect_url) {
      throw new Error(`No redirect URL. Pesapal response: ${JSON.stringify(orderData)}`);
    }

    return Response.json({
      success: true,
      reference: orderData.order_tracking_id,
      redirectUrl: orderData.redirect_url
    });

  } catch (error) {
    console.error('Pesapal error:', error);
    return Response.json({ error: error.message, success: false, stack: error.stack }, { status: 500 });
  }
}
