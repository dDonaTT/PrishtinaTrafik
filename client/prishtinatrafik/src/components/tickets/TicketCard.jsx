// client/src/components/tickets/TicketCard.jsx
import React, { useState } from 'react';
import { Bus, Car, Calendar, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';
import QRCodeDisplay from './QRCodeDisplay';

export default function TicketCard({ ticket, onCancel }) {
  const [showQR, setShowQR] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const isUsed = ticket.used_at !== null;
  const isValid = ticket.is_valid && !isUsed;
  
  const createdDate = new Date(ticket.created_at);
  const formattedDate = createdDate.toLocaleDateString('sq-AL');
  const formattedTime = createdDate.toLocaleTimeString('sq-AL', { hour: '2-digit', minute: '2-digit' });

  const handleCancel = async () => {
    if (window.confirm('A jeni i sigurt që dëshironi ta anuloni këtë biletë?')) {
      setCancelling(true);
      await onCancel(ticket.ticket_id);
      setCancelling(false);
    }
  };

  return (
    <>
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border-l-4 transition-all ${
        isValid ? 'border-l-green-500' : isUsed ? 'border-l-gray-400' : 'border-l-red-500'
      }`}>
        <div className="p-4">
          {/* Header */}
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                ticket.vehicle_type === 'bus' 
                  ? 'bg-blue-100 dark:bg-blue-900/30' 
                  : 'bg-yellow-100 dark:bg-yellow-900/30'
              }`}>
                {ticket.vehicle_type === 'bus' ? (
                  <Bus className="w-5 h-5 text-blue-600" />
                ) : (
                  <Car className="w-5 h-5 text-yellow-600" />
                )}
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white capitalize">
                  {ticket.vehicle_type === 'bus' ? 'Autobus' : 'Taksi'}
                </p>
                <p className="text-xs text-gray-500">{ticket.vehicle_id}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-900 dark:text-white">€{ticket.cost}</p>
              <div className="flex items-center gap-1 mt-1">
                {isValid ? (
                  <>
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-green-600">Aktive</span>
                  </>
                ) : isUsed ? (
                  <>
                    <CheckCircle className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">E përdorur</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-3 h-3 text-red-500" />
                    <span className="text-xs text-red-600">E anuluar</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Route Info */}
          {ticket.route_name && (
            <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-xs text-gray-500">Rruga</p>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {ticket.route_name}
              </p>
            </div>
          )}

          {/* Date & Time */}
          <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{formattedTime}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {isValid && (
              <>
                <button
                  onClick={() => setShowQR(true)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-lg flex items-center justify-center gap-1 transition-all"
                >
                  <Eye className="w-4 h-4" />
                  Shiko QR
                </button>
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="px-4 bg-red-100 hover:bg-red-200 text-red-600 text-sm font-medium py-2 rounded-lg transition-all disabled:opacity-50"
                >
                  {cancelling ? '...' : 'Anulo'}
                </button>
              </>
            )}
            {isUsed && (
              <div className="w-full text-center py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <p className="text-xs text-gray-500">
                  Përdorur më {new Date(ticket.used_at).toLocaleDateString('sq-AL')}
                </p>
              </div>
            )}
            {!isValid && !isUsed && (
              <div className="w-full text-center py-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-xs text-red-600">Bileta është anuluar</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showQR && (
        <QRCodeDisplay
          ticket={ticket}
          onClose={() => setShowQR(false)}
        />
      )}
    </>
  );
}