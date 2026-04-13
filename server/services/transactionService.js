const Transaction = require("../models/Transaction");

const getUserTransactions = async (user_id) => {
  return await Transaction.findByUser(user_id, 50);
};

const getAllTransactions = async () => {
  return await Transaction.findAll(200);
};

module.exports = { getUserTransactions, getAllTransactions };