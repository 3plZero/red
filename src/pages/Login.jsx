import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import RegisterModal from '../components/RegisterModal';

export default function Login({ session }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      navigate('/admin');
    }
  }, [session, navigate]);

  const handleAuth = async (e) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await supabase.auth.signInWithPassword({ 
        email: email.trim(), 
        password: password.trim() 
      });

      if (result.error) {
        // Handle specific error cases or simplify cryptic ones
        if (result.error.message.includes('Anonymous sign-ins are disabled')) {
          throw new Error('Invalid login credentials. Please try again.');
        }
        throw result.error;
      }
      
      if (result.data.session) {
        navigate('/admin');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="auth-container">
        <h2 className="text-center text-primary" style={{marginBottom: '2rem'}}>Welcome Back</h2>
        
        {error && (
          <div style={{backgroundColor: '#ffebee', color: '#c62828', padding: '1rem', borderRadius: '8px', marginBottom: '1rem'}}>
            {error}
          </div>
        )}

        <form onSubmit={handleAuth}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              className="form-control" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-control" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{width: '100%', marginBottom: '1rem'}} disabled={loading}>
            {loading ? 'Processing...' : 'Sign In'}
          </button>
          <button 
            type="button" 
            className="btn btn-outline" 
            style={{width: '100%'}} 
            disabled={loading}
            onClick={() => setShowRegisterModal(true)}
          >
            Create Account
          </button>
        </form>
      </div>

      {showRegisterModal && (
        <RegisterModal 
          onClose={() => setShowRegisterModal(false)} 
          onSuccess={() => {
            setShowRegisterModal(false);
            // Optionally auto-fill email or show success message
          }}
        />
      )}
    </div>
  );
}
