// src/Components/Pages/Others/Coverage.jsx
import React, { useState, useEffect } from 'react'; // Import useState and useEffect!
import { useLoaderData } from 'react-router';
import BangladeshMap from '../../Custom/BangladeshMap';

const Coverage = () => {
  const districtData = useLoaderData(); // All your wonderful district data

  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null); // To tell the map where to go!

  // --- Effect to generate suggestions ---
  useEffect(() => {
    if (searchTerm.length > 1 && districtData) {
      // Only suggest after a couple of characters
      const filtered = districtData.filter((district) =>
        district.district.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]); // Clear suggestions if search term is too short or empty
    }
  }, [searchTerm, districtData]); // Re-run when searchTerm or districtData changes

  // --- Handler for search input change ---
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setSelectedLocation(null); // Clear selected location when typing
  };

  // --- Handler for clicking a suggestion ---
  const handleSelectSuggestion = (district) => {
    setSearchTerm(district.district); // Set search box to the selected district name
    setSuggestions([]); // Clear suggestions
    // Set the location for the map to fly to!
    setSelectedLocation({
      latitude: district.latitude,
      longitude: district.longitude,
      zoom: 14, // Zoom in closer when a specific district is selected
    });
  };

  return (
    <div className="container mx-auto my-8 rounded-xl border border-blue-100 bg-white p-6 shadow-xl">
      <h1 className="mb-6 text-center text-4xl font-extrabold tracking-wide text-blue-700">
        🌐 Our Global Coverage!
      </h1>
      <p className="mb-10 text-center text-xl leading-relaxed text-gray-700">
        We're proud to showcase our operational footprint. Let's start with our
        vibrant presence in Bangladesh!
      </p>

      {/* --- Search Bar Section --- */}
      <div className="mb-8 text-center">
        <div className="form-control relative mx-auto w-full max-w-md">
          <input
            type="text"
            placeholder="Search district (e.g., Dhaka, Cumilla)..."
            className="input-bordered input w-full pr-16"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          {suggestions.length > 0 && searchTerm.length > 1 && (
            <ul className="menu absolute top-full z-10 mt-2 max-h-60 w-full overflow-y-auto rounded-box bg-base-100 shadow-lg">
              {suggestions.map((district, index) => (
                <li key={index}>
                  <a onClick={() => handleSelectSuggestion(district)}>
                    {district.district} ({district.region})
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-4 pt-4">
        <h2 className="mb-6 text-center text-3xl font-bold text-green-700">
          📍 Our Branches Across Bangladesh
        </h2>
        <p className="mb-8 text-center text-lg text-gray-600">
          Hover over or click on a marker to see details for each district!
        </p>
        {/* Pass the selectedLocation to the map component */}
        <BangladeshMap
          districtData={districtData}
          centerOverride={selectedLocation}
        />
      </div>
    </div>
  );
};

export default Coverage;
