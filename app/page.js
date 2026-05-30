'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, X, Package, CreditCard, Loader } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

// Initialize Stripe
let stripePromise;
const getStripePromise = () => {
  if (!stripePromise && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};

// PayPal configuration
const paypalOptions = {
  'client-id': process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '',
  currency: 'USD',
  intent: 'capture',
};

export default function StorePage() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  
  // Checkout form state
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

  // Fetch products from Printful
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/printful/products');
        const data = await response.json();
        setProducts(data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, variant) => {
    const cartItem = {
      id: product.id,
      product: product,
      variantId: variant.id,
      variant: variant,
      quantity: 1,
      price: parseFloat(variant.retail_price),
      name: product.title,
    };

    setCart([...cart, cartItem]);
    setShowVariantModal(false);
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
      alert('Stripe is not configured');
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

      const stripe = await getStripePromise();
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
      console.error('Stripe checkout error:', error);
      alert(`Payment failed: ${error.message}`);
      setOrderLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: 'Archivo, sans-serif', background: '#fafafa' }}>
      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        color: 'white',
        padding: '30px 20px',
        textAlign: 'center',
        borderBottom: '3px solid #d4af37',
      }}>
        <h1 style={{ margin: 0, fontSize: '48px', fontWeight: '800', letterSpacing: '2px' }}>
          🎨 ROCKWORLD
        </h1>
        <p style={{ margin: '10px 0 0', opacity: 0.8 }}>Premium Printful Collections</p>
      </header>

      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        color: 'white',
        padding: '60px 20px',
        textAlign: 'center',
        borderBottom: '3px solid #d4af37',
      }}>
        <h2 style={{ fontSize: '36px', marginBottom: '15px' }}>Curated Premium Designs</h2>
        <p style={{ fontSize: '18px', opacity: 0.9, maxWidth: '600px', margin: '0 auto' }}>
          Crafted with precision and delivered to your doorstep
        </p>
      </section>

      {/* Products Grid */}
      <section style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
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
              }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.2)'}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
            >
              {/* Product Image */}
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

              {/* Product Info */}
              <div style={{ padding: '20px' }}>
                <h3 style={{ margin: '0 0 10px', fontSize: '18px', fontWeight: '700', color: '#1a1a2e' }}>
                  {product.title}
                </h3>
                
                {product.variants && product.variants.length > 0 && (
                  <p style={{ margin: '10px 0', fontSize: '16px', fontWeight: '700', color: '#d4af37' }}>
                    ${parseFloat(product.variants[0].retail_price).toFixed(2)} - $
                    {Math.max(...product.variants.map(v => parseFloat(v.retail_price))).toFixed(2)}
                  </p>
                )}

                <p style={{ margin: '10px 0', fontSize: '14px', color: '#666' }}>
                  {product.variants?.length || 0} variants available
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
                  onMouseEnter={(e) => e.currentTarget.style.background = '#d4af37'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#1a1a2e'}
                >
                  SELECT OPTIONS
                </button>
              </div>
            </div>
          ))}
        </div>
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
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto',
            padding: '40px',
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
                fontSize: '24px',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>

            <h2 style={{ marginTop: 0 }}>{selectedProduct.title}</h2>

            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ marginBottom: '15px' }}>Select a Variant:</h3>
              {selectedProduct.variants?.map((variant) => (
                <button
                  key={variant.id}
                  onClick={() => setSelectedVariant(variant)}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '15px',
                    marginBottom: '10px',
                    background: selectedVariant?.id === variant.id ? '#1a1a2e' : '#f0f0f0',
                    color: selectedVariant?.id === variant.id ? 'white' : '#333',
                    border: `2px solid ${selectedVariant?.id === variant.id ? '#d4af37' : '#ddd'}`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontWeight: selectedVariant?.id === variant.id ? '700' : '500',
                    transition: 'all 0.3s',
                  }}
                >
                  {variant.name} - ${parseFloat(variant.retail_price).toFixed(2)}
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
                  transition: 'all 0.3s',
                }}
              >
                ADD TO CART - ${parseFloat(selectedVariant.retail_price).toFixed(2)}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Cart Section */}
      <section style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
        {cart.length > 0 ? (
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}>
            <h2 style={{ marginTop: 0 }}>Shopping Cart ({cart.length} items)</h2>

            {cart.map((item, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '15px',
                  borderBottom: '1px solid #eee',
                  gap: '15px',
                }}
              >
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: '700' }}>{item.product.title}</p>
                  <p style={{ margin: '5px 0 0', fontSize: '14px', color: '#666' }}>
                    {item.variant.name} - ${parseFloat(item.price).toFixed(2)}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    onClick={() => updateQuantity(index, item.quantity - 1)}
                    style={{
                      width: '30px',
                      height: '30px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      background: '#f0f0f0',
                    }}
                  >
                    −
                  </button>
                  <span style={{ minWidth: '30px', textAlign: 'center' }}>{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(index, item.quantity + 1)}
                    style={{
                      width: '30px',
                      height: '30px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      background: '#f0f0f0',
                    }}
                  >
                    +
                  </button>
                </div>

                <p style={{ margin: 0, fontWeight: '700', minWidth: '80px', textAlign: 'right' }}>
                  ${(item.price * item.quantity).toFixed(2)}
                </p>

                <button
                  onClick={() => removeFromCart(index)}
                  style={{
                    background: '#ff4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    width: '30px',
                    height: '30px',
                    cursor: 'pointer',
                  }}
                >
                  ✕
                </button>
              </div>
            ))}

            <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '2px solid #ddd' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>
                <span>TOTAL:</span>
                <span style={{ color: '#d4af37' }}>${cartTotal.toFixed(2)}</span>
              </div>

              <button
                onClick={() => setShowCheckout(true)}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: '#1a1a2e',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: '700',
                  cursor: 'pointer',
                }}
              >
                PROCEED TO CHECKOUT
              </button>
            </div>
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: 'white',
            borderRadius: '12px',
          }}>
            <ShoppingCart size={48} style={{ margin: '0 auto 20px', opacity: 0.3 }} />
            <p style={{ fontSize: '18px', color: '#666' }}>Your cart is empty</p>
          </div>
        )}
      </section>

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
            maxWidth: '500px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            padding: '30px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h2 style={{ margin: 0 }}>Checkout</h2>
              <button
                onClick={() => setShowCheckout(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>

            {/* Form Fields */}
            <div style={{ marginBottom: '20px' }}>
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginBottom: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                }}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <input
                  type="text"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  style={{
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                  }}
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  style={{
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                  }}
                />
              </div>

              <input
                type="text"
                placeholder="Address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginBottom: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
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
                  }}
                >
                  <option>United States</option>
                  <option>Zambia</option>
                  <option>United Kingdom</option>
                  <option>Canada</option>
                  <option>Australia</option>
                  {/* Add more countries as needed */}
                </select>

                <input
                  type="text"
                  placeholder="ZIP / Postal Code"
                  value={formData.zip}
                  onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                  style={{
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <input
                  type="text"
                  placeholder="City"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  style={{
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
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
                  }}
                />
              </div>
            </div>

            {/* Payment Methods */}
            <div style={{ marginTop: '30px' }}>
              {/* Stripe Button */}
              {process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && (
                <button
                  onClick={handleStripeCheckout}
                  disabled={orderLoading}
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: orderLoading ? '#ccc' : '#1a1a2e',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontWeight: '700',
                    cursor: orderLoading ? 'not-allowed' : 'pointer',
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  {orderLoading ? <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} /> : <CreditCard size={20} />}
                  {orderLoading ? 'Processing...' : `💳 PAY WITH STRIPE ($${cartTotal.toFixed(2)})`}
                </button>
              )}

              {/* PayPal */}
              {process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID && (
                <div style={{ marginTop: '16px' }}>
                  <p style={{ textAlign: 'center', marginBottom: '12px', fontSize: '14px', color: '#666' }}>Or pay with PayPal:</p>
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
                          console.error('PayPal error:', error);
                          alert('PayPal order creation failed');
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
                          alert('Payment capture failed: ' + error.message);
                        }
                      }}
                      onError={() => alert('PayPal checkout failed')}
                      style={{ layout: 'vertical' }}
                    />
                  </PayPalScriptProvider>
                </div>
              )}

              {!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && !process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID && (
                <p style={{ textAlign: 'center', color: '#999' }}>No payment methods configured</p>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
