import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LogOut, ShoppingCart, User, Settings, Package, MapPin } from 'lucide-react';
import logo from '../assets/logo.png';
import { useCart } from '../context/CartContext';
import Cart from './Cart';
import AuthModal from './AuthModal';
import ProfileModal from './ProfileModal';

export default function Navbar({ session }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [logoUrl, setLogoUrl] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const { cart, setIsCartOpen } = useCart();
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    async function fetchLogo() {
      const { data } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'logo_url')
        .single();
      
      if (data) setLogoUrl(data.value);
    }
    fetchLogo();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleOrdersClick = (e) => {
    if (!session) {
      e.preventDefault();
      setShowAuthModal(true);
    }
  };

  const isAdmin = session?.user?.email?.toLowerCase().includes('admin') || 
                  session?.user?.user_metadata?.role === 'admin' ||
                  session?.user?.user_metadata?.is_admin === true ||
                  localStorage.getItem('force_admin') === 'true';

  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <>
      <nav className="navbar">
        <div className="container" style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', position: 'relative'}}>
          <div style={{flex: '0 0 auto', width: '200px'}}>
            <Link to="/" className="navbar-brand">
              <img src={logoUrl || logo} alt="Red Ribbon" />
            </Link>
          </div>
          
          <ul className="navbar-nav" style={{
            position: 'absolute', 
            left: '50%', 
            transform: 'translateX(-50%)', 
            display: 'flex', 
            gap: '2.5rem',
            margin: 0,
            padding: 0,
            listStyle: 'none'
          }}>
            {isAdminPage ? (
              <>
                <li><Link to="/" className="nav-link">Store</Link></li>
                <li><Link to="/admin" className="nav-link">Dashboard</Link></li>
                <li><Link to="/admin?tab=sales" className="nav-link">Sales</Link></li>
                <li><Link to="/admin?tab=inventory" className="nav-link">Inventory</Link></li>
              </>
            ) : (
              <>
                <li><Link to="/" className="nav-link">Home</Link></li>
                <li><Link to="/menu" className="nav-link">Menu</Link></li>
                <li><Link to="/orders" className="nav-link" onClick={handleOrdersClick}>My Orders</Link></li>
                <li><Link to="/locations" className="nav-link">Locations</Link></li>
              </>
            )}
          </ul>

          <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem', flex: '0 0 auto', justifyContent: 'flex-end'}}>
            {!isAdminPage && (
              <button 
                className="profile-trigger" 
                onClick={() => setIsCartOpen(true)}
                style={{position: 'relative'}}
                title="View Cart"
              >
                <ShoppingCart size={20} /> 
                {cartItemCount > 0 && (
                  <span style={{
                    position: 'absolute', top: '-5px', right: '-5px', 
                    background: 'var(--primary-red)', color: 'white', 
                    borderRadius: '50%', width: '18px', height: '18px', 
                    fontSize: '0.65rem', display: 'flex', alignItems: 'center', 
                    justifyContent: 'center', border: '1px solid white', fontWeight: 'bold'
                  }}>
                    {cartItemCount}
                  </span>
                )}
              </button>
            )}

            {!session ? (
              <Link 
                to="/login" 
                className="profile-trigger"
                title="Sign In"
              >
                <User size={20} />
              </Link>
            ) : (
              <div className="profile-dropdown">
                <button 
                  className="profile-trigger"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  title="My Account"
                >
                  <User size={20} />
                </button>

                {isProfileOpen && (
                  <div className="dropdown-menu">
                    <button 
                      className="dropdown-item" 
                      onClick={() => {
                        setShowProfileModal(true);
                        setIsProfileOpen(false);
                      }}
                    >
                      <User size={16} /> My Profile
                    </button>
                    <Link 
                      to="/orders" 
                      className="dropdown-item"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <Package size={16} /> My Orders
                    </Link>
                    {isAdmin && (
                      <Link 
                        to="/admin" 
                        className="dropdown-item"
                        onClick={() => setIsProfileOpen(false)}
                        style={{color: 'var(--primary-red)'}}
                      >
                        <Settings size={16} /> Admin Panel
                      </Link>
                    )}
                    <div className="dropdown-divider"></div>
                    <button 
                      onClick={() => {
                        handleLogout();
                        setIsProfileOpen(false);
                      }} 
                      className="dropdown-item logout"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>
      <Cart session={session} />
      {!isAdminPage && (
        <div className="sub-nav">
          <div className="container">
            <Link to={`/menu?category=${encodeURIComponent("What's New")}`} className={`sub-nav-link ${location.search.includes("What's New") ? 'active' : ''}`}>What's New</Link>
            <Link to={`/menu?category=${encodeURIComponent("Specialty Cakes")}`} className={`sub-nav-link ${location.search.includes('Specialty%20Cakes') ? 'active' : ''}`}>Specialty Cakes</Link>
            <Link to={`/menu?category=${encodeURIComponent("Dedication Cakes")}`} className={`sub-nav-link ${location.search.includes('Dedication%20Cakes') ? 'active' : ''}`}>Dedication Cakes</Link>
            <Link to={`/menu?category=${encodeURIComponent("Roll Cakes")}`} className={`sub-nav-link ${location.search.includes('Roll%20Cakes') ? 'active' : ''}`}>Roll Cakes</Link>
            <Link to={`/menu?category=${encodeURIComponent("Pastries, Breads & Delicacies")}`} className={`sub-nav-link ${location.search.includes('Pastries') ? 'active' : ''}`}>Pastries, Breads & Delicacies</Link>
          </div>
        </div>
      )}
      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)} 
          onLogin={() => {
            setShowAuthModal(false);
            navigate('/orders');
          }}
        />
      )}
      {showProfileModal && (
        <ProfileModal 
          session={session}
          onClose={() => setShowProfileModal(false)}
        />
      )}
    </>
  );
}
