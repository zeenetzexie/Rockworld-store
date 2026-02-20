'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ShoppingCart, ChevronLeft, ZoomIn, Package, Truck, RefreshCw, Shield, X } from 'lucide-react';

export default function ProductDetailPage() {
  const searchParams = useSearchParams();
  const productId = searchParams.get('id');
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [showZoom, setShowZoom] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const response = await fetch('/api/printful/products');
      const data = await response.json();
      const foundProduct = data.find(p => p.sync_product.id === parseInt(productId));
      
      if (foundProduct) {
        setProduct(foundProduct);
        setSelectedVariant(foundProduct.sync_variants[0]);
      }
    } catch (err) {
      console.error('Error fetching product:', err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = () => {
    // Get existing cart
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Add item
    const cartItem = {
      product: product.sync_product,
      variant: selectedVariant,
      quantity: quantity,
      id: `${product.sync_product.id}-${selectedVariant.id}`
    };
    
    // Check if item already in cart
    const existingIndex = existingCart.findIndex(item => item.id === cartItem.id);
    if (existingIndex > -1) {
      existingCart[existingIndex].quantity += quantity;
    } else {
      existingCart.push(cartItem);
    }
    
    localStorage.setItem('cart', JSON.stringify(existingCart));
    alert('Added to cart! 🎉');
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#f5f5f5'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #000',
            borderRadius: '50%',
            margin: '0 auto 20px',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{ color: '#666', fontSize: '16px' }}>Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <h2>Product not found</h2>
        <Link href="/" style={{
          padding: '12px 24px',
          background: '#000',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '6px'
        }}>
          Back to Store
        </Link>
      </div>
    );
  }

  // Get all images from variants
  const allImages = [];
  product.sync_variants.forEach(variant => {
    if (variant.files && variant.files.length > 0) {
      variant.files.forEach(file => {
        if (file.preview_url && !allImages.find(img => img.url === file.preview_url)) {
          allImages.push({
            url: file.preview_url,
            type: file.type
          });
        }
      });
    }
  });

  // If no variant images, use product thumbnail
  if (allImages.length === 0) {
    allImages.push({
      url: product.sync_product.thumbnail_url,
      type: 'default'
    });
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa' }}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
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
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Link href="/" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            textDecoration: 'none',
            color: '#000'
          }}>
            <img src="/logo-header.png" alt="ROCKWORLD" style={{ width: '40px', height: '40px' }} />
            <h1 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>ROCKWORLD</h1>
          </Link>
          <Link href="/" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            background: '#000',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            <ChevronLeft size={18} />
            Back to Store
          </Link>
        </div>
      </header>

      {/* Product Content */}
      <div style={{
        maxWidth: '1400px',
        margin: '60px auto',
        padding: '0 40px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '60px',
          alignItems: 'start'
        }}>
          {/* Left Side - Images */}
          <div style={{ position: 'sticky', top: '100px' }}>
            {/* Main Image */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              overflow: 'hidden',
              marginBottom: '20px',
              border: '1px solid #e0e0e0',
              position: 'relative',
              cursor: 'zoom-in'
            }}
            onClick={() => setShowZoom(true)}>
              <div style={{
                paddingTop: '100%',
                position: 'relative'
              }}>
                <img
                  src={allImages[selectedImage]?.url}
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
                <div style={{
                  position: 'absolute',
                  bottom: '20px',
                  right: '20px',
                  background: 'rgba(0,0,0,0.7)',
                  color: 'white',
                  padding: '10px 16px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  backdropFilter: 'blur(10px)'
                }}>
                  <ZoomIn size={16} />
                  Click to Zoom
                </div>
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {allImages.length > 1 && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${Math.min(allImages.length, 4)}, 1fr)`,
                gap: '15px'
              }}>
                {allImages.map((image, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    style={{
                      background: 'white',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: selectedImage === index ? '3px solid #000' : '1px solid #e0e0e0',
                      transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedImage !== index) {
                        e.currentTarget.style.borderColor = '#999';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedImage !== index) {
                        e.currentTarget.style.borderColor = '#e0e0e0';
                      }
                    }}
                  >
                    <div style={{ paddingTop: '100%', position: 'relative' }}>
                      <img
                        src={image.url}
                        alt={`View ${index + 1}`}
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
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Side - Product Info */}
          <div>
            <h1 style={{
              fontSize: '42px',
              fontWeight: '700',
              marginBottom: '15px',
              fontFamily: '"Archivo", sans-serif',
              lineHeight: '1.2',
              color: '#000'
            }}>
              {product.sync_product.name}
            </h1>

            <div style={{
              fontSize: '36px',
              fontWeight: '700',
              color: '#000',
              marginBottom: '30px',
              fontFamily: '"Archivo", sans-serif'
            }}>
              ${selectedVariant?.retail_price}
            </div>

            {/* Features */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '15px',
              marginBottom: '40px'
            }}>
              {[
                { icon: Truck, text: 'Free Shipping' },
                { icon: RefreshCw, text: 'Easy Returns' },
                { icon: Shield, text: 'Quality Guarantee' },
                { icon: Package, text: 'Secure Packaging' }
              ].map((feature, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '15px',
                  background: '#f8f8f8',
                  borderRadius: '8px'
                }}>
                  <feature.icon size={20} style={{ color: '#666' }} />
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>

            {/* Size Selection */}
            <div style={{ marginBottom: '30px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '700',
                marginBottom: '15px',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                Select Size:
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                gap: '12px'
              }}>
                {(() => {
                  const sizes = {};
                  product.sync_variants.forEach(variant => {
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
                        padding: '16px',
                        background: selectedVariant?.id === variant.id ? '#000' : 'white',
                        color: selectedVariant?.id === variant.id ? 'white' : '#000',
                        border: selectedVariant?.id === variant.id ? '2px solid #000' : '2px solid #e0e0e0',
                        borderRadius: '6px',
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

            {/* Quantity */}
            <div style={{ marginBottom: '30px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '700',
                marginBottom: '15px',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                Quantity:
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{
                    width: '45px',
                    height: '45px',
                    background: 'white',
                    border: '2px solid #e0e0e0',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '20px',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  -
                </button>
                <span style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  minWidth: '40px',
                  textAlign: 'center'
                }}>
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  style={{
                    width: '45px',
                    height: '45px',
                    background: 'white',
                    border: '2px solid #e0e0e0',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '20px',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <button
              onClick={addToCart}
              style={{
                width: '100%',
                padding: '20px',
                background: '#000',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '700',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                marginBottom: '40px',
                transition: 'all 0.3s'
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
              <ShoppingCart size={22} />
              Add to Cart - ${(parseFloat(selectedVariant?.retail_price) * quantity).toFixed(2)}
            </button>

            {/* Product Description */}
            <div style={{
              padding: '30px',
              background: 'white',
              borderRadius: '12px',
              border: '1px solid #e0e0e0'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '700',
                marginBottom: '20px',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                Product Details
              </h3>
              <div style={{
                fontSize: '15px',
                lineHeight: '1.8',
                color: '#666'
              }}>
                <p style={{ marginBottom: '15px' }}>
                  Premium quality {product.sync_product.name.toLowerCase()} made with care.
                </p>
                <ul style={{ paddingLeft: '20px', margin: '20px 0' }}>
                  <li>High-quality materials</li>
                  <li>Made to order</li>
                  <li>Worldwide shipping available</li>
                  <li>100% satisfaction guarantee</li>
                  <li>Machine washable</li>
                </ul>
                <p style={{ marginTop: '20px', fontSize: '13px', color: '#999' }}>
                  <strong>SKU:</strong> {selectedVariant?.sku}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Zoom Modal */}
      {showZoom && (
        <div
          onClick={() => setShowZoom(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.95)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
            cursor: 'zoom-out'
          }}
        >
          <button
            onClick={() => setShowZoom(false)}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={24} />
          </button>
          <img
            src={allImages[selectedImage]?.url}
            alt={product.sync_product.name}
            style={{
              maxWidth: '90%',
              maxHeight: '90%',
              objectFit: 'contain'
            }}
          />
        </div>
      )}
    </div>
  );
}
