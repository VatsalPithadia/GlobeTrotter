import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix standard Leaflet default marker icon path issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Numbered Pin Icon Generator
function createCustomPin(number, cityName) {
  return L.divIcon({
    className: 'custom-map-pin',
    html: `
      <div style="
        background: linear-gradient(135deg, #6366f1, #a855f7);
        color: white;
        font-weight: bold;
        font-size: 11px;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.5);
      ">
        ${number}
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14]
  });
}

function AutoFitBounds({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (positions && positions.length > 0) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }
  }, [positions, map]);
  return null;
}

export default function MapViewer({ stops = [], height = '420px' }) {
  const validStops = stops.filter((s) => s.lat != null && s.lng != null);

  const positions = validStops.map((s) => [Number(s.lat), Number(s.lng)]);
  const center = positions.length > 0 ? positions[0] : [20, 0];
  const zoom = positions.length > 0 ? 5 : 2;

  return (
    <div style={{ height, width: '100%' }} className="rounded-2xl overflow-hidden shadow-2xl border border-slate-800 relative z-0">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {validStops.map((stop, index) => (
          <Marker
            key={stop.id || index}
            position={[Number(stop.lat), Number(stop.lng)]}
            icon={createCustomPin(index + 1, stop.city_name)}
          >
            <Popup>
              <div className="p-1 max-w-xs">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                  Stop #{index + 1}
                </span>
                <h4 className="font-bold text-base text-slate-100 mt-0.5">
                  {stop.city_name}, {stop.country}
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  📅 {stop.arrival_date} ➔ {stop.departure_date}
                </p>
                {stop.lodging_name && (
                  <p className="text-xs text-indigo-300 mt-1">
                    🏨 {stop.lodging_name}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {positions.length > 1 && (
          <Polyline
            positions={positions}
            pathOptions={{
              color: '#6366f1',
              weight: 3,
              opacity: 0.8,
              dashArray: '8, 8'
            }}
          />
        )}

        {positions.length > 0 && <AutoFitBounds positions={positions} />}
      </MapContainer>
    </div>
  );
}
