'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Package, Mail, Home } from 'lucide-react';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    // Clear cart after successful payment
    localStorage.removeItem('cart');
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '60px 40px',
        maxWidth: '600px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        {/* Success Icon */}
        <div style={{
          width: '100px',
          height: '100px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 30px',
          animation: 'scaleIn 0.5s ease'
        }}>
          <CheckCircle size={60} color="white" />
        </div>

        {/* Success Message */}
        <h1 style={{
          fontSize: '36px',
          fontWeight: '700',
          marginBottom: '20px',
          color: '#000'
        }}>
          Payment Successful! 🎉
        </h1>

        <p style={{
          fontSize: '18px',
          color: '#666',
          marginBottom: '40px',
          lineHeight: '1.6'
        }}>
          Thank you for your order! Your payment has been processed successfully.
        </p>

        {/* Order Details */}
        <div style={{
          background: '#f8f9fa',
          borderRadius: '12px',
          padding: '30px',
          marginBottom: '40px',
          textAlign: 'left'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '700',
            marginBottom: '20px',
            color: '#333'
          }}>
            What happens next?
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Mail size={20} color="white" />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '5px', color: '#000' }}>
                  1. Confirmation Email
                </h3>
                <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
                  You'll receive an order confirmation email shortly at your provided email address.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Package size={20} color="white" />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '5px', color: '#000' }}>
                  2. Order Processing
                </h3>
                <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
                  Your order is being sent to our production facility and will be ready in 2-5 business days.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Package size={20} color="white" />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '5px', color: '#000' }}>
                  3. Shipping & Tracking
                </h3>
                <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
                  Once shipped, you'll receive a tracking number to monitor your delivery.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Session ID */}
        {sessionId && (
          <div style={{
            background: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '30px'
          }}>
            <p style={{ fontSize: '14px', color: '#856404', margin: 0 }}>
              <strong>Order Reference:</strong> {sessionId.slice(-12)}
            </p>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <Link
            href="/"
            style={{
              padding: '18px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'all 0.3s'
            }}
          >
            <Home size={20} />
            Continue Shopping
          </Link>

          <Link
            href="/contact"
            style={{
              padding: '16px',
              background: 'white',
              color: '#667eea',
              textDecoration: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              border: '2px solid #667eea',
              transition: 'all 0.3s'
            }}
          >
            Contact Support
          </Link>
        </div>

        {/* Footer Note */}
        <p style={{
          fontSize: '13px',
          color: '#999',
          marginTop: '30px',
          lineHeight: '1.6'
        }}>
          Questions about your order? Contact us at<br />
          <strong style={{ color: '#667eea' }}>rockworldstore@outlook.com</strong>
        </p>
      </div>

      <style jsx>{`
        @keyframes scaleIn {
          from {
            transform: scale(0);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
