import API from "./api";

const userService = {
  getProfile: async () => {
    const response = await API.get("/auth/profile");
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await API.put("/auth/profile", data);
    return response.data;
  },

  changePassword: async (data) => {
    const response = await API.post("/auth/change-password", data);
    return response.data;
  },

  getUserStats: async () => {
    const response = await API.get("/auth/stats");
    return response.data;
  },

  getActivityHistory: async () => {
    const response = await API.get("/auth/activities");
    return response.data;
  },
};

export default userService;
