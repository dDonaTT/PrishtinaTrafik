const db = require("../config/db");

const Transaction = {
  findByUser: async (user_id, limit = 50) => {
    const [rows] = await db.query(
      "SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT ?",
      [user_id, limit]
    );
    return rows;
  },

  findAll: async (limit = 200) => {
    const [rows] = await db.query(
      "SELECT * FROM transactions ORDER BY created_at DESC LIMIT ?",
      [limit]
    );
    return rows;
  },

  create: async ({ user_id, type, amount, vehicle_id }) => {
    const [result] = await db.query(
      "INSERT INTO transactions (user_id, type, amount, vehicle_id) VALUES (?,?,?,?)",
      [user_id, type, amount, vehicle_id]
    );

    return { id: result.insertId, user_id, type, amount, vehicle_id };
  },
};

module.exports = Transaction;