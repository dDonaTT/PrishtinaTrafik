const db = require("../config/db");

const Vehicle = {
  findAll: async () => {
    const [rows] = await db.query("SELECT * FROM vehicles");
    return rows;
  },

  findById: async (id) => {
    const [rows] = await db.query(
      "SELECT * FROM vehicles WHERE id = ?",
      [id]
    );
    return rows[0];
  },

  create: async ({ type, lat, lng, status, route_name, station_name, battery_level }) => {
    const [result] = await db.query(
      `INSERT INTO vehicles 
      (type, lat, lng, status, route_name, station_name, battery_level) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        type,
        lat,
        lng,
        status || "available",
        route_name || null,
        station_name || null,
        battery_level || null,
      ]
    );

    return { id: result.insertId, type, lat, lng };
  },

  update: async (id, fields) => {
    const keys = Object.keys(fields)
      .map((k) => `${k} = ?`)
      .join(", ");

    const values = Object.values(fields);

    await db.query(
      `UPDATE vehicles SET ${keys} WHERE id = ?`,
      [...values, id]
    );
  },

  delete: async (id) => {
    await db.query("DELETE FROM vehicles WHERE id = ?", [id]);
  },
};

module.exports = Vehicle;