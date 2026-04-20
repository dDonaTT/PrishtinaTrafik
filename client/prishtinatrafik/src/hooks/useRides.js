// client/src/hooks/useRides.js
import { useState, useEffect, useCallback } from 'react';
import rideService from '../services/rideService';
import toast from 'react-hot-toast';

export const useRides = () => {
  const [activeRide, setActiveRide] = useState(null);
  const [rideHistory, setRideHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timer, setTimer] = useState(null);

  // Ngarko udhëtimin aktiv
  const loadActiveRide = useCallback(async () => {
    try {
      const response = await rideService.getActiveRide();
      console.log('Active ride response:', response); // Debug
      if (response.data) {
        setActiveRide(response.data);
        startTimer(response.data.start_time);
      } else {
        setActiveRide(null);
        stopTimer();
      }
    } catch (error) {
      console.error('Load active ride error:', error);
    }
  }, []);

  // Ngarko historikun
  const loadRideHistory = useCallback(async () => {
    try {
      const response = await rideService.getRideHistory();
      console.log('Ride history response:', response); // Debug
      // Kontrollo formatin e përgjigjes
      if (response && response.data) {
        setRideHistory(Array.isArray(response.data) ? response.data : []);
      } else if (Array.isArray(response)) {
        setRideHistory(response);
      } else {
        setRideHistory([]);
      }
    } catch (error) {
      console.error('Load ride history error:', error);
      setRideHistory([]);
    }
  }, []);

  // Ngarko statistikat
  const loadStats = useCallback(async () => {
    try {
      const response = await rideService.getRideStats();
      console.log('Ride stats response:', response); // Debug
      if (response && response.data) {
        setStats(response.data);
      } else {
        setStats(null);
      }
    } catch (error) {
      console.error('Load stats error:', error);
      setStats(null);
    }
  }, []);

  // Timer për udhëtimin aktiv
  const startTimer = (startTime) => {
    stopTimer();
    const interval = setInterval(() => {
      if (activeRide) {
        const start = new Date(startTime);
        const now = new Date();
        const minutes = Math.floor((now - start) / 60000);
        const seconds = Math.floor(((now - start) % 60000) / 1000);
        setActiveRide(prev => ({
          ...prev,
          current_duration: { minutes, seconds },
          current_cost: (minutes * (prev.price_per_minute || 0)).toFixed(2)
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

  // Fillo udhëtimin (bike/scooter)
  const startRide = async (vehicleId, vehicleType, startLocation) => {
    try {
      setLoading(true);
      const response = await rideService.startRide({
        vehicle_id: vehicleId,
        vehicle_type: vehicleType,
        start_location: startLocation
      });
      console.log('Start ride response:', response);
      toast.success('Udhëtimi filloi!');
      await loadActiveRide();
      await loadRideHistory();
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gabim gjatë fillimit');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Përfundo udhëtimin (bike/scooter)
  const endRide = async (rideId, endLocation) => {
    try {
      setLoading(true);
      const response = await rideService.endRide({
        ride_id: rideId,
        end_location: endLocation
      });
      console.log('End ride response:', response);
      toast.success(`Udhëtimi përfundoi! Kosto: €${response.data?.total_cost || 0}`);
      stopTimer();
      setActiveRide(null);
      await loadRideHistory();
      await loadStats();
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gabim gjatë përfundimit');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Anulo udhëtimin
  const cancelRide = async () => {
    try {
      await rideService.cancelRide();
      toast.success('Udhëtimi u anulua');
      stopTimer();
      setActiveRide(null);
      await loadRideHistory();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gabim gjatë anulimit');
      throw error;
    }
  };

  // Ngarko të dhënat në fillim
  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([loadActiveRide(), loadRideHistory(), loadStats()]);
      setLoading(false);
    };
    loadAll();
  }, [loadActiveRide, loadRideHistory, loadStats]);

  // Pastro timer në unmount
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
    loadStats
  };
};