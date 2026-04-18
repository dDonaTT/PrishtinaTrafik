const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");

router.use(authMiddleware, adminMiddleware);

router.get("/stats", adminController.getDashboardStats);

router.get("/users", adminController.getAllUsers);
router.get("/users/:id", adminController.getUserById);
router.put("/users/:id/role", adminController.updateUserRole);
router.put("/users/:id/status", adminController.toggleUserStatus);
router.delete("/users/:id", adminController.deleteUser);

router.get("/vehicles", adminController.getAllVehicles);
router.post("/vehicles", adminController.createVehicle);
router.put("/vehicles/:id", adminController.updateVehicle);
router.put("/vehicles/:id/availability", adminController.updateVehicleAvailability);
router.delete("/vehicles/:id", adminController.deleteVehicle);

router.get("/transactions", adminController.getAllTransactions);
router.get("/transactions/:id", adminController.getTransactionById);

router.get("/tickets", adminController.getAllTickets);
router.get("/rides", adminController.getAllRides);

module.exports = router;