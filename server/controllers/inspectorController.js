const db = require("../config/db");
const ticketService = require("../services/ticketService");

const inspectorController = {
  verifyTicket: async (req, res) => {
    try {
      const { ticket_id } = req.body;
      const inspector_id = req.user.id;

      if (!ticket_id) {
        return res.status(400).json({ message: "Ticket ID is required" });
      }

      const result = await ticketService.validateTicket(
        ticket_id,
        inspector_id,
      );

      res.json({
        valid: true,
        message: result.message,
        data: {
          ticket_id: result.ticket_id,
          user_id: result.user_id,
          vehicle_type: result.vehicle_type,
          route_name: result.route_name,
          ticket_type: result.ticket_type,
          remaining_uses: result.remaining_uses,
          expires_at: result.expires_at,
          used_count: result.used_count,
          verified_at: new Date(),
        },
      });
    } catch (error) {
      console.error("Verify ticket error:", error);
      res.status(error.status || 500).json({
        valid: false,
        message: error.message,
      });
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

      const [todayVerified] = await db.query(
        `
        SELECT COUNT(*) as count 
        FROM tickets 
        WHERE verified_by = ? AND DATE(used_at) = CURDATE()
      `,
        [inspectorId],
      );

      const [totalVerified] = await db.query(
        `
        SELECT COUNT(*) as count 
        FROM tickets 
        WHERE verified_by = ?
      `,
        [inspectorId],
      );

      const [recentActivities] = await db.query(
        `
        SELECT * FROM inspector_activities 
        WHERE inspector_id = ? 
        ORDER BY created_at DESC 
        LIMIT 20
      `,
        [inspectorId],
      );

      res.json({
        today_verified: todayVerified[0].count,
        total_verified: totalVerified[0].count,
        recent_activities: recentActivities,
      });
    } catch (error) {
      console.error("Get inspector stats error:", error);
      res.json({
        today_verified: 0,
        total_verified: 0,
        recent_activities: [],
      });
    }
  },

  getVerificationHistory: async (req, res) => {
    try {
      const [history] = await db.query(
        `
        SELECT t.*, u.fullname as user_name, u.email as user_email
        FROM tickets t
        JOIN users u ON t.user_id = u.id
        WHERE t.verified_by = ?
        ORDER BY t.used_at DESC
        LIMIT 100
      `,
        [req.user.id],
      );

      res.json(history);
    } catch (error) {
      console.error("Get verification history error:", error);
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = inspectorController;
