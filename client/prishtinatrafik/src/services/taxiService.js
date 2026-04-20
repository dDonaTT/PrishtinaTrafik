import API from "./api";

const taxiService = {
  startTaxiRide: async (data) => {
    const response = await API.post("/rides/taxi/start", data);
    return response.data;
  },

  endTaxiRide: async (ride_id, data) => {
    const response = await API.post(`/rides/taxi/end`, { ride_id, ...data });
    return response.data;
  },

  getCurrentFare: async (ride_id, current_lat, current_lng) => {
    const response = await API.get(
      `/rides/taxi/fare/${ride_id}?current_lat=${current_lat}&current_lng=${current_lng}`,
    );
    return response.data;
  },

  updateLocation: async (ride_id, current_lat, current_lng) => {
    const response = await API.put(`/rides/taxi/location/${ride_id}`, {
      current_lat,
      current_lng,
    });
    return response.data;
  },
  getETA: async (startLat, startLng, endLat, endLng) => {
    const response = await API.get(
      `/rides/eta?start_lat=${startLat}&start_lng=${startLng}&end_lat=${endLat}&end_lng=${endLng}`,
    );
    return response.data;
  },
};

export default taxiService;
