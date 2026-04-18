import React from 'react';
import { 
  Users, 
  Car, 
  Ticket, 
  Bike, 
  TrendingUp, 
  DollarSign,
  Calendar,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

export default function AdminDashboard({ stats }) {
  if (!stats) return null;

  const statCards = [
    {
      title: 'Total Përdorues',
      value: stats.totalUsers || 0,
      icon: Users,
      color: 'blue',
      change: '+12%',
      trend: 'up'
    },
    {
      title: 'Total Mjete',
      value: stats.totalVehicles || 0,
      icon: Car,
      color: 'green',
      change: '+5%',
      trend: 'up'
    },
    {
      title: 'Biletat e Shitura',
      value: stats.totalTickets || 0,
      icon: Ticket,
      color: 'purple',
      change: '+8%',
      trend: 'up'
    },
    {
      title: 'Të Ardhurat',
      value: `€${stats.totalRevenue?.toFixed(2) || '0'}`,
      icon: DollarSign,
      color: 'yellow',
      change: '+15%',
      trend: 'up'
    },
    {
      title: 'Udhëtime Aktive',
      value: stats.activeRides || 0,
      icon: Bike,
      color: 'orange',
      change: '-2%',
      trend: 'down'
    },
    {
      title: 'Transaksione',
      value: stats.totalTransactions || 0,
      icon: TrendingUp,
      color: 'red',
      change: '+10%',
      trend: 'up'
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3 md:p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Përmbledhje
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg bg-${card.color}-100 dark:bg-${card.color}-900/20`}>
                <card.icon className={`w-6 h-6 text-${card.color}-600`} />
              </div>
              <div className={`flex items-center gap-1 text-sm ${
                card.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {card.trend === 'up' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                {card.change}
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {card.value}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              {card.title}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Të Ardhurat (30 ditët e fundit)
          </h3>
          <div className="h-64 flex items-center justify-center text-gray-400">
            [Grafiku i të ardhurave]
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Përdorimi sipas Llojit
          </h3>
          <div className="h-64 flex items-center justify-center text-gray-400">
            [Grafiku i përdorimit]
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Aktiviteti i Fundit
        </h3>
        <div className="space-y-3">
          {stats.recentActivities?.map((activity, index) => (
            <div key={index} className="flex items-center gap-3 py-2 border-b border-gray-100 dark:border-gray-700">
              <div className="w-2 h-2 rounded-full bg-blue-600"></div>
              <p className="text-gray-600 dark:text-gray-400 flex-1">
                {activity.message}
              </p>
              <span className="text-xs text-gray-400">
                {new Date(activity.created_at).toLocaleDateString('sq-AL')}
              </span>
            </div>
          ))}
          {(!stats.recentActivities || stats.recentActivities.length === 0) && (
            <p className="text-gray-400 text-center py-4">Nuk ka aktivitete të fundit</p>
          )}
        </div>
      </div>
    </div>
  );
}