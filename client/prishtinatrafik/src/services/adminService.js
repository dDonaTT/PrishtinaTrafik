import API from './api';

const adminService = {
  getDashboardStats: async () => {
    const response = await API.get('/admin/stats');
    return response.data;
  },

  getAllUsers: async () => {
    const response = await API.get('/admin/users');
    return response.data;
  },

  getUserById: async (userId) => {
    const response = await API.get(`/admin/users/${userId}`);
    return response.data;
  },

  updateUserRole: async (userId, role) => {
    const response = await API.put(`/admin/users/${userId}/role`, { role });
    return response.data;
  },

  toggleUserStatus: async (userId, isActive) => {
    const response = await API.put(`/admin/users/${userId}/status`, { isActive });
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await API.delete(`/admin/users/${userId}`);
    return response.data;
  },

  getAllVehicles: async () => {
    const response = await API.get('/admin/vehicles');
    return response.data;
  },

  createVehicle: async (vehicleData) => {
    const response = await API.post('/admin/vehicles', vehicleData);
    return response.data;
  },

  updateVehicle: async (vehicleId, vehicleData) => {
    const response = await API.put(`/admin/vehicles/${vehicleId}`, vehicleData);
    return response.data;
  },

  deleteVehicle: async (vehicleId) => {
    const response = await API.delete(`/admin/vehicles/${vehicleId}`);
    return response.data;
  },

  updateVehicleAvailability: async (vehicleId, isAvailable) => {
    const response = await API.put(`/admin/vehicles/${vehicleId}/availability`, { isAvailable });
    return response.data;
  },

  getAllTransactions: async (limit = 100) => {
    const response = await API.get(`/admin/transactions?limit=${limit}`);
    return response.data;
  },

  getTransactionById: async (transactionId) => {
    const response = await API.get(`/admin/transactions/${transactionId}`);
    return response.data;
  },

  getAllTickets: async () => {
    const response = await API.get('/admin/tickets');
    return response.data;
  },

  getAllRides: async () => {
    const response = await API.get('/admin/rides');
    return response.data;
  },

  getRevenueReport: async (period = 'month') => {
    const response = await API.get(`/admin/reports/revenue?period=${period}`);
    return response.data;
  },

  getUsageReport: async (period = 'month') => {
    const response = await API.get(`/admin/reports/usage?period=${period}`);
    return response.data;
  },

  exportData: async (type, format = 'csv') => {
    const response = await API.get(`/admin/export/${type}?format=${format}`);
    return response.data;
  }
};

export default adminService;