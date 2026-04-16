import React, { useState } from 'react';
import { useTickets } from '../hooks/useTickets';
import { Bus, Car, Ticket, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';
import BuyTicketModal from '../components/tickets/BuyTicketModel';
import TicketCard from '../components/tickets/TicketCard';

const TICKET_PRICES = {
  bus: 0.40,
  taxi: 2.50
};

export default function TicketsPage() {
  const { tickets, stats, loading, selectedType, setSelectedType, buyTicket, cancelTicket } = useTickets();
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [filter, setFilter] = useState('all'); // all, active, used

  const filteredTickets = tickets.filter(ticket => {
    if (filter === 'active') return ticket.is_valid && !ticket.used_at;
    if (filter === 'used') return ticket.used_at;
    return true;
  });

  const handleBuyTicket = async (data) => {
    await buyTicket(data);
    setIsBuyModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Biletat e mia
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Menaxho biletat e tua për autobus dhe taksi
            </p>
          </div>
          <button
            onClick={() => setIsBuyModalOpen(true)}
            className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-all flex items-center gap-2 shadow-md"
          >
            <Ticket className="w-5 h-5" />
            Bli biletë
          </button>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard
              icon={<Ticket className="w-5 h-5 text-blue-600" />}
              label="Total bileta"
              value={stats.total_tickets || 0}
              color="blue"
            />
            <StatCard
              icon={<CheckCircle className="w-5 h-5 text-green-600" />}
              label="Të përdorura"
              value={stats.used_tickets || 0}
              color="green"
            />
            <StatCard
              icon={<Clock className="w-5 h-5 text-yellow-600" />}
              label="Aktive"
              value={stats.valid_tickets || 0}
              color="yellow"
            />
            <StatCard
              icon={<TrendingUp className="w-5 h-5 text-purple-600" />}
              label="Shpenzuar"
              value={`€${stats.total_spent || 0}`}
              color="purple"
            />
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedType(null)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                !selectedType
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              Të gjitha
            </button>
            <button
              onClick={() => setSelectedType('bus')}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                selectedType === 'bus'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              <Bus className="w-4 h-4" />
              Autobus
            </button>
            <button
              onClick={() => setSelectedType('taxi')}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                selectedType === 'taxi'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              <Car className="w-4 h-4" />
              Taksi
            </button>
          </div>

          <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-md text-sm transition-all ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              Të gjitha
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-3 py-1 rounded-md text-sm transition-all ${
                filter === 'active'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              Aktive
            </button>
            <button
              onClick={() => setFilter('used')}
              className={`px-3 py-1 rounded-md text-sm transition-all ${
                filter === 'used'
                  ? 'bg-gray-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              Të përdorura
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-gray-500">Duke ngarkuar biletat...</p>
            </div>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
            <Ticket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Nuk ke bileta
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Bli biletën tënde të parë për autobus ose taksi
            </p>
            <button
              onClick={() => setIsBuyModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg"
            >
              Bli biletë
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onCancel={cancelTicket}
              />
            ))}
          </div>
        )}
      </div>

      <BuyTicketModal
        isOpen={isBuyModalOpen}
        onClose={() => setIsBuyModalOpen(false)}
        onBuy={handleBuyTicket}
        prices={TICKET_PRICES}
      />
    </div>
  );
}

const StatCard = ({ icon, label, value, color }) => {
  const colors = {
    blue: 'bg-blue-50 dark:bg-blue-900/20',
    green: 'bg-green-50 dark:bg-green-900/20',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20',
    purple: 'bg-purple-50 dark:bg-purple-900/20'
  };

  return (
    <div className={`${colors[color]} rounded-xl p-4`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {value}
          </p>
        </div>
        {icon}
      </div>
    </div>
  );
};