import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios'; // Using a direct axios import for public routes

const PublicMenu = () => {
  const { restaurantSlug } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Assuming your backend is running on localhost:5000 or similar
        // You might need to adjust this base URL based on your deployment
        const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/public/products/${restaurantSlug}`);
        setProducts(response.data);
      } catch (err) {
        setError('Failed to load menu. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [restaurantSlug]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '20px' }}>Loading menu...</div>;
  }

  if (error) {
    return <div style={{ textAlign: 'center', padding: '20px', color: 'red' }}>{error}</div>;
  }

  if (products.length === 0) {
    return <div style={{ textAlign: 'center', padding: '20px' }}>No products found for this restaurant.</div>;
  }

  // Group products by category
  const productsByCategory = products.reduce((acc, product) => {
    const category = product.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {});

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '20px auto', padding: '20px', border: '1px solid #eee', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>Digital Menu</h1>
      {
        Object.entries(productsByCategory).map(([category, prods]) => (
          <div key={category} style={{ marginBottom: '30px' }}>
            <h2 style={{ borderBottom: '2px solid #f0f0f0', paddingBottom: '10px', color: '#555' }}>{category}</h2>
            {
              prods.map(product => (
                <div key={product.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0', borderBottom: '1px dashed #eee' }}>
                  <div>
                    <h3 style={{ margin: '0', color: '#333' }}>{product.name}</h3>
                    <p style={{ margin: '5px 0 0', color: '#777', fontSize: '0.9em' }}>{product.description}</p>
                  </div>
                  <span style={{ fontWeight: 'bold', color: '#333' }}>R$ {parseFloat(product.price).toFixed(2)}</span>
                </div>
              ))
            }
          </div>
        ))
      }
    </div>
  );
};

export default PublicMenu;