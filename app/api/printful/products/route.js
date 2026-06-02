export async function GET() {
  try {
    const apiKey = process.env.PRINTFUL_API_KEY;
    const storeId = '17704838'; // Your store ID

    if (!apiKey) {
      return Response.json(
        { error: 'API key missing', products: [] },
        { status: 500 }
      );
    }

    // Use store-specific endpoint to get YOUR products
    const res = await fetch(`https://api.printful.com/store/${storeId}/products`, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });

    if (!res.ok) {
      return Response.json(
        { error: `Printful error: ${res.statusText}`, products: [] },
        { status: res.status }
      );
    }

    const data = await res.json();
    const products = data.result || [];

    console.log(`Fetched ${products.length} products from store ${storeId}`);

    return Response.json({ products });

  } catch (error) {
    console.error('Error:', error);
    return Response.json(
      { error: error.message, products: [] },
      { status: 500 }
    );
  }
}
