import { Link, useLocation } from 'react-router-dom';
import { Map, Wallet, Ticket, Bike, User, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';

const baseNavItems = [
  { path: '/', icon: Map, label: 'Map' },
  { path: '/rides', icon: Bike, label: 'Rides' },
  { path: '/tickets', icon: Ticket, label: 'Tickets' },
  { path: '/wallet', icon: Wallet, label: 'Wallet' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export default function MobileNav() {
  const location = useLocation();
  const { user } = useAuth();
  
  const getNavItems = () => {
    const items = [...baseNavItems];
    
    if (user?.role === 'inspector') {
      items.push({ path: '/inspector', icon: Shield, label: 'Inspektor' });
    }
    
    if (user?.role === 'admin') {
      items.push({ path: '/admin', icon: Shield, label: 'Admin' });
    }
    
    return items;
  };

  const navItems = getNavItems();

  return (
    <>
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-800">
        <img 
          src="/logo.png" 
          alt="Prishtina Trafik" 
          className="h-8 w-auto"
        />
        <span className="text-sm font-semibold text-gray-400">
          Prishtina Trafik
        </span>
      </div>
      
      <div className="bg-gray-900 border-t border-gray-800 px-4 py-2 pb-safe">
        <nav className="flex items-center justify-around">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path;
            return (
              <Link key={path} to={path} className="flex flex-col items-center gap-0.5 py-1">
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </motion.div>
                <span className={`text-[10px] font-medium ${
                  isActive ? 'text-blue-400' : 'text-gray-500'
                }`}>
                  {label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}