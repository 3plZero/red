import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, useSearchParams } from 'react-router-dom';

import DashboardOverview from '../components/admin/DashboardOverview';
import InventoryTab from '../components/admin/InventoryTab';
import SalesTab from '../components/admin/SalesTab';
import SettingsTab from '../components/admin/SettingsTab';
import LocationsTab from '../components/admin/LocationsTab';

export default function AdminDashboard({ session }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const activeTab = searchParams.get('tab') || 'dashboard';
  const setActiveTab = (tab) => setSearchParams({ tab });

  async function fetchData() {
    try {
      setLoading(true);
      const [productsRes, ordersRes] = await Promise.all([
        supabase.from('products').select('*'),
        supabase.from('orders').select('*').eq('status', 'Completed')
      ]);

      if (productsRes.error) throw productsRes.error;
      if (ordersRes.error) throw ordersRes.error;

      setProducts(productsRes.data || []);
      setOrders(ordersRes.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!session) {
      navigate('/login');
      return;
    }

    const isAdmin = session?.user?.email?.toLowerCase().includes('admin') || 
                    session?.user?.user_metadata?.role === 'admin' ||
                    session?.user?.user_metadata?.is_admin === true ||
                    localStorage.getItem('force_admin') === 'true';
    if (!isAdmin) {
      navigate('/');
      return;
    }

    fetchData();
  }, [session, navigate]);

  if (!session) return null;

  return (
    <div className="dashboard-layout">
      <div className="sidebar">
        <h3 style={{marginBottom: '2rem', paddingLeft: '1rem'}}>Admin Panel</h3>
        <button 
          onClick={() => setActiveTab('dashboard')} 
          className={`sidebar-link ${activeTab === 'dashboard' ? 'active' : ''}`}
          style={{ width: '100%', textAlign: 'left', border: 'none', background: activeTab === 'dashboard' ? 'rgba(255,255,255,0.1)' : 'transparent', cursor: 'pointer', fontSize: '1rem' }}
        >
          Dashboard
        </button>
        <button 
          onClick={() => setActiveTab('inventory')} 
          className={`sidebar-link ${activeTab === 'inventory' ? 'active' : ''}`}
          style={{ width: '100%', textAlign: 'left', border: 'none', background: activeTab === 'inventory' ? 'rgba(255,255,255,0.1)' : 'transparent', cursor: 'pointer', fontSize: '1rem' }}
        >
          Inventory
        </button>
        <button 
          onClick={() => setActiveTab('sales')} 
          className={`sidebar-link ${activeTab === 'sales' ? 'active' : ''}`}
          style={{ width: '100%', textAlign: 'left', border: 'none', background: activeTab === 'sales' ? 'rgba(255,255,255,0.1)' : 'transparent', cursor: 'pointer', fontSize: '1rem' }}
        >
          Sales / Orders
        </button>
        <button 
          onClick={() => setActiveTab('locations')} 
          className={`sidebar-link ${activeTab === 'locations' ? 'active' : ''}`}
          style={{ width: '100%', textAlign: 'left', border: 'none', background: activeTab === 'locations' ? 'rgba(255,255,255,0.1)' : 'transparent', cursor: 'pointer', fontSize: '1rem' }}
        >
          Locations
        </button>
        <button 
          onClick={() => setActiveTab('settings')} 
          className={`sidebar-link ${activeTab === 'settings' ? 'active' : ''}`}
          style={{ width: '100%', textAlign: 'left', border: 'none', background: activeTab === 'settings' ? 'rgba(255,255,255,0.1)' : 'transparent', cursor: 'pointer', fontSize: '1rem' }}
        >
          Settings
        </button>
      </div>
      
      <div className="main-content">
        {activeTab === 'dashboard' && <DashboardOverview products={products} orders={orders} />}
        {activeTab === 'inventory' && <InventoryTab products={products} loading={loading} onRefresh={fetchData} />}
        {activeTab === 'sales' && <SalesTab onRefresh={fetchData} />}
        {activeTab === 'locations' && <LocationsTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </div>
    </div>
  );
}
