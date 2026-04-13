const express = require("express");
const router = express.Router();

const transactionController = require("../controllers/transactionController");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");

router.get("/all", authMiddleware, adminMiddleware, transactionController.getAllTransactions);

router.get("/", authMiddleware, transactionController.getUserTransactions);

module.exports = router;