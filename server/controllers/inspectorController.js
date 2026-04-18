const db = require("../config/db");

const inspectorController = {
  verifyTicket: async (req, res) => {
    try {
      const { ticket_id } = req.body;
      
      if (!ticket_id) {
        return res.status(400).json({ message: "Ticket ID is required" });
      }
      
      const [tickets] = await db.query(`
        SELECT t.*, u.fullname as user_name, u.email as user_email
        FROM tickets t
        JOIN users u ON t.user_id = u.id
        WHERE t.ticket_id = ?
      `, [ticket_id]);
      
      if (tickets.length === 0) {
        return res.status(404).json({ 
          valid: false, 
          message: "Bileta nuk u gjet" 
        });
      }
      
      const ticket = tickets[0];
      
      if (ticket.used_at) {
        return res.status(400).json({ 
          valid: false, 
          message: "Bileta tashmë është përdorur",
          used_at: ticket.used_at
        });
      }
      
      if (!ticket.is_valid) {
        return res.status(400).json({ 
          valid: false, 
          message: "Bileta është e pavlefshme" 
        });
      }
      
      const createdAt = new Date(ticket.created_at);
      const now = new Date();
      const hoursDiff = (now - createdAt) / (1000 * 60 * 60);
      
      if (hoursDiff > 24) {
        return res.status(400).json({ 
          valid: false, 
          message: "Bileta ka skaduar (24 orë)" 
        });
      }
      
      await db.query(
        `UPDATE tickets 
         SET used_at = NOW(), 
             is_valid = FALSE,
             verified_by = ?
         WHERE ticket_id = ?`,
        [req.user.id, ticket_id]
      );
      
      await db.query(
        `INSERT INTO inspector_activities 
         (inspector_id, action, ticket_id, user_id) 
         VALUES (?, 'verify_ticket', ?, ?)`,
        [req.user.id, ticket_id, ticket.user_id]
      );
      
      res.json({
        valid: true,
        message: "Bileta është e vlefshme!",
        data: {
          ticket_id: ticket.ticket_id,
          user_name: ticket.user_name,
          user_email: ticket.user_email,
          vehicle_type: ticket.vehicle_type,
          route_name: ticket.route_name,
          verified_at: new Date()
        }
      });
      
    } catch (error) {
      console.error("Verify ticket error:", error);
      res.status(500).json({ message: error.message });
    }
  },
  
  getActiveRides: async (req, res) => {
    try {
      const [rides] = await db.query(`
        SELECT r.*, u.fullname as user_name, u.email as user_email
        FROM rides r
        JOIN users u ON r.user_id = u.id
        WHERE r.status = 'active'
        ORDER BY r.start_time DESC
      `);
      
      res.json(rides);
    } catch (error) {
      console.error("Get active rides error:", error);
      res.status(500).json({ message: error.message });
    }
  },
  
  getInspectorStats: async (req, res) => {
    try {
      const inspectorId = req.user.id;
      
      const [todayVerified] = await db.query(`
        SELECT COUNT(*) as count 
        FROM tickets 
        WHERE verified_by = ? AND DATE(used_at) = CURDATE()
      `, [inspectorId]);
      
      const [totalVerified] = await db.query(`
        SELECT COUNT(*) as count 
        FROM tickets 
        WHERE verified_by = ?
      `, [inspectorId]);
      
      const [recentActivities] = await db.query(`
        SELECT * FROM inspector_activities 
        WHERE inspector_id = ? 
        ORDER BY created_at DESC 
        LIMIT 20
      `, [inspectorId]);
      
      res.json({
        today_verified: todayVerified[0].count,
        total_verified: totalVerified[0].count,
        recent_activities: recentActivities
      });
      
    } catch (error) {
      console.error("Get inspector stats error:", error);
      res.json({
        today_verified: 0,
        total_verified: 0,
        recent_activities: []
      });
    }
  },
  
  getVerificationHistory: async (req, res) => {
    try {
      const [history] = await db.query(`
        SELECT t.*, u.fullname as user_name, u.email as user_email
        FROM tickets t
        JOIN users u ON t.user_id = u.id
        WHERE t.verified_by = ?
        ORDER BY t.used_at DESC
        LIMIT 100
      `, [req.user.id]);
      
      res.json(history);
    } catch (error) {
      console.error("Get verification history error:", error);
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = inspectorController;