export async function GET() {
  const consumerKey = process.env.PESAPAL_CONSUMER_KEY;
  const consumerSecret = process.env.PESAPAL_CONSUMER_SECRET;
  const apiBase = 'https://pay.pesapal.com/v3/api';

  // Get token
  const tokenRes = await fetch(`${apiBase}/Auth/RequestToken`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ consumer_key: consumerKey, consumer_secret: consumerSecret })
  });

  const { token } = await tokenRes.json();

  // Get IPN list
  const ipnRes = await fetch(`${apiBase}/URLSetup/GetIpnList`, {
    headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
  });

  const ipnData = await ipnRes.json();
  return Response.json(ipnData);
}
