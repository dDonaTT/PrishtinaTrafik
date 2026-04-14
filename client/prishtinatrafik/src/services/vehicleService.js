import API from "./api";

const vehicleService = {
    getNearbyVehicles: async (latitude,longitude, vehicleType = null, radius = 2)=>{
        let url = `/rides/nearby?latitude=${latitude}&longitude=${longitude}&radius=${radius}`;
        if(vehicleType){
            url += `&vehicle_type=${vehicleType}`
        }
        const response = await API.get(url);
        return response.data;
    },
    getAllVehicles: async ()=>{
        const response = await API.get("/vehicles");
        return response.data;
    },
    getVehicleById: async (id, type) => {
    const response = await API.get(`/vehicles/${type}/${id}`);
    return response.data;
  }
};

export default vehicleService