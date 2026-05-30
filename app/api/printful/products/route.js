import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const apiKey = process.env.PRINTFUL_API_KEY;

    if (!apiKey) {
      console.error('PRINTFUL_API_KEY is not set');
      return NextResponse.json(
        { error: 'PRINTFUL_API_KEY is not configured' },
        { status: 500 }
      );
    }

    console.log('Fetching products from Printful...');

    const response = await fetch('https://api.printful.com/products', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Printful API error:', response.status, response.statusText);
      return NextResponse.json(
        { error: `Printful API error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Printful response:', data);

    // Extract products from the response
    const products = data.result || data.data || [];

    return NextResponse.json(products);

  } catch (error) {
    console.error('Error fetching Printful products:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
