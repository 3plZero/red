import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardOverview({ products, orders = [] }) {
  const totalProducts = products?.length || 0;
  
  const stats = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();
    
    // Initialize chart data for the last 7 days
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      chartData.push({
        name: days[d.getDay()],
        sales: 0,
        orders: 0,
        fullDate: d.toDateString()
      });
    }

    let totalSales = 0;
    let totalOrders = orders.length;

    orders.forEach(order => {
      totalSales += order.total_amount;
      const orderDate = new Date(order.created_at).toDateString();
      const chartDay = chartData.find(d => d.fullDate === orderDate);
      if (chartDay) {
        chartDay.sales += order.total_amount;
        chartDay.orders += 1;
      }
    });

    return { totalSales, totalOrders, chartData };
  }, [orders]);

  return (
    <div>
      <h2 className="text-primary" style={{ marginBottom: '2rem' }}>Dashboard Overview</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h4 style={{ color: '#666', marginBottom: '0.5rem', fontSize: '0.9rem', textTransform: 'uppercase' }}>Weekly Sales</h4>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#c02026' }}>₱{stats.totalSales.toLocaleString()}</div>
        </div>
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h4 style={{ color: '#666', marginBottom: '0.5rem', fontSize: '0.9rem', textTransform: 'uppercase' }}>Weekly Orders</h4>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#1a1a1a' }}>{stats.totalOrders}</div>
        </div>
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h4 style={{ color: '#666', marginBottom: '0.5rem', fontSize: '0.9rem', textTransform: 'uppercase' }}>Active Products</h4>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#1a1a1a' }}>{totalProducts}</div>
        </div>
      </div>

      <div style={{ background: '#fff', padding: '2rem', borderRadius: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Sales Revenue (Last 7 Days)</h3>
        <div style={{ width: '100%', height: 400 }}>
          <ResponsiveContainer>
            <AreaChart data={stats.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#c02026" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#c02026" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="#888" />
              <YAxis stroke="#888" />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
                formatter={(value) => [`₱${value}`, 'Sales']}
              />
              <Area type="monotone" dataKey="sales" stroke="#c02026" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
