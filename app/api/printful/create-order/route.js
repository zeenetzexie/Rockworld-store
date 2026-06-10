export async function POST(request) {
  try {
    const { cartItems, shippingAddress, email, firstName, lastName, reference } = await request.json();

    const orderRes = await fetch('https://api.printful.com/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PRINTFUL_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        external_id: reference,
        shipping: 'STANDARD',
        recipient: {
          name: `${firstName} ${lastName}`,
          email: email,
          address1: shippingAddress.address,
          city: shippingAddress.city,
          country_code: shippingAddress.countryCode,
          zip: shippingAddress.zip
        },
        items: cartItems.map(item => ({
          sync_variant_id: item.variantId,
          quantity: item.quantity
        }))
      })
    });

    const data = await orderRes.json();
    console.log('Printful order:', data);
    return Response.json({ success: true, order: data });

  } catch (error) {
    console.error('Printful error:', error);
    return Response.json({ error: error.message, success: false }, { status: 500 });
  }
}
