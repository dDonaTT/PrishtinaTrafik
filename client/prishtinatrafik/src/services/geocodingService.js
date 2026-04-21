import axios from 'axios';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const geocodingService = {
  searchAddress: async (query, proximity = null) => {
    if (!query || query.length < 3) return [];
    
    try {
      let url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&limit=5&language=sq`;
      
      if (proximity) {
        url += `&proximity=${proximity.lng},${proximity.lat}`;
      }
      
      const response = await axios.get(url);
      
      return response.data.features.map(feature => ({
        id: feature.id,
        place_name: feature.place_name,
        address: feature.place_name,
        lat: feature.center[1],
        lng: feature.center[0],
        text: feature.text,
        context: feature.context
      }));
    } catch (error) {
      console.error('Geocoding error:', error);
      return [];
    }
  },

  reverseGeocode: async (lat, lng) => {
    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&language=sq`;
      const response = await axios.get(url);
      
      if (response.data.features && response.data.features.length > 0) {
        return response.data.features[0].place_name;
      }
      return `${lat}, ${lng}`;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return `${lat}, ${lng}`;
    }
  }
};

export default geocodingService;