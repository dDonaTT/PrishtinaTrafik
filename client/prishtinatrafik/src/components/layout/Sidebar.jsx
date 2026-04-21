import { Link, useLocation } from "react-router-dom";
import { Map, Wallet, LogOut, Shield, Ticket, Bike, User } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";

const baseNavItems = [
  { path: "/", icon: Map, label: "Map" },
  { path: "/rides", icon: Bike, label: "Rides" },
  { path: "/tickets", icon: Ticket, label: "Tickets" },
  { path: "/wallet", icon: Wallet, label: "Wallet" },
  { path: "/profile", icon: User, label: "Profile" },
];

export default function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();

  const getNavItems = () => {
    const items = [...baseNavItems];

    // Vetëm Inspektor (jo admin) ka akses te paneli i inspektorit
    if (user?.role === "inspector") {
      items.push({ path: "/inspector", icon: Shield, label: "Inspektor" });
    }

    // Vetëm Admini ka akses te paneli i adminit
    if (user?.role === "admin") {
      items.push({ path: "/admin", icon: Shield, label: "Admin" });
    }

    return items;
  };

  const navItems = getNavItems();

  return (
    <div className="w-20 h-screen bg-gray-900 border-r border-gray-800 flex flex-col items-center py-6 gap-2">
      <div className="w-16 h-16 mb-6">
        <img
          src="/logo.png"
          alt="Prishtina Trafik"
          className="w-full h-full object-contain"
        />
      </div>

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
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5" />
              </motion.div>
              <div className="absolute left-16 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                {label}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-col items-center gap-2">
        <button
          onClick={logout}
          className="w-12 h-12 rounded-xl flex items-center justify-center text-gray-400 hover:bg-red-900/20 hover:text-red-500 transition-all"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
