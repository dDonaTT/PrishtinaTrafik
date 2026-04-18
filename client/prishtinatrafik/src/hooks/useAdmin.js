import { useState, useEffect, useCallback } from 'react';
import adminService from '../services/adminService';
import toast from 'react-hot-toast';

export const useAdmin = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  const loadStats = useCallback(async () => {
    try {
      const data = await adminService.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Load stats error:', error);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      const data = await adminService.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Load users error:', error);
      toast.error('Gabim gjatë ngarkimit të përdoruesve');
    }
  }, []);

  const loadVehicles = useCallback(async () => {
    try {
      const data = await adminService.getAllVehicles();
      setVehicles(data);
    } catch (error) {
      console.error('Load vehicles error:', error);
      toast.error('Gabim gjatë ngarkimit të mjeteve');
    }
  }, []);

  const loadTransactions = useCallback(async () => {
    try {
      const data = await adminService.getAllTransactions();
      setTransactions(data);
    } catch (error) {
      console.error('Load transactions error:', error);
      toast.error('Gabim gjatë ngarkimit të transaksioneve');
    }
  }, []);

  const loadTickets = useCallback(async () => {
    try {
      const data = await adminService.getAllTickets();
      setTickets(data);
    } catch (error) {
      console.error('Load tickets error:', error);
    }
  }, []);

  const loadRides = useCallback(async () => {
    try {
      const data = await adminService.getAllRides();
      setRides(data);
    } catch (error) {
      console.error('Load rides error:', error);
    }
  }, []);

  const updateUserRole = async (userId, role) => {
    try {
      await adminService.updateUserRole(userId, role);
      toast.success('Roli u ndryshua me sukses');
      await loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gabim gjatë ndryshimit të rolit');
    }
  };

  const createVehicle = async (vehicleData) => {
    try {
      const newVehicle = await adminService.createVehicle(vehicleData);
      toast.success('Mjeti u krijua me sukses');
      await loadVehicles();
      return newVehicle;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gabim gjatë krijimit të mjetit');
      throw error;
    }
  };

  const updateVehicle = async (vehicleId, vehicleData) => {
    try {
      await adminService.updateVehicle(vehicleId, vehicleData);
      toast.success('Mjeti u përditësua me sukses');
      await loadVehicles();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gabim gjatë përditësimit të mjetit');
      throw error;
    }
  };

  const deleteVehicle = async (vehicleId) => {
    if (!confirm('A jeni i sigurt që dëshironi të fshini këtë mjet?')) return;
    
    try {
      await adminService.deleteVehicle(vehicleId);
      toast.success('Mjeti u fshi me sukses');
      await loadVehicles();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gabim gjatë fshirjes së mjetit');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      switch (activeTab) {
        case 'dashboard':
          await loadStats();
          break;
        case 'users':
          await loadUsers();
          break;
        case 'vehicles':
          await loadVehicles();
          break;
        case 'transactions':
          await loadTransactions();
          break;
        case 'tickets':
          await loadTickets();
          break;
        case 'rides':
          await loadRides();
          break;
      }
      
      setLoading(false);
    };
    
    loadData();
  }, [activeTab, loadStats, loadUsers, loadVehicles, loadTransactions, loadTickets, loadRides]);

  return {
    stats,
    users,
    vehicles,
    transactions,
    tickets,
    rides,
    loading,
    activeTab,
    setActiveTab,
    updateUserRole,
    createVehicle,
    updateVehicle,
    deleteVehicle
  };
};