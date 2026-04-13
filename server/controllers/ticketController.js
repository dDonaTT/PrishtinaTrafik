const ticketService = require("../services/ticketService");

const getUserTickets = async (req, res) => {
  try {
    const { type } = req.query;
    const tickets = await ticketService.getUserTickets(req.user.id, type);
    
    res.status(200).json({
      success: true,
      count: tickets.length,
      data: tickets
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

const createTicket = async (req, res) => {
  try {
    const ticket = await ticketService.createTicket(req.user, req.body);

    return res.status(201).json({
      success: true,
      message: "Ticket purchased successfully",
      data: ticket,
    });
  } catch (err) {
    console.error("TICKET ERROR:", err);

    return res.status(err.status || 500).json({
      success: false,
      message: err.message,
    });
  }
};

const validateTicket = async (req, res) => {
  try {
    const { ticket_id } = req.body;
    
    const result = await ticketService.validateTicket(ticket_id);
    
    res.status(200).json({
      success: true,
      message: "Ticket validated successfully",
      data: {
        ticket_id: result.ticket_id,
        user_id: result.user_id,
        vehicle_type: result.vehicle_type,
        route_name: result.route_name,
        validated_at: new Date()
      }
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message
    });
  }
};

const getTicketStats = async (req, res) => {
  try {
    const stats = await ticketService.getTicketStats(req.user.id);
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const cancelTicket = async (req, res) => {
  try {
    const { ticket_id } = req.params;
    const result = await ticketService.cancelTicket(ticket_id, req.user.id);
    
    if (!result) {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel ticket. Either already used or invalid."
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Ticket cancelled successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = { 
  getUserTickets, 
  createTicket, 
  validateTicket, 
  getTicketStats,
  cancelTicket
};