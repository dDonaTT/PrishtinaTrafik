// client/src/hooks/useInspector.js
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

  // Funksioni kryesor për verifikim - këtu bëhet parse-i i QR kodit
  const verifyTicket = async (scannedData) => {
    if (!scannedData) {
      toast.error('Ju lutem skanoni një QR kod');
      return null;
    }

    setVerifying(true);
    try {
      // Pastro të dhënat e skanuara
      let cleanTicketId = scannedData;
      
      // Nëse scannedData është JSON string, parse-o dhe nxirre ticket_id
      if (typeof scannedData === 'string') {
        // Provo të pastrosh nga thonjëzat e tepërta
        let cleaned = scannedData.trim();
        
        // Nëse fillon me {, është JSON
        if (cleaned.startsWith('{')) {
          try {
            const parsed = JSON.parse(cleaned);
            cleanTicketId = parsed.ticket_id;
            console.log('Extracted ticket_id from JSON:', cleanTicketId);
          } catch (parseError) {
            console.error('Failed to parse JSON, using raw value:', parseError);
            cleanTicketId = cleaned;
          }
        } 
        // Nëse ka thonjëza rreth stringut
        else if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
          cleanTicketId = cleaned.slice(1, -1);
        }
        // Nëse është thjesht një ID normale
        else {
          cleanTicketId = cleaned;
        }
      }
      
      console.log('Final ticket ID to verify:', cleanTicketId);
      
      const result = await inspectorService.verifyTicket(cleanTicketId);
      
      if (result.valid) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
      
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