const db = require("../config/db");

const Bus = {
  getAllRoutes: async () => {
    const [rows] = await db.query(
      "SELECT * FROM bus_routes WHERE is_active = 1 ORDER BY route_number",
    );
    return rows;
  },
  getAllStops: async () => {
    const [rows] = await db.query(
      "SELECT * FROM bus_stops WHERE is_active = 1 ORDER BY name",
    );
    return rows;
  },
  getNearbyStops: async (lat, lng, radius = 1) => {
    const query = `
      SELECT *, 
        (6371 * acos(
          cos(radians(?)) * cos(radians(latitude)) * 
          cos(radians(longitude) - radians(?)) + 
          sin(radians(?)) * sin(radians(latitude))
        )) AS distance
      FROM bus_stops
      WHERE is_active = 1
      HAVING distance < ?
      ORDER BY distance ASC
      LIMIT 20
    `;
    const [rows] = await db.query(query, [lat, lng, lat, radius]);
    return rows;
  },
};
module.exports = Bus;
