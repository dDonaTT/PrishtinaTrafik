import React, { useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { 
  Wallet, 
  TrendingUp, 
  CreditCard, 
  History, 
  DollarSign,
  ArrowUp,
  Calendar,
  Lock
} from 'lucide-react';
import toast from 'react-hot-toast';

const TOP_UP_AMOUNTS = [5, 10, 20, 50];

export default function WalletPage() {
  const { balance, transactions, stats, loading, topUpLoading, topUpWithStripe } = useWallet();
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [showTopUpModal, setShowTopUpModal] = useState(false);

  const handleTopUp = async () => {
    let amount = selectedAmount;
    if (customAmount && !selectedAmount) {
      amount = parseFloat(customAmount);
    }
    
    if (!amount || amount <= 0) {
      toast.error('Ju lutem zgjidhni një shumë të vlefshme');
      return;
    }
    
    await topUpWithStripe(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Portofoli im
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Menaxho balancën dhe shiko historikun e transaksioneve
          </p>
        </div>

        {/* Balance Card */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 mb-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-100 text-sm">Bilanci aktual</p>
              <p className="text-4xl font-bold mt-1">
                €{typeof balance === 'number' ? balance.toFixed(2) : parseFloat(balance || 0).toFixed(2)}
              </p>
            </div>
            <div className="bg-white/20 rounded-full p-3">
              <Wallet className="w-8 h-8" />
            </div>
          </div>
          <button
            onClick={() => setShowTopUpModal(true)}
            className="mt-4 bg-white text-blue-600 font-semibold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-gray-100 transition-all"
          >
            <CreditCard className="w-4 h-4" />
            Shto balancë
          </button>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard
              icon={<TrendingUp className="w-5 h-5 text-green-600" />}
              label="Total shpenzuar"
              value={`€${stats.total_spent?.toFixed(2) || '0.00'}`}
              color="green"
            />
            <StatCard
              icon={<ArrowUp className="w-5 h-5 text-blue-600" />}
              label="Total depozituar"
              value={`€${stats.total_deposited?.toFixed(2) || '0.00'}`}
              color="blue"
            />
            <StatCard
              icon={<History className="w-5 h-5 text-purple-600" />}
              label="Transaksione"
              value={stats.total_transactions || 0}
              color="purple"
            />
            <StatCard
              icon={<DollarSign className="w-5 h-5 text-orange-600" />}
              label="Biletat e blera"
              value={stats.tickets_count || 0}
              color="orange"
            />
          </div>
        )}

        {/* Transactions History */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Historiku i transaksioneve
              </h2>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-2 text-gray-500">Duke ngarkuar...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-8 text-center">
              <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">Nuk ka transaksione ende</p>
              <button
                onClick={() => setShowTopUpModal(true)}
                className="mt-3 text-blue-600 text-sm font-medium"
              >
                Shto balancën e parë
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {transactions.map((transaction) => (
                <TransactionItem key={transaction.id} transaction={transaction} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top Up Modal - Stripe Checkout */}
      {showTopUpModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Shto balancë
              </h2>
              <button
                onClick={() => setShowTopUpModal(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Zgjidh shumën që dëshiron të shtosh
              </p>

              <div className="grid grid-cols-2 gap-3 mb-4">
                {TOP_UP_AMOUNTS.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => {
                      setSelectedAmount(amount);
                      setCustomAmount('');
                    }}
                    className={`py-3 rounded-xl font-semibold transition-all ${
                      selectedAmount === amount
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    €{amount}
                  </button>
                ))}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Shumë e personalizuar
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setSelectedAmount(null);
                    }}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    min="1"
                    step="1"
                  />
                </div>
              </div>

              <button
                onClick={handleTopUp}
                disabled={topUpLoading || (!selectedAmount && !customAmount)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {topUpLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Lock className="w-4 h-4" />
                )}
                Vazhdo me pagesën
              </button>

              <p className="text-xs text-center text-gray-500 mt-4">
                Pagesa procesohet në mënyrë të sigurt përmes Stripe
              </p>
              <p className="text-xs text-center text-gray-400 mt-2">
                Do të ridrejtoheni te faqja e sigurt e Stripe për të kompletuar pagesën
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const StatCard = ({ icon, label, value, color }) => {
  const colors = {
    green: 'bg-green-50 dark:bg-green-900/20',
    blue: 'bg-blue-50 dark:bg-blue-900/20',
    purple: 'bg-purple-50 dark:bg-purple-900/20',
    orange: 'bg-orange-50 dark:bg-orange-900/20'
  };

  return (
    <div className={`${colors[color]} rounded-xl p-4`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
            {value}
          </p>
        </div>
        {icon}
      </div>
    </div>
  );
};

const TransactionItem = ({ transaction }) => {
  const date = new Date(transaction.created_at);
  const formattedDate = date.toLocaleDateString('sq-AL');
  const formattedTime = date.toLocaleTimeString('sq-AL', { hour: '2-digit', minute: '2-digit' });
  
  const isTopUp = transaction.type === 'top_up';
  const amount = parseFloat(transaction.amount);
  const isPositive = amount > 0;
  
  const getTypeIcon = () => {
    if (transaction.type === 'top_up') return '💰';
    if (transaction.type === 'bus') return '🚌';
    if (transaction.type === 'taxi') return '🚕';
    if (transaction.type === 'bike') return '🚲';
    if (transaction.type === 'scooter') return '🛴';
    return '💳';
  };
  
  const getTypeName = () => {
    if (transaction.type === 'top_up') return 'Depozitë';
    if (transaction.type === 'bus') return 'Biletë Autobusi';
    if (transaction.type === 'taxi') return 'Biletë Taksi';
    if (transaction.type === 'bike') return 'Udhëtim Biçikletë';
    if (transaction.type === 'scooter') return 'Udhëtim Scooter';
    return transaction.type;
  };

  return (
    <div className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
          isTopUp 
            ? 'bg-green-100 dark:bg-green-900/30' 
            : 'bg-red-100 dark:bg-red-900/30'
        }`}>
          {getTypeIcon()}
        </div>
        <div>
          <p className="font-medium text-gray-900 dark:text-white">
            {getTypeName()}
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
            <Calendar className="w-3 h-3" />
            <span>{formattedDate}</span>
            <span>•</span>
            <span>{formattedTime}</span>
          </div>
        </div>
      </div>
      <div className={`text-right font-semibold ${
        isPositive ? 'text-green-600' : 'text-red-600'
      }`}>
        {isPositive ? '+' : ''}€{Math.abs(amount).toFixed(2)}
      </div>
    </div>
  );
};