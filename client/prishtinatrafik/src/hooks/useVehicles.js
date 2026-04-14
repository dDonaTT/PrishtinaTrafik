import { useState, useCallback } from "react";
import vehicleService from "../services/vehicleService";
import toast from "react-hot-toast";

export const useVehicles = () => {
  const [vehicles, setVehicles] = useState({
    bikes: [],
    scooters: [],
    buses: [],
    taxis: [],
  });
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState(null);

  const loadNearbyVehicles = useCallback(async (latitude, longitude, type = null) => {
    if (!latitude || !longitude) return;

    try {
      setLoading(true);
      
      // Thirrja e shërbimit të API
      // Nëse type është null (për butonin "All"), API duhet të kthejë të gjitha
      const response = await vehicleService.getNearbyVehicles(
        latitude, 
        longitude, 
        type
      );

      const data = response.data || [];

      setVehicles((prev) => {
        // Krijojmë një kopje të gjendjes aktuale që të mos humbim të dhënat ekzistuese
        const updatedVehicles = { ...prev };

        if (!type || type === "all") {
          // Rasti "ALL": I ndajmë të gjitha të dhënat që erdhën nga API në kategoritë përkatëse
          updatedVehicles.bikes = data.filter((v) => v.vehicle_type === "bike");
          updatedVehicles.scooters = data.filter((v) => v.vehicle_type === "scooter");
          updatedVehicles.buses = data.filter((v) => v.vehicle_type === "bus");
          updatedVehicles.taxis = data.filter((v) => v.vehicle_type === "taxi");
        } else {
          // Rasti SPECIFIK (bike, scooter, etj.): 
          // Përditësojmë VETËM kategorinë që kemi kërkuar, të tjerat i mbajmë siç ishin (prev)
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
    loadNearbyVehicles,
  };
};