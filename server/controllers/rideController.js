const rideService = require("../services/rideService");

const startRide = async (req, res) => {
    try {
        const ride = await rideService.startRide(req.user, req.body);
        
        return res.status(201).json({
            success: true,
            message: "Ride started successfully",
            data: {
                ...ride,
                tip: "Scan QR code on vehicle to end your ride",
                price_info: {
                    bike: "€0.05 per minute",
                    scooter: "€0.15 per minute",
                    minimum_balance: "€1.00"
                }
            }
        });
    } catch (error) {
        console.error("START RIDE CONTROLLER ERROR:", error);
        
        return res.status(error.status || 500).json({
            success: false,
            message: error.message
        });
    }
};

const endRide = async (req, res) => {
    try {
        const result = await rideService.endRide(req.user, req.body);
        
        return res.status(200).json({
            success: true,
            message: "Ride completed successfully",
            data: result
        });
    } catch (error) {
        console.error("END RIDE CONTROLLER ERROR:", error);
        
        return res.status(error.status || 500).json({
            success: false,
            message: error.message
        });
    }
};

const getActiveRide = async (req, res) => {
    try {
        const ride = await rideService.getActiveRide(req.user.id);
        
        if (!ride) {
            return res.status(200).json({
                success: true,
                data: null,
                message: "No active ride at the moment"
            });
        }
        
        return res.status(200).json({
            success: true,
            data: ride,
            message: "Active ride found"
        });
    } catch (error) {
        console.error("GET ACTIVE RIDE ERROR:", error);
        
        return res.status(error.status || 500).json({
            success: false,
            message: error.message
        });
    }
};

const getUserRides = async (req, res) => {
    try {
        const { limit = 20 } = req.query;
        const rides = await rideService.getUserRides(req.user.id, parseInt(limit));
        
        return res.status(200).json({
            success: true,
            count: rides.length,
            data: rides,
            message: "Ride history fetched successfully"
        });
    } catch (error) {
        console.error("GET USER RIDES ERROR:", error);
        
        return res.status(error.status || 500).json({
            success: false,
            message: error.message
        });
    }
};

const getRideStats = async (req, res) => {
    try {
        const stats = await rideService.getRideStats(req.user.id);
        
        return res.status(200).json({
            success: true,
            data: stats,
            message: "Ride statistics fetched successfully"
        });
    } catch (error) {
        console.error("GET RIDE STATS ERROR:", error);
        
        return res.status(error.status || 500).json({
            success: false,
            message: error.message
        });
    }
};

const cancelRide = async (req, res) => {
    try {
        const result = await rideService.cancelRide(req.user.id);
        
        return res.status(200).json({
            success: true,
            message: result.message,
            data: { ride_id: result.ride_id }
        });
    } catch (error) {
        console.error("CANCEL RIDE ERROR:", error);
        
        return res.status(error.status || 500).json({
            success: false,
            message: error.message
        });
    }
};

const findNearbyVehicles = async (req, res) => {
    try {
        const { latitude, longitude, vehicle_type, radius } = req.query;
        
        const vehicles = await rideService.findNearbyVehicles(
            latitude,
            longitude,
            vehicle_type,
            radius ? parseFloat(radius) : 1
        );
        
        return res.status(200).json({
            success: true,
            count: vehicles.length,
            data: vehicles,
            message: "Nearby vehicles fetched successfully"
        });
    } catch (error) {
        console.error("FIND NEARBY VEHICLES ERROR:", error);
        
        return res.status(error.status || 500).json({
            success: false,
            message: error.message
        });
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