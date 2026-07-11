import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, Bell, Shield, LogOut, User as UserIcon } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const citizenLinks = [
    { to: '/', label: 'Home' },
    { to: '/submit', label: 'Report' },
    { to: '/my-complaints', label: 'My Complaints' },
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/analytics', label: 'Analytics' },
  ];
  const adminLinks = [
    { to: '/admin', label: 'Dashboard' },
    { to: '/admin/complaints', label: 'Complaints' },
    { to: '/admin/analytics', label: 'Analytics' },
  ];
  const guestLinks = [
    { to: '/', label: 'Home' },
    { to: '/login', label: 'Login' },
    { to: '/register', label: 'Register' },
  ];

  const links = user ? (isAdmin ? adminLinks : citizenLinks) : guestLinks;
  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav style={{ background: 'linear-gradient(90deg, #FF9933 0%, #E68A2E 100%)' }} className="sticky top-0 z-50 shadow-lg shadow-orange-600/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/25 backdrop-blur flex items-center justify-center text-white shadow-lg">
              <Shield size={18} />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-white">CivicConnect</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {links.map(l => (
              <Link key={l.to} to={l.to}
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${location.pathname === l.to ? 'bg-green-700 text-white shadow-md' : 'text-white/90 hover:bg-white/20 hover:text-white'}`}>
                {l.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <button className="relative p-2 rounded-xl hover:bg-white/20 transition">
                  <Bell size={18} className="text-white" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-400 rounded-full" />
                </button>
                <Link to="/profile" className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-white/20 transition">
                  <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-bold shadow-inner">
                    {user.fullName?.[0] || <UserIcon size={14} />}
                  </div>
                  <span className="text-sm font-semibold text-white max-w-[120px] truncate">{user.fullName}</span>
                </Link>
                <button onClick={handleLogout} className="p-2 rounded-xl hover:bg-white/20 text-white/80 hover:text-white transition"><LogOut size={18} /></button>
              </>
            ) : (
              <div className="flex gap-2">
                <Link to="/login" className="btn bg-white/25 text-white border border-white/30 hover:bg-white/35 text-sm backdrop-blur">Login</Link>
                <Link to="/register" className="btn bg-green-700 text-white hover:bg-green-800 shadow-md text-sm">Register</Link>
              </div>
            )}
          </div>

          <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-xl hover:bg-white/20 text-white">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-white/20 px-4 py-3 space-y-1" style={{ background: 'rgba(230,138,46,0.98)' }}>
          {links.map(l => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)}
              className={`block px-3 py-2 rounded-xl text-sm font-semibold ${location.pathname === l.to ? 'bg-green-700 text-white' : 'text-white/90 hover:bg-white/20 hover:text-white'}`}>
              {l.label}
            </Link>
          ))}
          {user && <button onClick={() => { handleLogout(); setOpen(false); }} className="block w-full text-left px-3 py-2 rounded-xl text-sm font-semibold text-red-200 hover:bg-white/15">Logout</button>}
        </div>
      )}
    </nav>
  );
}
