'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function OrderPage() {
  const router = useRouter();

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa' }}>
      {/* Header */}
      <header style={{
        background: 'white',
        borderBottom: '1px solid #e0e0e0',
        padding: '25px 0',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <img src="/logo.png" alt="ROCKWORLD" style={{ width: '50px', height: '50px', objectFit: 'contain' }} />
            <h1 style={{
              fontSize: '32px',
              fontFamily: '"Archivo", sans-serif',
              fontWeight: '700',
              letterSpacing: '3px',
              color: '#000000',
              margin: 0
            }}>
              ROCKWORLD
            </h1>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, #1a2332 0%, #2c3e50 100%)',
        color: 'white',
        padding: '120px 40px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.05) 0%, transparent 50%)',
          pointerEvents: 'none'
        }}/>
        
        <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <h1 style={{
            fontSize: '72px',
            fontFamily: '"Archivo", sans-serif',
            fontWeight: '700',
            marginBottom: '24px',
            letterSpacing: '2px'
          }}>
            Ready to Order?
          </h1>
          <p style={{
            fontSize: '24px',
            lineHeight: '1.8',
            opacity: 0.95,
            fontWeight: '300',
            marginBottom: '50px'
          }}>
            Browse our exclusive collection and find your perfect product
          </p>
          
          <button
            onClick={() => router.push('/')}
            style={{
              padding: '20px 50px',
              background: 'white',
              color: '#1a2332',
              border: 'none',
              borderRadius: '8px',
              fontSize: '18px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.3s',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              boxShadow: '0 8px 30px rgba(0,0,0,0.2)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.2)';
            }}
          >
            Shop Now
          </button>
        </div>
      </section>

      {/* Features */}
      <section style={{
        maxWidth: '1200px',
        margin: '80px auto',
        padding: '0 40px'
      }}>
        <h2 style={{
          fontSize: '48px',
          fontWeight: '700',
          textAlign: 'center',
          marginBottom: '60px',
          color: '#000'
        }}>
          Why Order From Us?
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '40px'
        }}>
          {[
            {
              title: 'Premium Quality',
              desc: 'Every product is crafted with the highest quality materials and attention to detail',
              icon: '⭐'
            },
            {
              title: 'Fast Delivery',
              desc: 'Quick production and worldwide shipping to get your order to you ASAP',
              icon: '🚀'
            },
            {
              title: 'Satisfaction Guaranteed',
              desc: 'Love it or your money back. We stand behind every product we make',
              icon: '✓'
            },
            {
              title: 'Custom Designs',
              desc: 'Unique designs you won\'t find anywhere else, made just for you',
              icon: '🎨'
            },
            {
              title: 'Secure Checkout',
              desc: 'Safe and secure payment processing with industry-standard encryption',
              icon: '🔒'
            },
            {
              title: '24/7 Support',
              desc: 'Our customer service team is always here to help with any questions',
              icon: '💬'
            }
          ].map((feature) => (
            <div
              key={feature.title}
              style={{
                background: 'white',
                padding: '40px 30px',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                textAlign: 'center',
                transition: 'all 0.3s',
                cursor: 'default'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
              }}
            >
              <div style={{
                fontSize: '48px',
                marginBottom: '20px'
              }}>
                {feature.icon}
              </div>
              <h3 style={{
                fontSize: '22px',
                fontWeight: '700',
                marginBottom: '15px',
                color: '#000'
              }}>
                {feature.title}
              </h3>
              <p style={{
                fontSize: '15px',
                lineHeight: '1.6',
                color: '#666'
              }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
        padding: '100px 40px',
        textAlign: 'center',
        color: 'white',
        marginTop: '80px'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '48px',
            fontWeight: '700',
            marginBottom: '30px',
            letterSpacing: '1px'
          }}>
            Start Shopping Today
          </h2>
          <p style={{
            fontSize: '20px',
            lineHeight: '1.8',
            marginBottom: '50px',
            opacity: 0.9
          }}>
            Join thousands of satisfied customers who trust ROCKWORLD for premium quality products
          </p>
          <button
            onClick={() => router.push('/')}
            style={{
              padding: '18px 48px',
              background: 'white',
              color: '#000',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.3s',
              letterSpacing: '1px',
              textTransform: 'uppercase'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(255,255,255,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Browse Products
          </button>
        </div>
      </section>
    </div>
  );
}
