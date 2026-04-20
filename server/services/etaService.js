const axios = require("axios");

const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN;

const calculateETA = async (originLat, originLng, destLat, destLng) => {
  try {
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${originLng},${originLat};${destLng},${destLat}`;

    const response = await axios.get(url, {
      params: {
        access_token: MAPBOX_TOKEN,
        alternatives: false,
        geometries: "geojson",
        overview: "simplified",
        steps: false,
        annotations: "duration,distance",
      },
    });

    if (response.data.routes && response.data.routes.length > 0) {
      const route = response.data.routes[0];
      const duration = route.duration; // sekonda
      const distance = route.distance; // metra

      return {
        eta_seconds: duration,
        eta_minutes: Math.ceil(duration / 60),
        eta_text: formatDuration(duration),
        distance_km: (distance / 1000).toFixed(2),
        distance_meters: distance,
      };
    }

    return null;
  } catch (error) {
    console.error(
      "ETA Calculation Error:",
      error.response?.data || error.message,
    );
    return calculateManualETA(originLat, originLng, destLat, destLng);
  }
};

const calculateManualETA = (originLat, originLng, destLat, destLng) => {
  const distance = calculateDistance(originLat, originLng, destLat, destLng);
  const avgSpeed = 40; // km/h në qytet
  const durationHours = distance / avgSpeed;
  const durationSeconds = durationHours * 3600;

  return {
    eta_seconds: durationSeconds,
    eta_minutes: Math.ceil(durationSeconds / 60),
    eta_text: formatDuration(durationSeconds),
    distance_km: distance.toFixed(2),
    is_estimate: true,
  };
};

const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours} orë ${minutes} minuta`;
  }
  return `${minutes} minuta`;
};

module.exports = { calculateETA, calculateManualETA };
