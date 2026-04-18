const express = require("express");
const router = express.Router();
const inspectorController = require("../controllers/inspectorController");
const { authMiddleware, inspectorMiddleware } = require("../middleware/auth");

router.use(authMiddleware, inspectorMiddleware);

router.post("/verify-ticket", inspectorController.verifyTicket);

router.get("/active-rides", inspectorController.getActiveRides);

router.get("/stats", inspectorController.getInspectorStats);

router.get("/history", inspectorController.getVerificationHistory);

module.exports = router;