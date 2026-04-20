// client/src/pages/RidesPage.jsx
import React, { useState, useEffect } from 'react';
import { useRides } from '../hooks/useRides';
import { useLocation } from '../hooks/useLocation';
import { Bike, Scooter, Clock, DollarSign, MapPin, Navigation, Play, Square, X, Car } from 'lucide-react';
import TaxiMeter from '../components/taxi/TaxiMeter';
import taxiService from '../services/taxiService';
import toast from 'react-hot-toast';

const PRICES = {
  bike: 0.05,
  scooter: 0.03
};

export default function RidesPage() {
  const { activeRide, rideHistory, stats, loading, startRide, endRide, cancelRide, loadActiveRide } = useRides();
  const { location, getCurrentLocation } = useLocation();
  const [showStartModal, setShowStartModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [taxiRide, setTaxiRide] = useState(null);

  useEffect(() => {
    loadActiveRide();
  }, []);

  useEffect(() => {
    if (activeRide && activeRide.vehicle_type === 'taxi') {
      setTaxiRide(activeRide);
    }
  }, [activeRide]);

  const handleScanQR = () => {
  setScanning(true);
  setTimeout(() => {
    const vehicleTypes = ['bike', 'scooter', 'taxi'];
    const randomType = vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)];
    
    const mockVehicle = {
      vehicle_id: `${randomType.toUpperCase()}-001`,
      vehicle_type: randomType
    };
    setSelectedVehicle(mockVehicle);
    setScanning(false);
    setShowStartModal(true);
  }, 2000);
};

  const handleStartRide = async () => {
  if (!selectedVehicle) return;
  
  if (selectedVehicle.vehicle_type === 'taxi') {
    if (!location) {
      toast.error('Ju lutem aktivizoni lokacionin');
      return;
    }
    
    try {
      const response = await taxiService.startTaxiRide({
        start_lat: location.lat,
        start_lng: location.lng,
        start_location: 'Pozita aktuale'
      });
      
      if (response.success) {
        toast.success('Udhëtimi me taksi filloi!');
        // KRIJO NJË OBJEKT TË RI PËR TAXI RIDE
        const taxiRideData = {
          ride_id: response.data.ride_id,
          vehicle_type: 'taxi',
          start_time: new Date().toISOString(),
          start_location: 'Pozita aktuale',
          status: 'active'
        };
        setTaxiRide(taxiRideData);
        setShowStartModal(false);
        setSelectedVehicle(null);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gabim gjatë fillimit të udhëtimit');
    }
  } else {
    await startRide(
      selectedVehicle.vehicle_id,
      selectedVehicle.vehicle_type,
      `Pozita: ${location?.lat}, ${location?.lng}`
    );
    setShowStartModal(false);
    setSelectedVehicle(null);
  }
};

  const handleEndTaxiRide = async (result) => {
    setTaxiRide(null);
    await loadActiveRide();
    toast.success(`Udhëtimi përfundoi! Tarifa: €${result.total_fare}`);
  };

  const handleEndBikeRide = async () => {
    if (activeRide) {
      await endRide(activeRide.ride_id, 'Pozita e përfundimit');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Udhëtimet
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Përdor biçikleta, scooter dhe taksi me pagesë
          </p>
        </div>

        {taxiRide && location && (
          <TaxiMeter 
            ride={taxiRide} 
            onEndRide={handleEndTaxiRide}
            currentLocation={location}
          />
        )}

        {/* Bike/Scooter Active Ride */}
        {activeRide && activeRide.vehicle_type !== 'taxi' && !taxiRide && (
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
              onClick={handleEndBikeRide}
              className="w-full bg-white text-green-600 font-semibold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-100 transition-all"
            >
              <Square className="w-5 h-5" />
              Përfundo udhëtimin
            </button>
          </div>
        )}

        {/* Start Ride Button - Vetëm nëse nuk ka udhëtim aktiv */}
        {!activeRide && !taxiRide && (
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

        {/* Statistics */}
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

        {/* Ride History */}
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

      {/* Start Ride Modal */}
      {showStartModal && selectedVehicle && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6">
            <div className="text-center mb-4">
              <div className="text-5xl mb-3">
                {selectedVehicle.vehicle_type === 'bike' ? '🚲' : 
                 selectedVehicle.vehicle_type === 'scooter' ? '🛴' : '🚕'}
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {selectedVehicle.vehicle_type === 'bike' ? 'Biçikletë' :
                 selectedVehicle.vehicle_type === 'scooter' ? 'Scooter' : 'Taksi'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">ID: {selectedVehicle.vehicle_id}</p>
            </div>

            {selectedVehicle.vehicle_type === 'bike' || selectedVehicle.vehicle_type === 'scooter' ? (
              <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4 mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600 dark:text-gray-300">Çmimi për minutë:</span>
                  <span className="font-semibold">
                    €{selectedVehicle.vehicle_type === 'bike' ? '0.05' : '0.03'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Minimumi:</span>
                  <span className="font-semibold">€1.00</span>
                </div>
              </div>
            ) : (
              <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4 mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600 dark:text-gray-300">Tarifa e nisjes:</span>
                  <span className="font-semibold">€1.50</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600 dark:text-gray-300">Për km:</span>
                  <span className="font-semibold">€0.80</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Për minutë pritje:</span>
                  <span className="font-semibold">€0.20</span>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowStartModal(false);
                  setSelectedVehicle(null);
                }}
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

// StatCard dhe RideHistoryCard komponentët mbeten të njëjtë...
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
          <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
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

  const getIcon = () => {
    if (ride.vehicle_type === 'bike') return '🚲';
    if (ride.vehicle_type === 'scooter') return '🛴';
    if (ride.vehicle_type === 'taxi') return '🚕';
    return '🚗';
  };

  const getLabel = () => {
    if (ride.vehicle_type === 'bike') return 'Biçikletë';
    if (ride.vehicle_type === 'scooter') return 'Scooter';
    if (ride.vehicle_type === 'taxi') return 'Taksi';
    return ride.vehicle_type;
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{getIcon()}</span>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{getLabel()}</p>
            <p className="text-xs text-gray-500">{formattedDate} në {formattedTime}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold text-gray-900 dark:text-white">
            {ride.vehicle_type === 'taxi' ? `€${ride.total_cost}` : `€${ride.total_cost}`}
          </p>
          <p className="text-xs text-gray-500">
            {ride.vehicle_type === 'taxi' ? `${ride.distance_km} km` : `${ride.duration_minutes} minuta`}
          </p>
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