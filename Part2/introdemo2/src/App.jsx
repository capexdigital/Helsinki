import React, { useState, useEffect } from 'react';

// Component to display detailed information about a single country
const CountryDetails = ({ country }) => {
  return (
    <div>
      <h2>{country.name.common}</h2>
      <p>Capital: {country.capital?.[0]}</p>
      <p>Area: {country.area} sq km</p>
      <h3>Languages:</h3>
      <ul>
        {Object.values(country.languages || {}).map((lang, index) => (
          <li key={index}>{lang}</li>
        ))}
      </ul>
      {country.flags?.png && (
        <img src={country.flags.png} alt={country.flags.alt || `Flag of ${country.name.common}`} width="150" />
      )}
    </div>
  );
};

const App = () => {
  const [countries, setCountries] = useState([]);
  const [filter, setFilter] = useState('');
  const [filteredCountries, setFilteredCountries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all country data when the component mounts
  useEffect(() => {
    const apiUrl = 'https://studies.cs.helsinki.fi/restcountries/api/all';
    
    const fetchCountries = async () => {
      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setCountries(data);
      } catch (e) {
        setError(e.message);
        console.error('Failed to fetch countries:', e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCountries();
  }, []); // Empty dependency array means this effect runs only once

  // Filter countries whenever 'countries' or 'filter' state changes
  useEffect(() => {
    if (filter === '') {
      setFilteredCountries([]); // If filter is empty, show no countries
      return;
    }

    const lowerCaseFilter = filter.toLowerCase();

    const matches = countries.filter(country =>
      country.name.common.toLowerCase().includes(lowerCaseFilter)
    );
    setFilteredCountries(matches);
  }, [filter, countries]);

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  return (
    <div>
      <div>
        <h1>Find Countries</h1>
        
        <div>
          <label htmlFor="country-input">
            Search for a country:
          </label>
          <input
            id="country-input"
            value={filter}
            onChange={handleFilterChange}
            placeholder="Type country name..."
          />
        </div>

        {isLoading && <p>Loading countries...</p>}
        {error && <p>Error: {error}</p>}

        {!isLoading && !error && filter !== '' && (
          <div>
            {filteredCountries.length > 10 ? (
              // Prompt for more specific query if too many matches
              <p>
                Too many matches, please make your query more specific.
              </p>
            ) : filteredCountries.length > 1 ? (
              // List countries if 1 to 10 matches
              <ul>
                {filteredCountries.map(country => (
                  <li key={country.cca2}>
                    {country.name.common}
                  </li>
                ))}
              </ul>
            ) : filteredCountries.length === 1 ? (
              // Display single country information
              <CountryDetails country={filteredCountries[0]} />
            ) : (
              // No matches
              <p>
                No countries match your search.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
