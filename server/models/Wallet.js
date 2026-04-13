const db = require("../config/db");

const Wallet = {
  findByUserId: async (user_id) => {
    const [rows] = await db.query(
      "SELECT * FROM wallets WHERE user_id = ?",
      [user_id]
    );
    return rows[0];
  },

  create: async (user_id) => {
    const [result] = await db.query(
      "INSERT INTO wallets (user_id, balance) VALUES (?, 0)",
      [user_id]
    );
    return { id: result.insertId, user_id, balance: 0 };
  },

  topUp: async (user_id, amount) => {
    await db.query(
      "UPDATE wallets SET balance = balance + ? WHERE user_id = ?",
      [amount, user_id]
    );
  },

  deduct: async (user_id, amount) => {
  const safeAmount = Number(amount);

  if (isNaN(safeAmount) || safeAmount <= 0) {
    throw new Error("Invalid amount");
  }

  const [wallet] = await db.query(
    "SELECT balance FROM wallets WHERE user_id = ?",
    [user_id]
  );

  if (!wallet[0]) {
    throw new Error("Wallet not found");
  }

  if (wallet[0].balance < safeAmount) {
    throw new Error("Insufficient balance");
  }

  await db.query(
    "UPDATE wallets SET balance = balance - ? WHERE user_id = ?",
    [safeAmount, user_id]
  );
},
};

module.exports = Wallet;