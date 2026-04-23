import { useEffect, useState, useRef } from "react";
import { useAuth } from "../hooks/useAuth";
import { useLocation } from "../hooks/useLocation";
import { useVehicles } from "../hooks/useVehicles";
import { useTickets } from "../hooks/useTickets";
import { useRides } from "../hooks/useRides";
import { useBus } from "../hooks/useBus";
import { useTaxi } from "../hooks/useTaxi";
import MapView from "../components/map/MapView";
import VehicleFilters from "../components/map/VehicleFilters";
import BuyTicketModel from "../components/tickets/BuyTicketModel";
import QRCodeDisplay from "../components/tickets/QRCodeDisplay";
import BusRoutesPanel from "../components/bus/BusRoutesPanel";
import BusStopsLayer from "../components/bus/BusStopsLayer";
import StopRoutesModal from "../components/bus/StopRoutesModal";
import RouteDetailsModal from "../components/bus/RouteDetailsModal";
import OrderTaxiModal from "../components/taxi/OrderTaxiModal";
import { Bike, Bus, Car, Scooter, Navigation } from "lucide-react";
import taxiService from "../services/taxiService";
import toast from "react-hot-toast";

const TICKET_PRICES = {
  bus: 0.4,
  taxi: 2.5,
};

export default function Home({
  showRoutesPanel,
  setShowRoutesPanel,
  showBusStops,
  setShowBusStops,
}) {
  const { user } = useAuth();
  const {
    location,
    loading: locationLoading,
    getCurrentLocation,
  } = useLocation();
  const {
    vehicles,
    loading: vehiclesLoading,
    selectedType,
    setSelectedType,
    loadAllVehicles,
  } = useVehicles();
  const { buyTicket } = useTickets();
  const { startRide } = useRides();
  const { routes, allStops, loadNearbyStops } = useBus();
  const { orderTaxi, calculateETA } = useTaxi();
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [purchasedTicket, setPurchasedTicket] = useState(null);
  const [showStartRideConfirm, setShowStartRideConfirm] = useState(false);
  const [mapInstance, setMapInstance] = useState(null);
  const [selectedStop, setSelectedStop] = useState(null);
  const [showStopRoutesModal, setShowStopRoutesModal] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [showRouteDetailsModal, setShowRouteDetailsModal] = useState(false);
  const [showOrderTaxiModal, setShowOrderTaxiModal] = useState(false);
  const [selectedTaxi, setSelectedTaxi] = useState(null);

  useEffect(() => {
    loadAllVehicles(selectedType);
  }, [selectedType, loadAllVehicles]);

  useEffect(() => {
    if (location) {
      loadNearbyStops(location.lat, location.lng, 2);
    }
  }, [location, loadNearbyStops]);

  const handleVehicleClick = (vehicle, action) => {
    setSelectedVehicle(vehicle);
    setActionType(action);

    if (action === "buy") {
      setShowBuyModal(true);
    } else if (action === "ride") {
      setShowStartRideConfirm(true);
    }
    if (action === "order") {
      setSelectedTaxi(vehicle);
      setShowOrderTaxiModal(true);
    }
  };

  const handleBuyTicket = async (ticketData) => {
    const result = await buyTicket(ticketData);
    if (result) {
      setPurchasedTicket(result);
      setShowBuyModal(false);
      setShowQRModal(true);
    }
  };

  const handleStartRide = async () => {
    if (!selectedVehicle) return;

    if (selectedVehicle.vehicle_type === "taxi") {
      if (!location) {
        toast.error("Ju lutem aktivizoni lokacionin");
        return;
      }

      try {
        const response = await taxiService.startTaxiRide({
          start_lat: location.lat,
          start_lng: location.lng,
          start_location: `Pozita: ${location.lat}, ${location.lng}`,
        });

        if (response.success) {
          toast.success("Udhëtimi me taksi filloi!");
          setShowStartRideConfirm(false);
          setSelectedVehicle(null);
          window.location.href = "/rides";
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Gabim gjatë fillimit të udhëtimit",
        );
      }
      return;
    }

    if (selectedVehicle.vehicle_type === "bus") {
      setShowBuyModal(true);
      setShowStartRideConfirm(false);
      return;
    }

    if (
      selectedVehicle.vehicle_type === "bike" ||
      selectedVehicle.vehicle_type === "scooter"
    ) {
      await startRide(
        selectedVehicle.vehicle_id,
        selectedVehicle.vehicle_type,
        `Pozita: ${location?.lat}, ${location?.lng}`,
      );
      setShowStartRideConfirm(false);
      setSelectedVehicle(null);
      return;
    }
  };

  const vehicleCounts = {
    bus: vehicles.buses?.length || 0,
    taxi: vehicles.taxis?.length || 0,
    bike: vehicles.bikes?.length || 0,
    scooter: vehicles.scooters?.length || 0,
  };

  const totalVehicles =
    vehicleCounts.bus +
    vehicleCounts.taxi +
    vehicleCounts.bike +
    vehicleCounts.scooter;

  if (locationLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Duke kërkuar vendndodhjen...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden pb-28 md:pb-0">
      {location && (
        <MapView
          vehicles={vehicles}
          selectedType={selectedType}
          center={location}
          zoom={14}
          onVehicleClick={handleVehicleClick}
          onMapLoad={(map) => {
            console.log("Map loaded:", map);
            setMapInstance(map);
          }}
        />
      )}

      <button
        onClick={getCurrentLocation}
        className="absolute top-4 right-4 z-20 bg-white dark:bg-gray-800 rounded-full p-2 md:p-3 shadow-md"
      >
        <Navigation className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
      </button>

      <div className="absolute bottom-36 left-4 z-20 hidden md:flex md:flex-col md:gap-3">
        <button
          onClick={() => setShowRoutesPanel(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all"
          title="Linjat e autobusit"
        >
          <Bus className="w-5 h-5" />
        </button>
        <button
          onClick={() => setShowBusStops(!showBusStops)}
          className={`p-3 rounded-full shadow-lg transition-all ${
            showBusStops
              ? "bg-green-600 text-white"
              : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
          }`}
          title="Stacionet e autobusit"
        >
          🚏
        </button>
      </div>

      <VehicleFilters
        selectedType={selectedType}
        onSelectType={setSelectedType}
      />

      <div className="absolute bottom-35 left-3 right-3 z-20 md:bottom-6 md:left-auto md:right-6 md:w-80">
        <div className="block md:hidden">
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-xl shadow-lg border border-white/20 dark:border-gray-700/50">
            <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  📍 Mjetet pranë teje
                </span>
                {vehiclesLoading && (
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                )}
              </div>
            </div>
            <div className="flex justify-around p-2">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <Bus className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-sm font-bold text-gray-800 dark:text-white mt-0.5">
                  {vehicleCounts.bus}
                </span>
                <span className="text-[8px] text-gray-400">Bus</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                  <Car className="w-4 h-4 text-yellow-600" />
                </div>
                <span className="text-sm font-bold text-gray-800 dark:text-white mt-0.5">
                  {vehicleCounts.taxi}
                </span>
                <span className="text-[8px] text-gray-400">Taxi</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <Bike className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-sm font-bold text-gray-800 dark:text-white mt-0.5">
                  {vehicleCounts.bike}
                </span>
                <span className="text-[8px] text-gray-400">Bike</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                  <Scooter className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-sm font-bold text-gray-800 dark:text-white mt-0.5">
                  {vehicleCounts.scooter}
                </span>
                <span className="text-[8px] text-gray-400">Scoot</span>
              </div>
            </div>
            <div className="px-3 py-1.5 border-t border-gray-100 dark:border-gray-800">
              <p className="text-[9px] text-center text-gray-400">
                Total: {totalVehicles} mjete
              </p>
            </div>
          </div>
        </div>

        <div className="hidden md:block">
          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/50 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-gray-800 dark:text-white">
                    Mjetet pranë teje
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {totalVehicles} mjete të disponueshme
                  </p>
                </div>
                {vehiclesLoading && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-gray-400">
                      Duke ngarkuar...
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl p-3 text-center">
                  <div className="flex justify-center mb-2">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <Bus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-gray-800 dark:text-white">
                    {vehicleCounts.bus}
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Autobusë
                  </p>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/30 rounded-xl p-3 text-center">
                  <div className="flex justify-center mb-2">
                    <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
                      <Car className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-gray-800 dark:text-white">
                    {vehicleCounts.taxi}
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Taksi
                  </p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-xl p-3 text-center">
                  <div className="flex justify-center mb-2">
                    <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                      <Bike className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-gray-800 dark:text-white">
                    {vehicleCounts.bike}
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Biçikleta
                  </p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl p-3 text-center">
                  <div className="flex justify-center mb-2">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                      <Scooter className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-gray-800 dark:text-white">
                    {vehicleCounts.scooter}
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Scooter
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BuyTicketModel
        isOpen={showBuyModal}
        onClose={() => {
          setShowBuyModal(false);
          setSelectedVehicle(null);
        }}
        onBuy={handleBuyTicket}
        prices={TICKET_PRICES}
        preselectedVehicle={selectedVehicle}
      />

      {showQRModal && purchasedTicket && (
        <QRCodeDisplay
          ticket={purchasedTicket}
          onClose={() => {
            setShowQRModal(false);
            setPurchasedTicket(null);
          }}
        />
      )}

      {showStartRideConfirm && selectedVehicle && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6">
            <div className="text-center mb-4">
              <div className="text-5xl mb-3">
                {selectedVehicle.vehicle_type === "bike" && "🚲"}
                {selectedVehicle.vehicle_type === "scooter" && "🛴"}
                {selectedVehicle.vehicle_type === "bus" && "🚌"}
                {selectedVehicle.vehicle_type === "taxi" && "🚕"}
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {selectedVehicle.vehicle_type === "bike" && "Biçikletë"}
                {selectedVehicle.vehicle_type === "scooter" && "Scooter"}
                {selectedVehicle.vehicle_type === "bus" && "Autobus"}
                {selectedVehicle.vehicle_type === "taxi" && "Taksi"}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                ID: {selectedVehicle.vehicle_id}
              </p>
            </div>

            {selectedVehicle.vehicle_type === "bike" ||
            selectedVehicle.vehicle_type === "scooter" ? (
              <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4 mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600 dark:text-gray-300">
                    Çmimi për minutë:
                  </span>
                  <span className="font-semibold">
                    €{selectedVehicle.vehicle_type === "bike" ? "0.05" : "0.03"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">
                    Minimumi:
                  </span>
                  <span className="font-semibold">€1.00</span>
                </div>
              </div>
            ) : selectedVehicle.vehicle_type === "taxi" ? (
              <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4 mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600 dark:text-gray-300">
                    Tarifa e nisjes:
                  </span>
                  <span className="font-semibold">€1.50</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600 dark:text-gray-300">
                    Për km:
                  </span>
                  <span className="font-semibold">€0.80</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">
                    Për minutë pritje:
                  </span>
                  <span className="font-semibold">€0.20</span>
                </div>
              </div>
            ) : (
              <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">
                    Çmimi:
                  </span>
                  <span className="font-semibold">
                    €{selectedVehicle.vehicle_type === "bus" ? "0.40" : "2.50"}
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowStartRideConfirm(false);
                  setSelectedVehicle(null);
                }}
                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white py-2 rounded-lg"
              >
                Anulo
              </button>
              <button
                onClick={handleStartRide}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg flex items-center justify-center gap-2"
              >
                {selectedVehicle.vehicle_type === "bike" ||
                selectedVehicle.vehicle_type === "scooter"
                  ? "🚲 Fillo"
                  : selectedVehicle.vehicle_type === "taxi"
                    ? "🚕 Fillo"
                    : "🎫 Bli tani"}
              </button>
            </div>
          </div>
        </div>
      )}
      {showOrderTaxiModal && selectedTaxi && location && (
        <OrderTaxiModal
          taxi={selectedTaxi}
          location={location}
          isOpen={showOrderTaxiModal}
          onClose={() => {
            setShowOrderTaxiModal(false);
            setSelectedTaxi(null);
          }}
          onOrderSuccess={(order) => {
            console.log("Order placed:", order);
            toast.success(
              `Taxi ordered! ETA: ${order.taxi.eta_minutes} minutes`,
            );
          }}
        />
      )}

      {showRoutesPanel && (
        <div className="absolute inset-0 z-30 bg-black/50 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <BusRoutesPanel
              routes={routes}
              onSelectRoute={(route) => {
                console.log("Selected route:", route);
                setShowRoutesPanel(false);
                // Në vend të toast, hap një modal me detajet e linjës
                setSelectedRoute(route);
                setShowRouteDetailsModal(true);
              }}
              onClose={() => setShowRoutesPanel(false)}
            />
          </div>
        </div>
      )}
      {showRouteDetailsModal && selectedRoute && (
        <RouteDetailsModal
          route={selectedRoute}
          onClose={() => {
            setShowRouteDetailsModal(false);
            setSelectedRoute(null);
          }}
        />
      )}

      {location && showBusStops && mapInstance && (
        <BusStopsLayer
          map={mapInstance}
          stops={allStops}
          onStopClick={(stop) => {
            setSelectedStop(stop);
            setShowStopRoutesModal(true);
          }}
        />
      )}
      {showStopRoutesModal && selectedStop && (
        <StopRoutesModal
          stop={selectedStop}
          onClose={() => {
            setShowStopRoutesModal(false);
            setSelectedStop(null);
          }}
        />
      )}
    </div>
  );
}
