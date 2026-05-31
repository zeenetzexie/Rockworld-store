export async function GET() {
  try {
    const apiKey = process.env.PRINTFUL_API_KEY;

    if (!apiKey) {
      return Response.json({ error: 'Missing API key', products: [] }, { status: 500 });
    }

    const response = await fetch('https://api.printful.com/products', {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });

    const data = await response.json();
    const products = data.result || [];

    return Response.json({ products });
  } catch (error) {
    return Response.json({ error: error.message, products: [] }, { status: 500 });
  }
}
