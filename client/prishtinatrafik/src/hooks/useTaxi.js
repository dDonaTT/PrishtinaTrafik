import { useState, useCallback } from 'react';
import taxiService from '../services/taxiService';
import toast from 'react-hot-toast';

export const useTaxi = () => {
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [eta, setEta] = useState(null);
  const [orderStatus, setOrderStatus] = useState(null);

  const orderTaxi = useCallback(async (orderData) => {
    setLoading(true);
    try {
      const response = await taxiService.orderTaxi(orderData);
      if (response.success) {
        setOrder(response);
        toast.success(response.message);
        return response;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gabim gjatë porositjes');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getOrderStatus = useCallback(async (orderId) => {
    try {
      const response = await taxiService.getOrderStatus(orderId);
      setOrderStatus(response);
      return response;
    } catch (error) {
      console.error('Get order status error:', error);
      return null;
    }
  }, []);

  const calculateETA = useCallback(async (startLat, startLng, endLat, endLng) => {
    try {
      const response = await taxiService.getETA(startLat, startLng, endLat, endLng);
      if (response.success) {
        setEta(response.data);
        return response.data;
      }
    } catch (error) {
      console.error('ETA calculation error:', error);
      return null;
    }
  }, []);

  const clearOrder = useCallback(() => {
    setOrder(null);
    setOrderStatus(null);
    setEta(null);
  }, []);

  return {
    loading,
    order,
    eta,
    orderStatus,
    orderTaxi,
    getOrderStatus,
    calculateETA,
    clearOrder
  };
};