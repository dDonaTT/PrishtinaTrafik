const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const driverController = {
  driverLogin: async (req, res) => {
    try {
      const { email, password } = req.body;

      const [users] = await db.query(
        "SELECT * FROM users WHERE email = ? AND is_driver = 1",
        [email],
      );

      if (users.length === 0) {
        return res.status(401).json({ message: "Invalid driver credentials" });
      }

      const user = users[0];

      const isValid = await bcrypt.compare(password, user.password);

      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
          is_driver: true,
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" },
      );

      const [vehicle] = await db.query(
        "SELECT * FROM vehicle_locations WHERE driver_id = ?",
        [user.id],
      );

      res.json({
        success: true,
        token,
        driver: {
          id: user.id,
          name: user.fullname,
          email: user.email,
          vehicle: vehicle[0] || null,
          total_earnings: user.total_earnings || 0,
        },
      });
    } catch (error) {
      console.error("Driver login error:", error);
      res.status(500).json({ message: error.message });
    }
  },

  toggleOnline: async (req, res) => {
    try {
      const driverId = req.user.id;
      const { is_online } = req.body;

      await db.query(
        "UPDATE vehicle_locations SET is_online = ?, current_status = ? WHERE driver_id = ?",
        [is_online, is_online ? "online" : "offline", driverId],
      );

      res.json({ success: true, is_online });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getNearbyOrders: async (req, res) => {
    try {
      const driverId = req.user.id;

      const [vehicle] = await db.query(
        "SELECT latitude, longitude FROM vehicle_locations WHERE driver_id = ?",
        [driverId],
      );

      if (!vehicle[0]) {
        return res.json([]);
      }

      const { latitude, longitude } = vehicle[0];

      const [orders] = await db.query(
        `
        SELECT o.*, 
          (6371 * acos(
            cos(radians(?)) * cos(radians(o.pickup_lat)) * 
            cos(radians(o.pickup_lng) - radians(?)) + 
            sin(radians(?)) * sin(radians(o.pickup_lat))
          )) AS distance
        FROM taxi_orders o
        WHERE o.status = 'pending' 
        HAVING distance < 5
        ORDER BY distance ASC
        LIMIT 10
      `,
        [latitude, longitude, latitude],
      );

      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  acceptOrder: async (req, res) => {
    try {
      const { order_id } = req.body;
      const driverId = req.user.id;

      const [vehicle] = await db.query(
        "SELECT id FROM vehicle_locations WHERE driver_id = ?",
        [driverId],
      );

      if (!vehicle[0]) {
        return res.status(400).json({ message: "Vehicle not found" });
      }

      await db.query(
        `
        UPDATE taxi_orders 
        SET taxi_id = ?, status = 'accepted', accepted_at = NOW() 
        WHERE order_id = ? AND status = 'pending'
      `,
        [vehicle[0].id, order_id],
      );

      await db.query(
        `
        UPDATE vehicle_locations 
        SET taxi_status = 'busy', current_status = 'on_trip' 
        WHERE driver_id = ?
      `,
        [driverId],
      );

      res.json({ success: true, message: "Order accepted successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  arrivedAtPickup: async (req, res) => {
    try {
      const { order_id } = req.body;
      await db.query(
        "UPDATE taxi_orders SET status = 'arrived', arrived_at = NOW() WHERE order_id = ?",
        [order_id],
      );
      res.json({ success: true, message: "Arrived at pickup location" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  startTrip: async (req, res) => {
    try {
      const { order_id } = req.body;
      await db.query(
        "UPDATE taxi_orders SET status = 'in_progress' WHERE order_id = ?",
        [order_id],
      );
      res.json({ success: true, message: "Trip started" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  completeTrip: async (req, res) => {
    try {
      const { order_id, final_distance_km, final_price } = req.body;
      const driverId = req.user.id;

      await db.query(
        `
        UPDATE taxi_orders 
        SET status = 'completed', completed_at = NOW(),
            distance_km = ?, total_price = ?
        WHERE order_id = ?
      `,
        [final_distance_km, final_price, order_id],
      );

      const driverEarnings = final_price * 0.8;
      await db.query(
        "UPDATE users SET total_earnings = total_earnings + ? WHERE id = ?",
        [driverEarnings, driverId],
      );

      await db.query(
        `
        UPDATE vehicle_locations 
        SET taxi_status = 'available', current_status = 'online' 
        WHERE driver_id = ?
      `,
        [driverId],
      );

      res.json({
        success: true,
        message: "Trip completed",
        earnings: driverEarnings,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getTripHistory: async (req, res) => {
    try {
      const driverId = req.user.id;
      const [vehicle] = await db.query(
        "SELECT id FROM vehicle_locations WHERE driver_id = ?",
        [driverId],
      );

      if (!vehicle[0]) {
        return res.json([]);
      }

      const [trips] = await db.query(
        `
        SELECT o.*, u.fullname as user_name
        FROM taxi_orders o
        JOIN users u ON o.user_id = u.id
        WHERE o.taxi_id = ? AND o.status = 'completed'
        ORDER BY o.completed_at DESC
        LIMIT 50
      `,
        [vehicle[0].id],
      );

      res.json(trips);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getDriverStats: async (req, res) => {
    try {
      const driverId = req.user.id;

      console.log("Getting stats for driver:", driverId);

      const [vehicle] = await db.query(
        "SELECT id FROM vehicle_locations WHERE driver_id = ?",
        [driverId],
      );

      console.log("Vehicle found:", vehicle[0]);

      if (!vehicle[0]) {
        console.log("No vehicle found for driver");
        return res.status(200).json({
          total_trips: 0,
          total_revenue: 0,
          avg_rating: 5.0,
        });
      }

      try {
        const [stats] = await db.query(
          `
        SELECT 
          COUNT(*) as total_trips,
          COALESCE(SUM(total_price), 0) as total_revenue,
          COALESCE(AVG(rating), 5.0) as avg_rating
        FROM taxi_orders
        WHERE taxi_id = ? AND status = 'completed'
      `,
          [vehicle[0].id],
        );

        console.log("Stats result:", stats[0]);

        return res.status(200).json({
          total_trips: stats[0]?.total_trips || 0,
          total_revenue: parseFloat(stats[0]?.total_revenue || 0),
          avg_rating: parseFloat(stats[0]?.avg_rating || 5.0),
        });
      } catch (dbError) {
        console.error("Database query error:", dbError);
        return res.status(200).json({
          total_trips: 0,
          total_revenue: 0,
          avg_rating: 5.0,
        });
      }
    } catch (error) {
      console.error("Get driver stats error:", error);
      return res.status(200).json({
        total_trips: 0,
        total_revenue: 0,
        avg_rating: 5.0,
      });
    }
  },
  rejectOrder: async (req, res) => {
    try {
      const { order_id } = req.body;
      // Thjesht mos e prano, ose shëno si rejected
      res.json({ success: true, message: "Order rejected" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  updateLocation: async (req, res) => {
    try {
      const driverId = req.user.id;
      const { latitude, longitude } = req.body;

      await db.query(
        `
        UPDATE vehicle_locations 
        SET latitude = ?, longitude = ?, last_update = NOW()
        WHERE driver_id = ?
      `,
        [latitude, longitude, driverId],
      );

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = driverController;
