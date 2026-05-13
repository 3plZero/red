import React, { useState } from 'react';
import { supabase, uploadImage } from '../../lib/supabase';

export default function ProductModal({ product, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    price: product?.price || '',
    stock: product?.stock || '',
    image_url: product?.image_url || '',
    category: product?.category || 'Specialty Cakes',
    sku: product?.sku || '',
    description: product?.description || ''
  });
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalImageUrl = formData.image_url;

      // Handle image upload if a new file was selected
      if (imageFile) {
        setLoading(true);
        const uploadedUrl = await uploadImage(imageFile);
        if (uploadedUrl) {
          finalImageUrl = uploadedUrl;
        }
      }

      if (product?.id) {
        // Update
        const { error } = await supabase
          .from('products')
          .update({
            name: formData.name,
            price: parseFloat(formData.price),
            stock: parseInt(formData.stock),
            image_url: finalImageUrl,
            category: formData.category,
            sku: formData.sku || `SKU-${Date.now()}`,
            description: formData.description
          })
          .eq('id', product.id);
        if (error) throw error;
      } else {
        // Insert
        const { error } = await supabase
          .from('products')
          .insert([{
            name: formData.name,
            price: parseFloat(formData.price),
            stock: parseInt(formData.stock),
            image_url: finalImageUrl,
            category: formData.category,
            sku: formData.sku || `SKU-${Date.now()}`,
            description: formData.description
          }]);
        if (error) throw error;
      }
      onSave();
      onClose();
    } catch (err) {
      console.error("Error saving product:", err);
      alert(`Error saving product: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" style={{display: 'flex'}}>
      <div className="modal-content" style={{maxWidth: '500px', gridTemplateColumns: '1fr', padding: '2rem'}}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h2 style={{marginBottom: '1.5rem'}}>{product ? 'Edit Product' : 'Add New Product'}</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Product Name</label>
            <input 
              type="text" 
              className="form-control" 
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
            <div className="form-group">
              <label className="form-label">Price (₱)</label>
              <input 
                type="number" 
                step="0.01"
                className="form-control" 
                required
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Stock Quantity</label>
              <input 
                type="number" 
                className="form-control" 
                required
                value={formData.stock}
                onChange={(e) => setFormData({...formData, stock: e.target.value})}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">SKU (Unique ID)</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="e.g. CAKE-001"
              value={formData.sku}
              onChange={(e) => setFormData({...formData, sku: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <select 
              className="form-control"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              style={{background: '#fbfbfb'}}
            >
              <option value="What's New">What's New</option>
              <option value="Specialty Cakes">Specialty Cakes</option>
              <option value="Dedication Cakes">Dedication Cakes</option>
              <option value="Roll Cakes">Roll Cakes</option>
              <option value="Pastries, Breads & Delicacies">Pastries, Breads & Delicacies</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea 
              className="form-control" 
              placeholder="Tell us about this masterpiece..."
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              style={{resize: 'none', background: '#fbfbfb'}}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Product Image</label>
            
            {/* Image Preview */}
            {(imageFile || formData.image_url) && (
              <div style={{ 
                width: '100%', 
                height: '150px', 
                background: '#f8f8f8', 
                borderRadius: '12px', 
                marginBottom: '1rem', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                overflow: 'hidden',
                border: '1px solid #eee'
              }}>
                <img 
                  src={imageFile ? URL.createObjectURL(imageFile) : formData.image_url} 
                  alt="Preview" 
                  style={{ 
                    maxHeight: '100%', 
                    maxWidth: '100%', 
                    objectFit: 'contain',
                    mixBlendMode: 'multiply' 
                  }} 
                />
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
                style={{ 
                  padding: '0.5rem', 
                  border: '1px dashed #ccc', 
                  borderRadius: '8px',
                  background: '#fcfcfc',
                  fontSize: '0.9rem'
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#666' }}>OR Paste URL</span>
                <input 
                  type="url" 
                  className="form-control" 
                  placeholder="https://example.com/image.jpg"
                  value={formData.image_url}
                  onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                  style={{ flex: 1, padding: '0.5rem' }}
                />
              </div>
            </div>
          </div>

          <div style={{marginTop: '2rem', display: 'flex', gap: '1rem'}}>
            <button type="button" className="btn btn-outline" onClick={onClose} style={{flex: 1}}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{flex: 1}} disabled={loading}>
              {loading ? 'Saving...' : (product ? 'Update Product' : 'Add Product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
