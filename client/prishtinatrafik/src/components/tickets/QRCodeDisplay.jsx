// client/src/components/tickets/QRCodeDisplay.jsx
import React, { useState } from 'react';
import { Download, Share2, X, CheckCircle } from 'lucide-react';

export default function QRCodeDisplay({ ticket, onClose }) {
  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.download = `ticket-${ticket.ticket_id}.png`;
    link.href = ticket.qr_code;
    link.click();
  };

  const handleShare = async () => {
    try {
      const blob = await (await fetch(ticket.qr_code)).blob();
      const file = new File([blob], `ticket-${ticket.ticket_id}.png`, { type: 'image/png' });
      
      if (navigator.share) {
        await navigator.share({
          title: 'Bileta ime',
          text: `Bileta ${ticket.vehicle_type} - ${ticket.route_name}`,
          files: [file]
        });
      } else {
        handleDownload();
      }
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(ticket.ticket_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-sm w-full">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Bileta juaj
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          {/* QR Code */}
          <div className="bg-white p-4 rounded-xl inline-block mx-auto mb-4">
            <img
              src={ticket.qr_code}
              alt="QR Code"
              className="w-48 h-48 mx-auto"
            />
          </div>

          {/* Ticket Info */}
          <div className="text-left mb-4">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 mb-2">
              <p className="text-xs text-gray-500">Lloji</p>
              <p className="font-semibold capitalize">{ticket.vehicle_type}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 mb-2">
              <p className="text-xs text-gray-500">Rruga</p>
              <p className="font-semibold">{ticket.route_name || '-'}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              <p className="text-xs text-gray-500">ID e biletës</p>
              <div className="flex items-center justify-between">
                <p className="font-mono text-sm">{ticket.ticket_id?.slice(0, 8)}...</p>
                <button
                  onClick={handleCopyId}
                  className="text-blue-600 text-xs hover:underline"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleDownload}
              className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded-lg flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Shkarko
            </button>
            <button
              onClick={handleShare}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Shpërndaje
            </button>
          </div>

          <p className="text-xs text-gray-400 mt-4">
            Tregoje këtë QR kod konduktorit për verifikim
          </p>
        </div>
      </div>
    </div>
  );
}