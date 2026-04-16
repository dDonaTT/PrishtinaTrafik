import { useState, useEffect, useCallback } from 'react';
import ticketService from '../services/ticketService';
import toast from 'react-hot-toast';

export const useTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState(null);

  const loadTickets = useCallback(async (type = null) => {
    try {
      setLoading(true);
      const response = await ticketService.getMyTickets(type);
      setTickets(response.data || []);
      return response.data;
    } catch (error) {
      console.error('Load tickets error:', error);
      toast.error('Gabim gjatë ngarkimit të biletave');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const response = await ticketService.getTicketStats();
      setStats(response.data);
    } catch (error) {
      console.error('Load stats error:', error);
    }
  }, []);

  const buyTicket = async (ticketData) => {
    try {
      setLoading(true);
      const response = await ticketService.buyTicket(ticketData);
      toast.success('Bileta u blerë me sukses!');
      await loadTickets(selectedType);
      await loadStats();
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gabim gjatë blerjes së biletës');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const cancelTicket = async (ticketId) => {
    try {
      await ticketService.cancelTicket(ticketId);
      toast.success('Bileta u anulua me sukses');
      await loadTickets(selectedType);
      await loadStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gabim gjatë anulimit');
      throw error;
    }
  };

  useEffect(() => {
    loadTickets();
    loadStats();
  }, [loadTickets, loadStats]);

  useEffect(() => {
    loadTickets(selectedType);
  }, [selectedType, loadTickets]);

  return {
    tickets,
    stats,
    loading,
    selectedType,
    setSelectedType,
    buyTicket,
    cancelTicket,
    loadTickets,
    loadStats
  };
};