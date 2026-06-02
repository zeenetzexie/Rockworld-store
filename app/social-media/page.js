'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Facebook, Copy, Check, Edit, Sparkles, Instagram, Twitter } from 'lucide-react';

export default function SocialMediaManager() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [postText, setPostText] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [platform, setPlatform] = useState('facebook'); // facebook, instagram, twitter

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/printful/products');
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const generatePostText = (product, selectedPlatform) => {
    const variants = product.sync_variants || [];
    const minPrice = variants.length > 0 ? 
      Math.min(...variants.map(v => parseFloat(v.retail_price))) : 0;
    
    const storeUrl = typeof window !== 'undefined' ? window.location.origin : 'your-store-url';
    
    if (selectedPlatform === 'facebook') {
      return `🔥 NEW ARRIVAL 🔥

${product.name}

✨ Premium Quality
💎 Exclusive Design  
🚚 Worldwide Shipping
💯 Money-Back Guarantee

Starting from $${minPrice.toFixed(2)}

Order now at ROCKWORLD! 🛍️

👉 Shop: ${storeUrl}
📧 Email: rockworldstore@outlook.com
📱 WhatsApp: +260975473982

#ROCKWORLD #Fashion #Style #Shopping #NewArrival #Premium #Quality #OnlineShopping #ExclusiveDesign #ShopNow #Zambia #Fashion2025`;
    } else if (selectedPlatform === 'instagram') {
      return `✨ NEW DROP ✨

${product.name}

💎 Premium Quality
🌍 Worldwide Shipping
💳 Secure Checkout

From $${minPrice.toFixed(2)}

🛍️ Shop now - Link in bio!

.
.
.
#ROCKWORLD #fashion #style #shopping #newcollection #premium #instafashion #fashionista #ootd #shopsmall #onlineshopping #fashionblogger #styleinspiration #zambia #lusaka #shopnow #exclusive #trending #musthave #fashionaddict`;
    } else {
      // Twitter
      return `🔥 NEW: ${product.name}

✨ Premium quality
🚚 Ships worldwide  
💰 From $${minPrice.toFixed(2)}

Shop now! 👇
${storeUrl}

#ROCKWORLD #Fashion #NewArrival #Shopping`;
    }
  };

  const selectProduct = (product) => {
    setSelectedProduct(product);
    setPostText(generatePostText(product, platform));
    setCopied(false);
  };

  const changePlatform = (newPlatform) => {
    setPlatform(newPlatform);
    if (selectedProduct) {
      setPostText(generatePostText(selectedProduct, newPlatform));
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(postText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      alert('Failed to copy. Please select and copy manually.');
    }
  };

  const downloadImage = () => {
    if (!selectedProduct) return;
    const imageUrl = selectedProduct.thumbnail_url;
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${selectedProduct.name}.jpg`;
    link.target = '_blank';
    link.click();
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
      {/* Header */}
      <header style={{
        background: 'white',
        borderBottom: '1px solid #e0e0e0',
        padding: '20px 0',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <img src="/logo-header.png" alt="ROCKWORLD" style={{ width: '40px', height: '40px' }} />
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#000', margin: 0 }}>
                Social Media Manager
              </h1>
              <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
                Generate posts for Facebook, Instagram & Twitter
              </p>
            </div>
          </div>
          <Link
            href="/"
            style={{
              padding: '12px 24px',
              background: '#000',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.3s'
            }}
          >
            ← Back to Store
          </Link>
        </div>
      </header>

      {/* Info Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '30px 40px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '28px', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            <Sparkles size={32} />
            Quick Social Media Posts
          </h2>
          <p style={{ fontSize: '16px', opacity: 0.95 }}>
            Select a product → Edit the post → Copy → Paste to Facebook/Instagram/Twitter! 🚀
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '40px',
        display: 'grid',
        gridTemplateColumns: selectedProduct ? '1fr 550px' : '1fr',
        gap: '40px'
      }}>
        {/* Products Grid */}
        <div>
          <h2 style={{
            fontSize: '24px',
            marginBottom: '25px',
            color: '#333'
          }}>
            📦 Select a Product
          </h2>

          {loading && (
            <div style={{
              textAlign: 'center',
              padding: '80px',
              background: 'white',
              borderRadius: '16px',
              color: '#999'
            }}>
              <div style={{
                width: '50px',
                height: '50px',
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #667eea',
                borderRadius: '50%',
                margin: '0 auto 20px',
                animation: 'spin 1s linear infinite'
              }} />
              Loading products...
            </div>
          )}

          {error && (
            <div style={{
              padding: '20px',
              background: '#fee',
              border: '2px solid #fcc',
              borderRadius: '12px',
              color: '#c00',
              marginBottom: '20px'
            }}>
              {error}
            </div>
          )}

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '25px'
          }}>
            {products.map((product) => (
              <div
                key={product.id}
                onClick={() => selectProduct(product)}
                style={{
                  background: 'white',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  border: selectedProduct?.id === product.id ? '3px solid #667eea' : '1px solid #e0e0e0',
                  boxShadow: selectedProduct?.id === product.id ? '0 12px 30px rgba(102,126,234,0.3)' : '0 4px 12px rgba(0,0,0,0.08)'
                }}
                onMouseEnter={(e) => {
                  if (selectedProduct?.id !== product.id) {
                    e.currentTarget.style.transform = 'translateY(-6px)';
                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedProduct?.id !== product.id) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                  }
                }}
              >
                <div style={{ position: 'relative' }}>
                  <img
                    src={product.thumbnail_url}
                    alt={product.name}
                    style={{
                      width: '100%',
                      height: '220px',
                      objectFit: 'cover'
                    }}
                  />
                  {selectedProduct?.id === product.id && (
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      background: '#667eea',
                      color: 'white',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '700',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <Check size={14} />
                      Selected
                    </div>
                  )}
                </div>
                <div style={{ padding: '18px' }}>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    marginBottom: '8px',
                    color: '#333',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {product.name}
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#666',
                    margin: 0
                  }}>
                    {product.sync_variants?.length || 0} variants
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Post Editor */}
        {selectedProduct && (
          <div style={{
            position: 'sticky',
            top: '20px',
            height: 'fit-content'
          }}>
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '30px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
            }}>
              {/* Platform Selector */}
              <div style={{ marginBottom: '25px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '700',
                  marginBottom: '12px',
                  color: '#333'
                }}>
                  Choose Platform:
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => changePlatform('facebook')}
                    style={{
                      flex: 1,
                      padding: '14px',
                      background: platform === 'facebook' ? '#1877f2' : '#f0f0f0',
                      color: platform === 'facebook' ? 'white' : '#666',
                      border: 'none',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontWeight: '700',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.3s'
                    }}
                  >
                    <Facebook size={18} />
                    Facebook
                  </button>
                  <button
                    onClick={() => changePlatform('instagram')}
                    style={{
                      flex: 1,
                      padding: '14px',
                      background: platform === 'instagram' ? 'linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)' : '#f0f0f0',
                      color: platform === 'instagram' ? 'white' : '#666',
                      border: 'none',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontWeight: '700',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.3s'
                    }}
                  >
                    <Instagram size={18} />
                    Instagram
                  </button>
                  <button
                    onClick={() => changePlatform('twitter')}
                    style={{
                      flex: 1,
                      padding: '14px',
                      background: platform === 'twitter' ? '#1DA1F2' : '#f0f0f0',
                      color: platform === 'twitter' ? 'white' : '#666',
                      border: 'none',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontWeight: '700',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.3s'
                    }}
                  >
                    <Twitter size={18} />
                    Twitter
                  </button>
                </div>
              </div>

              <h3 style={{
                fontSize: '20px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: '#333'
              }}>
                <Edit size={24} />
                Edit Your Post
              </h3>

              {/* Product Image Preview */}
              <div style={{
                marginBottom: '20px',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '2px solid #f0f0f0',
                position: 'relative'
              }}>
                <img
                  src={selectedProduct.thumbnail_url}
                  alt={selectedProduct.name}
                  style={{
                    width: '100%',
                    height: '280px',
                    objectFit: 'cover'
                  }}
                />
                <button
                  onClick={downloadImage}
                  style={{
                    position: 'absolute',
                    bottom: '12px',
                    right: '12px',
                    padding: '10px 16px',
                    background: 'rgba(0,0,0,0.7)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '600',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  Download Image
                </button>
              </div>

              {/* Text Editor */}
              <textarea
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                rows={platform === 'instagram' ? 14 : 12}
                style={{
                  width: '100%',
                  padding: '16px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontFamily: 'inherit',
                  lineHeight: '1.7',
                  resize: 'vertical',
                  marginBottom: '15px'
                }}
                placeholder="Edit your post here..."
              />

              {/* Character Count */}
              <div style={{
                textAlign: 'right',
                fontSize: '13px',
                color: '#999',
                marginBottom: '20px'
              }}>
                {postText.length} characters
              </div>

              {/* Success Animation */}
              {copied && (
                <div style={{
                  padding: '16px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  borderRadius: '12px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  fontWeight: '700',
                  animation: 'slideIn 0.3s ease-out'
                }}>
                  <Check size={24} />
                  Copied to Clipboard! ✨
                </div>
              )}

              {/* Copy Button */}
              <button
                onClick={copyToClipboard}
                style={{
                  width: '100%',
                  padding: '18px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: '700',
                  fontSize: '17px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  transition: 'all 0.3s',
                  boxShadow: '0 8px 20px rgba(102,126,234,0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 12px 30px rgba(102,126,234,0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(102,126,234,0.3)';
                }}
              >
                <Copy size={22} />
                Copy Post & Image URL
              </button>

              {/* Instructions */}
              <div style={{
                marginTop: '25px',
                padding: '20px',
                background: '#f8f9fa',
                borderRadius: '12px',
                fontSize: '14px',
                lineHeight: '1.8',
                color: '#555'
              }}>
                <strong style={{ display: 'block', marginBottom: '10px', color: '#333' }}>
                  📝 How to post:
                </strong>
                1. Click "Copy Post & Image URL"<br/>
                2. Click "Download Image" above<br/>
                3. Go to {platform === 'facebook' ? 'Facebook' : platform === 'instagram' ? 'Instagram' : 'Twitter'}<br/>
                4. Create new post<br/>
                5. Upload the downloaded image<br/>
                6. Paste the text<br/>
                7. Edit if needed & Post! 🎉
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
