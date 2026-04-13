const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");

const getWallet = async (user_id) => {
  let wallet = await Wallet.findByUserId(user_id);

  if (!wallet) {
    wallet = await Wallet.create(user_id);
  }

  return wallet;
};

const topUp = async (user_id, amount) => {
  if (!amount || amount <= 0) {
    throw { status: 400, message: "Invalid amount" };
  }

  let wallet = await Wallet.findByUserId(user_id);
  if (!wallet) await Wallet.create(user_id);

  await Wallet.topUp(user_id, amount);

  await Transaction.create({
    user_id,
    type: "top_up",
    amount,
    vehicle_id: null,
  });

  return Wallet.findByUserId(user_id);
};

const deduct = async (user_id, { amount, type, vehicle_id }) => {
  const wallet = await Wallet.findByUserId(user_id);

  if (!wallet || wallet.balance < amount) {
    throw { status: 400, message: "Insufficient balance" };
  }

  await Wallet.deduct(user_id, amount);

  await Transaction.create({
    user_id,
    type,
    amount: -amount,
    vehicle_id,
  });

  return Wallet.findByUserId(user_id);
};

module.exports = { getWallet, topUp, deduct };