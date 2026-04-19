import React, { useState, useRef, useEffect } from "react";
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
  Camera,
  X,
} from "lucide-react";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function InspectorDashboard() {
  const { stats, activeRides, history, loading, verifying, verifyTicket } =
    useInspector();
  const [scanInput, setScanInput] = useState("");
  const [lastResult, setLastResult] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const scannerRef = useRef(null);

  const handleVerify = async () => {
    if (!scanInput.trim()) return;

    const result = await verifyTicket(scanInput.trim());
    setLastResult(result);
    if (result.valid) {
      setScanInput("");
      setTimeout(() => setLastResult(null), 5000);
    }
  };
  const onScanSuccess = (decodedText) => {
    console.log("Scanned raw data:", decodedText);

    setShowScanner(false);

    setTimeout(() => {
      verifyTicket(decodedText).then((res) => {
        setLastResult(res);
        if (res.valid) {
          setScanInput("");
          setTimeout(() => setLastResult(null), 5000);
        }
      });
    }, 500);
  };

  const onScanError = (err) => {
    console.error("QR Scan error:", err);
  };

  useEffect(() => {
    if (showScanner && !scannerRef.current) {
      const scanner = new Html5QrcodeScanner("qr-reader", {
        qrbox: { width: 250, height: 250 },
        fps: 5,
        aspectRatio: 1.0,
      });

      scanner.render(onScanSuccess, onScanError);
      scannerRef.current = scanner;
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
        scannerRef.current = null;
      }
    };
  }, [showScanner]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Paneli i Inspektorit
            </h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400">
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

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-600" />
            Verifikimi i biletave
          </h2>

          {!showScanner ? (
            <div className="space-y-4">
              <button
                onClick={() => setShowScanner(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg flex items-center justify-center gap-2 transition-all"
              >
                <Camera className="w-5 h-5" />
                Hap kamerën për skanim
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                    ose vendos manualisht
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <input
                  type="text"
                  value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                  placeholder="ID e biletës"
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
            </div>
          ) : (
            <div className="space-y-4">
              <div id="qr-reader" className="w-full max-w-md mx-auto"></div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowScanner(false)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Mbyll kamerën
                </button>
              </div>
            </div>
          )}

          {lastResult && (
            <div
              className={`mt-4 p-4 rounded-lg flex items-center gap-3 ${
                lastResult.valid
                  ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
                  : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"
              }`}
            >
              {lastResult.valid ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <div className="flex-1">
                <p className="font-medium">{lastResult.message}</p>
                {lastResult.data && (
                  <p className="text-sm mt-1">
                    Përdoruesi: {lastResult.data.user_name} | Lloji:{" "}
                    {lastResult.data.vehicle_type === "bus"
                      ? "🚌 Autobus"
                      : "🚕 Taksi"}
                  </p>
                )}
              </div>
              <button
                onClick={() => setLastResult(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Bike className="w-5 h-5 text-green-600" />
            Udhëtime Aktive
          </h2>

          {loading ? (
            <div className="text-center py-8">
              <Loader className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
            </div>
          ) : activeRides.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
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

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <History className="w-5 h-5 text-purple-600" />
            Historiku i Verifikimeve
          </h2>

          {loading ? (
            <div className="text-center py-8">
              <Loader className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
            </div>
          ) : history.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
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
    green: "bg-green-50 dark:bg-green-900/20",
    blue: "bg-blue-50 dark:bg-blue-900/20",
    orange: "bg-orange-50 dark:bg-orange-900/20",
  };

  return (
    <div className={`${colors[color]} rounded-xl p-4`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {value}
          </p>
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
    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <Bike className="w-5 h-5 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <p className="font-medium text-gray-900 dark:text-white">
            {ride.user_name}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {ride.vehicle_type} - {ride.vehicle_id}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {minutes} min
        </span>
      </div>
    </div>
  );
};

const VerificationItem = ({ item }) => {
  const date = new Date(item.used_at || item.created_at);

  return (
    <div className="flex items-center justify-between p-3 border-b border-gray-100 dark:border-gray-700">
      <div>
        <p className="font-medium text-gray-900 dark:text-white capitalize">
          {item.vehicle_type}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {item.user_name || item.user_email}
        </p>
      </div>
      <div className="text-right">
        <p className="text-sm text-gray-600 dark:text-gray-400">€{item.cost}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          {date.toLocaleDateString("sq-AL")}
        </p>
      </div>
    </div>
  );
};
