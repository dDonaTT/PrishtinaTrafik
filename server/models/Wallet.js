const db = require("../config/db");
const { findByEmail } = require("./User");

const Wallet = {
  findByEmail: async (email) => {
    const [rows] = await db.query("SELECT * FROM wallets WHERE email = ?", [
      email,
    ]);
    return rows[0];
  },
  create: async (email) => {
    const [result] = await db.query(
      "INSERT INTO wallets (user_email, balance) VALUES (?,0)",
      [email],
    );
    return { id: result.insertId, user_email: email, balance: 0 };
  },
  topUp: async (email, amount) => {
    await db.query(
      "UPDATE wallets SET balance = balance + ? WHERE user_email = ?",
      [amount, email],
    );
  },
  deduct: async (email, amount) => {
    await db.query(
      "UPDATE wallets SET balance = balance - ? WHERE user_email = ?",
      [amount, email],
    );
  },
};
module.exports = Wallet;
