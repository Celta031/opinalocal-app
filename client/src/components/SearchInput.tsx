import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string | number;
  name: string;
  subtitle?: string;
  image?: string;
}

interface SearchInputProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  results: SearchResult[];
  onSelect: (result: SearchResult) => void;
  loading?: boolean;
  value?: string;
  className?: string;
}

export const SearchInput = ({
  placeholder = "Search...",
  onSearch,
  results,
  onSelect,
  loading = false,
  value = "",
  className,
}: SearchInputProps) => {
  const [query, setQuery] = useState(value);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.length > 0) {
        onSearch(query);
        setShowResults(true);
      } else {
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, onSearch]);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleSelect(results[selectedIndex]);
        }
        break;
      case "Escape":
        setShowResults(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSelect = (result: SearchResult) => {
    setQuery(result.name);
    setShowResults(false);
    setSelectedIndex(-1);
    onSelect(result);
  };

  const clearSearch = () => {
    setQuery("");
    setShowResults(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-10 pr-8"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {showResults && (
        <div
          ref={resultsRef}
          className="absolute top-full left-0 right-0 bg-white rounded-lg shadow-lg mt-2 max-h-60 overflow-y-auto border border-gray-200 z-50"
        >
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mx-auto"></div>
            </div>
          ) : results.length > 0 ? (
            results.map((result, index) => (
              <button
                key={result.id}
                onClick={() => handleSelect(result)}
                className={cn(
                  "w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors",
                  index === selectedIndex && "bg-gray-50"
                )}
              >
                <div className="flex items-center space-x-3">
                  {result.image && (
                    <img
                      src={result.image}
                      alt={result.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{result.name}</h4>
                    {result.subtitle && (
                      <p className="text-sm text-gray-600">{result.subtitle}</p>
                    )}
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">
              No results found
            </div>
          )}
        </div>
      )}
    </div>
  );
};
