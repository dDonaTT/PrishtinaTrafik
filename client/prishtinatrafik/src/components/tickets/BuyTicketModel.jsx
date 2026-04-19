// client/src/components/tickets/BuyTicketModal.jsx
import React, { useState, useEffect } from 'react';
import { Bus, Car, X, CreditCard, MapPin, Loader } from 'lucide-react';
import API from '../../services/api';

export default function BuyTicketModal({ isOpen, onClose, onBuy, prices, preselectedVehicle = null }) {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicles, setVehicles] = useState({ bus: [], taxi: [] });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setSelectedType(null);
      setSelectedVehicle(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && preselectedVehicle) {
      const vehicle = preselectedVehicle;
      const type = vehicle.vehicle_type;
      
      setSelectedType(type);
      setSelectedVehicle(vehicle);
      setStep(3); // Kalo direkt te konfirmimi
    }
  }, [isOpen, preselectedVehicle]);

  const fetchVehicles = async () => {
    setFetching(true);
    try {
      const response = await API.get('/rides/nearby?latitude=42.6629&longitude=21.1655&radius=10');
      const allVehicles = response.data?.data || [];
      
      setVehicles({
        bus: allVehicles.filter(v => v.vehicle_type === 'bus' && v.is_available !== false),
        taxi: allVehicles.filter(v => v.vehicle_type === 'taxi' && v.is_available !== false)
      });
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (isOpen && !preselectedVehicle) {
      fetchVehicles();
    }
  }, [isOpen, preselectedVehicle]);

  if (!isOpen) return null;

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    setStep(2);
  };

  const handleVehicleSelect = (vehicle) => {
    setSelectedVehicle(vehicle);
    setStep(3);
  };

  const handleConfirm = async () => {
    setLoading(true);
    await onBuy({
      vehicle_id: selectedVehicle.vehicle_id,
      vehicle_type: selectedType,
      route_name: selectedVehicle.route_name || `Linja ${selectedVehicle.vehicle_id}`
    });
    setLoading(false);
    handleClose();
  };

  const handleClose = () => {
    onClose();
  };

  const getVehicleDisplayName = (vehicle) => {
    if (vehicle.route_name) return vehicle.route_name;
    if (vehicle.station_name) return vehicle.station_name;
    return `ID: ${vehicle.vehicle_id}`;
  };

  if (preselectedVehicle && step === 3) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full">
          <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Konfirmo blerjen
            </h2>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  {selectedType === 'bus' ? (
                    <Bus className="w-6 h-6 text-blue-600" />
                  ) : (
                    <Car className="w-6 h-6 text-yellow-600" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {selectedType === 'bus' ? 'Autobus' : 'Taksi'}
                  </p>
                  <p className="text-sm text-gray-500">{selectedVehicle.vehicle_id}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Rruga/Linja</span>
                  <span className="font-medium">{getVehicleDisplayName(selectedVehicle)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600 dark:text-gray-400">Çmimi</span>
                  <span className="font-bold text-lg text-blue-600">€{prices[selectedType]}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleConfirm}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <CreditCard className="w-5 h-5" />
              )}
              Konfirmo blerjen
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Modal normal pa vehicle të parazgjedhur (për Rides faqen)
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Bli biletë
          </h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step 1: Zgjedh tipin */}
        {step === 1 && (
          <div className="p-4">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Zgjidh llojin e transportit
            </p>
            <div className="space-y-3">
              <button
                onClick={() => handleTypeSelect('bus')}
                className="w-full flex items-center justify-between p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-500 transition-all"
                disabled={fetching}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <Bus className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 dark:text-white">Autobus</p>
                    <p className="text-sm text-gray-500">€{prices.bus} - Biletë e vetme</p>
                    {vehicles.bus.length > 0 && (
                      <p className="text-xs text-green-600 mt-1">
                        {vehicles.bus.length} mjete aktive
                      </p>
                    )}
                  </div>
                </div>
                <span className="text-blue-600">→</span>
              </button>

              <button
                onClick={() => handleTypeSelect('taxi')}
                className="w-full flex items-center justify-between p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-500 transition-all"
                disabled={fetching}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                    <Car className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 dark:text-white">Taksi</p>
                    <p className="text-sm text-gray-500">€{prices.taxi} - Biletë e vetme</p>
                    {vehicles.taxi.length > 0 && (
                      <p className="text-xs text-green-600 mt-1">
                        {vehicles.taxi.length} mjete aktive
                      </p>
                    )}
                  </div>
                </div>
                <span className="text-blue-600">→</span>
              </button>
            </div>

            {fetching && (
              <div className="flex items-center justify-center mt-4">
                <Loader className="w-5 h-5 animate-spin text-blue-600" />
                <span className="ml-2 text-sm text-gray-500">Duke ngarkuar mjetet...</span>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Zgjedh mjetin specifik */}
        {step === 2 && selectedType && (
          <div className="p-4">
            <button
              onClick={() => setStep(1)}
              className="text-blue-600 mb-4 flex items-center gap-1 text-sm"
            >
              ← Kthehu
            </button>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Zgjidh mjetin për të cilin dëshiron të blesh biletë
            </p>
            
            {vehicles[selectedType]?.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Nuk ka mjete të disponueshme</p>
                <button
                  onClick={fetchVehicles}
                  className="mt-2 text-blue-600 text-sm"
                >
                  Rifresko
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {vehicles[selectedType]?.map((vehicle) => (
                  <button
                    key={vehicle.id || vehicle.vehicle_id}
                    onClick={() => handleVehicleSelect(vehicle)}
                    className="w-full flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-500 transition-all text-left"
                  >
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {vehicle.vehicle_id}
                      </p>
                      <p className="text-sm text-gray-500">
                        {getVehicleDisplayName(vehicle)}
                      </p>
                      {vehicle.latitude && vehicle.longitude && (
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" />
                          Në lëvizje
                        </p>
                      )}
                    </div>
                    <span className="text-blue-600">→</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Konfirmimi */}
        {step === 3 && selectedVehicle && (
          <div className="p-4">
            <button
              onClick={() => setStep(2)}
              className="text-blue-600 mb-4 flex items-center gap-1 text-sm"
            >
              ← Kthehu
            </button>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  {selectedType === 'bus' ? (
                    <Bus className="w-6 h-6 text-blue-600" />
                  ) : (
                    <Car className="w-6 h-6 text-yellow-600" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {selectedType === 'bus' ? 'Autobus' : 'Taksi'}
                  </p>
                  <p className="text-sm text-gray-500">{selectedVehicle.vehicle_id}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Rruga/Linja</span>
                  <span className="font-medium">{getVehicleDisplayName(selectedVehicle)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600 dark:text-gray-400">Çmimi</span>
                  <span className="font-bold text-lg text-blue-600">€{prices[selectedType]}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleConfirm}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <CreditCard className="w-5 h-5" />
              )}
              Konfirmo blerjen
            </button>
          </div>
        )}
      </div>
    </div>
  );
}