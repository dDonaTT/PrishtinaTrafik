import { useState, useEffect, useCallback } from 'react';
import inspectorService from '../services/inspectorService';
import toast from 'react-hot-toast';

export const useInspector = () => {
  const [stats, setStats] = useState(null);
  const [activeRides, setActiveRides] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);

  const loadStats = useCallback(async () => {
    try {
      const data = await inspectorService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Load stats error:', error);
    }
  }, []);

  const loadActiveRides = useCallback(async () => {
    try {
      const data = await inspectorService.getActiveRides();
      setActiveRides(data || []);
    } catch (error) {
      console.error('Load active rides error:', error);
    }
  }, []);

  const loadHistory = useCallback(async () => {
    try {
      const data = await inspectorService.getHistory();
      setHistory(data || []);
    } catch (error) {
      console.error('Load history error:', error);
    }
  }, []);

  const verifyTicket = async (ticketId) => {
    if (!ticketId) {
      toast.error('Ju lutem skanoni një QR kod');
      return null;
    }

    setVerifying(true);
    try {
      const result = await inspectorService.verifyTicket(ticketId);
      toast.success(result.message);
      await loadStats();
      await loadHistory();
      return result;
    } catch (error) {
      const message = error.response?.data?.message || 'Gabim gjatë verifikimit';
      toast.error(message);
      return { valid: false, message };
    } finally {
      setVerifying(false);
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([loadStats(), loadActiveRides(), loadHistory()]);
      setLoading(false);
    };
    loadAll();
  }, [loadStats, loadActiveRides, loadHistory]);

  return {
    stats,
    activeRides,
    history,
    loading,
    verifying,
    verifyTicket,
    loadStats,
    loadActiveRides,
    loadHistory
  };
};