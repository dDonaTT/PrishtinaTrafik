import React from 'react';
import { Bus, MapPin, X, Clock } from 'lucide-react';

export default function StopRoutesModal({ stop, onClose }) {
    // Ndaj linjat nga string (p.sh. "1,1A,3,3A,4")
    const routeNumbers = stop.route_numbers ? stop.route_numbers.split(',').map(r => r.trim()) : [];

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-blue-600" />
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                            Linjat në stacion
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                        {stop.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        🚏 Stacion autobusi
                    </p>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                        <Bus className="w-4 h-4" />
                        Linjat që kalojnë këtu ({routeNumbers.length})
                    </h4>
                    
                    {routeNumbers.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <Bus className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                            <p>Nuk ka linja të regjistruara për këtë stacion</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {routeNumbers.map((routeNum) => (
                                <div
                                    key={routeNum}
                                    className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3 text-center hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all cursor-pointer"
                                    onClick={() => {
                                        console.log('Selected route:', routeNum);
                                    }}
                                >
                                    <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                                        {routeNum}
                                    </span>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Linja {routeNum}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
                    <p className="text-xs text-gray-500 text-center">
                        Kliko në një linjë për të parë itinerarin e plotë
                    </p>
                </div>
            </div>
        </div>
    );
}