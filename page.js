'use client';

import React, { useState, useEffect } from 'react';

export default function StorePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
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
        console.log('Fetching products...');
        const response = await fetch('/api/printful/products');
        const data = await response.json();
        
        let productList = [];
        if (Array.isArray(data)) {
          productList = data;
        } else if (data && Array.isArray(data.data)) {
          productList = data.data;
        } else if (data && Array.isArray(data.result)) {
          productList = data.result;
        }
        
        setProducts(productList || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
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

  // Stripe checkout
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

      // Load Stripe dynamically
      const { loadStripe } = await import('@stripe/stripe-js');
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
      
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
      alert(`Error: ${error.message}`);
      setOrderLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', background: '#fafafa', minHeight: '100vh' }}>
      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        color: 'white',
        padding: '30px 20px',
        textAlign: 'center',
        borderBottom: '3px solid #d4af37',
      }}>
        <h1 style={{ margin: 0, fontSize: '48px', fontWeight: 'bold' }}>🎨 ROCKWORLD</h1>
        <p style={{ margin: '10px 0 0', opacity: 0.8 }}>Premium Printful Collections</p>
        {cart.length > 0 && (
          <button
            onClick={() => setShowCheckout(true)}
            style={{
              marginTop: '15px',
              padding: '10px 20px',
              background: '#d4af37',
              color: '#000',
              border: 'none',
              borderRadius: '4px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            🛒 Cart ({cart.length})
          </button>
        )}
      </header>

      {/* Products */}
      <main style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
        <h2>Featured Products</h2>
        
        {loading ? (
          <p>Loading products...</p>
        ) : products && products.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
            {products.map((product) => (
              <div key={product.id} style={{
                background: 'white',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                transition: 'all 0.3s',
              }}>
                {product.thumbnail_url && (
                  <img 
                    src={product.thumbnail_url} 
                    alt={product.title}
                    style={{ 
                      width: '100%', 
                      height: '200px', 
                      objectFit: 'cover',
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      setSelectedProduct(product);
                      setShowVariantModal(true);
                    }}
                  />
                )}
                <div style={{ padding: '16px' }}>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold' }}>
                    {product.title}
                  </h3>
                  
                  {product.variants && product.variants.length > 0 && (
                    <p style={{ 
                      margin: '8px 0', 
                      fontSize: '16px', 
                      fontWeight: 'bold', 
                      color: '#d4af37' 
                    }}>
                      ${parseFloat(product.variants[0].retail_price).toFixed(2)}
                    </p>
                  )}

                  <p style={{ color: '#666', fontSize: '14px', margin: '8px 0 0 0' }}>
                    {product.variants?.length || 0} variants
                  </p>

                  <button
                    onClick={() => {
                      setSelectedProduct(product);
                      setShowVariantModal(true);
                    }}
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: '#1a1a2e',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      marginTop: '12px',
                    }}
                  >
                    SELECT OPTIONS
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No products found</p>
        )}
      </main>

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
            borderRadius: '8px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            padding: '30px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>{selectedProduct.title}</h2>
              <button
                onClick={() => setShowVariantModal(false)}
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

            {selectedProduct.thumbnail_url && (
              <img 
                src={selectedProduct.thumbnail_url} 
                alt={selectedProduct.title}
                style={{ width: '100%', borderRadius: '4px', marginBottom: '20px' }}
              />
            )}

            <h3 style={{ marginBottom: '15px' }}>Select a Variant:</h3>
            <div style={{ marginBottom: '20px', maxHeight: '300px', overflowY: 'auto' }}>
              {selectedProduct.variants?.map((variant) => (
                <button
                  key={variant.id}
                  onClick={() => setSelectedVariant(variant)}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '12px',
                    marginBottom: '10px',
                    background: selectedVariant?.id === variant.id ? '#1a1a2e' : '#f0f0f0',
                    color: selectedVariant?.id === variant.id ? 'white' : '#333',
                    border: `2px solid ${selectedVariant?.id === variant.id ? '#d4af37' : '#ddd'}`,
                    borderRadius: '4px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontWeight: selectedVariant?.id === variant.id ? 'bold' : 'normal',
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
                  padding: '12px',
                  background: '#d4af37',
                  color: '#000',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                ADD TO CART - ${parseFloat(selectedVariant.retail_price).toFixed(2)}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Cart/Checkout Modal */}
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
            borderRadius: '8px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            padding: '30px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
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

            {cart.length > 0 ? (
              <>
                {/* Cart Items */}
                <div style={{ marginBottom: '20px', maxHeight: '200px', overflowY: 'auto' }}>
                  {cart.map((item, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px',
                      borderBottom: '1px solid #eee',
                    }}>
                      <div>
                        <p style={{ margin: 0, fontWeight: 'bold' }}>{item.product.title}</p>
                        <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#666' }}>
                          {item.variant.name}
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button
                          onClick={() => updateQuantity(index, item.quantity - 1)}
                          style={{
                            width: '24px',
                            height: '24px',
                            border: '1px solid #ddd',
                            borderRadius: '2px',
                            background: '#f0f0f0',
                            cursor: 'pointer',
                          }}
                        >
                          −
                        </button>
                        <span style={{ minWidth: '20px', textAlign: 'center', fontSize: '12px' }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(index, item.quantity + 1)}
                          style={{
                            width: '24px',
                            height: '24px',
                            border: '1px solid #ddd',
                            borderRadius: '2px',
                            background: '#f0f0f0',
                            cursor: 'pointer',
                          }}
                        >
                          +
                        </button>
                        <span style={{ minWidth: '50px', textAlign: 'right', fontSize: '12px', fontWeight: 'bold' }}>
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                        <button
                          onClick={() => removeFromCart(index)}
                          style={{
                            background: '#ff4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '2px',
                            width: '24px',
                            height: '24px',
                            cursor: 'pointer',
                            fontSize: '12px',
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  padding: '15px 0',
                  borderTop: '2px solid #ddd',
                  marginBottom: '20px',
                }}>
                  <span>TOTAL:</span>
                  <span style={{ color: '#d4af37' }}>${cartTotal.toFixed(2)}</span>
                </div>

                {/* Checkout Form */}
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
                      <option>Other</option>
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
                      placeholder="State (Optional)"
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

                {/* Payment Buttons */}
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
                      borderRadius: '4px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      cursor: orderLoading ? 'not-allowed' : 'pointer',
                      marginBottom: '10px',
                    }}
                  >
                    {orderLoading ? 'Processing...' : `💳 PAY WITH STRIPE ($${cartTotal.toFixed(2)})`}
                  </button>
                )}

                {!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && (
                  <div style={{
                    background: '#ffebee',
                    border: '1px solid #ef5350',
                    color: '#c62828',
                    padding: '12px',
                    borderRadius: '4px',
                    marginBottom: '10px',
                    fontSize: '14px',
                  }}>
                    ⚠️ Stripe is not configured. Contact support.
                  </div>
                )}
              </>
            ) : (
              <p style={{ textAlign: 'center' }}>Your cart is empty</p>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{
        background: '#1a1a2e',
        color: 'white',
        textAlign: 'center',
        padding: '20px',
        marginTop: '60px',
      }}>
        <p>&copy; 2024 ROCKWORLD. All rights reserved.</p>
      </footer>
    </div>
  );
}
