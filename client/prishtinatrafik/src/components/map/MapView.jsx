import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const getVehicleIcon = (type) => {
  const icons = { bus: "🚌", taxi: "🚕", bike: "🚲", scooter: "🛴" };
  return icons[type] || "📍";
};

const getVehicleColor = (type) => {
  const colors = {
    bus: "#3B82F6",
    taxi: "#F59E0B",
    bike: "#10B981",
    scooter: "#8B5CF6",
  };
  return colors[type] || "#6B7280";
};

const getTaxiStatusIcon = (status) => {
  switch(status) {
    case 'available': return '🟢';
    case 'busy': return '🔴';
    case 'en_route': return '🟡';
    default: return '⚪';
  }
};

const getTaxiStatusText = (status) => {
  switch(status) {
    case 'available': return 'I lirë';
    case 'busy': return 'I zënë';
    case 'en_route': return 'Në rrugë';
    default: return 'I panjohur';
  }
};

const MapView = ({
  vehicles = {},
  selectedType,
  center,
  zoom = 13,
  onVehicleClick,
  onMapLoad,  
}) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markers = useRef([]);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  useEffect(() => {
    const token = import.meta.env.VITE_MAPBOX_TOKEN;
    if (!token || !mapContainer.current) return;

    mapboxgl.accessToken = token;

    if (!map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [center.lng, center.lat],
        zoom: zoom,
      });

      map.current.on("load", () => {
        setIsMapLoaded(true);
        map.current.resize();
        if (onMapLoad) {
          onMapLoad(map.current);
        }
      });

      map.current.addControl(new mapboxgl.NavigationControl(), "top-right");
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (map.current && onMapLoad && isMapLoaded) {
      onMapLoad(map.current);
    }
  }, [isMapLoaded, onMapLoad]);

  useEffect(() => {
    if (!map.current || !isMapLoaded) return;

    markers.current.forEach((m) => m.remove());
    markers.current = [];

    let vehiclesToShow = [];

    if (selectedType && selectedType !== "all") {
      const typeMap = {
        bus: vehicles.buses || [],
        taxi: vehicles.taxis || [],
        bike: vehicles.bikes || [],
        scooter: vehicles.scooters || [],
      };
      vehiclesToShow = typeMap[selectedType] || [];
    } else {
      vehiclesToShow = [
        ...(vehicles.buses || []),
        ...(vehicles.taxis || []),
        ...(vehicles.bikes || []),
        ...(vehicles.scooters || []),
      ];
    }

    vehiclesToShow.forEach((vehicle) => {
      const lng = parseFloat(vehicle.longitude);
      const lat = parseFloat(vehicle.latitude);

      if (isNaN(lng) || isNaN(lat)) return;

      const el = document.createElement("div");
      el.className = "custom-marker cursor-pointer";
      
      const isBusOrTaxi = vehicle.vehicle_type === 'bus' || vehicle.vehicle_type === 'taxi';
      const markerSize = isBusOrTaxi ? '52px' : '42px';
      const iconSize = isBusOrTaxi ? '28px' : '22px';
      
      el.innerHTML = `
        <div style="
          background: white; 
          width: ${markerSize}; height: ${markerSize}; 
          border-radius: 50%; 
          display: flex; align-items: center; justify-content: center; 
          font-size: ${iconSize}; 
          box-shadow: 0 3px 12px rgba(0,0,0,0.2);
          border: 3px solid ${getVehicleColor(vehicle.vehicle_type)};
          transition: transform 0.2s ease;
          cursor: pointer;
        " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
          ${getVehicleIcon(vehicle.vehicle_type)}
        </div>
      `;

      const isTicketVehicle = vehicle.vehicle_type === 'bus';
      const isTaxiVehicle = vehicle.vehicle_type === 'taxi';
      const isRideVehicle = vehicle.vehicle_type === 'bike' || vehicle.vehicle_type === 'scooter';
      
      let buttonAction = 'ride';
      let buttonText = '🚲 Fillo udhëtimin';
      let buttonColor = '#10b981';
      
      if (isTicketVehicle) {
        buttonAction = 'buy';
        buttonText = '🎫 Bli biletë';
        buttonColor = '#2563eb';
      } else if (isTaxiVehicle) {
        buttonAction = 'order';
        buttonText = '🚕 Porosit Taxi';
        buttonColor = '#f59e0b';
      } else if (isRideVehicle) {
        buttonAction = 'ride';
        buttonText = '🚲 Fillo udhëtimin';
        buttonColor = '#10b981';
      }
      
      let vehicleTitle = '';
      if (vehicle.vehicle_type === 'bus') vehicleTitle = '🚌 Autobus';
      else if (vehicle.vehicle_type === 'taxi') vehicleTitle = '🚕 Taksi';
      else if (vehicle.vehicle_type === 'bike') vehicleTitle = '🚲 Biçikletë';
      else if (vehicle.vehicle_type === 'scooter') vehicleTitle = '🛴 Scooter';
      else vehicleTitle = vehicle.vehicle_type;
      
      let popupHTML = `
        <div style="padding: 12px; text-align: center; font-family: sans-serif; min-width: 180px;">
          <h4 style="margin: 0; color: #1f2937; text-transform: capitalize; font-size: 16px; font-weight: bold;">
            ${vehicleTitle}
          </h4>
          <p style="margin: 5px 0; font-size: 12px; color: #6b7280;">ID: ${vehicle.vehicle_id}</p>
      `;
      
      if (vehicle.route_name) {
        popupHTML += `<p style="margin: 5px 0; font-size: 12px; color: #6b7280;">📍 ${vehicle.route_name}</p>`;
      }
      
      if (vehicle.battery_level) {
        popupHTML += `<p style="margin: 5px 0; font-size: 12px;">🔋 ${vehicle.battery_level}%</p>`;
      }
      
      if (isTicketVehicle) {
        popupHTML += `
          <div style="margin: 10px 0; padding: 8px; background: #f3f4f6; border-radius: 8px;">
            <p style="margin: 0; font-size: 14px; font-weight: bold; color: #1f2937;">Çmimi: €0.40</p>
            <p style="margin: 2px 0 0 0; font-size: 10px; color: #6b7280;">Biletë e vetme</p>
          </div>
        `;
      } else if (isTaxiVehicle) {
        const taxiStatus = vehicle.taxi_status || 'available';
        const eta = vehicle.eta_minutes || Math.floor(Math.random() * 10) + 3;
        
        popupHTML += `
          <div style="margin: 10px 0; padding: 8px; background: #f3f4f6; border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <span style="font-size: 12px; color: #6b7280;">Statusi:</span>
              <span style="font-size: 12px; font-weight: bold; color: ${taxiStatus === 'available' ? '#10b981' : '#ef4444'}">
                ${getTaxiStatusIcon(taxiStatus)} ${getTaxiStatusText(taxiStatus)}
              </span>
            </div>
            ${taxiStatus === 'available' ? `
              <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <span style="font-size: 12px; color: #6b7280;">ETA:</span>
                <span style="font-size: 12px; font-weight: bold;">${eta} minuta</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="font-size: 12px; color: #6b7280;">Tarifa:</span>
                <span style="font-size: 12px; font-weight: bold;">€1.50 + €0.80/km</span>
              </div>
            ` : `
              <div style="text-align: center; margin-top: 5px;">
                <span style="font-size: 11px; color: #ef4444;">Jo i disponueshëm për momentin</span>
              </div>
            `}
          </div>
        `;
      } else if (isRideVehicle) {
        popupHTML += `
          <div style="margin: 10px 0; padding: 8px; background: #f3f4f6; border-radius: 8px;">
            <p style="margin: 0; font-size: 14px; font-weight: bold; color: #1f2937;">Çmimi: €0.05/min</p>
            <p style="margin: 2px 0 0 0; font-size: 10px; color: #6b7280;">Minimumi: €1.00</p>
          </div>
        `;
      }
      
      popupHTML += `
        <button id="${buttonAction === 'buy' ? `buy-ticket-${vehicle.id || vehicle.vehicle_id}` : buttonAction === 'order' ? `order-taxi-${vehicle.id || vehicle.vehicle_id}` : `start-ride-${vehicle.id || vehicle.vehicle_id}`}" style="
          background: ${buttonColor}; color: white; border: none; 
          padding: 10px 16px; border-radius: 8px; cursor: pointer;
          width: 100%; font-weight: 600; margin-top: 8px;
          font-size: 14px;
        ">${buttonText}</button>
      `;
      
      popupHTML += `</div>`;

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(popupHTML);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(map.current);

      popup.on("open", () => {
        let btnId;
        if (buttonAction === 'buy') {
          btnId = `buy-ticket-${vehicle.id || vehicle.vehicle_id}`;
        } else if (buttonAction === 'order') {
          btnId = `order-taxi-${vehicle.id || vehicle.vehicle_id}`;
        } else {
          btnId = `start-ride-${vehicle.id || vehicle.vehicle_id}`;
        }
        
        const btn = document.getElementById(btnId);
        if (btn) {
          btn.onclick = (e) => {
            e.stopPropagation();
            popup.remove();
            onVehicleClick(vehicle, buttonAction);
          };
        }
      });

      markers.current.push(marker);
    });
  }, [vehicles, isMapLoaded, selectedType, onVehicleClick]);

  useEffect(() => {
    if (map.current && center) {
      map.current.flyTo({
        center: [center.lng, center.lat],
        essential: true,
        duration: 1500,
      });
    }
  }, [center]);

  return (
    <div className="absolute inset-0 w-full h-full bg-gray-100">
      <div
        ref={mapContainer}
        className="w-full h-full"
        style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0 }}
      />
    </div>
  );
};

export default MapView;