import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export async function POST(request) {
  try {
    const { items, customerEmail, shippingAddress } = await request.json();

    // Create line items for Stripe
    const lineItems = items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.product.name,
          description: item.variant.name,
          images: [item.product.thumbnail_url],
        },
        unit_amount: Math.round(parseFloat(item.variant.retail_price) * 100), // Convert to cents
      },
      quantity: item.quantity,
    }));

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_URL || request.headers.get('origin')}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL || request.headers.get('origin')}/?canceled=true`,
      customer_email: customerEmail,
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU', 'ZM', 'ZA'], // Add more countries as needed
      },
      metadata: {
        cartItems: JSON.stringify(items.map(item => ({
          productId: item.product.id,
          variantId: item.variant.id,
          quantity: item.quantity
        }))),
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
