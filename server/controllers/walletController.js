const walletService = require("../services/walletService");

const getWallet = async (req, res) => {
  try {
    const wallet = await walletService.getWallet(req.user.id);
    res.json(wallet);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const topUp = async (req, res) => {
  try {
    const wallet = await walletService.topUp(req.user.id, req.body.amount);
    res.json(wallet);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

const deduct = async (req, res) => {
  try {
    const wallet = await walletService.deduct(req.user.id, req.body);
    res.json(wallet);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

const getTransactions = async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const Transaction = require("../models/Transaction");
    const transactions = await Transaction.findByUser(
      req.user.id,
      parseInt(limit),
    );
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getStats = async (req, res) => {
  try {
    const Transaction = require("../models/Transaction");
    const transactions = await Transaction.findByUser(req.user.id, 1000);

    const stats = {
      total_spent: 0,
      total_deposited: 0,
      total_transactions: transactions.length,
      tickets_count: transactions.filter(
        (t) => t.type === "bus" || t.type === "taxi",
      ).length,
      rides_count: transactions.filter(
        (t) => t.type === "bike" || t.type === "scooter",
      ).length,
    };

    transactions.forEach((t) => {
      if (t.amount > 0) {
        stats.total_deposited += parseFloat(t.amount);
      } else {
        stats.total_spent += Math.abs(parseFloat(t.amount));
      }
    });

    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getWallet, topUp, deduct, getTransactions, getStats };
