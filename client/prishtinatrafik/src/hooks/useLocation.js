// client/src/hooks/useLocation.js
import { useState, useEffect, useCallback } from 'react';

const DEFAULT_LOCATION = { lat: 42.6629, lng: 21.1655 };

export const useLocation = () => {
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getCurrentLocation = useCallback(() => {
    setLoading(true);
    
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      setLocation(DEFAULT_LOCATION);
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLoading(false);
      },
      (err) => {
        console.error('Geolocation error:', err);
        setError('Unable to get location');
        setLocation(DEFAULT_LOCATION);
        setLoading(false);
      }
    );
  }, []);

  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  return { location, loading, error, getCurrentLocation };
};