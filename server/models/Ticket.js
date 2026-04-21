const db = require("../config/db");
const QRCode = require("qrcode");
const speakeasy = require("speakeasy");
const { v4: uuidv4 } = require("uuid");

const Ticket = {
  findByUserId: async (user_id, vehicle_type = null) => {
    let query = "SELECT * FROM tickets WHERE user_id = ?";
    const params = [user_id];

    if (vehicle_type) {
      query += " AND vehicle_type = ?";
      params.push(vehicle_type);
    }

    query += " ORDER BY created_at DESC";

    const [rows] = await db.query(query, params);
    return rows;
  },

  findByTicketId: async (ticket_id) => {
    const [rows] = await db.query("SELECT * FROM tickets WHERE ticket_id = ?", [
      ticket_id,
    ]);
    return rows[0];
  },

  create: async ({
    ticket_id,
    user_id,
    vehicle_id,
    vehicle_type,
    route_name,
    cost,
    ticket_type,
    expires_at,
    max_uses,
    used_count,
  }) => {
    const qr_secret = speakeasy.generateSecret({ length: 20 }).base32;

    const qr_payload = JSON.stringify({
      ticket_id,
      user_id,
      vehicle_type,
      ticket_type,
      created_at: new Date().toISOString(),
      secret: qr_secret,
    });

    const qr_code = await QRCode.toDataURL(qr_payload);

    const [result] = await db.query(
      `INSERT INTO tickets 
      (ticket_id, user_id, vehicle_id, vehicle_type, route_name, cost, 
       ticket_type, expires_at, max_uses, used_count, qr_code, qr_secret, created_at) 
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?, NOW())`,
      [
        ticket_id,
        user_id,
        vehicle_id,
        vehicle_type,
        route_name,
        cost,
        ticket_type,
        expires_at,
        max_uses,
        used_count,
        qr_code,
        qr_secret,
      ],
    );

    return {
      id: result.insertId,
      ticket_id,
      user_id,
      vehicle_id,
      vehicle_type,
      route_name,
      cost,
      ticket_type,
      expires_at,
      max_uses,
      used_count,
      qr_code,
      created_at: new Date(),
    };
  },

  validateTicket: async (ticket_id) => {
    const ticket = await Ticket.findByTicketId(ticket_id);

    if (!ticket) {
      throw { status: 404, message: "Ticket not found" };
    }

    if (!ticket.is_valid) {
      throw { status: 400, message: "Ticket is already invalid" };
    }

    if (ticket.used_at) {
      throw { status: 400, message: "Ticket has already been used" };
    }

    const created_at = new Date(ticket.created_at);
    const now = new Date();
    const hoursDiff = (now - created_at) / (1000 * 60 * 60);

    if (hoursDiff > 24) {
      throw { status: 400, message: "Ticket has expired (24h limit)" };
    }

    await db.query(
      `UPDATE tickets 
       SET used_at = NOW(),
           is_valid = FALSE
       WHERE ticket_id = ?`,
      [ticket_id],
    );

    return { ...ticket, validated: true };
  },
  updateUsage: async (ticket_id, used_count, isCompleted, inspector_id, shouldSetUsedAt = false) => {
  await db.query(
    `UPDATE tickets 
     SET used_count = ?, 
         is_valid = ?,
         used_at = CASE WHEN ? THEN NOW() ELSE used_at END,
         verified_by = ?
     WHERE ticket_id = ?`,
    [used_count, !isCompleted, shouldSetUsedAt, inspector_id, ticket_id]
  );
},

  markAsExpired: async (ticket_id) => {
    await db.query(`UPDATE tickets SET is_valid = FALSE WHERE ticket_id = ?`, [
      ticket_id,
    ]);
  },
  verifyQRCode: async (qr_data) => {
    try {
      const payload = JSON.parse(qr_data);
      const { ticket_id, secret } = payload;

      const ticket = await Ticket.findByTicketId(ticket_id);

      if (!ticket) {
        throw { status: 404, message: "Ticket not found" };
      }

      if (ticket.qr_secret !== secret) {
        throw { status: 401, message: "Invalid QR code" };
      }

      return ticket;
    } catch (error) {
      throw { status: 400, message: "Invalid QR code format" };
    }
  },

  getTicketStats: async (user_id) => {
    const [rows] = await db.query(
      `SELECT 
        COUNT(*) as total_tickets,
        SUM(CASE WHEN vehicle_type = 'bus' THEN 1 ELSE 0 END) as bus_tickets,
        SUM(CASE WHEN vehicle_type = 'taxi' THEN 1 ELSE 0 END) as taxi_tickets,
        SUM(CASE WHEN used_at IS NOT NULL THEN 1 ELSE 0 END) as used_tickets,
        SUM(CASE WHEN used_at IS NULL AND is_valid = TRUE THEN 1 ELSE 0 END) as valid_tickets,
        SUM(cost) as total_spent
       FROM tickets 
       WHERE user_id = ?`,
      [user_id],
    );
    return rows[0];
  },

  cancelTicket: async (ticket_id, user_id) => {
    const [result] = await db.query(
      `UPDATE tickets 
       SET is_valid = FALSE 
       WHERE ticket_id = ? AND user_id = ? AND used_at IS NULL`,
      [ticket_id, user_id],
    );

    return result.affectedRows > 0;
  },
};

module.exports = Ticket;
