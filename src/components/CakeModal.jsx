import { X, ShoppingBag, Plus, Minus } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '../context/CartContext';

export default function CakeModal({ cake, onClose }) {
  const { addToCart } = useCart();
  const [showCustomize, setShowCustomize] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [customization, setCustomization] = useState({
    candles: 0,
    message: '',
    letters: ''
  });

  if (!cake) return null;

  const handleAddToCart = () => {
    addToCart(cake, quantity, customization);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{
        maxWidth: showCustomize ? '1000px' : '900px',
        gridTemplateColumns: showCustomize ? '1fr 1fr 1.2fr' : '1fr 1fr'
      }}>
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>
        
        <div className="modal-showcase">
          <div className="cake-wrapper">
            <img src={cake.image_url || cake.image} alt={cake.name} className="cake-image" />
          </div>
        </div>
        
        <div className="modal-info">
          <span className="modal-tag">{cake.category || 'Signature Cake'}</span>
          <h2 className="modal-title text-gradient">{cake.name}</h2>
          <p className="modal-desc">
            {cake.description || "Experience layers of rich flavor and premium ingredients in every bite. Perfectly crafted for your celebrations."}
          </p>
          <div className="modal-price">
            ₱{cake.price ? cake.price.toFixed(2) : '750.00'}
          </div>

          <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f5f5f5', padding: '0.5rem', borderRadius: '999px'}}>
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} style={{border: 'none', background: '#fff', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer'}}><Minus size={14}/></button>
              <span style={{width: '30px', textAlign: 'center', fontWeight: '700'}}>{quantity}</span>
              <button onClick={() => setQuantity(q => q + 1)} style={{border: 'none', background: '#fff', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer'}}><Plus size={14}/></button>
            </div>
          </div>
          
          <div style={{display: 'flex', gap: '1rem'}}>
            <button className="btn btn-primary" style={{flex: 1}} onClick={handleAddToCart}>
              <ShoppingBag size={18} /> Add to Order
            </button>
            {!showCustomize && (
              <button className="btn btn-outline" style={{padding: '0 1.5rem'}} onClick={() => setShowCustomize(true)}>
                Customize
              </button>
            )}
          </div>
        </div>

        {showCustomize && (
          <div style={{padding: '3rem', borderLeft: '1px solid #eee', background: '#fdfdfd'}}>
            <h3 style={{marginBottom: '1.5rem'}}>Customize your Cake</h3>
            
            <div className="form-group">
              <label className="form-label">Number of Candles</label>
              <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                <input 
                  type="number" 
                  className="form-control" 
                  value={customization.candles}
                  onChange={(e) => setCustomization({...customization, candles: parseInt(e.target.value) || 0})}
                  min="0"
                  max="100"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Custom Message (on Cake)</label>
              <textarea 
                className="form-control" 
                placeholder="Happy Birthday..."
                rows="2"
                value={customization.message}
                onChange={(e) => setCustomization({...customization, message: e.target.value})}
                style={{resize: 'none'}}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Letters / Special Instructions</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Name or short text..."
                value={customization.letters}
                onChange={(e) => setCustomization({...customization, letters: e.target.value})}
              />
            </div>

            <button className="btn btn-outline" style={{width: '100%', marginTop: '1rem'}} onClick={() => setShowCustomize(false)}>
              Done Customizing
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
