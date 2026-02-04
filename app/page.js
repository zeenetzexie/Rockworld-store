'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, X, Package, CreditCard, Loader } from 'lucide-react';

export default function StorePage() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  
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

  // Submit order to Printful via our API route
  const submitOrder = async (e) => {
    e.preventDefault();
    setOrderLoading(true);
    setError(null);
    
    try {
      const orderData = {
        recipient: {
          name: `${checkoutForm.firstName} ${checkoutForm.lastName}`,
          address1: checkoutForm.address,
          city: checkoutForm.city,
          state_code: checkoutForm.state,
          country_code: checkoutForm.country,
          zip: checkoutForm.zip,
          email: checkoutForm.email
        },
        items: cart.map(item => ({
          sync_variant_id: item.variantId,
          quantity: item.quantity
        }))
      };

      const response = await fetch('/api/printful/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create order');
      }
      
      setOrderSuccess(true);
      setCart([]);
      setTimeout(() => {
        setIsCheckoutOpen(false);
        setOrderSuccess(false);
      }, 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setOrderLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh' }}>
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
          <h1 style={{
            fontSize: '32px',
            fontFamily: '"Archivo", sans-serif',
            fontWeight: '700',
            letterSpacing: '3px',
            color: '#000000'
          }}>
            ROCKWORLD
          </h1>
          
          <button
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
      <section style={{
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
          <h2 style={{
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
          <p style={{
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
      <section style={{
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
              <div style={{
                width: '100%',
                paddingTop: '100%',
                position: 'relative',
                background: '#f5f5f5'
              }}>
                <img
                  src={product.sync_product.thumbnail_url}
                  alt={product.sync_product.name}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
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
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                  marginBottom: '20px'
                }}>
                  {product.sync_variants.slice(0, 3).map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => addToCart(product, variant)}
                      style={{
                        flex: '1',
                        minWidth: '80px',
                        padding: '12px 18px',
                        background: 'white',
                        border: '1px solid #d0d0d0',
                        borderRadius: '2px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '600',
                        transition: 'all 0.3s',
                        textAlign: 'center',
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#000000';
                        e.currentTarget.style.background = '#000000';
                        e.currentTarget.style.color = 'white';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#d0d0d0';
                        e.currentTarget.style.background = 'white';
                        e.currentTarget.style.color = 'black';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      {variant.name.split(' - ').pop()}
                      <div style={{ fontSize: '11px', marginTop: '4px', opacity: 0.7 }}>
                        ${variant.retail_price}
                      </div>
                    </button>
                  ))}
                </div>
                
                {product.sync_variants.length > 3 && (
                  <p style={{
                    fontSize: '12px',
                    color: '#999',
                    textAlign: 'center'
                  }}>
                    + {product.sync_variants.length - 3} more options
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

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

      {/* Checkout Modal */}
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
              {orderSuccess ? (
                <div style={{
                  textAlign: 'center',
                  padding: '60px 20px'
                }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    background: '#4caf50',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px'
                  }}>
                    <Package size={40} color="white" />
                  </div>
                  <h3 style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    marginBottom: '10px'
                  }}>
                    Order Placed!
                  </h3>
                  <p style={{ color: '#666' }}>
                    Your order has been submitted to Printful for fulfillment.
                  </p>
                </div>
              ) : (
                <form onSubmit={submitOrder}>
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
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
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
                          State *
                        </label>
                        <input
                          required
                          value={checkoutForm.state}
                          onChange={(e) => setCheckoutForm({...checkoutForm, state: e.target.value})}
                          placeholder="CA"
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
                          ZIP *
                        </label>
                        <input
                          required
                          value={checkoutForm.zip}
                          onChange={(e) => setCheckoutForm({...checkoutForm, zip: e.target.value})}
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
                        background: orderLoading ? '#ccc' : '#000000',
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
                          e.currentTarget.style.background = '#333';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!orderLoading) {
                          e.currentTarget.style.background = '#000000';
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
                          <Package size={20} />
                          Place Order (${cartTotal.toFixed(2)})
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
