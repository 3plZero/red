import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Eye, Clock, Package, Truck, CheckCircle, XCircle } from 'lucide-react';

export default function SalesTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  }

  const updateStatus = async (orderId, newStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);
      
      if (error) throw error;
      fetchOrders();
    } catch (err) {
      alert(`Error updating status: ${err.message}`);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Pending': return { bg: '#fff7ed', text: '#9a3412', icon: <Clock size={14}/> };
      case 'Processing': return { bg: '#eff6ff', text: '#1e40af', icon: <Package size={14}/> };
      case 'Out for Delivery': return { bg: '#f5f3ff', text: '#5b21b6', icon: <Truck size={14}/> };
      case 'Completed': return { bg: '#f0fdf4', text: '#166534', icon: <CheckCircle size={14}/> };
      case 'Cancelled': return { bg: '#fef2f2', text: '#991b1b', icon: <XCircle size={14}/> };
      default: return { bg: '#f9fafb', text: '#374151' };
    }
  };

  return (
    <div>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
        <h2 className="text-primary">Sales / Orders</h2>
        <button className="btn btn-outline" onClick={fetchOrders} style={{fontSize: '0.85rem'}}>Refresh Orders</button>
      </div>

      <div className="table-wrapper">
        {loading ? (
          <div style={{padding: '3rem', textAlign: 'center'}}>Loading sales data...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Total (₱)</th>
                <th>Status</th>
                <th>Update Progress</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{textAlign: 'center', padding: '2rem'}}>No orders found.</td>
                </tr>
              ) : (
                orders.map(order => {
                  const style = getStatusStyle(order.status);
                  return (
                    <tr key={order.id}>
                      <td style={{fontWeight: '600'}}>ORD-{order.id}</td>
                      <td style={{fontSize: '0.9rem', color: '#666'}}>
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        <div style={{fontWeight: '500'}}>{order.customer_name}</div>
                        <div style={{fontSize: '0.75rem', color: '#888', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                          {order.delivery_address || 'Walk-in'}
                        </div>
                      </td>
                      <td style={{fontWeight: '700', color: 'var(--primary-red)'}}>
                        ₱{order.total_amount.toFixed(2)}
                      </td>
                      <td>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          padding: '0.4rem 0.8rem', 
                          borderRadius: '999px', 
                          fontSize: '0.8rem',
                          fontWeight: '700',
                          backgroundColor: style.bg,
                          color: style.text
                        }}>
                          {style.icon}
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <select 
                          className="form-control" 
                          value={order.status}
                          onChange={(e) => updateStatus(order.id, e.target.value)}
                          style={{
                            padding: '0.3rem 0.5rem', 
                            fontSize: '0.85rem', 
                            width: 'auto',
                            minWidth: '150px'
                          }}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Out for Delivery">Out for Delivery</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
