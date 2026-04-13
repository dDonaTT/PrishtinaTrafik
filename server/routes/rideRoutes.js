const express = require("express");
const router = express.Router();
const rideController = require("../controllers/rideController");
const { authMiddleware } = require("../middleware/auth");

router.post("/start", authMiddleware, rideController.startRide);
router.post("/end", authMiddleware, rideController.endRide);
router.get("/active", authMiddleware, rideController.getActiveRide);
router.get("/history", authMiddleware, rideController.getUserRides);
router.get("/stats", authMiddleware, rideController.getRideStats);
router.put("/cancel", authMiddleware, rideController.cancelRide);
router.get("/nearby", authMiddleware, rideController.findNearbyVehicles);

module.exports = router;