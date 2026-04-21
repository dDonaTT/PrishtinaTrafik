// client/src/pages/Driver/DriverDashboard.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import {
  Car,
  MapPin,
  Clock,
  DollarSign,
  User,
  Navigation,
  CheckCircle,
  XCircle,
} from "lucide-react";
import API from "../../services/api";
import toast from "react-hot-toast";

export default function DriverDashboard() {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(false);
  const [nearbyOrders, setNearbyOrders] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);

  // Merr lokacionin
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (pos) => {
          const newLocation = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setLocation(newLocation);
          if (isOnline) {
            API.post("/driver/update-location", newLocation).catch((err) =>
              console.error("Location update failed:", err),
            );
          }
        },
        (err) => console.error("Geolocation error:", err),
        { enableHighAccuracy: true },
      );
    }
  }, [isOnline]);

  // Ngarko porositë afër
  const loadNearbyOrders = async () => {
    if (!isOnline) return;
    try {
      const response = await API.get("/driver/nearby-orders");
      setNearbyOrders(response.data || []);
    } catch (error) {
      console.error("Error loading orders:", error);
    }
  };

  useEffect(() => {
    if (isOnline) {
      loadNearbyOrders();
      const interval = setInterval(loadNearbyOrders, 10000);
      return () => clearInterval(interval);
    }
  }, [isOnline]);

  // Ngarko statistikat
  const loadStats = async () => {
    try {
      const response = await API.get("/driver/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Error loading stats:", error);
      setStats({ total_trips: 0, total_revenue: 0, avg_rating: 5.0 });
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  // Ndrysho statusin online/offline
  const toggleOnline = async () => {
    setLoading(true);
    try {
      await API.post("/driver/toggle-online", { is_online: !isOnline });
      setIsOnline(!isOnline);
      toast.success(isOnline ? "You are now offline" : "You are now online");
    } catch (error) {
      toast.error("Failed to change status", error);
    } finally {
      setLoading(false);
    }
  };

  // Pranimi i porosisë
  const acceptOrder = async (order) => {
    setLoading(true);
    try {
      await API.post("/driver/accept-order", { order_id: order.order_id });
      setActiveOrder(order);
      setNearbyOrders([]);
      toast.success("Order accepted!");
    } catch (error) {
      toast.error("Failed to accept order", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Status Card */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Welcome, {user?.fullname}!
            </h2>
            <p className="text-gray-500">
              Vehicle: {user?.vehicle_id || "Not assigned"}
            </p>
          </div>
          <button
            onClick={toggleOnline}
            disabled={loading}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              isOnline
                ? "bg-green-500 hover:bg-green-600 text-white"
                : "bg-gray-500 hover:bg-gray-600 text-white"
            }`}
          >
            {isOnline ? "🟢 Online" : "⚫ Offline"}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Trips</p>
                <p className="text-3xl font-bold">{stats.total_trips}</p>
              </div>
              <Car className="w-10 h-10 text-blue-500 opacity-50" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Revenue</p>
                <p className="text-3xl font-bold">
                  €{stats.total_revenue?.toFixed(2) || "0"}
                </p>
              </div>
              <DollarSign className="w-10 h-10 text-green-500 opacity-50" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Rating</p>
                <p className="text-3xl font-bold">{stats.avg_rating} ★</p>
              </div>
              <User className="w-10 h-10 text-yellow-500 opacity-50" />
            </div>
          </div>
        </div>
      )}

      {/* Active Order */}
      {activeOrder && (
        <div className="bg-yellow-50 border-2 border-yellow-500 rounded-xl p-6 mb-6">
          <h2 className="font-bold text-lg mb-3">Active Order</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-green-600" />
              <span>Pickup: {activeOrder.pickup_address}</span>
            </div>
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-red-600" />
              <span>Destination: {activeOrder.destination_address}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-600" />
              <span>ETA: {activeOrder.estimated_eta} min</span>
            </div>
          </div>
        </div>
      )}

      {/* Nearby Orders */}
      {isOnline && !activeOrder && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-bold text-lg mb-4">Nearby Orders</h2>
          {nearbyOrders.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No orders nearby. Waiting for requests...
            </p>
          ) : (
            <div className="space-y-3">
              {nearbyOrders.map((order) => (
                <div
                  key={order.order_id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">
                        Order #{order.order_id?.slice(0, 8)}
                      </p>
                      <p className="text-sm text-gray-500">
                        Distance: {order.distance?.toFixed(1)} km
                      </p>
                      <p className="text-sm text-gray-500">
                        ETA: {order.estimated_eta} min
                      </p>
                    </div>
                    <button
                      onClick={() => acceptOrder(order)}
                      disabled={loading}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-1"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Accept
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
