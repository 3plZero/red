import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { X, Trash2, Plus, Minus, CreditCard, Banknote, Truck, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import AuthModal from './AuthModal';

export default function Cart({ session }) {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, total, isCartOpen, setIsCartOpen, clearCart } = useCart();
  const [step, setStep] = useState('cart'); // 'cart' or 'checkout'
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  if (!isCartOpen) return null;

  const handleProceedToCheckout = () => {
    if (!session) {
      setShowAuthModal(true);
      return;
    }
    setStep('checkout');
  };
  const handleCheckout = async () => {
    const userAddress = session.user.user_metadata?.address;
    if (!userAddress && paymentMethod !== 'cash') {
      alert("Please update your profile with a delivery address first.");
      return;
    }

    setLoading(true);
    try {
      // 1. Create Order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([{
          user_id: session.user.id,
          total_amount: total,
          payment_method: paymentMethod,
          delivery_address: paymentMethod === 'cash' ? 'Walk-in' : userAddress,
          customer_name: session.user.user_metadata?.full_name || session.user.email,
          status: 'Pending'
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Create Order Items
      const orderItems = cart.map(item => ({
        order_id: orderData.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
        customization: item.customization
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      alert(`Order #ORD-${orderData.id} placed successfully!`);
      clearCart();
      setIsCartOpen(false);
      setStep('cart');
      setAddress('');
      navigate('/orders'); // Redirect to orders tracking page
    } catch (err) {
      console.error("Error placing order:", err);
      alert(`Failed to place order: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" style={{display: 'flex', justifyContent: 'flex-end', alignItems: 'stretch'}} onClick={() => setIsCartOpen(false)}>
      <div 
        className="cart-drawer" 
        style={{
          width: '100%', 
          maxWidth: '450px', 
          background: '#fff', 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          boxShadow: '-10px 0 30px rgba(0,0,0,0.1)',
          animation: 'slideInRight 0.3s ease-out',
          zIndex: 1001
        }} 
        onClick={e => e.stopPropagation()}
      >
        <div style={{padding: '2rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <h2 style={{margin: 0}}>{step === 'cart' ? 'Your Order' : 'Checkout'}</h2>
          <button onClick={() => setIsCartOpen(false)} style={{border: 'none', background: 'none', cursor: 'pointer'}}><X /></button>
        </div>

        <div style={{flex: 1, overflowY: 'auto', padding: '2rem'}}>
          {step === 'cart' ? (
            <>
              {cart.length === 0 ? (
                <div style={{textAlign: 'center', marginTop: '5rem'}}>
                  <div style={{fontSize: '4rem', marginBottom: '1rem'}}>🧁</div>
                  <p style={{color: '#888'}}>Your cart is empty.</p>
                  <button onClick={() => setIsCartOpen(false)} className="btn btn-outline" style={{marginTop: '1.5rem'}}>Shop Now</button>
                </div>
              ) : (
                <>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
                    <span style={{fontSize: '0.9rem', color: '#666'}}>{cart.length} items in your bag</span>
                    <button onClick={() => setIsCartOpen(false)} style={{background: 'none', border: 'none', color: 'var(--primary-red)', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer'}}>+ Shop More</button>
                  </div>
                  <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                    {cart.map((item, index) => (
                      <div key={index} style={{display: 'flex', gap: '1rem', paddingBottom: '1.5rem', borderBottom: '1px solid #f5f5f5'}}>
                        <img src={item.image_url || item.image} alt={item.name} style={{width: '80px', height: '80px', objectFit: 'contain', background: '#f9f9f9', borderRadius: '10px', mixBlendMode: 'multiply'}} />
                        <div style={{flex: 1}}>
                          <div style={{display: 'flex', justifyContent: 'space-between'}}>
                            <h4 style={{margin: 0}}>{item.name}</h4>
                            <button onClick={() => removeFromCart(index)} style={{border: 'none', background: 'none', color: '#ff4b4b', cursor: 'pointer'}}><Trash2 size={16}/></button>
                          </div>
                          <p style={{fontSize: '0.9rem', color: 'var(--primary-red)', fontWeight: '700', margin: '0.25rem 0'}}>₱{item.price.toFixed(2)}</p>
                          
                          {item.customization && (
                            <div style={{fontSize: '0.75rem', color: '#666', background: '#f8f8f8', padding: '0.5rem', borderRadius: '5px', marginTop: '0.5rem'}}>
                              {item.customization.candles > 0 && <div>🕯️ {item.customization.candles} Candles</div>}
                              {item.customization.message && <div>✉️ "{item.customization.message}"</div>}
                              {item.customization.letters && <div>🔠 {item.customization.letters}</div>}
                            </div>
                          )}

                          <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem'}}>
                            <button onClick={() => updateQuantity(index, -1)} style={{border: '1px solid #ddd', background: '#fff', borderRadius: '5px', width: '25px', height: '25px'}}><Minus size={12}/></button>
                            <span style={{fontSize: '0.9rem', width: '20px', textAlign: 'center'}}>{item.quantity}</span>
                            <button onClick={() => updateQuantity(index, 1)} style={{border: '1px solid #ddd', background: '#fff', borderRadius: '5px', width: '25px', height: '25px'}}><Plus size={12}/></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div style={{display: 'flex', flexDirection: 'column', gap: '2rem'}}>
              <div>
                <h3 style={{marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}><MapPin size={20}/> Delivery Address</h3>
                <div style={{padding: '1.25rem', background: '#f9f9f9', borderRadius: '12px', border: '1px solid #eee'}}>
                  <p style={{margin: 0, fontSize: '1rem', color: '#333', lineHeight: '1.5'}}>
                    {session?.user?.user_metadata?.address || 'No address set in profile.'}
                  </p>
                  <p style={{margin: '0.5rem 0 0', fontSize: '0.8rem', color: '#888'}}>
                    Saved in your account profile
                  </p>
                </div>
              </div>

              <div>
                <h3 style={{marginBottom: '1rem'}}>Payment Method</h3>
                <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
                  <label style={{
                    display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', 
                    border: paymentMethod === 'cod' ? '2px solid var(--primary-red)' : '1px solid #ddd',
                    borderRadius: '12px', cursor: 'pointer', background: paymentMethod === 'cod' ? 'var(--primary-red-pale)' : '#fff'
                  }}>
                    <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} style={{display: 'none'}} />
                    <Truck size={20} color={paymentMethod === 'cod' ? 'var(--primary-red)' : '#666'} />
                    <span>Cash on Delivery</span>
                  </label>
                  
                  <label style={{
                    display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', 
                    border: paymentMethod === 'card' ? '2px solid var(--primary-red)' : '1px solid #ddd',
                    borderRadius: '12px', cursor: 'pointer', background: paymentMethod === 'card' ? 'var(--primary-red-pale)' : '#fff'
                  }}>
                    <input type="radio" name="payment" value="card" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} style={{display: 'none'}} />
                    <CreditCard size={20} color={paymentMethod === 'card' ? 'var(--primary-red)' : '#666'} />
                    <span>Card Payment</span>
                  </label>

                  <label style={{
                    display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', 
                    border: paymentMethod === 'cash' ? '2px solid var(--primary-red)' : '1px solid #ddd',
                    borderRadius: '12px', cursor: 'pointer', background: paymentMethod === 'cash' ? 'var(--primary-red-pale)' : '#fff'
                  }}>
                    <input type="radio" name="payment" value="cash" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} style={{display: 'none'}} />
                    <Banknote size={20} color={paymentMethod === 'cash' ? 'var(--primary-red)' : '#666'} />
                    <span>Cash (Walk-in)</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{padding: '2rem', borderTop: '1px solid #eee', background: '#fafafa'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem'}}>
            <span style={{fontWeight: '600'}}>Total Amount</span>
            <span style={{fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary-red)'}}>₱{total.toFixed(2)}</span>
          </div>

          {step === 'cart' ? (
            <button 
              className="btn btn-primary" 
              style={{width: '100%', padding: '1.2rem'}} 
              disabled={cart.length === 0}
              onClick={handleProceedToCheckout}
            >
              Proceed to Checkout
            </button>
          ) : (
            <div style={{display: 'flex', gap: '1rem'}}>
              <button className="btn btn-outline" style={{flex: 1}} onClick={() => setStep('cart')}>Back</button>
              <button className="btn btn-primary" style={{flex: 2}} onClick={handleCheckout} disabled={loading || (paymentMethod !== 'cash' && !session?.user?.user_metadata?.address)}>
                {loading ? 'Processing...' : 'Complete Order'}
              </button>
            </div>
          )}
        </div>
      </div>
      
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>

      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)} 
          onLogin={() => {
            setStep('checkout');
            setShowAuthModal(false);
          }}
        />
      )}
    </div>
  );
}
