const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");


router.get("/", authMiddleware, bookingController.getUserBookings);
router.get("/:id", authMiddleware, bookingController.getBookingById);
router.post("/", authMiddleware, bookingController.createBooking);
router.put("/:id/status", authMiddleware, bookingController.updateBookingStatus);
router.put("/:id/cancel", authMiddleware, bookingController.cancelBooking);

router.get(
  "/admin/all",
  authMiddleware,
  adminMiddleware,
  bookingController.getAllBookings
);

module.exports = router;