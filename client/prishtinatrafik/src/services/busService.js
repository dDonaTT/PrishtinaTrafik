import API from './api';

const busService = {
    getAllRoutes: async () => {
        const response = await API.get('/bus/routes');
        return response.data;
    },

    getAllStops: async () => {
        const response = await API.get('/bus/stops');
        return response.data;
    },

    getNearbyStops: async (latitude, longitude, radius = 1) => {
        const response = await API.get(`/bus/stops/nearby?lat=${latitude}&lng=${longitude}&radius=${radius}`);
        return response.data;
    }
};

export default busService;