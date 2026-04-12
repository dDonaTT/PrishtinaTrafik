const express = require("express");
const router = express.Router();
const vehicleController = require("../controllers/vehicleController");

const { authMiddleware, adminMiddleware } = require("../middleware/auth");

router.get("/", vehicleController.getAll); // publik për map
router.get("/:id", authMiddleware, vehicleController.getById);

router.post("/", authMiddleware, adminMiddleware, vehicleController.create);
router.put("/:id", authMiddleware, adminMiddleware, vehicleController.update);
router.delete("/:id", authMiddleware, adminMiddleware, vehicleController.remove);

module.exports = router;