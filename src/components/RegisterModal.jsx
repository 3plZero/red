import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { X, Mail, Lock, User, MapPin, ArrowRight, CheckCircle } from 'lucide-react';

export default function RegisterModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    fullName: '',
    address: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.fullName.trim() || !formData.address.trim() || !formData.email.trim() || !formData.password.trim()) {
      setError('All fields are required.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password.trim(),
        options: {
          data: {
            full_name: formData.fullName.trim(),
            address: formData.address.trim()
          }
        }
      });

      if (signUpError) throw signUpError;

      setSuccess(true);
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 3000, display: 'flex' }} onClick={onClose}>
      <div 
        className="modal-content" 
        style={{ 
          maxWidth: '500px', 
          padding: '2.5rem', 
          gridTemplateColumns: '1fr',
          borderRadius: '32px'
        }}
        onClick={e => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose}><X /></button>
        
        {success ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              background: '#e8f5e9', 
              color: '#2e7d32', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 1.5rem' 
            }}>
              <CheckCircle size={40} />
            </div>
            <h2 className="text-gradient" style={{ marginBottom: '1rem' }}>Welcome to the Family!</h2>
            <p style={{ color: '#666' }}>Your account has been created. Please check your email to verify your account.</p>
          </div>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2 className="text-gradient" style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>Join Red Ribbon</h2>
              <p style={{ color: '#666' }}>Create an account to start ordering your favorite treats.</p>
            </div>

            {error && (
              <div style={{ 
                backgroundColor: '#ffebee', 
                color: '#c62828', 
                padding: '1rem', 
                borderRadius: '12px', 
                marginBottom: '1.5rem',
                fontSize: '0.9rem',
                fontWeight: '600',
                border: '1px solid #ffcdd2'
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="text" 
                    name="fullName"
                    className="form-control" 
                    placeholder="Juan Dela Cruz"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    style={{ paddingLeft: '2.8rem' }}
                  />
                  <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Delivery Address</label>
                <div style={{ position: 'relative' }}>
                  <textarea 
                    name="address"
                    className="form-control" 
                    placeholder="Street, City, Province"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    rows="2"
                    style={{ paddingLeft: '2.8rem', resize: 'none' }}
                  />
                  <MapPin size={18} style={{ position: 'absolute', left: '1rem', top: '1.1rem', color: '#888' }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="email" 
                    name="email"
                    className="form-control" 
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    style={{ paddingLeft: '2.8rem' }}
                  />
                  <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="password" 
                      name="password"
                      className="form-control" 
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      style={{ paddingLeft: '2.8rem' }}
                    />
                    <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="password" 
                      name="confirmPassword"
                      className="form-control" 
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      style={{ paddingLeft: '2.8rem' }}
                    />
                    <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '1rem', marginTop: '0.5rem' }} 
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
                {!loading && <ArrowRight size={18} style={{ marginLeft: '0.5rem' }} />}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: '#666' }}>
              Already have an account? 
              <button 
                onClick={onClose}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: 'var(--primary-red)', 
                  fontWeight: '700', 
                  marginLeft: '0.5rem', 
                  cursor: 'pointer' 
                }}
              >
                Sign In
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
