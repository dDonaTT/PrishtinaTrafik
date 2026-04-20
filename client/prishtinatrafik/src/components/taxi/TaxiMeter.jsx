
import { useEffect, useState } from 'react';
import { MapPin, Clock, TrendingUp, DollarSign, Navigation, X, Target } from 'lucide-react';
import taxiService from '../../services/taxiService';
import toast from 'react-hot-toast';

export default function TaxiMeter({ ride, onEndRide, currentLocation, destination }) {
    const [fare, setFare] = useState(0);
    const [distance, setDistance] = useState(0);
    const [waitingTime, setWaitingTime] = useState(0);
    const [elapsedMinutes, setElapsedMinutes] = useState(0);
    const [loading, setLoading] = useState(false);
    const [eta, setEta] = useState(null);
    const [destinationSet, setDestinationSet] = useState(false);
    const [destinationCoords, setDestinationCoords] = useState(null);

    const calculateETA = async () => {
        if (!destinationCoords || !currentLocation) return;
        
        try {
            const response = await taxiService.getETA(
                currentLocation.lat,
                currentLocation.lng,
                destinationCoords.lat,
                destinationCoords.lng
            );
            
            if (response.success && response.data) {
                setEta(response.data);
            }
        } catch (error) {
            console.error('ETA calculation error:', error);
        }
    };

    useEffect(() => {
        if (destinationCoords && currentLocation) {
            calculateETA();
        }
    }, [destinationCoords, currentLocation]);

    useEffect(() => {
        if (!ride || !currentLocation) return;

        const fetchFare = async () => {
            try {
                const response = await taxiService.getCurrentFare(
                    ride.ride_id,
                    currentLocation.lat,
                    currentLocation.lng
                );
                
                if (response.success && response.data) {
                    setFare(response.data.current_fare);
                    setDistance(response.data.distance_km);
                    setWaitingTime(response.data.waiting_minutes);
                    setElapsedMinutes(response.data.elapsed_minutes);
                }
            } catch (error) {
                console.error('Error fetching fare:', error);
            }
        };

        fetchFare();
        
        const interval = setInterval(fetchFare, 10000);
        
        return () => clearInterval(interval);
    }, [ride, currentLocation]);

    const handleSetDestination = () => {
        setDestinationCoords({
            lat: 42.6600,
            lng: 21.1600
        });
        setDestinationSet(true);
        toast.success('Destinacioni u vendos!');
    };

    const handleEndRide = async () => {
        if (!confirm('A jeni i sigurt që dëshironi të përfundoni udhëtimin?')) return;
        
        setLoading(true);
        try {
            const result = await taxiService.endTaxiRide(ride.ride_id, {
                end_lat: destinationCoords?.lat || currentLocation.lat,
                end_lng: destinationCoords?.lng || currentLocation.lng,
                end_location: 'Destinacioni'
            });
            
            if (result.success) {
                toast.success(result.data.message);
                onEndRide(result.data);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gabim gjatë përfundimit të udhëtimit');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-24 left-4 right-4 md:bottom-6 md:left-auto md:right-6 md:w-80 z-20">
            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-2xl p-5 text-white shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                        <Navigation className="w-5 h-5" />
                        <span className="font-semibold">Taksimetri</span>
                    </div>
                    <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                        Në lëvizje
                    </span>
                </div>
                
                <div className="text-center mb-4">
                    <p className="text-sm opacity-80">Tarifa aktuale</p>
                    <p className="text-4xl md:text-5xl font-bold">€{fare.toFixed(2)}</p>
                </div>
                
                {/* Butoni për të vendosur destinacionin */}
                {!destinationSet ? (
                    <button
                        onClick={handleSetDestination}
                        className="w-full bg-white/20 hover:bg-white/30 text-white py-2 rounded-lg flex items-center justify-center gap-2 mb-4 transition-all"
                    >
                        <Target className="w-4 h-4" />
                        Vendos destinacionin
                    </button>
                ) : (
                    <div className="bg-white/10 rounded-lg p-3 mb-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Target className="w-4 h-4" />
                            <span className="text-sm font-semibold">ETA deri në destinacion</span>
                        </div>
                        {eta ? (
                            <div className="grid grid-cols-2 gap-2 text-center">
                                <div>
                                    <p className="text-xs opacity-80">Koha e mbetur</p>
                                    <p className="text-xl font-bold">{eta.eta_minutes} min</p>
                                </div>
                                <div>
                                    <p className="text-xs opacity-80">Distanca</p>
                                    <p className="text-xl font-bold">{eta.distance_km} km</p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                                <p className="text-xs mt-1">Duke llogaritur...</p>
                            </div>
                        )}
                    </div>
                )}
                
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-white/10 rounded-lg p-2 text-center">
                        <MapPin className="w-4 h-4 mx-auto mb-1" />
                        <p className="text-xs opacity-80">Distanca e përshkuar</p>
                        <p className="text-lg font-semibold">{distance} km</p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-2 text-center">
                        <Clock className="w-4 h-4 mx-auto mb-1" />
                        <p className="text-xs opacity-80">Kohëzgjatja</p>
                        <p className="text-lg font-semibold">{elapsedMinutes} min</p>
                    </div>
                </div>
                
                <div className="bg-white/10 rounded-lg p-2 mb-4">
                    <div className="flex justify-between text-xs">
                        <span>Tarifa e nisjes</span>
                        <span>€1.50</span>
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                        <span>Për km</span>
                        <span>€0.80</span>
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                        <span>Për minutë pritje</span>
                        <span>€0.20</span>
                    </div>
                    {waitingTime > 0 && (
                        <div className="flex justify-between text-xs mt-1 text-yellow-200">
                            <span>Pritje: {waitingTime} min</span>
                            <span>€{(waitingTime * 0.20).toFixed(2)}</span>
                        </div>
                    )}
                </div>
                
                <button
                    onClick={handleEndRide}
                    disabled={loading}
                    className="w-full bg-white text-yellow-600 font-bold py-2 rounded-lg hover:bg-gray-100 transition-all disabled:opacity-50"
                >
                    {loading ? 'Duke përfunduar...' : 'Përfundo udhëtimin'}
                </button>
            </div>
        </div>
    );
}