export async function GET() {
  return Response.json({
    keyExists: !!process.env.PESAPAL_CONSUMER_KEY,
    secretExists: !!process.env.PESAPAL_CONSUMER_SECRET,
    keyPreview: process.env.PESAPAL_CONSUMER_KEY?.slice(0, 6) + '...',
  });
}
