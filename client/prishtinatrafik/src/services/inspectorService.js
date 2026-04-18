import API from "./api";

const inspectorService = {
  verifyTicket: async (ticketId) => {
    const response = await API.post("/inspector/verify-ticket", {
      ticket_id: ticketId,
    });
    return response.data;
  },

  getActiveRides: async () => {
    const response = await API.get("/inspector/active-rides");
    return response.data;
  },

  getStats: async () => {
    const response = await API.get("/inspector/stats");
    return response.data;
  },

  getHistory: async () => {
    const response = await API.get("/inspector/history");
    return response.data;
  },
};

export default inspectorService;
