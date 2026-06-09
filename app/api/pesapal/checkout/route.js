export async function POST(request) {
  try {
    const { amount, currency, email, firstName, lastName, orderId } = await request.json();

    if (!amount || amount <= 0) {
      return Response.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const consumerKey = process.env.NEXT_PUBLIC_PESAPAL_CONSUMER_KEY;
    const consumerSecret = process.env.PESAPAL_CONSUMER_SECRET;

    if (!consumerKey || !consumerSecret) {
      return Response.json({ error: 'Pesapal credentials missing' }, { status: 500 });
    }

    const origin = request.headers.get('origin') || 'https://rockworld-store.vercel.app';
    const paymentId = orderId || `ROCKWORLD-${Date.now()}`;

    // Pesapal sandbox API
    const apiBase = 'https://testapi.pesapal.com/api';

    // Step 1: Get token
    const tokenRes = await fetch(`${apiBase}/Auth/RequestToken`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        consumer_key: consumerKey,
        consumer_secret: consumerSecret
      })
    });

    if (!tokenRes.ok) {
      throw new Error('Failed to get Pesapal token');
    }

    const tokenData = await tokenRes.json();
    const token = tokenData.token;

    // Step 2: Create order
    const orderRes = await fetch(`${apiBase}/PostPesapalOrderDetails`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        reference: paymentId,
        amount: parseFloat(amount.toFixed(2)),
        description: 'ROCKWORLD Purchase',
        type: 'MERCHANT',
        first_name: firstName || 'Customer',
        last_name: lastName || 'User',
        email: email,
        currency: currency || 'KES',
        post_default_redirect_url: `${origin}/success?payment=pesapal&ref=${paymentId}`,
        post_cancel_redirect_url: `${origin}/`
      })
    });

    if (!orderRes.ok) {
      throw new Error('Failed to create Pesapal order');
    }

    const orderData = await orderRes.json();

    return Response.json({
      success: true,
      reference: orderData.reference,
      redirectUrl: `${apiBase.replace('/api', '')}/PostPesapalOrderDetails?ref=${orderData.reference}`
    });

  } catch (error) {
    console.error('Pesapal error:', error.message);
    return Response.json({ error: error.message, success: false }, { status: 500 });
  }
}
