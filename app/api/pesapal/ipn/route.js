export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const orderTrackingId = searchParams.get('OrderTrackingId');
  const orderMerchantReference = searchParams.get('OrderMerchantReference');

  try {
    // Step 1: Get Pesapal token
    const apiBase = 'https://pay.pesapal.com/v3/api';
    const tokenRes = await fetch(`${apiBase}/Auth/RequestToken`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        consumer_key: process.env.PESAPAL_CONSUMER_KEY,
        consumer_secret: process.env.PESAPAL_CONSUMER_SECRET
      })
    });
    const { token } = await tokenRes.json();

    // Step 2: Verify payment status with Pesapal
    const statusRes = await fetch(
      `${apiBase}/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
      { headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' } }
    );
    const statusData = await statusRes.json();

    // Step 3: Only proceed if payment is confirmed
    if (statusData.payment_status_description === 'Completed') {
      // Get the order details we saved earlier using the merchant reference
      // orderMerchantReference = your ROCKWORLD-xxxxx order ID
      await createPrintfulOrder(orderMerchantReference);
    }

  } catch (error) {
    console.error('IPN error:', error);
  }

  return Response.json({ status: 'ok' });
}

async function createPrintfulOrder(merchantReference) {
  // We need the cart items to fulfill — see note below
  const printfulRes = await fetch('https://api.printful.com/orders', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.PRINTFUL_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      external_id: merchantReference,
      shipping: 'STANDARD',
      recipient: {
        // We need shipping details here — see note below
      },
      items: [
        // We need cart items here — see note below
      ]
    })
  });

  const data = await printfulRes.json();
  console.log('Printful order created:', data);
}
