import { useState, useEffect, useCallback } from "react";
import rideService from "../services/rideService";
import toast from "react-hot-toast";

export const useRides = () => {
  const [activeRide, setActiveRide] = useState(null);
  const [rideHistory, setRideHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timer, setTimer] = useState(null);

  const loadActiveRide = useCallback(async () => {
    try {
      const response = await rideService.getActiveRide();
      if (response.data) {
        setActiveRide(response.data);
        startTimer(response.data.start_time);
      } else {
        setActiveRide(null);
        stopTimer();
      }
    } catch (error) {
      console.error("Load active ride error:", error);
    }
  }, []);

  const loadRideHistory = useCallback(async () => {
    try {
      const response = await rideService.getRideHistory();
      setRideHistory(response.data || []);
    } catch (error) {
      console.error("Load ride history error:", error);
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const response = await rideService.getRideStats();
      setStats(response.data);
    } catch (error) {
      console.error("Load stats error:", error);
    }
  }, []);

  const startTimer = (startTime) => {
    stopTimer();
    const interval = setInterval(() => {
      if (activeRide) {
        const start = new Date(startTime);
        const now = new Date();
        const minutes = Math.floor((now - start) / 60000);
        const seconds = Math.floor(((now - start) % 60000) / 1000);
        setActiveRide((prev) => ({
          ...prev,
          current_duration: { minutes, seconds },
          current_cost: (minutes * (prev.price_per_minute || 0)).toFixed(2),
        }));
      }
    }, 1000);
    setTimer(interval);
  };

  const stopTimer = () => {
    if (timer) {
      clearInterval(timer);
      setTimer(null);
    }
  };

  const startRide = async (vehicleId, vehicleType, startLocation) => {
    try {
      setLoading(true);
      const response = await rideService.startRide({
        vehicle_id: vehicleId,
        vehicle_type: vehicleType,
        start_location: startLocation,
      });
      toast.success("Udhëtimi filloi!");
      await loadActiveRide();
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Gabim gjatë fillimit");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const endRide = async (rideId, endLocation) => {
    try {
      setLoading(true);
      const response = await rideService.endRide({
        ride_id: rideId,
        end_location: endLocation,
      });
      toast.success(`Udhëtimi përfundoi! Kosto: €${response.data.total_cost}`);
      stopTimer();
      setActiveRide(null);
      await loadRideHistory();
      await loadStats();
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Gabim gjatë përfundimit");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const cancelRide = async () => {
    try {
      await rideService.cancelRide();
      toast.success("Udhëtimi u anulua");
      stopTimer();
      setActiveRide(null);
      await loadRideHistory();
    } catch (error) {
      toast.error(error.response?.data?.message || "Gabim gjatë anulimit");
      throw error;
    }
  };

  useEffect(() => {
    loadActiveRide();
    loadRideHistory();
    loadStats();
  }, [loadActiveRide, loadRideHistory, loadStats]);

  useEffect(() => {
    return () => stopTimer();
  }, []);

  return {
    activeRide,
    rideHistory,
    stats,
    loading,
    startRide,
    endRide,
    cancelRide,
    loadActiveRide,
    loadRideHistory,
    loadStats,
  };
};
