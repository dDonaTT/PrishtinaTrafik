import React from 'react';
import { Bus, MapPin, X } from 'lucide-react';

export default function RouteDetailsModal({ route, onClose }) {
    console.log('RouteDetailsModal opened with route:', route);
    
    if (!route) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full">
                <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                        <Bus className="w-5 h-5 text-blue-600" />
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                            Detajet e Linjës
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4">
                    <div className="text-center mb-4">
                        <div className="inline-block bg-blue-100 dark:bg-blue-900/30 rounded-full px-4 py-2">
                            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                Linja {route.route_number}
                            </span>
                        </div>
                        {route.name && (
                            <p className="text-sm text-gray-500 mt-2">{route.name}</p>
                        )}
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-4">
                        <div className="flex items-center gap-2 mb-3">
                            <MapPin className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium">Nisja:</span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                {route.start_point}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-red-600" />
                            <span className="text-sm font-medium">Mbarimi:</span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                {route.end_point}
                            </span>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            Informata shtesë
                        </h4>
                        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            <p>🚏 Stacione: Duke u përditësuar...</p>
                            <p>⏱️ Frekuenca: Çdo 15-20 minuta</p>
                            <p>💰 Çmimi: €0.40</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
                    <button
                        onClick={onClose}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium"
                    >
                        Mbylle
                    </button>
                </div>
            </div>
        </div>
    );
}