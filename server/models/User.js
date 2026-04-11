const db = require("../config/db");

const User = {
  findByEmail: async (email) => {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    return rows[0];
  },
  findById: async (id) => {
    const [rows] = await db.query(
      "SELECT id , fullname, email,role,created_at FROM users WHERE id = ?",
      [id],
    );
    return rows[0];
  },
  create: async ({ fullname, email, password, role = "user" }) => {
    const [result] = await db.query(
      "INSERT INTO users (fullname,email,password,role) VALUES (?,?,?,?)",
      [fullname, email, password, role],
    );
    return {
      id: result.insertId,
      fullname,
      email,
      role,
    };
  },
};
module.exports = User;
