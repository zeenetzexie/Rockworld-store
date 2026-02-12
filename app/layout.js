import './globals.css'

export const metadata = {
  title: 'ROCKWORLD Online Store - Premium Collections',
  description: 'Curated premium designs, crafted with precision and delivered to your doorstep',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
      </head>
      <body>{children}</body>
    </html>
  )
}

import Link from "next/link";

export default function ModernFooter() {
  return (
    <footer className="modern-footer">
      <div className="footer-cta">
        <h2>Stay in the Loop!</h2>
        <p>Subscribe for launch news, drops & exclusive offers</p>
        <form className="newsletter-form">
          <input
            type="email"
            placeholder="Your email address"
            required
          />
          <button type="submit">Subscribe</button>
        </form>
      </div>

      <div className="footer-links">
        <div className="link-group">
          <h4>Quick Links</h4>
          <Link href="/about">About Us</Link>
          <Link href="/contact">Contact Us</Link>
          <Link href="/order">Order Now</Link>
        </div>

        <div className="link-group">
          <h4>Connect</h4>
          <div className="social-icons">
            <a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer">Facebook</a>
            <a href="https://tiktok.com" target="_blank" rel="noreferrer">TikTok</a>
          </div>
        </div>

        <div className="link-group">
          <h4>Legal</h4>
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms of Service</Link>
        </div>
      </div>

      <p className="footer-copy">
        © {new Date().getFullYear()} ROCKWORLD — All rights reserved.
      </p>

      <style jsx>{`
        .modern-footer {
          background: #111;
          color: #eee;
          padding: 60px 20px;
          text-align: center;
        }
        
        .footer-cta h2 {
          font-size: 24px;
          color: #f97316;
          margin-bottom: 8px;
        }
        .footer-cta p {
          opacity: 0.8;
          margin-bottom: 15px;
        }
        .newsletter-form {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-bottom: 40px;
        }
        .newsletter-form input {
          padding: 10px 12px;
          border-radius: 6px;
          border: none;
          outline: none;
          width: 220px;
        }
        .newsletter-form button {
          background: #f97316;
          color: #fff;
          border: none;
          padding: 10px 18px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
        }
        .footer-links {
          display: flex;
          justify-content: center;
          gap: 60px;
          margin-bottom: 30px;
          flex-wrap: wrap;
        }
        .link-group h4 {
          margin-bottom: 10px;
          font-size: 18px;
          font-weight: 600;
        }
        .link-group a {
          color: #ddd;
          display: block;
          margin: 6px 0;
          text-decoration: none;
          font-size: 14px;
        }
        .link-group .social-icons a {
          margin-right: 12px;
          font-size: 18px;
        }
        .footer-copy {
          opacity: 0.6;
          font-size: 13px;
        }
      `}</style>
    </footer>
  );
}
