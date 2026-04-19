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
router.get("/all", authMiddleware, rideController.getAllVehicles);
router.post("/taxi/start", authMiddleware, rideController.startTaxiRide);
router.post("/taxi/end", authMiddleware, rideController.endTaxiRide);
router.get("/taxi/fare/:ride_id", authMiddleware, rideController.getCurrentTaxiFare);
router.put("/taxi/location/:ride_id", authMiddleware, rideController.updateTaxiLocation);

module.exports = router;