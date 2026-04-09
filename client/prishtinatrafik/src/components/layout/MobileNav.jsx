import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Map, Wallet, ClipboardList, User, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

const baseNavItems = [
  { path: '/', icon: Map, label: 'Map' },
  { path: '/wallet', icon: Wallet, label: 'Wallet' },
];

export default function MobileNav() {
  const location = useLocation();
  const { user } = useAuth();
  const navItems = user?.role === 'admin'
    ? [...baseNavItems, { path: '/admin', icon: Shield, label: 'Admin' }]
    : baseNavItems;

  return (
    <div className="bg-card border-t border-border px-4 py-2 pb-safe">
      <nav className="flex items-center justify-around">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <Link key={path} to={path} className="flex flex-col items-center gap-0.5 py-1">
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground'
                }`}
              >
                <Icon className="w-5 h-5" />
              </motion.div>
              <span className={`text-[10px] font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}