import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin } from 'lucide-react';

interface LocationInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

interface LocationSuggestion {
  display_name: string;
  lat: string;
  lon: string;
  place_id: number;
}

const LocationInput: React.FC<LocationInputProps> = ({ value, onChange, className }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Debounced search function
  const searchLocations = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    
    try {
      // Using Nominatim (OpenStreetMap's geocoding service) - free and no API key required
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&extratags=1&namedetails=1&countrycodes=&featuretype=city,town,village`
      );
      
      if (response.ok) {
        const data: LocationSuggestion[] = await response.json();
        // Filter for cities/towns/villages and format the results
        const filteredData = data.filter(item => 
          item.display_name && (
            item.display_name.includes('city') || 
            item.display_name.includes('town') || 
            item.display_name.includes('village') ||
            item.display_name.includes(',') // Usually indicates city, state/country format
          )
        );
        setSuggestions(filteredData);
        setShowSuggestions(filteredData.length > 0);
        setSelectedIndex(-1);
      }
    } catch (error) {
      console.error('Error fetching location suggestions:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle input changes with debouncing
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    onChange(inputValue);

    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set new timeout for debounced search
    debounceTimeoutRef.current = setTimeout(() => {
      searchLocations(inputValue);
    }, 300);
  }, [onChange, searchLocations]);

  // Handle suggestion selection
  const handleSuggestionClick = useCallback((suggestion: LocationSuggestion) => {
    // Format the display name to show just city, country/state
    const parts = suggestion.display_name.split(',');
    let formattedName = suggestion.display_name;
    
    if (parts.length >= 2) {
      // Try to get city and country/state
      const city = parts[0].trim();
      const country = parts[parts.length - 1].trim();
      formattedName = `${city}, ${country}`;
    }
    
    onChange(formattedName);
    setShowSuggestions(false);
    setSuggestions([]);
    setSelectedIndex(-1);
  }, [onChange]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSuggestions([]);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  }, [showSuggestions, suggestions, selectedIndex, handleSuggestionClick]);

  // Handle clicks outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current && 
        !inputRef.current.contains(event.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setSuggestions([]);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Clear suggestions when component unmounts
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Format suggestion display text
  const formatSuggestionText = (displayName: string) => {
    const parts = displayName.split(',');
    if (parts.length >= 2) {
      const city = parts[0].trim();
      const region = parts[1]?.trim();
      const country = parts[parts.length - 1]?.trim();
      
      if (parts.length === 2) {
        return `${city}, ${country}`;
      } else if (parts.length > 2) {
        return `${city}, ${region}, ${country}`;
      }
    }
    return displayName;
  };

  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-gray-50/0 via-gray-100/50 to-gray-50/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg"></div>
      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 stroke-[#468BFF] transition-all duration-200 group-hover:stroke-[#8FBCFA] z-10" strokeWidth={1.5} />
      
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (suggestions.length > 0) {
            setShowSuggestions(true);
          }
        }}
        className={`${className} !font-['DM_Sans']`}
        placeholder="City, Country"
        autoComplete="off"
      />

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#468BFF] border-t-transparent"></div>
        </div>
      )}

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div 
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto"
          style={{
            fontFamily: 'DM Sans, sans-serif'
          }}
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.place_id}
              className={`px-4 py-3 cursor-pointer transition-all duration-200 border-b border-gray-100 last:border-b-0 ${
                index === selectedIndex 
                  ? 'bg-blue-50 border-blue-100' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">
                    {formatSuggestionText(suggestion.display_name)}
                  </div>
                </div>
                <MapPin className="h-4 w-4 text-gray-400 ml-2" strokeWidth={1.5} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No results message */}
      {showSuggestions && !isLoading && suggestions.length === 0 && value.length >= 2 && (
        <div 
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 p-4"
        >
          <div className="text-sm text-gray-500 text-center">
            No locations found for "{value}"
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationInput; 