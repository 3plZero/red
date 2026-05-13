import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { X, Mail, Lock, ArrowRight } from 'lucide-react';
import RegisterModal from './RegisterModal';

export default function AuthModal({ onClose, onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      alert('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim()
      });
      
      if (error) {
        if (error.message.includes('Anonymous sign-ins are disabled')) {
          throw new Error('Invalid login credentials. Please try again.');
        }
        throw error;
      }
      
      onLogin(data.session);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (showRegister) {
    return (
      <RegisterModal 
        onClose={() => setShowRegister(false)} 
        onSuccess={() => {
          setShowRegister(false);
          // onSuccess from parent could be handled here if needed
        }}
      />
    );
  }

  return (
    <div className="modal-overlay" style={{zIndex: 2000, display: 'flex'}} onClick={onClose}>
      <div 
        className="modal-content" 
        style={{maxWidth: '400px', padding: '2.5rem', gridTemplateColumns: '1fr'}}
        onClick={e => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose}><X /></button>
        
        <div style={{textAlign: 'center', marginBottom: '2rem'}}>
          <h2 className="text-gradient" style={{fontSize: '2rem', marginBottom: '0.5rem'}}>
            Welcome Back!
          </h2>
          <p style={{color: '#666', fontSize: '0.9rem'}}>
            Sign in to continue your order
          </p>
        </div>

        <form onSubmit={handleLogin} style={{display: 'flex', flexDirection: 'column', gap: '1.25rem'}}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{position: 'relative'}}>
              <input 
                type="email" 
                className="form-control" 
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{paddingLeft: '2.5rem'}}
              />
              <Mail size={18} style={{position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#888'}} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{position: 'relative'}}>
              <input 
                type="password" 
                className="form-control" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{paddingLeft: '2.5rem'}}
              />
              <Lock size={18} style={{position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#888'}} />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{width: '100%', padding: '1rem'}} disabled={loading}>
            {loading ? 'Processing...' : 'Sign In'}
            <ArrowRight size={18} style={{marginLeft: '0.5rem'}} />
          </button>
        </form>

        <div style={{textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: '#666'}}>
          Don't have an account?
          <button 
            onClick={() => setShowRegister(true)}
            style={{background: 'none', border: 'none', color: 'var(--primary-red)', fontWeight: '700', marginLeft: '0.5rem', cursor: 'pointer'}}
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}
