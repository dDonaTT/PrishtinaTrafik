import { useState, useEffect, useCallback, useRef } from 'react';
import rideService from '../services/rideService';
import toast from 'react-hot-toast';

export const useRides = () => {
  const [activeRide, setActiveRide] = useState(null);
  const [rideHistory, setRideHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const pricePerMinuteRef = useRef(0);

  const startTimer = useCallback((startTime, pricePerMinute) => {
    // Stop timer-in ekzistues
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    startTimeRef.current = new Date(startTime);
    pricePerMinuteRef.current = pricePerMinute || 0.05;
    
    const updateDuration = () => {
      if (!startTimeRef.current) return;
      
      const now = new Date();
      const diffMs = now - startTimeRef.current;
      const minutes = Math.floor(diffMs / 60000);
      const seconds = Math.floor((diffMs % 60000) / 1000);
      const cost = (minutes * pricePerMinuteRef.current).toFixed(2);
      
      setActiveRide(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          current_duration: { minutes, seconds },
          current_cost: cost
        };
      });
    };
    
    updateDuration();
    
    timerRef.current = setInterval(updateDuration, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    startTimeRef.current = null;
  }, []);

  const loadActiveRide = useCallback(async () => {
    try {
      const response = await rideService.getActiveRide();
      console.log('Active ride response:', response);
      
      // response është response.data nga API
      if (response && response.data) {
        const ride = response.data;
        setActiveRide(ride);
        if (ride.start_time) {
          const price = ride.price_per_minute || 
                       (ride.vehicle_type === 'bike' ? 0.05 : 0.03);
          startTimer(ride.start_time, price);
        }
      } else if (response && response.ride_id) {
        setActiveRide(response);
        if (response.start_time) {
          const price = response.price_per_minute || 
                       (response.vehicle_type === 'bike' ? 0.05 : 0.03);
          startTimer(response.start_time, price);
        }
      } else {
        setActiveRide(null);
        stopTimer();
      }
    } catch (error) {
      console.error('Load active ride error:', error);
      setActiveRide(null);
      stopTimer();
    }
  }, [startTimer, stopTimer]);

  const loadRideHistory = useCallback(async () => {
    try {
      const response = await rideService.getRideHistory();
      console.log('Ride history response:', response);
      
      let history = [];
      if (response && response.data) {
        history = Array.isArray(response.data) ? response.data : [];
      } else if (Array.isArray(response)) {
        history = response;
      }
      setRideHistory(history);
    } catch (error) {
      console.error('Load ride history error:', error);
      setRideHistory([]);
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const response = await rideService.getRideStats();
      console.log('Ride stats response:', response);
      
      if (response && response.data) {
        setStats(response.data);
      } else if (response) {
        setStats(response);
      } else {
        setStats(null);
      }
    } catch (error) {
      console.error('Load stats error:', error);
      setStats(null);
    }
  }, []);

  const startRide = async (vehicleId, vehicleType, startLocation) => {
    try {
      setLoading(true);
      const response = await rideService.startRide({
        vehicle_id: vehicleId,
        vehicle_type: vehicleType,
        start_location: startLocation
      });
      
      console.log('Start ride response:', response);
      
      if (response && response.data) {
        const ride = response.data;
        setActiveRide(ride);
        if (ride.start_time) {
          const price = ride.price_per_minute || 
                       (ride.vehicle_type === 'bike' ? 0.05 : 0.03);
          startTimer(ride.start_time, price);
        }
      }
      
      toast.success('Udhëtimi filloi!');
      await loadRideHistory();
      return response?.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gabim gjatë fillimit');
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
        end_location: endLocation
      });
      
      console.log('End ride response:', response);
      
      const totalCost = response?.data?.total_cost || 
                        response?.total_cost || 
                        '0';
      
      toast.success(`Udhëtimi përfundoi! Kosto: €${totalCost}`);
      stopTimer();
      setActiveRide(null);
      await loadRideHistory();
      await loadStats();
      return response?.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gabim gjatë përfundimit');
      throw error;
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([loadActiveRide(), loadRideHistory(), loadStats()]);
      setLoading(false);
    };
    loadAll();
    
    return () => stopTimer();
  }, [loadActiveRide, loadRideHistory, loadStats, stopTimer]);

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