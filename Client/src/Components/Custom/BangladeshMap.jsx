// src/Custom/BangladeshMap.jsx
import React, { useEffect, useRef } from 'react'; // Import useEffect and useRef!
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'; // Import useMap!
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// --- FIXING THE DEFAULT MARKER ICON ISSUE ---
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});
// --- END OF MARKER FIX ---

// Helper function to calculate the map's initial center
const getCenterOfBangladesh = (data) => {
  if (!data || data.length === 0) return [23.685, 90.3563]; // Default to general Bangladesh center
  let latSum = 0;
  let lonSum = 0;
  data.forEach((d) => {
    latSum += d.latitude;
    lonSum += d.longitude;
  });
  return [latSum / data.length, lonSum / data.length];
};

const INITIAL_MAP_ZOOM = 7; // Default zoom for the whole country

// Component that handles map centering logic
function MapMover({ centerOverride }) {
  const map = useMap(); // Get access to the Leaflet map instance

  useEffect(() => {
    if (centerOverride) {
      // Use map.flyTo for a smooth animation to the new location and zoom
      map.flyTo(
        [centerOverride.latitude, centerOverride.longitude],
        centerOverride.zoom,
        {
          duration: 1.5, // Animation duration in seconds
        },
      );
    }
  }, [centerOverride, map]); // Re-run effect when centerOverride changes

  return null; // This component doesn't render anything visually
}

// BangladeshMap component accepts 'districtData' and 'centerOverride' props
const BangladeshMap = ({ districtData, centerOverride }) => {
  // If no data, show a fallback message
  if (!districtData || districtData.length === 0) {
    return (
      <div className="p-8 text-center text-gray-600">
        <p className="text-xl">
          Loading map data, darling... or no branches found! 🥺
        </p>
      </div>
    );
  }

  // Calculate the map's initial center (when centerOverride is null)
  const initialMapCenter = getCenterOfBangladesh(districtData);

  return (
    <div className="map-container-wrapper overflow-hidden rounded-lg border border-gray-200 shadow-lg">
      <MapContainer
        // Use the overridden center if available, otherwise the initial calculated center
        center={
          centerOverride
            ? [centerOverride.latitude, centerOverride.longitude]
            : initialMapCenter
        }
        zoom={centerOverride ? centerOverride.zoom : INITIAL_MAP_ZOOM} // Use overridden zoom if available
        scrollWheelZoom={true}
        style={{ height: '70vh', width: '100%' }}
        className="rounded-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* This component will handle map movement based on search selection */}
        <MapMover centerOverride={centerOverride} />

        {/* Dynamically render a Marker for each district */}
        {districtData.map((district, index) => (
          <Marker
            key={`${district.district}-${index}`}
            position={[district.latitude, district.longitude]}
          >
            <Popup>
              <div className="font-sans text-sm">
                <h3 className="mb-1 text-lg font-bold text-blue-700">
                  {district.district} District
                </h3>
                <p className="mb-1 text-gray-800">
                  **City:** {district.city} <br />
                  **Region:** {district.region} <br />
                  **Status:**{' '}
                  <span
                    className={`font-semibold ${district.status === 'active' ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {district.status.toUpperCase()}
                  </span>
                </p>
                {district.covered_area && district.covered_area.length > 0 && (
                  <p className="mt-2 text-gray-700">
                    **Covered Areas:** {district.covered_area.join(', ')}
                  </p>
                )}
                {district.flowchart && (
                  <a
                    href={district.flowchart}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-purple-600 hover:underline"
                  >
                    View Flowchart ↗️
                  </a>
                )}
                <p className="mt-2 text-xs text-gray-500">
                  Lat: {district.latitude.toFixed(4)}, Lon:{' '}
                  {district.longitude.toFixed(4)}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default BangladeshMap;
