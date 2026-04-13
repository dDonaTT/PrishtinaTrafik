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
    const wallet = await walletService.topUp(
      req.user.id,
      req.body.amount
    );
    res.json(wallet);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

const deduct = async (req, res) => {
  try {
    const wallet = await walletService.deduct(
      req.user.id,
      req.body
    );
    res.json(wallet);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

module.exports = { getWallet, topUp, deduct };