'use client';

import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

// Stripe initialization
let stripePromise = null;

const getStripe = async () => {
  if (!stripePromise && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    stripePromise = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};

const paypalOptions = {
  'client-id': process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '',
  currency: 'USD',
  intent: 'capture',
};

export default function StorePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    country: 'United States',
    zip: '',
    city: '',
    state: '',
  });

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/printful/products');
        const data = await response.json();
        
        let productList = [];
        if (Array.isArray(data)) {
          productList = data;
        } else if (data && Array.isArray(data.data)) {
          productList = data.data;
        } else if (data && Array.isArray(data.products)) {
          productList = data.products;
        }
        
        setProducts(productList || []);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('rockworld_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Error loading cart:', e);
      }
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('rockworld_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, variant) => {
    const cartItem = {
      id: `${product.id}-${variant.id}`,
      product: product,
      variant: variant,
      quantity: 1,
      price: parseFloat(variant.retail_price),
    };
    setCart([...cart, cartItem]);
    setShowVariantModal(false);
    alert(`✅ ${product.title} added to cart!`);
  };

  const updateQuantity = (index, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(index);
      return;
    }
    const newCart = [...cart];
    newCart[index].quantity = newQuantity;
    setCart(newCart);
  };

  const removeFromCart = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  // Stripe checkout handler
  const handleStripeCheckout = async (e) => {
    e.preventDefault();

    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      alert('❌ Stripe is not configured');
      return;
    }

    if (cart.length === 0) {
      alert('❌ Cart is empty');
      return;
    }

    setOrderLoading(true);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart }),
      });

      const data = await response.json();

      if (!response.ok || !data.sessionId) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      const stripe = await getStripe();
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      const { error } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });

      if (error) {
        throw new Error(error.message);
      }

    } catch (error) {
      console.error('Checkout error:', error);
      alert(`❌ Payment error: ${error.message}`);
      setOrderLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: 'Archivo, sans-serif', background: '#fafafa', minHeight: '100vh' }}>
      {/* Header with Cart Badge */}
      <header style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        color: 'white',
        padding: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '3px solid #d4af37',
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '32px', fontWeight: '800', letterSpacing: '2px' }}>
            🎨 ROCKWORLD
          </h1>
          <p style={{ margin: '5px 0 0', opacity: 0.8, fontSize: '14px' }}>Premium Collections</p>
        </div>
        <button
          onClick={() => setShowCheckout(true)}
          style={{
            background: '#d4af37',
            color: '#000',
            border: 'none',
            padding: '12px 20px',
            borderRadius: '6px',
            fontWeight: '700',
            cursor: 'pointer',
            fontSize: '16px',
            position: 'relative',
          }}
        >
          🛒 Cart ({cart.length})
          {cart.length > 0 && (
            <span style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              background: '#ff4444',
              color: 'white',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 'bold',
            }}>
              {cart.length}
            </span>
          )}
        </button>
      </header>

      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        color: 'white',
        padding: '40px 20px',
        textAlign: 'center',
        borderBottom: '3px solid #d4af37',
      }}>
        <h2 style={{ fontSize: '32px', marginBottom: '10px' }}>Curated Premium Designs</h2>
        <p style={{ fontSize: '16px', opacity: 0.9 }}>Handpicked collections delivered to your doorstep</p>
      </section>

      {/* Products Grid */}
      <section style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
        <h2 style={{ fontSize: '28px', marginBottom: '30px' }}>Our Products</h2>
        
        {error ? (
          <div style={{
            background: '#ffebee',
            border: '2px solid #ef5350',
            color: '#c62828',
            padding: '20px',
            borderRadius: '8px',
          }}>
            <p><strong>❌ Error:</strong> {error}</p>
          </div>
        ) : loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p style={{ fontSize: '18px' }}>⏳ Loading products...</p>
          </div>
        ) : products && products.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px' }}>
            {products.map((product) => (
              <div
                key={product.id}
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                {product.thumbnail_url && (
                  <img
                    src={product.thumbnail_url}
                    alt={product.title}
                    style={{
                      width: '100%',
                      height: '250px',
                      objectFit: 'cover',
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      setSelectedProduct(product);
                      setShowVariantModal(true);
                    }}
                  />
                )}

                <div style={{ padding: '20px' }}>
                  <h3 style={{ margin: '0 0 10px', fontSize: '18px', fontWeight: '700', color: '#1a1a2e' }}>
                    {product.title}
                  </h3>
                  
                  {product.variants && product.variants.length > 0 && (
                    <p style={{ margin: '10px 0', fontSize: '16px', fontWeight: '700', color: '#d4af37' }}>
                      ${parseFloat(product.variants[0].retail_price).toFixed(2)}
                    </p>
                  )}

                  <p style={{ margin: '10px 0', fontSize: '14px', color: '#666' }}>
                    {product.variants?.length || 0} options available
                  </p>

                  <button
                    onClick={() => {
                      setSelectedProduct(product);
                      setShowVariantModal(true);
                    }}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: '#1a1a2e',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      marginTop: '15px',
                      transition: 'all 0.3s',
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#d4af37'}
                    onMouseLeave={(e) => e.target.style.background = '#1a1a2e'}
                    onMouseEnter={(e) => e.target.style.color = '#000'}
                    onMouseLeave={(e) => e.target.style.color = '#fff'}
                  >
                    SELECT OPTIONS
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: 'white',
            borderRadius: '12px',
          }}>
            <p style={{ fontSize: '18px', color: '#666' }}>📦 No products available</p>
          </div>
        )}
      </section>

      {/* Variant Modal */}
      {showVariantModal && selectedProduct && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            padding: '30px',
            position: 'relative',
          }}>
            <button
              onClick={() => setShowVariantModal(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'none',
                border: 'none',
                fontSize: '28px',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>

            <h2 style={{ marginTop: 0 }}>{selectedProduct.title}</h2>

            <div style={{ marginBottom: '30px' }}>
              <h3>Choose Your Option:</h3>
              {selectedProduct.variants?.map((variant) => (
                <button
                  key={variant.id}
                  onClick={() => setSelectedVariant(variant)}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '15px',
                    marginBottom: '10px',
                    background: selectedVariant?.id === variant.id ? '#1a1a2e' : '#f5f5f5',
                    color: selectedVariant?.id === variant.id ? 'white' : '#333',
                    border: `2px solid ${selectedVariant?.id === variant.id ? '#d4af37' : '#ddd'}`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontWeight: selectedVariant?.id === variant.id ? '700' : '500',
                    fontSize: '14px',
                  }}
                >
                  <strong>{variant.name}</strong> — ${parseFloat(variant.retail_price).toFixed(2)}
                </button>
              ))}
            </div>

            {selectedVariant && (
              <button
                onClick={() => addToCart(selectedProduct, selectedVariant)}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: '#d4af37',
                  color: '#000',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: '700',
                  cursor: 'pointer',
                }}
              >
                ✅ ADD TO CART — ${parseFloat(selectedVariant.retail_price).toFixed(2)}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '20px',
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '95vh',
            overflow: 'auto',
            padding: '30px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h2 style={{ margin: 0 }}>🛒 Checkout</h2>
              <button
                onClick={() => setShowCheckout(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '28px',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>

            {cart.length > 0 ? (
              <>
                {/* Cart Items Review */}
                <div style={{
                  background: '#f9f9f9',
                  padding: '15px',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  maxHeight: '200px',
                  overflow: 'auto',
                }}>
                  <h3 style={{ margin: '0 0 15px 0', fontSize: '16px' }}>Order Summary:</h3>
                  {cart.map((item, index) => (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px' }}>
                      <span>{item.product.title} ({item.variant.name}) x{item.quantity}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div style={{ borderTop: '1px solid #ddd', paddingTop: '10px', marginTop: '10px', fontWeight: '700' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>TOTAL:</span>
                      <span style={{ color: '#d4af37' }}>${cartTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Billing Form */}
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '16px', marginBottom: '15px' }}>Shipping Details:</h3>

                  <input
                    type="email"
                    placeholder="Email *"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      marginBottom: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      boxSizing: 'border-box',
                      fontSize: '14px',
                    }}
                  />

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                    <input
                      type="text"
                      placeholder="First Name *"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      style={{
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '14px',
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Last Name *"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      style={{
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '14px',
                      }}
                    />
                  </div>

                  <input
                    type="text"
                    placeholder="Address *"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      marginBottom: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      boxSizing: 'border-box',
                      fontSize: '14px',
                    }}
                  />

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                    <select
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      style={{
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '14px',
                      }}
                    >
                      <option>United States</option>
                      <option>Zambia</option>
                      <option>United Kingdom</option>
                      <option>Canada</option>
                      <option>Australia</option>
                      <option>Other</option>
                    </select>

                    <input
                      type="text"
                      placeholder="ZIP / Postal Code *"
                      value={formData.zip}
                      onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                      style={{
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '14px',
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <input
                      type="text"
                      placeholder="City *"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      style={{
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '14px',
                      }}
                    />
                    <input
                      type="text"
                      placeholder="State / Province (Optional)"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      style={{
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '14px',
                      }}
                    />
                  </div>
                </div>

                {/* Payment Methods */}
                <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '2px solid #ddd' }}>
                  <h3 style={{ fontSize: '16px', marginBottom: '15px' }}>Payment Method:</h3>

                  {process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && (
                    <button
                      onClick={handleStripeCheckout}
                      disabled={orderLoading}
                      style={{
                        width: '100%',
                        padding: '14px',
                        background: orderLoading ? '#ccc' : '#1a1a2e',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '15px',
                        fontWeight: '700',
                        cursor: orderLoading ? 'not-allowed' : 'pointer',
                        marginBottom: '12px',
                      }}
                    >
                      {orderLoading ? '⏳ Processing...' : `💳 PAY WITH STRIPE ($${cartTotal.toFixed(2)})`}
                    </button>
                  )}

                  {process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID && (
                    <div style={{ marginTop: '12px' }}>
                      <p style={{ textAlign: 'center', marginBottom: '12px', fontSize: '14px', color: '#666' }}>Or use PayPal:</p>
                      <PayPalScriptProvider options={paypalOptions}>
                        <PayPalButtons
                          createOrder={async () => {
                            try {
                              const response = await fetch('/api/paypal/create-order', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ items: cart }),
                              });
                              const data = await response.json();
                              if (data.error) throw new Error(data.error);
                              return data.orderId;
                            } catch (error) {
                              alert('PayPal error: ' + error.message);
                              throw error;
                            }
                          }}
                          onApprove={async (data) => {
                            try {
                              const response = await fetch('/api/paypal/capture-payment', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ orderId: data.orderID }),
                              });
                              const details = await response.json();
                              if (details.error) throw new Error(details.error);
                              setCart([]);
                              window.location.href = `/success?paypal_order=${data.orderID}`;
                            } catch (error) {
                              alert('Payment error: ' + error.message);
                            }
                          }}
                          onError={() => alert('PayPal error occurred')}
                          style={{ layout: 'vertical' }}
                        />
                      </PayPalScriptProvider>
                    </div>
                  )}

                  {!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && !process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID && (
                    <p style={{ textAlign: 'center', color: '#999' }}>No payment methods configured</p>
                  )}
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <p style={{ fontSize: '18px', color: '#666', marginBottom: '20px' }}>Your cart is empty</p>
                <button
                  onClick={() => setShowCheckout(false)}
                  style={{
                    padding: '12px 20px',
                    background: '#1a1a2e',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '700',
                  }}
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{
        background: '#1a1a2e',
        color: 'white',
        textAlign: 'center',
        padding: '30px 20px',
        marginTop: '60px',
        borderTop: '3px solid #d4af37',
      }}>
        <p style={{ margin: 0 }}>&copy; 2024 ROCKWORLD. All rights reserved.</p>
        <p style={{ margin: '10px 0 0', opacity: 0.8, fontSize: '12px' }}>Premium Collections | Powered by Printful</p>
      </footer>
    </div>
  );
}
