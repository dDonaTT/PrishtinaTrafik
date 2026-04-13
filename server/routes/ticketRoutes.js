const express = require("express");
const router = express.Router();
const ticketController = require("../controllers/ticketController");
const { authMiddleware } = require("../middleware/auth");

router.get("/", authMiddleware, ticketController.getUserTickets);
router.get("/stats", authMiddleware, ticketController.getTicketStats);
router.post("/", authMiddleware, ticketController.createTicket);
router.put("/:ticket_id/cancel", authMiddleware, ticketController.cancelTicket);

router.post("/validate", authMiddleware, ticketController.validateTicket);

module.exports = router;