import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Package, Truck, CheckCircle, Clock, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (name, image_url)
          )
        `)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  }

  const updateItemQuantity = async (orderId, itemId, currentQty, delta, itemPrice) => {
    const newQty = currentQty + delta;
    if (newQty < 1) return;

    try {
      // 1. Update order item
      const { error: itemError } = await supabase
        .from('order_items')
        .update({ quantity: newQty })
        .eq('id', itemId);

      if (itemError) throw itemError;

      // 2. Update order total
      const order = orders.find(o => o.id === orderId);
      const newTotal = order.total_amount + (delta * itemPrice);
      
      const { error: orderError } = await supabase
        .from('orders')
        .update({ total_amount: newTotal })
        .eq('id', orderId);

      if (orderError) throw orderError;

      fetchOrders();
    } catch (err) {
      alert(`Error updating order: ${err.message}`);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending': return <Clock size={20} className="text-warning" />;
      case 'Processing': return <Package size={20} style={{color: '#3b82f6'}} />;
      case 'Out for Delivery': return <Truck size={20} style={{color: '#8b5cf6'}} />;
      case 'Completed': return <CheckCircle size={20} style={{color: '#10b981'}} />;
      default: return <Clock size={20} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return '#f59e0b';
      case 'Processing': return '#3b82f6';
      case 'Out for Delivery': return '#8b5cf6';
      case 'Completed': return '#10b981';
      case 'Cancelled': return '#ef4444';
      default: return '#666';
    }
  };

  return (
    <div className="container" style={{paddingTop: '4rem', paddingBottom: '6rem', maxWidth: '800px'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
        <h1 className="text-gradient" style={{margin: 0}}>My Orders</h1>
        <button onClick={() => navigate('/menu')} className="btn btn-primary" style={{padding: '0.6rem 1.2rem', fontSize: '0.9rem'}}>
          <ShoppingBag size={18} /> Shop More
        </button>
      </div>

      {loading ? (
        <div style={{textAlign: 'center', padding: '3rem'}}>Loading your orders...</div>
      ) : orders.length === 0 ? (
        <div style={{textAlign: 'center', padding: '5rem', background: '#fff', borderRadius: '24px', boxShadow: 'var(--shadow-sm)'}}>
          <div style={{fontSize: '4rem', marginBottom: '1rem'}}>📦</div>
          <h3>No orders yet</h3>
          <p style={{color: '#666', marginBottom: '2rem'}}>Your sweet treats are just a few clicks away!</p>
          <button onClick={() => navigate('/menu')} className="btn btn-primary">Browse Menu</button>
        </div>
      ) : (
        <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
          {orders.map(order => (
            <div key={order.id} style={{background: '#fff', borderRadius: '20px', padding: '1.5rem', boxShadow: 'var(--shadow-sm)', border: '1px solid #eee'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', borderBottom: '1px solid #f5f5f5', paddingBottom: '1rem'}}>
                <div>
                  <div style={{fontSize: '0.8rem', color: '#888', marginBottom: '0.25rem'}}>Order #ORD-{order.id}</div>
                  <div style={{fontSize: '0.9rem', fontWeight: '600'}}>{new Date(order.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}</div>
                </div>
                <div style={{
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  padding: '0.5rem 1rem', 
                  borderRadius: '99px', 
                  background: `${getStatusColor(order.status)}15`,
                  color: getStatusColor(order.status),
                  fontSize: '0.85rem',
                  fontWeight: '700'
                }}>
                  {getStatusIcon(order.status)}
                  {order.status}
                </div>
              </div>

              <div style={{display: 'flex', flexDirection: 'column', gap: '1.25rem'}}>
                {order.order_items.map((item, idx) => (
                  <div key={idx} style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
                    <img 
                      src={item.products?.image_url} 
                      alt={item.products?.name} 
                      style={{width: '60px', height: '60px', objectFit: 'contain', background: '#f9f9f9', borderRadius: '10px', mixBlendMode: 'multiply'}} 
                    />
                    <div style={{flex: 1}}>
                      <div style={{fontWeight: '600'}}>{item.products?.name}</div>
                      <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem'}}>
                        {order.status === 'Pending' ? (
                          <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f5f5f5', padding: '2px 8px', borderRadius: '6px'}}>
                            <button 
                              onClick={() => updateItemQuantity(order.id, item.id, item.quantity, -1, item.price)}
                              style={{border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center'}}
                            >
                              <Minus size={14}/>
                            </button>
                            <span style={{fontSize: '0.9rem', fontWeight: '700', minWidth: '15px', textAlign: 'center'}}>{item.quantity}</span>
                            <button 
                              onClick={() => updateItemQuantity(order.id, item.id, item.quantity, 1, item.price)}
                              style={{border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center'}}
                            >
                              <Plus size={14}/>
                            </button>
                          </div>
                        ) : (
                          <span style={{fontSize: '0.9rem', color: '#666'}}>Qty: {item.quantity}</span>
                        )}
                        <span style={{fontSize: '0.85rem', color: 'var(--primary-red)', fontWeight: '700'}}>₱{item.price.toFixed(2)}</span>
                      </div>
                    </div>
                    <div style={{fontWeight: '700'}}>₱{(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                ))}
              </div>

              <div style={{marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #f5f5f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div style={{fontSize: '0.9rem', color: '#666'}}>
                  <strong>Total:</strong> <span style={{fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary-red)', marginLeft: '0.5rem'}}>₱{order.total_amount.toFixed(2)}</span>
                </div>
                <div style={{fontSize: '0.8rem', color: '#888'}}>
                  Paid via {order.payment_method.toUpperCase()}
                </div>
              </div>
              
              {order.delivery_address && (
                <div style={{marginTop: '1rem', fontSize: '0.85rem', color: '#666', background: '#f9f9f9', padding: '0.75rem', borderRadius: '10px', display: 'flex', gap: '0.5rem'}}>
                  <Truck size={16} /> <strong>Delivery to:</strong> {order.delivery_address}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
