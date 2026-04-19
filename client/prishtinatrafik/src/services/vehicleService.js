import API from "./api";

const vehicleService = {
   getAllVehicles: async (vehicleType = null) => {
        let url = `/rides/all`;
        if (vehicleType && vehicleType !== 'all') {
            url += `?vehicle_type=${vehicleType}`;
        }
        const response = await API.get(url);
        return response.data;
    },
    getVehicleById: async (id, type) => {
    const response = await API.get(`/vehicles/${type}/${id}`);
    return response.data;
  }
};

export default vehicleService