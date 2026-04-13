const db = require("../config/db");
const Transaction = require("./Transaction");
const Wallet = require("./Wallet");
const { v4: uuidv4 } = require("uuid");

const RIDE_PRICES = {
  bike: 0.05,     // €0.05 per minute
  scooter: 0.03   // €0.03 per minute
};

const Ride = {
  
  startRide: async ({ user_id, vehicle_id, vehicle_type, start_location }) => {
    const activeRide = await Ride.getActiveRide(user_id);
    if (activeRide) {
      throw { status: 400, message: "You already have an active ride" };
    }
    
    if (!['bike', 'scooter'].includes(vehicle_type)) {
      throw { status: 400, message: "Invalid vehicle type. Use 'bike' or 'scooter'" };
    }
    
    const vehicle = await Ride.checkVehicleAvailability(vehicle_id, vehicle_type);
    if (!vehicle) {
      throw { status: 400, message: "Vehicle is not available" };
    }
    
    const ride_id = uuidv4();

    const [result] = await db.query(
      `INSERT INTO rides 
        (ride_id, user_id, vehicle_id, vehicle_type, start_time, start_location, status) 
        VALUES (?, ?, ?, ?, NOW(), ?, 'active')`,
      [ride_id, user_id, vehicle_id, vehicle_type, start_location],
    );
    
    await db.query(
      `UPDATE vehicle_locations 
        SET is_available = FALSE 
        WHERE vehicle_id = ? AND vehicle_type = ?`,
      [vehicle_id, vehicle_type],
    );
    
    return {
      id: result.insertId,
      ride_id,
      user_id,
      vehicle_id,
      vehicle_type,
      start_time: new Date().toISOString(),
      start_location,
      status: "active",
    };
  },

  endRide: async (ride_id, user_id, end_location) => {
    const [ride] = await db.query(
      `SELECT * FROM rides 
        WHERE ride_id = ? AND user_id = ? AND status = 'active'`,
      [ride_id, user_id],
    );

    if (!ride || ride.length === 0) {
      throw { status: 404, message: "No active ride found" };
    }

    const currentRide = ride[0];
    const startTime = new Date(currentRide.start_time);
    const endTime = new Date();

    const durationMs = endTime - startTime;
    const durationMinutes = Math.max(1, Math.ceil(durationMs / (1000 * 60))); // Minimum 1 minutë

    const pricePerMinute = RIDE_PRICES[currentRide.vehicle_type];
    const totalCost = parseFloat((durationMinutes * pricePerMinute).toFixed(2));
    
    await db.query(
      `UPDATE rides 
        SET end_time = NOW(),
            end_location = ?,
            duration_minutes = ?,
            total_cost = ?,
            status = 'completed',
            payment_status = 'paid'
        WHERE ride_id = ? AND user_id = ?`,
      [end_location, durationMinutes, totalCost, ride_id, user_id],
    );

    await Wallet.deduct(user_id, totalCost);

    await Transaction.create({
      user_id,
      type: currentRide.vehicle_type,
      amount: -totalCost,
      vehicle_id: currentRide.vehicle_id,
    });

    await db.query(
      `UPDATE vehicle_locations 
        SET is_available = TRUE 
        WHERE vehicle_id = ? AND vehicle_type = ?`,
      [currentRide.vehicle_id, currentRide.vehicle_type],
    );

    return {
      ride_id: currentRide.ride_id,
      duration_minutes: durationMinutes,
      total_cost: totalCost,
      price_per_minute: pricePerMinute,
      start_time: startTime,
      end_time: endTime,
    };
  },

  getActiveRide: async (user_id) => {
    const [rows] = await db.query(
      `SELECT * FROM rides 
        WHERE user_id = ? AND status = 'active'`,
      [user_id]
    );
    return rows[0];
  },

  getUserRides: async (user_id, limit = 20) => {
    const [rows] = await db.query(
      `SELECT * FROM rides 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT ?`,
      [user_id, limit]
    );
    return rows;
  },

  checkVehicleAvailability: async (vehicle_id, vehicle_type) => {
    const [rows] = await db.query(
      `SELECT * FROM vehicle_locations 
        WHERE vehicle_id = ? 
        AND vehicle_type = ? 
        AND is_available = TRUE`,
      [vehicle_id, vehicle_type]
    );
    return rows[0];
  },

  findNearbyVehicles: async (latitude, longitude, vehicle_type, radius_km = 1) => {
    const [rows] = await db.query(
      `SELECT *, 
        (6371 * acos(
          cos(radians(?)) * cos(radians(latitude)) * 
          cos(radians(longitude) - radians(?)) + 
          sin(radians(?)) * sin(radians(latitude))
        )) AS distance
        FROM vehicle_locations
        WHERE vehicle_type = ? 
        AND is_available = TRUE
        HAVING distance < ?
        ORDER BY distance ASC
        LIMIT 10`,
      [latitude, longitude, latitude, vehicle_type, radius_km]
    );
    return rows;
  },

  getRideStats: async (user_id) => {
    const [rows] = await db.query(
      `SELECT 
        COUNT(*) as total_rides,
        SUM(duration_minutes) as total_minutes,
        SUM(total_cost) as total_spent,
        AVG(duration_minutes) as avg_duration,
        MAX(duration_minutes) as longest_ride,
        MIN(duration_minutes) as shortest_ride
      FROM rides 
      WHERE user_id = ? AND status = 'completed'`,
      [user_id]
    );
    
    const stats = rows[0];
    
    return {
      total_rides: stats.total_rides || 0,
      total_minutes: stats.total_minutes || 0,
      total_spent: parseFloat(stats.total_spent || 0).toFixed(2),
      avg_duration: Math.round(stats.avg_duration || 0),
      longest_ride: stats.longest_ride || 0,
      shortest_ride: stats.shortest_ride || 0
    };
  },

  cancelRide: async (ride_id, user_id) => {
    // Merr udhëtimin aktiv
    const [ride] = await db.query(
      `SELECT * FROM rides 
        WHERE ride_id = ? AND user_id = ? AND status = 'active'`,
      [ride_id, user_id]
    );
    
    if (!ride || ride.length === 0) {
      throw { status: 404, message: "No active ride found to cancel" };
    }
    
    const currentRide = ride[0];
    
    const [result] = await db.query(
      `UPDATE rides 
        SET status = 'cancelled', 
            end_time = NOW()
        WHERE ride_id = ? AND user_id = ? AND status = 'active'`,
      [ride_id, user_id]
    );
    
    await db.query(
      `UPDATE vehicle_locations 
        SET is_available = TRUE 
        WHERE vehicle_id = ? AND vehicle_type = ?`,
      [currentRide.vehicle_id, currentRide.vehicle_type]
    );
    
    return result.affectedRows > 0;
  },

  getRideById: async (ride_id, user_id) => {
    const [rows] = await db.query(
      `SELECT * FROM rides 
        WHERE ride_id = ? AND user_id = ?`,
      [ride_id, user_id]
    );
    return rows[0];
  },

  hasActiveRide: async (user_id) => {
    const [rows] = await db.query(
      `SELECT COUNT(*) as count FROM rides 
        WHERE user_id = ? AND status = 'active'`,
      [user_id]
    );
    return rows[0].count > 0;
  },

  getTotalSpentByVehicleType: async (user_id, vehicle_type) => {
    const [rows] = await db.query(
      `SELECT SUM(total_cost) as total 
        FROM rides 
        WHERE user_id = ? AND vehicle_type = ? AND status = 'completed'`,
      [user_id, vehicle_type]
    );
    return parseFloat(rows[0].total || 0).toFixed(2);
  },

  getLastRide: async (user_id) => {
    const [rows] = await db.query(
      `SELECT * FROM rides 
        WHERE user_id = ? AND status = 'completed' 
        ORDER BY created_at DESC 
        LIMIT 1`,
      [user_id]
    );
    return rows[0];
  }
};

module.exports = Ride;