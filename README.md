# Printful Print-on-Demand Store

A modern, full-featured e-commerce store built with Next.js 14 and integrated with Printful's API. This store automatically syncs your Printful products and processes orders directly through the Printful platform.

## Features

- ✅ Automatic product sync from Printful
- ✅ Shopping cart with quantity management
- ✅ Checkout with order creation
- ✅ Responsive design
- ✅ Server-side API integration (secure)
- ✅ Modern, editorial UI design
- ✅ Real-time inventory from Printful

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Printful account with products set up
- Printful API key

### Installation

1. **Extract the files** to your desired location

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   
   Create a `.env.local` file in the root directory:
   ```bash
   PRINTFUL_API_KEY=your_printful_api_key_here
   ```

   To get your Printful API key:
   - Log into your Printful account
   - Go to Settings → API
   - Generate a **Private Access Token**
   - Required scopes:
     - View store products ✓
     - View and manage orders of the authorized store ✓
     - View store files ✓
   - Access level: **A single store**
   - Expiry: **Never**

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub

2. Go to [vercel.com](https://vercel.com) and import your repository

3. Add your environment variable:
   - Key: `PRINTFUL_API_KEY`
   - Value: Your Printful API key

4. Deploy!

### Deploy to Other Platforms

You can deploy to any platform that supports Next.js:
- Netlify
- Railway
- Render
- Your own server with Node.js

Make sure to:
- Set the `PRINTFUL_API_KEY` environment variable
- Use Node.js 18+
- Run `npm run build` for production builds

## Project Structure

```
printful-nextjs-store/
├── app/
│   ├── api/
│   │   └── printful/
│   │       ├── products/
│   │       │   └── route.js       # Products API endpoint
│   │       └── orders/
│   │           └── route.js       # Orders API endpoint
│   ├── page.js                    # Main store page
│   ├── layout.js                  # Root layout
│   └── globals.css                # Global styles
├── package.json
├── next.config.js
└── .env.local                     # Your API key (create this)
```

## How It Works

1. **Product Fetching**: The store fetches all products from your Printful store via the `/api/printful/products` endpoint
2. **Shopping Cart**: Users can add products with different variants to their cart
3. **Checkout**: Order information is collected from the customer
4. **Order Creation**: Orders are sent to Printful via the `/api/printful/orders` endpoint
5. **Fulfillment**: Printful receives the order and handles printing, packing, and shipping

## Security Notes

- Your Printful API key is stored securely in environment variables
- API calls are made server-side only (Next.js API routes)
- The API key is never exposed to the browser
- For production, always use HTTPS

## Customization

### Change Store Name
Edit `app/page.js` and modify the header text

### Modify Styling
Edit `app/globals.css` or inline styles in `app/page.js`

### Add Payment Processing
Currently, this store creates orders directly in Printful. To add payment processing:
1. Integrate Stripe, PayPal, or another payment provider
2. Process payment before creating the Printful order
3. Only create the order after successful payment

## Troubleshooting

**"Failed to fetch products"**
- Check that your `.env.local` file exists and has the correct API key
- Verify your API key has the correct permissions
- Make sure you're using a Private Access Token (not Public App)

**Orders not appearing in Printful**
- Check your API key has "View and manage orders" permission
- Verify the customer's shipping address is complete
- Check the Printful dashboard for error messages

**Port 3000 already in use**
- Run on a different port: `npm run dev -- -p 3001`

## Support

For Printful API questions, visit: https://developers.printful.com
For Next.js questions, visit: https://nextjs.org/docs

## License

MIT
