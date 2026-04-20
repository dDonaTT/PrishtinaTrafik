import { useState, useEffect, useCallback } from "react";
import busService from "../services/busService";
import toast from "react-hot-toast";

export const useBus = () => {
  const [routes, setRoutes] = useState([]);
  const [allStops, setAllStops] = useState([]);
  const [nearbyStops, setNearbyStops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [showStops, setShowStops] = useState(false);

  const loadRoutes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await busService.getAllRoutes();
      setRoutes(response.data || []);
    } catch (error) {
      console.error("Load routes error:", error);
      toast.error("Gabim gjatë ngarkimit të linjave");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAllStops = useCallback(async () => {
    try {
      setLoading(true);
      const response = await busService.getAllStops();
      setAllStops(response.data || []);
      console.log("All stops loaded:", response.data?.length);
    } catch (error) {
      console.error("Load all stops error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadNearbyStops = useCallback(
    async (latitude, longitude, radius = 1) => {
      if (!latitude || !longitude) return;

      try {
        const response = await busService.getNearbyStops(
          latitude,
          longitude,
          radius,
        );
        setNearbyStops(response.data || []);
        return response.data;
      } catch (error) {
        console.error("Load nearby stops error:", error);
        return [];
      }
    },
    [],
  );

  useEffect(() => {
    loadRoutes();
    loadAllStops();
  }, [loadRoutes, loadAllStops]);

  return {
    routes,
    allStops, 
    nearbyStops, 
    loading,
    selectedRoute,
    setSelectedRoute,
    showStops,
    setShowStops,
    loadRoutes,
    loadAllStops,
    loadNearbyStops,
  };
};
