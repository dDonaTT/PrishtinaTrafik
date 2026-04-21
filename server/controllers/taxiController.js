const db = require("../config/db");
const { v4: uuidv4 } = require("uuid");
const axios = require("axios");

const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN;

const calculateRealETA = async (startLat, startLng, endLat, endLng) => {
  try {
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${startLng},${startLat};${endLng},${endLat}`;
    
    const response = await axios.get(url, {
      params: {
        access_token: MAPBOX_TOKEN,
        alternatives: false,
        geometries: "geojson",
        overview: "simplified",
        steps: false,
        annotations: "duration,distance",
      },
    });

    if (response.data.routes && response.data.routes.length > 0) {
      const route = response.data.routes[0];
      const durationSeconds = route.duration;
      const durationMinutes = Math.ceil(durationSeconds / 60);
      const distanceKm = (route.distance / 1000).toFixed(2);
      
      return {
        eta_minutes: durationMinutes,
        eta_seconds: durationSeconds,
        distance_km: distanceKm,
        is_estimate: false
      };
    }
    
    return null;
  } catch (error) {
    console.error("Mapbox ETA error:", error.message);
    return null;
  }
};

const orderTaxi = async (req, res) => {
  try {
    const { 
      pickup_lat, pickup_lng, pickup_address, 
      destination_lat, destination_lng, destination_address 
    } = req.body;
    const user_id = req.user.id;

    if (!pickup_lat || !pickup_lng) {
      return res.status(400).json({ message: "Pickup location is required" });
    }

    const [nearestTaxi] = await db.query(`
      SELECT *, 
        (6371 * acos(
          cos(radians(?)) * cos(radians(latitude)) * 
          cos(radians(longitude) - radians(?)) + 
          sin(radians(?)) * sin(radians(latitude))
        )) AS distance
      FROM vehicle_locations
      WHERE vehicle_type = 'taxi' AND taxi_status = 'available' AND is_available = 1
      ORDER BY distance ASC
      LIMIT 1
    `, [pickup_lat, pickup_lng, pickup_lat]);

    if (nearestTaxi.length === 0) {
      return res.status(404).json({ message: "No taxi available at the moment" });
    }

    const taxi = nearestTaxi[0];
    
    let estimatedETA = 5; // Default 5 minuta
    let distanceToPickup = null;
    
    if (destination_lat && destination_lng) {
      const etaResult = await calculateRealETA(
        pickup_lat, pickup_lng, 
        destination_lat, destination_lng
      );
      if (etaResult) {
        estimatedETA = etaResult.eta_minutes;
        distanceToPickup = etaResult.distance_km;
      }
    } else {
      const taxiLat = parseFloat(taxi.latitude);
      const taxiLng = parseFloat(taxi.longitude);
      const etaToPickup = await calculateRealETA(taxiLat, taxiLng, pickup_lat, pickup_lng);
      if (etaToPickup) {
        estimatedETA = etaToPickup.eta_minutes;
        distanceToPickup = etaToPickup.distance_km;
      }
    }

    const orderId = uuidv4();
    
    await db.query(`
      INSERT INTO taxi_orders (
        order_id, user_id, taxi_id, pickup_lat, pickup_lng, pickup_address,
        destination_lat, destination_lng, destination_address, status, estimated_eta, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, NOW())
    `, [orderId, user_id, taxi.id, pickup_lat, pickup_lng, pickup_address,
       destination_lat, destination_lng, destination_address, estimatedETA]);

    await db.query(`
      UPDATE vehicle_locations SET taxi_status = 'busy' WHERE id = ?
    `, [taxi.id]);

    res.json({
      success: true,
      order_id: orderId,
      taxi: {
        id: taxi.id,
        vehicle_id: taxi.vehicle_id,
        driver_name: taxi.driver_name || 'Taxi Driver',
        car_model: taxi.car_model || 'Standard',
        license_plate: taxi.license_plate || 'XX-000-XX',
        eta_minutes: estimatedETA,
        distance_km: distanceToPickup
      },
      message: `Taxi ordered successfully! ETA: ${estimatedETA} minutes`
    });

  } catch (error) {
    console.error("Order taxi error:", error);
    res.status(500).json({ message: error.message });
  }
};

const getOrderStatus = async (req, res) => {
  try {
    const { order_id } = req.params;
    const [order] = await db.query(`
      SELECT o.*, t.vehicle_id, t.driver_name, t.car_model, t.license_plate,
             t.latitude as taxi_lat, t.longitude as taxi_lng
      FROM taxi_orders o
      JOIN vehicle_locations t ON o.taxi_id = t.id
      WHERE o.order_id = ? AND o.user_id = ?
    `, [order_id, req.user.id]);

    if (order.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order[0].status === 'accepted' && order[0].destination_lat) {
      const updatedETA = await calculateRealETA(
        order[0].taxi_lat, order[0].taxi_lng,
        order[0].destination_lat, order[0].destination_lng
      );
      if (updatedETA) {
        order[0].current_eta = updatedETA.eta_minutes;
      }
    }

    res.json(order[0]);
  } catch (error) {
    console.error("Get order status error:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { orderTaxi, getOrderStatus };