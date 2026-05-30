import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const { items } = await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      );
    }

    // Build line items for Stripe
    const lineItems = items.map(item => {
      const price = parseFloat(item.price || item.variant?.retail_price || 0);
      const quantity = parseInt(item.quantity) || 1;

      let name = 'Product';
      if (item.product?.name) {
        name = item.product.name;
      } else if (item.name) {
        name = item.name;
      }

      if (item.variant?.name) {
        name = `${name} - ${item.variant.name}`;
      }

      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: name.substring(0, 250),
          },
          unit_amount: Math.round(price * 100), // Convert to cents
        },
        quantity: quantity,
      };
    });

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${request.headers.get('origin')}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get('origin')}/?canceled=true`,
      billing_address_collection: 'required',
    });

    console.log('Stripe session created:', session.id);
    return NextResponse.json({ sessionId: session.id });

  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
