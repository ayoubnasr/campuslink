import { useState, useEffect } from 'react';
import { request_location_from_nominatim } from './locationSearch_requests';
import { formInputStyle } from '../ProfileEditorForm/ProfileEditorFormStyle';

const LocationSearchBar = ({setEventLocation_displayName, setEventLocation_latitude, setEventLocation_longitude}) => {
  const [locationSearchInput, setLocationSearchInput] = useState('');

  const [locationSearchResults, setLocationSearchResults] = useState([]);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const delaySearch = setTimeout(async () => {
      
      /*if (locationSearchInput.trim() === "") {
        setLocationSearchResults([]);
        return;
      }*/

      const location_results = await request_location_from_nominatim(locationSearchInput);

      if (!location_results.success) {
        console.log("Error while requesting location from Nominatim API.");
      } 
      else {
        setLocationSearchResults(location_results.data);
      }
    }, 300); // Debounce: Wait 300ms before sending request

    return () => clearTimeout(delaySearch); // Cleanup function to prevent unnecessary calls
  }, [locationSearchInput]);

  // Optional: hide results when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.location-search-container')) {
        setIsFocused(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="location-search-container" style={{ width: '100%', position: 'relative' }}>
      <input
        type="text"
        placeholder="Search for a location"
        value={locationSearchInput}
        onChange={(e) => setLocationSearchInput(e.target.value)}
        onFocus={() => setIsFocused(true)}
        style={{
          ...formInputStyle,
          zIndex: 1,
          position: 'relative'
        }}
      />

      {isFocused && locationSearchResults.length > 0 && (
        <ul
          style={{
            position: 'relative',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: '#fff',
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            marginTop: '8px',
            padding: '8px 0',
            maxHeight: '300px',
            overflowY: 'auto',
            zIndex: 10
          }}
        >
          {locationSearchResults.map((location, index) => (
            <li
              key={index}
              onClick={() => {
                setLocationSearchInput(location.display_name);
                setEventLocation_displayName(location.display_name);
                setEventLocation_latitude(location.lat);
                setEventLocation_longitude(location.lon);
                setIsFocused(false);
              }}
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
                fontSize: '14px',
                color: '#333'
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = '#f1f1f1')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = 'transparent')
              }
            >
              📍 {location.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};


export default LocationSearchBar;
