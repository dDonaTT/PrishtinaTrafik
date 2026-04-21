import React, { useState, useEffect } from 'react';
import { X, MapPin, Clock, Car, User, Phone, Loader } from 'lucide-react';
import { useTaxi } from '../../hooks/useTaxi';
import SearchInput from '../ui/SearchInput';
import toast from 'react-hot-toast';

const RATES = {
  base_fare: 1.50,
  per_km: 0.80,
  per_minute_waiting: 0.20
};

export default function OrderTaxiModal({ taxi, location, isOpen, onClose, onOrderSuccess }) {
  const [destination, setDestination] = useState('');
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [ordering, setOrdering] = useState(false);
  const { orderTaxi, calculateETA } = useTaxi();
  const [etaValue, setEtaValue] = useState(null);
  const [calculatingEta, setCalculatingEta] = useState(false);
  const [distance, setDistance] = useState(null);
  const [estimatedPrice, setEstimatedPrice] = useState(null);
  const [calculatingPrice, setCalculatingPrice] = useState(false);

  useEffect(() => {
    if (isOpen && location && taxi) {
      calculateRealETA();
    }
  }, [isOpen, location, taxi]);

  const calculateRealETA = async () => {
    if (!taxi || !location) return;
    
    setCalculatingEta(true);
    try {
      const taxiLat = parseFloat(taxi.latitude);
      const taxiLng = parseFloat(taxi.longitude);
      
      if (!isNaN(taxiLat) && !isNaN(taxiLng)) {
        const result = await calculateETA(taxiLat, taxiLng, location.lat, location.lng);
        if (result) {
          setEtaValue(result.eta_minutes);
        } else {
          setEtaValue(5);
        }
      } else {
        setEtaValue(5);
      }
    } catch (error) {
      console.error('ETA calculation error:', error);
      setEtaValue(5);
    } finally {
      setCalculatingEta(false);
    }
  };

  const handleDestinationSelect = async (suggestion) => {
    setDestination(suggestion.place_name);
    setDestinationCoords({ lat: suggestion.lat, lng: suggestion.lng });
    
    setCalculatingPrice(true);
    try {
      const result = await calculateETA(location.lat, location.lng, suggestion.lat, suggestion.lng);
      if (result) {
        const distanceKm = parseFloat(result.distance_km);
        setDistance(distanceKm);
        const price = RATES.base_fare + (distanceKm * RATES.per_km);
        setEstimatedPrice(price.toFixed(2));
        setEtaValue(result.eta_minutes);
      }
    } catch (error) {
      console.error('Distance calculation error:', error);
    } finally {
      setCalculatingPrice(false);
    }
  };

  const handleOrder = async () => {
    if (!destination) {
      toast.error('Ju lutem vendosni destinacionin');
      return;
    }

    setOrdering(true);
    try {
      const response = await orderTaxi({
        pickup_lat: location.lat,
        pickup_lng: location.lng,
        pickup_address: 'Pozita aktuale',
        destination_address: destination,
        destination_lat: destinationCoords?.lat || null,
        destination_lng: destinationCoords?.lng || null
      });

      if (response.success) {
        onOrderSuccess && onOrderSuccess(response);
        onClose();
      }
    } catch (error) {
      console.error('Order error:', error);
    } finally {
      setOrdering(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Porosit Taxi
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Car className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="font-semibold">{taxi.vehicle_id}</p>
                <p className="text-sm text-gray-500">{taxi.car_model || 'Taxi Standard'}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                <span>Shoferi: {taxi.driver_name || 'Në pritje'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <span>{taxi.driver_phone || '+383 XX XXX XXX'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>
                  ETA: {calculatingEta ? (
                    <Loader className="w-3 h-3 animate-spin inline ml-1" />
                  ) : (
                    `${etaValue || '?'} minuta`
                  )}
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Vendndodhja e nisjes
            </label>
            <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <MapPin className="w-4 h-4 text-green-600" />
              <span className="text-sm">Pozita aktuale</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Destinacioni
            </label>
            <SearchInput
              placeholder="Shkruani adresën e destinacionit"
              onSelect={handleDestinationSelect}
              proximity={location ? { lat: location.lat, lng: location.lng } : null}
              autoFocus={true}
            />
          </div>

          {destination && estimatedPrice && distance && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300 mb-2">
                Parashikimi i çmimit
              </p>
              <div className="space-y-1 text-xs text-yellow-700 dark:text-yellow-400">
                <div className="flex justify-between">
                  <span>Tarifa e nisjes:</span>
                  <span>€{RATES.base_fare.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Distanca: {distance.toFixed(1)} km</span>
                  <span>€{(distance * RATES.per_km).toFixed(2)}</span>
                </div>
                {calculatingPrice && (
                  <div className="flex justify-center">
                    <Loader className="w-3 h-3 animate-spin" />
                  </div>
                )}
                <div className="flex justify-between font-semibold pt-1 border-t border-yellow-200 mt-1">
                  <span>Gjithsej:</span>
                  <span>€{estimatedPrice}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white py-2 rounded-lg"
            >
              Anulo
            </button>
            <button
              onClick={handleOrder}
              disabled={ordering || !destination}
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {ordering ? <Loader className="w-4 h-4 animate-spin" /> : '🚕 Porosit Taxi'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}