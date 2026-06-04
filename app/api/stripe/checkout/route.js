import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

export async function POST(request) {
  try {
    const { items, customerEmail, shippingAddress } = await request.json();

    if (!items || items.length === 0) {
      return Response.json({ error: 'Cart is empty' }, { status: 400 });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return Response.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    // Format line items for Stripe
    const lineItems = items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: `${item.name} - ${item.variant}`,
          images: item.image ? [item.image] : []
        },
        unit_amount: Math.round(item.price * 100) // Convert to cents
      },
      quantity: item.quantity
    }));

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      customer_email: customerEmail,
      success_url: `${request.headers.get('origin')}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get('origin')}/`,
      shipping_options: shippingAddress ? [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 0, // Free shipping for now
              currency: 'usd'
            },
            display_name: 'Standard Shipping'
          }
        }
      ] : [],
      shipping_address_collection: shippingAddress ? {
        allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'CH', 'AT', 'SE', 'NO', 'DK', 'FI', 'IE', 'PL', 'CZ', 'PT', 'GR', 'JP', 'CN', 'IN', 'SG', 'MY', 'TH', 'PH', 'ID', 'VN', 'NZ', 'MX', 'BR', 'AR', 'CL', 'CO', 'AE', 'SA', 'IL', 'TR', 'EG', 'ZM', 'ZA', 'BW', 'NA', 'MW']
      } : undefined
    });

    return Response.json({
      sessionId: session.id,
      url: session.url,
      success: true
    });

  } catch (error) {
    console.error('Stripe checkout error:', error);
    
    return Response.json({
      error: error instanceof Error ? error.message : 'Failed to create checkout session',
      success: false
    }, { status: 500 });
  }
}
