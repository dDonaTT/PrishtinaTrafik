const transactionService = require("../services/transactionService");

const getAllTransactions = async (req, res) => {
  try {
    const transactions = await transactionService.getAllTransactions();
    res.status(200).json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getUserTransactions = async (req, res) => {
  try {
    const { id } = req.user; 

    const transactions = await transactionService.getUserTransactions(id);

    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAllTransactions, getUserTransactions };