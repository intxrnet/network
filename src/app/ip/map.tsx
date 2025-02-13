"use client";

import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

type MapProps = {
  latitude: number;
  longitude: number;
};

const Map = ({ latitude, longitude }: MapProps) => {
  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={13}
      scrollWheelZoom={false}
      style={{ height: "300px", width: "100%" }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <CircleMarker
        center={[latitude, longitude]}
        radius={8}
        pathOptions={{
          color: "rgb(59, 130, 246)", // blue-500
          fillColor: "rgb(219, 234, 254)", // blue-100
          fillOpacity: 0.7,
        }}
      >
        <Popup>Your location</Popup>
      </CircleMarker>
    </MapContainer>
  );
};

export default Map;
