import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CakeModal from '../components/CakeModal';
import { ArrowRight, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Home() {
  const [selectedCake, setSelectedCake] = useState(null);
  const [loading, setLoading] = useState(true);
  const [carouselProducts, setCarouselProducts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
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
        // Fetch carousel products
        const carouselIds = [
          settingsObj.carousel_product_1,
          settingsObj.carousel_product_2,
          settingsObj.carousel_product_3
        ].filter(id => id && id !== '');

        let carouselItems = products.filter(p => carouselIds.includes(p.id.toString()));
        
        // Ensure we have at least 3 for the effect, fallback to first 3 if none set
        if (carouselItems.length === 0) {
          carouselItems = products.slice(0, 3);
        } else if (carouselItems.length < 3) {
          carouselItems = [...carouselItems, ...products.slice(0, 3 - carouselItems.length)];
        }
        
        setCarouselProducts(carouselItems);

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

  useEffect(() => {
    if (carouselProducts.length > 0) {
      const speed = parseInt(settings.carousel_speed) || 3000;
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % carouselProducts.length);
      }, speed);
      return () => clearInterval(interval);
    }
  }, [carouselProducts.length, settings.carousel_speed]);

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
          
          <div className="hero-visual carousel-container">
            <div className="hero-visual-bg"></div>
            {carouselProducts.map((p, idx) => {
              // Calculate relative positions for the shuffle effect
              let position = (idx - currentIndex + carouselProducts.length) % carouselProducts.length;
              
              // We want 3 products: 0 (center), 1 (right/next), 2 (left/prev)
              let className = "carousel-item";
              if (position === 0) className += " active";
              else if (position === 1) className += " next";
              else className += " prev";

              return (
                <div key={p.id} className={className} onClick={() => setSelectedCake(p)}>
                  <img src={p.image_url} alt={p.name} />
                  {position === 0 && (
                    <div className="item-info">
                      <h3>{p.name}</h3>
                      <button className="btn btn-yellow btn-sm">View Details</button>
                    </div>
                  )}
                </div>
              );
            })}
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
