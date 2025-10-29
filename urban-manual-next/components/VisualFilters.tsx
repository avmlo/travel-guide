'use client';

import { useState, useEffect } from 'react';
import { Destination } from '@/types/destination';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface VisualFiltersProps {
  destinations: Destination[];
  onFilterChange: (filtered: Destination[]) => void;
}

const VIBES = [
  { id: 'all', label: 'All' },
  { id: 'elegant', label: 'Elegant' },
  { id: 'cozy', label: 'Cozy' },
  { id: 'modern', label: 'Modern' },
  { id: 'rustic', label: 'Rustic' },
  { id: 'vibrant', label: 'Vibrant' },
  { id: 'minimalist', label: 'Minimalist' },
  { id: 'luxurious', label: 'Luxurious' },
  { id: 'bohemian', label: 'Bohemian' },
];

const COLOR_PALETTES = [
  { id: 'all', label: 'All' },
  { id: 'warm', label: 'Warm' },
  { id: 'cool', label: 'Cool' },
  { id: 'earth', label: 'Earth Tones' },
  { id: 'monochrome', label: 'Monochrome' },
  { id: 'pastel', label: 'Pastel' },
];

export function VisualFilters({ destinations, onFilterChange }: VisualFiltersProps) {
  const [selectedVibe, setSelectedVibe] = useState('all');
  const [selectedColor, setSelectedColor] = useState('all');
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    let filtered = [...destinations];

    // Filter by vibe (based on tags or description keywords)
    if (selectedVibe !== 'all') {
      filtered = filtered.filter(d => {
        const searchText = `${d.description} ${d.subline} ${d.tags?.join(' ')}`.toLowerCase();
        return searchText.includes(selectedVibe.toLowerCase());
      });
    }

    // Filter by color palette
    if (selectedColor !== 'all') {
      filtered = filtered.filter(d => {
        const searchText = `${d.description} ${d.subline} ${d.tags?.join(' ')}`.toLowerCase();
        switch (selectedColor) {
          case 'warm':
            return searchText.match(/warm|red|orange|yellow|cozy|sunset/);
          case 'cool':
            return searchText.match(/cool|blue|green|ocean|sea|fresh/);
          case 'earth':
            return searchText.match(/earth|brown|natural|wood|rustic/);
          case 'monochrome':
            return searchText.match(/minimal|black|white|modern|clean/);
          case 'pastel':
            return searchText.match(/pastel|soft|light|delicate|pink/);
          default:
            return true;
        }
      });
    }

    onFilterChange(filtered);
  }, [selectedVibe, selectedColor, destinations, onFilterChange]);

  const hasActiveFilters = selectedVibe !== 'all' || selectedColor !== 'all';

  const clearFilters = () => {
    setSelectedVibe('all');
    setSelectedColor('all');
  };

  return (
    <div className="border-b border-gray-200 dark:border-gray-800">
      <div className="px-6 md:px-10 py-6 max-w-[1920px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
            Visual Explorer
          </h2>
          
          <div className="flex items-center gap-4">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
              >
                Clear Filters
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 text-xs font-medium text-gray-900 dark:text-white hover:opacity-60 transition-opacity"
            >
              <span>{isExpanded ? 'Less' : 'More'} Filters</span>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Expanded Filters */}
        {isExpanded && (
          <div className="space-y-6 animate-in slide-in-from-top-2 duration-200">
            {/* Vibe Filter */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-3">
                Vibe
              </h3>
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
                {VIBES.map(vibe => (
                  <button
                    key={vibe.id}
                    onClick={() => setSelectedVibe(vibe.id)}
                    className={`font-medium transition-all duration-200 ${
                      selectedVibe === vibe.id
                        ? 'text-black dark:text-white scale-105'
                        : 'text-black/30 dark:text-gray-500 hover:text-black/60 dark:hover:text-gray-300'
                    }`}
                  >
                    {vibe.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Palette Filter */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-3">
                Color Palette
              </h3>
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
                {COLOR_PALETTES.map(palette => (
                  <button
                    key={palette.id}
                    onClick={() => setSelectedColor(palette.id)}
                    className={`font-medium transition-all duration-200 ${
                      selectedColor === palette.id
                        ? 'text-black dark:text-white scale-105'
                        : 'text-black/30 dark:text-gray-500 hover:text-black/60 dark:hover:text-gray-300'
                    }`}
                  >
                    {palette.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

