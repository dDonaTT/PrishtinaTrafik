const express = require("express");
const router = express.Router();
const walletController = require("../controllers/walletController");
const { authMiddleware } = require("../middleware/auth");

router.get("/", authMiddleware, walletController.getWallet);
router.post("/top-up", authMiddleware, walletController.topUp);
router.post("/deduct", authMiddleware, walletController.deduct);
router.get("/transactions", authMiddleware, walletController.getTransactions);
router.get("/stats", authMiddleware, walletController.getStats);
module.exports = router;
