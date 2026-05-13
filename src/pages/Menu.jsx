import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import CakeModal from '../components/CakeModal';

export default function Menu() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCake, setSelectedCake] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category');
  const fallbackProducts = [
    { id: 1, name: "NEW Ube Bloom Cake", price: 750, image_url: "https://redribbonbakeshop.com.ph/cdn/shop/files/UbeBloom-Web.jpg?v=1714545524&width=600" },
    { id: 2, name: "Round Supreme Chocolate-Caramel Dedication Cake", price: 850, image_url: "https://redribbonbakeshop.com.ph/cdn/shop/files/RoundSupremeChocolateCaramel.jpg?v=1714545524&width=600" },
    { id: 3, name: "Supreme Chocolate-Caramel Dedication Cake 8x12", price: 950, image_url: "https://redribbonbakeshop.com.ph/cdn/shop/files/SupremeChocolateCaramel.jpg?v=1714545524&width=600" },
    { id: 4, name: "Supreme Caramel-Mocha Dedication Cake 8x12", price: 950, image_url: "https://redribbonbakeshop.com.ph/cdn/shop/files/SupremeCaramelMocha.jpg?v=1714545524&width=600" },
  ];

  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data, error } = await supabase.from('products').select('*');
        if (error) throw error;
        if (data && data.length > 0) {
          setProducts(data);
        } else {
          setProducts(fallbackProducts);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setProducts(fallbackProducts);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(p => {
    const matchesCategory = categoryFilter 
      ? (categoryFilter === "Pastries, Breads & Delicacies" 
          ? (p.category === "Pastries, Breads & Delicacies" || p.category === "Pastries")
          : p.category === categoryFilter)
      : true;
    
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="container" style={{paddingTop: '3rem', paddingBottom: '4rem'}}>
      <h1 className="text-gradient" style={{fontSize: '3.5rem', marginBottom: '1rem', textAlign: 'center'}}>Our Masterpieces</h1>
      <p style={{color: '#666', marginBottom: '2rem', textAlign: 'center', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 1rem'}}>
        Explore our collection of signature cakes. Click on any cake to customize and add it to your cart.
      </p>

      <div className="search-container">
        <div className="search-box">
          <Search size={20} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search for your favorite cake..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {categoryFilter && (
        <div style={{textAlign: 'center', marginBottom: '3rem'}}>
          <span style={{background: '#f8f9fa', padding: '0.5rem 1.2rem', borderRadius: '999px', fontWeight: '600', border: '1px solid #eee'}}>
            Showing: {categoryFilter}
          </span>
          <button 
            onClick={() => window.history.pushState({}, '', '/menu')}
            className="btn-link" 
            style={{marginLeft: '1rem', color: 'var(--primary-red)', cursor: 'pointer', border: 'none', background: 'none', fontWeight: '600'}}
          >
            Clear Filter
          </button>
        </div>
      )}

      {loading ? (
        <p className="text-center" style={{fontSize: '1.2rem'}}>Preparing the display...</p>
      ) : (
        <div className="product-grid">
          {filteredProducts.length === 0 ? (
            <div style={{gridColumn: '1/-1', textAlign: 'center', padding: '3rem'}}>
              <p style={{fontSize: '1.2rem', color: '#666'}}>No products found in this category yet.</p>
            </div>
          ) : (
            filteredProducts.map((item) => (
            <div key={item.id} className="product-card" onClick={() => setSelectedCake(item)}>
              <div className="product-image-wrapper">
                <img src={item.image_url || 'https://via.placeholder.com/300?text=No+Image'} alt={item.name} className="product-image" />
              </div>
              <h3 className="product-title">{item.name}</h3>
              <p className="product-price">₱{item.price ? item.price.toFixed(2) : '0.00'}</p>
              <button className="btn btn-outline" style={{width: '100%'}}>
                Add to Cart
              </button>
            </div>
            ))
          )}
        </div>
      )}

      {selectedCake && (
        <CakeModal 
          cake={selectedCake} 
          onClose={() => setSelectedCake(null)} 
        />
      )}
    </div>
  );
}
