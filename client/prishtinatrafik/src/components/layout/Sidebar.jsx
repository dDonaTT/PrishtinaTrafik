import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Map, Wallet, Moon, Sun, LogOut, Shield } from 'lucide-react';
import { useDarkMode } from '@/lib/darkMode';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

const baseNavItems = [
  { path: '/', icon: Map, label: 'Map' },
  { path: '/wallet', icon: Wallet, label: 'Wallet' },
];

export default function Sidebar() {
  const location = useLocation();
  const [isDark, setIsDark] = useDarkMode();
  const { user, logout } = useAuth();
  const navItems = user?.role === 'admin'
    ? [...baseNavItems, { path: '/admin', icon: Shield, label: 'Admin' }]
    : baseNavItems;

  return (
    <div className="w-20 h-screen bg-card border-r border-border flex flex-col items-center py-6 gap-2">
      {/* Logo */}
      <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center mb-6">
        <span className="text-primary-foreground font-bold text-lg">PT</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col items-center gap-1">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <Link key={path} to={path} className="relative group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                <Icon className="w-5 h-5" />
              </motion.div>
              <div className="absolute left-16 top-1/2 -translate-y-1/2 bg-foreground text-background text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                {label}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={() => setIsDark(!isDark)}
          className="w-12 h-12 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        <button
          onClick={logout}
          className="w-12 h-12 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}