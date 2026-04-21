import React, { useState, useEffect } from 'react';
import { Bus, X, CreditCard, Loader, Calendar, Clock } from 'lucide-react';
import API from '../../services/api';

const TICKET_TYPES = [
  { 
    type: 'single', 
    name: 'Biletë e vetme', 
    price: 0.40, 
    duration: '1 përdorim',
    icon: '🎫',
    description: 'Vlen për një udhëtim',
    requiresVehicle: true
  },
  { 
    type: 'daily', 
    name: 'Biletë ditore', 
    price: 2.00, 
    duration: '24 orë',
    icon: '📅',
    description: 'Udhëtime të pakufizuara për 24 orë',
    requiresVehicle: false
  },
  { 
    type: 'weekly', 
    name: 'Biletë javore', 
    price: 8.00, 
    duration: '7 ditë',
    icon: '📆',
    description: 'Udhëtime të pakufizuara për 7 ditë',
    requiresVehicle: false
  },
  { 
    type: 'monthly', 
    name: 'Biletë mujore', 
    price: 15.00, 
    duration: '30 ditë',
    icon: '🗓️',
    description: 'Udhëtime të pakufizuara për 30 ditë',
    requiresVehicle: false
  }
];

export default function BuyTicketModal({ isOpen, onClose, onBuy, preselectedVehicle = null }) {
  const [step, setStep] = useState(1);
  const [selectedTicketType, setSelectedTicketType] = useState('single');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setSelectedTicketType('single');
      setSelectedVehicle(null);
    }
  }, [isOpen]);

  const fetchVehicles = async () => {
    setFetching(true);
    try {
      const response = await API.get('/rides/all');
      const allVehicles = response.data?.data || [];
      
      setVehicles(allVehicles.filter(v => v.vehicle_type === 'bus' && v.is_available !== false));
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchVehicles();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTicketTypeSelect = (ticketType) => {
    setSelectedTicketType(ticketType);
    const ticketInfo = TICKET_TYPES.find(t => t.type === ticketType);
    
    if (ticketInfo.requiresVehicle) {
      setStep(2);
    } else {
      setStep(3);
    }
  };

  const handleVehicleSelect = (vehicle) => {
    setSelectedVehicle(vehicle);
    setStep(3);
  };

  const handleConfirm = async () => {
    setLoading(true);
    const ticketInfo = TICKET_TYPES.find(t => t.type === selectedTicketType);
    
    await onBuy({
      vehicle_id: ticketInfo.requiresVehicle ? selectedVehicle?.vehicle_id : 'ALL-BUSES',
      vehicle_type: 'bus',
      route_name: ticketInfo.requiresVehicle ? (selectedVehicle?.route_name || `Linja ${selectedVehicle?.vehicle_id}`) : 'Të gjitha linjat',
      ticket_type: selectedTicketType
    });
    setLoading(false);
    handleClose();
  };

  const handleClose = () => {
    onClose();
  };

  const getSelectedTicketInfo = () => {
    return TICKET_TYPES.find(t => t.type === selectedTicketType);
  };

  // Step 1: Zgjedh llojin e biletës
  if (step === 1) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Bli biletë</h2>
            <button onClick={handleClose} className="p-1 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-4">
            <p className="text-gray-600 dark:text-gray-400 mb-4">Zgjidh llojin e biletës</p>
            <div className="space-y-3">
              {TICKET_TYPES.map((ticket) => (
                <button
                  key={ticket.type}
                  onClick={() => handleTicketTypeSelect(ticket.type)}
                  className="w-full text-left p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-500 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{ticket.icon}</span>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{ticket.name}</p>
                        <p className="text-xs text-gray-500">{ticket.description}</p>
                      </div>
                    </div>
                    <p className="text-xl font-bold text-blue-600">€{ticket.price}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span>Vlen për: {ticket.duration}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Zgjedh autobusin (vetëm për single ticket)
  if (step === 2) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-xl font-bold">Zgjidh autobusin</h2>
            <button onClick={() => setStep(1)} className="text-blue-600">← Kthehu</button>
          </div>
          <div className="p-4">
            {vehicles.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Nuk ka autobusë të disponueshëm</p>
                <button onClick={fetchVehicles} className="mt-2 text-blue-600 text-sm">Rifresko</button>
              </div>
            ) : (
              <div className="space-y-3">
                {vehicles.map((vehicle) => (
                  <button
                    key={vehicle.id || vehicle.vehicle_id}
                    onClick={() => handleVehicleSelect(vehicle)}
                    className="w-full flex items-center justify-between p-4 border rounded-xl hover:border-blue-500"
                  >
                    <div>
                      <p className="font-semibold">{vehicle.vehicle_id}</p>
                      <p className="text-sm text-gray-500">{vehicle.route_name || 'Në lëvizje'}</p>
                    </div>
                    <span className="text-blue-600">→</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Konfirmimi
  if (step === 3) {
    const ticketInfo = getSelectedTicketInfo();
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-xl font-bold">Konfirmo blerjen</h2>
            <button onClick={() => setStep(ticketInfo.requiresVehicle ? 2 : 1)} className="text-blue-600">← Kthehu</button>
          </div>
          <div className="p-6">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
                  {ticketInfo.icon}
                </div>
                <div>
                  <p className="font-semibold">{ticketInfo.name}</p>
                  <p className="text-sm text-gray-500">{ticketInfo.duration}</p>
                </div>
              </div>
              <div className="space-y-2">
                {ticketInfo.requiresVehicle && selectedVehicle && (
                  <div className="flex justify-between py-2 border-b">
                    <span>Autobusi</span>
                    <span className="font-medium">{selectedVehicle.vehicle_id}</span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-b">
                  <span>Vlefshmëria</span>
                  <span className="font-medium">{ticketInfo.duration}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span>Çmimi</span>
                  <span className="font-bold text-lg text-blue-600">€{ticketInfo.price}</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
              Konfirmo blerjen
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}