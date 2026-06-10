'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle, Home, Package } from 'lucide-react';

export default function SuccessPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [printfulStatus, setPrintfulStatus] = useState('pending'); // pending | success | error

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    const orderParam = params.get('order');

    // Use the Pesapal reference as order number, or generate one
    setOrderNumber(ref || `ORD-${Date.now()}`);

    // Clear cart
    localStorage.removeItem('cart');

    // If we have order data, send to Printful
    if (orderParam) {
      try {
        const orderData = JSON.parse(decodeURIComponent(orderParam));
        sendToPrintful({ ...orderData, reference: ref });
      } catch (e) {
        console.error('Failed to parse order data:', e);
      }
    }
  }, []);

  async function sendToPrintful(orderData) {
    try {
      const res = await fetch('/api/printful/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      const data = await res.json();
      if (data.success) {
        setPrintfulStatus('success');
        console.log('Printful order created:', data.order);
      } else {
        setPrintfulStatus('error');
        console.error('Printful failed:', data.error);
      }
    } catch (e) {
      setPrintfulStatus('error');
      console.error('Printful request failed:', e);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Header */}
      <header style={{
        background: 'white',
        borderBottom: '1px solid #e0e0e0',
        padding: '20px 0',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ fontSize: '28px', fontWeight: '800', letterSpacing: '2px' }}>
            🎨 ROCKWORLD
          </div>
        </div>
      </header>

      {/* Success Content */}
      <div style={{ maxWidth: '600px', margin: '60px auto', padding: '0 20px' }}>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '60px 40px',
          textAlign: 'center',
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
        }}>
          {/* Success Icon */}
          <div style={{ marginBottom: '30px' }}>
            <CheckCircle size={80} color="#22c55e" strokeWidth={1.5} style={{ margin: '0 auto' }} />
          </div>

          <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '15px', color: '#1a1a1a' }}>
            Order Confirmed! 🎉
          </h1>

          <p style={{ fontSize: '16px', color: '#666', marginBottom: '30px', lineHeight: '1.6' }}>
            Thank you for your purchase! Your order has been successfully placed and payment has been received.
          </p>

          {/* Order Number */}
          <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
            <p style={{ fontSize: '12px', color: '#999', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Order Reference
            </p>
            <p style={{ fontSize: '20px', fontWeight: '700', margin: 0, fontFamily: 'monospace', color: '#1a1a1a' }}>
              {orderNumber}
            </p>
          </div>

          {/* Printful status banner */}
          {printfulStatus === 'success' && (
            <div style={{
              background: '#f0fdf4', border: '1px solid #bbf7d0',
              padding: '16px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', color: '#15803d'
            }}>
              ✓ Your order has been sent to production and will be printed and shipped soon!
            </div>
          )}
          {printfulStatus === 'error' && (
            <div style={{
              background: '#fff7ed', border: '1px solid #fed7aa',
              padding: '16px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', color: '#c2410c'
            }}>
              ⚠️ Payment received but there was an issue sending to production. Our team will process your order manually — please quote your reference number.
            </div>
          )}

          {/* Details */}
          <div style={{
            background: '#f0fdf4', border: '1px solid #bbf7d0',
            padding: '20px', borderRadius: '8px', marginBottom: '30px', textAlign: 'left'
          }}>
            <p style={{ fontSize: '14px', color: '#15803d', margin: 0, lineHeight: '1.8' }}>
              ✓ Payment processed successfully<br />
              ✓ Order confirmation email sent<br />
              ✓ Your items will be printed and shipped soon<br />
              ✓ Track your order via email updates
            </p>
          </div>

          {/* What's Next */}
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1a1a1a', marginBottom: '12px' }}>
              What's Next?
            </h3>
            <ol style={{ fontSize: '14px', color: '#666', textAlign: 'left', lineHeight: '1.8', paddingLeft: '20px' }}>
              <li>We'll confirm your order within 24 hours</li>
              <li>Your item will be printed with premium quality</li>
              <li>Shipped to your address with tracking info</li>
              <li>You'll receive a tracking number via email</li>
            </ol>
          </div>

          {/* Contact Info */}
          <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '30px', fontSize: '14px', color: '#666' }}>
            <p style={{ margin: '0 0 10px' }}><strong>Need help?</strong></p>
            <p style={{ margin: '0 0 8px' }}>📧 Email: rockworldstore@outlook.com</p>
            <p style={{ margin: 0 }}>📱 WhatsApp: +260 975 473 982</p>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
<a href="/" style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              gap: '8px', padding: '14px 28px', background: '#1a1a1a', color: 'white',
              textDecoration: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '16px'
            }}>
              <Home size={18} /> Back to Shop
            </a>
            <a href="/" style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              gap: '8px', padding: '14px 28px', background: 'transparent', color: '#1a1a1a',
              textDecoration: 'none', borderRadius: '8px', fontWeight: '700',
              border: '2px solid #1a1a1a', fontSize: '16px'
            }}>
              <Package size={18} /> Continue Shopping
            </a>
          </div>
        </div>
      </div>

      <footer style={{ background: '#1a1a2e', color: 'white', padding: '60px 20px 30px', marginTop: '60px', textAlign: 'center' }}>
        <p style={{ margin: 0, opacity: 0.8 }}>© {new Date().getFullYear()} ROCKWORLD. All rights reserved.</p>
      </footer>
    </div>
  );
}
