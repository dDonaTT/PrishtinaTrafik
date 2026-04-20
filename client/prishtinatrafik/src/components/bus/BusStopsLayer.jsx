import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";

const BusStopsLayer = ({ map, stops, onStopClick }) => {
  const markers = useRef([]);

  useEffect(() => {
    if (!map || !stops || stops.length === 0) return;

    console.log("Rendering bus stops:", stops.length);

    markers.current.forEach((marker) => marker.remove());
    markers.current = [];

    stops.forEach((stop) => {
      const lng = parseFloat(stop.longitude);
      const lat = parseFloat(stop.latitude);

      if (isNaN(lng) || isNaN(lat)) return;

      const el = document.createElement("div");
      el.className = "bus-stop-marker cursor-pointer";
      el.innerHTML = `
                <div style="
                    background: #3B82F6;
                    width: 28px; height: 28px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                    border: 2px solid white;
                    transition: transform 0.2s ease;
                " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
                    🚏
                </div>
            `;

      const routeNumbers = stop.route_numbers || "-";
      const routeBadges = routeNumbers
        .split(",")
        .slice(0, 5)
        .map(
          (r) =>
            `<span style="display: inline-block; background: #2563eb; color: white; font-size: 10px; padding: 2px 6px; border-radius: 12px; margin: 2px;">${r.trim()}</span>`,
        )
        .join("");

      const moreBadges =
        routeNumbers.split(",").length > 5
          ? `<span style="display: inline-block; background: #6b7280; color: white; font-size: 10px; padding: 2px 6px; border-radius: 12px; margin: 2px;">+${routeNumbers.split(",").length - 5}</span>`
          : "";

      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: true,
        closeOnClick: false,
      }).setHTML(`
                <div style="padding: 8px; text-align: center; min-width: 160px;">
                    <h4 style="margin: 0 0 5px 0; font-weight: bold; color: #1f2937; font-size: 14px;">${stop.name}</h4>
                    <div style="margin: 5px 0; display: flex; flex-wrap: wrap; gap: 4px; justify-content: center;">
                        ${routeBadges}
                        ${moreBadges}
                    </div>
                    <button 
                        id="view-routes-${stop.id}"
                        style="
                            background: #2563eb; 
                            color: white; 
                            border: none; 
                            padding: 6px 12px; 
                            border-radius: 6px; 
                            cursor: pointer;
                            font-size: 12px;
                            margin-top: 8px;
                            width: 100%;
                        "
                    >Shiko të gjitha linjat</button>
                </div>
            `);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(map);

      popup.on("open", () => {
        const btn = document.getElementById(`view-routes-${stop.id}`);
        if (btn) {
          btn.onclick = () => {
            popup.remove();
            onStopClick(stop);
          };
        }
      });

      markers.current.push(marker);
    });

    return () => {
      markers.current.forEach((marker) => marker.remove());
    };
  }, [map, stops, onStopClick]);

  return null;
};

export default BusStopsLayer;
