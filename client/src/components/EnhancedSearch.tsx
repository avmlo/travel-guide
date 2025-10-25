import { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, MapPin, Star } from 'lucide-react';
import { useDestinationSearch } from '@/hooks/useDestinationSearch';
import { useNavigate } from 'react-router-dom';

interface EnhancedSearchProps {
  onClose?: () => void;
}

export function EnhancedSearch({ onClose }: EnhancedSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const { data: results, isLoading } = useDestinationSearch(query);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Keyboard shortcut (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        setQuery('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectDestination = (slug: string) => {
    navigate(`/destinations/${slug}`);
    setIsOpen(false);
    setQuery('');
    onClose?.();
  };

  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors w-full max-w-md"
      >
        <Search className="h-4 w-4 text-gray-500" />
        <span className="text-sm text-gray-500">Search destinations...</span>
        <kbd className="ml-auto px-2 py-1 text-xs bg-white dark:bg-gray-900 rounded border border-gray-300 dark:border-gray-600">
          ⌘K
        </kbd>
      </button>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={() => setIsOpen(false)}
      />

      {/* Search Modal */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 px-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-800">
            <Search className="h-5 w-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search destinations, cities, categories..."
              className="flex-1 bg-transparent outline-none text-base"
            />
            {query && (
              <button
                onClick={handleClear}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            {isLoading && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
          </div>

          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto">
            {query.length < 2 && (
              <div className="px-4 py-8 text-center text-gray-500">
                <Search className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Type at least 2 characters to search</p>
                <p className="text-xs mt-2 opacity-60">
                  Try: "coffee tokyo", "michelin star", "museum"
                </p>
              </div>
            )}

            {query.length >= 2 && results && results.length === 0 && !isLoading && (
              <div className="px-4 py-8 text-center text-gray-500">
                <Search className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No results found for "{query}"</p>
                <p className="text-xs mt-2 opacity-60">
                  Try different keywords or check spelling
                </p>
              </div>
            )}

            {results && results.length > 0 && (
              <div className="py-2">
                {results.map((result) => (
                  <button
                    key={result.slug}
                    onClick={() => handleSelectDestination(result.slug)}
                    className="w-full flex items-center gap-4 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                  >
                    {/* Image */}
                    <img
                      src={result.main_image}
                      alt={result.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium truncate">{result.name}</h3>
                        {result.crown && (
                          <span className="text-yellow-500">👑</span>
                        )}
                        {result.michelin_stars > 0 && (
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: result.michelin_stars }).map((_, i) => (
                              <Star key={i} className="h-3 w-3 fill-red-500 text-red-500" />
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        <MapPin className="h-3 w-3" />
                        <span>{result.city}</span>
                        <span>•</span>
                        <span>{result.category}</span>
                        {result.brand && (
                          <>
                            <span>•</span>
                            <span>{result.brand}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Relevance indicator */}
                    <div className="text-xs text-gray-400">
                      {(result.rank * 100).toFixed(0)}% match
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <span>↑↓ Navigate</span>
              <span>↵ Select</span>
              <span>ESC Close</span>
            </div>
            <div>
              {results && results.length > 0 && (
                <span>{results.length} results</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

