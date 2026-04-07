import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { buses } from "../vehicles/buses";
import { taxis } from "../vehicles/taxis";
import { bikes } from "../vehicles/bikes";
import { scooters } from "../vehicles/scooters";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export default function MapView({ active }) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [21.1655, 42.6629],
      zoom: 13,
    });

    mapRef.current = map;

    map.on("load", () => {
      let data = [];
      let color = "blue";

      if (active === "bus") {
        data = buses;
        color = "blue";
      } else if (active === "taxi") {
        data = taxis;
        color = "yellow";
      } else if (active === "bike") {
        data = bikes;
        color = "green";
      } else if (active === "scooter") {
        data = scooters;
        color = "purple";
      }

      data.forEach((item) => {
        new mapboxgl.Marker({ color })
          .setLngLat([item.lng, item.lat])
          .setPopup(new mapboxgl.Popup().setText(`${active.toUpperCase()} #${item.id}`))
          .addTo(map);
      });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [active]);

  return <div ref={mapContainer} className="w-full h-screen" />;
}