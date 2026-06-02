export async function GET() {
  try {
    const apiKey = process.env.PRINTFUL_API_KEY;

    if (!apiKey) {
      return Response.json(
        { error: 'API key missing', products: [] },
        { status: 500 }
      );
    }

    const res = await fetch('https://api.printful.com/products', {
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

    return Response.json({ products });

  } catch (error) {
    console.error('Error:', error);
    return Response.json(
      { error: error.message, products: [] },
      { status: 500 }
    );
  }
}
