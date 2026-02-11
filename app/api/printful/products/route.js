import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.PRINTFUL_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Printful API key not configured' },
      { status: 500 }
    );
  }

  try {
    // Fetch all products
    const productsResponse = await fetch('https://api.printful.com/store/products', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!productsResponse.ok) {
      throw new Error('Failed to fetch products');
    }

    const productsData = await productsResponse.json();

    // Fetch detailed info for each product including variants
    const detailedProducts = await Promise.all(
      productsData.result.map(async (product) => {
        const detailResponse = await fetch(
          `https://api.printful.com/store/products/${product.id}`,
          {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
          }
        );
        const detailData = await detailResponse.json();
        return detailData.result;
      })
    );

    return NextResponse.json({ products: detailedProducts });
  } catch (error) {
    console.error('Printful API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products from Printful' },
      { status: 500 }
    );
  }
}
