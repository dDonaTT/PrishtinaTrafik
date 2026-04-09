import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';

export default function AppLayout() {
  return (
    <div className="h-screen w-screen flex overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0 relative">
        <div className="flex-1 min-h-0 overflow-hidden">
          <Outlet />
        </div>
        
        {/* Mobile Bottom Nav */}
        <div className="md:hidden">
          <MobileNav />
        </div>
      </div>
    </div>
  );
}