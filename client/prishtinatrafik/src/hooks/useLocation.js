// client/src/hooks/useLocation.js
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

// Aktivizo mode test për Prishtinë
const TEST_MODE = true; // ← Vendose true për testim
const TEST_LOCATION = { lat: 42.6629, lng: 21.1655 }; // Prishtina

export const useLocation = () => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (TEST_MODE) {
      // Përdor lokacionin test pa pyetur për location
      console.log('🔧 TEST MODE: Using Prishtina location', TEST_LOCATION);
      setLocation(TEST_LOCATION);
      setLoading(false);
      return;
    }
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    setLoading(true);
    if (!navigator.geolocation) {
      setError('Geolocation is not supported');
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
      (error) => {
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
        // Default location (Prishtina)
        setLocation({ lat: 42.6629, lng: 21.1655 });
        setLoading(false);
      }
    );
  };

  return { location, loading, error, getCurrentLocation };
};












// -------------------------------------------------------

// import { useState, useEffect } from 'react';
// import toast from 'react-hot-toast';

// export const useLocation = () => {
//   const [location, setLocation] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     getCurrentLocation();
//   }, []);

//   const getCurrentLocation = () => {
//     setLoading(true);
//     if (!navigator.geolocation) {
//       setError('Geolocation is not supported');
//       setLoading(false);
//       return;
//     }

//     navigator.geolocation.getCurrentPosition(
//       (position) => {
//         setLocation({
//           lat: position.coords.latitude,
//           lng: position.coords.longitude
//         });
//         setLoading(false);
//       },
//       (error) => {
//         let errorMessage = 'Unable to get location';
//         switch (error.code) {
//           case error.PERMISSION_DENIED:
//             errorMessage = 'Please enable location access';
//             break;
//           case error.POSITION_UNAVAILABLE:
//             errorMessage = 'Location information unavailable';
//             break;
//           case error.TIMEOUT:
//             errorMessage = 'Location request timed out';
//             break;
//         }
//         setError(errorMessage);
//         toast.error(errorMessage);
//         setLocation({ lat: 42.6629, lng: 21.1655 });
//         setLoading(false);
//       }
//     );
//   };

//   return { location, loading, error, getCurrentLocation };
// };