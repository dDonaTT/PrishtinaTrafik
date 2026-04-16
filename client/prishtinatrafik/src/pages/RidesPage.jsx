// client/src/pages/RidesPage.jsx
import React, { useState } from 'react';
import { useRides } from '../hooks/useRides';
import { Bike, Scooter, Clock, DollarSign, MapPin, Navigation, Play, Square, X } from 'lucide-react';

const PRICES = {
  bike: 0.05,
  scooter: 0.03
};

export default function RidesPage() {
  const { activeRide, rideHistory, stats, loading, startRide, endRide, cancelRide } = useRides();
  const [showStartModal, setShowStartModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [scanning, setScanning] = useState(false);

  const handleScanQR = () => {
    setScanning(true);
    // Simulo scan pas 2 sekondash
    setTimeout(() => {
      const mockVehicle = {
        vehicle_id: 'BIKE-001',
        vehicle_type: 'bike'
      };
      setSelectedVehicle(mockVehicle);
      setScanning(false);
      setShowStartModal(true);
    }, 2000);
  };

  const handleStartRide = async () => {
    if (selectedVehicle) {
      await startRide(
        selectedVehicle.vehicle_id,
        selectedVehicle.vehicle_type,
        'Pozita aktuale'
      );
      setShowStartModal(false);
      setSelectedVehicle(null);
    }
  };

  const handleEndRide = async () => {
    if (activeRide) {
      await endRide(activeRide.ride_id, 'Pozita e përfundimit');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Udhëtimet
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Përdor biçikleta dhe scooter me pagesë për minutë
          </p>
        </div>

        {activeRide ? (
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 mb-6 text-white">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-semibold">Udhëtim aktiv</h2>
                <p className="text-green-100">
                  {activeRide.vehicle_type === 'bike' ? '🚲 Biçikletë' : '🛴 Scooter'}
                </p>
              </div>
              <button
                onClick={cancelRide}
                className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/20 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">Kohëzgjatja</span>
                </div>
                <p className="text-2xl font-bold">
                  {activeRide.current_duration?.minutes || 0}m {activeRide.current_duration?.seconds || 0}s
                </p>
              </div>
              <div className="bg-white/20 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-sm">Kosto aktuale</span>
                </div>
                <p className="text-2xl font-bold">€{activeRide.current_cost || '0.00'}</p>
              </div>
            </div>

            <button
              onClick={handleEndRide}
              className="w-full bg-white text-green-600 font-semibold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-100 transition-all"
            >
              <Square className="w-5 h-5" />
              Përfundo udhëtimin
            </button>
          </div>
        ) : (
          <button
            onClick={handleScanQR}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition-all mb-6"
          >
            {scanning ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Duke skanuar QR...
              </>
            ) : (
              <>
                <Navigation className="w-5 h-5" />
                Skano QR për të filluar
              </>
            )}
          </button>
        )}

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard
              icon={<Bike className="w-5 h-5 text-green-600" />}
              label="Udhëtime"
              value={stats.total_rides || 0}
              color="green"
            />
            <StatCard
              icon={<Clock className="w-5 h-5 text-blue-600" />}
              label="Minuta totale"
              value={stats.total_minutes || 0}
              color="blue"
            />
            <StatCard
              icon={<DollarSign className="w-5 h-5 text-purple-600" />}
              label="Shpenzuar"
              value={`€${stats.total_spent || 0}`}
              color="purple"
            />
            <StatCard
              icon={<MapPin className="w-5 h-5 text-orange-600" />}
              label="Mesatarja"
              value={`${stats.avg_duration || 0} min`}
              color="orange"
            />
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Historiku i udhëtimeve
          </h3>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : rideHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bike className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>Nuk ke udhëtime ende</p>
              <p className="text-sm">Skano QR për të filluar udhëtimin tënd të parë</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rideHistory.map((ride) => (
                <RideHistoryCard key={ride.id} ride={ride} />
              ))}
            </div>
          )}
        </div>
      </div>

      {showStartModal && selectedVehicle && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6">
            <div className="text-center mb-4">
              <div className="text-5xl mb-3">
                {selectedVehicle.vehicle_type === 'bike' ? '🚲' : '🛴'}
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {selectedVehicle.vehicle_type === 'bike' ? 'Biçikletë' : 'Scooter'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">ID: {selectedVehicle.vehicle_id}</p>
            </div>

            <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4 mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600 dark:text-gray-300">Çmimi për minutë:</span>
                <span className="font-semibold">€{PRICES[selectedVehicle.vehicle_type]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Minimumi:</span>
                <span className="font-semibold">€1.00</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowStartModal(false)}
                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white py-2 rounded-lg"
              >
                Anulo
              </button>
              <button
                onClick={handleStartRide}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" />
                Fillo
              </button>
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
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {value}
          </p>
        </div>
        {icon}
      </div>
    </div>
  );
};

const RideHistoryCard = ({ ride }) => {
  const date = new Date(ride.start_time);
  const formattedDate = date.toLocaleDateString('sq-AL');
  const formattedTime = date.toLocaleTimeString('sq-AL', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{ride.vehicle_type === 'bike' ? '🚲' : '🛴'}</span>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">
              {ride.vehicle_type === 'bike' ? 'Biçikletë' : 'Scooter'}
            </p>
            <p className="text-xs text-gray-500">{formattedDate} në {formattedTime}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold text-gray-900 dark:text-white">€{ride.total_cost}</p>
          <p className="text-xs text-gray-500">{ride.duration_minutes} minuta</p>
        </div>
      </div>
      {ride.start_location && (
        <div className="text-xs text-gray-500 flex items-center gap-1 mt-2">
          <MapPin className="w-3 h-3" />
          <span className="truncate">{ride.start_location}</span>
        </div>
      )}
    </div>
  );
};