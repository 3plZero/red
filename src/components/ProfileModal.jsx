import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { X, MapPin, User, Save } from 'lucide-react';

export default function ProfileModal({ session, onClose }) {
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (session?.user?.user_metadata) {
      setFullName(session.user.user_metadata.full_name || '');
      setAddress(session.user.user_metadata.address || '');
    }
  }, [session]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const { error } = await supabase.auth.updateUser({
        data: { 
          full_name: fullName,
          address: address 
        }
      });

      if (error) throw error;
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => {
        window.location.reload(); // Refresh to update session data in Navbar
      }, 1500);
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content profile-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><X size={20} /></button>
        
        <div className="modal-header">
          <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
            <div className="icon-circle" style={{background: 'var(--primary-red)', color: 'white'}}>
              <User size={22} />
            </div>
            <h2>My Profile</h2>
          </div>
        </div>

        <form onSubmit={handleUpdate} className="auth-form">
          {message.text && (
            <div className={`message ${message.type}`} style={{marginBottom: '1rem'}}>
              {message.text}
            </div>
          )}

          <div className="form-group">
            <label>Full Name</label>
            <div className="input-with-icon">
              <User size={18} />
              <input 
                type="text" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Delivery Address</label>
            <div className="input-with-icon">
              <MapPin size={18} />
              <textarea 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your complete address"
                required
                rows="3"
                style={{paddingLeft: '2.5rem', paddingTop: '0.75rem'}}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-block" 
            disabled={loading}
            style={{marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'}}
          >
            {loading ? 'Updating...' : <><Save size={18} /> Save Changes</>}
          </button>

          {/* Hidden Admin Toggle for testing */}
          <div style={{marginTop: '2rem', paddingTop: '1rem', borderTop: '1px dashed #eee', textAlign: 'center'}}>
            <button 
              type="button"
              onClick={async () => {
                setLoading(true);
                localStorage.setItem('force_admin', 'true'); // Persistent local override
                const { error } = await supabase.auth.updateUser({
                  data: { role: 'admin', is_admin: true }
                });
                window.location.reload();
                setLoading(false);
              }}
              style={{background: 'none', border: 'none', color: '#ccc', fontSize: '0.7rem', cursor: 'pointer'}}
            >
              Enable Admin Mode (Debug)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
