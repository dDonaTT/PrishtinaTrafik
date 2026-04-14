// client/src/components/layout/Sidebar.jsx
import { Link, useLocation } from "react-router-dom";
import {
  Map,
  Wallet,
  Moon,
  Sun,
  LogOut,
  Shield,
  Ticket,
  Bike,
  User,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";
import { useDarkMode } from "../../lib/darkMode";

const baseNavItems = [
  { path: "/", icon: Map, label: "Map" },
  { path: "/rides", icon: Bike, label: "Rides" },
  { path: "/tickets", icon: Ticket, label: "Tickets" },
  { path: "/wallet", icon: Wallet, label: "Wallet" },
  { path: "/profile", icon: User, label: "Profile" },
];

export default function Sidebar() {
  const location = useLocation();
  const [isDark, setIsDark] = useDarkMode();
  const { user, logout } = useAuth();

  const navItems =
    user?.role === "admin"
      ? [...baseNavItems, { path: "/admin", icon: Shield, label: "Admin" }]
      : baseNavItems;

  return (
    <div className="w-20 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col items-center py-6 gap-2">
      {/* Logo */}
      <div className="w-16 h-16 mb-6">
        <img
          src="/logo.png"
          alt="Prishtina Trafik"
          className="w-full h-full object-contain"
        />
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
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5" />
              </motion.div>
              <div className="absolute left-16 top-1/2 -translate-y-1/2 bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
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
          className="w-12 h-12 rounded-xl flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-all"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        <button
          onClick={logout}
          className="w-12 h-12 rounded-xl flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-500 transition-all"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
