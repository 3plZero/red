import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CakeModal from '../components/CakeModal';
import { ArrowRight, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Home() {
  const [selectedCake, setSelectedCake] = useState(null);
  const [loading, setLoading] = useState(true);
  const [featuredCakes, setFeaturedCakes] = useState([]);
  const [settings, setSettings] = useState({
    hero_title: 'Crafting Sweet Memories',
    hero_description: 'Experience the perfect blend of premium ingredients and masterful baking.',
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      
      // Fetch settings
      const { data: settingsData } = await supabase.from('site_settings').select('*');
      const settingsObj = {};
      if (settingsData) {
        settingsData.forEach(item => {
          settingsObj[item.key] = item.value;
        });
        setSettings(prev => ({ ...prev, ...settingsObj }));
      }
      // Fetch products
      const { data: products } = await supabase.from('products').select('*');
      
      if (products) {
        // Set featured products
        const featuredIds = (settingsObj.featured_products || '').split(',').map(id => id.trim());
        const featured = products.filter(p => featuredIds.includes(p.id.toString()));
        setFeaturedCakes(featured.length > 0 ? featured : products.slice(0, 3));
      }
    } catch (err) {
      console.error('Error fetching home data:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="container" style={{padding: '5rem', textAlign: 'center'}}>Loading...</div>;

  return (
    <div>
      <section className="modern-hero">
        <div className="hero-blobs">
          <div className="blob-1"></div>
          <div className="blob-2"></div>
        </div>
        
        <div className="container hero-grid">
          <div className="hero-text">
            <h1 className="text-gradient">{settings.hero_title}</h1>
            <p>{settings.hero_description}</p>
            <div style={{display: 'flex', gap: '1rem'}}>
              <Link to="/menu" className="btn btn-primary">
                Explore Menu <ArrowRight size={18} />
              </Link>
            </div>
          </div>
          
          <div className="hero-visual">
            <div className="hero-visual-bg"></div>
            {featuredCakes.length > 0 && (
              <div className="hero-main-cake" onClick={() => setSelectedCake(featuredCakes[0])}>
                <img src={featuredCakes[0].image_url} alt={featuredCakes[0].name} style={{ width: '100%', height: 'auto', transform: 'rotate(-5deg)' }} />
              </div>
            )}
          </div>
        </div>
      </section>
      
      <div className="container">
        <h2 className="section-title text-gradient">Featured Creations</h2>
        <div className="product-grid">
          {featuredCakes.map((item) => (
            <div key={item.id} className="product-card" onClick={() => setSelectedCake(item)}>
              <div className="product-image-wrapper">
                <img src={item.image_url || 'https://via.placeholder.com/300?text=No+Image'} alt={item.name} className="product-image" />
              </div>
              <h3 className="product-title">{item.name}</h3>
              <p className="product-price">₱{item.price ? item.price.toFixed(2) : '0.00'}</p>
              <button className="btn btn-outline" style={{width: '100%'}}>
                View Details
              </button>
            </div>
          ))}
        </div>
      </div>
      
      <footer>
        <div className="container">
          <p>© 2026 Red Ribbon Bakeshop. All rights reserved.</p>
        </div>
      </footer>

      {selectedCake && (
        <CakeModal 
          cake={selectedCake} 
          onClose={() => setSelectedCake(null)} 
        />
      )}
    </div>
  );
}
