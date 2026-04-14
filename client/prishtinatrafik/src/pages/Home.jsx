import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useLocation } from '../hooks/useLocation';
import { useVehicles } from '../hooks/useVehicles';
import MapView from '../components/map/MapView';
import VehicleFilters from '../components/map/VehicleFilters';
import { Bike, Bus, Car, Scooter } from 'lucide-react';

export default function Home() {
  const { user } = useAuth();
  const { location, loading: locationLoading } = useLocation();
  const { 
    vehicles, 
    loading: vehiclesLoading, 
    selectedType, 
    setSelectedType, 
    loadNearbyVehicles 
  } = useVehicles();
  
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Thirrja e API sa herë që ndryshon vendndodhja ose tipi i mjetit
  useEffect(() => {
    if (location?.lat && location?.lng) {
      loadNearbyVehicles(location.lat, location.lng, selectedType);
    }
  }, [location?.lat, location?.lng, selectedType, loadNearbyVehicles]);

  const handleVehicleClick = (vehicle) => {
    setSelectedVehicle(vehicle);
    console.log('Vehicle selected:', vehicle);
  };

  // Kalkulimi i numrit total të mjeteve në kohë reale
  const vehicleCounts = {
    bus: vehicles.buses?.length || 0,
    taxi: vehicles.taxis?.length || 0,
    bike: vehicles.bikes?.length || 0,
    scooter: vehicles.scooters?.length || 0
  };

  if (locationLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-2 text-gray-500">Duke kërkuar vendndodhjen tuaj...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full">
      {/* Map - Sigurohemi që kalojmë objektin e plotë të vehicles */}
      {location && (
        <MapView
          vehicles={vehicles} 
          selectedType={selectedType}
          center={location}
          zoom={15}
          onVehicleClick={handleVehicleClick}
        />
      )}

      {/* Filtrat sipas tipit */}
      <VehicleFilters
        selectedType={selectedType}
        onSelectType={setSelectedType}
      />

      {/* Statistikat në fund të ekranit */}
      <div className="absolute bottom-6 left-4 right-4 md:left-auto md:right-4 md:w-64 z-10">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-4 border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">
              Mjetet pranë teje
            </h3>
            {vehiclesLoading && <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>}
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <StatItem icon={<Bus className="text-blue-600" />} label="Buses" count={vehicleCounts.bus} />
            <StatItem icon={<Car className="text-yellow-500" />} label="Taxis" count={vehicleCounts.taxi} />
            <StatItem icon={<Bike className="text-green-600" />} label="Bikes" count={vehicleCounts.bike} />
            <StatItem icon={<Scooter className="text-purple-600" />} label="Scooters" count={vehicleCounts.scooter} />
          </div>
        </div>
      </div>

      {/* Welcome Message */}
      {user && !selectedType && (
        <div className="absolute top-20 right-4 z-10 pointer-events-none">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur px-4 py-2 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium">Përshëndetje, {user.fullname}!</p>
          </div>
        </div>
      )}
    </div>
  );
}


const StatItem = ({ icon, label, count }) => (
  <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg">
    {icon}
    <div className="flex flex-col">
      <span className="text-[10px] text-gray-400 uppercase leading-none">{label}</span>
      <span className="text-sm font-bold">{count}</span>
    </div>
  </div>
);