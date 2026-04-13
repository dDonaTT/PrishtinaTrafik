const Ticket = require("../models/Ticket");
const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");
const { v4: uuidv4 } = require("uuid");

const TICKET_PRICE = {
  bus: 0.4,    
  taxi: 2.5    
};

const getUserTickets = async (user_id, vehicle_type = null) => {
  return await Ticket.findByUserId(user_id, vehicle_type);
};

const createTicket = async (user, data) => {
  try {
    const { id: user_id } = user;
    const { vehicle_id, vehicle_type, route_name } = data;

    console.log("CREATE TICKET START", { user_id, vehicle_id, vehicle_type, route_name });

    if (!vehicle_id) {
      throw { status: 400, message: "Vehicle ID is required" };
    }

    if (!vehicle_type || !TICKET_PRICE[vehicle_type]) {
      throw { status: 400, message: "Valid vehicle type is required (bus or taxi)" };
    }

    const wallet = await Wallet.findByUserId(user_id);

    const ticketPrice = TICKET_PRICE[vehicle_type];
    const cost = Number(ticketPrice);

    if (!wallet || wallet.balance < cost) {
      throw { status: 400, message: "Insufficient balance" };
    }

    await Wallet.deduct(user_id, cost);

    const ticket = await Ticket.create({
      ticket_id: uuidv4(),
      user_id,
      vehicle_id: String(vehicle_id),
      vehicle_type,
      route_name,
      cost,
    });

    await Transaction.create({
      user_id,
      type: vehicle_type,
      amount: -cost,
      vehicle_id,
    });

    return ticket;
  } catch (error) {
    console.error("SERVICE ERROR:", error);
    throw error;
  }
};

const validateTicket = async (ticket_id) => {
  return await Ticket.validateTicket(ticket_id);
};

const getTicketStats = async (user_id) => {
  return await Ticket.getTicketStats(user_id);
};

const cancelTicket = async (ticket_id, user_id) => {
  return await Ticket.cancelTicket(ticket_id, user_id);
};

module.exports = { 
  getUserTickets, 
  createTicket, 
  validateTicket, 
  getTicketStats,
  cancelTicket
};