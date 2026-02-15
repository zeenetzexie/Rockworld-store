import './globals.css'

export const metadata = {
  title: 'ROCKWORLD Online Store - Premium Collections',
  description: 'Curated premium designs, crafted with precision and delivered to your doorstep',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <link rel="icon" href="/favicon.png" type="image/png" />
      </head>
      <body>{children}</body>
    </html>
  )
}
