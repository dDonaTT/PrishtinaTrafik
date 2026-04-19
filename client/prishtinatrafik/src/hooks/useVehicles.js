import { useState, useCallback } from 'react';
import vehicleService from '../services/vehicleService';
import toast from 'react-hot-toast';

export const useVehicles = () => {
  const [vehicles, setVehicles] = useState({
    bikes: [],
    scooters: [],
    buses: [],
    taxis: [],
  });
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState(null);

  const loadAllVehicles = useCallback(async (type = null) => {
    try {
      setLoading(true);
      
      const response = await vehicleService.getAllVehicles(type);
      const data = response.data || [];

      setVehicles((prev) => {
        const updatedVehicles = { ...prev };

        if (!type || type === "all") {
          updatedVehicles.bikes = data.filter((v) => v.vehicle_type === "bike");
          updatedVehicles.scooters = data.filter((v) => v.vehicle_type === "scooter");
          updatedVehicles.buses = data.filter((v) => v.vehicle_type === "bus");
          updatedVehicles.taxis = data.filter((v) => v.vehicle_type === "taxi");
        } else {
          const keyMap = {
            bike: "bikes",
            scooter: "scooters",
            bus: "buses",
            taxi: "taxis",
          };
          const key = keyMap[type];
          if (key) {
            updatedVehicles[key] = data;
          }
        }

        return updatedVehicles;
      });

      return data;
    } catch (error) {
      console.error("LOAD VEHICLES ERROR:", error);
      toast.error("Gabim gjatë ngarkimit të mjeteve");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    vehicles,
    loading,
    selectedType,
    setSelectedType,
    loadAllVehicles,  
  };
};