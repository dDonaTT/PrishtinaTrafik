import React, { useState } from 'react';
import { Bus, MapPin, Clock, ChevronRight, X } from 'lucide-react';

export default function BusRoutesPanel({ routes, onSelectRoute, onClose }) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredRoutes = routes.filter(route =>
        route.route_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.start_point?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.end_point?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleRouteClick = (route) => {
        console.log('Route selected:', route);
        onSelectRoute(route);
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                    <Bus className="w-5 h-5 text-blue-600" />
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                        Linjat e Autobusit
                    </h2>
                </div>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                <input
                    type="text"
                    placeholder="Kërko linjë..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
            </div>

            <div className="flex-1 overflow-y-auto p-2">
                {filteredRoutes.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <Bus className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                        <p>Nuk u gjetën linja</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {filteredRoutes.map((route) => (
                            <button
                                key={route.id}
                                onClick={() => handleRouteClick(route)}
                                className="w-full text-left p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-blue-600 dark:text-blue-400">
                                                Linja {route.route_number}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {route.name}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                            <MapPin className="w-3 h-3" />
                                            <span>{route.start_point}</span>
                                            <ChevronRight className="w-3 h-3" />
                                            <MapPin className="w-3 h-3" />
                                            <span>{route.end_point}</span>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}