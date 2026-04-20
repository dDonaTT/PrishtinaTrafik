const rideService = require("../services/rideService");
const etaService = require("../services/etaService");
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
          minimum_balance: "€1.00",
        },
      },
    });
  } catch (error) {
    console.error("START RIDE CONTROLLER ERROR:", error);

    return res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};

const endRide = async (req, res) => {
  try {
    const result = await rideService.endRide(req.user, req.body);

    return res.status(200).json({
      success: true,
      message: "Ride completed successfully",
      data: result,
    });
  } catch (error) {
    console.error("END RIDE CONTROLLER ERROR:", error);

    return res.status(error.status || 500).json({
      success: false,
      message: error.message,
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
        message: "No active ride at the moment",
      });
    }

    return res.status(200).json({
      success: true,
      data: ride,
      message: "Active ride found",
    });
  } catch (error) {
    console.error("GET ACTIVE RIDE ERROR:", error);

    return res.status(error.status || 500).json({
      success: false,
      message: error.message,
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
      message: "Ride history fetched successfully",
    });
  } catch (error) {
    console.error("GET USER RIDES ERROR:", error);

    return res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};

const getRideStats = async (req, res) => {
  try {
    const stats = await rideService.getRideStats(req.user.id);

    return res.status(200).json({
      success: true,
      data: stats,
      message: "Ride statistics fetched successfully",
    });
  } catch (error) {
    console.error("GET RIDE STATS ERROR:", error);

    return res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};

const cancelRide = async (req, res) => {
  try {
    const result = await rideService.cancelRide(req.user.id);

    return res.status(200).json({
      success: true,
      message: result.message,
      data: { ride_id: result.ride_id },
    });
  } catch (error) {
    console.error("CANCEL RIDE ERROR:", error);

    return res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllVehicles = async (req, res) => {
    try {
        const { vehicle_type } = req.query;
        
        const vehicles = await rideService.getAllVehicles(vehicle_type);
        
        return res.status(200).json({
            success: true,
            count: vehicles.length,
            data: vehicles,
            message: "Vehicles fetched successfully"
        });
    } catch (error) {
        console.error("GET ALL VEHICLES ERROR:", error);
        
        return res.status(error.status || 500).json({
            success: false,
            message: error.message
        });
    }
};

const startTaxiRide = async (req, res) => {
    try {
        const ride = await rideService.startTaxiRide(req.user, req.body);
        
        return res.status(201).json({
            success: true,
            message: "Taxi ride started successfully",
            data: ride
        });
    } catch (error) {
        console.error("START TAXI RIDE CONTROLLER ERROR:", error);
        return res.status(error.status || 500).json({
            success: false,
            message: error.message
        });
    }
};

const endTaxiRide = async (req, res) => {
    try {
        const result = await rideService.endTaxiRide(req.user, req.body);
        
        return res.status(200).json({
            success: true,
            message: "Taxi ride completed successfully",
            data: result
        });
    } catch (error) {
        console.error("END TAXI RIDE CONTROLLER ERROR:", error);
        return res.status(error.status || 500).json({
            success: false,
            message: error.message
        });
    }
};

const getCurrentTaxiFare = async (req, res) => {
    try {
        const { ride_id } = req.params;
        const { current_lat, current_lng } = req.query;
        
        const fare = await rideService.getCurrentTaxiFare(ride_id, parseFloat(current_lat), parseFloat(current_lng));
        
        if (!fare) {
            return res.status(404).json({
                success: false,
                message: "No active taxi ride found"
            });
        }
        
        return res.status(200).json({
            success: true,
            data: fare
        });
    } catch (error) {
        console.error("GET CURRENT TAXI FARE ERROR:", error);
        return res.status(error.status || 500).json({
            success: false,
            message: error.message
        });
    }
};

const updateTaxiLocation = async (req, res) => {
    try {
        const { ride_id } = req.params;
        const { current_lat, current_lng } = req.body;
        
        await rideService.updateTaxiLocation(ride_id, current_lat, current_lng);
        
        return res.status(200).json({
            success: true,
            message: "Location updated successfully"
        });
    } catch (error) {
        console.error("UPDATE TAXI LOCATION ERROR:", error);
        return res.status(error.status || 500).json({
            success: false,
            message: error.message
        });
    }
};
const getETA = async (req, res) => {
    try {
        const { start_lat, start_lng, end_lat, end_lng } = req.query;
        
        if (!start_lat || !start_lng || !end_lat || !end_lng) {
            return res.status(400).json({
                success: false,
                message: "Start and end coordinates are required"
            });
        }
        
        const eta = await etaService.calculateETA(
            parseFloat(start_lat),
            parseFloat(start_lng),
            parseFloat(end_lat),
            parseFloat(end_lng)
        );
        
        return res.status(200).json({
            success: true,
            data: eta
        });
    } catch (error) {
        console.error("GET ETA ERROR:", error);
        return res.status(500).json({
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
    getAllVehicles,
    startTaxiRide,
    endTaxiRide,
    getCurrentTaxiFare,
    updateTaxiLocation,
    getETA
};