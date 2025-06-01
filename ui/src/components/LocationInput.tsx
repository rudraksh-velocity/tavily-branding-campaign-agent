import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin, Loader2, Globe } from 'lucide-react';

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

  const searchLocations = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&extratags=1&namedetails=1&countrycodes=&featuretype=city,town,village`
      );
      
      if (response.ok) {
        const data: LocationSuggestion[] = await response.json();
        const filteredData = data.filter(item => 
          item.display_name && (
            item.display_name.includes('city') || 
            item.display_name.includes('town') || 
            item.display_name.includes('village') ||
            item.display_name.includes(',')
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

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    onChange(inputValue);

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      searchLocations(inputValue);
    }, 300);
  }, [onChange, searchLocations]);

  const handleSuggestionClick = useCallback((suggestion: LocationSuggestion) => {
    const parts = suggestion.display_name.split(',');
    let formattedName = suggestion.display_name;
    
    if (parts.length >= 2) {
      const city = parts[0].trim();
      const country = parts[parts.length - 1].trim();
      formattedName = `${city}, ${country}`;
    }
    
    onChange(formattedName);
    setShowSuggestions(false);
    setSuggestions([]);
    setSelectedIndex(-1);
  }, [onChange]);

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

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

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
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-2xl blur-sm"></div>
      
      <div className="relative">
        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-400 transition-all duration-200 group-hover:text-indigo-300 z-10" strokeWidth={2} />
        
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
          className={`${className} relative bg-slate-800/50 border-2 border-slate-600 focus:border-indigo-400 hover:border-slate-500 rounded-2xl transition-all duration-300 placeholder:text-slate-400`}
          placeholder="City, Country"
          autoComplete="off"
        />

        {isLoading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
            <Loader2 className="animate-spin h-5 w-5 text-indigo-400" />
          </div>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div 
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-3 bg-slate-800/95 backdrop-blur-xl border-2 border-slate-600 rounded-2xl shadow-2xl z-50 max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.place_id}
              className={`px-4 py-3 cursor-pointer transition-all duration-200 border-b border-slate-700 last:border-b-0 ${
                index === selectedIndex 
                  ? 'bg-indigo-500/20 border-indigo-400' 
                  : 'hover:bg-slate-700/50'
              }`}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-200">
                    {formatSuggestionText(suggestion.display_name)}
                  </div>
                </div>
                <Globe className="h-4 w-4 text-slate-400 ml-2" strokeWidth={2} />
              </div>
            </div>
          ))}
        </div>
      )}

      {showSuggestions && !isLoading && suggestions.length === 0 && value.length >= 2 && (
        <div 
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-3 bg-slate-800/95 backdrop-blur-xl border-2 border-slate-600 rounded-2xl shadow-2xl z-50 p-4"
        >
          <div className="text-sm text-slate-400 text-center">
            No locations found for "{value}"
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationInput; 