import './globals.css'

export const metadata = {
  title: 'ROCKWORLD Online Store - Premium Collections',
  description: 'Curated premium designs, crafted with precision and delivered to your doorstep',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
