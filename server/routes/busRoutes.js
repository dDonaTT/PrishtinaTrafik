const express = require("express");
const router = express.Router();
const busController = require("../controllers/busController");
const { authMiddleware } = require("../middleware/auth");

router.get("/routes", authMiddleware, busController.getRoutes);
router.get("/stops", authMiddleware, busController.getStops);
router.get("/stops/nearby", authMiddleware, busController.getNearbyStops);
module.exports = router;