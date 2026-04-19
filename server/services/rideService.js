const Ride = require("../models/Ride");
const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");
const { v4: uuidv4 } = require("uuid");

const RIDE_PRICES = {
  bike: 0.05,
  scooter: 0.3,
};

const TAXI_RATES = {
  BASE_FARE: 1.5,
  PER_KM: 0.8,
  PER_MINUTE: 0.2,
  NIGHT_MULTIPLIER: 1.3,
  WEEKEND_MULTIPLIER: 1.2,
};

const calculateNightMultiplier = () => {
  const hour = new Date().getHours();
  return hour >= 22 || hour < 6 ? TAXI_RATES.NIGHT_MULTIPLIER : 1.0;
};

const calculateWeekendMultiplier = () => {
  const day = new Date().getDay();
  return day === 5 || day === 6 ? TAXI_RATES.WEEKEND_MULTIPLIER : 1.0;
};

const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const calculateTotalFare = (
  distanceKm,
  waitingMinutes,
  nightMultiplier,
  weekendMultiplier,
) => {
  const distanceCost = distanceKm * TAXI_RATES.PER_KM;
  const waitingCost = waitingMinutes * TAXI_RATES.PER_MINUTE;
  const baseTotal = TAXI_RATES.BASE_FARE + distanceCost + waitingCost;
  const multiplier = nightMultiplier * weekendMultiplier;
  return Math.round(baseTotal * multiplier * 100) / 100;
};

const startTaxiRide = async (user, data) => {
  try {
    const { id: user_id } = user;
    const { start_lat, start_lng, start_location } = data;

    const activeRide = await Ride.getActiveRide(user_id);
    if (activeRide) {
      throw { status: 400, message: "You already have an active ride" };
    }

    const wallet = await Wallet.findByUserId(user_id);
    if (!wallet || wallet.balance < 5) {
      throw {
        status: 400,
        message: "Insufficient balance. Minimum €5 required for taxi",
      };
    }

    const ride_id = uuidv4();
    const nightMultiplier = calculateNightMultiplier();
    const weekendMultiplier = calculateWeekendMultiplier();

    await Ride.startTaxiRide({
      ride_id,
      user_id,
      start_lat,
      start_lng,
      start_location,
      nightMultiplier,
      weekendMultiplier,
    });

    return {
      ride_id,
      vehicle_type: "taxi",
      start_location,
      status: "active",
      message: "Taxi ride started successfully",
    };
  } catch (error) {
    console.error("START TAXI RIDE ERROR:", error);
    throw error;
  }
};

const updateTaxiLocation = async (ride_id, current_lat, current_lng) => {
  try {
    await Ride.updateTaxiLocation(ride_id, current_lat, current_lng);
  } catch (error) {
    console.error("UPDATE TAXI LOCATION ERROR:", error);
    throw error;
  }
};

const getCurrentTaxiFare = async (ride_id, current_lat, current_lng) => {
  try {
    const ride = await Ride.getActiveRideById(ride_id);
    if (!ride) return null;

    const distanceKm = calculateDistance(
      ride.start_lat,
      ride.start_lng,
      current_lat,
      current_lng,
    );

    const startTime = new Date(ride.start_time);
    const now = new Date();
    const totalMinutes = Math.floor((now - startTime) / 60000);
    const waitingMinutes = Math.max(0, totalMinutes - 5);

    const currentFare = calculateTotalFare(
      distanceKm,
      waitingMinutes,
      ride.night_multiplier || 1,
      ride.weekend_multiplier || 1,
    );

    return {
      distance_km: distanceKm.toFixed(2),
      waiting_minutes: waitingMinutes,
      current_fare: currentFare,
      elapsed_minutes: totalMinutes,
    };
  } catch (error) {
    console.error("GET CURRENT TAXI FARE ERROR:", error);
    throw error;
  }
};

const endTaxiRide = async (user, data) => {
  try {
    const { id: user_id } = user;
    const { ride_id, end_lat, end_lng, end_location } = data;

    const activeRide = await Ride.getActiveRideById(ride_id);
    if (!activeRide || activeRide.user_id !== user_id) {
      throw { status: 404, message: "No active taxi ride found" };
    }

    const distanceKm = calculateDistance(
      activeRide.start_lat,
      activeRide.start_lng,
      end_lat,
      end_lng,
    );

    const startTime = new Date(activeRide.start_time);
    const endTime = new Date();
    const totalMinutes = Math.floor((endTime - startTime) / 60000);
    const waitingMinutes = Math.max(0, totalMinutes - 5);

    const totalFare = calculateTotalFare(
      distanceKm,
      waitingMinutes,
      activeRide.night_multiplier || 1,
      activeRide.weekend_multiplier || 1,
    );

    const wallet = await Wallet.findByUserId(user_id);
    if (!wallet || wallet.balance < totalFare) {
      throw {
        status: 400,
        message: `Insufficient balance. Need €${totalFare.toFixed(2)}`,
      };
    }

    await Ride.endTaxiRide(
      ride_id,
      end_lat,
      end_lng,
      end_location,
      distanceKm,
      waitingMinutes,
      totalFare,
    );
    await Wallet.deduct(user_id, totalFare);

    await Transaction.create({
      user_id,
      type: "taxi",
      amount: -totalFare,
      vehicle_id: null,
    });

    return {
      ride_id,
      distance_km: distanceKm.toFixed(2),
      waiting_minutes: waitingMinutes,
      total_fare: totalFare,
      message: `Taxi ride completed. Distance: ${distanceKm.toFixed(2)}km, Fare: €${totalFare}`,
    };
  } catch (error) {
    console.error("END TAXI RIDE ERROR:", error);
    throw error;
  }
};

const startRide = async (user, data) => {
  try {
    const { id: user_id } = user;
    const { vehicle_id, vehicle_type, start_location } = data;

    console.log("START RIDE", {
      user_id,
      vehicle_id,
      vehicle_type,
      start_location,
    });

    if (!["bike", "scooter"].includes(vehicle_type)) {
      throw {
        status: 400,
        message:
          "Invalid vehicle type for ride sharing. Use 'bike' or 'scooter'",
      };
    }

    const activeRide = await Ride.getActiveRide(user_id);
    if (activeRide) {
      throw {
        status: 400,
        message: "You already have an active ride. Please end it first.",
      };
    }

    const wallet = await Wallet.findByUserId(user_id);
    if (!wallet || wallet.balance < 1) {
      throw {
        status: 400,
        message: "Insufficient balance. Minimum €1 required to start a ride",
      };
    }

    const vehicle = await Ride.checkVehicleAvailability(
      vehicle_id,
      vehicle_type,
    );
    if (!vehicle) {
      throw {
        status: 400,
        message: "Vehicle is not available. Please try another one.",
      };
    }

    const ride = await Ride.startRide({
      user_id,
      vehicle_id,
      vehicle_type,
      start_location,
    });

    return ride;
  } catch (error) {
    console.error("START RIDE SERVICE ERROR:", error);
    throw error;
  }
};

const endRide = async (user, data) => {
  try {
    const { id: user_id } = user;
    const { ride_id, end_location } = data;

    console.log("END RIDE", { user_id, ride_id, end_location });

    const activeRide = await Ride.getActiveRide(user_id);

    if (!activeRide) {
      throw { status: 404, message: "No active ride found" };
    }

    if (activeRide.ride_id !== ride_id) {
      throw { status: 400, message: "Ride ID mismatch" };
    }

    const startTime = new Date(activeRide.start_time);
    const endTime = new Date();
    const durationMs = endTime - startTime;
    const durationMinutes = Math.max(1, Math.ceil(durationMs / (1000 * 60))); // Minimum 1 minutë
    const pricePerMinute = RIDE_PRICES[activeRide.vehicle_type];
    const totalCost = durationMinutes * pricePerMinute;

    const wallet = await Wallet.findByUserId(user_id);
    if (!wallet || wallet.balance < totalCost) {
      throw {
        status: 400,
        message: `Insufficient balance. Need €${totalCost.toFixed(2)} to complete ride`,
      };
    }

    const result = await Ride.endRide(
      ride_id,
      user_id,
      end_location,
      durationMinutes,
      totalCost,
    );

    await Wallet.deduct(user_id, totalCost);

    await Transaction.create({
      user_id,
      type: activeRide.vehicle_type,
      amount: -totalCost,
      vehicle_id: activeRide.vehicle_id,
    });

    return {
      ride_id: result.ride_id,
      vehicle_type: activeRide.vehicle_type,
      duration_minutes: durationMinutes,
      total_cost: totalCost,
      price_per_minute: pricePerMinute,
      start_time: startTime,
      end_time: endTime,
      message: `Ride completed successfully. You rode for ${durationMinutes} minutes.`,
    };
  } catch (error) {
    console.error("END RIDE SERVICE ERROR:", error);
    throw error;
  }
};

const getActiveRide = async (user_id) => {
  try {
    const ride = await Ride.getActiveRide(user_id);

    if (!ride) {
      return null;
    }

    const startTime = new Date(ride.start_time);
    const now = new Date();
    const durationMs = now - startTime;
    const durationMinutes = Math.max(1, Math.ceil(durationMs / (1000 * 60)));
    const pricePerMinute = RIDE_PRICES[ride.vehicle_type];
    const currentCost = durationMinutes * pricePerMinute;

    return {
      ...ride,
      current_duration_minutes: durationMinutes,
      current_cost: currentCost,
      price_per_minute: pricePerMinute,
    };
  } catch (error) {
    console.error("GET ACTIVE RIDE ERROR:", error);
    throw error;
  }
};

const getUserRides = async (user_id, limit = 20) => {
  try {
    const rides = await Ride.getUserRides(user_id, limit);

    const ridesWithSummary = rides.map((ride) => ({
      ...ride,
      average_cost_per_minute: ride.total_cost / ride.duration_minutes || 0,
    }));

    return ridesWithSummary;
  } catch (error) {
    console.error("GET USER RIDES ERROR:", error);
    throw error;
  }
};

const getRideStats = async (user_id) => {
  try {
    const stats = await Ride.getRideStats(user_id);

    // Shto rekomandime bazuar në statistika
    const recommendations = [];

    if (stats.total_minutes > 100) {
      recommendations.push(
        "You're a frequent rider! Consider our weekly pass for better savings.",
      );
    }

    if (stats.total_spent > 20) {
      recommendations.push(
        "You've spent over €20. Check our membership plans for discounts.",
      );
    }

    return {
      ...stats,
      recommendations,
      favorite_vehicle:
        stats.total_rides > 0
          ? stats.total_spent > 10
            ? "scooter"
            : "bike"
          : null,
    };
  } catch (error) {
    console.error("GET RIDE STATS ERROR:", error);
    throw error;
  }
};

const cancelRide = async (user_id) => {
  try {
    const activeRide = await Ride.getActiveRide(user_id);

    if (!activeRide) {
      throw { status: 404, message: "No active ride to cancel" };
    }

    await Ride.cancelRide(activeRide.ride_id, user_id);

    return {
      message: "Ride cancelled successfully",
      ride_id: activeRide.ride_id,
    };
  } catch (error) {
    console.error("CANCEL RIDE ERROR:", error);
    throw error;
  }
};

const getAllVehicles = async (vehicle_type) => {
  try {
    const vehicles = await Ride.getAllVehicles(vehicle_type);
    return vehicles;
  } catch (error) {
    console.error("GET ALL VEHICLES ERROR:", error);
    throw error;
  }
};
module.exports = {
  startRide,
  endRide,
  getActiveRide,
  getUserRides,
  getRideStats,
  cancelRide,
  getAllVehicles,
  startTaxiRide,
  updateTaxiLocation,
  getCurrentTaxiFare,
  endTaxiRide,
};
