'use client';

import Link from 'next/link';

export default function AboutPage() {
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
          <Link href="/" style={{
            padding: '12px 28px',
            background: '#000',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: '600',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            transition: 'all 0.3s'
          }}>
            Back to Shop
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #1a2332 0%, #2c3e50 100%)',
        color: 'white',
        padding: '120px 40px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h1 style={{
            fontSize: '64px',
            fontFamily: '"Archivo", sans-serif',
            fontWeight: '700',
            marginBottom: '24px',
            letterSpacing: '2px'
          }}>
            About ROCKWORLD
          </h1>
          <p style={{
            fontSize: '20px',
            lineHeight: '1.8',
            opacity: 0.95,
            fontWeight: '300'
          }}>
            Crafting premium print-on-demand products with passion and precision
          </p>
        </div>
      </section>

      {/* Content */}
      <section style={{
        maxWidth: '1200px',
        margin: '80px auto',
        padding: '0 40px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '40px',
          marginBottom: '80px'
        }}>
          <div style={{
            background: 'white',
            padding: '40px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
          }}>
            <h3 style={{
              fontSize: '24px',
              fontWeight: '700',
              marginBottom: '20px',
              color: '#000'
            }}>
              Our Mission
            </h3>
            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#666'
            }}>
              To deliver exceptional quality products that combine innovative design with sustainable practices, making premium merchandise accessible to everyone.
            </p>
          </div>

          <div style={{
            background: 'white',
            padding: '40px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
          }}>
            <h3 style={{
              fontSize: '24px',
              fontWeight: '700',
              marginBottom: '20px',
              color: '#000'
            }}>
              Our Values
            </h3>
            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#666'
            }}>
              Quality craftsmanship, customer satisfaction, and environmental responsibility guide everything we do. We believe in creating products that last.
            </p>
          </div>

          <div style={{
            background: 'white',
            padding: '40px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
          }}>
            <h3 style={{
              fontSize: '24px',
              fontWeight: '700',
              marginBottom: '20px',
              color: '#000'
            }}>
              Our Promise
            </h3>
            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#666'
            }}>
              Every product is made to order, ensuring freshness and reducing waste. We stand behind our quality with a satisfaction guarantee.
            </p>
          </div>
        </div>

        <div style={{
          background: 'white',
          padding: '60px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontSize: '36px',
            fontWeight: '700',
            marginBottom: '30px',
            color: '#000'
          }}>
            Why Choose ROCKWORLD?
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '40px',
            marginTop: '40px'
          }}>
            {[
              { title: 'Premium Quality', desc: 'High-grade materials' },
              { title: 'Fast Shipping', desc: 'Worldwide delivery' },
              { title: 'Custom Designs', desc: 'Unique products' },
              { title: '24/7 Support', desc: 'Always here to help' }
            ].map((item) => (
              <div key={item.title}>
                <h4 style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  marginBottom: '10px',
                  color: '#000'
                }}>
                  {item.title}
                </h4>
                <p style={{
                  fontSize: '14px',
                  color: '#666'
                }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
