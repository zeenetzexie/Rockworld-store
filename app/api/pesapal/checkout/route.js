export async function POST(request) {
  try {
    const { amount, currency, email, orderId, firstName, lastName } = await request.json();

    if (!amount || amount <= 0) {
      return Response.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const consumerKey = process.env.NEXT_PUBLIC_PESAPAL_CONSUMER_KEY;
    const consumerSecret = process.env.PESAPAL_CONSUMER_SECRET;
    const pesapalEnv = process.env.PESAPAL_ENV || 'sandbox';

    if (!consumerKey || !consumerSecret) {
      return Response.json({ error: 'Pesapal not configured' }, { status: 500 });
    }

    // Pesapal API endpoints
    const apiBase = pesapalEnv === 'production'
      ? 'https://api.pesapal.com/api'
      : 'https://testapi.pesapal.com/api';

    // Step 1: Get access token using OAuth 2.0
    const tokenResponse = await fetch(`${apiBase}/Auth/RequestToken`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        consumer_key: consumerKey,
        consumer_secret: consumerSecret
      })
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.json();
      throw new Error(`Token error: ${error.error_description || error.error}`);
    }

    const tokenData = await tokenResponse.json();
    const token = tokenData.token;

    // Get origin for return URLs
    const origin = request.headers.get('origin') || 'https://rockworld-store.vercel.app';

    // Step 2: Create payment request
    const paymentId = `ROCKWORLD-${Date.now()}`;
    
    const paymentResponse = await fetch(`${apiBase}/PostPesapalOrderDetails`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        reference: paymentId,
        amount: parseFloat(amount.toFixed(2)),
        description: 'ROCKWORLD Store Purchase',
        type: 'MERCHANT',
        first_name: firstName || 'Customer',
        last_name: lastName || 'Order',
        email: email,
        phonenumber: '',
        currency: currency || 'KES',
        redirect_mode: '',
        post_default_redirect_url: `${origin}/success?payment=pesapal&reference=${paymentId}`,
        post_cancel_redirect_url: `${origin}/`
      })
    });

    if (!paymentResponse.ok) {
      const error = await paymentResponse.json();
      throw new Error(`Payment creation failed: ${error.message || error.error}`);
    }

    const paymentData = await paymentResponse.json();

    // Step 3: Build redirect URL
    const redirectUrl = `${apiBase.replace('/api', '')}/PostPesapalOrderDetails?ref=${paymentData.reference}`;

    return Response.json({
      success: true,
      reference: paymentData.reference,
      redirectUrl: redirectUrl,
      amount: amount,
      email: email
    });

  } catch (error) {
    console.error('Pesapal error:', error.message);
    
    return Response.json({
      error: error.message || 'Pesapal payment failed',
      success: false
    }, { status: 500 });
  }
}
