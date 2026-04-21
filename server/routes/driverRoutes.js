const express = require("express");
const router = express.Router();
const driverController = require("../controllers/driverController");
const { authMiddleware, driverMiddleware } = require("../middleware/auth");

router.post("/login", driverController.driverLogin);

router.use(authMiddleware);

router.use(driverMiddleware);

router.post("/toggle-online", driverController.toggleOnline);
router.get("/nearby-orders", driverController.getNearbyOrders);
router.post("/accept-order", driverController.acceptOrder);
router.post("/reject-order", driverController.rejectOrder);
router.post("/arrived", driverController.arrivedAtPickup);
router.post("/start-trip", driverController.startTrip);
router.post("/complete-trip", driverController.completeTrip);
router.get("/trip-history", driverController.getTripHistory);
router.get("/stats", driverController.getDriverStats);
router.post("/update-location", driverController.updateLocation);

module.exports = router;
