import { NextResponse } from 'next/server';

export async function POST(request) {
  const apiKey = process.env.PRINTFUL_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Printful API key not configured' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { recipient, items } = body;

    // Create order in Printful
    const orderData = {
      recipient,
      items,
    };

    const response = await fetch('https://api.printful.com/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to create order');
    }

    const result = await response.json();
    return NextResponse.json({ order: result.result });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}
