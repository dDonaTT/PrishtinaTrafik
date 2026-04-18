// client/src/pages/Admin/AdminTransactions.jsx
import React, { useState } from 'react';
import { Search, Download, Calendar, ArrowUp, ArrowDown, Filter, TrendingUp, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

const TYPE_ICONS = {
  top_up: { icon: '💰', label: 'Depozitë', bg: 'bg-green-100 dark:bg-green-900/30' },
  bus: { icon: '🚌', label: 'Autobus', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  taxi: { icon: '🚕', label: 'Taksi', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
  bike: { icon: '🚲', label: 'Biçikletë', bg: 'bg-green-100 dark:bg-green-900/30' },
  scooter: { icon: '🛴', label: 'Scooter', bg: 'bg-purple-100 dark:bg-purple-900/30' }
};

export default function AdminTransactions({ transactions }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const filteredTransactions = transactions?.filter(t => {
    const matchesSearch = t.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.user_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || t.type === filterType;
    return matchesSearch && matchesType;
  }) || [];

  const totalRevenue = filteredTransactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0);

  const totalDeposits = filteredTransactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const handleExport = () => {
    toast.success('Eksportimi do të shtohet së shpejti');
  };

  return (
    <div>
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 mb-4 md:mb-6">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 md:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Depozita</p>
              <p className="text-lg md:text-2xl font-bold text-green-600 dark:text-green-400">
                €{totalDeposits.toFixed(2)}
              </p>
            </div>
            <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-green-600 dark:text-green-400 opacity-50" />
          </div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 md:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Të Ardhurat</p>
              <p className="text-lg md:text-2xl font-bold text-blue-600 dark:text-blue-400">
                €{totalRevenue.toFixed(2)}
              </p>
            </div>
            <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-blue-600 dark:text-blue-400 opacity-50" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 md:p-4 mb-4 md:mb-6">
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Kërko përdorues..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center gap-1 text-gray-600 dark:text-gray-400"
            >
              <Filter className="w-4 h-4" />
            </button>
            <button
              onClick={handleExport}
              className="hidden md:flex bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg items-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
            >
              <Download className="w-4 h-4" />
              Eksporto
            </button>
          </div>
          
          {(showFilters || window.innerWidth >= 768) && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {['all', 'top_up', 'bus', 'taxi', 'bike', 'scooter'].map((type) => {
                const labels = { all: 'Të gjitha', top_up: 'Depozita', bus: 'Autobus', taxi: 'Taksi', bike: 'Biçikletë', scooter: 'Scooter' };
                return (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-all ${
                      filterType === type
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {labels[type]}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Cards - Pa tabelë */}
      <div className="space-y-2">
        {filteredTransactions.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">Nuk ka transaksione për të shfaqur</p>
          </div>
        ) : (
          filteredTransactions.map((transaction) => {
            const typeInfo = TYPE_ICONS[transaction.type] || { icon: '💳', label: transaction.type, bg: 'bg-gray-100 dark:bg-gray-700' };
            const isPositive = transaction.amount > 0;
            const amount = Number(transaction.amount) || 0;
            const date = new Date(transaction.created_at);
            
            return (
              <div
                key={transaction.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 p-3 md:p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  {/* Përdoruesi */}
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${typeInfo.bg} flex items-center justify-center text-xl`}>
                      {typeInfo.icon}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {transaction.user_name || transaction.user_email?.split('@')[0] || 'Përdorues'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {transaction.user_email}
                      </p>
                    </div>
                  </div>

                  {/* Shuma dhe data */}
                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="text-right">
                      <p className={`flex items-center gap-1 font-semibold ${
                        isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        {isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                        €{Math.abs(amount).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {date.toLocaleDateString('sq-AL')}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                        {typeInfo.label}
                      </span>
                      {transaction.vehicle_id && (
                        <p className="text-xs text-gray-400 dark:text-gray-500">{transaction.vehicle_id}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      
      {/* Mobile Export Button */}
      <div className="md:hidden mt-4">
        <button
          onClick={handleExport}
          className="w-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-2 rounded-lg flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-700"
        >
          <Download className="w-4 h-4" />
          Eksporto
        </button>
      </div>
    </div>
  );
}