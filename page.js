'use client';

import React, { useState, useEffect } from 'react';

export default function StorePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/printful/products');
        const data = await response.json();
        setProducts(data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

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
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
        <h2>Products</h2>
        
        {loading ? (
          <p>Loading products...</p>
        ) : products.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
            {products.map((product) => (
              <div key={product.id} style={{
                background: 'white',
                borderRadius: '8px',
                padding: '16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}>
                {product.thumbnail_url && (
                  <img 
                    src={product.thumbnail_url} 
                    alt={product.title}
                    style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '4px', marginBottom: '12px' }}
                  />
                )}
                <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>{product.title}</h3>
                <p style={{ color: '#666', fontSize: '14px', margin: '0' }}>
                  {product.variants?.length || 0} variants
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p>No products found</p>
        )}
      </main>

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
