import API from "./api";

const walletService = {
  getBalance: async () => {
    const response = await API.get("wallet");
    return response.data;
  },
  topUp: async (amount) => {
    const response = await API.post("wallet/top-up", { amount });
    return response.data;
  },
  createStripeSession: async (amount) => {
    const response = await API.post("/payments/create-session", { amount });
    return response.data;
  },
  getTransactions: async (limit = 50) => {
    const response = await API.get(`wallet/transactions?limit=${limit}`);
    return response.data;
  },
  getStats: async () => {
    const response = await API.get("wallet/stats");
    return response.data;
  },
};
export default walletService;
