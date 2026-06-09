export async function POST(request) {
  try {
    const { amount, currency, email, firstName, lastName, orderId } = await request.json();

    if (!amount || amount <= 0) {
      return Response.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const consumerKey = process.env.PESAPAL_CONSUMER_KEY; // remove NEXT_PUBLIC_ - secret should never be public
    const consumerSecret = process.env.PESAPAL_CONSUMER_SECRET;
    const ipnId = process.env.PESAPAL_IPN_ID; // add this after registering IPN above

    if (!consumerKey || !consumerSecret) {
      return Response.json({ error: 'Pesapal credentials missing' }, { status: 500 });
    }

    const origin = request.headers.get('origin') || 'https://rockworld-store.vercel.app';
    const paymentId = orderId || `ROCKWORLD-${Date.now()}`;

    // ✅ Correct v3 sandbox base
    const apiBase = 'https://pay.pesapal.com/v3/api';

    // Step 1: Get auth token
    const tokenRes = await fetch(`${apiBase}/Auth/RequestToken`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        consumer_key: consumerKey,
        consumer_secret: consumerSecret
      })
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      throw new Error(`Token fetch failed: ${err}`);
    }

    const tokenData = await tokenRes.json();
    const token = tokenData.token;

    // Step 2: Submit order (v3 endpoint)
    const orderRes = await fetch(`${apiBase}/Transactions/SubmitOrderRequest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        id: paymentId,
        currency: currency || 'ZMW', // ✅ use ZMW for Zambia
        amount: parseFloat(amount.toFixed(2)),
        description: 'ROCKWORLD Purchase',
        callback_url: `${origin}/success?payment=pesapal&ref=${paymentId}`,
        cancellation_url: `${origin}/`,
        notification_id: ipnId, // required in v3
        billing_address: {
          email_address: email,
          first_name: firstName || 'Customer',
          last_name: lastName || 'User'
        }
      })
    });

    if (!orderRes.ok) {
      const err = await orderRes.text();
      throw new Error(`Order submission failed: ${err}`);
    }

    const orderData = await orderRes.json();

    return Response.json({
      success: true,
      reference: orderData.order_tracking_id,
      redirectUrl: orderData.redirect_url  // v3 returns redirect_url directly
    });

  } catch (error) {
    console.error('Pesapal error:', error.message);
    return Response.json({ error: error.message, success: false }, { status: 500 });
  }
}
