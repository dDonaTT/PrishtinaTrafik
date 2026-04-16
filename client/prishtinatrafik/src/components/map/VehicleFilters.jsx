// client/src/components/map/VehicleFilters.jsx
import React from 'react';
import { Bus, Car, Bike, Scooter, LayoutGrid } from 'lucide-react';

const filters = [
  { type: 'all', icon: LayoutGrid, label: 'All', color: 'gray' },
  { type: 'bus', icon: Bus, label: 'Bus', color: 'blue' },
  { type: 'taxi', icon: Car, label: 'Taxi', color: 'yellow' },
  { type: 'bike', icon: Bike, label: 'Bike', color: 'green' },
  { type: 'scooter', icon: Scooter, label: 'Scooter', color: 'purple' }
];

const VehicleFilters = ({ selectedType, onSelectType }) => {
  return (
    <div className="absolute top-4 left-3 right-3 z-20 md:top-1.5 md:left-1/2 md:right-auto md:-translate-x-1/2">
      <div className="block md:hidden">
        <div className="flex gap-1.5 overflow-x-auto pb-1 px-1 scrollbar-hide">
          {filters.map(({ type, icon: Icon, label }) => (
            <button
              key={type}
              onClick={() => onSelectType(type === 'all' ? null : type)}
              className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                (type === 'all' && !selectedType) || selectedType === type
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="hidden md:flex md:gap-2 md:bg-white/90 md:dark:bg-gray-800/90 md:backdrop-blur-sm md:rounded-full md:shadow-lg md:px-3 md:py-2">
        {filters.map(({ type, icon: Icon, label }) => (
          <button
            key={type}
            onClick={() => onSelectType(type === 'all' ? null : type)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
              (type === 'all' && !selectedType) || selectedType === type
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default VehicleFilters;