import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiKey = process.env.PRINTFUL_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'PRINTFUL_API_KEY is not configured', products: [] },
        { status: 500 }
      );
    }

    const response = await fetch('https://api.printful.com/products', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Printful API error:', errorData);
      return NextResponse.json(
        { error: `Printful API error: ${response.statusText}`, products: [] },
        { status: response.status }
      );
    }

    const data = await response.json();
    const products = data.result || data.products || [];

    return NextResponse.json({ products });

  } catch (error) {
    console.error('Error fetching Printful products:', error);
    return NextResponse.json(
      { error: error.message, products: [] },
      { status: 500 }
    );
  }
}
