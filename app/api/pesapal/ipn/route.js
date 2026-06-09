export async function GET(request) {
  // Pesapal pings this URL to confirm payment status
  const { searchParams } = new URL(request.url);
  const orderTrackingId = searchParams.get('OrderTrackingId');
  const orderMerchantReference = searchParams.get('OrderMerchantReference');

  console.log('IPN received:', { orderTrackingId, orderMerchantReference });

  // TODO: verify payment status with Pesapal and update your order DB

  return Response.json({ orderNotificationType: 'IPNCHANGE', orderTrackingId, orderMerchantReference });
}
