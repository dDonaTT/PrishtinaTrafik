import React, { useState } from "react";
import { useInspector } from "../../hooks/useInspector";
import {
  Shield,
  QrCode,
  CheckCircle,
  XCircle,
  Clock,
  History,
  Bike,
  Loader,
  Scan,
} from "lucide-react";

export default function InspectorDashboard() {
  const { stats, activeRides, history, loading, verifying, verifyTicket } =
    useInspector();
  const [scanInput, setScanInput] = useState("");
  const [lastResult, setLastResult] = useState(null);

  const handleVerify = async () => {
    if (!scanInput.trim()) return;

    const result = await verifyTicket(scanInput.trim());
    setLastResult(result);
    if (result.valid) {
      setScanInput("");
      setTimeout(() => setLastResult(null), 5000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Paneli i Inspektorit
            </h1>
          </div>
          <p className="text-gray-500">
            Verifikimi i biletave dhe monitorimi i udhëtimeve
          </p>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <StatCard
              icon={<CheckCircle className="w-5 h-5 text-green-600" />}
              label="Verifikuar sot"
              value={stats.today_verified || 0}
              color="green"
            />
            <StatCard
              icon={<History className="w-5 h-5 text-blue-600" />}
              label="Total verifikime"
              value={stats.total_verified || 0}
              color="blue"
            />
            <StatCard
              icon={<Bike className="w-5 h-5 text-orange-600" />}
              label="Udhëtime aktive"
              value={activeRides.length}
              color="orange"
            />
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Scan className="w-5 h-5 text-blue-600" />
            Verifikimi i biletave
          </h2>

          <div className="flex gap-3">
            <input
              type="text"
              value={scanInput}
              onChange={(e) => setScanInput(e.target.value)}
              placeholder="Skano QR kod ose vendos ID të biletës"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => e.key === "Enter" && handleVerify()}
            />
            <button
              onClick={handleVerify}
              disabled={verifying || !scanInput.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
            >
              {verifying ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <QrCode className="w-4 h-4" />
              )}
              Verifiko
            </button>
          </div>

          {lastResult && (
            <div
              className={`mt-4 p-4 rounded-lg flex items-center gap-3 ${
                lastResult.valid
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {lastResult.valid ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <XCircle className="w-5 h-5" />
              )}
              <div>
                <p className="font-medium">{lastResult.message}</p>
                {lastResult.data && (
                  <p className="text-sm mt-1">
                    Përdoruesi: {lastResult.data.user_name} | Lloji:{" "}
                    {lastResult.data.vehicle_type}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Bike className="w-5 h-5 text-green-600" />
            Udhëtime Aktive
          </h2>

          {loading ? (
            <div className="text-center py-8">
              <Loader className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
            </div>
          ) : activeRides.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Nuk ka udhëtime aktive
            </p>
          ) : (
            <div className="space-y-3">
              {activeRides.map((ride) => (
                <ActiveRideCard key={ride.id} ride={ride} />
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <History className="w-5 h-5 text-purple-600" />
            Historiku i Verifikimeve
          </h2>

          {loading ? (
            <div className="text-center py-8">
              <Loader className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
            </div>
          ) : history.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Nuk ka verifikime ende
            </p>
          ) : (
            <div className="space-y-2">
              {history.slice(0, 10).map((item) => (
                <VerificationItem key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const StatCard = ({ icon, label, value, color }) => {
  const colors = {
    green: "bg-green-50",
    blue: "bg-blue-50",
    orange: "bg-orange-50",
  };

  return (
    <div className={`${colors[color]} rounded-xl p-4`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        {icon}
      </div>
    </div>
  );
};

const ActiveRideCard = ({ ride }) => {
  const startTime = new Date(ride.start_time);
  const now = new Date();
  const minutes = Math.floor((now - startTime) / 60000);

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
          <Bike className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <p className="font-medium text-gray-900">{ride.user_name}</p>
          <p className="text-sm text-gray-500">
            {ride.vehicle_type} - {ride.vehicle_id}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-600">{minutes} min</span>
      </div>
    </div>
  );
};

const VerificationItem = ({ item }) => {
  const date = new Date(item.used_at || item.created_at);

  return (
    <div className="flex items-center justify-between p-3 border-b border-gray-100">
      <div>
        <p className="font-medium text-gray-900 capitalize">
          {item.vehicle_type}
        </p>
        <p className="text-sm text-gray-500">
          {item.user_name || item.user_email}
        </p>
      </div>
      <div className="text-right">
        <p className="text-sm text-gray-600">€{item.cost}</p>
        <p className="text-xs text-gray-400">
          {date.toLocaleDateString("sq-AL")}
        </p>
      </div>
    </div>
  );
};
