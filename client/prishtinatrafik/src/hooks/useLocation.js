import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const TEST_LOCATION = { lat: 42.6629, lng: 21.1655 }; 

const PRISHTINA_BOUNDS = {
  minLat: 42.63,
  maxLat: 42.68,
  minLng: 21.14,
  maxLng: 21.19
};

const isInPrishtina = (lat, lng) => {
  return lat >= PRISHTINA_BOUNDS.minLat && 
         lat <= PRISHTINA_BOUNDS.maxLat && 
         lng >= PRISHTINA_BOUNDS.minLng && 
         lng <= PRISHTINA_BOUNDS.maxLng;
};

export const useLocation = () => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isTestMode, setIsTestMode] = useState(false);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    setLoading(true);
    if (!navigator.geolocation) {
      setError('Geolocation is not supported');
      setLocation(TEST_LOCATION);
      setIsTestMode(true);
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        
        if (isInPrishtina(userLat, userLng)) {
          console.log('📍 User in Prishtina, using real location');
          setLocation({ lat: userLat, lng: userLng });
          setIsTestMode(false);
        } else {
          console.log('🔧 User outside Prishtina, using test location');
          setLocation(TEST_LOCATION);
          setIsTestMode(true);
          toast('App is available only in Prishtina. Showing Prishtina map.', { 
            icon: '📍',
            duration: 3000
          });
        }
        setLoading(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        let errorMessage = 'Unable to get location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Please enable location access';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        setError(errorMessage);
        toast.error(errorMessage);
        setLocation(TEST_LOCATION);
        setIsTestMode(true);
        setLoading(false);
      }
    );
  };

  return { location, loading, error, getCurrentLocation, isTestMode };
};