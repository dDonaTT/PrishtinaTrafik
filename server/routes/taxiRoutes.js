const express = require("express");
const router = express.Router();
const taxiController = require("../controllers/taxiController");
const { authMiddleware } = require("../middleware/auth");

router.post("/order", authMiddleware, taxiController.orderTaxi);
router.get("/order/:order_id", authMiddleware, taxiController.getOrderStatus);

module.exports = router;