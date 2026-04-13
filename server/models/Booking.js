const db = require('../config/db');

const Booking = {
  findByUserId: async (user_id) => {
    const [rows] = await db.query(
      `SELECT b.*, v.type as vehicle_type_name, v.id as vehicle_id
       FROM bookings b
       LEFT JOIN vehicles v ON b.vehicle_id = v.id
       WHERE b.user_id = ? 
       ORDER BY b.created_at DESC`,
      [user_id]
    );
    return rows;
  },

  findAll: async () => {
    const [rows] = await db.query(
      `SELECT b.*, u.name as user_name, u.email, v.type as vehicle_type_name
       FROM bookings b
       LEFT JOIN users u ON b.user_id = u.id
       LEFT JOIN vehicles v ON b.vehicle_id = v.id
       ORDER BY b.created_at DESC`
    );
    return rows;
  },

  findById: async (id, user_id = null) => {
    let query = `
      SELECT b.*, v.type as vehicle_type_name
      FROM bookings b
      LEFT JOIN vehicles v ON b.vehicle_id = v.id
      WHERE b.id = ?
    `;
    const params = [id];
    
    if (user_id) {
      query += ' AND b.user_id = ?';
      params.push(user_id);
    }
    
    const [rows] = await db.query(query, params);
    return rows[0];
  },

  create: async ({ user_id, vehicle_id, eta, cost, status = 'pending' }) => {
    // Validimi i statusit
    const validStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      status = 'pending';
    }

    const [result] = await db.query(
      `INSERT INTO bookings 
       (user_id, vehicle_id, eta, cost, status) 
       VALUES (?, ?, ?, ?, ?)`,
      [user_id, vehicle_id, eta || null, cost, status]
    );
    
    return await Booking.findById(result.insertId);
  },

  updateStatus: async (id, user_id, status) => {
    const validStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status value');
    }

    const [result] = await db.query(
      'UPDATE bookings SET status = ? WHERE id = ? AND user_id = ?',
      [status, id, user_id]
    );
    
    return result.affectedRows > 0;
  },

  updateStatusByAdmin: async (id, status) => {
    const validStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status value');
    }

    const [result] = await db.query(
      'UPDATE bookings SET status = ? WHERE id = ?',
      [status, id]
    );
    
    return result.affectedRows > 0;
  },

  cancelBooking: async (id, user_id) => {
    const [result] = await db.query(
      'UPDATE bookings SET status = ? WHERE id = ? AND user_id = ? AND status IN (?, ?)',
      ['cancelled', id, user_id, 'pending', 'confirmed']
    );
    
    return result.affectedRows > 0;
  },

  getUserBookingsCount: async (user_id) => {
    const [rows] = await db.query(
      'SELECT COUNT(*) as count FROM bookings WHERE user_id = ?',
      [user_id]
    );
    return rows[0].count;
  }
};

module.exports = Booking;