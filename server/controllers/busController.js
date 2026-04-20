const Bus = require("../models/Bus");

const getRoutes = async (req, res) => {
  try {
    const routes = await Bus.getAllRoutes();
    res.json({ success: true, data: routes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const getStops = async (req, res) => {
  try {
    const stops = await Bus.getAllStops();
    res.json({ success: true, data: stops });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const getNearbyStops = async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;
    if (!lat || !lng) return res.status(400).json({ message: "Coordinates required" });
    const stops = await Bus.getNearbyStops(lat, lng, radius || 1);
    res.json({ success: true, data: stops });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
module.exports = { getRoutes, getStops, getNearbyStops };