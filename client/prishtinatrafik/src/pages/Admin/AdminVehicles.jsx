import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Power, MapPin, Battery } from 'lucide-react';

const VEHICLE_TYPES = {
  bus: { label: 'Autobus', icon: '🚌', color: 'blue' },
  taxi: { label: 'Taksi', icon: '🚕', color: 'yellow' },
  bike: { label: 'Biçikletë', icon: '🚲', color: 'green' },
  scooter: { label: 'Scooter', icon: '🛴', color: 'purple' }
};

export default function AdminVehicles({ vehicles, onCreate, onUpdate, onDelete }) {
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [formData, setFormData] = useState({
    vehicle_id: '',
    vehicle_type: 'bus',
    latitude: '',
    longitude: '',
    battery_level: '',
    route_name: '',
    is_available: true
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingVehicle) {
      await onUpdate(editingVehicle.id, formData);
    } else {
      await onCreate(formData);
    }
    setShowModal(false);
    setEditingVehicle(null);
    setFormData({
      vehicle_id: '',
      vehicle_type: 'bus',
      latitude: '',
      longitude: '',
      battery_level: '',
      route_name: '',
      is_available: true
    });
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      vehicle_id: vehicle.vehicle_id,
      vehicle_type: vehicle.vehicle_type,
      latitude: vehicle.latitude || '',
      longitude: vehicle.longitude || '',
      battery_level: vehicle.battery_level || '',
      route_name: vehicle.route_name || '',
      is_available: vehicle.is_available
    });
    setShowModal(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Menaxhimi i Mjeteve
        </h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Shto Mjet
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vehicles.map((vehicle) => (
          <div
            key={vehicle.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">
                  {VEHICLE_TYPES[vehicle.vehicle_type]?.icon || '🚗'}
                </span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {VEHICLE_TYPES[vehicle.vehicle_type]?.label}
                  </h3>
                  <p className="text-sm text-gray-500">{vehicle.vehicle_id}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleEdit(vehicle)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <Edit2 className="w-4 h-4 text-gray-500" />
                </button>
                <button
                  onClick={() => onDelete(vehicle.id)}
                  className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              {vehicle.route_name && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <MapPin className="w-3 h-3" />
                  <span>{vehicle.route_name}</span>
                </div>
              )}
              {vehicle.battery_level && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Battery className="w-3 h-3" />
                  <span>Bateria: {vehicle.battery_level}%</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  vehicle.is_available
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {vehicle.is_available ? 'Disponueshëm' : 'I zënë'}
                </span>
                <button
                  onClick={() => onUpdate(vehicle.id, { is_available: !vehicle.is_available })}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <Power className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingVehicle ? 'Përditëso Mjetin' : 'Shto Mjet të Ri'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingVehicle(null);
                }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Lloji i Mjetit
                </label>
                <select
                  value={formData.vehicle_type}
                  onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  required
                >
                  <option value="bus">Autobus</option>
                  <option value="taxi">Taksi</option>
                  <option value="bike">Biçikletë</option>
                  <option value="scooter">Scooter</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  ID e Mjetit
                </label>
                <input
                  type="text"
                  value={formData.vehicle_id}
                  onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  placeholder="BUS-001"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Gjatësia (Lat)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    placeholder="42.6629"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Gjerësia (Lng)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    placeholder="21.1655"
                  />
                </div>
              </div>

              {(formData.vehicle_type === 'bike' || formData.vehicle_type === 'scooter') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Niveli i Baterisë (%)
                  </label>
                  <input
                    type="number"
                    value={formData.battery_level}
                    onChange={(e) => setFormData({ ...formData, battery_level: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    placeholder="100"
                  />
                </div>
              )}

              {(formData.vehicle_type === 'bus' || formData.vehicle_type === 'taxi') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Linja/Rruga
                  </label>
                  <input
                    type="text"
                    value={formData.route_name}
                    onChange={(e) => setFormData({ ...formData, route_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    placeholder="Prishtina - Ferizaj"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingVehicle(null);
                  }}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white py-2 rounded-lg"
                >
                  Anulo
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
                >
                  {editingVehicle ? 'Përditëso' : 'Shto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}