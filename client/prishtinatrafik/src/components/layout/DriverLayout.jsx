import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Car, LogOut, Home, User, DollarSign, History } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function DriverLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/driver/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Car className="w-6 h-6" />
            <span className="font-bold text-lg">Driver Portal</span>
          </div>
          <nav className="flex gap-4">
            <Link to="/driver/dashboard" className="hover:text-yellow-200 transition flex items-center gap-1">
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
            <Link to="/driver/trips" className="hover:text-yellow-200 transition flex items-center gap-1">
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">Trips</span>
            </Link>
            <Link to="/driver/earnings" className="hover:text-yellow-200 transition flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">Earnings</span>
            </Link>
            <Link to="/driver/profile" className="hover:text-yellow-200 transition flex items-center gap-1">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </Link>
            <button onClick={handleLogout} className="hover:text-yellow-200 transition flex items-center gap-1">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </nav>
        </div>
      </header>
      
      {/* Content */}
      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}