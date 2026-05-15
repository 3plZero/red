import React, { useState, useEffect } from 'react';
import { supabase, uploadImage } from '../../lib/supabase';

export default function SettingsTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState([]);
  const [logoFile, setLogoFile] = useState(null);
  
  const [settings, setSettings] = useState({
    logo_url: '',
    hero_title: '',
    hero_description: '',
    hero_product_id: '',
    featured_products: ''
  });

  useEffect(() => {
    fetchSettings();
    fetchProducts();
  }, []);

  async function fetchProducts() {
    const { data } = await supabase.from('products').select('id, name');
    setProducts(data || []);
  }

  async function fetchSettings() {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('site_settings').select('*');
      
      if (error) throw error;
      
      if (data) {
        const settingsObj = {};
        data.forEach(item => {
          settingsObj[item.key] = item.value;
        });
        setSettings(prev => ({ ...prev, ...settingsObj }));
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      
      let currentSettings = { ...settings };

      // Handle logo upload
      if (logoFile) {
        const uploadedLogoUrl = await uploadImage(logoFile);
        if (uploadedLogoUrl) {
          currentSettings.logo_url = uploadedLogoUrl;
          setSettings(currentSettings);
        }
      }

      const updates = Object.keys(currentSettings).map(key => ({
        key,
        value: currentSettings[key]
      }));

      const { error } = await supabase
        .from('site_settings')
        .upsert(updates, { onConflict: 'key' });

      if (error) throw error;
      alert('Settings saved successfully!');
    } catch (err) {
      console.error('Error saving settings:', err);
      alert(`Failed to save settings: ${err.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading settings...</div>;

  return (
    <div>
      <h2 className="text-primary" style={{ marginBottom: '2rem' }}>Site Configuration</h2>

      <div style={{ background: '#fff', padding: '2.5rem', borderRadius: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', maxWidth: '800px' }}>
        <form onSubmit={handleSave}>
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>Logo</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => setLogoFile(e.target.files[0])}
                style={{ 
                  width: '100%', 
                  padding: '0.5rem', 
                  border: '2px solid #eaeaea', 
                  borderRadius: '12px' 
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#666' }}>OR URL</span>
                <input 
                  type="text" 
                  className="form-control" 
                  name="logo_url"
                  value={settings.logo_url}
                  onChange={handleChange}
                  placeholder="https://example.com/logo.png"
                  style={{ flex: 1, padding: '0.75rem 1rem', border: '2px solid #eaeaea', borderRadius: '12px' }}
                />
              </div>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>Hero Title</label>
            <input 
              type="text" 
              className="form-control" 
              name="hero_title"
              value={settings.hero_title}
              onChange={handleChange}
              style={{ width: '100%', padding: '0.75rem 1rem', border: '2px solid #eaeaea', borderRadius: '12px' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>Hero Description</label>
            <textarea 
              className="form-control" 
              name="hero_description"
              value={settings.hero_description}
              onChange={handleChange}
              rows="3"
              style={{ width: '100%', padding: '0.75rem 1rem', border: '2px solid #eaeaea', borderRadius: '12px', resize: 'vertical' }}
            />
          </div>



          <div className="form-group" style={{ marginBottom: '2.5rem' }}>
            <label className="form-label" style={{ fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>Featured Creations (Select products to show on home page)</label>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
              gap: '1rem', 
              maxHeight: '300px', 
              overflowY: 'auto', 
              padding: '1rem', 
              border: '2px solid #eaeaea', 
              borderRadius: '12px',
              background: '#fafafa'
            }}>
              {products.map(p => {
                const isSelected = settings.featured_products.split(',').includes(p.id.toString());
                return (
                  <label key={p.id} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.75rem', 
                    padding: '0.5rem 0.75rem', 
                    background: isSelected ? '#fff0f0' : '#fff',
                    border: isSelected ? '1px solid var(--primary-red)' : '1px solid #ddd',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    transition: 'all 0.2s'
                  }}>
                    <input 
                      type="checkbox" 
                      checked={isSelected}
                      onChange={(e) => {
                        const current = settings.featured_products.split(',').filter(id => id !== '');
                        let updated;
                        if (e.target.checked) {
                          updated = [...current, p.id.toString()];
                        } else {
                          updated = current.filter(id => id !== p.id.toString());
                        }
                        setSettings(prev => ({ ...prev, featured_products: updated.join(',') }));
                      }}
                      style={{ accentColor: 'var(--primary-red)' }}
                    />
                    <span style={{ 
                      whiteSpace: 'nowrap', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis',
                      color: isSelected ? 'var(--primary-red)' : '#333',
                      fontWeight: isSelected ? '600' : '400'
                    }}>
                      {p.name}
                    </span>
                  </label>
                );
              })}
            </div>
            <small style={{ color: '#666', marginTop: '0.5rem', display: 'block' }}>Select the items you want to feature on the homepage.</small>
          </div>

          <button type="submit" className="btn btn-primary" disabled={saving} style={{ width: 'auto', padding: '0.8rem 2rem' }}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
