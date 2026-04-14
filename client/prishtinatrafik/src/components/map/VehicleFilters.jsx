import React from "react";
import { Bus, Car, Bike, Scooter } from "lucide-react";

const filters = [
  { type: "bus", icon: Bus, label: "Bus", color: "blue" },
  { type: "taxi", icon: Car, label: "Taxi", color: "yellow" },
  { type: "bike", icon: Bike, label: "Bike", color: "green" },
  { type: "scooter", icon: Scooter, label: "Scooter", color: "purple" },
];

// Tailwind nuk i suporton emrat dinamik si bg-${color}-600 pa i deklaruar,
// andaj i mapojmë klasat këtu për siguri.
const colorClasses = {
  blue: "bg-blue-600",
  yellow: "bg-yellow-500",
  green: "bg-green-600",
  purple: "bg-purple-600",
};

const VehicleFilters = ({ selectedType, onSelectType }) => {
  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 flex gap-2 overflow-x-auto max-w-[90vw]">
      <button
        onClick={() => onSelectType(null)}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
          !selectedType
            ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
        }`}
      >
        All
      </button>

      {filters.map(({ type, icon: Icon, label, color }) => (
        <button
          key={type}
          onClick={() => onSelectType(type)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
            selectedType === type
              ? `${colorClasses[color]} text-white`
              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
          }`}
        >
          <Icon className="w-4 h-4" />
          {label}
        </button>
      ))}
    </div>
  );
};

export default VehicleFilters;