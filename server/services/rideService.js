const Ride = require("../models/Ride");
const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");
const { v4: uuidv4 } = require("uuid");

const RIDE_PRICES = {
    bike: 0.05,    
    scooter: 0.3  
};

const startRide = async (user, data) => {
    try {
        const { id: user_id } = user;
        const { vehicle_id, vehicle_type, start_location } = data;

        console.log("START RIDE", { user_id, vehicle_id, vehicle_type, start_location });

        if (!['bike', 'scooter'].includes(vehicle_type)) {
            throw { status: 400, message: "Invalid vehicle type for ride sharing. Use 'bike' or 'scooter'" };
        }


        const activeRide = await Ride.getActiveRide(user_id);
        if (activeRide) {
            throw { status: 400, message: "You already have an active ride. Please end it first." };
        }

        const wallet = await Wallet.findByUserId(user_id);
        if (!wallet || wallet.balance < 1) {
            throw { status: 400, message: "Insufficient balance. Minimum €1 required to start a ride" };
        }

        const vehicle = await Ride.checkVehicleAvailability(vehicle_id, vehicle_type);
        if (!vehicle) {
            throw { status: 400, message: "Vehicle is not available. Please try another one." };
        }

    
        const ride = await Ride.startRide({
            user_id,
            vehicle_id,
            vehicle_type,
            start_location
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
            throw { status: 400, message: `Insufficient balance. Need €${totalCost.toFixed(2)} to complete ride` };
        }

      
        const result = await Ride.endRide(ride_id, user_id, end_location, durationMinutes, totalCost);

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
            message: `Ride completed successfully. You rode for ${durationMinutes} minutes.`
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
            price_per_minute: pricePerMinute
        };
    } catch (error) {
        console.error("GET ACTIVE RIDE ERROR:", error);
        throw error;
    }
};

const getUserRides = async (user_id, limit = 20) => {
    try {
        const rides = await Ride.getUserRides(user_id, limit);
        
      
        const ridesWithSummary = rides.map(ride => ({
            ...ride,
            average_cost_per_minute: ride.total_cost / ride.duration_minutes || 0
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
            recommendations.push("You're a frequent rider! Consider our weekly pass for better savings.");
        }
        
        if (stats.total_spent > 20) {
            recommendations.push("You've spent over €20. Check our membership plans for discounts.");
        }
        
        return {
            ...stats,
            recommendations,
            favorite_vehicle: stats.total_rides > 0 ? 
                (stats.total_spent > 10 ? 'scooter' : 'bike') : null
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
        
        return { message: "Ride cancelled successfully", ride_id: activeRide.ride_id };
    } catch (error) {
        console.error("CANCEL RIDE ERROR:", error);
        throw error;
    }
};

const findNearbyVehicles = async (latitude, longitude, vehicle_type, radius_km = 1) => {
    try {
        if (!latitude || !longitude) {
            throw { status: 400, message: "Latitude and longitude are required" };
        }
        
        const vehicles = await Ride.findNearbyVehicles(
            parseFloat(latitude),
            parseFloat(longitude),
            vehicle_type,
            radius_km
        );
        
        return vehicles;
    } catch (error) {
        console.error("FIND NEARBY VEHICLES ERROR:", error);
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
    findNearbyVehicles
};