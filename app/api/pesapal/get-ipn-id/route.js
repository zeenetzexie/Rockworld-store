export async function GET() {
  const consumerKey = process.env.PESAPAL_CONSUMER_KEY;
  const consumerSecret = process.env.PESAPAL_CONSUMER_SECRET;
  const apiBase = 'https://pay.pesapal.com/v3/api';

  // Step 1: Get token
  const tokenRes = await fetch(`${apiBase}/Auth/RequestToken`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ consumer_key: consumerKey, consumer_secret: consumerSecret })
  });
  const { token } = await tokenRes.json();

  // Step 2: Register IPN URL
  const ipnRes = await fetch(`${apiBase}/URLSetup/RegisterIPN`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      url: 'https://rockworld-store.vercel.app/api/pesapal/ipn',
      ipn_notification_type: 'GET'
    })
  });

  const ipnData = await ipnRes.json();
  return Response.json(ipnData);
}
