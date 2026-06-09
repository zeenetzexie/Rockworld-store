'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, X, Package, CreditCard, Loader } from 'lucide-react';

// Initialize Stripe only if key exists
let stripePromise = null;
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  import('@stripe/stripe-js').then(({ loadStripe }) => {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
  });
}

export default function StorePage() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [showVariantModal, setShowVariantModal] = useState(false);
  
  // Checkout form state
  const [checkoutForm, setCheckoutForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'US'
  });

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Fetch products from our API route
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/printful/products');
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const data = await response.json();
      setProducts(data.products);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Add to cart
  const addToCart = (product, variant) => {
    const cartItem = {
      id: `${product.sync_product.id}-${variant.id}`,
      productId: product.sync_product.id,
      variantId: variant.id,
      name: product.sync_product.name,
      variant: variant.name,
      price: parseFloat(variant.retail_price),
      image: variant.files?.[0]?.preview_url || product.sync_product.thumbnail_url,
      quantity: 1
    };
    
    const existingItem = cart.find(item => item.id === cartItem.id);
    
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === cartItem.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, cartItem]);
    }
    
    setIsCartOpen(true);
  };

  // Update cart quantity
  const updateQuantity = (itemId, delta) => {
    setCart(cart.map(item => {
      if (item.id === itemId) {
        const newQuantity = item.quantity + delta;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
      }
      return item;
    }).filter(Boolean));
  };

  // Remove from cart
  const removeFromCart = (itemId) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  // Calculate total
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Handle Pesapal Checkout
  const handlePesapalCheckout = async (e) => {
    e.preventDefault();
    setOrderLoading(true);
    setError(null);

    try {
      // Validate form
      if (!checkoutForm.email || !checkoutForm.firstName || !checkoutForm.lastName) {
        setError('Please fill in all required fields (First Name, Last Name, Email)');
        setOrderLoading(false);
        return;
      }

      // Call Pesapal payment route
      const response = await fetch('/api/pesapal/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: cartTotal,
          currency: 'KES',
          email: checkoutForm.email,
          firstName: checkoutForm.firstName,
          lastName: checkoutForm.lastName,
          orderId: `order-${Date.now()}`
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Pesapal payment initialization failed');
      }

      // Redirect to Pesapal checkout
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        throw new Error('No checkout URL provided by Pesapal');
      }

    } catch (error) {
      setError(error.message || 'Pesapal payment error');
      setOrderLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <style>{`
        /* Mobile Responsive Styles */
        @media (max-width: 768px) {
          .header-container {
            padding: 0 20px !important;
          }
          .header-logo {
            width: 35px !important;
            height: 35px !important;
          }
          .header-title {
            font-size: 20px !important;
            letter-spacing: 2px !important;
          }
          .header-gap {
            gap: 12px !important;
          }
          .cart-button {
            padding: 10px 18px !important;
            font-size: 12px !important;
          }
          .hero-section {
            padding: 60px 20px !important;
          }
          .hero-title {
            font-size: 36px !important;
            line-height: 1.2 !important;
          }
          .hero-text {
            font-size: 16px !important;
          }
          .products-grid {
            padding: 60px 20px !important;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)) !important;
            gap: 30px !important;
          }
          .footer-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
          .footer-container {
            padding: 60px 20px 30px !important;
          }
        }
        
        @media (max-width: 480px) {
          .header-title {
            font-size: 18px !important;
            letter-spacing: 1.5px !important;
          }
          .hero-title {
            font-size: 28px !important;
          }
          .products-grid {
            grid-template-columns: 1fr !important;
          }
        }

        /* Modal Animations */
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
      
      {/* Header */}
      <header style={{
        background: 'white',
        borderBottom: '1px solid #e0e0e0',
        padding: '20px 0',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
      }}>
        <div className="header-container" style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div className="header-gap" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px'
          }}>
            <img 
              className="header-logo"
              src="/logo-header.png" 
              alt="ROCKWORLD Logo" 
              style={{
                width: '50px',
                height: '50px',
                objectFit: 'contain'
              }}
            />
            
            <svg className="header-title" width="300" height="60" viewBox="0 0 300 60" xmlns="http://www.w3.org/2000/svg" style={{maxWidth: '100%', height: 'auto'}}>
              <defs>
                <linearGradient id="textMetalGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{stopColor: '#4a4a4a', stopOpacity: 1}} />
                  <stop offset="25%" style={{stopColor: '#2a2a2a', stopOpacity: 1}} />
                  <stop offset="50%" style={{stopColor: '#1a1a1a', stopOpacity: 1}} />
                  <stop offset="75%" style={{stopColor: '#0a0a0a', stopOpacity: 1}} />
                  <stop offset="100%" style={{stopColor: '#000000', stopOpacity: 1}} />
                </linearGradient>
              </defs>
              
              <text 
                x="150" 
                y="40" 
                fontFamily="Archivo, sans-serif" 
                fontSize="36" 
                fontWeight="700" 
                letterSpacing="5"
                textAnchor="middle"
                fill="url(#textMetalGrad)"
                stroke="#000000"
                strokeWidth="0.8">
                ROCKWORLD
              </text>
            </svg>
          </div>
          
          <button
            className="cart-button"
            onClick={() => setIsCartOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '14px 28px',
              background: '#000000',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600',
              letterSpacing: '1px',
              transition: 'all 0.3s',
              position: 'relative',
              textTransform: 'uppercase'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#333';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#000000';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <ShoppingCart size={20} />
            Cart
            {cart.length > 0 && (
              <span className="cart-badge" style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                background: '#ff4444',
                color: 'white',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: '700'
              }}>
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section" style={{
        background: 'linear-gradient(135deg, #1a2332 0%, #2c3e50 100%)',
        color: 'white',
        padding: '100px 40px',
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
          background: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.05) 0%, transparent 50%)',
          pointerEvents: 'none'
        }} />
        <div style={{
          maxWidth: '900px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 1
        }}>
          <h2 className="hero-title" style={{
            fontSize: '64px',
            fontFamily: '"Archivo", sans-serif',
            fontWeight: '700',
            lineHeight: '1.2',
            marginBottom: '24px',
            letterSpacing: '2px',
            color: 'white'
          }}>
            Exclusive Collections
          </h2>
          <p className="hero-text" style={{
            fontSize: '20px',
            lineHeight: '1.8',
            opacity: 0.95,
            fontWeight: '300',
            letterSpacing: '0.5px',
            maxWidth: '700px',
            margin: '0 auto',
            color: 'white'
          }}>
            Curated premium designs, crafted with precision and delivered to your doorstep
          </p>
        </div>
      </section>

      {/* Products Grid */}
      <section className="products-grid" style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '80px 40px'
      }}>
        {loading && (
          <div style={{
            textAlign: 'center',
            padding: '60px',
            color: '#999'
          }}>
            <Loader size={40} style={{
              animation: 'spin 1s linear infinite',
              marginBottom: '20px'
            }} />
            <p>Loading products...</p>
          </div>
        )}

        {error && (
          <div style={{
            padding: '20px',
            background: '#fee',
            border: '1px solid #fcc',
            borderRadius: '8px',
            color: '#c00',
            textAlign: 'center',
            marginBottom: '40px'
          }}>
            <strong>Error:</strong> {error}
            <br />
            <small>Make sure your PRINTFUL_API_KEY is set in .env.local</small>
          </div>
        )}
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '40px'
        }}>
          {products.map((product, idx) => (
            <div
              key={product.sync_product.id}
              className="product-card"
              style={{
                background: 'white',
                borderRadius: '4px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: '1px solid #f0f0f0',
                animation: `fadeIn 0.5s ease ${idx * 0.1}s both`
              }}
            >
              <div 
                style={{
                  width: '100%',
                  paddingTop: '100%',
                  position: 'relative',
                  background: '#f5f5f5',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  setSelectedProduct(product);
                  setSelectedVariant(product.sync_variants[0]);
                  setShowVariantModal(true);
                }}
              >
                <img
                  src={product.sync_product.thumbnail_url}
                  alt={product.sync_product.name}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.3s'
                  }}
                />
              </div>
              
              <div style={{ padding: '28px' }}>
                <h3 style={{
                  fontSize: '22px',
                  fontWeight: '600',
                  marginBottom: '10px',
                  lineHeight: '1.3',
                  color: '#000000',
                  fontFamily: '"Archivo", sans-serif',
                  letterSpacing: '0.5px'
                }}>
                  {product.sync_product.name}
                </h3>
                
                <p style={{
                  color: '#666',
                  fontSize: '14px',
                  marginBottom: '24px',
                  lineHeight: '1.6',
                  letterSpacing: '0.3px'
                }}>
                  {product.sync_variants.length} variant{product.sync_variants.length !== 1 ? 's' : ''} available
                </p>
                
                <div style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#000',
                  marginBottom: '20px',
                  fontFamily: '"Archivo", sans-serif'
                }}>
                  ${Math.min(...product.sync_variants.map(v => parseFloat(v.retail_price))).toFixed(2)}
                  {product.sync_variants.length > 1 && 
                    ` - $${Math.max(...product.sync_variants.map(v => parseFloat(v.retail_price))).toFixed(2)}`
                  }
                </div>

                <button
                  onClick={() => {
                    setSelectedProduct(product);
                    setSelectedVariant(product.sync_variants[0]);
                    setShowVariantModal(true);
                  }}
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: '#000000',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '700',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    transition: 'all 0.3s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#333';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#000000';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <Package size={18} />
                  Select Options
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Variant Selection Modal */}
      {showVariantModal && selectedProduct && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          animation: 'fadeIn 0.3s ease'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            maxWidth: '900px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            animation: 'slideUp 0.3s ease'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 0
            }}>
              <div style={{
                background: '#f5f5f5',
                padding: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <img
                  src={selectedVariant?.files?.[0]?.preview_url || selectedProduct.sync_product.thumbnail_url}
                  alt={selectedProduct.sync_product.name}
                  style={{
                    width: '100%',
                    maxWidth: '400px',
                    height: 'auto',
                    objectFit: 'contain'
                  }}
                />
              </div>

              <div style={{ padding: '40px' }}>
                <button
                  onClick={() => setShowVariantModal(false)}
                  style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    background: 'white',
                    border: '1px solid #e0e0e0',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f5f5f5';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white';
                  }}
                >
                  <X size={20} />
                </button>

                <h2 style={{
                  fontSize: '28px',
                  fontWeight: '700',
                  marginBottom: '10px',
                  fontFamily: '"Archivo", sans-serif',
                  color: '#000'
                }}>
                  {selectedProduct.sync_product.name}
                </h2>

                <div style={{
                  fontSize: '32px',
                  fontWeight: '700',
                  color: '#000',
                  marginBottom: '30px',
                  fontFamily: '"Archivo", sans-serif'
                }}>
                  ${selectedVariant?.retail_price}
                </div>

                <div style={{ marginBottom: '25px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '700',
                    marginBottom: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    color: '#333'
                  }}>
                    Select Size:
                  </label>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                    gap: '10px'
                  }}>
                    {(() => {
                      const sizes = {};
                      selectedProduct.sync_variants.forEach(variant => {
                        const size = variant.name.split(' - ').pop();
                        if (!sizes[size]) {
                          sizes[size] = variant;
                        }
                      });

                      return Object.entries(sizes).map(([size, variant]) => (
                        <button
                          key={variant.id}
                          onClick={() => setSelectedVariant(variant)}
                          style={{
                            padding: '14px 20px',
                            background: selectedVariant?.id === variant.id ? '#000' : 'white',
                            color: selectedVariant?.id === variant.id ? 'white' : '#000',
                            border: selectedVariant?.id === variant.id ? '2px solid #000' : '2px solid #e0e0e0',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '700',
                            textTransform: 'uppercase',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            if (selectedVariant?.id !== variant.id) {
                              e.currentTarget.style.borderColor = '#000';
                              e.currentTarget.style.transform = 'scale(1.05)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (selectedVariant?.id !== variant.id) {
                              e.currentTarget.style.borderColor = '#e0e0e0';
                              e.currentTarget.style.transform = 'scale(1)';
                            }
                          }}
                        >
                          {size}
                        </button>
                      ));
                    })()}
                  </div>
                </div>

                <div style={{
                  padding: '20px',
                  background: '#f8f8f8',
                  borderRadius: '8px',
                  marginBottom: '25px'
                }}>
                  <div style={{
                    fontSize: '14px',
                    color: '#666',
                    lineHeight: '1.8'
                  }}>
                    <strong style={{ color: '#000' }}>Selected:</strong> {selectedVariant?.name}
                    <br />
                    <strong style={{ color: '#000' }}>SKU:</strong> {selectedVariant?.sku}
                  </div>
                </div>

                <button
                  onClick={() => {
                    addToCart(selectedProduct, selectedVariant);
                    setShowVariantModal(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '18px',
                    background: '#000',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '700',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    transition: 'all 0.3s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#333';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#000';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <ShoppingCart size={20} />
                  Add to Cart - ${selectedVariant?.retail_price}
                </button>

                <div style={{
                  marginTop: '30px',
                  padding: '20px',
                  background: '#f8f8f8',
                  borderRadius: '8px'
                }}>
                  <h4 style={{
                    fontSize: '14px',
                    fontWeight: '700',
                    marginBottom: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>
                    Product Details
                  </h4>
                  <ul style={{
                    fontSize: '14px',
                    lineHeight: '1.8',
                    color: '#666',
                    margin: 0,
                    paddingLeft: '20px'
                  }}>
                    <li>Premium quality materials</li>
                    <li>Worldwide shipping available</li>
                    <li>Made to order</li>
                    <li>100% satisfaction guarantee</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cart Sidebar */}
      {isCartOpen && (
        <>
          <div
            onClick={() => setIsCartOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 999,
              animation: 'fadeIn 0.3s ease'
            }}
          />
          
          <div style={{
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            maxWidth: '500px',
            background: 'white',
            zIndex: 1000,
            animation: 'slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '-4px 0 20px rgba(0,0,0,0.15)'
          }}>
            <div style={{
              padding: '30px',
              borderBottom: '1px solid #e0e0e0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '700'
              }}>
                Your Cart
              </h2>
              <button
                onClick={() => setIsCartOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px'
                }}
              >
                <X size={24} />
              </button>
            </div>
            
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '30px'
            }}>
              {cart.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '60px 20px',
                  color: '#999'
                }}>
                  <ShoppingCart size={48} style={{ marginBottom: '20px', opacity: 0.3 }} />
                  <p>Your cart is empty</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        gap: '16px',
                        padding: '16px',
                        background: '#f8f9fa',
                        borderRadius: '12px'
                      }}
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{
                          width: '80px',
                          height: '80px',
                          objectFit: 'cover',
                          borderRadius: '8px'
                        }}
                      />
                      
                      <div style={{ flex: 1 }}>
                        <h4 style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          marginBottom: '4px'
                        }}>
                          {item.name}
                        </h4>
                        <p style={{
                          fontSize: '13px',
                          color: '#666',
                          marginBottom: '12px'
                        }}>
                          {item.variant}
                        </p>
                        
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: 'white',
                            borderRadius: '8px',
                            padding: '4px'
                          }}>
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              style={{
                                width: '28px',
                                height: '28px',
                                border: 'none',
                                background: '#f0f0f0',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <Minus size={14} />
                            </button>
                            <span style={{
                              minWidth: '30px',
                              textAlign: 'center',
                              fontWeight: '600'
                            }}>
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              style={{
                                width: '28px',
                                height: '28px',
                                border: 'none',
                                background: '#f0f0f0',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          
                          <span style={{
                            fontSize: '18px',
                            fontWeight: '700'
                          }}>
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => removeFromCart(item.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                          opacity: 0.5,
                          transition: 'opacity 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '0.5'}
                      >
                        <X size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {cart.length > 0 && (
              <div style={{
                padding: '30px',
                borderTop: '1px solid #e0e0e0',
                background: '#f8f9fa'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '20px',
                  fontSize: '18px'
                }}>
                  <span style={{ fontWeight: '600' }}>Total</span>
                  <span style={{ fontWeight: '700', fontSize: '24px' }}>
                    ${cartTotal.toFixed(2)}
                  </span>
                </div>
                
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsCheckoutOpen(true);
                  }}
                  style={{
                    width: '100%',
                    padding: '18px',
                    background: '#000000',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    letterSpacing: '1px',
                    textTransform: 'uppercase'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#333';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#000000';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <CreditCard size={20} />
                  Proceed to Checkout
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Checkout Modal - PESAPAL ONLY */}
      {isCheckoutOpen && (
        <>
          <div
            onClick={() => !orderLoading && setIsCheckoutOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.7)',
              zIndex: 1001,
              animation: 'fadeIn 0.3s ease'
            }}
          />
          
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '90vh',
            background: 'white',
            borderRadius: '16px',
            zIndex: 1002,
            animation: 'fadeIn 0.3s ease',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              padding: '30px',
              borderBottom: '1px solid #e0e0e0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '700'
              }}>
                Checkout
              </h2>
              {!orderLoading && (
                <button
                  onClick={() => setIsCheckoutOpen(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '8px'
                  }}
                >
                  <X size={24} />
                </button>
              )}
            </div>
            
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '30px'
            }}>
              <form onSubmit={handlePesapalCheckout}>
                <div style={{
                  display: 'grid',
                  gap: '20px'
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}>
                        First Name *
                      </label>
                      <input
                        required
                        value={checkoutForm.firstName}
                        onChange={(e) => setCheckoutForm({...checkoutForm, firstName: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '2px solid #e0e0e0',
                          borderRadius: '8px',
                          fontSize: '16px',
                          fontFamily: 'inherit'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}>
                        Last Name *
                      </label>
                      <input
                        required
                        value={checkoutForm.lastName}
                        onChange={(e) => setCheckoutForm({...checkoutForm, lastName: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '2px solid #e0e0e0',
                          borderRadius: '8px',
                          fontSize: '16px',
                          fontFamily: 'inherit'
                        }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}>
                      Email *
                    </label>
                    <input
                      required
                      type="email"
                      value={checkoutForm.email}
                      onChange={(e) => setCheckoutForm({...checkoutForm, email: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e0e0e0',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}>
                      Address *
                    </label>
                    <input
                      required
                      value={checkoutForm.address}
                      onChange={(e) => setCheckoutForm({...checkoutForm, address: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e0e0e0',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}>
                        Country *
                      </label>
                      <select
                        required
                        value={checkoutForm.country}
                        onChange={(e) => setCheckoutForm({...checkoutForm, country: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '2px solid #e0e0e0',
                          borderRadius: '8px',
                          fontSize: '16px',
                          fontFamily: 'inherit',
                          background: 'white'
                        }}
                      >
                        <option value="ZM">Zambia</option>
                        <option value="US">United States</option>
                        <option value="CA">Canada</option>
                        <option value="GB">United Kingdom</option>
                        <option value="AU">Australia</option>
                      </select>
                    </div>
                    <div>
                      <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}>
                        ZIP / Postal Code *
                      </label>
                      <input
                        required
                        value={checkoutForm.zip}
                        onChange={(e) => setCheckoutForm({...checkoutForm, zip: e.target.value})}
                        placeholder="12345"
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '2px solid #e0e0e0',
                          borderRadius: '8px',
                          fontSize: '16px',
                          fontFamily: 'inherit'
                        }}
                      />
                    </div>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}>
                        City *
                      </label>
                      <input
                        required
                        value={checkoutForm.city}
                        onChange={(e) => setCheckoutForm({...checkoutForm, city: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '2px solid #e0e0e0',
                          borderRadius: '8px',
                          fontSize: '16px',
                          fontFamily: 'inherit'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}>
                        State / Province
                      </label>
                      <input
                        value={checkoutForm.state}
                        onChange={(e) => setCheckoutForm({...checkoutForm, state: e.target.value})}
                        placeholder="Optional"
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '2px solid #e0e0e0',
                          borderRadius: '8px',
                          fontSize: '16px',
                          fontFamily: 'inherit'
                        }}
                      />
                    </div>
                  </div>
                  
                  {error && (
                    <div style={{
                      padding: '12px',
                      background: '#fee',
                      border: '1px solid #fcc',
                      borderRadius: '8px',
                      color: '#c00',
                      fontSize: '14px'
                    }}>
                      {error}
                    </div>
                  )}
                  
                  <button
                    type="submit"
                    disabled={orderLoading}
                    style={{
                      width: '100%',
                      padding: '18px',
                      background: orderLoading ? '#ccc' : '#10B981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '14px',
                      fontWeight: '700',
                      cursor: orderLoading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '12px',
                      letterSpacing: '1px',
                      textTransform: 'uppercase'
                    }}
                    onMouseEnter={(e) => {
                      if (!orderLoading) {
                        e.currentTarget.style.background = '#059669';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!orderLoading) {
                        e.currentTarget.style.background = '#10B981';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }
                    }}
                  >
                    {orderLoading ? (
                      <>
                        <Loader size={20} style={{animation: 'spin 1s linear infinite'}} />
                        Processing...
                      </>
                    ) : (
                      <>
                        🇿🇲 Pay with Pesapal (${cartTotal.toFixed(2)})
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Footer */}
      <footer style={{
        background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
        color: 'white',
        marginTop: '100px',
        padding: '80px 40px 40px',
        textAlign: 'center',
        fontSize: '14px',
        color: 'rgba(255,255,255,0.6)'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          paddingBottom: '30px',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <p>© {new Date().getFullYear()} ROCKWORLD. All rights reserved.</p>
          <p>Contact: rockworldstore@outlook.com | +260 975 473 982</p>
        </div>
      </footer>
    </div>
  );
}
