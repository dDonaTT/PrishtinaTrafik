import { useState, useEffect, useCallback } from 'react';
import walletService from '../services/walletService';
import toast from 'react-hot-toast';

export const useWallet = () => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [topUpLoading, setTopUpLoading] = useState(false);

  const loadBalance = useCallback(async () => {
    try {
      const data = await walletService.getBalance();
      setBalance(typeof data.balance === 'number' ? data.balance : parseFloat(data.balance || 0));
    } catch (error) {
      console.error('Load balance error:', error);
    }
  }, []);

  const loadTransactions = useCallback(async () => {
    try {
      const data = await walletService.getTransactions();
      setTransactions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Load transactions error:', error);
      setTransactions([]);
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const data = await walletService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Load stats error:', error);
      setStats(null);
    }
  }, []);

  const topUpWithStripe = async (amount) => {
    if (!amount || amount <= 0) {
      toast.error('Shuma e pavlefshme');
      return false;
    }

    setTopUpLoading(true);
    try {
      const { url } = await walletService.createStripeSession(amount);
      window.location.href = url;
      return true;
    } catch (error) {
      console.error('Top up error:', error);
      toast.error(error.response?.data?.message || 'Gabim gjatë procesimit të pagesës');
      return false;
    } finally {
      setTopUpLoading(false);
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([loadBalance(), loadTransactions(), loadStats()]);
      setLoading(false);
    };
    loadAll();
  }, [loadBalance, loadTransactions, loadStats]);

  return {
    balance,
    transactions,
    stats,
    loading,
    topUpLoading,
    topUpWithStripe,
    loadBalance,
    loadTransactions,
    loadStats
  };
};