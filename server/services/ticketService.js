const Ticket = require("../models/Ticket");
const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");
const { v4: uuidv4 } = require("uuid");

const TICKET_PRICES = {
  single: 0.4,
  daily: 2.0,
  weekly: 8.0,
  monthly: 15.0,
};
const TICKET_DURATIONS = {
  single: 0,
  daily: 24,
  weekly: 168,
  monthly: 720,
};
const TICKET_MAX_USES = {
  single: 1,
  daily: 999,
  weekly: 999,
  monthly: 999,
};

const getUserTickets = async (user_id, vehicle_type = null) => {
  return await Ticket.findByUserId(user_id, vehicle_type);
};

const createTicket = async (user, data) => {
  try {
    const { id: user_id } = user;
    const {
      vehicle_id,
      vehicle_type,
      route_name,
      ticket_type = "single",
    } = data;

    if (!vehicle_id) {
      throw { status: 400, message: "Vehicle ID is required" };
    }

    if (!vehicle_type || vehicle_type !== "bus") {
      throw {
        status: 400,
        message: "Valid vehicle type is required (bus)",
      };
    }

    if (!TICKET_PRICES[ticket_type]) {
      throw { status: 400, message: "Invalid ticket type" };
    }

    const wallet = await Wallet.findByUserId(user_id);
    const cost = TICKET_PRICES[ticket_type];

    if (!wallet || wallet.balance < cost) {
      throw { status: 400, message: "Insufficient balance" };
    }

    await Wallet.deduct(user_id, cost);

    const expiresAt = new Date();
    const durationHours = TICKET_DURATIONS[ticket_type];
    if (durationHours > 0) {
      expiresAt.setHours(expiresAt.getHours() + durationHours);
    } else {
      expiresAt.setHours(expiresAt.getHours() + 1); 
    }

    const ticket = await Ticket.create({
      ticket_id: uuidv4(),
      user_id,
      vehicle_id: String(vehicle_id),
      vehicle_type,
      route_name,
      cost,
      ticket_type,
      expires_at: durationHours > 0 ? expiresAt : null,
      max_uses: TICKET_MAX_USES[ticket_type],
      used_count: 0,
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

const validateTicket = async (ticket_id, inspector_id) => {
  const ticket = await Ticket.findByTicketId(ticket_id);
  
  if (!ticket) {
    throw { status: 404, message: "Bileta nuk u gjet" };
  }
  
  if (!ticket.is_valid) {
    throw { status: 400, message: "Bileta është e pavlefshme" };
  }
  
  if (ticket.expires_at && new Date(ticket.expires_at) < new Date()) {
    await Ticket.markAsExpired(ticket_id);
    throw { status: 400, message: "Bileta ka skaduar" };
  }
  
  if (ticket.ticket_type === 'single' && ticket.used_at) {
    throw { status: 400, message: "Bileta tashmë është përdorur" };
  }
  
  if (ticket.used_count >= ticket.max_uses) {
    throw { status: 400, message: "Bileta ka arritur numrin maksimal të përdorimeve" };
  }
  
  const newUsedCount = ticket.used_count + 1;
  const isCompleted = newUsedCount >= ticket.max_uses;
  
  const shouldSetUsedAt = ticket.ticket_type === 'single';
  
  await Ticket.updateUsage(ticket_id, newUsedCount, isCompleted, inspector_id, shouldSetUsedAt);
  
  let message = "Bileta u verifikua me sukses";
  let remainingUses = null;
  
  if (ticket.ticket_type !== 'single') {
    remainingUses = ticket.max_uses - newUsedCount;
    const expiresDate = new Date(ticket.expires_at).toLocaleString('sq-AL');
    message = `Bileta u verifikua. ${remainingUses} përdorime të mbetura deri më ${expiresDate}`;
  } else {
    message = "Bileta u verifikua me sukses";
  }
  
  return {
    ...ticket,
    validated: true,
    remaining_uses: remainingUses,
    expires_at: ticket.expires_at,
    message
  };
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
  cancelTicket,
  TICKET_PRICES,
  TICKET_DURATIONS,
  TICKET_MAX_USES,
};
