'use client';

import React, { useState, useEffect } from 'react';

export default function StorePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        console.log('Fetching products...');
        const response = await fetch('/api/printful/products');
        console.log('Response status:', response.status);
        
        const data = await response.json();
        console.log('Raw API response:', data);
        
        // Handle different response formats
        let productList = [];
        
        if (Array.isArray(data)) {
          productList = data;
        } else if (data && Array.isArray(data.data)) {
          productList = data.data;
        } else if (data && Array.isArray(data.products)) {
          productList = data.products;
        } else if (data && typeof data === 'object') {
          // If it's an object, try to extract array from any property
          for (const key in data) {
            if (Array.isArray(data[key])) {
              productList = data[key];
              break;
            }
          }
        }
        
        console.log('Processed products:', productList);
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
        
        {error ? (
          <div style={{
            background: '#ffebee',
            border: '1px solid #ef5350',
            color: '#c62828',
            padding: '16px',
            borderRadius: '4px',
            marginBottom: '20px',
          }}>
            <p><strong>Error loading products:</strong> {error}</p>
            <p style={{ fontSize: '12px', margin: '8px 0 0 0' }}>Check your PRINTFUL_API_KEY in Vercel environment variables.</p>
          </div>
        ) : loading ? (
          <p>Loading products...</p>
        ) : products && products.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
            {products.map((product) => (
              <div key={product.id || product.title} style={{
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
                    onError={(e) => {
                      e.target.style.background = '#ddd';
                      e.target.style.display = 'flex';
                      e.target.style.alignItems = 'center';
                      e.target.style.justifyContent = 'center';
                    }}
                  />
                )}
                <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>{product.title}</h3>
                <p style={{ color: '#666', fontSize: '14px', margin: '0' }}>
                  {product.variants?.length || 0} variants available
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            background: '#fff3e0',
            border: '1px solid #ff9800',
            color: '#e65100',
            padding: '16px',
            borderRadius: '4px',
          }}>
            <p><strong>No products found</strong></p>
            <p style={{ fontSize: '12px', margin: '8px 0 0 0' }}>Make sure your Printful products are published and your API key is correct.</p>
          </div>
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
