'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, SlidersHorizontal, Sparkles, Loader2 } from 'lucide-react';

interface GreetingHeroProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onOpenFilters: () => void;
  onSubmit?: (query: string) => void; // CHAT MODE: Explicit submit handler
  userName?: string;
  isAIEnabled?: boolean;
  isSearching?: boolean;
}

export default function GreetingHero({
  searchQuery,
  onSearchChange,
  onOpenFilters,
  onSubmit,
  userName,
  isAIEnabled = false,
  isSearching = false,
}: GreetingHeroProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get current time for greeting
  const now = new Date();
  const currentHour = now.getHours();
  let greeting = 'GOOD EVENING';
  if (currentHour < 12) {
    greeting = 'GOOD MORNING';
  } else if (currentHour < 18) {
    greeting = 'GOOD AFTERNOON';
  }

  // Format date and time
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  const dateStr = now.toLocaleDateString('en-US', options);
  const timeStr = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  // Fetch AI suggestions as user types (lower threshold for AI chat mode)
  useEffect(() => {
    if (!isAIEnabled || !searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const fetchSuggestions = async () => {
      setLoadingSuggestions(true);
      try {
        const response = await fetch('/api/autocomplete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: searchQuery }),
        });
        const data = await response.json();
        
        if (data.suggestions && Array.isArray(data.suggestions)) {
          setSuggestions(data.suggestions.slice(0, 5));
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setLoadingSuggestions(false);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, isAIEnabled]);

  const handleSuggestionClick = (suggestion: string) => {
    onSearchChange(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="w-full pt-10 pb-6 relative" data-name="Greeting and Filters">
      <div className="max-w-[680px] mx-auto px-[24px] relative">
        {/* Greeting */}
        <div className="text-center mb-3">
          <h1 className="font-['Inter:Regular',sans-serif] text-[12px] text-[#6b7280] uppercase tracking-[2px] mb-1 font-medium">
            {greeting}{userName ? `, ${userName}` : ''}
          </h1>
          <span className="font-['Inter:Regular',sans-serif] text-[12px] text-[#6b7280]">
            Today is {dateStr}, {timeStr}
          </span>
        </div>

        {/* Search Bar with AI */}
        <div className="mt-8 mb-2">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999] z-10">
                {isSearching ? (
                  <Loader2 className="w-full h-full animate-spin" />
                ) : (
                  <Search className="w-full h-full" strokeWidth={1.5} />
                )}
              </div>
              {isAIEnabled && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10" title="AI Enhanced Search">
                  <Sparkles className="w-4 h-4 text-gray-500 dark:text-gray-400" strokeWidth={1.5} aria-label="AI Enhanced Search" />
                </div>
              )}
              <input
                ref={inputRef}
                placeholder={isAIEnabled ? "Ask me anything: 'romantic restaurant in Tokyo' or 'cozy cafe Paris'..." : "Search places..."}
                value={searchQuery}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  if (e.target.value.trim().length >= 2) {
                    setShowSuggestions(true);
                  } else {
                    setShowSuggestions(false);
                  }
                }}
                onKeyDown={(e) => {
                  handleKeyDown(e);
                  // CHAT MODE: Submit on Enter key (exactly like chat component)
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (onSubmit && searchQuery.trim()) {
                      onSubmit(searchQuery.trim());
                    }
                  }
                }}
                onFocus={() => {
                  if (suggestions.length > 0 && searchQuery.trim().length >= 2) {
                    setShowSuggestions(true);
                  }
                }}
                className={`h-12 w-full ${isAIEnabled ? 'pr-[44px]' : 'pr-[44px]'} pl-[44px] bg-gray-100 dark:bg-gray-800 border border-transparent rounded-2xl font-['Inter:Regular',sans-serif] text-[15px] text-black dark:text-white placeholder:text-[#9ca3af] text-center outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all`}
              />
              
              {/* AI Suggestions Dropdown */}
              {isAIEnabled && showSuggestions && (suggestions.length > 0 || loadingSuggestions) && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden z-50 max-h-[300px] overflow-y-auto">
                  {loadingSuggestions ? (
                    <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Getting suggestions...</span>
                    </div>
                  ) : (
                    <>
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0"
                        >
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-3 w-3 text-gray-400 flex-shrink-0" />
                            <span className="text-sm text-black dark:text-white">{suggestion}</span>
                          </div>
                        </button>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={onOpenFilters}
              className="flex items-center justify-center w-12 h-12 bg-black dark:bg-white text-white dark:text-black hover:opacity-90 rounded-2xl transition-opacity flex-shrink-0"
              aria-label="Open filters"
            >
              <SlidersHorizontal className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


