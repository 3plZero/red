import React, { useState } from 'react';
import { Plus, Minus, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import ProductModal from './ProductModal';

export default function InventoryTab({ products, loading, onRefresh }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleUpdateStock = async (product, delta) => {
    const newStock = Math.max(0, (product.stock || 0) + delta);
    try {
      const { error } = await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', product.id);
      
      if (error) throw error;
      onRefresh(); // Refresh parent data
    } catch (err) {
      console.error("Error updating stock:", err);
      alert("Failed to update stock");
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddClick = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  return (
    <div>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '2rem'}}>
        <h2 className="text-primary" style={{margin: 0}}>Inventory Management</h2>
        
        <div style={{flex: 1, maxWidth: '400px', position: 'relative'}}>
          <Search size={18} style={{position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#999'}} />
          <input 
            type="text" 
            placeholder="Search products..." 
            className="form-control"
            style={{paddingLeft: '3rem', borderRadius: '999px'}}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <button className="btn btn-primary" onClick={handleAddClick}>+ Add Product</button>
      </div>

      <div className="table-wrapper">
        {loading ? (
          <div style={{padding: '2rem', textAlign: 'center'}}>Loading inventory...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Price (₱)</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{textAlign: 'center', padding: '3rem', color: '#666'}}>No products found.</td>
                </tr>
              ) : (
                filteredProducts.map(product => (
                  <tr key={product.id}>
                    <td style={{fontWeight: '600'}}>{product.name}</td>
                    <td style={{color: 'var(--primary-red)', fontWeight: '700'}}>₱{product.price ? product.price.toFixed(2) : '0.00'}</td>
                    <td>
                      <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                        <button 
                          onClick={() => handleUpdateStock(product, -1)}
                          style={{
                            width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #ddd', 
                            background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                            cursor: 'pointer', transition: 'all 0.2s'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary-red)'}
                          onMouseOut={(e) => e.currentTarget.style.borderColor = '#ddd'}
                        >
                          <Minus size={14} />
                        </button>
                        <span style={{minWidth: '30px', textAlign: 'center', fontWeight: '700', fontSize: '1.1rem'}}>{product.stock || 0}</span>
                        <button 
                          onClick={() => handleUpdateStock(product, 1)}
                          style={{
                            width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #ddd', 
                            background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                            cursor: 'pointer', transition: 'all 0.2s'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary-red)'}
                          onMouseOut={(e) => e.currentTarget.style.borderColor = '#ddd'}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </td>
                    <td>
                      <span style={{
                        padding: '0.35rem 0.75rem', 
                        borderRadius: '999px', 
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        backgroundColor: (product.stock || 0) > 10 ? '#e8f5e9' : '#ffebee',
                        color: (product.stock || 0) > 10 ? '#2e7d32' : '#c62828'
                      }}>
                        {(product.stock || 0) > 10 ? 'IN STOCK' : 'LOW STOCK'}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn btn-outline" 
                        style={{padding: '0.4rem 1rem', fontSize: '0.85rem', fontWeight: '600', borderRadius: '8px'}}
                        onClick={() => handleEditClick(product)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <ProductModal 
          product={editingProduct} 
          onClose={() => setIsModalOpen(false)} 
          onSave={onRefresh} 
        />
      )}
    </div>
  );
}
