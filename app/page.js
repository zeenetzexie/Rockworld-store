'use client';

import { useState, useEffect } from 'react';

let stripePromise = null;
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  import('@stripe/stripe-js').then(({ loadStripe }) => {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
  });
}

export default function StorePage() {
  const [products, setProducts] = useState([]);
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
        setProducts(data.products || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  }, []);

  // Cart management
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, variant) => {
    setCart([...cart, {
      id: product.id,
      name: product.title,
      variant: variant.name,
      price: parseFloat(variant.retail_price),
      quantity: 1,
    }]);
    setShowVariantModal(false);
  };

  const updateQuantity = (index, qty) => {
    if (qty <= 0) {
      removeFromCart(index);
    } else {
      const newCart = [...cart];
      newCart[index].quantity = qty;
      setCart(newCart);
    }
  };

  const removeFromCart = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Stripe checkout
  const handleStripeCheckout = async (e) => {
    e.preventDefault();
    setOrderLoading(true);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart }),
      });

      const data = await response.json();

      if (!response.ok || !data.sessionId) {
        throw new Error(data.error || 'Checkout failed');
      }

      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe failed to load');

      const { error } = await stripe.redirectToCheckout({ sessionId: data.sessionId });

      if (error) throw new Error(error.message);
    } catch (error) {
      alert(`Error: ${error.message}`);
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
        <h1 style={{ margin: 0, fontSize: '48px', fontWeight: '800' }}>🎨 ROCKWORLD</h1>
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

      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        color: 'white',
        padding: '60px 20px',
        textAlign: 'center',
        borderBottom: '3px solid #d4af37',
      }}>
        <h2 style={{ fontSize: '36px', marginBottom: '15px' }}>Exclusive Collections</h2>
        <p style={{ fontSize: '18px', opacity: 0.9 }}>Curated premium designs, crafted with precision and delivered to your doorstep</p>
      </section>

      {/* Products */}
      <main style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
        {products.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {products.map((product) => (
              <div key={product.id} style={{
                background: 'white',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}>
                {product.thumbnail_url && (
                  <img src={product.thumbnail_url} alt={product.title} style={{
                    width: '100%', height: '250px', objectFit: 'cover', cursor: 'pointer'
                  }} onClick={() => { setSelectedProduct(product); setShowVariantModal(true); }} />
                )}
                <div style={{ padding: '16px' }}>
                  <h3 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: '700' }}>{product.title}</h3>
                  {product.variants && (
                    <p style={{ color: '#d4af37', fontWeight: 'bold', margin: '8px 0' }}>
                      ${parseFloat(product.variants[0].retail_price).toFixed(2)}
                    </p>
                  )}
                  <button
                    onClick={() => { setSelectedProduct(product); setShowVariantModal(true); }}
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: '#1a1a2e',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
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
          <p>Loading products...</p>
        )}
      </main>

      {/* Variant Modal */}
      {showVariantModal && selectedProduct && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            background: 'white', borderRadius: '8px', padding: '30px', maxWidth: '500px', width: '90%', maxHeight: '90vh', overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>{selectedProduct.title}</h2>
              <button onClick={() => setShowVariantModal(false)} style={{
                background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer'
              }}>✕</button>
            </div>

            <h3>Select Variant:</h3>
            {selectedProduct.variants?.map((variant) => (
              <button key={variant.id}
                onClick={() => setSelectedVariant(variant)}
                style={{
                  display: 'block', width: '100%', padding: '12px', marginBottom: '10px',
                  background: selectedVariant?.id === variant.id ? '#1a1a2e' : '#f0f0f0',
                  color: selectedVariant?.id === variant.id ? 'white' : '#333',
                  border: `2px solid ${selectedVariant?.id === variant.id ? '#d4af37' : '#ddd'}`,
                  borderRadius: '4px', cursor: 'pointer', textAlign: 'left', fontWeight: 'bold'
                }}
              >
                {variant.name} - ${parseFloat(variant.retail_price).toFixed(2)}
              </button>
            ))}

            {selectedVariant && (
              <button
                onClick={() => addToCart(selectedProduct, selectedVariant)}
                style={{
                  width: '100%', padding: '12px', background: '#d4af37', color: '#000',
                  border: 'none', borderRadius: '4px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer'
                }}
              >
                ADD TO CART - ${parseFloat(selectedVariant.retail_price).toFixed(2)}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Checkout Modal - STRIPE ONLY */}
      {showCheckout && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
        }}>
          <div style={{
            background: 'white', borderRadius: '8px', padding: '30px', maxWidth: '500px', width: '90%', maxHeight: '90vh', overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>Checkout</h2>
              <button onClick={() => setShowCheckout(false)} style={{
                background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer'
              }}>✕</button>
            </div>

            {cart.length > 0 ? (
              <>
                {/* Cart Items */}
                {cart.map((item, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #eee'
                  }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: 'bold' }}>{item.name}</p>
                      <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#666' }}>{item.variant}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <button onClick={() => updateQuantity(i, item.quantity - 1)} style={{
                        width: '24px', height: '24px', border: '1px solid #ddd', borderRadius: '2px', background: '#f0f0f0', cursor: 'pointer'
                      }}>−</button>
                      <span style={{ minWidth: '20px', textAlign: 'center', fontSize: '12px' }}>{item.quantity}</span>
                      <button onClick={() => updateQuantity(i, item.quantity + 1)} style={{
                        width: '24px', height: '24px', border: '1px solid #ddd', borderRadius: '2px', background: '#f0f0f0', cursor: 'pointer'
                      }}>+</button>
                      <span style={{ minWidth: '60px', textAlign: 'right', fontWeight: 'bold' }}>${(item.price * item.quantity).toFixed(2)}</span>
                      <button onClick={() => removeFromCart(i)} style={{
                        background: '#ff4444', color: 'white', border: 'none', borderRadius: '2px', width: '24px', height: '24px', cursor: 'pointer'
                      }}>✕</button>
                    </div>
                  </div>
                ))}

                {/* Total */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold',
                  padding: '15px 0', borderTop: '2px solid #ddd', marginBottom: '20px'
                }}>
                  <span>TOTAL:</span>
                  <span style={{ color: '#d4af37' }}>${cartTotal.toFixed(2)}</span>
                </div>

                {/* Form Fields */}
                <div style={{ marginBottom: '20px' }}>
                  <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} style={{
                    width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box'
                  }} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                    <input type="text" placeholder="First Name" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} style={{
                      padding: '10px', border: '1px solid #ddd', borderRadius: '4px'
                    }} />
                    <input type="text" placeholder="Last Name" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} style={{
                      padding: '10px', border: '1px solid #ddd', borderRadius: '4px'
                    }} />
                  </div>
                  <input type="text" placeholder="Address" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} style={{
                    width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box'
                  }} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                    <select value={formData.country} onChange={(e) => setFormData({...formData, country: e.target.value})} style={{
                      padding: '10px', border: '1px solid #ddd', borderRadius: '4px'
                    }}>
                      <option>United States</option>
                      <option>Zambia</option>
                      <option>United Kingdom</option>
                      <option>Canada</option>
                      <option>Australia</option>
                    </select>
                    <input type="text" placeholder="ZIP Code" value={formData.zip} onChange={(e) => setFormData({...formData, zip: e.target.value})} style={{
                      padding: '10px', border: '1px solid #ddd', borderRadius: '4px'
                    }} />
                  </div>
                </div>

                {/* STRIPE BUTTON ONLY */}
                <button
                  onClick={handleStripeCheckout}
                  disabled={orderLoading}
                  style={{
                    width: '100%', padding: '14px', background: orderLoading ? '#ccc' : '#1a1a2e',
                    color: 'white', border: 'none', borderRadius: '4px', fontSize: '16px', fontWeight: 'bold',
                    cursor: orderLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {orderLoading ? 'Processing...' : `💳 PAY WITH STRIPE ($${cartTotal.toFixed(2)})`}
                </button>
              </>
            ) : (
              <p>Cart is empty</p>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{
        background: '#1a1a2e', color: 'white', textAlign: 'center', padding: '30px 20px', marginTop: '60px'
      }}>
        <h3>ROCKWORLD</h3>
        <p style={{ margin: '10px 0', opacity: 0.8 }}>Premium designs for premium people</p>
        <p style={{ fontSize: '12px', margin: '20px 0 0', opacity: 0.6 }}>&copy; 2024 ROCKWORLD. All rights reserved.</p>
      </footer>
    </div>
  );
}
