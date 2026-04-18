import React, { useState } from 'react';
import { useAdmin } from '../hooks/useAdmin';
import { 
  Shield, Users, Car, History, Ticket, Bike, Loader, 
  Menu, X 
} from 'lucide-react';
import AdminDashboard from './Admin/AdminDashboard';
import AdminUsers from './Admin/AdminUsers';
import AdminVehicles from './Admin/AdminVehicles';
import AdminTransactions from './Admin/AdminTransactions';

const tabs = [
  { id: 'dashboard', label: 'Përmbledhje', icon: Shield, mobileLabel: 'Ballina' },
  { id: 'users', label: 'Përdoruesit', icon: Users, mobileLabel: 'Userët' },
  { id: 'vehicles', label: 'Mjetet', icon: Car, mobileLabel: 'Mjetet' },
  { id: 'transactions', label: 'Transaksionet', icon: History, mobileLabel: 'Trans.' },
  { id: 'tickets', label: 'Biletat', icon: Ticket, mobileLabel: 'Biletat' },
  { id: 'rides', label: 'Udhëtimet', icon: Bike, mobileLabel: 'Udhët.' }
];

export default function Admin() {
  const {
    stats,
    users,
    vehicles,
    transactions,
    tickets,
    rides,
    loading,
    activeTab,
    setActiveTab,
    updateUserRole,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    deleteUser
  } = useAdmin();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Duke ngarkuar...</span>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard stats={stats} />;
      case 'users':
        return <AdminUsers users={users} onUpdateRole={updateUserRole} onDeleteUser={deleteUser} />;
      case 'vehicles':
        return (
          <AdminVehicles
            vehicles={vehicles}
            onCreate={createVehicle}
            onUpdate={updateVehicle}
            onDelete={deleteVehicle}
          />
        );
      case 'transactions':
        return <AdminTransactions transactions={transactions} />;
      case 'tickets':
        return (
          <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Biletat</h2>
            <p className="text-gray-500">Lista e biletave do të shfaqet këtu...</p>
          </div>
        );
      case 'rides':
        return (
          <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Udhëtimet</h2>
            <p className="text-gray-500">Lista e udhëtimeve do të shfaqet këtu...</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen  dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-3 py-4 md:px-6 md:py-8">
        <div className="mb-4 md:mb-8">
          <div className="flex items-center gap-2 md:gap-3 mb-2">
            <Shield className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
            <h1 className="text-xl md:text-3xl font-bold text-white">
              Paneli i Administratorit
            </h1>
          </div>
          <p className="text-sm md:text-base text-gray-200">
            Menaxho përdoruesit, mjetet, transaksionet dhe më shumë
          </p>
        </div>

        <div className="md:hidden mb-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-full bg-white border border-gray-200 rounded-lg py-2 px-4 flex items-center justify-between"
          >
            <span className="font-medium text-gray-100">
              {tabs.find(t => t.id === activeTab)?.label || 'Menu'}
            </span>
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <div className="hidden md:flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden mb-4 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        )}

        <div className="overflow-x-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}