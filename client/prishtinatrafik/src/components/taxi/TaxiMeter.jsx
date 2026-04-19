import React, { useState, useEffect } from 'react';
import { MapPin, Clock, TrendingUp, DollarSign, Navigation, X } from 'lucide-react';
import taxiService from '../../services/taxiService';
import toast from 'react-hot-toast';

export default function TaxiMeter({ ride, onEndRide, currentLocation }) {
    const [fare, setFare] = useState(0);
    const [distance, setDistance] = useState(0);
    const [waitingTime, setWaitingTime] = useState(0);
    const [elapsedMinutes, setElapsedMinutes] = useState(0);
    const [loading, setLoading] = useState(false);

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
        
        const interval = setInterval(fetchFare, 10000); // Çdo 10 sekonda
        
        return () => clearInterval(interval);
    }, [ride, currentLocation]);

    const handleEndRide = async () => {
        if (!confirm('A jeni i sigurt që dëshironi të përfundoni udhëtimin?')) return;
        
        setLoading(true);
        try {
            const result = await taxiService.endTaxiRide(ride.ride_id, {
                end_lat: currentLocation.lat,
                end_lng: currentLocation.lng,
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
                
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-white/10 rounded-lg p-2 text-center">
                        <MapPin className="w-4 h-4 mx-auto mb-1" />
                        <p className="text-xs opacity-80">Distanca</p>
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