"use client";

import { useState, useEffect, useRef, useId } from "react";
import { cn } from "@/lib/utils";

interface AutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  onFetchSuggestions: (query: string) => Promise<string[]>;
  placeholder?: string;
  className?: string;
  minChars?: number;
  required?: boolean;
}

export function AutocompleteInput({
  value,
  onChange,
  onFetchSuggestions,
  placeholder,
  className,
  minChars = 2,
  required = false,
}: AutocompleteInputProps) {
  const uniqueId = useId();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    if (showSuggestions) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showSuggestions]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (value.length >= minChars) {
        setLoading(true);
        try {
          const results = await onFetchSuggestions(value);
          console.log(
            `Autocomplete [${uniqueId}]: Fetched ${results.length} suggestions for "${value}"`,
            results
          );
          setSuggestions(results);
          if (results.length > 0) {
            setShowSuggestions(true);
          }
        } catch (error) {
          console.error(
            `Autocomplete [${uniqueId}]: Error fetching suggestions:`,
            error
          );
          setSuggestions([]);
          setShowSuggestions(false);
        } finally {
          setLoading(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [value, minChars, onFetchSuggestions, uniqueId]);

  const handleSelect = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <input
        id={uniqueId}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => {
          setIsFocused(true);
          if (suggestions.length > 0 && value.length >= minChars) {
            setShowSuggestions(true);
          }
        }}
        onBlur={() => {
          setIsFocused(false);
        }}
        onClick={(e) => {
          e.stopPropagation();
        }}
        placeholder={placeholder}
        className={cn("w-full px-3 py-2 border rounded-lg", className)}
        required={required}
      />

      {isFocused && showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={`${uniqueId}-${index}`}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault(); // Prevent input blur
                handleSelect(suggestion);
              }}
              className="w-full px-3 py-2 text-left hover:bg-gray-100 transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {loading && value.length >= minChars && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
}
