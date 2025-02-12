import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const redMarker = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Component to update map center dynamically
const UpdateMapCenter = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom(), { animate: true });
  }, [lat, lng, map]);

  return null;
};

const LeafletMap = ({ lat, lng }) => {
  return (
    <div
      style={{
        width: "220px",
        height: "220px",
        aspectRatio: "1 / 1",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          overflow: "hidden",
          position: "absolute",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
        }}
      >
        <MapContainer
          center={[lat, lng]}
          zoom={13}
          style={{ width: "100%", height: "100%" }}
          className="custom-leaflet-map"
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <UpdateMapCenter lat={lat} lng={lng} />
          <Marker position={[lat, lng]} icon={redMarker}>
            <Popup autoClose={false} closeOnClick={false}>
              Lat: {lat}, Lng: {lng}
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      <style>
        {`
          .custom-leaflet-map .leaflet-control-container .leaflet-top {
            top: 40px !important; /* Moves zoom buttons lower */
            z-index: 888;
          }
          .leaflet-container .leaflet-control-attribution{
            display: none;
          }
        `}
      </style>
    </div>
  );
};

export default LeafletMap;
