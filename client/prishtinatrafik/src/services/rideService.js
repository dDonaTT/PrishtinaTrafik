import API from "./api";

const rideService = {
  startRide: async (data) => {
    const response = await API.post("/rides/start", data);
    return response.data;
  },

  endRide: async (data) => {
    const response = await API.post("/rides/end", data);
    return response.data;
  },

  getActiveRide: async () => {
    const response = await API.get("/rides/active");
    return response.data;
  },

  getRideHistory: async (limit = 20) => {
    const response = await API.get(`/rides/history?limit=${limit}`);
    return response.data;
  },

  getRideStats: async () => {
    const response = await API.get("/rides/stats");
    return response.data;
  },

  cancelRide: async () => {
    const response = await API.put("/rides/cancel");
    return response.data;
  },
};

export default rideService;
