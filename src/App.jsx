import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Menu from './pages/Menu';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';

import Locations from './pages/Locations';
import Orders from './pages/Orders';

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <>
      <Navbar session={session} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/locations" element={<Locations />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/login" element={<Login session={session} />} />
        <Route path="/admin" element={<AdminDashboard session={session} />} />
      </Routes>
    </>
  );
}

export default App;
