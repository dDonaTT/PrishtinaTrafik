import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';

export default function AppLayout({ onShowRoutes, onShowStops, showStops }) {
  return (
    <div className="h-screen w-screen flex overflow-hidden bg-gray-50 dark:bg-gray-950">
      <div className="hidden md:flex">
        <Sidebar />
      </div>
      
      <div className="flex-1 flex flex-col min-h-0 relative">
        <div className="flex-1 min-h-0 overflow-y-auto">
          <Outlet context={{ onShowRoutes, onShowStops, showStops }} />
        </div>
        
        <div className="md:hidden">
          <MobileNav 
            onShowRoutes={onShowRoutes} 
            onShowStops={onShowStops} 
            showStops={showStops}
          />
        </div>
      </div>
    </div>
  );
}