const db = require("../config/db");
const bcrypt = require("bcryptjs");

const adminController = {
  getDashboardStats: async (req, res) => {
    try {
      const [users] = await db.query("SELECT COUNT(*) as total FROM users");
      
      const [vehicles] = await db.query("SELECT COUNT(*) as total FROM vehicle_locations");
      
      const [tickets] = await db.query("SELECT COUNT(*) as total FROM tickets");
      
      const [rides] = await db.query("SELECT COUNT(*) as total FROM rides WHERE status = 'completed'");
      
      const [revenue] = await db.query("SELECT SUM(amount) as total FROM transactions WHERE amount < 0");
      
      const [transactions] = await db.query("SELECT COUNT(*) as total FROM transactions");
      
      const [activeRides] = await db.query("SELECT COUNT(*) as total FROM rides WHERE status = 'active'");
      
      const [recentActivities] = await db.query(`
        SELECT 
          CONCAT(u.fullname, ' ', a.action) as message,
          a.created_at
        FROM activities a
        JOIN users u ON a.user_id = u.id
        ORDER BY a.created_at DESC
        LIMIT 10
      `);

      res.json({
        totalUsers: users[0].total,
        totalVehicles: vehicles[0].total,
        totalTickets: tickets[0].total,
        totalRides: rides[0].total,
        totalRevenue: Math.abs(revenue[0].total || 0),
        totalTransactions: transactions[0].total,
        activeRides: activeRides[0].total,
        recentActivities: recentActivities || []
      });
    } catch (error) {
      console.error("Dashboard stats error:", error);
      res.status(500).json({ message: error.message });
    }
  },

  getAllUsers: async (req, res) => {
    try {
      const [users] = await db.query(`
        SELECT id, fullname, email, role, created_at 
        FROM users 
        ORDER BY created_at DESC
      `);
      res.json(users);
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({ message: error.message });
    }
  },

  getUserById: async (req, res) => {
    try {
      const { id } = req.params;
      const [users] = await db.query(`
        SELECT id, fullname, email, role, created_at 
        FROM users 
        WHERE id = ?
      `, [id]);
      
      if (users.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(users[0]);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: error.message });
    }
  },

  updateUserRole: async (req, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;
      
      const validRoles = ['user', 'admin', 'inspector'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      
      await db.query(
        "UPDATE users SET role = ? WHERE id = ?",
        [role, id]
      );
      
      res.json({ message: "Role updated successfully" });
    } catch (error) {
      console.error("Update role error:", error);
      res.status(500).json({ message: error.message });
    }
  },

  toggleUserStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      
      await db.query(
        "UPDATE users SET is_active = ? WHERE id = ?",
        [isActive, id]
      );
      
      res.json({ message: "User status updated successfully" });
    } catch (error) {
      console.error("Toggle status error:", error);
      res.status(500).json({ message: error.message });
    }
  },

  deleteUser: async (req, res) => {
  try {
    const { id } = req.params;
    
    await db.query('START TRANSACTION');
    
    try {
      await db.query("DELETE FROM wallets WHERE user_id = ?", [id]);
      await db.query("DELETE FROM transactions WHERE user_id = ?", [id]);
      await db.query("DELETE FROM tickets WHERE user_id = ?", [id]);
      await db.query("DELETE FROM rides WHERE user_id = ?", [id]);
      
      const [result] = await db.query("DELETE FROM users WHERE id = ?", [id]);
      
      if (result.affectedRows === 0) {
        await db.query('ROLLBACK');
        return res.status(404).json({ message: "User not found" });
      }
      
      await db.query('COMMIT');
      res.json({ message: "User deleted successfully" });
      
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
    
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: error.message });
  }
},

  getAllVehicles: async (req, res) => {
    try {
      const [vehicles] = await db.query(`
        SELECT * FROM vehicle_locations 
        ORDER BY vehicle_type, vehicle_id
      `);
      res.json(vehicles);
    } catch (error) {
      console.error("Get vehicles error:", error);
      res.status(500).json({ message: error.message });
    }
  },

  createVehicle: async (req, res) => {
    try {
      const { vehicle_id, vehicle_type, latitude, longitude, battery_level, route_name, is_available } = req.body;
      
      const [result] = await db.query(`
        INSERT INTO vehicle_locations 
        (vehicle_id, vehicle_type, latitude, longitude, battery_level, route_name, is_available) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [vehicle_id, vehicle_type, latitude || null, longitude || null, battery_level || null, route_name || null, is_available !== false]);
      
      res.status(201).json({ 
        id: result.insertId, 
        vehicle_id, 
        vehicle_type, 
        latitude, 
        longitude, 
        battery_level, 
        route_name, 
        is_available 
      });
    } catch (error) {
      console.error("Create vehicle error:", error);
      res.status(500).json({ message: error.message });
    }
  },

  updateVehicle: async (req, res) => {
    try {
      const { id } = req.params;
      const { vehicle_id, vehicle_type, latitude, longitude, battery_level, route_name, is_available } = req.body;
      
      await db.query(`
        UPDATE vehicle_locations 
        SET vehicle_id = ?, vehicle_type = ?, latitude = ?, longitude = ?, 
            battery_level = ?, route_name = ?, is_available = ?
        WHERE id = ?
      `, [vehicle_id, vehicle_type, latitude || null, longitude || null, battery_level || null, route_name || null, is_available, id]);
      
      res.json({ message: "Vehicle updated successfully" });
    } catch (error) {
      console.error("Update vehicle error:", error);
      res.status(500).json({ message: error.message });
    }
  },

  updateVehicleAvailability: async (req, res) => {
    try {
      const { id } = req.params;
      const { is_available } = req.body;
      
      await db.query(
        "UPDATE vehicle_locations SET is_available = ? WHERE id = ?",
        [is_available, id]
      );
      
      res.json({ message: "Vehicle availability updated" });
    } catch (error) {
      console.error("Update availability error:", error);
      res.status(500).json({ message: error.message });
    }
  },

  deleteVehicle: async (req, res) => {
    try {
      const { id } = req.params;
      await db.query("DELETE FROM vehicle_locations WHERE id = ?", [id]);
      res.json({ message: "Vehicle deleted successfully" });
    } catch (error) {
      console.error("Delete vehicle error:", error);
      res.status(500).json({ message: error.message });
    }
  },

  getAllTransactions: async (req, res) => {
    try {
      const { limit = 100 } = req.query;
      const [transactions] = await db.query(`
        SELECT t.*, u.fullname as user_name, u.email as user_email
        FROM transactions t
        JOIN users u ON t.user_id = u.id
        ORDER BY t.created_at DESC
        LIMIT ?
      `, [parseInt(limit)]);
      
      res.json(transactions);
    } catch (error) {
      console.error("Get transactions error:", error);
      res.status(500).json({ message: error.message });
    }
  },

  getTransactionById: async (req, res) => {
    try {
      const { id } = req.params;
      const [transactions] = await db.query(`
        SELECT t.*, u.fullname as user_name, u.email as user_email
        FROM transactions t
        JOIN users u ON t.user_id = u.id
        WHERE t.id = ?
      `, [id]);
      
      if (transactions.length === 0) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      
      res.json(transactions[0]);
    } catch (error) {
      console.error("Get transaction error:", error);
      res.status(500).json({ message: error.message });
    }
  },

  getAllTickets: async (req, res) => {
    try {
      const [tickets] = await db.query(`
        SELECT t.*, u.fullname as user_name, u.email as user_email
        FROM tickets t
        JOIN users u ON t.user_id = u.id
        ORDER BY t.created_at DESC
      `);
      res.json(tickets);
    } catch (error) {
      console.error("Get tickets error:", error);
      res.status(500).json({ message: error.message });
    }
  },

  getAllRides: async (req, res) => {
    try {
      const [rides] = await db.query(`
        SELECT r.*, u.fullname as user_name, u.email as user_email
        FROM rides r
        JOIN users u ON r.user_id = u.id
        ORDER BY r.created_at DESC
      `);
      res.json(rides);
    } catch (error) {
      console.error("Get rides error:", error);
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = adminController;